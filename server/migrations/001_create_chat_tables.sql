-- Migration: 001_create_chat_tables
-- Description: Create tables for real-time peer support chat system
-- Date: 2025-10-19
-- Author: MindBridge Team

-- =====================================================
-- Table 1: chat_rooms
-- Purpose: Links students to peer supporters for chat sessions
-- =====================================================

CREATE TABLE IF NOT EXISTS chat_rooms (
  id SERIAL PRIMARY KEY,
  student_id INTEGER NOT NULL,
  peer_support_id INTEGER,
  status VARCHAR(20) DEFAULT 'waiting',
  is_anonymous BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  closed_at TIMESTAMP,

  -- Foreign keys to users table
  CONSTRAINT fk_student
    FOREIGN KEY (student_id)
    REFERENCES users(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_peer_support
    FOREIGN KEY (peer_support_id)
    REFERENCES users(id)
    ON DELETE SET NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_chat_rooms_student ON chat_rooms(student_id);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_peer ON chat_rooms(peer_support_id);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_status ON chat_rooms(status);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_created ON chat_rooms(created_at DESC);

-- Add comments for documentation
COMMENT ON TABLE chat_rooms IS 'Manages peer support chat sessions between students and peer supporters';
COMMENT ON COLUMN chat_rooms.student_id IS 'References users.id where user_type = student';
COMMENT ON COLUMN chat_rooms.peer_support_id IS 'References users.id where user_type = peer_support';
COMMENT ON COLUMN chat_rooms.status IS 'Chat status: waiting, active, or closed';
COMMENT ON COLUMN chat_rooms.is_anonymous IS 'If true, student identity is hidden from peer supporter';

-- =====================================================
-- Table 2: chat_messages
-- Purpose: Stores all chat messages for each room
-- =====================================================

CREATE TABLE IF NOT EXISTS chat_messages (
  id SERIAL PRIMARY KEY,
  chat_room_id INTEGER NOT NULL,
  sender_id INTEGER NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  read_at TIMESTAMP,

  -- Foreign keys
  CONSTRAINT fk_chat_room
    FOREIGN KEY (chat_room_id)
    REFERENCES chat_rooms(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_sender
    FOREIGN KEY (sender_id)
    REFERENCES users(id)
    ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_messages_room ON chat_messages(chat_room_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON chat_messages(created_at DESC);

-- Add comments for documentation
COMMENT ON TABLE chat_messages IS 'Stores all messages sent in peer support chat rooms';
COMMENT ON COLUMN chat_messages.chat_room_id IS 'References chat_rooms.id';
COMMENT ON COLUMN chat_messages.sender_id IS 'References users.id (can be student or peer supporter)';
COMMENT ON COLUMN chat_messages.read_at IS 'Timestamp when message was read by recipient';

-- =====================================================
-- Table 3: peer_support_availability
-- Purpose: Tracks online status and capacity of peer supporters
-- =====================================================

CREATE TABLE IF NOT EXISTS peer_support_availability (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL UNIQUE,
  is_online BOOLEAN DEFAULT false,
  last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  socket_id VARCHAR(255),
  max_concurrent_chats INTEGER DEFAULT 3,
  current_active_chats INTEGER DEFAULT 0,

  -- Foreign key
  CONSTRAINT fk_peer_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_availability_online ON peer_support_availability(is_online, current_active_chats);
CREATE INDEX IF NOT EXISTS idx_availability_user ON peer_support_availability(user_id);

-- Add comments for documentation
COMMENT ON TABLE peer_support_availability IS 'Tracks availability and capacity of peer supporters';
COMMENT ON COLUMN peer_support_availability.user_id IS 'References users.id where user_type = peer_support';
COMMENT ON COLUMN peer_support_availability.is_online IS 'True when peer supporter is connected via Socket.io';
COMMENT ON COLUMN peer_support_availability.socket_id IS 'Current Socket.io connection ID';
COMMENT ON COLUMN peer_support_availability.max_concurrent_chats IS 'Maximum number of simultaneous chats allowed';
COMMENT ON COLUMN peer_support_availability.current_active_chats IS 'Number of currently active chat rooms';

-- =====================================================
-- Create a function to automatically update updated_at
-- =====================================================

CREATE OR REPLACE FUNCTION update_chat_room_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for chat_rooms
DROP TRIGGER IF EXISTS trigger_update_chat_room_timestamp ON chat_rooms;
CREATE TRIGGER trigger_update_chat_room_timestamp
  BEFORE UPDATE ON chat_rooms
  FOR EACH ROW
  EXECUTE FUNCTION update_chat_room_timestamp();

-- =====================================================
-- Insert default availability records for existing peer supporters
-- =====================================================

INSERT INTO peer_support_availability (user_id, is_online, max_concurrent_chats, current_active_chats)
SELECT id, false, 3, 0
FROM users
WHERE user_type = 'peer_supporter'
  AND is_active = true
ON CONFLICT (user_id) DO NOTHING;

-- =====================================================
-- Migration Complete
-- =====================================================

-- Print success message
DO $$
BEGIN
  RAISE NOTICE 'Migration 001_create_chat_tables completed successfully!';
  RAISE NOTICE '✓ Created chat_rooms table';
  RAISE NOTICE '✓ Created chat_messages table';
  RAISE NOTICE '✓ Created peer_support_availability table';
  RAISE NOTICE '✓ Created indexes for performance';
  RAISE NOTICE '✓ Added automatic timestamp updates';
  RAISE NOTICE '✓ Initialized peer supporter availability records';
END $$;
