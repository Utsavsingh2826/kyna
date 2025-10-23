# 📦 Sequel247 Integration Guide for Kyna Jewels

## ✅ Implementation Complete!

All changes have been made to `server/src/utils/sequelApi.ts`

---

## 🔧 Step 1: Environment Variables

Add these to your `server/.env` file:

```env
# Sequel247 Configuration
SEQUEL_BASE_URL=https://your-sequel-endpoint.com
SEQUEL_API_TOKEN=b228a27399f07927985d57c0f7d94ce8

# Kyna Jewels Pickup Address (Fixed for all shipments)
SEQUEL_PICKUP_ADDRESS_CODE=400097
SEQUEL_BUSINESS_NAME=Kyna Jewels
SEQUEL_ADDRESS_LINE1=B1901 Shah arcade 2
SEQUEL_ADDRESS_LINE2=Rani sati marg, Malad east
SEQUEL_PINCODE=400097
SEQUEL_RECEIVER_NAME=Kyna Jewels Admin
SEQUEL_RECEIVER_PHONE=8928610682
SEQUEL_RECEIVER_EMAIL=enquiries@kynajewels.com
SEQUEL_GST_IN=22AAAAA0000A1Z5
```

---

## 🚀 Step 2: Usage in Order Controller

### **Simple Example - Using `createKynaShipment`** (Recommended)

```typescript
import { createKynaShipment, checkServiceability } from '../utils/sequelApi';
import { OrderModel } from '../models/orderModel';

export const createOrder = async (req: Request, res: Response) => {
  try {
    // 1. Create order in database
    const order = await OrderModel.create({
      user: req.user._id,
      items: req.body.items,
      shippingAddress: req.body.shippingAddress,
      totalAmount: req.body.totalAmount,
      // ... other order fields
    });

    // 2. Check if delivery is available to customer's pincode
    const serviceCheck = await checkServiceability(
      order.shippingAddress.zipCode
    );

    if (serviceCheck.status !== 'true') {
      return res.status(400).json({
        success: false,
        error: 'Delivery not available to this pincode',
        pincode: order.shippingAddress.zipCode
      });
    }

    // 3. Create shipment with Sequel247 - SUPER SIMPLE! ✅
    const shipment = await createKynaShipment({
      orderNumber: order.orderNumber,
      customerName: order.shippingAddress.name || order.user.name,
      customerAddress: order.shippingAddress.street,
      customerAddress2: order.shippingAddress.line2,
      customerPincode: order.shippingAddress.zipCode,
      customerPhone: order.shippingAddress.phone || order.user.phone,
      customerEmail: order.user.email,
      netWeight: 50,  // Calculate based on products
      grossWeight: 75, // Calculate based on products + packaging
      orderValue: order.totalAmount,
      codAmount: order.paymentMethod === 'COD' ? order.totalAmount : 0,
      remark: 'Jewelry - Handle with care'
    });

    // 4. Save docket number if shipment created successfully
    if (shipment.status === 'true' && shipment.data) {
      order.trackingNumber = shipment.data.docketNumber;
      order.orderStatus = 'processing';
      await order.save();

      console.log('✅ Shipment created:', shipment.data.docketNumber);
      console.log('📅 Estimated delivery:', shipment.data.estimated_delivery);
    } else {
      console.error('❌ Shipment creation failed:', shipment.message);
    }

    res.json({
      success: true,
      order,
      tracking: {
        docketNumber: shipment.data?.docketNumber,
        estimatedDelivery: shipment.data?.estimated_delivery
      }
    });

  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create order'
    });
  }
};
```

---

## 📋 Step 3: Calculate Weight from Products

Add this helper function to calculate jewelry weight:

```typescript
// Helper function to calculate total weight
const calculateJewelryWeight = (items: any[]): { net: number; gross: number } => {
  // Estimate based on product types
  let netWeight = 0;
  
  items.forEach(item => {
    // Typical jewelry weights in grams
    const weights: Record<string, number> = {
      'Ring': 5,
      'Pendant': 3,
      'Earring': 4,
      'Bracelet': 8,
      'Necklace': 15
    };
    
    const itemWeight = weights[item.productModel] || 5;
    netWeight += itemWeight * item.quantity;
  });
  
  // Add 50% for packaging (box, padding, etc.)
  const grossWeight = Math.ceil(netWeight * 1.5);
  
  return { net: netWeight, gross: grossWeight };
};

// Usage in createOrder
const { net, gross } = calculateJewelryWeight(order.items);

const shipment = await createKynaShipment({
  // ... other params
  netWeight: net,
  grossWeight: gross,
  // ...
});
```

---

## 🔍 Step 4: Check Serviceability During Checkout

```typescript
import { checkServiceability, calculateEDD } from '../utils/sequelApi';

export const checkDeliveryAvailability = async (req: Request, res: Response) => {
  try {
    const { pincode } = req.body;

    // Check if delivery is available
    const serviceCheck = await checkServiceability(pincode);

    if (serviceCheck.status !== 'true') {
      return res.json({
        serviceable: false,
        message: 'Delivery not available to this pincode'
      });
    }

    // Calculate estimated delivery date
    const eddResult = await calculateEDD(
      '400097', // Your warehouse pincode (from env)
      pincode,  // Customer pincode
      new Date().toISOString().split('T')[0] // Today's date YYYY-MM-DD
    );

    res.json({
      serviceable: true,
      deliveryInfo: serviceCheck.data,
      estimatedDelivery: eddResult.data?.estimated_delivery,
      estimatedDay: eddResult.data?.estimated_day
    });

  } catch (error) {
    res.status(500).json({ error: 'Failed to check serviceability' });
  }
};
```

---

## 📊 Available Functions

### **Kyna Jewels Specific (Simplified)**
- ✅ `createKynaShipment()` - Create shipment with auto-filled pickup address
- ✅ `getKynaPickupAddress()` - Get your warehouse address

### **Direct API Calls**
- ✅ `createAddress()` - Register new warehouse address
- ✅ `checkServiceability()` - Check if pincode is deliverable
- ✅ `calculateEDD()` - Get estimated delivery date
- ✅ `createSequelShipment()` - Full control shipment creation
- ✅ `trackSingle()` - Track one shipment
- ✅ `trackMultiple()` - Track multiple shipments
- ✅ `cancelShipment()` - Cancel before pickup
- ✅ `podDownload()` - Download proof of delivery

### **Helper Functions**
- ✅ `getStatusDescription()` - Convert status code to text
- ✅ `isDelivered()` - Check if delivered
- ✅ `isCancelled()` - Check if cancelled
- ✅ `formatDateForSequel()` - Format dates for API
- ✅ `getTomorrowDate()` - Get tomorrow's date

---

## 🎯 What's Auto-Generated

When using `createKynaShipment()`:
1. ✅ **Pickup Address** - Auto-filled from `.env`
2. ✅ **Box Details** - Auto-generated with standard jewelry box dimensions
3. ✅ **Invoice Number** - Auto-generated as `INV-{orderNumber}`
4. ✅ **Pickup Time** - Defaults to `10:00-11:00`
5. ✅ **Pickup Date** - Defaults to `Tomorrow`

---

## 🔄 Integration Flow

```
Customer Places Order
        ↓
1. Check Serviceability (checkServiceability)
        ↓
2. Create Order in Database
        ↓
3. Create Shipment (createKynaShipment)
        ↓
4. Save Docket Number
        ↓
5. Send Confirmation Email
```

---

## 🎉 You're Done!

The integration is complete. Just add the environment variables and use `createKynaShipment()` in your order controller!

