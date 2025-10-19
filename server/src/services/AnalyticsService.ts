import { TrackingOrder } from '../models/TrackingOrder';
import { OrderModel } from '../models/orderModel';
import { AuditLog } from '../models/AuditLog';
import { logInfo, logError } from '../utils/tracking';

export interface AnalyticsPeriod {
  startDate: Date;
  endDate: Date;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
}

export interface TrackingMetrics {
  totalOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  inProgressOrders: number;
  deliveryRate: number;
  cancellationRate: number;
  avgProcessingTime: number;
  avgDeliveryTime: number;
}

export interface StatusDistribution {
  status: string;
  count: number;
  percentage: number;
}

export interface TimeSeriesData {
  date: string;
  orders: number;
  delivered: number;
  cancelled: number;
}

export interface CourierPerformance {
  courierService: string;
  totalOrders: number;
  deliveredOrders: number;
  avgDeliveryTime: number;
  successRate: number;
}

export class AnalyticsService {
  /**
   * Get comprehensive tracking analytics
   */
  async getTrackingAnalytics(period: AnalyticsPeriod): Promise<any> {
    try {
      const dateFilter = {
        createdAt: {
          $gte: period.startDate,
          $lte: period.endDate
        }
      };

      // Get basic metrics
      const metrics = await this.getTrackingMetrics(dateFilter);
      
      // Get status distribution
      const statusDistribution = await this.getStatusDistribution(dateFilter);
      
      // Get time series data
      const timeSeriesData = await this.getTimeSeriesData(dateFilter, period.period);
      
      // Get courier performance
      const courierPerformance = await this.getCourierPerformance(dateFilter);
      
      // Get customer satisfaction metrics
      const customerSatisfaction = await this.getCustomerSatisfaction(dateFilter);
      
      // Get audit activity
      const auditActivity = await this.getAuditActivity(dateFilter);

      return {
        period,
        metrics,
        statusDistribution,
        timeSeriesData,
        courierPerformance,
        customerSatisfaction,
        auditActivity
      };

    } catch (error) {
      logError(error as Error, 'getTrackingAnalytics');
      throw error;
    }
  }

