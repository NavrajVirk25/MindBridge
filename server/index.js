// Import required packages
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

// Create Express application
const app = express();

// Set port from environment variable or default to 5000
const PORT = process.env.PORT || 5000;

// Apply middleware
app.use(helmet()); // Add security headers
app.use(cors()); // Enable CORS for frontend communication
app.use(morgan('dev')); // Log HTTP requests
app.use(express.json()); // Parse JSON request bodies

// Basic route to test server is working
app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to MindBridge API',
    status: 'Server is running successfully'
  });
});

// Health check endpoint - useful for monitoring
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});
// API endpoint to get mental health resources
// This simulates what would eventually come from your database
app.get('/api/resources', (req, res) => {
  // In a real application, this data would come from PostgreSQL
  const resources = [
    {
      id: 1,
      title: 'Anxiety Management Techniques',
      category: 'Self-Help',
      description: 'Evidence-based strategies for managing anxiety',
      urgency: 'low'
    },
    {
      id: 2,
      title: 'Crisis Hotline',
      category: 'Emergency',
      description: '24/7 Crisis Support Line',
      phone: '911',
      urgency: 'high'
    },
    {
      id: 3,
      title: 'Campus Counseling Center',
      category: 'Professional Help',
      description: 'Free counseling services for enrolled students',
      urgency: 'medium'
    }
  ];

  // Send the resources as JSON
  res.json({
    success: true,
    data: resources,
    timestamp: new Date().toISOString()
  });
});
// Start the server
app.listen(PORT, () => {
  console.log(`MindBridge server is running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT} to see the welcome message`);
});