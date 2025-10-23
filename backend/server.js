const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const http = require('http');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const authRoutes = require('./routes/auth');
const feedbackRoutes = require('./routes/feedback');
const chatRoutes = require('./routes/chat');
const sessionsRoutes = require('./routes/sessions');
const blockchainRoutes = require('./routes/blockchain');
const reviewsRoutes = require('./routes/reviews');
const groupsRoutes = require('./routes/groups');
const moderationRoutes = require('./routes/moderation');
const userSkillsRoutes = require('./routes/userSkills');
const skillMatchingRoutes = require('./routes/skillMatching');
const adminAnalyticsRoutes = require('./routes/adminAnalytics');
const { initializeWebSocketService } = require('./services/webSocketService');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: [process.env.FRONTEND_URL || 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5180'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/sessions', sessionsRoutes);
app.use('/api/user-skills', userSkillsRoutes);
app.use('/api/blockchain', blockchainRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/groups', groupsRoutes);
app.use('/api/moderation', moderationRoutes);
app.use('/api/skill-matching', skillMatchingRoutes);
app.use('/api/admin-analytics', adminAnalyticsRoutes);

// Initialize WebSocket service
initializeWebSocketService(server);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ message: 'BlockLearn API is running!' });
});

// Default root route
app.get('/', (req, res) => {
  res.send('BlockLearn Backend is running!');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!'
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 BlockLearn Server is running on port ${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📊 Admin dashboard: http://localhost:${PORT}/api/admin-analytics/overview`);
  console.log(`🔐 Blockchain: http://localhost:${PORT}/api/blockchain/stats`);
  console.log(`🔴 WebSocket ready for real-time features`);
}).on('error', (err) => {
  console.error('Server failed to start:', err.message);
  process.exit(1);
});

module.exports = app;