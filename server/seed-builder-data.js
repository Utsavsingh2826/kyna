const mongoose = require('mongoose');
const Product = require('./src/models/productModel.ts').default;

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/kyna-jewels', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Bracelet builder data based on hardcoded structure
const braceletBuilderData = [
  // PAPPER CLIP Category
  {
    sku: "BR1-RD-025-WG-TRV-BUILDER",
    variant: "BR1",
    title: "Paper Clip Style Bracelet",
    description: "Elegant paper clip style bracelet with round diamonds",
    category: "BUILD_YOUR_JEWELRY",
    subCategory: "Bracelet",
    price: 5224,
    diamondShape: "RD",
    diamondSize: 0.25,
    metal: "WG",
    builderImage: "BR1-RD-025-WG-TRV",
    stylingName: "PAPPER CLIP",
    isGiftingAvailable: false,
    isEngraving: true,
    images: {
      main: "/build_yr_own/BR1-RD-025-WG-TRV.png",
      sub: []
    }
  },
  // TENNIS BRACELET Category
  {
    sku: "BR2-EM-025-WG-TRV-BUILDER",
    variant: "BR2",
    title: "Tennis Bracelet - Emerald Cut",
    description: "Classic tennis bracelet with emerald cut diamonds",
    category: "BUILD_YOUR_JEWELRY",
    subCategory: "Bracelet",
    price: 5224,
    diamondShape: "EM",
    diamondSize: 0.25,
    metal: "WG",
    builderImage: "BR2-EM-025-WG-TRV",
    stylingName: "TENNIS BRACELET",
    isGiftingAvailable: false,
    isEngraving: true,
    images: {
      main: "/build_yr_own/BR2-EM-025-WG-TRV.png",
      sub: []
    }
  },
  {
    sku: "BR3-EM-025-WG-TRV-BUILDER",
    variant: "BR3",
    title: "Tennis Bracelet - Emerald Cut Variation",
    description: "Tennis bracelet with emerald cut diamonds - variation style",
    category: "BUILD_YOUR_JEWELRY",
    subCategory: "Bracelet",
    price: 5224,
    diamondShape: "EM",
    diamondSize: 0.25,
    metal: "WG",
    builderImage: "BR3-EM-025-WG-TRV",
    stylingName: "TENNIS BRACELET",
    isGiftingAvailable: false,
    isEngraving: true,
    images: {
      main: "/build_yr_own/BR3-EM-025-WG-TRV.png",
      sub: []
    }
  },
  {
    sku: "BR4-RD-025-WG-TRV-BUILDER",
    variant: "BR4",
    title: "Tennis Bracelet - Round Diamond",
    description: "Classic tennis bracelet with round brilliant diamonds",
    category: "BUILD_YOUR_JEWELRY",
    subCategory: "Bracelet",
    price: 5224,
    diamondShape: "RD",
    diamondSize: 0.25,
    metal: "WG",
    builderImage: "BR4-RD-025-WG-TRV",
    stylingName: "TENNIS BRACELET",
    isGiftingAvailable: false,
    isEngraving: true,
    images: {
      main: "/build_yr_own/BR4-RD-025-WG-TRV.png",
      sub: []
    }
  },
  {
    sku: "BR5-OV-025-WG-TRV-BUILDER",
    variant: "BR5",
    title: "Tennis Bracelet - Oval Diamond",
    description: "Elegant tennis bracelet with oval diamonds",
    category: "BUILD_YOUR_JEWELRY",
    subCategory: "Bracelet",
    price: 5224,
    diamondShape: "OV",
    diamondSize: 0.25,
    metal: "WG",
    builderImage: "BR5-OV-025-WG-TRV",
    stylingName: "TENNIS BRACELET",
    isGiftingAvailable: false,
    isEngraving: true,
    images: {
      main: "/build_yr_own/BR5-OV-025-WG-TRV.png",
      sub: []
    }
  },
  {
    sku: "BR6-PRN-025-WG-TRV-BUILDER",
    variant: "BR6",
    title: "Tennis Bracelet - Princess Cut",
    description: "Modern tennis bracelet with princess cut diamonds",
    category: "BUILD_YOUR_JEWELRY",
    subCategory: "Bracelet",
    price: 5224,
    diamondShape: "PRN",
    diamondSize: 0.25,
    metal: "WG",
    builderImage: "BR6-PRN-025-WG-TRV",
    stylingName: "TENNIS BRACELET",
    isGiftingAvailable: false,
    isEngraving: true,
    images: {
      main: "/build_yr_own/BR6-PRN-025-WG-TRV.png",
      sub: []
    }
  },
  {
    sku: "BR7-MQ-025-WG-TRV-BUILDER",
    variant: "BR7",
    title: "Tennis Bracelet - Marquise Diamond",
    description: "Sophisticated tennis bracelet with marquise diamonds",
    category: "BUILD_YOUR_JEWELRY",
    subCategory: "Bracelet",
    price: 5224,
    diamondShape: "MQ",
    diamondSize: 0.25,
    metal: "WG",
    builderImage: "BR7-MQ-025-WG-TRV",
    stylingName: "TENNIS BRACELET",
    isGiftingAvailable: false,
    isEngraving: true,
    images: {
      main: "/build_yr_own/BR7-MQ-025-WG-TRV.png",
      sub: []
    }
  },
  {
    sku: "BR18-OV-025-WG-TRV-BUILDER",
    variant: "BR18",
    title: "Tennis Bracelet - Oval Design 18",
    description: "Premium tennis bracelet with oval diamonds",
    category: "BUILD_YOUR_JEWELRY",
    subCategory: "Bracelet",
    price: 5224,
    diamondShape: "OV",
    diamondSize: 0.25,
    metal: "WG",
    builderImage: "BR18-OV-025-WG-TRV",
    stylingName: "TENNIS BRACELET",
    isGiftingAvailable: false,
    isEngraving: true,
    images: {
      main: "/build_yr_own/BR18-OV-025-WG-TRV.png",
      sub: []
    }
  },
  {
    sku: "BR19-RD-025-WG-TRV-BUILDER",
    variant: "BR19",
    title: "Tennis Bracelet - Round Design 19",
    description: "Classic tennis bracelet with round diamonds - design 19",
    category: "BUILD_YOUR_JEWELRY",
    subCategory: "Bracelet",
    price: 5224,
    diamondShape: "RD",
    diamondSize: 0.25,
    metal: "WG",
    builderImage: "BR19-RD-025-WG-TRV",
    stylingName: "TENNIS BRACELET",
    isGiftingAvailable: false,
    isEngraving: true,
    images: {
      main: "/build_yr_own/BR19-RD-025-WG-TRV.png",
      sub: []
    }
  },
  {
    sku: "BR60-OV-025-WG-TRV-BUILDER",
    variant: "BR60",
    title: "Tennis Bracelet - Oval Design 60",
    description: "Luxury tennis bracelet with oval diamonds - design 60",
    category: "BUILD_YOUR_JEWELRY",
    subCategory: "Bracelet",
    price: 5224,
    diamondShape: "OV",
    diamondSize: 0.25,
    metal: "WG",
    builderImage: "BR60-OV-025-WG-TRV",
    stylingName: "TENNIS BRACELET",
    isGiftingAvailable: false,
    isEngraving: true,
    images: {
      main: "/build_yr_own/BR60-OV-025-WG-TRV.png",
      sub: []
    }
  },
  // MULTI SHAPE Category
  {
    sku: "BR8-MIX-025-WG-TRV-BUILDER",
    variant: "BR8",
    title: "Multi Shape Bracelet - Mixed Cut",
    description: "Unique bracelet with mixed diamond shapes",
    category: "BUILD_YOUR_JEWELRY",
    subCategory: "Bracelet",
    price: 5224,
    diamondShape: "MIX",
    diamondSize: 0.25,
    metal: "WG",
    builderImage: "BR8-MIX-025-WG-TRV",
    stylingName: "MULTI SHAPE",
    isGiftingAvailable: false,
    isEngraving: true,
    images: {
      main: "/build_yr_own/BR8-MIX-025-WG-TRV.png",
      sub: []
    }
  },
  {
    sku: "BR15-EMMQ-025-WG-TRV-BUILDER",
    variant: "BR15",
    title: "Multi Shape Bracelet - Emerald Marquise",
    description: "Designer bracelet with emerald and marquise diamonds",
    category: "BUILD_YOUR_JEWELRY",
    subCategory: "Bracelet",
    price: 5224,
    diamondShape: "EMMQ",
    diamondSize: 0.25,
    metal: "WG",
    builderImage: "BR15-EMMQ-025-WG-TRV",
    stylingName: "MULTI SHAPE",
    isGiftingAvailable: false,
    isEngraving: true,
    images: {
      main: "/build_yr_own/BR15-EMMQ-025-WG-TRV.png",
      sub: []
    }
  }
];

