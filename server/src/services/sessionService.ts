import Redis from 'ioredis';

// Redis configuration
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD || undefined,
  db: parseInt(process.env.REDIS_DB || '0', 10),
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
  lazyConnect: true
};

// Redis client instance
let redisClient: Redis | null = null;

// Initialize Redis connection
export const initializeRedis = (): Redis => {
  if (!redisClient) {
    redisClient = new Redis(redisConfig);
    
    redisClient.on('connect', () => {
      console.log('✅ Redis connected successfully');
    });
    
    redisClient.on('error', (err) => {
      console.error('❌ Redis connection error:', err);
    });
    
    redisClient.on('close', () => {
      console.log('⚠️ Redis connection closed');
    });
  }
  
  return redisClient;
};

// Get Redis client
export const getRedisClient = (): Redis => {
  if (!redisClient) {
    return initializeRedis();
  }
  return redisClient;
};

// Session service class
export class SessionService {
  private redis: Redis;
  private sessionPrefix = 'session:';
  private sessionTTL = 24 * 60 * 60; // 24 hours in seconds
  
  constructor() {
    this.redis = getRedisClient();
  }
  
  // Store session data
  async setSession(sessionId: string, data: any, ttl?: number): Promise<void> {
    try {
      const key = `${this.sessionPrefix}${sessionId}`;
      const value = JSON.stringify({
        data,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + (ttl || this.sessionTTL) * 1000).toISOString()
      });
      
      await this.redis.setex(key, ttl || this.sessionTTL, value);
    } catch (error) {
      console.error('Error setting session:', error);
      throw error;
    }
  }
  
  // Get session data
  async getSession(sessionId: string): Promise<any | null> {
    try {
      const key = `${this.sessionPrefix}${sessionId}`;
      const value = await this.redis.get(key);
      
      if (!value) {
        return null;
      }
      
      const session = JSON.parse(value);
      
      // Check if session is expired
      if (new Date() > new Date(session.expiresAt)) {
        await this.deleteSession(sessionId);
        return null;
      }
      
      return session.data;
    } catch (error) {
      console.error('Error getting session:', error);
      return null;
    }
  }
  
  // Update session data
  async updateSession(sessionId: string, data: any, ttl?: number): Promise<void> {
    try {
      const existingSession = await this.getSession(sessionId);
      if (existingSession) {
        const updatedData = { ...existingSession, ...data };
        await this.setSession(sessionId, updatedData, ttl);
      }
    } catch (error) {
      console.error('Error updating session:', error);
      throw error;
    }
  }
  
  // Delete session
  async deleteSession(sessionId: string): Promise<void> {
    try {
      const key = `${this.sessionPrefix}${sessionId}`;
      await this.redis.del(key);
    } catch (error) {
      console.error('Error deleting session:', error);
      throw error;
    }
  }
  
  // Extend session TTL
  async extendSession(sessionId: string, ttl?: number): Promise<void> {
    try {
      const key = `${this.sessionPrefix}${sessionId}`;
      await this.redis.expire(key, ttl || this.sessionTTL);
    } catch (error) {
      console.error('Error extending session:', error);
      throw error;
    }
  }
  
  // Get all sessions for a user
  async getUserSessions(userId: string): Promise<any[]> {
    try {
      const pattern = `${this.sessionPrefix}*`;
      const keys = await this.redis.keys(pattern);
      const sessions = [];
      
      for (const key of keys) {
        const value = await this.redis.get(key);
        if (value) {
          const session = JSON.parse(value);
          if (session.data.userId === userId) {
            sessions.push({
              sessionId: key.replace(this.sessionPrefix, ''),
              ...session
            });
          }
        }
      }
      
      return sessions;
    } catch (error) {
      console.error('Error getting user sessions:', error);
      return [];
    }
  }
  
  // Clean up expired sessions
  async cleanupExpiredSessions(): Promise<number> {
    try {
      const pattern = `${this.sessionPrefix}*`;
      const keys = await this.redis.keys(pattern);
      let cleaned = 0;
      
      for (const key of keys) {
        const value = await this.redis.get(key);
        if (value) {
          const session = JSON.parse(value);
          if (new Date() > new Date(session.expiresAt)) {
            await this.redis.del(key);
            cleaned++;
          }
        }
      }
      
      return cleaned;
    } catch (error) {
      console.error('Error cleaning up sessions:', error);
      return 0;
    }
  }
  
  // Get session statistics
  async getSessionStats(): Promise<any> {
    try {
      const pattern = `${this.sessionPrefix}*`;
      const keys = await this.redis.keys(pattern);
      
      let activeSessions = 0;
      let expiredSessions = 0;
      const now = new Date();
      
      for (const key of keys) {
        const value = await this.redis.get(key);
        if (value) {
          const session = JSON.parse(value);
          if (now > new Date(session.expiresAt)) {
            expiredSessions++;
          } else {
            activeSessions++;
          }
        }
      }
      
      return {
        totalSessions: keys.length,
        activeSessions,
        expiredSessions,
        memoryUsage: await this.redis.memory('STATS')
      };
    } catch (error) {
      console.error('Error getting session stats:', error);
      return null;
    }
  }
}

// Export singleton instance
export const sessionService = new SessionService();

// Graceful shutdown
export const closeRedisConnection = async (): Promise<void> => {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    console.log('✅ Redis connection closed');
  }
};
