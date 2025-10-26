import { Request, Response } from 'express';
import { sessionService } from './sessionService';

// Performance metrics interface
interface PerformanceMetrics {
  responseTime: number;
  memoryUsage: NodeJS.MemoryUsage;
  cpuUsage: NodeJS.CpuUsage;
  requestCount: number;
  errorCount: number;
  successRate: number;
  timestamp: Date;
}

// Alert thresholds
const ALERT_THRESHOLDS = {
  responseTime: 5000, // 5 seconds
  memoryUsage: 0.9, // 90% of available memory
  errorRate: 0.1, // 10% error rate
  cpuUsage: 0.8, // 80% CPU usage
  requestCount: 1000 // 1000 requests per minute
};

// Alert types
type AlertType = 'performance' | 'error' | 'security' | 'resource';

interface Alert {
  id: string;
  type: AlertType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
  metadata: any;
  resolved: boolean;
}

class AdvancedMonitoringService {
  private metrics: PerformanceMetrics[] = [];
  private alerts: Alert[] = [];
  private requestCount = 0;
  private errorCount = 0;
  private startTime = Date.now();
  
  // Record request metrics
  recordRequest(req: Request, res: Response, duration: number): void {
    this.requestCount++;
    
    const isError = res.statusCode >= 400;
    if (isError) {
      this.errorCount++;
    }
    
    const metrics: PerformanceMetrics = {
      responseTime: duration,
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage(),
      requestCount: this.requestCount,
      errorCount: this.errorCount,
      successRate: this.requestCount > 0 ? (this.requestCount - this.errorCount) / this.requestCount : 1,
      timestamp: new Date()
    };
    
    this.metrics.push(metrics);
    
    // Keep only last 1000 metrics to prevent memory issues
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }
    
