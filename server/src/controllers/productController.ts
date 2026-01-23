import { Request, Response } from "express";
import { any } from "joi";
import mongoose, { Connection, Model, Document } from "mongoose";


type DefaultValuesDoc = Record<string, any>;

interface PricingDoc {
  pricingSequence: string;
  sellingPrice?: number;
  [key: string]: any;
}

interface StoneSeq {
  pricingSequence?: string;
  cts?: number;
  pts?: number;
  pcs?: number;
  [key: string]: any;
}

interface VariantDoc {
  _id?: any;
  variantSku?: string;
  parentSku?: string;
  category?: string;
  stonePricing?: StoneSeq[];
  metalType?: string | null;
  metalKt?: string | number | null;
  netWeightInGrams?: number | string | null;
  images?: any[];
  title?: string;
  description?: string;
  expense?: number;
  attributes?: {
    ENGRAVABLE?: string;
    "TOTAL MAX CHARACTERISTICS"?: number;
    "CATEGORY-1"?: string;
    "CATEGORY-2"?: string;
    "CATEGORY-3"?: string;
    [key: string]: any;
  };
  centerStoneShape?: string;
  centerStoneSize?: number;
  chainLength?: number | string;
  withChain?: string;
  [key: string]: any;
}

interface ProductDoc {
  parentSku?: string;
  title?: string;
  description?: string;
  category?: string;
  metalTypes?: string[] | string;
  metalKts?: string[] | string;
  centerStoneShapes?: string | string[];
  centerStoneSizes?: string[] | number[];
  diamondColorClarity?: string[] | string;
  diamondShapes?: string[] | string;
  diamondSizes?: string[] | string;
  variantSkus?: string[];
  [key: string]: any;
}

interface PriceBreakdown {
  metalCost: number | null;
  diamondCost: number | null;
  labourCost: number | null;
  expense?: number | null;
  gstPercent?: number | null;
  gstAmount?: number | null;
  totalBeforeGst?: number | null;
  totalWithGst?: number | null;
  missingDefaults?: string[];
  error?: string;
}

interface ParsedSKU {
  modelSku: string;
  shape: string | null;
  size: string | null;
  karat: string | null;
  diamondType: string | null;
  clarity: string | null;
  length: string | null;
  mm: string | null; // ADD THIS
  finishCode: string | null; // ADD THIS
}

// ---------- Helpers ----------
const getCatalogConnection = (): Connection => {
  const dbName = (process.env.MONGO_DB_NAME || "catalog").toString();
  return mongoose.connection.useDb(dbName, { useCache: true });
};

const getCollectionModel = (collectionName: string): Model<Document> => {
  const conn = getCatalogConnection();
  const modelName = `${collectionName}_model`;
  if ((conn.models as any)[modelName]) return (conn.models as any)[modelName];
  const schema = new mongoose.Schema(
    {},
    { strict: false, collection: collectionName },
  );
  return conn.model<Document>(modelName, schema, collectionName);
};

const KARAT_FACTOR: Record<string, number> = {
  "18": 0.76,
  "14": 0.6,
  "9": 0.375,
};
const LABOUR_RATE: Record<string, number> = {
  GOLD: 2200,
  SILVER: 1300,
  PLATINUM: 3500,
  TITANIUM: 3500,
};

const n = (v: any): number =>
  typeof v === "number"
    ? v
    : typeof v === "string" && v.trim() !== ""
      ? Number(v)
      : NaN;

const parseNumeric = (v: any): number => {
  if (v == null) return NaN;
  if (typeof v === "number") return v;
  const cleaned = String(v).replace(/[,₹\s]/g, "");
  return Number(cleaned) || NaN;
};

