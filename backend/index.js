const express = require('express');
const cors = require('cors');
require('dotenv').config();
const dbService = require('./services/dbService');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Health Check Route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'online', 
    project: 'Zenius', 
    timestamp: new Date() 
  });
});

// Start Server and Test Database
app.listen(PORT, async () => {
  console.log(`🚀 Zenius Backend running on http://localhost:${PORT}`);
  
  try {
    const isConnected = await dbService.testConnection();
    if (isConnected) {
      console.log('✅ Firestore connection: SUCCESS');
    } else {
      console.error('❌ Firestore connection: FAILED');
    }
  } catch (error) {
    console.error('❌ Unexpected error during DB initialization:', error.message);
  }
});