  /**
   * Get tracking metrics
   */
  private async getTrackingMetrics(dateFilter: any): Promise<TrackingMetrics> {
    const pipeline = [
      { $match: dateFilter },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          deliveredOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'DELIVERED'] }, 1, 0] }
          },
          cancelledOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'CANCELLED'] }, 1, 0] }
          },
          inProgressOrders: {
            $sum: {
              $cond: [
                { $in: ['$status', ['ORDER_PLACED', 'PROCESSING', 'PACKAGING', 'ON_THE_ROAD']] },
                1,
                0
              ]
            }
          },
          avgProcessingTime: {
            $avg: {
              $cond: [
                { $eq: ['$status', 'DELIVERED'] },
                { $subtract: ['$updatedAt', '$createdAt'] },
                null
              ]
            }
          }
        }
      }
    ];

    const result = await TrackingOrder.aggregate(pipeline);
    const data = result[0] || {
      totalOrders: 0,
      deliveredOrders: 0,
      cancelledOrders: 0,
      inProgressOrders: 0,
      avgProcessingTime: 0
    };

    const deliveryRate = data.totalOrders > 0 ? (data.deliveredOrders / data.totalOrders) * 100 : 0;
    const cancellationRate = data.totalOrders > 0 ? (data.cancelledOrders / data.totalOrders) * 100 : 0;

    return {
      totalOrders: data.totalOrders,
      deliveredOrders: data.deliveredOrders,
      cancelledOrders: data.cancelledOrders,
      inProgressOrders: data.inProgressOrders,
      deliveryRate: Math.round(deliveryRate * 100) / 100,
      cancellationRate: Math.round(cancellationRate * 100) / 100,
      avgProcessingTime: Math.round(data.avgProcessingTime / (1000 * 60 * 60 * 24) * 100) / 100, // Convert to days
      avgDeliveryTime: Math.round(data.avgProcessingTime / (1000 * 60 * 60 * 24) * 100) / 100
    };
  }

  /**
   * Get status distribution
   */
  private async getStatusDistribution(dateFilter: any): Promise<StatusDistribution[]> {
    const pipeline = [
      { $match: dateFilter },
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ];

    const results = await TrackingOrder.aggregate(pipeline as any[]);
    const total = results.reduce((sum, item) => sum + item.count, 0);

    return results.map(item => ({
      status: item._id,
      count: item.count,
      percentage: total > 0 ? Math.round((item.count / total) * 100 * 100) / 100 : 0
    }));
  }

  /**
   * Get time series data
   */
  private async getTimeSeriesData(dateFilter: any, period: string): Promise<TimeSeriesData[]> {
    let groupFormat: string;
    
    switch (period) {
      case 'daily':
        groupFormat = '%Y-%m-%d';
        break;
      case 'weekly':
        groupFormat = '%Y-%U';
        break;
      case 'monthly':
        groupFormat = '%Y-%m';
        break;
      case 'yearly':
        groupFormat = '%Y';
        break;
      default:
        groupFormat = '%Y-%m-%d';
    }

    const pipeline = [
      { $match: dateFilter },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: groupFormat, date: '$createdAt' } }
          },
          orders: { $sum: 1 },
          delivered: {
            $sum: { $cond: [{ $eq: ['$status', 'DELIVERED'] }, 1, 0] }
          },
          cancelled: {
            $sum: { $cond: [{ $eq: ['$status', 'CANCELLED'] }, 1, 0] }
          }
        }
      },
      { $sort: { '_id.date': 1 } }
    ];

    const results = await TrackingOrder.aggregate(pipeline as any[]);
    
    return results.map((item: any) => ({
      date: item._id.date,
      orders: item.orders,
      delivered: item.delivered,
      cancelled: item.cancelled
    }));
  }

  /**
   * Get courier performance
   */
  private async getCourierPerformance(dateFilter: any): Promise<CourierPerformance[]> {
    const pipeline = [
      { $match: { ...dateFilter, courierService: { $exists: true } } },
      {
        $group: {
          _id: '$courierService',
          totalOrders: { $sum: 1 },
          deliveredOrders: {
            $sum: { $cond: [{ $eq: ['$orderStatus', 'delivered'] }, 1, 0] }
          },
          avgDeliveryTime: {
            $avg: {
              $cond: [
                { $eq: ['$orderStatus', 'delivered'] },
                { $subtract: ['$deliveredAt', '$shippedAt'] },
                null
              ]
            }
          }
        }
      },
      {
        $project: {
          courierService: '$_id',
          totalOrders: 1,
          deliveredOrders: 1,
          avgDeliveryTime: {
            $divide: ['$avgDeliveryTime', 1000 * 60 * 60 * 24] // Convert to days
          },
          successRate: {
            $multiply: [
              { $divide: ['$deliveredOrders', '$totalOrders'] },
              100
            ]
          }
        }
      },
      { $sort: { successRate: -1 } }
    ];

    const results = await OrderModel.aggregate(pipeline as any[]);
    
    return results.map(item => ({
      courierService: item.courierService,
      totalOrders: item.totalOrders,
      deliveredOrders: item.deliveredOrders,
      avgDeliveryTime: Math.round(item.avgDeliveryTime * 100) / 100,
      successRate: Math.round(item.successRate * 100) / 100
    }));
  }

  /**
   * Get customer satisfaction metrics
   */
  private async getCustomerSatisfaction(dateFilter: any): Promise<any> {
    const pipeline = [
      { $match: dateFilter },
      {
        $group: {
          _id: '$customerEmail',
          totalOrders: { $sum: 1 },
          deliveredOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'DELIVERED'] }, 1, 0] }
          },
          cancelledOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'CANCELLED'] }, 1, 0] }
          }
        }
      },
      {
        $project: {
          satisfactionRate: {
            $divide: ['$deliveredOrders', '$totalOrders']
          },
          cancellationRate: {
            $divide: ['$cancelledOrders', '$totalOrders']
          }
        }
      },
      {
        $group: {
          _id: null,
          avgSatisfactionRate: { $avg: '$satisfactionRate' },
          avgCancellationRate: { $avg: '$cancellationRate' },
          totalCustomers: { $sum: 1 }
        }
      }
    ];

    const result = await TrackingOrder.aggregate(pipeline);
    const data = result[0] || {
      avgSatisfactionRate: 0,
      avgCancellationRate: 0,
      totalCustomers: 0
    };

    return {
      avgSatisfactionRate: Math.round(data.avgSatisfactionRate * 10000) / 100,
      avgCancellationRate: Math.round(data.avgCancellationRate * 10000) / 100,
      totalCustomers: data.totalCustomers
    };
  }

  /**
   * Get audit activity
   */
  private async getAuditActivity(dateFilter: any): Promise<any> {
    const auditFilter = {
      timestamp: {
        $gte: dateFilter.createdAt.$gte,
        $lte: dateFilter.createdAt.$lte
      },
      entityType: { $in: ['order', 'tracking'] }
    };

    const pipeline = [
      { $match: auditFilter },
      {
        $group: {
          _id: {
            action: '$action',
            date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.date': -1, count: -1 } },
      { $limit: 50 }
    ];

    const results = await AuditLog.aggregate(pipeline as any[]);
    
    return {
      dailyActivity: results,
      totalActivities: results.reduce((sum, item) => sum + item.count, 0)
    };
  }

  /**
   * Generate tracking report
   */
  async generateTrackingReport(period: AnalyticsPeriod, format: 'json' | 'csv' = 'json'): Promise<any> {
    try {
      const analytics = await this.getTrackingAnalytics(period);
      
      if (format === 'csv') {
        return this.convertToCSV(analytics);
      }
      
      return analytics;

    } catch (error) {
      logError(error as Error, 'generateTrackingReport');
      throw error;
    }
  }

  /**
   * Convert analytics data to CSV format
   */
  private convertToCSV(analytics: any): string {
    const lines: string[] = [];
    
    // Header
    lines.push('Metric,Value');
    
    // Basic metrics
    lines.push(`Total Orders,${analytics.metrics.totalOrders}`);
    lines.push(`Delivered Orders,${analytics.metrics.deliveredOrders}`);
    lines.push(`Cancelled Orders,${analytics.metrics.cancelledOrders}`);
    lines.push(`In Progress Orders,${analytics.metrics.inProgressOrders}`);
    lines.push(`Delivery Rate,${analytics.metrics.deliveryRate}%`);
    lines.push(`Cancellation Rate,${analytics.metrics.cancellationRate}%`);
    lines.push(`Avg Processing Time,${analytics.metrics.avgProcessingTime} days`);
    
    // Status distribution
    lines.push('');
    lines.push('Status Distribution');
    lines.push('Status,Count,Percentage');
    analytics.statusDistribution.forEach((item: StatusDistribution) => {
      lines.push(`${item.status},${item.count},${item.percentage}%`);
    });
    
    // Time series data
    lines.push('');
    lines.push('Time Series Data');
    lines.push('Date,Orders,Delivered,Cancelled');
    analytics.timeSeriesData.forEach((item: TimeSeriesData) => {
      lines.push(`${item.date},${item.orders},${item.delivered},${item.cancelled}`);
    });
    
    return lines.join('\n');
  }

  /**
   * Get real-time tracking statistics
   */
  async getRealTimeStats(): Promise<any> {
    try {
      const now = new Date();
      const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      
      const recentOrders = await TrackingOrder.countDocuments({
        createdAt: { $gte: last24Hours }
      });
      
      const recentDeliveries = await TrackingOrder.countDocuments({
        status: 'DELIVERED',
        updatedAt: { $gte: last24Hours }
      });
      
      const pendingOrders = await TrackingOrder.countDocuments({
        status: { $in: ['ORDER_PLACED', 'PROCESSING', 'PACKAGING', 'ON_THE_ROAD'] }
      });
      
      const recentErrors = await AuditLog.countDocuments({
        action: { $in: ['error', 'failed'] },
        timestamp: { $gte: last24Hours }
      });

      return {
        timestamp: now,
        last24Hours: {
          newOrders: recentOrders,
          deliveries: recentDeliveries,
          pendingOrders,
          errors: recentErrors
        }
      };

    } catch (error) {
      logError(error as Error, 'getRealTimeStats');
      throw error;
    }
  }

  /**
   * Get advanced analytics (Admin function)
   */
  async getAdvancedAnalytics(): Promise<any> {
    try {
      const now = new Date();
      const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      
      const period: AnalyticsPeriod = {
        startDate: last30Days,
        endDate: now,
        period: 'daily'
      };

      const basicAnalytics = await this.getTrackingAnalytics(period);
      const realTimeStats = await this.getRealTimeStats();
      
      // Additional advanced metrics
      const topCustomers = await this.getTopCustomers(period);
      const peakHours = await this.getPeakHours(period);
      const geographicDistribution = await this.getGeographicDistribution(period);
      
      return {
        ...basicAnalytics,
        realTimeStats,
        topCustomers,
        peakHours,
        geographicDistribution
      };

    } catch (error) {
      logError(error as Error, 'getAdvancedAnalytics');
      throw error;
    }
  }

  /**
   * Generate comprehensive report (Admin function)
   */
  async generateReport(
    startDate: Date,
    endDate: Date,
    format: 'json' | 'csv' = 'json'
  ): Promise<any> {
    try {
      const period: AnalyticsPeriod = {
        startDate,
        endDate,
        period: 'daily'
      };

      return await this.generateTrackingReport(period, format);

    } catch (error) {
      logError(error as Error, 'generateReport');
      throw error;
    }
  }

  /**
   * Get top customers by order volume
   */
  private async getTopCustomers(period: AnalyticsPeriod): Promise<any[]> {
    const pipeline = [
      { 
        $match: {
          createdAt: { $gte: period.startDate, $lte: period.endDate }
        }
      },
      {
        $group: {
          _id: '$customerEmail',
          totalOrders: { $sum: 1 },
          totalValue: { $sum: '$totalAmount' },
          avgOrderValue: { $avg: '$totalAmount' },
          lastOrderDate: { $max: '$createdAt' }
        }
      },
      { $sort: { totalOrders: -1 as 1 | -1 } },
      { $limit: 10 }
    ];

    return await TrackingOrder.aggregate(pipeline);
  }

  /**
   * Get peak hours for orders
   */
  private async getPeakHours(period: AnalyticsPeriod): Promise<any[]> {
    const pipeline = [
      { 
        $match: {
          createdAt: { $gte: period.startDate, $lte: period.endDate }
        }
      },
      {
        $group: {
          _id: { $hour: '$createdAt' },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { orderCount: -1 as 1 | -1 } }
    ];

    return await TrackingOrder.aggregate(pipeline);
  }

  /**
   * Get geographic distribution of orders
   */
  private async getGeographicDistribution(period: AnalyticsPeriod): Promise<any[]> {
    const pipeline = [
      { 
        $match: {
          createdAt: { $gte: period.startDate, $lte: period.endDate }
        }
      },
      {
        $group: {
          _id: '$shippingAddress.state',
          orderCount: { $sum: 1 },
          totalValue: { $sum: '$totalAmount' }
        }
      },
      { $sort: { orderCount: -1 as 1 | -1 } }
    ];

    return await TrackingOrder.aggregate(pipeline);
  }
}

export const createAnalyticsService = (): AnalyticsService => {
  return new AnalyticsService();
};
