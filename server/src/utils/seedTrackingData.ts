import { TrackingOrder } from '../models/TrackingOrder';
import { OrderStatus } from '../types/tracking';

export const seedTrackingData = async (): Promise<void> => {
  try {
    // Check if data already exists
    const existingOrders = await TrackingOrder.countDocuments();
    if (existingOrders > 0) {
      console.log('📦 Tracking data already exists, skipping seed');
      return;
    }

    // Sample tracking orders
    const sampleOrders = [
      {
        orderNumber: 'KYNA12345678',
        customerEmail: 'test@example.com',
        customerName: 'John Doe',
        totalAmount: 25000,
        status: OrderStatus.ON_THE_ROAD,
        items: [
          {
            productId: 'RING001',
            productName: 'Diamond Ring',
            quantity: 1,
            price: 25000,
            image: 'https://example.com/ring.jpg'
          }
        ],
        shippingAddress: {
          name: 'John Doe',
          line1: '123 Main Street',
          line2: 'Apt 4B',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001',
          phone: '+91-9876543210',
          email: 'test@example.com'
        },
        billingAddress: {
          name: 'John Doe',
          line1: '123 Main Street',
          line2: 'Apt 4B',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001',
          phone: '+91-9876543210',
          email: 'test@example.com'
        },
        docketNumber: '1234567890',
        estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        trackingHistory: [
          {
            status: OrderStatus.ORDER_PLACED,
            description: 'Your order has been successfully placed',
            timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
            code: 'ORDER_PLACED'
          },
          {
            status: OrderStatus.PROCESSING,
            description: 'Your order is being processed',
            timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
            code: 'PROCESSING'
          },
          {
            status: OrderStatus.PACKAGING,
            description: 'Your order is being carefully packaged',
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
            code: 'PACKAGING'
          },
          {
            status: OrderStatus.ON_THE_ROAD,
            description: 'Your order is on its way to you',
            location: 'Mumbai Hub',
            timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
            code: 'ON_THE_ROAD'
          }
        ]
      },
      {
        orderNumber: 'KYNA87654321',
        customerEmail: 'jane@example.com',
        customerName: 'Jane Smith',
        totalAmount: 15000,
        status: OrderStatus.DELIVERED,
        items: [
          {
            productId: 'EARRING001',
            productName: 'Gold Earrings',
            quantity: 1,
            price: 15000,
            image: 'https://example.com/earrings.jpg'
          }
        ],
        shippingAddress: {
          name: 'Jane Smith',
          line1: '456 Oak Avenue',
          city: 'Delhi',
          state: 'Delhi',
          pincode: '110001',
          phone: '+91-9876543211',
          email: 'jane@example.com'
        },
        billingAddress: {
          name: 'Jane Smith',
          line1: '456 Oak Avenue',
          city: 'Delhi',
          state: 'Delhi',
          pincode: '110001',
          phone: '+91-9876543211',
          email: 'jane@example.com'
        },
        docketNumber: '0987654321',
        estimatedDelivery: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        trackingHistory: [
          {
            status: OrderStatus.ORDER_PLACED,
            description: 'Your order has been successfully placed',
            timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
            code: 'ORDER_PLACED'
          },
          {
            status: OrderStatus.PROCESSING,
            description: 'Your order is being processed',
            timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
            code: 'PROCESSING'
          },
          {
            status: OrderStatus.PACKAGING,
            description: 'Your order is being carefully packaged',
            timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
            code: 'PACKAGING'
          },
          {
            status: OrderStatus.ON_THE_ROAD,
            description: 'Your order is on its way to you',
            location: 'Delhi Hub',
            timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
            code: 'ON_THE_ROAD'
          },
          {
            status: OrderStatus.DELIVERED,
            description: 'Your order has been delivered',
            location: 'Delhi',
            timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
            code: 'DELIVERED'
          }
        ]
      }
    ];

    // Insert sample orders
    await TrackingOrder.insertMany(sampleOrders);
    
    console.log('✅ Sample tracking data seeded successfully');
    console.log('📦 Sample orders created:');
    console.log('   - Order KYNA12345678 (test@example.com) - Status: ON_THE_ROAD');
    console.log('   - Order KYNA87654321 (jane@example.com) - Status: DELIVERED');
    
  } catch (error) {
    console.error('❌ Error seeding tracking data:', error);
  }
};