// Earring builder data based on hardcoded structure from BuildYourJewelleryEarings.tsx
const earringBuilderData = [
  // DANGLE EARINGS Category
  {
    sku: "ER31-RD-100-WG-BV-BUILDER",
    variant: "ER31",
    title: "Dangle Earrings - Round Diamond",
    description: "Elegant dangle earrings with round diamonds",
    category: "BUILD_YOUR_JEWELRY",
    subCategory: "Earring",
    price: 5224,
    diamondShape: "RD",
    diamondSize: 1.00,
    metal: "WG",
    builderImage: "ER31-RD-100-WG-BV",
    stylingName: "DANGLE EARINGS",
    isGiftingAvailable: false,
    isEngraving: true,
    images: {
      main: "/build_yr_own/ER31-RD-100-WG-BV.png",
      sub: []
    }
  },
  {
    sku: "ER58-RD-100-WG-BV-BUILDER",
    variant: "ER58",
    title: "Dangle Earrings - Round Design 58",
    description: "Stylish dangle earrings with round diamonds",
    category: "BUILD_YOUR_JEWELRY",
    subCategory: "Earring",
    price: 5224,
    diamondShape: "RD",
    diamondSize: 1.00,
    metal: "WG",
    builderImage: "ER58-RD-100-WG-BV",
    stylingName: "DANGLE EARINGS",
    isGiftingAvailable: false,
    isEngraving: true,
    images: {
      main: "/build_yr_own/ER58-RD-100-WG-BV.png",
      sub: []
    }
  },
  {
    sku: "ER61-RD-100-WG-BV-BUILDER",
    variant: "ER61",
    title: "Dangle Earrings - Round Design 61",
    description: "Premium dangle earrings with round diamonds",
    category: "BUILD_YOUR_JEWELRY",
    subCategory: "Earring",
    price: 5224,
    diamondShape: "RD",
    diamondSize: 1.00,
    metal: "WG",
    builderImage: "ER61-RD-100-WG-BV",
    stylingName: "DANGLE EARINGS",
    isGiftingAvailable: false,
    isEngraving: true,
    images: {
      main: "/build_yr_own/ER61-RD-100-WG-BV.png",
      sub: []
    }
  },
  {
    sku: "ER96-PRS-100-WG-BV-BUILDER",
    variant: "ER96",
    title: "Dangle Earrings - Princess Cut",
    description: "Luxury dangle earrings with princess cut diamonds",
    category: "BUILD_YOUR_JEWELRY",
    subCategory: "Earring",
    price: 5224,
    diamondShape: "PRS",
    diamondSize: 1.00,
    metal: "WG",
    builderImage: "ER96-PRS-100-WG-BV",
    stylingName: "DANGLE EARINGS",
    isGiftingAvailable: false,
    isEngraving: true,
    images: {
      main: "/build_yr_own/ER96-PRS-100-WG-BV.png",
      sub: []
    }
  },
  // CLASSIC STUDS Category
  {
    sku: "ER42-RD-100-WG-BV-BUILDER",
    variant: "ER42",
    title: "Classic Stud Earrings - Round Diamond 42",
    description: "Timeless classic stud earrings with round diamonds",
    category: "BUILD_YOUR_JEWELRY",
    subCategory: "Earring",
    price: 5224,
    diamondShape: "RD",
    diamondSize: 1.00,
    metal: "WG",
    builderImage: "ER42-RD-100-WG-BV",
    stylingName: "CLASSIC STUDS",
    isGiftingAvailable: false,
    isEngraving: true,
    images: {
      main: "/build_yr_own/ER42-RD-100-WG-BV.png",
      sub: []
    }
  },
  {
    sku: "ER43-RD-100-WG-BV-BUILDER",
    variant: "ER43",
    title: "Classic Stud Earrings - Round Diamond 43",
    description: "Elegant classic stud earrings with round diamonds",
    category: "BUILD_YOUR_JEWELRY",
    subCategory: "Earring",
    price: 5224,
    diamondShape: "RD",
    diamondSize: 1.00,
    metal: "WG",
    builderImage: "ER43-RD-100-WG-BV",
    stylingName: "CLASSIC STUDS",
    isGiftingAvailable: false,
    isEngraving: true,
    images: {
      main: "/build_yr_own/ER43-RD-100-WG-BV.png",
      sub: []
    }
  },
  {
    sku: "ER44-RD-100-WG-BV-BUILDER",
    variant: "ER44",
    title: "Classic Stud Earrings - Round Diamond 44",
    description: "Beautiful classic stud earrings with round diamonds",
    category: "BUILD_YOUR_JEWELRY",
    subCategory: "Earring",
    price: 5224,
    diamondShape: "RD",
    diamondSize: 1.00,
    metal: "WG",
    builderImage: "ER44-RD-100-WG-BV",
    stylingName: "CLASSIC STUDS",
    isGiftingAvailable: false,
    isEngraving: true,
    images: {
      main: "/build_yr_own/ER44-RD-100-WG-BV.png",
      sub: []
    }
  },
  {
    sku: "ER45-RD-100-WG-BV-BUILDER",
    variant: "ER45",
    title: "Classic Stud Earrings - Round Diamond 45",
    description: "Sophisticated classic stud earrings with round diamonds",
    category: "BUILD_YOUR_JEWELRY",
    subCategory: "Earring",
    price: 5224,
    diamondShape: "RD",
    diamondSize: 1.00,
    metal: "WG",
    builderImage: "ER45-RD-100-WG-BV",
    stylingName: "CLASSIC STUDS",
    isGiftingAvailable: false,
    isEngraving: true,
    images: {
      main: "/build_yr_own/ER45-RD-100-WG-BV.png",
      sub: []
    }
  },
  {
    sku: "ER66-RD-100-WG-BV-BUILDER",
    variant: "ER66",
    title: "Classic Stud Earrings - Round Diamond 66",
    description: "Premium classic stud earrings with round diamonds",
    category: "BUILD_YOUR_JEWELRY",
    subCategory: "Earring",
    price: 5224,
    diamondShape: "RD",
    diamondSize: 1.00,
    metal: "WG",
    builderImage: "ER66-RD-100-WG-BV",
    stylingName: "CLASSIC STUDS",
    isGiftingAvailable: false,
    isEngraving: true,
    images: {
      main: "/build_yr_own/ER66-RD-100-WG-BV.png",
      sub: []
    }
  },
  {
    sku: "ER324-RD-100-WG-BV-BUILDER",
    variant: "ER324",
    title: "Classic Stud Earrings - Round Diamond 324",
    description: "Designer classic stud earrings with round diamonds",
    category: "BUILD_YOUR_JEWELRY",
    subCategory: "Earring",
    price: 5224,
    diamondShape: "RD",
    diamondSize: 1.00,
    metal: "WG",
    builderImage: "ER324-RD-100-WG-BV",
    stylingName: "CLASSIC STUDS",
    isGiftingAvailable: false,
    isEngraving: true,
    images: {
      main: "/build_yr_own/ER324-RD-100-WG-BV.png",
      sub: []
    }
  },
  {
    sku: "ER325-RD-100-WG-BV-BUILDER",
    variant: "ER325",
    title: "Classic Stud Earrings - Round Diamond 325",
    description: "Luxury classic stud earrings with round diamonds",
    category: "BUILD_YOUR_JEWELRY",
    subCategory: "Earring",
    price: 5224,
    diamondShape: "RD",
    diamondSize: 1.00,
    metal: "WG",
    builderImage: "ER325-RD-100-WG-BV",
    stylingName: "CLASSIC STUDS",
    isGiftingAvailable: false,
    isEngraving: true,
    images: {
      main: "/build_yr_own/ER325-RD-100-WG-BV.png",
      sub: []
    }
  },
  // CLUSTER EARINGS Category
  {
    sku: "ER46-EM-100-WG-BV-BUILDER",
    variant: "ER46",
    title: "Cluster Earrings - Emerald Cut",
    description: "Stunning cluster earrings with emerald cut diamonds",
    category: "BUILD_YOUR_JEWELRY",
    subCategory: "Earring",
    price: 5224,
    diamondShape: "EM",
    diamondSize: 1.00,
    metal: "WG",
    builderImage: "ER46-EM-100-WG-BV",
    stylingName: "CLUSTER EARINGS",
    isGiftingAvailable: false,
    isEngraving: true,
    images: {
      main: "/build_yr_own/ER46-EM-100-WG-BV.png",
      sub: []
    }
  },
  // HOOP EARINGS Category
  {
    sku: "ER53-RD-100-WG-BV-BUILDER",
    variant: "ER53",
    title: "Hoop Earrings - Round Diamond",
    description: "Elegant hoop earrings with round diamonds",
    category: "BUILD_YOUR_JEWELRY",
    subCategory: "Earring",
    price: 5224,
    diamondShape: "RD",
    diamondSize: 1.00,
    metal: "WG",
    builderImage: "ER53-RD-100-WG-BV",
    stylingName: "HOOP EARINGS",
    isGiftingAvailable: false,
    isEngraving: true,
    images: {
      main: "/build_yr_own/ER53-RD-100-WG-BV.png",
      sub: []
    }
  },
  // HALO EARINGS Category
  {
    sku: "ER59-RD-100-WG-BV-BUILDER",
    variant: "ER59",
    title: "Halo Earrings - Round Diamond",
    description: "Beautiful halo earrings with round diamonds",
    category: "BUILD_YOUR_JEWELRY",
    subCategory: "Earring",
    price: 5224,
    diamondShape: "RD",
    diamondSize: 1.00,
    metal: "WG",
    builderImage: "ER59-RD-100-WG-BV",
    stylingName: "HALO EARINGS",
    isGiftingAvailable: false,
    isEngraving: true,
    images: {
      main: "/build_yr_own/ER59-RD-100-WG-BV.png",
      sub: []
    }
  },
  // SINGLE STUDS Category
  {
    sku: "ER329-RD-100-WG-BV-BUILDER",
    variant: "ER329",
    title: "Single Stud Earrings - Round Diamond 329",
    description: "Modern single stud earrings with round diamonds",
    category: "BUILD_YOUR_JEWELRY",
    subCategory: "Earring",
    price: 5224,
    diamondShape: "RD",
    diamondSize: 1.00,
    metal: "WG",
    builderImage: "ER329-RD-100-WG-BV",
    stylingName: "SINGLE STUDS",
    isGiftingAvailable: false,
    isEngraving: true,
    images: {
      main: "/build_yr_own/ER329-RD-100-WG-BV.png",
      sub: []
    }
  },
  {
    sku: "ER330-RD-100-WG-BV-BUILDER",
    variant: "ER330",
    title: "Single Stud Earrings - Round Diamond 330",
    description: "Chic single stud earrings with round diamonds",
    category: "BUILD_YOUR_JEWELRY",
    subCategory: "Earring",
    price: 5224,
    diamondShape: "RD",
    diamondSize: 1.00,
    metal: "WG",
    builderImage: "ER330-RD-100-WG-BV",
    stylingName: "SINGLE STUDS",
    isGiftingAvailable: false,
    isEngraving: true,
    images: {
      main: "/build_yr_own/ER330-RD-100-WG-BV.png",
      sub: []
    }
  },
  {
    sku: "ER331-RD-100-WG-BV-BUILDER",
    variant: "ER331",
    title: "Single Stud Earrings - Round Diamond 331",
    description: "Stylish single stud earrings with round diamonds",
    category: "BUILD_YOUR_JEWELRY",
    subCategory: "Earring",
    price: 5224,
    diamondShape: "RD",
    diamondSize: 1.00,
    metal: "WG",
    builderImage: "ER331-RD-100-WG-BV",
    stylingName: "SINGLE STUDS",
    isGiftingAvailable: false,
    isEngraving: true,
    images: {
      main: "/build_yr_own/ER331-RD-100-WG-BV.png",
      sub: []
    }
  }
];

