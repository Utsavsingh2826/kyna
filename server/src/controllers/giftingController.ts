import { Request, Response } from 'express';
import mongoose, { Connection, Model, Document } from 'mongoose';

// ---------- Helpers ----------
const getCatalogConnection = (): Connection => {
  const dbName = (process.env.MONGO_DB_NAME || 'catalog').toString();
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
  '18': 0.76,
  '14': 0.6,
  '9': 0.375,
};

const toNumberRobust = (v: unknown): number => {
  if (v == null) return NaN;
  if (typeof v === 'number') return Number.isFinite(v) ? v : NaN;
  if (typeof v === 'string') {
    const cleaned = v.replace(/[₹$,£€\s]/g, '').replace(/,/g, '');
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

export const getGiftingProducts = async (req: Request, res: Response) => {
  try {
    let min = 0;
    let max = 500000;

    // Support multiple query formats:
    // 1. ?minPrice=0&maxPrice=25000
    // 2. ?range=0-25000
    // 3. ?0-25000 (as a query key)
    // 4. ?category=rings (for category filtering)
    const { minPrice, maxPrice, range, category } = req.query;

    console.log(`📥 [GIFTING] Received query params:`, {
      minPrice,
      maxPrice,
      range,
      category,
      allParams: req.query
    });

    if (minPrice && maxPrice) {
      // Format 1: Traditional minPrice/maxPrice
      min = parseFloat(minPrice as string);
      max = parseFloat(maxPrice as string);
      console.log(`✅ [GIFTING] Using minPrice/maxPrice format: ${min} - ${max}`);
    } else if (range) {
      // Format 2: ?range=0-25000
      const rangeParts = (range as string).split('-');
      if (rangeParts.length === 2) {
        min = parseFloat(rangeParts[0]);
        max = parseFloat(rangeParts[1]);
        console.log(`✅ [GIFTING] Using range format: ${min} - ${max}`);
      }
    } else {
      // Format 3: Check for range as query key (e.g., ?0-25000)
      const rangeKey = Object.keys(req.query).find(key => key.includes('-') && /^\d+-\d+$/.test(key));
      if (rangeKey) {
        const rangeParts = rangeKey.split('-');
        if (rangeParts.length === 2) {
          min = parseFloat(rangeParts[0]);
          max = parseFloat(rangeParts[1]);
          console.log(`✅ [GIFTING] Using rangeKey format: ${min} - ${max}`);
        }
      }
    }

    if (isNaN(min) || isNaN(max) || min < 0 || max < min) {
      return res.status(400).json({
        success: false,
        message: 'Invalid price range. Price range must be valid numbers with min <= max. Supported formats: ?minPrice=0&maxPrice=25000, ?range=0-25000, or ?0-25000'
      });
    }

    console.log(`🔍 [GIFTING] Querying products with price range: ${min} - ${max}`);
    console.log(`📄 [GIFTING] Page: ${req.query.page || 1}, Limit: ${req.query.limit || 20}`);

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const VariantModel = getCollectionModel('variants2');
    const ProductModel = getCollectionModel('products2');

    console.log(`🗄️ [GIFTING] Using collections: variants2, products2`);

    // Build match criteria for category filter
    const matchCriteria: any = {};
    if (category && typeof category === 'string') {
      // Normalize category (singularize for better matching)
      let term = category.toLowerCase();
      if (term.endsWith('s')) term = term.slice(0, -1);

      // Use regex with word boundaries to avoid partial matches
      // ie. "ring" will NOT match "earring"
      const regexPattern = `\\b${term}s?\\b`;

      matchCriteria.$or = [
        { title: { $regex: regexPattern, $options: 'i' } },
        { category: { $regex: regexPattern, $options: 'i' } }
      ];
      console.log(`🏷️ [GIFTING] Filtering by strict keyword: "${term}" (regex: ${regexPattern})`);
    }

    // Build aggregation pipeline to get products
    const pipeline: any[] = [
      // Match variants by category if specified
      { $match: matchCriteria },

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

      // Group by parentSku to get unique products
      {
        $group: {
          _id: '$parentSku',
          firstVariant: { $first: '$$ROOT' },
        },
      },

      // Sort for consistency
      { $sort: { _id: 1 } },

      // Lookup product metadata
      {
        $lookup: {
          from: 'products2',
          localField: '_id',
          foreignField: 'parentSku',
          as: 'product',
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
      { $unwind: { path: '$product', preserveNullAndEmptyArrays: false } },
    ];

    // Get all results for pricing calculation
    const allResults = await VariantModel.aggregate(pipeline)
      .allowDiskUse(true)
      .exec();
    console.log(`✅ [GIFTING] Aggregation complete. Found ${allResults.length} total variants`);

    // Process with pricing calculation and price filtering
    const allProducts = await processProductsWithPricing(
      allResults,
      min,
      max,
    );
    console.log(`💰 [GIFTING] After price filtering (${min}-${max}): ${allProducts.length} products`);

    // Apply pagination
    const totalFiltered = allProducts.length;
    const totalPages = Math.ceil(totalFiltered / limit);
    const paged = allProducts.slice(skip, skip + limit);

    console.log(`� [GIFTING] Pagination: Returning ${paged.length} products (page ${page}/${totalPages}, skip ${skip}, limit ${limit})`);
    console.log(`💰 [GIFTING] Sample prices:`, paged.slice(0, 3).map(p => ({ title: p.title, price: p.price })));

    res.json({
      success: true,
      count: paged.length,
      total: totalFiltered,
      pagination: {
        currentPage: page,
        totalPages,
        limit,
        total: totalFiltered
      },
      priceRange: `${min}-${max}`,
      data: paged.map(product => ({
        id: product._id,
        name: product.title,
        price: product.price,
        rating: 0,
        image: product.image,
        category: product.category,
        subCategory: product.subCategory,
        modelSku: product.modelSku,
        variantSku: product.variantSku
      }))
    });
  } catch (error) {
    console.error('Error fetching gifting products:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch gifting products',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Process products with pricing calculation (simplified version of productController logic)
 */
async function processProductsWithPricing(
  allResults: any[],
  minPrice: number,
  maxPrice: number,
): Promise<any[]> {
  console.log(`💰 [GIFTING] processProductsWithPricing called with minPrice: ${minPrice}, maxPrice: ${maxPrice}`);

  const conn = getCatalogConnection();
  const pricingColl = conn.collection('pricing');
  // Get defaults once with fallbacks
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

  const mergedDefaults: Record<string, any> = Object.assign(
    {},
    ...defaultDocs.map((d) => {
      const c = { ...d };
      delete (c as any)._id;
      return c;
    }),
  );

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

  // Collect all unique pricing sequences
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

  // Batch fetch ALL pricing data in ONE query
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

  // Process all products
  const products: any[] = [];

  for (const row of allResults) {
    const variant = row.firstVariant;
    const product = row.product;

    // Get image - use SAME logic as productController (product listing page)
    // Priority: YG+GP > YG+FV > dual-YG+GP > dual-YG+FV > triple-tone+GP > triple-tone+FV > any YG
    let imageUrl: string | null = null;
    let hoverImageUrl: string | null = null;
    if (Array.isArray(variant.images) && variant.images.length > 0) {
      const upperImages = variant.images.map((i: any) => ({
        raw: i,
        url: (i?.url || i?.filename || '').toUpperCase(),
      }));

      // helpers - same as productController
      const isPureYG = (u: string) =>
        u.includes('YG') && !u.includes('WG') && !u.includes('RG') && !u.includes('BG');
      const isDualYG = (u: string) =>
        u.includes('YG') && (u.includes('WG') || u.includes('RG') || u.includes('BG'));
      const isTripleTone = (u: string) =>
        ['YG', 'WG', 'RG', 'BG'].filter(m => u.includes(m)).length >= 3;

      const img =
        upperImages.find(i => isPureYG(i.url) && i.url.includes('GP')) ||
        upperImages.find(i => isPureYG(i.url) && i.url.includes('FV')) ||

        upperImages.find(i => isDualYG(i.url) && i.url.includes('GP')) ||
        upperImages.find(i => isDualYG(i.url) && i.url.includes('FV')) ||

        upperImages.find(i => isTripleTone(i.url) && i.url.includes('GP')) ||
        upperImages.find(i => isTripleTone(i.url) && i.url.includes('FV')) ||

        upperImages.find(i => i.url.includes('YG')) || // final YG fallback
        null;

      imageUrl = img?.raw?.url || img?.raw?.filename || null;

      // Hover image: pick a different-angle image in the same metal color
      if (img && upperImages.length > 1) {
        const mainRaw = (imageUrl || "").toUpperCase();
        const metalFilter = mainRaw.includes("YG") ? "YG"
          : mainRaw.includes("WG") ? "WG"
          : mainRaw.includes("RG") ? "RG"
          : null;
        const hoverViewCodes: Record<string, string[]> = {
          RINGS:     ["FV", "SV", "BV", "TRV", "NBV"],
          EARRINGS:  ["SIDE", "BACK", "AV", "BV", "BCV", "FV", "SV"],
          PENDANTS:  ["NBV", "TRV", "BV", "SV", "45", "FV"],
          BRACELETS: ["FV", "TRV", "TLV", "SV", "BV"],
        };
        const productCategory = (variant.category || "").toUpperCase();
        const viewCodesToTry = hoverViewCodes[productCategory] || ["FV", "SV", "BV", "TRV", "NBV"];
        for (const viewCode of viewCodesToTry) {
          const candidate = upperImages.find(
            (i: any) => i.url.includes(viewCode)
              && (!metalFilter || i.url.includes(metalFilter))
              && (i.raw?.url || i.raw?.filename) !== imageUrl
          );
          if (candidate) {
            hoverImageUrl = candidate.raw?.url || candidate.raw?.filename || null;
            break;
          }
        }
      }
    }

    // Calculate price
    let sellingPrice: number | null = null;
    let priceIncomplete = true;

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

      // NOTE: variant.expense is considered "old" and is being replaced by 
      // the metal-specific expenses from defaultvalues (goldExpense, silverExpense, etc.)
      /*
      const variantExpense = toNumberRobust(variant.expense);
      if (!Number.isNaN(variantExpense)) {
        diamondCost += variantExpense;
      }
      */

      const metalType = (variant.metalType || 'GOLD').toString().toUpperCase();

      let karatStr = variant.metalKt || '18KT';
      const karatNum = Number(String(karatStr).match(/\d+/)?.[0] || 18);

      let metalWeightGrams = toNumberRobust(variant.netWeightInGrams);

      let metalPricePerGram = NaN;
      if (metalType === 'GOLD' && !Number.isNaN(goldValue24)) {
        const factor = KARAT_FACTOR[String(karatNum)] ?? KARAT_FACTOR['18'];
        metalPricePerGram = goldValue24 * factor;
      } else if (metalType === 'SILVER') {
        metalPricePerGram = silverPricePerGram;
      } else if (metalType === 'PLATINUM') {
        metalPricePerGram = platinumPricePerGram;
      } else if (metalType === 'TITANIUM') {
        metalPricePerGram = titaniumPricePerGram;
      }

      let metalCost = 0;
      let labourCost = 0;
      let additionalExpense = 0;
      let metalIncomplete = false;

      if (!Number.isNaN(metalWeightGrams) && !Number.isNaN(metalPricePerGram)) {
        metalCost = metalPricePerGram * metalWeightGrams;

        // Get labour cost based on metal type
        if (metalType === 'GOLD') {
          labourCost = !Number.isNaN(labourCostGold)
            ? Math.round(labourCostGold * metalWeightGrams)
            : 0;
          additionalExpense = !Number.isNaN(goldExpense) ? goldExpense : 0;
        } else if (metalType === 'SILVER') {
          labourCost = !Number.isNaN(labourCostSilver)
            ? Math.round(labourCostSilver * metalWeightGrams)
            : 0;
          additionalExpense = !Number.isNaN(silverExpense) ? silverExpense : 0;
        } else if (metalType === 'PLATINUM') {
          labourCost = !Number.isNaN(labourCostPlatinum)
            ? Math.round(labourCostPlatinum * metalWeightGrams)
            : 0;
          additionalExpense = !Number.isNaN(platinumExpense)
            ? platinumExpense
            : 0;
        } else if (metalType === 'TITANIUM') {
          labourCost = !Number.isNaN(labourCostTitanium)
            ? Math.round(labourCostTitanium * metalWeightGrams)
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
      const calculatedPrice = basePrice * gstMultiplier;

      sellingPrice =
        !Number.isNaN(calculatedPrice) && calculatedPrice > 0
          ? Math.round(calculatedPrice)
          : null;
      priceIncomplete = metalIncomplete || diamondIncomplete;
    } catch (err) {
      sellingPrice = null;
      priceIncomplete = true;
    }

    // Price filter - CRITICAL: Only include products within the price range
    if (
      !Number.isNaN(minPrice) &&
      (sellingPrice === null || sellingPrice < minPrice)
    ) {
      // Debug: Log filtered out products
      if (products.length < 10) {
        console.log(`⏭️ [GIFTING] Skipping ${row.product?.title || 'Unknown'}: price ${sellingPrice} < min ${minPrice}`);
      }
      continue;
    }
    if (
      !Number.isNaN(maxPrice) &&
      (sellingPrice === null || sellingPrice > maxPrice)
    ) {
      // Debug: Log filtered out products
      if (products.length < 10) {
        console.log(`⏭️ [GIFTING] Skipping ${row.product?.title || 'Unknown'}: price ${sellingPrice} > max ${maxPrice}`);
      }
      continue;
    }

    // Log first few products that pass the filter
    if (products.length < 10) {
      console.log(`✅ [GIFTING] Including product: ${row.product?.title || 'Unknown'}, price: ${sellingPrice}, range: ${minPrice}-${maxPrice}`);
    }

    products.push({
      _id: product._id,
      modelSku: product.parentSku,
      variantSku: variant.variantSku,
      title: variant.title || product.title || null,
      price: sellingPrice,
      image: imageUrl,
      hoverImageUrl: hoverImageUrl,
      category: variant.category,
      subCategory: variant.category,
      priceIncomplete,
    });
  }

  return products;
}
