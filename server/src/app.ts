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
import giftCardRoutes from "./routes/giftCard";
import wishlistRoutes from "./routes/wishlist";
import wishlistShareRoutes from "./routes/wishlistShare";
import settingsRoutes from "./routes/settings";
import reviewRoutes from "./routes/review";
import giftingRoutes from "./routes/gifting";
import engravingRoutes from "./routes/engraving";
import ringsRoutes from "./routes/rings";
import adminRoutes from "./routes/admin";
import buildYourJewelryRoutes from "./routes/buildYourJewelry";
import subProductRoutes from "./routes/subProduct";
import blogRoutes from "./routes/blog";
import addressRoutes from "./routes/address";

import { startCronJobs } from './services/cronService';
import { errorHandler, notFoundHandler, asyncHandler } from './middleware/errorHandler';
import { healthService } from './services/healthService';
import { validateProductionConfig } from './config/production';
import { dynamicSizeLimit } from './middleware/requestLimits';
import { apiVersioning, getVersionInfo, deprecationWarning } from './middleware/apiVersioning';
import { monitoringMiddleware } from './services/advancedMonitoring';
import { initializeRedis, closeRedisConnection } from './services/sessionService';

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

// Apply request size limits
app.use(dynamicSizeLimit);

// Apply API versioning
app.use('/api', apiVersioning);

// Apply monitoring middleware
app.use(monitoringMiddleware);

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
    healthService.recordRequest(success, duration);
  });
  
  next();
});


// Initialize Redis (optional)
if (process.env.REDIS_HOST) {
  try {
    initializeRedis();
    console.log('✅ Redis initialized for session storage');
  } catch (error) {
    console.warn('⚠️ Redis not available, using memory storage');
  }
}

// Startup validation
const validateStartup = () => {
  console.log('🔍 Validating startup configuration...');
  
  // Use production config validation
  const validation = validateProductionConfig();
  
  if (!validation.isValid) {
    console.error('❌ Configuration validation failed:');
    validation.errors.forEach(error => console.error(`  - ${error}`));
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
app.get("/api/health", asyncHandler(async (req: Request, res: Response) => {
  const health = await healthService.getHealthStatus();
  res.json(health);
}));

// Simple health check endpoint for load balancers
app.get("/api/health/simple", asyncHandler(async (req: Request, res: Response) => {
  const health = await healthService.getSimpleHealth();
  res.json(health);
}));

// API Documentation endpoint
app.get("/api", (req: Request, res: Response) => {
  res.json({
    success: true,
    message: "KynaJewels API Documentation",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      products: "/api/products",
      giftCards: "/api/gift-cards",
      wishlist: "/api/wishlist",
      settings: "/api/settings",
      reviews: "/api/reviews",
      gifting: "/api/gifting",
      engraving: "/api/engraving",
      rings: "/api/rings",
      buildYourJewelry: "/api/build-your-jewelry",
      subProducts: "/api/sub-products",
      blogs: "/api/blogs",
      address: "/api/address",
    },
  });
});

// API Version info endpoint
app.get("/api/version", getVersionInfo);

// Advanced monitoring endpoints
app.get("/api/monitoring/health", asyncHandler(async (req: Request, res: Response) => {
  const { advancedMonitoring } = await import('./services/advancedMonitoring');
  const health = await advancedMonitoring.getSystemHealth();
  res.json(health);
}));

app.get("/api/monitoring/metrics", asyncHandler(async (req: Request, res: Response) => {
  const { advancedMonitoring } = await import('./services/advancedMonitoring');
  const metrics = advancedMonitoring.getMetrics();
  res.json({ success: true, metrics });
}));

app.get("/api/monitoring/alerts", asyncHandler(async (req: Request, res: Response) => {
  const { advancedMonitoring } = await import('./services/advancedMonitoring');
  const alerts = advancedMonitoring.getAlerts();
  res.json({ success: true, alerts });
}));

app.get("/api/monitoring/trends", asyncHandler(async (req: Request, res: Response) => {
  const { advancedMonitoring } = await import('./services/advancedMonitoring');
  const hours = parseInt(req.query.hours as string) || 1;
  const trends = advancedMonitoring.getPerformanceTrends(hours);
  res.json({ success: true, trends });
}));

// Routes with deprecation warnings
app.use("/api/auth", deprecationWarning, authRoutes);
app.use("/api/products", deprecationWarning, productRoutes);
app.use("/api/gift-cards", deprecationWarning, giftCardRoutes);
app.use("/api/wishlist", deprecationWarning, wishlistRoutes);
app.use("/api/wishlist-share", deprecationWarning, wishlistShareRoutes);
app.use("/api/settings", deprecationWarning, settingsRoutes);
app.use("/api/reviews", deprecationWarning, reviewRoutes);
app.use("/api/gifting", deprecationWarning, giftingRoutes);
app.use("/api/engraving", deprecationWarning, engravingRoutes);
app.use("/api/rings", deprecationWarning, ringsRoutes);
app.use("/api/admin", deprecationWarning, adminRoutes);
app.use("/api/build-your-jewelry", deprecationWarning, buildYourJewelryRoutes);
app.use("/api/sub-products", deprecationWarning, subProductRoutes);
app.use("/api/blogs", deprecationWarning, blogRoutes);
app.use("/api/address", deprecationWarning, addressRoutes);

// Home route
app.get("/", (req: Request, res: Response) => {
  res.send("API is running");
});


// 404 handler for undefined routes
app.use('*', notFoundHandler);

// Global error handling middleware
app.use(errorHandler);

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
  await closeRedisConnection();
  console.log('✅ MongoDB connection closed');
  console.log('✅ Redis connection closed');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Received SIGTERM. Graceful shutdown...');
  await mongoose.connection.close();
  await closeRedisConnection();
  console.log('✅ MongoDB connection closed');
  console.log('✅ Redis connection closed');
  process.exit(0);
});

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI || "mongodb://localhost:27017/kyna-jewels")
  .then(async () => {
    console.log(process.env.Mongo_URI);
    console.log("✅ MongoDB connected");

    // Seed sample tracking data in development
    

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