    // Check for alerts
    this.checkAlerts(metrics, req, res);
  }
  
  // Check for various alert conditions
  private checkAlerts(metrics: PerformanceMetrics, req: Request, res: Response): void {
    // Response time alert
    if (metrics.responseTime > ALERT_THRESHOLDS.responseTime) {
      this.createAlert('performance', 'high', 
        `High response time detected: ${metrics.responseTime}ms`, 
        { responseTime: metrics.responseTime, url: req.url, method: req.method });
    }
    
    // Memory usage alert
    const memoryUsagePercent = metrics.memoryUsage.heapUsed / metrics.memoryUsage.heapTotal;
    if (memoryUsagePercent > ALERT_THRESHOLDS.memoryUsage) {
      this.createAlert('resource', 'high', 
        `High memory usage detected: ${(memoryUsagePercent * 100).toFixed(2)}%`, 
        { memoryUsage: metrics.memoryUsage, memoryPercent: memoryUsagePercent });
    }
    
    // Error rate alert
    if (metrics.successRate < (1 - ALERT_THRESHOLDS.errorRate)) {
      this.createAlert('error', 'critical', 
        `High error rate detected: ${((1 - metrics.successRate) * 100).toFixed(2)}%`, 
        { errorRate: 1 - metrics.successRate, totalRequests: metrics.requestCount, errors: metrics.errorCount });
    }
    
    // Security alerts
    if (res.statusCode === 401 || res.statusCode === 403) {
      this.createAlert('security', 'medium', 
        `Authentication/Authorization failure`, 
        { statusCode: res.statusCode, url: req.url, ip: req.ip, userAgent: req.get('User-Agent') });
    }
    
    // Rate limiting alerts
    if (res.statusCode === 429) {
      this.createAlert('security', 'medium', 
        `Rate limiting triggered`, 
        { statusCode: res.statusCode, url: req.url, ip: req.ip });
    }
  }
  
  // Create alert
  private createAlert(type: AlertType, severity: 'low' | 'medium' | 'high' | 'critical', message: string, metadata: any): void {
    const alert: Alert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      severity,
      message,
      timestamp: new Date(),
      metadata,
      resolved: false
    };
    
    this.alerts.push(alert);
    
    // Log critical alerts
    if (severity === 'critical') {
      console.error('🚨 CRITICAL ALERT:', alert);
    } else if (severity === 'high') {
      console.warn('⚠️ HIGH ALERT:', alert);
    }
    
    // Keep only last 100 alerts
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(-100);
    }
  }
  
  // Get performance metrics
  getMetrics(): PerformanceMetrics[] {
    return this.metrics;
  }
  
  // Get alerts
  getAlerts(severity?: string, type?: string): Alert[] {
    let filteredAlerts = this.alerts;
    
    if (severity) {
      filteredAlerts = filteredAlerts.filter(alert => alert.severity === severity);
    }
    
    if (type) {
      filteredAlerts = filteredAlerts.filter(alert => alert.type === type);
    }
    
    return filteredAlerts;
  }
  
  // Get system health
  async getSystemHealth(): Promise<any> {
    const uptime = Date.now() - this.startTime;
    const currentMetrics = this.metrics[this.metrics.length - 1] || {
      responseTime: 0,
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage(),
      requestCount: this.requestCount,
      errorCount: this.errorCount,
      successRate: this.requestCount > 0 ? (this.requestCount - this.errorCount) / this.requestCount : 1,
      timestamp: new Date()
    };
    
    // Calculate averages
    const avgResponseTime = this.metrics.length > 0 
      ? this.metrics.reduce((sum, m) => sum + m.responseTime, 0) / this.metrics.length 
      : 0;
    
    const avgSuccessRate = this.metrics.length > 0 
      ? this.metrics.reduce((sum, m) => sum + m.successRate, 0) / this.metrics.length 
      : 1;
    
    // Get session stats if Redis is available
    let sessionStats = null;
    try {
      sessionStats = await sessionService.getSessionStats();
    } catch (error) {
      // Redis not available, continue without session stats
    }
    
    return {
      uptime: {
        milliseconds: uptime,
        seconds: Math.floor(uptime / 1000),
        minutes: Math.floor(uptime / 60000),
        hours: Math.floor(uptime / 3600000)
      },
      performance: {
        current: currentMetrics,
        average: {
          responseTime: Math.round(avgResponseTime),
          successRate: Math.round(avgSuccessRate * 100) / 100
        }
      },
      alerts: {
        total: this.alerts.length,
        unresolved: this.alerts.filter(a => !a.resolved).length,
        critical: this.alerts.filter(a => a.severity === 'critical' && !a.resolved).length,
        high: this.alerts.filter(a => a.severity === 'high' && !a.resolved).length
      },
      sessions: sessionStats,
      thresholds: ALERT_THRESHOLDS
    };
  }
  
  // Resolve alert
  resolveAlert(alertId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
      return true;
    }
    return false;
  }
  
  // Clear resolved alerts
  clearResolvedAlerts(): number {
    const initialLength = this.alerts.length;
    this.alerts = this.alerts.filter(a => !a.resolved);
    return initialLength - this.alerts.length;
  }
  
  // Get performance trends
  getPerformanceTrends(hours: number = 1): any {
    const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);
    const recentMetrics = this.metrics.filter(m => m.timestamp >= cutoffTime);
    
    if (recentMetrics.length === 0) {
      return { message: 'No data available for the specified time period' };
    }
    
    const responseTimes = recentMetrics.map(m => m.responseTime);
    const successRates = recentMetrics.map(m => m.successRate);
    
    return {
      period: `${hours} hour(s)`,
      dataPoints: recentMetrics.length,
      responseTime: {
        min: Math.min(...responseTimes),
        max: Math.max(...responseTimes),
        avg: Math.round(responseTimes.reduce((sum, rt) => sum + rt, 0) / responseTimes.length),
        p95: this.percentile(responseTimes, 95),
        p99: this.percentile(responseTimes, 99)
      },
      successRate: {
        min: Math.min(...successRates),
        max: Math.max(...successRates),
        avg: Math.round(successRates.reduce((sum, sr) => sum + sr, 0) / successRates.length * 100) / 100
      }
    };
  }
  
  // Calculate percentile
  private percentile(arr: number[], p: number): number {
    const sorted = arr.sort((a, b) => a - b);
    const index = Math.ceil((p / 100) * sorted.length) - 1;
    return sorted[index] || 0;
  }
}

// Export singleton instance
export const advancedMonitoring = new AdvancedMonitoringService();

// Middleware for recording requests
export const monitoringMiddleware = (req: Request, res: Response, next: any) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    advancedMonitoring.recordRequest(req, res, duration);
  });
  
  next();
};
