import mongoose from 'mongoose';
import { TrackingOrder } from '../models/TrackingOrder';
import { OrderModel } from '../models/orderModel';
import User from '../models/userModel';

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
  services: {
    database: ServiceHealth;
    tracking: ServiceHealth;
    payment: ServiceHealth;
    email: ServiceHealth;
    redis?: ServiceHealth;
  };
  metrics: {
    memory: MemoryUsage;
    cpu: number;
    requests: RequestMetrics;
  };
  checks: HealthCheck[];
}

export interface ServiceHealth {
  status: 'up' | 'down' | 'degraded';
  responseTime?: number;
  lastCheck: string;
  details?: any;
}

export interface MemoryUsage {
  used: string;
  total: string;
  percentage: number;
}

export interface RequestMetrics {
  total: number;
  successful: number;
  failed: number;
  averageResponseTime: number;
}

export interface HealthCheck {
  name: string;
  status: 'pass' | 'fail' | 'warn';
  message: string;
  duration: number;
  timestamp: string;
}

export class HealthService {
  private requestCount = 0;
  private successfulRequests = 0;
  private failedRequests = 0;
  private responseTimes: number[] = [];

  /**
   * Get comprehensive health status
   */
  async getHealthStatus(): Promise<HealthStatus> {
    const startTime = Date.now();
    const checks: HealthCheck[] = [];

    // Database health check
    const dbHealth = await this.checkDatabase();
    checks.push(dbHealth);

    // Tracking service health check
    const trackingHealth = await this.checkTrackingService();
    checks.push(trackingHealth);

    // Payment service health check
    const paymentHealth = await this.checkPaymentService();
    checks.push(paymentHealth);

    // Email service health check
    const emailHealth = await this.checkEmailService();
    checks.push(emailHealth);

    // Redis health check (if configured)
    if (process.env.REDIS_URL) {
      const redisHealth = await this.checkRedis();
      checks.push(redisHealth);
    }

    // Calculate overall status
    const failedChecks = checks.filter(check => check.status === 'fail');
    const warningChecks = checks.filter(check => check.status === 'warn');
    
    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    if (failedChecks.length > 0) {
      status = 'unhealthy';
    } else if (warningChecks.length > 0) {
      status = 'degraded';
    }

    // Calculate memory usage
    const memoryUsage = process.memoryUsage();
    const memory: MemoryUsage = {
      used: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
      total: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
      percentage: Math.round((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100)
    };

    // Calculate request metrics
    const requests: RequestMetrics = {
      total: this.requestCount,
      successful: this.successfulRequests,
      failed: this.failedRequests,
      averageResponseTime: this.responseTimes.length > 0 
        ? Math.round(this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length)
        : 0
    };

    return {
      status,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      services: {
        database: this.getServiceHealth(dbHealth),
        tracking: this.getServiceHealth(trackingHealth),
        payment: this.getServiceHealth(paymentHealth),
        email: this.getServiceHealth(emailHealth),
        ...(process.env.REDIS_URL && { redis: this.getServiceHealth(checks.find(c => c.name === 'redis') || trackingHealth) })
      },
      metrics: {
        memory,
        cpu: process.cpuUsage().user / 1000000, // Convert to seconds
        requests
      },
      checks
    };
  }

  /**
   * Check database connectivity and performance
   */
  private async checkDatabase(): Promise<HealthCheck> {
    const startTime = Date.now();
    
    try {
      // Check connection status
      if (mongoose.connection.readyState !== 1) {
        return {
          name: 'database',
          status: 'fail',
          message: 'Database not connected',
          duration: Date.now() - startTime,
          timestamp: new Date().toISOString()
        };
      }

      // Test query performance
      const testQuery = await User.findOne().limit(1).lean();
      const duration = Date.now() - startTime;

      if (duration > 1000) {
        return {
          name: 'database',
          status: 'warn',
          message: `Database response slow: ${duration}ms`,
          duration,
          timestamp: new Date().toISOString()
        };
      }

      return {
        name: 'database',
        status: 'pass',
        message: `Database healthy (${duration}ms)`,
        duration,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      return {
        name: 'database',
        status: 'fail',
        message: `Database error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Check tracking service health
   */
  private async checkTrackingService(): Promise<HealthCheck> {
    const startTime = Date.now();
    
    try {
      // Check if tracking models are accessible
      const trackingCount = await TrackingOrder.countDocuments();
      const duration = Date.now() - startTime;

      return {
        name: 'tracking',
        status: 'pass',
        message: `Tracking service healthy (${trackingCount} orders tracked)`,
        duration,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      return {
        name: 'tracking',
        status: 'fail',
        message: `Tracking service error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Check payment service configuration
   */
  private async checkPaymentService(): Promise<HealthCheck> {
    const startTime = Date.now();
    
    try {
      const hasMerchantId = !!process.env.CCAVENUE_MERCHANT_ID;
      const hasAccessCode = !!process.env.CCAVENUE_ACCESS_CODE;
      const hasWorkingKey = !!process.env.CCAVENUE_WORKING_KEY;

      if (!hasMerchantId || !hasAccessCode || !hasWorkingKey) {
        return {
          name: 'payment',
          status: 'warn',
          message: 'Payment service not fully configured',
          duration: Date.now() - startTime,
          timestamp: new Date().toISOString()
        };
      }

      return {
        name: 'payment',
        status: 'pass',
        message: 'Payment service configured',
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      return {
        name: 'payment',
        status: 'fail',
        message: `Payment service error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Check email service configuration
   */
  private async checkEmailService(): Promise<HealthCheck> {
    const startTime = Date.now();
    
    try {
      const hasEmailUser = !!process.env.EMAIL_USER;
      const hasEmailPass = !!process.env.EMAIL_PASS;

      if (!hasEmailUser || !hasEmailPass) {
        return {
          name: 'email',
          status: 'warn',
          message: 'Email service not configured',
          duration: Date.now() - startTime,
          timestamp: new Date().toISOString()
        };
      }

      return {
        name: 'email',
        status: 'pass',
        message: 'Email service configured',
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      return {
        name: 'email',
        status: 'fail',
        message: `Email service error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Check Redis connectivity (if configured)
   */
  private async checkRedis(): Promise<HealthCheck> {
    const startTime = Date.now();
    
    try {
      // This would need a Redis client implementation
      // For now, just check if Redis URL is configured
      if (!process.env.REDIS_URL) {
        return {
          name: 'redis',
          status: 'warn',
          message: 'Redis not configured',
          duration: Date.now() - startTime,
          timestamp: new Date().toISOString()
        };
      }

      return {
        name: 'redis',
        status: 'pass',
        message: 'Redis configured',
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      return {
        name: 'redis',
        status: 'fail',
        message: `Redis error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Convert health check to service health
   */
  private getServiceHealth(check: HealthCheck): ServiceHealth {
    return {
      status: check.status === 'pass' ? 'up' : check.status === 'warn' ? 'degraded' : 'down',
      responseTime: check.duration,
      lastCheck: check.timestamp,
      details: {
        message: check.message
      }
    };
  }

  /**
   * Record request metrics
   */
  recordRequest(success: boolean, responseTime: number): void {
    this.requestCount++;
    if (success) {
      this.successfulRequests++;
    } else {
      this.failedRequests++;
    }
    this.responseTimes.push(responseTime);
    
    // Keep only last 100 response times
    if (this.responseTimes.length > 100) {
      this.responseTimes = this.responseTimes.slice(-100);
    }
  }

  /**
   * Get simple health status for basic monitoring
   */
  async getSimpleHealth(): Promise<{ status: string; timestamp: string }> {
    const dbConnected = mongoose.connection.readyState === 1;
    
    return {
      status: dbConnected ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString()
    };
  }
}

export const healthService = new HealthService();