export const getProductsByCategory = async (req: Request, res: Response) => {
  try {
    const rawCategory = String(req.params.category || "").trim();
    if (!rawCategory)
      return res
        .status(400)
        .json({ success: false, message: "Category required" });

    const category = rawCategory.toUpperCase();

    const page = Math.max(1, parseInt(String(req.query.page || "1"), 10));
    const limit = Math.min(
      100,
      Math.max(1, parseInt(String(req.query.limit || "20"), 10)),
    );
    const skip = (page - 1) * limit;

    const minPrice = n(req.query.minPrice);
    const maxPrice = n(req.query.maxPrice);

    // Parse sort parameter
    const sortByRaw = String(req.query.sortBy || "")
      .trim()
      .toLowerCase();
    let sortBy: "price_asc" | "price_desc" | null = null;
    if (
      ["price_asc", "priceasc", "low", "lowtohigh", "ascending"].includes(
        sortByRaw,
      )
    ) {
      sortBy = "price_asc";
    } else if (
      ["price_desc", "pricedesc", "high", "hightolow", "descending"].includes(
        sortByRaw,
      )
    ) {
      sortBy = "price_desc";
    }

    // Parse filters
    const shapesRaw = String(req.query.centerStoneShape || "").trim();
    const shapes = shapesRaw
      ? shapesRaw
        .split(",")
        .map((s) => s.trim().toUpperCase())
        .filter(Boolean)
      : [];

    const metalTypesRaw = String(req.query.metalTypes || "").trim();
    const metalTypes = metalTypesRaw
      ? metalTypesRaw
        .split(",")
        .map((s) => s.trim().toUpperCase())
        .filter(Boolean)
      : [];

    const isEngravingRaw = String(req.query.isEngraving || "")
      .trim()
      .toLowerCase();
    const isEngraving =
      category === "RINGS" && ["true", "1", "yes"].includes(isEngravingRaw);

    // Ring type filters
    const ringRaw = String(req.query.ringType || req.query.ring || "").trim();
    const ringTokens = ringRaw ? ringRaw.split(",").map((s) => s.trim()) : [];

    const mapRingTypeToPrefixes = (token: string): string[] => {
      const t = token
        .trim()
        .toLowerCase()
        .replace(/[-_\s]+/g, "");
      if (
        [
          "engagement",
          "eng",
          "engring",
          "engagementring",
          "engagement-ring",
        ].includes(t)
      )
        return ["ENG"];
      if (
        ["solitaire", "sol", "sr", "solitairering", "solitaire-ring"].includes(
          t,
        )
      )
        return ["SR"];
      if (["fashion", "fash", "fr", "fashionring", "fashion-ring"].includes(t))
        return ["FR"];
      if (["men", "mens", "gr", "menring", "men-ring"].includes(t))
        return ["GR"];
      if (/^(eng|sr|fr|gr)$/i.test(t)) return [t.toUpperCase()];
      return [];
    };

    const ringPrefixes = Array.from(
      new Set(ringTokens.flatMap(mapRingTypeToPrefixes)),
    );

    // Category filters
    const parseCatParam = (v: any) =>
      v
        ? String(v)
          .split(",")
          .map((s: string) => s.trim())
          .filter(Boolean)
          .map((x: string) => x.toUpperCase())
        : [];

    const cat1Filters = parseCatParam(req.query.category1);
    const cat2Filters = parseCatParam(req.query.category2);
    const cat3Filters = parseCatParam(req.query.category3);

    const VariantModel = getCollectionModel("variants2");
    const ProductModel = getCollectionModel("products2");

    let eligibleParentSkus: string[] | null = null;

    /**
     * ENGRAVING FILTER - Get eligible parentSkus from variants2 collection
     */
    if (isEngraving) {
      const variantMatch: any = { category };
      variantMatch["attributes.ENGRAVABLE"] = "YES";

      const engravingVariants = await VariantModel.find(variantMatch, {
        parentSku: 1,
      })
        .lean()
        .exec();
      eligibleParentSkus = Array.from(
        new Set(engravingVariants.map((v: any) => v.parentSku).filter(Boolean)),
      );

      if (eligibleParentSkus.length === 0) {
        return res.status(200).json({
          success: true,
          count: 0,
          total: await ProductModel.countDocuments({ category }),
          totalFiltered: 0,
          pagination: {
            totalPages: 0,
            currentPage: page,
            limit,
          },
          appliedFilters: {
            category,
            centerStoneShape: shapes.length > 0 ? shapes : null,
            ringTypeRequested: ringTokens.length > 0 ? ringTokens : null,
            ringPrefixesApplied: ringPrefixes.length > 0 ? ringPrefixes : null,
            category1: cat1Filters.length > 0 ? cat1Filters : null,
            category2: cat2Filters.length > 0 ? cat2Filters : null,
            category3: cat3Filters.length > 0 ? cat3Filters : null,
            metalTypes: metalTypes.length > 0 ? metalTypes : null,
            isEngraving: true,
            minPrice: !Number.isNaN(minPrice) ? minPrice : null,
            maxPrice: !Number.isNaN(maxPrice) ? maxPrice : null,
            sortBy: sortBy,
          },
          products: [],
        });
      }
    }

    /**
     * BUILD VARIANT MATCH
     */
    const variantMatch: any = { category };

    // If engraving filter is active, restrict to eligible parentSkus
    if (eligibleParentSkus !== null) {
      variantMatch.parentSku = { $in: eligibleParentSkus };
    }

    // Metal type filter
    if (metalTypes.length > 0) {
      variantMatch["metalType"] = { $in: metalTypes };
    }

    // Shape filter
    if (shapes.length > 0) {
      variantMatch["centerStoneShape"] = { $in: shapes };
    }

    // Ring type (SKU prefix) filter
    if (ringPrefixes.length > 0) {
      const prefixRegexes = ringPrefixes.map(
        (prefix) => new RegExp(`^${prefix}`, "i"),
      );
      if (variantMatch.parentSku && variantMatch.parentSku.$in) {
        const filteredSkus = eligibleParentSkus!.filter((sku) =>
          prefixRegexes.some((regex) => regex.test(sku)),
        );
        variantMatch.parentSku = { $in: filteredSkus };
      } else {
        variantMatch.parentSku = {
          $regex: new RegExp(`^(${ringPrefixes.join("|")})`, "i"),
        };
      }
    }

    /**
     * OPTIMIZED AGGREGATION PIPELINE
     */
    const hasProductFilters =
      cat1Filters.length > 0 ||
      cat2Filters.length > 0 ||
      cat3Filters.length > 0;

    const pipeline: any[] = [
      { $match: variantMatch },

      // Project only needed fields early
      {
        $project: {
          parentSku: 1,
          variantSku: 1,
          category: 1,
          images: 1,
          stonePricing: 1,
          netWeightInGrams: 1,
          title: 1,
          metalType: 1,
          metalKt: 1,
          centerStoneShape: 1,
          centerStoneSize: 1,
          expense: 1,
          attributes: 1,
        },
      },

      // Group by parentSku
      {
        $group: {
          _id: "$parentSku",
          firstVariant: { $first: "$$ROOT" },
        },
      },

      // Sort early to ensure consistent results
      { $sort: { _id: 1 } },
    ];

    // If no product-level filters and no price sorting, we can limit early
    if (!hasProductFilters && !sortBy) {
      // Get total count before limiting
      const countPipeline = [...pipeline, { $count: "total" }];
      const countResult = await VariantModel.aggregate(countPipeline).exec();
      const totalFiltered = countResult[0]?.total || 0;

      // Now add pagination to main pipeline
      pipeline.push({ $skip: skip }, { $limit: limit });

      // Execute limited query
      const limitedResults = await VariantModel.aggregate(pipeline)
        .allowDiskUse(true)
        .exec();

      // Lookup products for only the limited results
      const parentSkus = limitedResults.map((r) => r._id);
      const products = (await ProductModel.find(
        { parentSku: { $in: parentSkus } },
        {
          parentSku: 1,
          title: 1,
          variantSkus: 1,
          centerStoneShapes: 1,
          centerStoneSizes: 1,
          metalKts: 1,
          metalTypes: 1,
        },
      )
        .lean()
        .exec()) as any[];

      const productMap = new Map(products.map((p) => [p.parentSku, p]));

      // Combine results
      const combinedResults = limitedResults
        .map((row) => ({
          firstVariant: row.firstVariant,
          product: productMap.get(row._id),
        }))
        .filter((row) => row.product);

      // Process with batched pricing
      const finalProducts = await processProductsWithBatchedPricing(
        combinedResults,
        category,
        minPrice,
        maxPrice,
      );

      const totalProducts = await ProductModel.countDocuments({ category });

      return res.status(200).json({
        success: true,
        count: finalProducts.length,
        total: totalProducts,
        totalFiltered: totalFiltered,
        pagination: {
          totalPages: Math.ceil(totalFiltered / limit),
          currentPage: page,
          limit,
        },
        appliedFilters: {
          category,
          centerStoneShape: shapes.length > 0 ? shapes : null,
          ringTypeRequested: ringTokens.length > 0 ? ringTokens : null,
          ringPrefixesApplied: ringPrefixes.length > 0 ? ringPrefixes : null,
          category1: cat1Filters.length > 0 ? cat1Filters : null,
          category2: cat2Filters.length > 0 ? cat2Filters : null,
          category3: cat3Filters.length > 0 ? cat3Filters : null,
          metalTypes: metalTypes.length > 0 ? metalTypes : null,
          isEngraving: category === "RINGS" ? isEngraving : null,
          minPrice: !Number.isNaN(minPrice) ? minPrice : null,
          maxPrice: !Number.isNaN(maxPrice) ? maxPrice : null,
          sortBy: sortBy,
        },
        products: finalProducts,
      });
    }

    // If we have product filters or price sorting, we need to get all results first
    pipeline.push(
      {
        $lookup: {
          from: "products2",
          localField: "_id",
          foreignField: "parentSku",
          as: "product",
          pipeline: [
            {
              $project: {
                parentSku: 1,
                title: 1,
                variantSkus: 1,
                centerStoneShapes: 1,
                centerStoneSizes: 1,
                metalKts: 1,
                metalTypes: 1,
              },
            },
          ],
        },
      },
      { $unwind: { path: "$product", preserveNullAndEmptyArrays: false } },
    );

    // Apply variant-level category filters (now in attributes)
    if (cat1Filters.length > 0) {
      pipeline.push({
        $match: {
          $or: cat1Filters.map((v) => ({
            "firstVariant.attributes.CATEGORY-1": { $regex: v, $options: "i" },
          })),
        },
      });
    }

    if (cat2Filters.length > 0) {
      pipeline.push({
        $match: {
          $or: cat2Filters.map((v) => ({
            "firstVariant.attributes.CATEGORY-2": { $regex: v, $options: "i" },
          })),
        },
      });
    }

    if (cat3Filters.length > 0) {
      pipeline.push({
        $match: {
          $or: cat3Filters.map((v) => ({
            "firstVariant.attributes.CATEGORY-3": { $regex: v, $options: "i" },
          })),
        },
      });
    }

    // Get all results for pricing calculation and filtering
    const allResults = await VariantModel.aggregate(pipeline)
      .allowDiskUse(true)
      .exec();

    // Process with batched pricing (includes price filtering)
    let allProducts = await processProductsWithBatchedPricing(
      allResults,
      category,
      minPrice,
      maxPrice,
    );

    // Apply price sorting if requested
    if (sortBy) {
      allProducts = allProducts.sort((a, b) => {
        const priceA = a.sellingPrice ?? Number.MAX_SAFE_INTEGER;
        const priceB = b.sellingPrice ?? Number.MAX_SAFE_INTEGER;

        if (sortBy === "price_asc") {
          return priceA - priceB;
        } else {
          return priceB - priceA;
        }
      });
    }

    // Now paginate after price filtering and sorting
    const totalFiltered = allProducts.length;
    const paged = allProducts.slice(skip, skip + limit);

    const totalProducts = await ProductModel.countDocuments({ category });

    return res.status(200).json({
      success: true,
      count: paged.length,
      total: totalProducts,
      totalFiltered,
      pagination: {
        totalPages: Math.ceil(totalFiltered / limit),
        currentPage: page,
        limit,
      },
      appliedFilters: {
        category,
        centerStoneShape: shapes.length > 0 ? shapes : null,
        ringTypeRequested: ringTokens.length > 0 ? ringTokens : null,
        ringPrefixesApplied: ringPrefixes.length > 0 ? ringPrefixes : null,
        category1: cat1Filters.length > 0 ? cat1Filters : null,
        category2: cat2Filters.length > 0 ? cat2Filters : null,
        category3: cat3Filters.length > 0 ? cat3Filters : null,
        metalTypes: metalTypes.length > 0 ? metalTypes : null,
        isEngraving: category === "RINGS" ? isEngraving : null,
        minPrice: !Number.isNaN(minPrice) ? minPrice : null,
        maxPrice: !Number.isNaN(maxPrice) ? maxPrice : null,
        sortBy: sortBy,
      },
      products: paged,
    });
  } catch (err) {
    console.error("getProductsByCategory error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err instanceof Error ? err.message : String(err),
    });
  }
};

/**
 * BATCHED PRICING CALCULATION
 * This function calculates prices with batched database lookups
 */
