// Chat Service - Database operations for peer support chat system
const pool = require('../db');

/**
 * Find an available peer supporter for matching
 * Returns the peer supporter with the least active chats
 */
async function findAvailablePeerSupporter() {
  try {
    const result = await pool.query(`
      SELECT u.id, u.first_name, u.last_name, u.email,
             psa.current_active_chats, psa.max_concurrent_chats
      FROM users u
      JOIN peer_support_availability psa ON u.id = psa.user_id
      WHERE u.user_type = 'peer_supporter'
        AND u.is_active = true
        AND psa.is_online = true
        AND psa.current_active_chats < psa.max_concurrent_chats
      ORDER BY psa.current_active_chats ASC, RANDOM()
      LIMIT 1
    `);

    return result.rows.length > 0 ? result.rows[0] : null;
  } catch (error) {
    console.error('Error finding available peer supporter:', error);
    throw error;
  }
}

/**
 * Create a new chat room
 */
async function createChatRoom(studentId, peerSupportId = null, isAnonymous = true) {
  try {
    const result = await pool.query(`
      INSERT INTO chat_rooms (student_id, peer_support_id, status, is_anonymous)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [studentId, peerSupportId, peerSupportId ? 'active' : 'waiting', isAnonymous]);

    // Update peer supporter's active chat count if assigned
    if (peerSupportId) {
      await pool.query(`
        UPDATE peer_support_availability
        SET current_active_chats = current_active_chats + 1
        WHERE user_id = $1
      `, [peerSupportId]);
    }

    return result.rows[0];
  } catch (error) {
    console.error('Error creating chat room:', error);
    throw error;
  }
}

/**
 * Get active chat room for a user
 */
async function getActiveChatRoom(userId) {
  try {
    const result = await pool.query(`
      SELECT cr.*,
             s.first_name as student_first_name, s.last_name as student_last_name, s.email as student_email,
             p.first_name as peer_first_name, p.last_name as peer_last_name, p.email as peer_email
      FROM chat_rooms cr
      LEFT JOIN users s ON cr.student_id = s.id
      LEFT JOIN users p ON cr.peer_support_id = p.id
      WHERE (cr.student_id = $1 OR cr.peer_support_id = $1)
        AND cr.status IN ('waiting', 'active')
      ORDER BY cr.created_at DESC
      LIMIT 1
    `, [userId]);

    return result.rows.length > 0 ? result.rows[0] : null;
  } catch (error) {
    console.error('Error getting active chat room:', error);
    throw error;
  }
}

/**
 * Save a chat message to the database
 */
async function saveMessage(chatRoomId, senderId, message) {
  try {
    const result = await pool.query(`
      INSERT INTO chat_messages (chat_room_id, sender_id, message)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [chatRoomId, senderId, message]);

    // Update chat room's updated_at timestamp
    await pool.query(`
      UPDATE chat_rooms
      SET updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `, [chatRoomId]);

    return result.rows[0];
  } catch (error) {
    console.error('Error saving message:', error);
    throw error;
  }
}

/**
 * Get chat history for a room
 */
async function getChatHistory(chatRoomId, limit = 50) {
  try {
    const result = await pool.query(`
      SELECT cm.*, u.first_name, u.last_name, u.user_type
      FROM chat_messages cm
      JOIN users u ON cm.sender_id = u.id
      WHERE cm.chat_room_id = $1
      ORDER BY cm.created_at ASC
      LIMIT $2
    `, [chatRoomId, limit]);

    return result.rows;
  } catch (error) {
    console.error('Error getting chat history:', error);
    throw error;
  }
}

/**
 * Mark messages as read
 */
async function markMessagesAsRead(chatRoomId, userId) {
  try {
    await pool.query(`
      UPDATE chat_messages
      SET read_at = CURRENT_TIMESTAMP
      WHERE chat_room_id = $1
        AND sender_id != $2
        AND read_at IS NULL
    `, [chatRoomId, userId]);
  } catch (error) {
    console.error('Error marking messages as read:', error);
    throw error;
  }
}

/**
 * Close a chat room
 */
async function closeChatRoom(chatRoomId) {
  try {
    // Get the peer supporter ID before closing
    const roomResult = await pool.query(`
      SELECT peer_support_id FROM chat_rooms WHERE id = $1
    `, [chatRoomId]);

    const peerSupportId = roomResult.rows[0]?.peer_support_id;

    // Close the room
    await pool.query(`
      UPDATE chat_rooms
      SET status = 'closed', closed_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `, [chatRoomId]);

    // Decrease peer supporter's active chat count
    if (peerSupportId) {
      await pool.query(`
        UPDATE peer_support_availability
        SET current_active_chats = GREATEST(current_active_chats - 1, 0)
        WHERE user_id = $1
      `, [peerSupportId]);
    }

    return true;
  } catch (error) {
    console.error('Error closing chat room:', error);
    throw error;
  }
}

/**
 * Update peer supporter online status
 */
async function updatePeerSupporterStatus(userId, isOnline, socketId = null) {
  try {
    await pool.query(`
      INSERT INTO peer_support_availability (user_id, is_online, socket_id, last_seen)
      VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
      ON CONFLICT (user_id)
      DO UPDATE SET
        is_online = $2,
        socket_id = $3,
        last_seen = CURRENT_TIMESTAMP
    `, [userId, isOnline, socketId]);

    return true;
  } catch (error) {
    console.error('Error updating peer supporter status:', error);
    throw error;
  }
}

/**
 * Get user by socket ID
 */
async function getUserBySocketId(socketId) {
  try {
    const result = await pool.query(`
      SELECT u.*
      FROM users u
      JOIN peer_support_availability psa ON u.id = psa.user_id
      WHERE psa.socket_id = $1
    `, [socketId]);

    return result.rows.length > 0 ? result.rows[0] : null;
  } catch (error) {
    console.error('Error getting user by socket ID:', error);
    throw error;
  }
}

/**
 * Assign peer supporter to waiting chat room
 */
async function assignPeerSupporter(chatRoomId, peerSupportId) {
  try {
    await pool.query(`
      UPDATE chat_rooms
      SET peer_support_id = $2, status = 'active'
      WHERE id = $1
    `, [chatRoomId, peerSupportId]);

    // Increment peer supporter's active chats
    await pool.query(`
      UPDATE peer_support_availability
      SET current_active_chats = current_active_chats + 1
      WHERE user_id = $1
    `, [peerSupportId]);

    return true;
  } catch (error) {
    console.error('Error assigning peer supporter:', error);
    throw error;
  }
}

module.exports = {
  findAvailablePeerSupporter,
  createChatRoom,
  getActiveChatRoom,
  saveMessage,
  getChatHistory,
  markMessagesAsRead,
  closeChatRoom,
  updatePeerSupporterStatus,
  getUserBySocketId,
  assignPeerSupporter
};
