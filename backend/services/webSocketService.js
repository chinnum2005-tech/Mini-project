const WebSocket = require('ws');
const jwt = require('jsonwebtoken');

class WebSocketService {
  constructor(server) {
    this.wss = new WebSocket.Server({ server });
    this.clients = new Map(); // userId -> WebSocket connection
    this.rooms = new Map(); // roomId -> Set of userIds

    this.initialize();
  }

  initialize() {
    this.wss.on('connection', (ws, request) => {
      console.log('New WebSocket connection established');

      // Extract token from query parameters
      const url = new URL(request.url, 'http://localhost');
      const token = url.searchParams.get('token');

      if (!token) {
        ws.close(1008, 'Authentication token required');
        return;
      }

      try {
        // Verify JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;

        // Store client connection
        this.clients.set(userId, ws);

        // Send welcome message
        this.sendToUser(userId, {
          type: 'connection_established',
          userId: userId,
          timestamp: new Date().toISOString()
        });

        console.log(`User ${userId} connected via WebSocket`);

        // Handle incoming messages
        ws.on('message', (data) => {
          this.handleMessage(userId, data);
        });

        // Handle connection close
        ws.on('close', () => {
          this.handleDisconnect(userId);
        });

        // Handle connection errors
        ws.on('error', (error) => {
          console.error(`WebSocket error for user ${userId}:`, error);
          this.handleDisconnect(userId);
        });

      } catch (error) {
        console.error('WebSocket authentication failed:', error);
        ws.close(1008, 'Invalid authentication token');
      }
    });
  }

  handleMessage(userId, data) {
    try {
      const message = JSON.parse(data.toString());

      switch (message.type) {
        case 'join_session':
          this.joinSession(userId, message.sessionId);
          break;

        case 'leave_session':
          this.leaveSession(userId, message.sessionId);
          break;

        case 'send_message':
          this.sendMessage(userId, message.sessionId, message.content, message.messageType);
          break;

        case 'typing_indicator':
          this.sendTypingIndicator(userId, message.sessionId, message.isTyping);
          break;

        case 'session_status_update':
          this.broadcastSessionStatus(userId, message.sessionId, message.status);
          break;

        case 'recording_status':
          this.broadcastRecordingStatus(userId, message.sessionId, message.status);
          break;

        case 'ping':
          this.sendToUser(userId, { type: 'pong', timestamp: new Date().toISOString() });
          break;

        default:
          console.warn(`Unknown message type: ${message.type}`);
      }

    } catch (error) {
      console.error('Error handling WebSocket message:', error);
    }
  }

  handleDisconnect(userId) {
    console.log(`User ${userId} disconnected from WebSocket`);

    // Remove from all rooms
    for (const [roomId, users] of this.rooms.entries()) {
      if (users.has(userId)) {
        users.delete(userId);

        // Notify other users in the room
        this.broadcastToRoom(roomId, {
          type: 'user_left',
          userId: userId,
          timestamp: new Date().toISOString()
        });

        // Clean up empty rooms
        if (users.size === 0) {
          this.rooms.delete(roomId);
        }
      }
    }

    // Remove client connection
    this.clients.delete(userId);
  }

  // Join a session room
  joinSession(userId, sessionId) {
    if (!this.rooms.has(sessionId)) {
      this.rooms.set(sessionId, new Set());
    }

    this.rooms.get(sessionId).add(userId);

    // Notify other users in the session
    this.broadcastToRoom(sessionId, {
      type: 'user_joined',
      userId: userId,
      timestamp: new Date().toISOString()
    });

    console.log(`User ${userId} joined session ${sessionId}`);
  }

  // Leave a session room
  leaveSession(userId, sessionId) {
    if (this.rooms.has(sessionId)) {
      this.rooms.get(sessionId).delete(userId);

      // Notify other users
      this.broadcastToRoom(sessionId, {
        type: 'user_left',
        userId: userId,
        timestamp: new Date().toISOString()
      });

      // Clean up empty rooms
      if (this.rooms.get(sessionId).size === 0) {
        this.rooms.delete(sessionId);
      }
    }

    console.log(`User ${userId} left session ${sessionId}`);
  }

