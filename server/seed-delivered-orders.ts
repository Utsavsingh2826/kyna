/**
 * Seed Delivered Orders Script (TypeScript version)
 * Creates dummy delivered orders in both Order and TrackingOrder collections
 * 
 * Usage: npx ts-node seed-delivered-orders.ts
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { UserModel } from './src/models/userModel';
import { OrderModel } from './src/models/orderModel';
import { TrackingOrder } from './src/models/TrackingOrder';

dotenv.config();

// MongoDB connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/kyna-jewels';

interface DeliveredOrderData {
  email: string;
  customerName: string;
  orderNumber: string;
  totalAmount: number;
  productName: string;
  docketNumber: string;
  address: {
    name: string;
    street: string;
    line2?: string;
    city: string;
    state: string;
    zipCode: string;
    phone: string;
  };
}

const deliveredOrders: DeliveredOrderData[] = [
  {
    email: 'tiwariaditya1810@gmail.com',
    customerName: 'Aditya Tiwari',
    orderNumber: 'KYNA-DEL001',
    totalAmount: 45000,
    productName: 'Diamond Solitaire Ring',
    docketNumber: 'DKT1234567890',
    address: {
      name: 'Aditya Tiwari',
      street: '123 MG Road',
      line2: 'Near Central Mall',
      city: 'Mumbai',
      state: 'Maharashtra',
      zipCode: '400001',
      phone: '9876543210'
    }
  },
  {
    email: 'tiwariaditya1810@gmail.com',
    customerName: 'Aditya Tiwari',
    orderNumber: 'KYNA-DEL002',
    totalAmount: 78500,
    productName: 'Gold Necklace Set',
    docketNumber: 'DKT2345678901',
    address: {
      name: 'Aditya Tiwari',
      street: '456 Park Avenue',
      line2: 'Apartment 5B',
      city: 'Delhi',
      state: 'Delhi',
      zipCode: '110001',
      phone: '9876543210'
    }
  },
  {
    email: 'addytiwari1810@gmail.com',
    customerName: 'Addy Tiwari',
    orderNumber: 'KYNA-DEL003',
    totalAmount: 125000,
    productName: 'Platinum Wedding Band Set',
    docketNumber: 'DKT3456789012',
    address: {
      name: 'Addy Tiwari',
      street: '789 Lake View',
      line2: 'Tower B',
      city: 'Bangalore',
      state: 'Karnataka',
      zipCode: '560001',
      phone: '8765432109'
    }
  },
  {
    email: 'pranaytiwariii@gmail.com',
    customerName: 'Pranay Tiwari',
    orderNumber: 'KYNA-DEL004',
    totalAmount: 92000,
    productName: 'Emerald Pendant',
    docketNumber: 'DKT4567890123',
    address: {
      name: 'Pranay Tiwari',
      street: '321 Beach Road',
      line2: '',
      city: 'Chennai',
      state: 'Tamil Nadu',
      zipCode: '600001',
      phone: '7654321098'
    }
  }
];

async function seedDeliveredOrders() {
  try {
    console.log('\n🌱 Starting seeding process...\n');
    
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    let createdCount = 0;
    let skippedCount = 0;

    for (const orderData of deliveredOrders) {
      console.log(`📦 Processing order: ${orderData.orderNumber}`);

      // Find user
      const user = await UserModel.findOne({ email: orderData.email.toLowerCase() });
      if (!user) {
        console.log(`   ⚠️  User not found: ${orderData.email} - Skipping\n`);
        skippedCount++;
        continue;
      }

      // Check if order already exists
      const existingOrder = await OrderModel.findOne({ orderNumber: orderData.orderNumber });
      if (existingOrder) {
        console.log(`   ℹ️  Order already exists - Skipping\n`);
        skippedCount++;
        continue;
      }

      // Create Order
      const order = new OrderModel({
        user: user._id,
        orderNumber: orderData.orderNumber,
        orderType: 'normal',
        items: [{
          product: new mongoose.Types.ObjectId(), // Dummy product ID
          productModel: 'Ring',
          quantity: 1,
          price: orderData.totalAmount,
          total: orderData.totalAmount
        }],
        billingAddress: {
          street: orderData.address.street,
          city: orderData.address.city,
          state: orderData.address.state,
          country: 'India',
          zipCode: orderData.address.zipCode
        },
        shippingAddress: {
          street: orderData.address.street,
          city: orderData.address.city,
          state: orderData.address.state,
          country: 'India',
          zipCode: orderData.address.zipCode,
          sameAsBilling: true
        },
        paymentMethod: 'UPI',
        paymentStatus: 'paid',
        orderStatus: 'delivered',
        subtotal: orderData.totalAmount * 0.85,
        gst: orderData.totalAmount * 0.15,
        shippingCharge: 0,
        totalAmount: orderData.totalAmount,
        orderedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        deliveredAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        estimatedDeliveryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) // 2 days from now
      });

      await order.save();
      console.log(`   ✅ Order created: ${order.orderNumber}`);

      // Create TrackingOrder
      const trackingOrder = new TrackingOrder({
        userId: user._id,
        order: order._id,
        orderNumber: orderData.orderNumber,
        customerEmail: orderData.email.toLowerCase(),
        status: 'DELIVERED',
        orderType: 'normal',
        docketNumber: orderData.docketNumber,
        deliveredAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        trackingHistory: [
          {
            status: 'ORDER_PLACED',
            description: 'Order placed successfully',
            timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            code: 'ORDER_PLACED'
          },
          {
            status: 'PROCESSING',
            description: 'Order is being processed',
            location: 'Mumbai Warehouse',
            timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
            code: 'PROCESSING'
          },
          {
            status: 'PACKAGING',
            description: 'Order is being packed',
            location: 'Mumbai Warehouse',
            timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            code: 'PACKAGING'
          },
          {
            status: 'IN_TRANSIT',
            description: 'Shipment in transit',
            location: orderData.address.city,
            timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            code: 'IN_TRANSIT'
          },
          {
            status: 'ON_THE_ROAD',
            description: 'Out for delivery',
            location: orderData.address.city,
            timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            code: 'ON_THE_ROAD'
          },
          {
            status: 'DELIVERED',
            description: 'Delivered successfully',
            location: orderData.address.city,
            timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            code: 'DELIVERED'
          }
        ]
      });

      await trackingOrder.save();
      console.log(`   ✅ TrackingOrder created with docket: ${trackingOrder.docketNumber}\n`);

      createdCount++;
    }

    console.log('\n✨ Seeding completed!\n');
    console.log(`📊 Summary:`);
    console.log(`   ✅ Created: ${createdCount} orders`);
    console.log(`   ⏭️  Skipped: ${skippedCount} orders`);
    console.log(`\n🎉 You can now test the Return Order feature with these delivered orders!\n`);

  } catch (error) {
    console.error('\n❌ Error seeding data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB\n');
  }
}

// Run the seeding
seedDeliveredOrders();

