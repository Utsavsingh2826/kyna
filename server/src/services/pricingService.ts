import mongoose from "mongoose";

export interface StoneSeq {
  pricingSequence?: string;
  cts?: number;
  pts?: number;
  pcs?: number;
  [key: string]: any;
}

export interface VariantForPricing {
  stonePricing?: StoneSeq[];
  netWeightInGrams?: number | string | null;
  metalType?: string | null;
  metalKt?: string | number | null;
  expense?: number;
  [key: string]: any;
}

const getCatalogConnection = () => {
  const dbName = (process.env.MONGO_DB_NAME || "catalog").toString();
  return mongoose.connection.useDb(dbName, { useCache: true });
};

const toNumberRobust = (v: unknown): number => {
  if (v == null) return NaN;
  if (typeof v === "number") return Number.isFinite(v) ? v : NaN;
  if (typeof v === "string") {
    const cleaned = v.replace(/[₹$,£€\s]/g, "").replace(/,/g, "");
    const n = Number(cleaned);
    if (!Number.isNaN(n) && Number.isFinite(n)) return n;
    const m = cleaned.match(/-?\d+(\.\d+)?/);
    if (m) {
      const nf = Number(m[0]);
      return Number.isFinite(nf) ? nf : NaN;
    }
    return NaN;
  }
  try {
    const s = (v as any).toString?.();
    const n = Number(s);
    return Number.isFinite(n) ? n : NaN;
  } catch {
    return NaN;
  }
};

const KARAT_FACTOR: Record<string, number> = {
  "18": 0.76,
  "14": 0.6,
  "9": 0.375,
  "22": 0.92,
  "24": 1.0,
};

export const getPricingDefaults = async () => {
  const conn = getCatalogConnection();
  let defaultDocs: any[] = [];
  const collNames = ["defaultvalues", "defaultValues", "defaultvalucs"];
  for (const name of collNames) {
    const coll = conn.collection(name);
    const docs = await coll.find({}).toArray();
    if (docs && docs.length > 0) {
      defaultDocs = docs;
      break;
    }
  }

  return Object.assign(
    {},
    ...defaultDocs.map((d) => {
      const { _id, ...rest } = d;
      return rest;
    })
  );
};

export const getPricingMap = async (sequences: string[]) => {
  if (sequences.length === 0) return new Map();
  const conn = getCatalogConnection();
  const pricingColl = conn.collection("pricing");
  const pricingDocs = await pricingColl
    .find({ pricingSequence: { $in: sequences } })
    .toArray();

  return new Map(
    pricingDocs.map((doc: any) => [
      doc.pricingSequence,
      { price: toNumberRobust(doc.sellingPrice) },
    ])
  );
};

export const calculateProductPrice = (
  variant: any,
  defaults: Record<string, any>,
  pricingMap: Map<string, { price: number }>
) => {
  try {
    const goldValue24 = toNumberRobust(defaults.goldValue24PerGram || defaults.goldValue24);
    const silverPricePerGram = toNumberRobust(defaults.silverPricePerGram);
    const platinumPricePerGram = toNumberRobust(defaults.platinumPricePerGram);
    const gstValue = toNumberRobust(defaults.gstValue) || 3;

    // 💎 DIAMOND CALCULATION (Rounded per stone as per controller)
    let diamondCost = 0;
    const stonePricingArr = variant.stonePricing || [];
    for (const stone of stonePricingArr) {
      const seq = stone?.pricingSequence;
      const cts = toNumberRobust(stone?.cts);
      if (seq && !Number.isNaN(cts)) {
        const pData = pricingMap.get(seq);
        if (pData && !Number.isNaN(pData.price)) {
          diamondCost += Math.round(pData.price * cts);
        }
      }
    }

    const metalType = String(variant.metalType || variant.metal || "GOLD").toUpperCase();
    const karatNum = Number(String(variant.metalKt || variant.karat || "").match(/\d+/)?.[0] || 18);
    const netWeight = toNumberRobust(variant.netWeightInGrams || variant.netWeight);

    let metalCost = 0;
    let labourCost = 0;
    let additionalExpense = 0;

    if (!Number.isNaN(netWeight)) {
      // 🛠️ METAL & LABOUR (Rounded per step as per controller)
      if (metalType === "GOLD") {
        const factor = KARAT_FACTOR[String(karatNum)] ?? 0.76;
        metalCost = Math.round(netWeight * factor * goldValue24);
        const lRate = toNumberRobust(defaults.labourCostGold);
        labourCost = Math.round(netWeight * (Number.isNaN(lRate) ? 2200 : lRate));
        additionalExpense = toNumberRobust(defaults.goldExpense) || 0;
      } else if (metalType === "SILVER") {
        metalCost = Math.round(netWeight * silverPricePerGram);
        const lRate = toNumberRobust(defaults.labourCostSilver);
        labourCost = Math.round(netWeight * (Number.isNaN(lRate) ? 1300 : lRate));
        additionalExpense = toNumberRobust(defaults.silverExpense) || 0;
      } else if (metalType === "PLATINUM") {
        metalCost = Math.round(netWeight * platinumPricePerGram);
        const lRate = toNumberRobust(defaults.labourCostPlatinum);
        labourCost = Math.round(netWeight * (Number.isNaN(lRate) ? 3500 : lRate));
        additionalExpense = toNumberRobust(defaults.platinumExpense) || 0;
      }
    }

    // 🧾 GST CALCULATION (Rounded as per controller)
    const basePrice = Math.round(diamondCost + metalCost + labourCost + additionalExpense);
    const gstMultiplier = 1 + (gstValue / 100);
    const totalWithGst = Math.round(basePrice * gstMultiplier);

    return {
      total: totalWithGst,
      breakdown: {
        diamondCost,
        metalCost,
        labourCost,
        expense: additionalExpense,
        totalBeforeGst: basePrice,
        gstAmount: totalWithGst - basePrice
      }
    };
  } catch (err) {
    return { total: 0, error: String(err) };
  }
};

export const pricingService = {
  getPricingDefaults,
  getPricingMap,
  calculateProductPrice,
  calculatePrice: (p: any, overrides?: any) => p.price || 0,
  getPriceBreakdown: (p: any, overrides?: any) => ({ basePrice: p.price || 0 })
};
