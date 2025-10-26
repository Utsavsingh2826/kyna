import cron from 'node-cron';
import { sendReminderEmails } from '../controllers/referralController';
import { TrackingOrder } from '../models/TrackingOrder';
import { TrackingService } from './TrackingService';

// Schedule reminder emails to run daily at 10:00 AM
export const startCronJobs = () => {
  console.log('Starting cron jobs...');
  
  // Send reminder emails daily at 10:00 AM
  cron.schedule('0 10 * * *', async () => {
    console.log('Running daily reminder email job...');
    try {
      const result = await sendReminderEmails();
      console.log('Reminder email job completed:', result);
    } catch (error) {
      console.error('Error in reminder email cron job:', error);
    }
  }, {
    timezone: 'UTC'
  });

  console.log('Cron jobs started successfully');
};

// Start tracking updates cron job
export const startTrackingCronJob = (trackingService: TrackingService) => {
  console.log('Starting tracking updates cron job...');
  
  // Update tracking every 30 minutes
  cron.schedule('*/30 * * * *', async () => {
    console.log('🔄 Running automatic tracking update job...');
    
    try {
      // Get all orders with docket numbers that are not delivered or cancelled
      const orders = await TrackingOrder.find({ 
        docketNumber: { $exists: true, $ne: null },
        status: { $nin: ['DELIVERED', 'CANCELLED'] }
      });
      
      if (orders.length === 0) {
        console.log('📦 No orders to update');
        return;
      }
      
      console.log(`📦 Found ${orders.length} orders to check for updates`);
      
      let updatedCount = 0;
      let errorCount = 0;
      
      // Update each order
      for (const order of orders) {
        try {
          const previousStatus = order.status;
          await trackingService.updateTrackingFromSequel(order);
          
          // Check if status actually changed
          await order.save();
          const newStatus = order.status;
          
          if (previousStatus !== newStatus) {
            console.log(`✅ Order ${order.orderNumber}: ${previousStatus} → ${newStatus}`);
            
            // Sync status back to original order with previous status for notifications
            await trackingService.syncOrderStatus(order, previousStatus);
            
            updatedCount++;
          }
        } catch (error) {
          console.error(`❌ Failed to update order ${order.orderNumber}:`, (error as Error).message);
          errorCount++;
        }
      }
      
      console.log(`🎉 Tracking update completed: ${updatedCount} orders updated, ${errorCount} errors`);
      
    } catch (error) {
      console.error('❌ Tracking cron job error:', error);
    }
  }, {
    timezone: 'UTC'
  });
  
  console.log('✅ Tracking updates cron job started (every 30 minutes)');
};

// Manual function to run tracking updates (for testing)
export const runTrackingUpdateJob = async (trackingService: TrackingService) => {
  console.log('🔄 Manually running tracking update job...');
  
  try {
    const orders = await TrackingOrder.find({ 
      docketNumber: { $exists: true, $ne: null },
      status: { $nin: ['DELIVERED', 'CANCELLED'] }
    });
    
    if (orders.length === 0) {
      console.log('📦 No orders to update');
      return { success: true, message: 'No orders to update' };
    }
    
    console.log(`📦 Found ${orders.length} orders to check for updates`);
    
    let updatedCount = 0;
    let errorCount = 0;
    
    for (const order of orders) {
      try {
        const previousStatus = order.status;
        await trackingService.updateTrackingFromSequel(order);
        await order.save();
        
        const newStatus = order.status;
        if (previousStatus !== newStatus) {
          console.log(`✅ Order ${order.orderNumber}: ${previousStatus} → ${newStatus}`);
          
          // Sync status back to original order with previous status for notifications
          await trackingService.syncOrderStatus(order, previousStatus);
          
          updatedCount++;
        }
      } catch (error) {
        console.error(`❌ Failed to update order ${order.orderNumber}:`, (error as Error).message);
        errorCount++;
      }
    }
    
    const result = {
      success: true,
      message: `Updated ${updatedCount} orders, ${errorCount} errors`,
      updatedCount,
      errorCount,
      totalOrders: orders.length
    };
    
    console.log('🎉 Manual tracking update completed:', result);
    return result;
    
  } catch (error) {
    console.error('❌ Error in manual tracking update job:', error);
    throw error;
  }
};

// Manual function to run reminder emails (for testing)
export const runReminderJob = async () => {
  console.log('Manually running reminder email job...');
  try {
    const result = await sendReminderEmails();
    console.log('Manual reminder email job completed:', result);
    return result;
  } catch (error) {
    console.error('Error in manual reminder email job:', error);
    throw error;
  }
};
