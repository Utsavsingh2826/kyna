import path from "path";
import mongoose, { Types } from "mongoose";
import dotenv from "dotenv";
import OrderModel from "../models/orderModel";
import UserModel from "../models/userModel";
import { TrackingOrder } from "../models/TrackingOrder";
import { OrderStatus } from "../types/tracking";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const USER_EMAIL = "tiwariaditya1810@gmail.com";
const ORDER_PREFIX = "ADI-SEED";

type TrackingEventBlueprint = {
  status: OrderStatus;
  description: string;
  code: string;
  location: string;
};

const trackingEventsBlueprint: TrackingEventBlueprint[] = [
  {
    status: OrderStatus.ORDER_PLACED,
    description: "Order confirmed and payment received",
    code: "SCREATED",
    location: "Kyna HQ - Mumbai",
  },
  {
    status: OrderStatus.PROCESSING,
    description: "Design & quality checks in progress",
    code: "SCHECKIN",
    location: "Kyna Atelier",
  },
  {
    status: OrderStatus.PACKAGING,
    description: "Jewellery packed in tamper-proof case",
    code: "SPU",
    location: "Kyna Secure Lab",
  },
  {
    status: OrderStatus.IN_TRANSIT,
    description: "Shipment picked up by Sequel",
    code: "SLINORIN",
    location: "Mumbai Airport Hub",
  },
  {
    status: OrderStatus.ON_THE_ROAD,
    description: "Courier partner en-route to destination city",
    code: "SDELASN",
    location: "Destination City Hub",
  },
  {
    status: OrderStatus.DELIVERED,
    description: "Package delivered and signed by customer",
    code: "SDELVD",
    location: "Customer Address",
  },
];

const stageDefinitions: Array<{
  status: OrderStatus;
  orderType: "normal" | "customized";
  label: string;
}> = [
  { status: OrderStatus.ORDER_PLACED, orderType: "normal", label: "Starter (normal)" },
  { status: OrderStatus.PROCESSING, orderType: "customized", label: "Crafting (customised)" },
  { status: OrderStatus.PACKAGING, orderType: "normal", label: "Packaging stage" },
  { status: OrderStatus.IN_TRANSIT, orderType: "customized", label: "In transit (customised)" },
  { status: OrderStatus.ON_THE_ROAD, orderType: "normal", label: "Out for delivery" },
  { status: OrderStatus.DELIVERED, orderType: "customized", label: "Delivered (customised)" },
  { status: OrderStatus.CANCELLED, orderType: "normal", label: "Cancelled sample" },
];

const trackingToOrderStatus = (status: OrderStatus): "pending" | "processing" | "shipped" | "delivered" | "cancelled" | "returned" => {
  switch (status) {
    case OrderStatus.ORDER_PLACED:
      return "pending";
    case OrderStatus.PROCESSING:
    case OrderStatus.PACKAGING:
      return "processing";
    case OrderStatus.IN_TRANSIT:
    case OrderStatus.ON_THE_ROAD:
      return "shipped";
    case OrderStatus.DELIVERED:
      return "delivered";
    case OrderStatus.CANCELLED:
      return "cancelled";
    default:
      return "pending";
  }
};

const statusesWithDocket = new Set<OrderStatus>([
  OrderStatus.IN_TRANSIT,
  OrderStatus.ON_THE_ROAD,
  OrderStatus.DELIVERED,
  OrderStatus.CANCELLED,
]);

const buildTrackingHistory = (targetStatus: OrderStatus, referenceDate: Date) => {
  if (targetStatus === OrderStatus.CANCELLED) {
    const baseSlice = trackingEventsBlueprint.slice(0, 3).map((event, idx) => ({
      ...event,
      timestamp: new Date(referenceDate.getTime() + idx * 4 * 60 * 60 * 1000),
    }));

    baseSlice.push({
      status: OrderStatus.CANCELLED,
      description: "Order cancelled as requested by the customer",
      location: "Customer Support",
      code: "SCANCELLED",
      timestamp: new Date(referenceDate.getTime() + baseSlice.length * 4 * 60 * 60 * 1000),
    });

    return baseSlice;
  }

  const targetIdx = trackingEventsBlueprint.findIndex((event) => event.status === targetStatus);
  if (targetIdx === -1) {
    throw new Error(`Unsupported tracking status: ${targetStatus}`);
  }

  return trackingEventsBlueprint.slice(0, targetIdx + 1).map((event, idx) => ({
    ...event,
    timestamp: new Date(referenceDate.getTime() + idx * 4 * 60 * 60 * 1000),
  }));
};

