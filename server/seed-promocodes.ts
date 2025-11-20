import mongoose from "mongoose";
import dotenv from "dotenv";
import PromoCode from "./src/models/promoCodeModel";

dotenv.config();

const MONGO_URI =
  process.env.MONGO_URI ||
  "mongodb://127.0.0.1:27017/kyna";

const seedPromoCodes = [
  {
    code: "HELLO",
    discountPercent: 5,
    description: "Enjoy 5% off on the diamond value.",
    createdBy: new mongoose.Types.ObjectId("000000000000000000000000"),
  },
  {
    code: "DIAMOND10",
    discountPercent: 10,
    description: "Limited 10% diamond promo.",
    createdBy: new mongoose.Types.ObjectId("000000000000000000000000"),
  },
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    for (const promo of seedPromoCodes) {
      const existing = await PromoCode.findOne({ code: promo.code });
      if (existing) {
        await PromoCode.updateOne({ _id: existing._id }, promo);
        console.log(`Updated promo code ${promo.code}`);
      } else {
        await PromoCode.create(promo);
        console.log(`Inserted promo code ${promo.code}`);
      }
    }

    console.log("Promo seeding complete");
  } catch (error) {
    console.error("Promo seeding failed:", error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seed();