//Pandent builder data can be added similarly
const pendantBuilderData = [
  {
    name: "SOLITAIRE",
    substyles: [
      {
        img: "/build_yr_own/PD18-RD-100-WG-BV.png",
        name: "PD18-RD-100-WG-BV",
        price: "5,224",
      },
      {
        img: "/build_yr_own/PD39-RD-100-WG-BV.png",
        name: "PD39-RD-100-WG-BV",
        price: "5,224",
      },
      {
        img: "/build_yr_own/PD40-OV-100-WG-BV.png",
        name: "PD40-OV-100-WG-BV",
        price: "5,224",
      },
      {
        img: "/build_yr_own/PD48-RD-100-WG-BV.png",
        name: "PD48-RD-100-WG-BV",
        price: "5,224",
      },
    ],
  },
  {
    name: "SOLITAIRE WITH HALO",
    substyles: [
      {
        img: "/build_yr_own/PD19-RD-100-WG-BV.png",
        name: "PD19-RD-100-WG-BV",
        price: "5,224",
      },
      {
        img: "/build_yr_own/PD21-RD-100-WG-BV.png",
        name: "PD21-RD-100-WG-BV",
        price: "5,224",
      },
      {
        img: "/build_yr_own/PD42-RD-100-WG-BV.png",
        name: "PD42-RD-100-WG-BV",
        price: "5,224",
      },
      {
        img: "/build_yr_own/PD43-RD-100-WG-BV.png",
        name: "PD43-RD-100-WG-BV",
        price: "5,224",
      },
      {
        img: "/build_yr_own/PD44-RD-100-WG-BV.png",
        name: "PD44-RD-100-WG-BV",
        price: "5,224",
      },
      {
        img: "/build_yr_own/PD45-RD-100-WG-BV.png",
        name: "PD45-RD-100-WG-BV",
        price: "5,224",
      },
      {
        img: "/build_yr_own/PD46-RD-100-WG-BV.png",
        name: "PD46-RD-100-WG-BV",
        price: "5,224",
      },
      {
        img: "/build_yr_own/PD47-RD-100-WG-BV.png",
        name: "PD47-RD-100-WG-BV",
        price: "5,224",
      },
    ],
  },
  {
    name: "STUD PENDANTS",
    substyles: [
      {
        img: "/build_yr_own/PD37-MQ-100-WG-BV.png",
        name: "PD37-MQ-100-WG-BV",
        price: "5,224",
      },
    ],
  },
];