const createOrderNumber = (idx: number, status: OrderStatus) => {
  const suffix = String(idx + 1).padStart(2, "0");
  const normalizedStatus = status.replace(/_/g, "-");
  return `${ORDER_PREFIX}-${suffix}-${normalizedStatus}`;
};

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/kyna-jewels";
  await mongoose.connect(mongoUri);
  console.log(`✅ Connected to MongoDB (${mongoUri})`);
};

const seedOrdersForUser = async () => {
  await connectDB();

  try {
    const user = await UserModel.findOne({ email: USER_EMAIL.toLowerCase() });

    if (!user) {
      throw new Error(`User with email ${USER_EMAIL} not found`);
    }

    const seedMatcher = new RegExp(`^${ORDER_PREFIX}-`, "i");
    await Promise.all([
      OrderModel.deleteMany({ user: user._id, orderNumber: seedMatcher }),
      TrackingOrder.deleteMany({ userId: user._id, orderNumber: seedMatcher }),
    ]);

    console.log("🧹 Cleaned previous seed data (if any)");

    const results: Array<{ orderNumber: string; status: OrderStatus }> = [];

    for (let idx = 0; idx < stageDefinitions.length; idx += 1) {
      const stage = stageDefinitions[idx];
      const orderNumber = createOrderNumber(idx, stage.status);
      const baseDate = new Date(Date.now() - (stageDefinitions.length - idx) * 24 * 60 * 60 * 1000);
      const subtotal = 45000 + idx * 7500;
      const gst = Math.round(subtotal * 0.03);
      const shippingCharge = stage.orderType === "customized" ? 0 : 350;
      const totalAmount = subtotal + gst + shippingCharge;

      const order = await OrderModel.create({
        user: user._id,
        orderNumber,
        orderType: stage.orderType,
        items: [
          {
            product: new Types.ObjectId(),
            productModel: "Product",
            productTitle: stage.orderType === "customized" ? "Custom Emerald Necklace" : "Classic Diamond Ring",
            quantity: 1,
            price: subtotal,
            total: subtotal,
            metalDetails: { type: "Gold", color: idx % 2 === 0 ? "Yellow" : "Rose", karat: "18K" },
            diamondDetails: { shape: "Round", size: "VS1", origin: "Lab", carat: "0.75" },
          },
        ],
        billingAddress: {
          companyName: "Kyna Jewels",
          street: "B-1901 Shah Arcade 2",
          city: "Mumbai",
          state: "Maharashtra",
          country: "India",
          zipCode: "400097",
        },
        shippingAddress: {
          companyName: "",
          street: "Sunshine Residency, Malad East",
          city: "Mumbai",
          state: "Maharashtra",
          country: "India",
          zipCode: "400097",
          sameAsBilling: true,
        },
        paymentMethod: "Credit Card",
        paymentStatus: "paid",
        orderStatus: trackingToOrderStatus(stage.status),
        statusHistory: buildTrackingHistory(stage.status, baseDate).map((historyItem) => ({
          status: trackingToOrderStatus(historyItem.status),
          date: historyItem.timestamp,
          note: historyItem.description,
        })),
        subtotal,
        gst,
        shippingCharge,
        totalAmount,
        trackingNumber: statusesWithDocket.has(stage.status) ? `DQ${(990000 + idx).toString().padStart(6, "0")}` : undefined,
        courierService: statusesWithDocket.has(stage.status) ? "Sequel247" : undefined,
        orderedAt: baseDate,
        estimatedDeliveryDate: new Date(baseDate.getTime() + 5 * 24 * 60 * 60 * 1000),
      });

      await UserModel.updateOne({ _id: user._id }, { $addToSet: { orders: order._id } });

      const trackingHistory = buildTrackingHistory(stage.status, baseDate);
      const estimatedDelivery = new Date(baseDate.getTime() + 4 * 24 * 60 * 60 * 1000);

      await TrackingOrder.create({
        userId: user._id,
        order: order._id,
        orderModel: "Order",
        orderNumber,
        customerEmail: user.email.toLowerCase(),
        status: stage.status,
        orderType: stage.orderType,
        docketNumber: statusesWithDocket.has(stage.status)
          ? `7777${(12340 + idx).toString().padStart(6, "0")}`
          : undefined,
        estimatedDelivery,
        deliveredAt: stage.status === OrderStatus.DELIVERED ? estimatedDelivery : undefined,
        trackingHistory,
      });

      results.push({ orderNumber, status: stage.status });
      console.log(`✅ Seeded order ${orderNumber} (${stage.label})`);
    }

    console.log("\n🎉 Seed complete!");
    console.table(results);
  } catch (error) {
    console.error("❌ Seed failed:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
};

seedOrdersForUser();

