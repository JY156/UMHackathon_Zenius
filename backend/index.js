const express = require('express');
const cors = require('cors');
require('dotenv').config();
const dbService = require('./services/dbService');
const inputRoutes = require('./routes/inputRoutes');
const userRoutes = require('./routes/userRoutes');
const taskRoutes = require('./routes/taskRoutes');
const approvalRoutes = require('./routes/approvalRoutes');
const logRoutes = require('./routes/logRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/approvals', approvalRoutes);
app.use('/api/inputs', inputRoutes);
app.use('/api/logs',logRoutes)

// Health Check Route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'online', 
    project: 'Zenius', 
    timestamp: new Date() 
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('⚠️ Server Error:', err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
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