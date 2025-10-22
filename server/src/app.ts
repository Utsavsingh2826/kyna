  import dotenv from "dotenv";

// Load environment variables as early as possible so modules that import config get them
dotenv.config();

import express, { Express, Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import rateLimit from "express-rate-limit";

import authRoutes from "./routes/auth";
import productRoutes from "./routes/product";
import cartRoutes from "./routes/cart";
import orderRoutes from "./routes/order";
import giftCardRoutes from "./routes/giftCard";
import wishlistRoutes from "./routes/wishlist";
import wishlistShareRoutes from "./routes/wishlistShare";
import referralRoutes from "./routes/referral";
import settingsRoutes from "./routes/settings";
import reviewRoutes from "./routes/review";
import giftingRoutes from "./routes/gifting";
import engravingRoutes from "./routes/engraving";
import paymentRoutes from "./routes/payment";
import ringsRoutes from "./routes/rings";
import promoCodeRoutes from "./routes/promoCode";
import referralCodeRoutes from "./routes/referralCode";
import trackingRoutes, { setTrackingController } from "./routes/tracking";
import adminRoutes from "./routes/admin";
import buildYourJewelryRoutes from "./routes/buildYourJewelry";
import subProductRoutes from "./routes/subProduct";
import blogRoutes from "./routes/blog";
import addressRoutes from "./routes/address";

// Import tracking services
import { TrackingController } from "./controllers/trackingController";
import { TrackingService } from "./services/TrackingService";

// Load environment variables FIRST
dotenv.config();

// Environment variable validation
// Require core variables; payment provider credentials can be either CCAvenue or Razorpay.
const requiredCoreVars = ['JWT_SECRET', 'MONGO_URI'];
const missingCore = requiredCoreVars.filter(v => !process.env[v]);
if (missingCore.length > 0) {
  console.error('❌ Missing required environment variables:', missingCore);
  console.error('Please set these variables in your .env file');
  console.error('Current .env file location:', process.cwd() + '/.env');
  process.exit(1);
}

// Payment provider check: accept either CCAvenue or Razorpay env vars
const hasCCAvenue = !!(process.env.CCAVENUE_ACCESS_CODE && process.env.CCAVENUE_WORKING_KEY);
const hasRazorpay = !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
if (!hasCCAvenue && !hasRazorpay) {
  console.warn('⚠️ No payment provider configured. Set CCAvenue or Razorpay environment variables if you need payment features.');
}

// Set default environment variables for development only
if (process.env.NODE_ENV !== 'production') {
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = "development";
}
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = "dev-secret-key-change-in-production";
}
if (!process.env.PORT) {
  process.env.PORT = "5000";
}
// if (!process.env.MONGO_URI) {
//   process.env.MONGO_URI = "mongodb://localhost:27017/kyna-jewels";
//   }
}

// Sequel247 configuration - NO DEFAULT VALUES FOR PRODUCTION
if (!process.env.SEQUEL247_TEST_ENDPOINT) {
  console.warn('⚠️ SEQUEL247_TEST_ENDPOINT not set');
}
if (!process.env.SEQUEL247_TEST_TOKEN) {
  console.warn('⚠️ SEQUEL247_TEST_TOKEN not set');
}
if (!process.env.SEQUEL247_PROD_ENDPOINT) {
  console.warn('⚠️ SEQUEL247_PROD_ENDPOINT not set');
}
if (!process.env.SEQUEL247_PROD_TOKEN) {
  console.warn('⚠️ SEQUEL247_PROD_TOKEN not set');
}
if (!process.env.SEQUEL247_STORE_CODE) {
  console.warn('⚠️ SEQUEL247_STORE_CODE not set');
}

const app: Express = express();

// Security middleware
app.use(
  helmet({
    crossOriginResourcePolicy: false,
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "http://localhost:5000", "http://localhost:5173"],
      },
    },
  })
);