async function processProductsWithBatchedPricing(
  allResults: any[],
  category: string,
  minPrice: number,
  maxPrice: number,
): Promise<any[]> {
  const conn = getCatalogConnection();
  const pricingColl = conn.collection("pricing");
  const defaultsColl = conn.collection("defaultValues");

  // Get defaults once
  const defaultDocs = await defaultsColl.find({}).toArray();
  const mergedDefaults = Object.assign(
    {},
    ...defaultDocs.map((d) => {
      const c = { ...d };
      delete (c as any)._id;
      return c;
    }),
  );

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

  // Extract defaults
  const goldValue24 = toNumberRobust(
    mergedDefaults.goldValue24PerGram || mergedDefaults.goldValue24,
  );
  const silverPricePerGram = toNumberRobust(mergedDefaults.silverPricePerGram);
  const platinumPricePerGram = toNumberRobust(
    mergedDefaults.platinumPricePerGram,
  );
  const titaniumPricePerGram = toNumberRobust(
    mergedDefaults.titaniumPricePerGram,
  );

  const labourCostGold = toNumberRobust(mergedDefaults.labourCostGold);
  const labourCostSilver = toNumberRobust(mergedDefaults.labourCostSilver);
  const labourCostPlatinum = toNumberRobust(mergedDefaults.labourCostPlatinum);
  const labourCostTitanium = toNumberRobust(mergedDefaults.labourCostTitanium);

  const goldExpense = toNumberRobust(mergedDefaults.goldExpense);
  const silverExpense = toNumberRobust(mergedDefaults.silverExpense);
  const platinumExpense = toNumberRobust(mergedDefaults.platinumExpense);
  const titaniumExpense = toNumberRobust(mergedDefaults.titaniumExpense);

  const gstValue = toNumberRobust(mergedDefaults.gstValue);

  // STEP 1: Collect all unique pricing sequences from ALL results
  const allSequences = new Set<string>();

  for (const row of allResults) {
    const variant = row.firstVariant;
    const stonePricingArr: any[] = Array.isArray(variant.stonePricing)
      ? variant.stonePricing
      : [];

    for (const stone of stonePricingArr) {
      const seq = stone?.pricingSequence;
      if (seq) {
        allSequences.add(seq);
      }
    }
  }

  // STEP 2: Batch fetch ALL pricing data in ONE query
  const pricingDocs = await pricingColl
    .find({ pricingSequence: { $in: Array.from(allSequences) } })
    .toArray();

  // Create a Map for O(1) lookups
  const pricingMap = new Map(
    pricingDocs.map((doc: any) => [
      doc.pricingSequence,
      {
        price: toNumberRobust(doc.sellingPrice),
      },
    ]),
  );

  // STEP 3: Process all products using the cached pricing data
  const products: any[] = [];

  for (const row of allResults) {
    const variant = row.firstVariant;
    const product = row.product;

    // Get image
    let imageUrl: string | null = null;
    if (Array.isArray(variant.images) && variant.images.length > 0) {
      const img =
        variant.images.find(
          (i: any) =>
            typeof i?.url === "string" && i.url.toUpperCase().includes("GP"),
        ) ||
        variant.images.find(
          (i: any) =>
            typeof i?.url === "string" && i.url.toUpperCase().includes("FV"),
        ) ||
        null;

      imageUrl = img?.url || img?.filename || null;
    }

    // Get engraving from VARIANT attributes
    const engravingEnabled = variant.attributes?.ENGRAVABLE === "YES";
    const engravingMaxChars =
      engravingEnabled &&
        variant.attributes?.["TOTAL MAX CHARACTERISTICS"] != null
        ? toNumberRobust(variant.attributes["TOTAL MAX CHARACTERISTICS"])
        : null;

    // Get metal types from PRODUCT
    const productMetalTypes = Array.isArray(product.metalTypes)
      ? product.metalTypes
      : product.metalTypes
        ? [product.metalTypes]
        : [];

    const baseOut: any = {
      _id: product._id,
      modelSku: product.parentSku, // Keep as modelSku for backwards compatibility
      metalTypes: productMetalTypes,
      title: variant.title || product.title || null,
      variantCount: Array.isArray(product.variantSkus)
        ? product.variantSkus.length
        : 0,
      firstVariantSku: variant.variantSku,
      firstVariantImageUrl: imageUrl,
      attributesCategory1: variant.attributes?.["CATEGORY-1"] ?? null,
      attributesCategory2: variant.attributes?.["CATEGORY-2"] ?? null,
      attributesCategory3: variant.attributes?.["CATEGORY-3"] ?? null,
      engravingMaxCharacters:
        category === "RINGS" && !Number.isNaN(engravingMaxChars)
          ? engravingMaxChars
          : null,
      engravingFontSize: null, // Not available in new schema
      sellingPrice: null,
      priceIncomplete: true,
    };

    // Calculate price using cached pricing data
    try {
      const stonePricingArr: any[] = Array.isArray(variant.stonePricing)
        ? variant.stonePricing
        : [];

      let diamondCost = 0;
      let diamondIncomplete = false;

      // Calculate diamond cost from stonePricing array
      for (const stone of stonePricingArr) {
        const seq = stone?.pricingSequence;
        const cts = toNumberRobust(stone?.cts);

        if (!seq || Number.isNaN(cts)) {
          diamondIncomplete = true;
          continue;
        }

        const pricingData = pricingMap.get(seq);
        const pricePerCt = pricingData?.price ?? NaN;

        if (Number.isNaN(pricePerCt)) {
          diamondIncomplete = true;
          continue;
        }

        diamondCost += pricePerCt * cts;
      }

      // Add variant expense to diamond cost
      const variantExpense = toNumberRobust(variant.expense);
      if (!Number.isNaN(variantExpense)) {
        diamondCost += variantExpense;
      }

      const metalType = (variant.metalType || "GOLD").toString().toUpperCase();

      let karatStr = variant.metalKt || "18KT";
      const karatNum = Number(String(karatStr).match(/\d+/)?.[0] || 18);

      let metalWeightGrams = toNumberRobust(variant.netWeightInGrams);

      let metalPricePerGram = NaN;
      if (metalType === "GOLD" && !Number.isNaN(goldValue24)) {
        const factor = KARAT_FACTOR[String(karatNum)] ?? KARAT_FACTOR["18"];
        metalPricePerGram = goldValue24 * factor;
      } else if (metalType === "SILVER") {
        metalPricePerGram = silverPricePerGram;
      } else if (metalType === "PLATINUM") {
        metalPricePerGram = platinumPricePerGram;
      } else if (metalType === "TITANIUM") {
        metalPricePerGram = titaniumPricePerGram;
      }

      let metalCost = 0;
      let labourCost = 0;
      let additionalExpense = 0;
      let metalIncomplete = false;

      if (!Number.isNaN(metalWeightGrams) && !Number.isNaN(metalPricePerGram)) {
        metalCost = metalPricePerGram * metalWeightGrams;

        // Get labour cost based on metal type
        if (metalType === "GOLD") {
          labourCost = !Number.isNaN(labourCostGold) ? labourCostGold : 0;
          additionalExpense = !Number.isNaN(goldExpense) ? goldExpense : 0;
        } else if (metalType === "SILVER") {
          labourCost = !Number.isNaN(labourCostSilver) ? labourCostSilver : 0;
          additionalExpense = !Number.isNaN(silverExpense) ? silverExpense : 0;
        } else if (metalType === "PLATINUM") {
          labourCost = !Number.isNaN(labourCostPlatinum)
            ? labourCostPlatinum
            : 0;
          additionalExpense = !Number.isNaN(platinumExpense)
            ? platinumExpense
            : 0;
        } else if (metalType === "TITANIUM") {
          labourCost = !Number.isNaN(labourCostTitanium)
            ? labourCostTitanium
            : 0;
          additionalExpense = !Number.isNaN(titaniumExpense)
            ? titaniumExpense
            : 0;
        }
      } else {
        metalIncomplete = true;
      }

      // Calculate final selling price with GST
      const basePrice =
        metalCost + diamondCost + labourCost + additionalExpense;
      const gstMultiplier = !Number.isNaN(gstValue) ? 1 + gstValue / 100 : 1;
      const sellingPrice = basePrice * gstMultiplier;

      baseOut.sellingPrice =
        !Number.isNaN(sellingPrice) && sellingPrice > 0
          ? Math.round(sellingPrice)
          : null;
      baseOut.priceIncomplete = metalIncomplete || diamondIncomplete;
    } catch (err) {
      baseOut.sellingPrice = null;
      baseOut.priceIncomplete = true;
    }

    // Price filter
    if (
      !Number.isNaN(minPrice) &&
      (baseOut.sellingPrice === null || baseOut.sellingPrice < minPrice)
    )
      continue;
    if (
      !Number.isNaN(maxPrice) &&
      (baseOut.sellingPrice === null || baseOut.sellingPrice > maxPrice)
    )
      continue;

    products.push(baseOut);
  }

  return products;
}

