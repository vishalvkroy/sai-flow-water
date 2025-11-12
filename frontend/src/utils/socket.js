import { io } from 'socket.io-client';
import { BASE_URL } from './api';

class SocketManager {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.listeners = new Map();
  }

  connect(userId = null, userType = 'customer') {
    if (this.socket?.connected) {
      console.log('🔌 Socket already connected');
      return this.socket;
    }

    try {
      const token = localStorage.getItem('token');
      
      this.socket = io(BASE_URL, {
        auth: {
          token,
          userId,
          userType
        },
        transports: ['websocket', 'polling'],
        timeout: 20000,
        forceNew: false,
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: this.reconnectDelay,
        reconnectionDelayMax: 5000,
        maxReconnectionAttempts: this.maxReconnectAttempts,
        randomizationFactor: 0.5,
      });

      this.setupEventHandlers(userId, userType);
      
      return this.socket;
    } catch (error) {
      console.error('❌ Failed to create socket connection:', error);
      return null;
    }
  }

  setupEventHandlers(userId, userType) {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('✅ Socket connected successfully');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      
      // Join appropriate rooms based on user type
      if (userId) {
        if (userType === 'seller') {
          this.socket.emit('join_seller', userId);
          this.socket.emit('join_room', 'sellers');
        } else {
          this.socket.emit('join_user', userId);
        }
      }
    });

    this.socket.on('connect_error', (error) => {
      console.warn('⚠️ Socket connection error:', error.message);
      this.isConnected = false;
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('❌ Max reconnection attempts reached');
        this.disconnect();
      }
    });

    this.socket.on('disconnect', (reason) => {
      console.log('🔌 Socket disconnected:', reason);
      this.isConnected = false;
      
      // Don't try to reconnect if it was intentional
      if (reason === 'io client disconnect') {
        return;
      }
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log(`✅ Socket reconnected after ${attemptNumber} attempts`);
      this.isConnected = true;
      this.reconnectAttempts = 0;
    });

    this.socket.on('reconnect_error', (error) => {
      console.warn('⚠️ Socket reconnection failed:', error.message);
    });

    this.socket.on('reconnect_failed', () => {
      console.error('❌ Socket reconnection failed permanently');
      this.isConnected = false;
    });
  }

  disconnect() {
    if (this.socket) {
      console.log('🔌 Disconnecting socket...');
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.listeners.clear();
    }
  }

  emit(event, data) {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
      return true;
    } else {
      console.warn('⚠️ Cannot emit event: Socket not connected');
      return false;
    }
  }

  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
      
      // Store listener for cleanup
      if (!this.listeners.has(event)) {
        this.listeners.set(event, []);
      }
      this.listeners.get(event).push(callback);
    }
  }

  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
      
      // Remove from stored listeners
      if (this.listeners.has(event)) {
        const callbacks = this.listeners.get(event);
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    }
  }

  removeAllListeners(event) {
    if (this.socket) {
      this.socket.removeAllListeners(event);
      this.listeners.delete(event);
    }
  }

  getConnectionStatus() {
    return {
      connected: this.isConnected,
      socketId: this.socket?.id,
      reconnectAttempts: this.reconnectAttempts
    };
  }
}

// Create singleton instance
const socketManager = new SocketManager();

export default socketManager;

// Export convenience functions
export const connectSocket = (userId, userType) => socketManager.connect(userId, userType);
export const disconnectSocket = () => socketManager.disconnect();
export const emitEvent = (event, data) => socketManager.emit(event, data);
export const onEvent = (event, callback) => socketManager.on(event, callback);
export const offEvent = (event, callback) => socketManager.off(event, callback);
export const getSocketStatus = () => socketManager.getConnectionStatus();