// CORS configuration - Development friendly
const corsOptions = {
  origin: (origin, callback) => {
    // Allow all origins in development
    if (process.env.NODE_ENV === 'development') {
      callback(null, true);
      return;
    }
    
    // Production origins
    const allowedOrigins = [
      'https://kynajewels.com',
      'https://www.kynajewels.com',
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'http://localhost:3000',
      'http://127.0.0.1:3000'
    ];
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked for origin: ${origin}`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};


app.use(cors(corsOptions)); // ✅ Must be before routes
app.options("*", cors(corsOptions)); // ✅ Handles preflight requests

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 1000, // limit each IP to 100 requests per windowMs in production
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to all routes
app.use(limiter);

// Stricter rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    error: 'Too many authentication attempts, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// Request metrics middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const success = res.statusCode < 400;
    // Simplified: just log request duration
    if (duration > 1000) {
      console.log(`Slow request: ${req.method} ${req.path} - ${duration}ms`);
    }
  });
  
  next();
});

// Initialize tracking services
const initializeTrackingServices = () => {
  try {
    // Initialize services (simplified version without Sequel247)
    const trackingService = new TrackingService();
    const trackingController = new TrackingController(trackingService);

    // Set controller in routes
    setTrackingController(trackingController);

    console.log("✅ Tracking services initialized successfully");
  } catch (error) {
    console.error("❌ Failed to initialize tracking services:", error);
  }
};

// Initialize tracking services
initializeTrackingServices();

// Startup validation
const validateStartup = () => {
  console.log('🔍 Validating startup configuration...');
  
  // Check required environment variables
  const requiredVars = ['JWT_SECRET', 'MONGO_URI'];
  const missing = requiredVars.filter(v => !process.env[v]);
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing.join(', '));
    process.exit(1);
  }
  
  console.log('✅ Startup validation completed');
};

// Run startup validation
validateStartup();

// Test route to verify API is working
app.get("/api/test", (req: Request, res: Response) => {
  res.json({ message: "Backend API is connected successfully!" });
});

// Comprehensive health check endpoint
app.get("/api/health", async (req: Request, res: Response) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Simple health check endpoint for load balancers
app.get("/api/health/simple", async (req: Request, res: Response) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// API Documentation endpoint
app.get("/api", (req: Request, res: Response) => {
  res.json({
    success: true,
    message: "KynaJewels API Documentation",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      products: "/api/products",
      cart: "/api/cart",
      orders: "/api/orders",
      tracking: "/api/tracking",
      giftCards: "/api/gift-cards",
      wishlist: "/api/wishlist",
      referrals: "/api/referrals",
      settings: "/api/settings",
      reviews: "/api/reviews",
      gifting: "/api/gifting",
      engraving: "/api/engraving",
      payment: "/api/payment",
      rings: "/api/rings",
      buildYourJewelry: "/api/build-your-jewelry",
      subProducts: "/api/sub-products",
      blogs: "/api/blogs",
      address: "/api/address",
    },
  });
});

// API Version info endpoint
app.get("/api/version", (req: Request, res: Response) => {
  res.json({
    success: true,
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/tracking", trackingRoutes);
app.use("/api/gift-cards", giftCardRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/wishlist-share", wishlistShareRoutes);
app.use("/api/referrals", referralRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/gifting", giftingRoutes);
app.use("/api/engraving", engravingRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/rings", ringsRoutes);
app.use("/api/promo-code", promoCodeRoutes);
app.use("/api/referral-code", referralCodeRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/build-your-jewelry", buildYourJewelryRoutes);
app.use("/api/sub-products", subProductRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/address", addressRoutes);

// Home route
app.get("/", (req: Request, res: Response) => {
  res.send("API is running");
});

// System health check endpoint
app.get('/api/system/health', async (req: Request, res: Response) => {
  try {
    const { TrackingOrder } = await import('./models/TrackingOrder');
    const { OrderModel } = await import('./models/orderModel');
    
    // Check orders pending updates
    const ordersToUpdate = await TrackingOrder.countDocuments({
      docketNumber: { $exists: true, $ne: null },
      status: { $nin: ['DELIVERED', 'CANCELLED'] }
    });
    
    // Get last 5 successful updates
    const recentUpdates = await TrackingOrder.find({
      status: { $nin: ['ORDER_PLACED'] }
    })
    .sort({ updatedAt: -1 })
    .limit(5)
    .select('orderNumber status updatedAt');
    
    // Basic database connectivity check
    const totalOrders = await OrderModel.countDocuments();
    const totalTracking = await TrackingOrder.countDocuments();
    
    res.json({
      success: true,
      message: 'System is healthy',
      timestamp: new Date().toISOString(),
      cronJob: {
        status: 'running',
        frequency: 'Every 30 minutes',
        nextUpdate: 'Within 30 minutes'
      },
      database: {
        connected: true,
        totalOrders,
        totalTracking,
        ordersToUpdate
      },
      recentActivity: recentUpdates,
      systemInfo: {
        environment: process.env.NODE_ENV,
        uptime: process.uptime() + ' seconds'
      }
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      success: false,
      message: 'System health check failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

// 404 handler for undefined routes
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Global error handling middleware
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  console.error('Global error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Port setup
const PORT: number = parseInt(process.env.PORT || "5000", 10);

// Database error handling
mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});

mongoose.connection.on('disconnected', () => {
  console.error('❌ MongoDB disconnected');
  process.exit(1);
});

mongoose.connection.on('reconnected', () => {
  console.log('✅ MongoDB reconnected');
});

// Graceful shutdown handling
process.on('SIGINT', async () => {
  console.log('\n🛑 Received SIGINT. Graceful shutdown...');
  await mongoose.connection.close();
  console.log('✅ MongoDB connection closed');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Received SIGTERM. Graceful shutdown...');
  await mongoose.connection.close();
  console.log('✅ MongoDB connection closed');
  process.exit(0);
});

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI || "mongodb://localhost:27017/kyna-jewels")
  .then(async () => {
    console.log(process.env.Mongo_URI);
    console.log("✅ MongoDB connected");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📚 API Documentation: http://localhost:${PORT}/api`);
      console.log(
        `🔍 Tracking Health: http://localhost:${PORT}/api/tracking/health`
      );
    });
  })
  .catch((err: Error) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

export default app;