export const getProductByModelSku = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    // ----------------- Helpers scoped to this controller -----------------
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

    const normalizeKey = (k: string) =>
      k
        .toString()
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");

    const findNumericDefault = (
      obj: Record<string, any>,
      candidateNames: string[],
    ): { value: number; matchedKey?: string } => {
      if (!obj || typeof obj !== "object") return { value: NaN };

      const candNorm = candidateNames.map((c) => normalizeKey(c));

      for (const [k, v] of Object.entries(obj)) {
        const kn = normalizeKey(k);
        if (candNorm.includes(kn)) {
          const val = toNumberRobust(v);
          if (!Number.isNaN(val)) return { value: val, matchedKey: k };
        }
      }

      for (const [k, v] of Object.entries(obj)) {
        const kn = normalizeKey(k);
        for (const cn of candNorm) {
          if (kn.includes(cn) || cn.includes(kn)) {
            const val = toNumberRobust(v);
            if (!Number.isNaN(val)) return { value: val, matchedKey: k };
          }
        }
      }

      for (const [k, v] of Object.entries(obj)) {
        if (v && typeof v === "object" && !Array.isArray(v)) {
          for (const [k2, v2] of Object.entries(v as Record<string, any>)) {
            const kn2 = normalizeKey(k2);
            if (candNorm.includes(kn2)) {
              const val = toNumberRobust(v2);
              if (!Number.isNaN(val))
                return { value: val, matchedKey: `${k}.${k2}` };
            }
            for (const cn of candNorm) {
              if (kn2.includes(cn) || cn.includes(kn2)) {
                const val = toNumberRobust(v2);
                if (!Number.isNaN(val))
                  return { value: val, matchedKey: `${k}.${k2}` };
              }
            }
          }
        }
      }

      return { value: NaN };
    };

    const parseSKU = (sku: string): ParsedSKU => {
      const parts = sku.split("-").map((p) => p.trim());
      const parsed: ParsedSKU = {
        modelSku: parts[0] || "",
        shape: null,
        size: null,
        karat: null,
        diamondType: null,
        clarity: null,
        mm: null, // ADD THIS
        finishCode: null, // ADD THIS
        length: null,
      };

      if (parts.length < 2) return parsed;

      // // Part 1: shape (letters only, typically 2-3 chars like EM, RD, PR)
      // if (parts[1] && /^[A-Z]{2,4}$/i.test(parts[1])) {
      //   parsed.shape = parts[1].toUpperCase();
      // }

      // Part 2: size (numeric, could be 10, 15, 20, etc.)
      // if (parts[2] && /^\d+(\.\d+)?$/.test(parts[2])) {
      //   parsed.size = parts[2];
      // }

      // Part 3: karat (numeric, like 9, 14, 18)
      // if (parts[3] && /^\d+$/.test(parts[3])) {
      //   parsed.karat = parts[3];
      // }

      // Part 4: diamond type + clarity (e.g., LGEFVVS, NDGHSI)
      if (parts[4]) {
        const match = parts[4].match(/^(LG|ND)([A-Z]{2,10})$/i);
        if (match) {
          parsed.diamondType = match[1].toUpperCase();
          parsed.clarity = match[2].toUpperCase();
        }
      }

      // Part 5: Could be MM, bandWidth, or chainLength (numeric)
      if (parts[5] && /^\d+(\.\d+)?$/.test(parts[5])) {
        // For BR category, this would be bandWidth
        // For other categories, this is MM
        parsed.mm = parts[5];
      }

      // Part 6: FINISH_CODE (2-3 letter code like NF, PF, etc.)
      if (parts[6] && /^[A-Z]{2,3}$/i.test(parts[6])) {
        parsed.finishCode = parts[6].toUpperCase();
      }

      return parsed;
    };

    const extractCenterStoneSizeFromSku = (sku: string): string | null => {
      // Example:
      // SR1-CUS-100-14-LGEFVS  -> 100 -> 1
      // SR1-CUS-130-14-LGEFVS  -> 130 -> 1.3

      const parts = sku.split("-");
      if (parts.length < 3) return null;

      const raw = parts[2]; // "100", "130", "150"
      if (!/^\d+$/.test(raw)) return null;

      const num = Number(raw);
      if (!num) return null;

      return (num / 100).toString();
    };


    // ----------------- Request validation -----------------
    const rawSku = (req.params.modelSku ?? "").toString().trim();
    if (!rawSku)
      return res
        .status(400)
        .json({ success: false, message: "modelSku required" });
    const modelSku = rawSku.toUpperCase();

    console.info(
      `[getProductByModelSku] entry modelSku=${modelSku} query=${JSON.stringify(
        req.query,
      )}`,
    );

    // ----------------- Load product -----------------
    const ProductModel = getCollectionModel("products2");
    const product = (await ProductModel.findOne({
      parentSku: modelSku,
    }).lean()) as ProductDoc | null;

    if (!product) {
      console.warn(
        `[getProductByModelSku] product not found parentSku=${modelSku}`,
      );
      return res
        .status(404)
        .json({ success: false, message: `Model ${modelSku} not found` });
    }
    console.debug(
      `[getProductByModelSku] product loaded id=${(product as any)?._id ?? "unknown"
      }`,
    );

    // ----------------- Basic metadata -----------------
    const category = product?.category ?? null;

    const isPendant =
      typeof category === "string" &&
      category.toUpperCase().startsWith("PENDANT");

    const metalTypes: string[] = Array.isArray(product?.metalTypes)
      ? product.metalTypes.map(String)
      : product?.metalTypes
        ? [String(product.metalTypes)]
        : [];


    let metalKarats: string[] = [];

    if (Array.isArray(product?.metalKts)) {
      metalKarats = product.metalKts
        .map(String)
        .map(k => k.trim().toUpperCase())
        .filter(Boolean);
    }


    const extractShapeFromSku = (sku: string): string | null => {
      const parts = sku.toUpperCase().split("-");
      // Shape is ALWAYS the 2nd token in your system
      // BR1-RD-1-14-LGEFVS-6  -> RD
      // SR1-CUS-100-14-LGEFVS -> CUS
      return parts.length >= 2 ? parts[1] : null;
    };


    let diamondShape: string[] = [];

    if (Array.isArray(product?.centerStoneShapes)) {
      const allowedShapes = new Set(
        product.centerStoneShapes.map(s => String(s).toUpperCase())
      );

      const shapesFromVariants = new Set<string>();

      const variantSkus: string[] = Array.isArray(product?.variantSkus)
        ? product.variantSkus
        : [];

      for (const sku of variantSkus) {
        if (typeof sku !== "string") continue;
        const shape = extractShapeFromSku(sku);
        if (shape && allowedShapes.has(shape)) {
          shapesFromVariants.add(shape);
        }
      }

      // If variants exist, trust them
      diamondShape = shapesFromVariants.size
        ? Array.from(shapesFromVariants)
        : Array.from(allowedShapes);
    }
    const conn = getCatalogConnection();

    const allVariantDocs = await conn
      .collection("variants2")
      .find(
        { parentSku: modelSku },
        {
          projection: {
            variantSku: 1,
            metalType: 1,
          },
        }
      )
      .toArray();

    // let diamondSize: string[] = Array.isArray(product?.centerStoneSizes)
    //   ? product.centerStoneSizes.map(String)
    //   : Array.isArray(product?.diamondSizes)
    //     ? product.diamondSizes.map(String)
    //     : [];

    const diamondSizeByMetal: Record<string, string[]> = {};

    // Base sizes from products2 (trusted source)
    const baseSizes: string[] = Array.isArray(product?.centerStoneSizes)
      ? product.centerStoneSizes.map(s => String(s).trim())
      : [];

    // Group using variants
    for (const variant of allVariantDocs) {
      if (!variant?.variantSku || !variant?.metalType) continue;

      const metal = String(variant.metalType).toUpperCase();
      const size = extractCenterStoneSizeFromSku(
        String(variant.variantSku).toUpperCase()
      );

      if (!size) continue;

      // Optional safety: ensure size is allowed by product
      if (baseSizes.length && !baseSizes.includes(size)) continue;

      if (!diamondSizeByMetal[metal]) {
        diamondSizeByMetal[metal] = [];
      }

      diamondSizeByMetal[metal].push(size);
    }


    // Deduplicate + numeric sort
    for (const metal of Object.keys(diamondSizeByMetal)) {
      diamondSizeByMetal[metal] = Array.from(
        new Set(diamondSizeByMetal[metal])
      ).sort((a, b) => parseFloat(a) - parseFloat(b));
    }




    // =================================================================
    // ===================== METAL OPTIONS =============================
    // =================================================================
    const metalOptions: Record<string, string[]> = {};
    metalTypes.forEach((m) => (metalOptions[m] = []));

    const metalColorDocs = await conn
      .collection("metalcolorsupports")
      .find({
        metalType: { $in: metalTypes },
        isSupported: true,
      })
      .toArray();

    for (const doc of metalColorDocs) {
      const metal = String(doc.metalType).toUpperCase();
      const color = String(doc.metalColor).toUpperCase();
      if (!metalOptions[metal]) metalOptions[metal] = [];
      metalOptions[metal].push(color);
    }

    for (const m of Object.keys(metalOptions)) {
      metalOptions[m] = Array.from(new Set(metalOptions[m]));
    }

    // =================================================================
    // ===================== DIAMOND OPTIONS ===========================
    // =================================================================
    const diamondOptions: Record<string, Record<string, string[]>> = {};

    const diamondDocs = await conn
      .collection("diamondqualitysupports")
      .find({ isSupported: true })
      .toArray();

    for (const doc of diamondDocs) {
      const dType = String(doc.diamondType).toUpperCase();
      const metal = String(doc.metalType).toUpperCase();
      const quality = String(doc.quality).toUpperCase();

      if (!diamondOptions[dType]) diamondOptions[dType] = {};
      if (!diamondOptions[dType][metal]) diamondOptions[dType][metal] = [];

      diamondOptions[dType][metal].push(quality);
    }

    for (const dType of Object.keys(diamondOptions)) {
      for (const metal of Object.keys(diamondOptions[dType])) {
        diamondOptions[dType][metal] = Array.from(
          new Set(diamondOptions[dType][metal]),
        );
      }
    }

    // ----------------- diamondColorClarity (STRICT: only after LG or ND) -----------------
    let diamondColorClarity: string[] = [];
    let diamondTypes: string[] = []; // NEW: separate diamond types (LG, ND)
    const variantIdsArr: string[] = Array.isArray(product?.variantSkus)
      ? (product.variantSkus as any[]).filter((v) => typeof v === "string")
      : [];

    if (variantIdsArr.length) {
      const collectedClarities: string[] = [];
      const collectedTypes = new Set<string>();
      const prefixRegex = /(?:LG|ND)([A-Z]{2,10})/gi;

      for (const rawSku of variantIdsArr) {
        if (!rawSku || typeof rawSku !== "string") continue;
        const upSku = rawSku.toUpperCase();

        prefixRegex.lastIndex = 0;
        let m: RegExpExecArray | null;
        while ((m = prefixRegex.exec(upSku)) !== null) {
          if (m[0].startsWith("LG")) collectedTypes.add("LG");
          if (m[0].startsWith("ND")) collectedTypes.add("ND");
          if (m[1]) collectedClarities.push(m[1].toUpperCase());
        }

        const parts = upSku.split(/[-_\/\.]/).map((p) => (p || "").trim());
        for (let i = 0; i < parts.length; i++) {
          const p = parts[i];
          if (p === "LG" || p === "ND") {
            collectedTypes.add(p);
            const next = parts[i + 1] ?? "";
            const lead = (next.match(/^([A-Z]{2,10})/) || [])[1];
            if (lead) collectedClarities.push(lead.toUpperCase());
          }
        }
      }

      const seenClarities = new Set<string>();
      const uniqClarities: string[] = [];
      for (const t of collectedClarities) {
        const tok = String(t || "")
          .toUpperCase()
          .trim();
        if (!tok) continue;
        if (!/^[A-Z]{2,10}$/.test(tok)) continue;
        if (!seenClarities.has(tok)) {
          seenClarities.add(tok);
          uniqClarities.push(tok);
        }
      }
      diamondColorClarity = uniqClarities;
      diamondTypes = Array.from(collectedTypes);
    }

    // ----------------- ENGRAVING (from variants2 only) -----------------
    const variantCount = Array.isArray(product?.variantSkus)
      ? product.variantSkus.length
      : 0;
    const firstVariantSku =
      variantCount > 0 ? (product.variantSkus as any[])[0] : null;
    const variantIdParam = (req.query.variantId ?? "").toString().trim();

    // ----------------- Pricing setup (merge multi-doc defaults) -----------------
    const pricingColl = conn.collection("pricing");
    const defaultsColl = conn.collection("defaultValues");

    const defaultDocs = (await defaultsColl
      .find({})
      .toArray()) as DefaultValuesDoc[];
    const mergedDefaults: DefaultValuesDoc = Object.assign(
      {},
      ...defaultDocs.map((doc) => {
        const copy = { ...doc };
        delete (copy as any)._id;
        return copy;
      }),
    );

    console.debug(
      "[getProductByModelSku] mergedDefaults keys:",
      Object.keys(mergedDefaults),
    );

    const goldRes = findNumericDefault(mergedDefaults, [
      "goldValue24PerGram",
      "goldValue24",
      "goldPerGram",
      "gold24",
      "goldvalue24pergram",
    ]);
    const platinumRes = findNumericDefault(mergedDefaults, [
      "platinumPricePerGram",
      "platinumPricePerGrm",
      "platinumPerGram",
      "ptPricePerGram",
    ]);
    const silverRes = findNumericDefault(mergedDefaults, [
      "silverPricePerGram",
      "silverPerGram",
      "silverPrice",
      "svPricePerGram",
    ]);
    const titaniumRes = findNumericDefault(mergedDefaults, [
      "titaniumPricePerGram",
      "titaniumPerGram",
      "titaniumPrice",
    ]);

    const goldValue24 = goldRes.value;
    const platinumPricePerGram = platinumRes.value;
    const silverPricePerGram = silverRes.value;
    const titaniumPricePerGram = titaniumRes.value;

    const labourGoldRes = findNumericDefault(mergedDefaults, [
      "labourCostGold",
      "labourGold",
      "labourCost_Gold",
      "labourcostgold",
    ]);
    const labourPlatinumRes = findNumericDefault(mergedDefaults, [
      "labourCostPlatinum",
      "labourPlatinum",
      "labourCost_PT",
      "labourcostplatinum",
    ]);
    const labourSilverRes = findNumericDefault(mergedDefaults, [
      "labourCostSilver",
      "labourSilver",
      "labour_cost_silver",
      "labourcostsilver",
    ]);
    const labourTitaniumRes = findNumericDefault(mergedDefaults, [
      "labourCostTitanium",
      "labourTitanium",
      "labour_cost_titanium",
      "labourcosttitanium",
    ]);

    const expenseGoldRes = findNumericDefault(mergedDefaults, [
      "goldExpense",
      "expenseGold",
      "gold_expense",
      "goldexpense",
    ]);
    const expensePlatinumRes = findNumericDefault(mergedDefaults, [
      "platinumExpense",
      "expensePlatinum",
      "platinum_expense",
      "platinumexpense",
    ]);
    const expenseSilverRes = findNumericDefault(mergedDefaults, [
      "silverExpense",
      "expenseSilver",
      "silver_expense",
      "silverexpense",
    ]);
    const expenseTitaniumRes = findNumericDefault(mergedDefaults, [
      "titaniumExpense",
      "expenseTitanium",
      "titanium_expense",
      "titaniumexpense",
    ]);

    const gstRes = findNumericDefault(mergedDefaults, [
      "gstValue",
      "gstPercent",
      "gst",
      "gstvalue",
    ]);

    const labourDefaults = {
      GOLD: labourGoldRes.value,
      PLATINUM: labourPlatinumRes.value,
      SILVER: labourSilverRes.value,
      TITANIUM: labourTitaniumRes.value,
    };

    const expenseDefaults = {
      GOLD: expenseGoldRes.value,
      PLATINUM: expensePlatinumRes.value,
      SILVER: expenseSilverRes.value,
      TITANIUM: expenseTitaniumRes.value,
    };

    const gstPercentDefault = gstRes.value;

    const missingDefaults: string[] = [];
    if (Number.isNaN(goldValue24)) missingDefaults.push("goldValue24");
    if (Number.isNaN(platinumPricePerGram))
      missingDefaults.push("platinumPricePerGram");
    if (Number.isNaN(silverPricePerGram))
      missingDefaults.push("silverPricePerGram");
    if (Number.isNaN(titaniumPricePerGram))
      missingDefaults.push("titaniumPricePerGram");

    if (Number.isNaN(labourDefaults.GOLD))
      console.debug(
        "[getProductByModelSku] labourDefaults GOLD not found in defaults",
      );
    if (Number.isNaN(labourDefaults.PLATINUM))
      console.debug(
        "[getProductByModelSku] labourDefaults PLATINUM not found in defaults",
      );
    if (Number.isNaN(labourDefaults.SILVER))
      console.debug(
        "[getProductByModelSku] labourDefaults SILVER not found in defaults",
      );
    if (Number.isNaN(labourDefaults.TITANIUM))
      console.debug(
        "[getProductByModelSku] labourDefaults TITANIUM not found in defaults",
      );

    if (Number.isNaN(expenseDefaults.GOLD))
      console.debug(
        "[getProductByModelSku] expenseDefaults GOLD not found in defaults",
      );
    if (Number.isNaN(expenseDefaults.PLATINUM))
      console.debug(
        "[getProductByModelSku] expenseDefaults PLATINUM not found in defaults",
      );
    if (Number.isNaN(expenseDefaults.SILVER))
      console.debug(
        "[getProductByModelSku] expenseDefaults SILVER not found in defaults",
      );
    if (Number.isNaN(expenseDefaults.TITANIUM))
      console.debug(
        "[getProductByModelSku] expenseDefaults TITANIUM not found in defaults",
      );

    if (Number.isNaN(gstPercentDefault))
      console.debug(
        "[getProductByModelSku] gstPercent not found in defaults; defaulting to 0%",
      );

    if (missingDefaults.length) {
      console.warn(
        "[getProductByModelSku] pricing: missing/NaN defaultValues:",
        {
          missingDefaults,
          mergedDefaultsKeys: Object.keys(mergedDefaults),
        },
      );
    } else {
      console.info("[getProductByModelSku] pricing: defaults detected ->", {
        goldKey: goldRes.matchedKey ?? null,
        goldValue24,
        platinumKey: platinumRes.matchedKey ?? null,
        platinumPricePerGram,
        silverKey: silverRes.matchedKey ?? null,
        silverPricePerGram,
        titaniumKey: titaniumRes.matchedKey ?? null,
        titaniumPricePerGram,
      });
    }

    // ----------------- Variant fetch (variantSku) -----------------
    let chosenVariantSku: string | null = null;
    let firstVariantDoc: VariantDoc | null = null;

    // CRITICAL: variantId is required for availability checking
    if (!variantIdParam) {
      return res.status(400).json({
        success: false,
        message: "variantId query parameter is required",
      });
    }

    firstVariantDoc = await conn
      .collection("variants2")
      .findOne({ variantSku: variantIdParam });

    // ----------------- PENDANT CHAIN INFO -----------------
    let chainOption: string | null = null;
    let chainLengthInches: string | null = null;

    if (isPendant && firstVariantDoc) {
      chainOption = firstVariantDoc.withChain ?? null;
      chainLengthInches = firstVariantDoc.chainLength
        ? String(firstVariantDoc.chainLength)
        : null;
    }

    if (!firstVariantDoc) {
      return res.status(404).json({
        success: false,
        message: "Variant not found for the provided variantId",
      });
    }

    chosenVariantSku =
      firstVariantDoc.variantSku ??
      (firstVariantDoc._id ? String(firstVariantDoc._id) : null);

    console.debug(
      "[getProductByModelSku] chosenVariantSku:",
      chosenVariantSku,
      "variant found:",
      !!firstVariantDoc,
    );

    // Extract bandwidth and finishing from product (parent level)
    // Check if this is a gents ring by SKU prefix
    const isGentsRing =
      typeof modelSku === "string" && modelSku.toUpperCase().startsWith("GR");

    // Extract bandwidth array (for gents rings only)
    const bandwidthArray: string[] =
      isGentsRing && Array.isArray(product?.bandwidth)
        ? product.bandwidth.map(String).filter((val: string) => {
          const num = parseFloat(val);
          return !isNaN(num) && num > 0; // Filter out 0 and invalid values
        })
        : [];

    // Extract finishing options (for gents rings only)
    const finishingOptions: Array<{ code: string; type: string }> =
      isGentsRing && Array.isArray(product?.finishing)
        ? product.finishing.filter((f: any) => f?.code && f?.type)
        : [];

    console.debug("[getProductByModelSku] Extracted from product:", {
      isGentsRing,
      bandwidthArray,
      finishingOptions,
    });

    let title = firstVariantDoc?.title ?? product?.title ?? null;
    let description =
      firstVariantDoc?.description ?? product?.description ?? null;

    // ----------------- Parse the chosen variant SKU -----------------
    const parsedSKU = parseSKU(chosenVariantSku!);
    console.debug("[getProductByModelSku] parsedSKU:", parsedSKU);

    const skuPrefix = [
      parsedSKU.modelSku,
      parsedSKU.shape,
      parsedSKU.size,
      parsedSKU.karat,
    ].filter(Boolean).join("-");



    const variantSkuSet = new Set(
      allVariantDocs
        .map(v => v.variantSku)
        .filter(Boolean)
        .map(v => String(v).toUpperCase())
    );


    // =================================================================
    // ========== FILTER DIAMOND OPTIONS BY REAL VARIANTS ===============
    // =================================================================

    const confirmedDiamondOptions: Record<string, Record<string, string[]>> = {};
    const DIAMOND_TYPE_TO_SKU: Record<string, "LG" | "ND"> = {
      LAB: "LG",
      NATURAL: "ND",
    };


    for (const dType of Object.keys(diamondOptions)) {
      for (const metal of Object.keys(diamondOptions[dType])) {
        for (const clarity of diamondOptions[dType][metal]) {

          // Build SKU using same base as selected variant
          const skuDiamondType = DIAMOND_TYPE_TO_SKU[dType];
          if (!skuDiamondType) continue;

          const normalizedClarity = clarity.replace(/\s+/g, ""); // "EF VVS" → "EFVVS"

          const candidateSKU = `${skuPrefix}-${skuDiamondType}${normalizedClarity}`;


          if (!candidateSKU) continue;

          // Check if this variant actually exists
          if (!variantSkuSet.has(candidateSKU.toUpperCase())) continue;

          // Only NOW we accept this option
          if (!confirmedDiamondOptions[dType]) {
            confirmedDiamondOptions[dType] = {};
          }
          if (!confirmedDiamondOptions[dType][metal]) {
            confirmedDiamondOptions[dType][metal] = [];
          }

          confirmedDiamondOptions[dType][metal].push(clarity);
        }
      }
    }

    // Deduplicate (important)
    for (const dType in confirmedDiamondOptions) {
      for (const metal in confirmedDiamondOptions[dType]) {
        confirmedDiamondOptions[dType][metal] = Array.from(
          new Set(confirmedDiamondOptions[dType][metal])
        );
      }
    }

    // =================================================================

    diamondShape = Array.isArray(diamondShape) ? diamondShape : [];
    // diamondSize = Array.isArray(diamondSize) ? diamondSize : [];

    // ----------------- Variant images and available colors -----------------
    let variantImages: string[] = [];
    let availableColors: string[] = [];

    if (firstVariantDoc && Array.isArray(firstVariantDoc.images)) {
      const allImgs = firstVariantDoc.images
        .map((img: any) => img?.url ?? img?.filename ?? img)
        .filter(Boolean)
        .map(String);

      // Define priority by category
      const VIEW_PRIORITY: Record<string, string[]> = {
        RINGS: ["GP", "GLB", "TV", "45", "FV", "SV", "BV"],
        BRACELETS: ["BV", "GLB", "FV", "TRV", "TLV"],
        EARRINGS: ["FV", "GLB", "45", "BV", "BCV", "SV"],
        PENDANTS: ["FV", "GLB", "MP4", "45", "BV", "SV"],
      };

      // Determine category key
      const categoryUpper = (category || "").toString().toUpperCase();
      let categoryKey = "RINGS"; // default

      if (categoryUpper.includes("BRACELET")) categoryKey = "BRACELETS";
      else if (categoryUpper.includes("EARRING")) categoryKey = "EARRINGS";
      else if (categoryUpper.includes("PENDANT")) categoryKey = "PENDANTS";
      else if (categoryUpper.includes("RING")) categoryKey = "RINGS";

      const priorityOrder = VIEW_PRIORITY[categoryKey] || VIEW_PRIORITY.RINGS;

      // Extract metal colors from filenames for availableColors
      const PRIMARY_METALS = ["WG", "YG", "RG", "BR", "3T"];
      const extractOrderedMetalsFromFilename = (url: string): string[] => {
        const name = url.split("/").pop()?.toUpperCase() || "";
        const parts = name.split(/[-_.]/).filter(Boolean);
        const result: string[] = [];
        for (const p of parts) {
          if (PRIMARY_METALS.includes(p) && result[result.length - 1] !== p) {
            result.push(p);
          }
        }
        return result;
      };

      const availableColorsSet = new Set<string>();
      for (const url of allImgs) {
        const metals = extractOrderedMetalsFromFilename(url);
        if (metals.includes("3T")) {
          availableColorsSet.add("3T");
          continue;
        }
        if (metals.length === 1) {
          availableColorsSet.add(metals[0]);
        }
        if (metals.length >= 2) {
          for (let i = 0; i < metals.length - 1; i++) {
            availableColorsSet.add(`${metals[i]}-${metals[i + 1]}`);
          }
        }
      }
      availableColors = Array.from(availableColorsSet);

      // Helper: check if URL contains a view code
      const hasViewCode = (url: string, code: string): boolean => {
        const upper = url.toUpperCase();
        return new RegExp(`[-_\\.\\/]${code}(?:[-_\\.\\/]|$)`, "i").test(upper);
      };

      // Check if user requested specific metal color
      const metalQueryRaw = (req.query.metal ?? req.query.metalColor ?? "")
        .toString()
        .trim()
        .toUpperCase();

      // Filter by metal color if requested
      let filteredImgs = allImgs;
      if (metalQueryRaw) {
        const metalMap: Record<string, string> = {
          WHITE: "WG",
          WHITEGOLD: "WG",
          WG: "WG",
          YELLOW: "YG",
          YG: "YG",
          YELLOWGOLD: "YG",
          RG: "RG",
          ROSEGOLD: "RG",
          ROSE: "RG",
          BR: "BR",
          BLACK: "BR",
          BLACKRHODIUM: "BR",
        };

        // Check if this is a multi-tone request (contains hyphen)
        if (metalQueryRaw.includes("-")) {
          // Multi-tone request: WG-YG, WG-RG, etc.
          const requestedMetals = metalQueryRaw
            .split("-")
            .map((m) => metalMap[m.trim()] ?? m.trim())
            .filter(Boolean);

          if (requestedMetals.length === 2) {
            filteredImgs = allImgs.filter((u) => {
              const metals = extractOrderedMetalsFromFilename(u);
              // Must have exactly 2 metals in EXACT order
              return (
                metals.length === 2 &&
                metals[0] === requestedMetals[0] &&
                metals[1] === requestedMetals[1]
              );
            });
          }
        } else {
          // Single metal request
          const requestedMetal = metalMap[metalQueryRaw] ?? metalQueryRaw;

          if (requestedMetal === "3T") {
            filteredImgs = allImgs.filter((u) =>
              /[-_\\.\\/]3T[-_\\.\\/]/i.test(u),
            );
          } else if (PRIMARY_METALS.includes(requestedMetal)) {
            // STRICT filtering: only images with EXACTLY this metal, no multi-tone
            filteredImgs = allImgs.filter((u) => {
              const metals = extractOrderedMetalsFromFilename(u);
              // Must have exactly 1 metal and it must be the requested one
              return metals.length === 1 && metals[0] === requestedMetal;
            });
          }
        }
      }

      // Sort images by view priority
      const sortedImgs: string[] = [];
      for (const viewCode of priorityOrder) {
        const matching = filteredImgs.filter((u) => hasViewCode(u, viewCode));
        sortedImgs.push(...matching);
      }

      // Add any remaining images that don't match priority codes
      const remainingImgs = filteredImgs.filter((u) => !sortedImgs.includes(u));
      sortedImgs.push(...remainingImgs);

      // Remove duplicates and limit to 24
      variantImages = Array.from(new Set(sortedImgs)).slice(0, 24);

      // Fallback if no images found
      if (variantImages.length === 0) {
        variantImages = allImgs.slice(0, 24);
      }
    }


    // ----------------- PRICE CALCULATION (NEW FORMULA) -----------------
    let sellingPrice: number | null = null;
    let priceIncomplete = true;
    let priceBreakdown: PriceBreakdown = {
      metalCost: null,
      diamondCost: null,
      labourCost: null,
      missingDefaults: missingDefaults.length ? missingDefaults : undefined,
    };
    const priceIncompleteReasons: string[] = [];

    let netWeightGrams: number | null = null;

    if (firstVariantDoc) {
      try {
        const variant = firstVariantDoc;
        const stonePricingArr: StoneSeq[] = Array.isArray(variant?.stonePricing)
          ? variant.stonePricing
          : [];

        console.debug(
          "[getProductByModelSku] stonePricingArr:",
          stonePricingArr,
        );

        // Collect all unique pricing sequences
        const sequences = Array.from(
          new Set(
            stonePricingArr
              .map((s) => s?.pricingSequence)
              .filter(Boolean)
              .map(String),
          ),
        );

        // Batch fetch pricing data
        const pricingMap: Record<string, PricingDoc> = {};
        if (sequences.length) {
          const rawDocs = (await pricingColl
            .find({ pricingSequence: { $in: sequences } })
            .toArray()) as any[];

          console.debug(
            "[getProductByModelSku] pricing rawDocs count:",
            rawDocs.length,
          );

          for (const raw of rawDocs) {
            const seq = raw?.pricingSequence
              ? String(raw.pricingSequence)
              : null;
            if (!seq) continue;

            const sp = toNumberRobust(raw.sellingPrice);
            const pd: PricingDoc = { pricingSequence: seq };
            if (!Number.isNaN(sp)) pd.sellingPrice = sp;

            pricingMap[seq] = pd;
          }

          console.debug("[getProductByModelSku] resolved pricingMap:");
          for (const seq of sequences) {
            const pd = pricingMap[seq];
            if (!pd) {
              console.debug(`  pricingSequence=${seq} -> NOT FOUND in pricing`);
              continue;
            }
            console.debug(
              `  pricingSequence=${seq} -> sellingPrice=${pd.sellingPrice ?? null}`,
            );
          }
        } else {
          console.debug(
            "[getProductByModelSku] no sequences extracted; skipping pricing fetch",
          );
        }

        // Calculate diamond cost
        let diamondCost = 0;
        let diamondIncomplete = false;

        for (const stone of stonePricingArr) {
          const seq = stone?.pricingSequence;
          const cts = toNumberRobust(stone?.cts);

          if (!seq || Number.isNaN(cts)) {
            diamondIncomplete = true;
            continue;
          }

          const pd = pricingMap[seq];
          const pricePerCt = pd?.sellingPrice ?? NaN;

          if (Number.isNaN(pricePerCt)) {
            diamondIncomplete = true;
            continue;
          }

          diamondCost += pricePerCt * cts;
        }

        // Add variant expense to diamond cost
        const variantExpense = toNumberRobust(variant.expense);
        if (!Number.isNaN(variantExpense)) {
          diamondCost += variantExpense;
        }

        let metalType: string;

        if (variant?.metalType) {
          metalType = String(variant.metalType).toUpperCase();
        } else if (metalTypes.length === 1) {
          metalType = metalTypes[0].toUpperCase();
        } else {
          // Fallback only if absolutely needed
          metalType = "GOLD";
        }

        let karatStr: string | null =
          variant?.metalKt
            ? String(variant.metalKt)
            : metalKarats.length
              ? metalKarats[0]
              : null;
        let karatNum: number;

        if (metalType === "PLATINUM") {
          karatNum = 950;
        } else if (metalType === "SILVER") {
          karatNum = 925;
        } else {
          karatNum = karatStr ? Number(karatStr.replace(/\D/g, "")) : 18;
        }

        netWeightGrams = toNumberRobust(variant?.netWeightInGrams);
        if (Number.isNaN(netWeightGrams)) netWeightGrams = null;

        let metalPricePerGram = NaN;
        const mType = (metalType || "GOLD").toUpperCase();

        if (mType === "GOLD" && !Number.isNaN(goldValue24)) {
          const factor =
            KARAT_FACTOR[String(karatNum)] ?? KARAT_FACTOR["18"] ?? 18 / 24;
          metalPricePerGram = goldValue24 * factor;
        } else if (mType === "SILVER" && !Number.isNaN(silverPricePerGram)) {
          metalPricePerGram = silverPricePerGram;
        } else if (
          mType === "PLATINUM" &&
          !Number.isNaN(platinumPricePerGram)
        ) {
          metalPricePerGram = platinumPricePerGram;
        } else if (
          mType === "TITANIUM" &&
          !Number.isNaN(titaniumPricePerGram)
        ) {
          metalPricePerGram = titaniumPricePerGram;
        }

        let metalCost = 0;
        let labourCost = 0;
        let metalIncomplete = false;

        const labourFromDefaults =
          labourDefaults[mType as keyof typeof labourDefaults];
        const expenseFromDefaults =
          expenseDefaults[mType as keyof typeof expenseDefaults];
        const resolvedLabourCost = !Number.isNaN(labourFromDefaults)
          ? labourFromDefaults
          : (LABOUR_RATE[mType] ?? LABOUR_RATE.GOLD);
        const resolvedExpense = !Number.isNaN(expenseFromDefaults)
          ? expenseFromDefaults
          : 0;
        const resolvedGstPercent = Number.isNaN(gstPercentDefault)
          ? 0
          : gstPercentDefault;

        if (netWeightGrams && !Number.isNaN(metalPricePerGram)) {
          metalCost = metalPricePerGram * netWeightGrams;
          labourCost = resolvedLabourCost;
        } else {
          metalIncomplete = true;
          if (!netWeightGrams)
            priceIncompleteReasons.push("missing_metal_weight");
          if (Number.isNaN(metalPricePerGram))
            priceIncompleteReasons.push("missing_metal_unit_price");
        }

        const computedSellingPriceBeforeExpense =
          metalCost + diamondCost + labourCost;

        const expenseValue = resolvedExpense || 0;
        const totalBeforeGst = computedSellingPriceBeforeExpense + expenseValue;

        const gstPercent = resolvedGstPercent || 0;
        const gstAmount = totalBeforeGst * (gstPercent / 100);

        const totalWithGst = totalBeforeGst + gstAmount;

        sellingPrice =
          !Number.isNaN(totalWithGst) && totalWithGst > 0
            ? Math.round(totalWithGst)
            : null;

        priceIncomplete =
          metalIncomplete || diamondIncomplete || missingDefaults.length > 0;

        priceBreakdown = {
          metalCost: metalCost || 0,
          diamondCost: diamondCost || 0,
          labourCost: labourCost || 0,
          expense: expenseValue || 0,
          gstPercent: gstPercent || 0,
          gstAmount: Math.round(gstAmount) || 0,
          totalBeforeGst: Math.round(totalBeforeGst) || 0,
          totalWithGst: Math.round(totalWithGst) || 0,
          missingDefaults: missingDefaults.length ? missingDefaults : undefined,
        };

        if (diamondIncomplete)
          priceIncompleteReasons.push("missing_diamond_price_entries");
        if (missingDefaults.length)
          priceIncompleteReasons.push("missing_default_values");

        console.info("[getProductByModelSku] price result", {
          modelSku,
          chosenVariantSku,
          metalType: mType,
          karatNum,
          netWeightGrams,
          metalPricePerGram,
          metalCost,
          diamondCost,
          labourCost,
          expenseValue,
          gstPercent,
          gstAmount,
          totalBeforeGst,
          totalWithGst,
          sellingPrice,
          priceIncomplete,
          priceIncompleteReasons,
        });
      } catch (err) {
        console.error("[getProductByModelSku] pricing calc error:", err);
        sellingPrice = null;
        priceIncomplete = true;
        priceBreakdown = {
          metalCost: null,
          diamondCost: null,
          labourCost: null,
          error: err instanceof Error ? err.message : String(err),
        };
        priceIncompleteReasons.push("exception_in_pricing");
      }
    } else {
      sellingPrice = null;
      priceIncomplete = true;
      priceBreakdown = {
        metalCost: null,
        diamondCost: null,
        labourCost: null,
      };
      priceIncompleteReasons.push("missing_variant");
      console.warn(
        "[getProductByModelSku] no variant doc found; cannot compute price",
        { modelSku, firstVariantSku },
      );
    }

    // ----------------- ENGRAVING: finalize detection & extraction ----------
    const variantEngravingEnabled =
      firstVariantDoc?.attributes?.ENGRAVABLE === "YES";

    const engravingMaxCharacters =
      variantEngravingEnabled &&
        firstVariantDoc?.attributes?.["TOTAL MAX CHARACTERISTICS"] != null
        ? toNumberRobust(
          firstVariantDoc.attributes["TOTAL MAX CHARACTERISTICS"],
        )
        : undefined;

    const isEngraving = variantEngravingEnabled;

    // ----------------- Final response -----------------
    const response = {
      _id: (product as any)._id,
      success: true,
      modelSku,
      title,
      description,
      category,

      ...(isPendant
        ? {
          chainOption,
          chainLengthInches,
        }
        : {}),

      metalTypes,
      metalOptions,
      goldKarats: metalKarats,
      diamondShape,
      diamondSize: diamondSizeByMetal,
      diamondOptions: confirmedDiamondOptions,
      diamondColorClarity,
      ...(isGentsRing && bandwidthArray.length > 0
        ? { bandwidth: bandwidthArray }
        : {}),
      ...(isGentsRing && finishingOptions.length > 0
        ? { finishing: finishingOptions }
        : {}),
      finishing: finishingOptions,
      diamondTypes,
      isEngraving,
      engravingInfo: isEngraving
        ? {
          fontSize: null, // Not available in new schema
          maxCharacters:
            engravingMaxCharacters !== undefined &&
              !Number.isNaN(engravingMaxCharacters)
              ? engravingMaxCharacters
              : null,
        }
        : null,
      variantCount,
      firstVariantSku,
      sellingPrice,
      priceIncomplete,
      priceBreakdown,
      priceIncompleteReasons,
      chosenVariantSku: chosenVariantSku ?? null,
      variantImages,
      availableColors,
      netWeightGrams,
    };

    return res.status(200).json(response);
  } catch (err) {
    console.error("getProductByModelSku error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err instanceof Error ? err.message : String(err),
    });
  }
};