  // Send message to session participants
  sendMessage(userId, sessionId, content, messageType = 'text') {
    const messageData = {
      type: 'new_message',
      userId: userId,
      sessionId: sessionId,
      content: content,
      messageType: messageType,
      timestamp: new Date().toISOString(),
      messageId: this.generateMessageId()
    };

    this.broadcastToRoom(sessionId, messageData);
  }

  // Send typing indicator
  sendTypingIndicator(userId, sessionId, isTyping) {
    this.broadcastToRoom(sessionId, {
      type: 'typing_indicator',
      userId: userId,
      isTyping: isTyping,
      timestamp: new Date().toISOString()
    }, userId); // Exclude the sender
  }

  // Broadcast session status update
  broadcastSessionStatus(userId, sessionId, status) {
    this.broadcastToRoom(sessionId, {
      type: 'session_status_update',
      userId: userId,
      sessionId: sessionId,
      status: status,
      timestamp: new Date().toISOString()
    });
  }

  // Broadcast recording status
  broadcastRecordingStatus(userId, sessionId, status) {
    this.broadcastToRoom(sessionId, {
      type: 'recording_status',
      userId: userId,
      sessionId: sessionId,
      status: status,
      timestamp: new Date().toISOString()
    });
  }

  // Broadcast message to all users in a room
  broadcastToRoom(roomId, message, excludeUserId = null) {
    if (!this.rooms.has(roomId)) return;

    const users = this.rooms.get(roomId);

    users.forEach(userId => {
      if (userId !== excludeUserId && this.clients.has(userId)) {
        this.sendToUser(userId, message);
      }
    });
  }

  // Send message to specific user
  sendToUser(userId, message) {
    if (this.clients.has(userId)) {
      const ws = this.clients.get(userId);

      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(message));
      }
    }
  }

  // Send notification to user (works even if not in a specific room)
  sendNotification(userId, notification) {
    this.sendToUser(userId, {
      type: 'notification',
      ...notification,
      timestamp: new Date().toISOString()
    });
  }

  // Broadcast to all connected users
  broadcastToAll(message) {
    this.clients.forEach((ws, userId) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(message));
      }
    });
  }

  // Generate unique message ID
  generateMessageId() {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Get connected users count
  getConnectedUsersCount() {
    return this.clients.size;
  }

  // Get active rooms count
  getActiveRoomsCount() {
    return this.rooms.size;
  }

  // Check if user is connected
  isUserConnected(userId) {
    return this.clients.has(userId);
  }

  // Get user's active rooms
  getUserRooms(userId) {
    const userRooms = [];
    for (const [roomId, users] of this.rooms.entries()) {
      if (users.has(userId)) {
        userRooms.push(roomId);
      }
    }
    return userRooms;
  }

  // Force disconnect user
  disconnectUser(userId) {
    if (this.clients.has(userId)) {
      this.clients.get(userId).close(1000, 'Server initiated disconnect');
      this.handleDisconnect(userId);
    }
  }

  // Send heartbeat to all clients
  sendHeartbeat() {
    const heartbeat = {
      type: 'heartbeat',
      timestamp: new Date().toISOString(),
      connectedUsers: this.getConnectedUsersCount(),
      activeRooms: this.getActiveRoomsCount()
    };

    this.broadcastToAll(heartbeat);
  }

  // Get WebSocket server statistics
  getStats() {
    return {
      connectedUsers: this.getConnectedUsersCount(),
      activeRooms: this.getActiveRoomsCount(),
      totalClients: this.clients.size,
      rooms: Array.from(this.rooms.entries()).map(([roomId, users]) => ({
        roomId: roomId,
        userCount: users.size,
        users: Array.from(users)
      }))
    };
  }
}

// Start heartbeat every 30 seconds
let heartbeatInterval;

function initializeWebSocketService(server) {
  const wsService = new WebSocketService(server);

  // Start heartbeat
  heartbeatInterval = setInterval(() => {
    wsService.sendHeartbeat();
  }, 30000);

  console.log('WebSocket service initialized');

  return wsService;
}

module.exports = {
  initializeWebSocketService,
  WebSocketService
};