// Combined builder data
const allBuilderData = [...braceletBuilderData, ...earringBuilderData, ...pendantBuilderData];

// Seed function
const seedBuilderData = async () => {
  try {
    await connectDB();
    
    console.log('Checking existing builder data...');
    
    // Check if any builder data already exists
    const existingBraceletCount = await Product.countDocuments({ 
      category: "BUILD_YOUR_JEWELRY",
      subCategory: "Bracelet"
    });
    
    const existingEarringCount = await Product.countDocuments({ 
      category: "BUILD_YOUR_JEWELRY",
      subCategory: "Earring"
    });
    
    if (existingBraceletCount > 0) {
      console.log(`Found ${existingBraceletCount} existing builder bracelet products. Clearing them first...`);
      await Product.deleteMany({ 
        category: "BUILD_YOUR_JEWELRY",
        subCategory: "Bracelet"
      });
      console.log('Existing builder bracelet data cleared.');
    }
    
    if (existingEarringCount > 0) {
      console.log(`Found ${existingEarringCount} existing builder earring products. Clearing them first...`);
      await Product.deleteMany({ 
        category: "BUILD_YOUR_JEWELRY",
        subCategory: "Earring"
      });
      console.log('Existing builder earring data cleared.');
    }
    
    console.log('Inserting new builder data...');
    
    // Insert new bracelet data
    const braceletResult = await Product.insertMany(braceletBuilderData);
    console.log(`✅ Successfully seeded ${braceletResult.length} bracelet builder products!`);
    
    // Insert new earring data
    const earringResult = await Product.insertMany(earringBuilderData);
    console.log(`✅ Successfully seeded ${earringResult.length} earring builder products!`);
    
    // Verify the data
    const braceletVerification = await Product.find({ 
      category: "BUILD_YOUR_JEWELRY",
      subCategory: "Bracelet"
    }).select('sku stylingName builderImage price');
    
    const earringVerification = await Product.find({ 
      category: "BUILD_YOUR_JEWELRY",
      subCategory: "Earring"
    }).select('sku stylingName builderImage price');
    
    console.log('\n📋 Seeded Bracelet Products Summary:');
    braceletVerification.forEach(product => {
      console.log(`  - ${product.sku}: ${product.stylingName} (${product.builderImage}) - ₹${product.price}`);
    });
    
    console.log('\n📋 Seeded Earring Products Summary:');
    earringVerification.forEach(product => {
      console.log(`  - ${product.sku}: ${product.stylingName} (${product.builderImage}) - ₹${product.price}`);
    });
    
    console.log(`\n🎯 Seeding completed successfully! Total: ${braceletResult.length + earringResult.length} products`);
    console.log(`📊 Database Table: "products" collection in MongoDB`);
    console.log(`🏷️  Query Pattern: { category: "BUILD_YOUR_JEWELRY", subCategory: "Bracelet|Earring" }`);
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed.');
  }
};

// Run the seeder
if (require.main === module) {
  seedBuilderData();
}

module.exports = { seedBuilderData, braceletBuilderData, earringBuilderData, allBuilderData };