export const getBuilderVariants = async (req: Request, res: Response) => {
  try {
    const stylingName = (req.query.stylingName || "")
      .toString()
      .trim()
      .toUpperCase();
    if (!stylingName) {
      return res
        .status(400)
        .json({ success: false, message: "stylingName is required" });
    }

    const conn = getCatalogConnection();
    const builderColl = conn.collection("builder");
    const variantsColl = conn.collection("variants");

    // Fetch builder rows for the styling (trimmed)
    const builderRows = await builderColl
      .aggregate([
        {
          $addFields: {
            stylingTrim: { $trim: { input: "$STYLING NAME" } },
            parentTrim: { $trim: { input: "$PARENT SKU" } },
            builderViewTrim: { $trim: { input: "$BUILDER VIEW" } },
          },
        },
        { $match: { stylingTrim: stylingName } },
        {
          $project: {
            _id: 0,
            parentSku: "$parentTrim",
            builderView: "$builderViewTrim",
            category: "$CATEGORY",
          },
        },
      ])
      .toArray();

    if (!builderRows.length) {
      return res.json({ success: true, stylingName, count: 0, entries: [] });
    }

    const escapeRegExp = (s: string) =>
      s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const STOP_PARTS = new Set(["WG", "RG", "YG"]);

    const entries: Array<{
      parentSku: string | null;
      builderView: string;
      selectedImage: string | null;
      variants: { sku: string }[];
    }> = [];

    for (const row of builderRows) {
      const parentSkuRaw = (row.parentSku || "").toString().trim();
      const builderViewRaw = (row.builderView || "").toString().trim();
      if (!builderViewRaw) continue;

      const parentSku = parentSkuRaw.toUpperCase();
      const builderView = builderViewRaw.toUpperCase();

      // split and trim parts, then stop before any STOP_PARTS (WG, RG, YG)
      const rawParts = builderView
        .split("-")
        .map((p) => p.trim())
        .filter(Boolean);
      let parts: string[] = [];
      for (const p of rawParts) {
        const pu = p.toUpperCase();
        if (STOP_PARTS.has(pu)) break;
        parts.push(pu);
      }
      if (parts.length === 0) parts = rawParts.slice();

      // Build prefixRegexStr
      let prefixRegexStr: string;
      if (parts.length >= 3) {
        const p0 = escapeRegExp(parts[0]);
        const p1 = escapeRegExp(parts[1]);
        const thirdRaw = parts[2];

        if (/^\d+$/.test(thirdRaw)) {
          const thirdDigits = thirdRaw.replace(/^0+/, "") || thirdRaw;
          prefixRegexStr = `^${p0}-${p1}-0*${escapeRegExp(thirdDigits)}`;
        } else {
          const firstThree = escapeRegExp(parts.slice(0, 3).join("-"));
          prefixRegexStr = `^${firstThree}`;
        }
      } else if (parts.length > 0) {
        const joined = escapeRegExp(parts.join("-"));
        prefixRegexStr = `^${joined}`;
      } else {
        prefixRegexStr = `^${escapeRegExp(builderView)}`;
      }

      // Query clauses
      const skuClause = { sku: { $regex: prefixRegexStr, $options: "i" } };
      const modelSkuClause = parentSku
        ? { modelSku: { $regex: `^${escapeRegExp(parentSku)}`, $options: "i" } }
        : null;

      // 1) Try modelSku + sku
      let matchedVariants: any[] = [];
      if (modelSkuClause) {
        matchedVariants = await variantsColl
          .find({ $and: [modelSkuClause, skuClause] })
          .project({ sku: 1, images: 1 })
          .toArray();
      }

      // 2) Fallback: sku-only
      if (!matchedVariants || matchedVariants.length === 0) {
        matchedVariants = await variantsColl
          .find({ sku: skuClause.sku })
          .project({ sku: 1, images: 1 })
          .toArray();
      }

      // 3) Last ditch: contains match on the whole builderView
      if (!matchedVariants || matchedVariants.length === 0) {
        matchedVariants = await variantsColl
          .find({ sku: { $regex: escapeRegExp(builderView), $options: "i" } })
          .project({ sku: 1, images: 1 })
          .toArray();
      }

      // Select image: prefer image whose filename/url contains the original builderView (full)
      let selectedImage: string | null = null;
      for (const v of matchedVariants) {
        const imgs = Array.isArray(v.images) ? v.images : [];
        if (!imgs.length) continue;
        for (const img of imgs) {
          const candidate = (img?.url ?? img?.filename ?? img) as
            | string
            | undefined;
          if (!candidate) continue;
          const name = candidate.split("/").pop() || candidate;
          const dot = name.lastIndexOf(".");
          const basename = dot === -1 ? name : name.slice(0, dot);
          const candUpper = (
            candidate +
            "|" +
            name +
            "|" +
            basename
          ).toUpperCase();
          if (candUpper.includes(builderView)) {
            selectedImage = candidate;
            break;
          }
        }
        if (selectedImage) break;
      }

      // Fallback to first available image
      if (!selectedImage) {
        const v = matchedVariants.find(
          (x: any) => Array.isArray(x.images) && x.images.length,
        );
        if (v) {
          const first = v.images[0];
          selectedImage = (first?.url ?? first?.filename ?? first) || null;
        }
      }

      const variantsOut = (matchedVariants || []).map((v: any) => ({
        sku: v.sku,
      }));

      entries.push({
        parentSku: parentSku || null,
        builderView: builderViewRaw,
        selectedImage,
        variants: variantsOut,
      });
    }

    return res.json({
      success: true,
      stylingName,
      count: entries.length,
      entries,
    });
  } catch (err) {
    console.error("getBuilderVariants error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err instanceof Error ? err.message : String(err),
    });
  }
};
