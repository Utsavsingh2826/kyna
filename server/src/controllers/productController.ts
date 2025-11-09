import { Request, Response } from "express";
import mongoose, { Connection, Model, Document } from "mongoose";

// ---------- Helpers ----------
const getCatalogConnection = (): Connection => {
  const dbName = (process.env.MONGO_DB_NAME || "catalog").toString();
  return mongoose.connection.useDb(dbName, { useCache: true });
};

const getCollectionModel = (collectionName: string): Model<Document> => {
  const conn = getCatalogConnection();
  const modelName = `${collectionName}_model`;
  if ((conn.models as any)[modelName]) return (conn.models as any)[modelName];
  const schema = new mongoose.Schema({}, { strict: false, collection: collectionName });
  return conn.model<Document>(modelName, schema, collectionName);
};

const KARAT_FACTOR: Record<string, number> = { "18": 0.76, "14": 0.6, "9": 0.375 };
const LABOUR_RATE: Record<string, number> = {
  GOLD: 2200,
  SILVER: 1300,
  PLATINUM: 3500,
  TITANIUM: 3500,
};

const n = (v: any): number =>
  typeof v === "number" ? v : typeof v === "string" && v.trim() !== "" ? Number(v) : NaN;

const parseNumeric = (v: any): number => {
  if (v == null) return NaN;
  if (typeof v === "number") return v;
  const cleaned = String(v).replace(/[,₹\s]/g, "");
  return Number(cleaned) || NaN;
};


export const getProductsByCategory = async (req: Request, res: Response) => {
  try {
    const rawCategory = (req.params.category || "").toString();
    if (!rawCategory) return res.status(400).json({ success: false, message: "Category required" });
    const category = rawCategory.toUpperCase();

    const page = Math.max(1, parseInt((req.query.page as string) || "1", 10));
    const limit = Math.max(1, Math.min(100, parseInt((req.query.limit as string) || "50", 10)));
    const skip = (page - 1) * limit;

    // Price filters
    const minPrice = n(req.query.minPrice);
    const maxPrice = n(req.query.maxPrice);

    // centerStoneShape - always passed as centerStoneShape
    const shapesRaw = (req.query.centerStoneShape || "").toString().trim();
    const shapesUpper = shapesRaw ? shapesRaw.split(",").map(s => s.trim().toUpperCase()) : [];

    // ringType / ring -> SKU prefixes (for rings)
    const ringRaw = (req.query.ringType || req.query.ring || "").toString().trim();
    const ringTokens = ringRaw ? ringRaw.split(",").map((s) => s.trim()) : [];
    const mapRingTypeToPrefixes = (token: string): string[] => {
      const t = token.trim().toLowerCase().replace(/[-_\s]+/g, "");
      if (["engagement","eng","engring","engagementring","engagement-ring"].includes(t)) return ["ENG"];
      if (["solitaire","sol","sr","solitairering","solitaire-ring"].includes(t)) return ["SR"];
      if (["fashion","fash","fr","fashionring","fashion-ring"].includes(t)) return ["FR"];
      if (["men","mens","gr","menring","men-ring"].includes(t)) return ["GR"];
      if (/^(eng|sr|fr|gr)$/i.test(t)) return [t.toUpperCase()];
      return [];
    };
    const ringPrefixes = Array.from(new Set(ringTokens.flatMap(mapRingTypeToPrefixes)));

    // category1/category2/category3 filters (substring, case-insensitive)
    const parseCatParam = (v: any) =>
      v ? String(v).split(",").map((s: string) => s.trim()).filter(Boolean).map((x: string) => x.toUpperCase()) : [];
    const cat1Filters = parseCatParam(req.query.category1);
    const cat2Filters = parseCatParam(req.query.category2);
    const cat3Filters = parseCatParam(req.query.category3);

    // metalTypes filter (comma-separated, case-insensitive)
    const parseMetalParam = (v: any) =>
      v ? String(v).split(",").map((s: string) => s.trim().toUpperCase()).filter(Boolean) : [];
    const metalFilters = parseMetalParam(req.query.metalTypes);

    // NEW: isEngraving filter (only meaningful for RINGS)
    const isEngravingRaw = (req.query.isEngraving ?? "").toString().trim().toLowerCase();
    const isEngraving = isEngravingRaw === "true" || isEngravingRaw === "1" || isEngravingRaw === "yes";

    // helpers
    const normalizeStr = (s: any): string => {
      if (s == null) return "";
      return String(s).replace(/[^\w\s]/g, " ").replace(/\s+/g, " ").trim().toUpperCase();
    };

    const centerShapeArrayExpr = {
      $cond: [
        { $isArray: "$attributes.centerStoneShape" },
        "$attributes.centerStoneShape",
        {
          $cond: [
            { $in: ["$attributes.centerStoneShape", [null]] },
            [],
            ["$attributes.centerStoneShape"]
          ]
        }
      ]
    };

    // categories that require variant-dependent checks and pricing
    const VARIANT_PRICE_CATEGORIES = new Set(["RINGS", "EARRINGS", "PENDANTS", "BRACELETS"]);

    const variantDependentFilterPresent =
      shapesUpper.length > 0 ||
      ringPrefixes.length > 0 ||
      (VARIANT_PRICE_CATEGORIES.has(category) && (!Number.isNaN(minPrice) || !Number.isNaN(maxPrice)));

    // Build aggregation pipeline
    const pipeline: any[] = [{ $match: { category } }];

    // ring/sku-prefix filter
    if ((category === "RINGS" || category === "EARRINGS" || category === "PENDANTS" || category === "BRACELETS") && ringPrefixes.length > 0) {
      const prefixExprs = ringPrefixes.map(prefix => ({
        $regexMatch: { input: { $ifNull: ["$modelSku", ""] }, regex: `^${prefix}`, options: "i" }
      }));
      pipeline.push({ $match: { $expr: { $or: prefixExprs } } });
    }

    // attribute category filters (substring)
    if (cat1Filters.length > 0) {
      pipeline.push({ $match: { $or: cat1Filters.map(v => ({ "attributes.category1": { $regex: v, $options: "i" } })) } });
    }
    if (cat2Filters.length > 0) {
      pipeline.push({ $match: { $or: cat2Filters.map(v => ({ "attributes.category2": { $regex: v, $options: "i" } })) } });
    }
    if (cat3Filters.length > 0) {
      pipeline.push({ $match: { $or: cat3Filters.map(v => ({ "attributes.category3": { $regex: v, $options: "i" } })) } });
    }

    // metalTypes DB-level filter (matches if any attribute metalType equals requested metals)
    if (metalFilters.length > 0) {
      pipeline.push({
        $match: {
          $expr: {
            $gt: [
              {
                $size: {
                  $filter: {
                    input: { $ifNull: ["$attributes.metalTypes", []] },
                    as: "mt",
                    cond: { $in: [{ $toUpper: "$$mt" }, metalFilters] }
                  }
                }
              },
              0
            ]
          }
        }
      });
    }

    // NEW: isEngraving DB-level filter (only for RINGS)
    if (category === "RINGS" && isEngraving) {
      // require engraving.maxCharacters > 0
      pipeline.push({ $match: { "engraving.maxCharacters": { $gt: 0 } } });
    }

    // DB-level shape match only for categories where attributes.centerStoneShape is authoritative
    if (shapesUpper.length > 0 && category !== "EARRINGS" && category !== "PENDANTS") {
      pipeline.push({
        $match: {
          $expr: {
            $gt: [
              {
                $size: {
                  $filter: {
                    input: centerShapeArrayExpr,
                    as: "sh",
                    cond: { $in: [{ $toUpper: "$$sh" }, shapesUpper] }
                  }
                }
              },
              0
            ]
          }
        }
      });
    }

    // Project + lookup first variant — include engraving fields in projection
    pipeline.push(
      {
        $project: {
          modelSku: 1,
          "attributes.metalTypes": 1,
          "attributes.goldKarats": 1,
          "attributes.centerStoneShape": 1,
          "attributes.category1": 1,
          "attributes.category2": 1,
          "attributes.category3": 1,
          "seo.metaTitle": 1,
          slug: 1,
          engraving: 1, // include engraving object (so we can return fontSize/maxCharacters)
          firstVariantSku: { $arrayElemAt: ["$variantIds", 0] },
          variantCount: { $size: { $ifNull: ["$variantIds", []] } },
        },
      },
      {
        $lookup: {
          from: "variants",
          localField: "firstVariantSku",
          foreignField: "sku",
          as: "firstVariantDoc",
        },
      },
      { $unwind: { path: "$firstVariantDoc", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          modelSku: 1,
          metalTypes: "$attributes.metalTypes",
          goldKarats: "$attributes.goldKarats",
          title: "$seo.metaTitle",
          slug: 1,
          variantCount: 1,
          firstVariantSku: 1,
          firstVariantDoc: 1,
          attributesCenterShape: "$attributes.centerStoneShape",
          attributesCategory1: "$attributes.category1",
          attributesCategory2: "$attributes.category2",
          attributesCategory3: "$attributes.category3",
          engraving: 1
        },
      }
    );

    pipeline.push({ $sort: { modelSku: 1 } });
    if (!variantDependentFilterPresent) pipeline.push({ $skip: skip }, { $limit: limit });

    const ProductModel = getCollectionModel("products");
    const docs = await ProductModel.aggregate(pipeline).allowDiskUse(true).exec();

    // Prepare pricing/defaults
    const conn = getCatalogConnection();
    const finalPricingColl = conn.collection("final_pricing");
    const defaultsColl = conn.collection("defaultValues");
    const defaultVals: Record<string, any> = (await defaultsColl.findOne({})) || {};
    const goldValue24 = n(defaultVals.goldValue24) || NaN;
    const silverPricePerGram = n(defaultVals.silverPricePerGram) || NaN;
    const platinumPricePerGram = n(defaultVals.platinumPricePerGram) || NaN;
    const titaniumPricePerGram = n(defaultVals.titaniumPricePerGram) || NaN;

    const normalized: any[] = [];

    for (const d of docs) {
      // image
      let imageUrl: string | null = null;
      if (Array.isArray(d.firstVariantDoc?.images) && d.firstVariantDoc.images.length > 0) {
        const img = d.firstVariantDoc.images[1] ?? d.firstVariantDoc.images[1];
        if (img) imageUrl = (img.url ?? img.filename) || null;
      }

      const engravingObj = d.engraving ?? null;
      const engravingMaxChars = engravingObj && typeof engravingObj.maxCharacters === "number" ? engravingObj.maxCharacters : null;
      const engravingFontSize = engravingObj && engravingObj.fontSize != null ? engravingObj.fontSize : null;

      const baseOut: any = {
        modelSku: d.modelSku,
        metalTypes: Array.isArray(d.metalTypes) ? d.metalTypes : (d.metalTypes ? [d.metalTypes] : []),
        title: d.title ?? null,
        slug: d.slug ?? null,
        variantCount: d.variantCount ?? 0,
        firstVariantSku: d.firstVariantSku ?? null,
        firstVariantImageUrl: imageUrl,
        attributesCategory1: d.attributesCategory1 ?? null,
        attributesCategory2: d.attributesCategory2 ?? null,
        attributesCategory3: d.attributesCategory3 ?? null,
        // engraving fields returned only for rings (per request) — keep null otherwise
        engravingMaxCharacters: category === "RINGS" ? engravingMaxChars : null,
        engravingFontSize: category === "RINGS" ? engravingFontSize : null,
        sellingPrice: null,
        priceIncomplete: true,
      };

      // If isEngraving filter requested but engraving info missing or maxCharacters <= 0, skip.
      if (category === "RINGS" && isEngraving) {
        if (!engravingMaxChars || engravingMaxChars <= 0) {
          // product should have been filtered out at DB-level, but double-check here and skip
          continue;
        }
      }

      // SHAPE check (JS-side for EARRINGS and PENDANTS; extra check for other categories too)
      if (shapesUpper.length > 0) {
        const productShapes: string[] = [];
        if (d.attributesCenterShape) {
          if (Array.isArray(d.attributesCenterShape)) productShapes.push(...d.attributesCenterShape.map((s: any) => normalizeStr(s)));
          else productShapes.push(normalizeStr(d.attributesCenterShape));
        }

        const variant = d.firstVariantDoc;
        const variantShapes: string[] = [];
        if (variant) {
          const stonesArr: any[] =
            Array.isArray(variant?.meta?.stones) && variant.meta.stones.length
              ? variant.meta.stones
              : Array.isArray(variant?.stones)
                ? variant.stones
                : [];

          for (const st of stonesArr) {
            if (category === "EARRINGS" || category === "PENDANTS") {
              if (st?.diamondGemstoneShapes) {
                if (Array.isArray(st.diamondGemstoneShapes)) variantShapes.push(...st.diamondGemstoneShapes.map((x: any) => normalizeStr(x)));
                else variantShapes.push(normalizeStr(st.diamondGemstoneShapes));
              }
              if (st?.diamondGemstoneShape) variantShapes.push(normalizeStr(st.diamondGemstoneShape));
            } else if (category === "BRACELETS") {
              if (st?.centerStoneShape) variantShapes.push(normalizeStr(st.centerStoneShape));
              if (st?.diamondGemstoneShapes) {
                if (Array.isArray(st.diamondGemstoneShapes)) variantShapes.push(...st.diamondGemstoneShapes.map((x: any) => normalizeStr(x)));
                else variantShapes.push(normalizeStr(st.diamondGemstoneShapes));
              }
            } else {
              if (st?.centerStoneShape) variantShapes.push(normalizeStr(st.centerStoneShape));
              if (st?.diamondGemstoneShapes) {
                if (Array.isArray(st.diamondGemstoneShapes)) variantShapes.push(...st.diamondGemstoneShapes.map((x: any) => normalizeStr(x)));
                else variantShapes.push(normalizeStr(st.diamondGemstoneShapes));
              }
              if (st?.diamondGemstoneShape) variantShapes.push(normalizeStr(st.diamondGemstoneShape));
            }

            if (Array.isArray(st?.sequences)) {
              for (const seq of st.sequences) {
                if (category === "EARRINGS" || category === "PENDANTS") {
                  if (seq?.diamondGemstoneShapes) {
                    if (Array.isArray(seq.diamondGemstoneShapes)) variantShapes.push(...seq.diamondGemstoneShapes.map((x: any) => normalizeStr(x)));
                    else variantShapes.push(normalizeStr(seq.diamondGemstoneShapes));
                  }
                  if (seq?.diamondGemstoneShape) variantShapes.push(normalizeStr(seq.diamondGemstoneShape));
                } else if (category === "BRACELETS") {
                  if (seq?.centerStoneShape) variantShapes.push(normalizeStr(seq.centerStoneShape));
                  if (seq?.diamondGemstoneShapes) {
                    if (Array.isArray(seq.diamondGemstoneShapes)) variantShapes.push(...seq.diamondGemstoneShapes.map((x: any) => normalizeStr(x)));
                    else variantShapes.push(normalizeStr(seq.diamondGemstoneShapes));
                  }
                } else {
                  if (seq?.centerStoneShape) variantShapes.push(normalizeStr(seq.centerStoneShape));
                  if (seq?.diamondGemstoneShapes) {
                    if (Array.isArray(seq.diamondGemstoneShapes)) variantShapes.push(...seq.diamondGemstoneShapes.map((x: any) => normalizeStr(x)));
                    else variantShapes.push(normalizeStr(seq.diamondGemstoneShapes));
                  }
                  if (seq?.diamondGemstoneShape) variantShapes.push(normalizeStr(seq.diamondGemstoneShape));
                }
              }
            }
          }
        }

        const combinedShapes = Array.from(new Set([...productShapes, ...variantShapes].filter(Boolean)));
        const targets = shapesUpper.map(t => normalizeStr(t));
        const matched = combinedShapes.some(h => targets.some(t => t && (h === t || h.includes(t) || t.includes(h))));
        if (!matched) continue;
      }

      // PRICE calc for VARIANT_PRICE_CATEGORIES
      if (VARIANT_PRICE_CATEGORIES.has(category) && d.firstVariantDoc) {
        try {
          const variant = d.firstVariantDoc;
          const stonesArr: any[] =
            Array.isArray(variant?.meta?.stones) && variant.meta.stones.length
              ? variant.meta.stones
              : Array.isArray(variant?.stones)
                ? variant.stones
                : [];

          const includedStones: { sequence: string; cts: number; netWeightGrams: number | null }[] = [];
          for (let i = 0; i < stonesArr.length; i++) {
            const st = stonesArr[i];
            const seq = st?.sequence || (Array.isArray(st?.sequences) && st.sequences[0]?.sequence) || st?.sequenceNo;
            if (!seq) continue;
            const cts = typeof st?.cts === "number" ? st.cts : (Array.isArray(st?.sequences) && typeof st.sequences[0]?.cts === "number" ? st.sequences[0].cts : null);
            if (cts == null) continue;
            const net = st?.netWeightGrams != null ? n(st.netWeightGrams) : null;
            if (i > 0 && net !== null) break;
            includedStones.push({ sequence: seq, cts, netWeightGrams: net });
          }

          let diamondCost = 0;
          let diamondIncomplete = false;
          for (const st of includedStones) {
            const pricingDoc: any = (await finalPricingColl.findOne({ sequence: st.sequence })) || {};
            const pricePerCt = parseNumeric(pricingDoc.selling_price ?? pricingDoc.sellingPrice ?? pricingDoc.price);
            if (Number.isNaN(pricePerCt)) {
              diamondIncomplete = true;
              continue;
            }
            diamondCost += pricePerCt * st.cts;
          }

          const metalType =
            (variant?.meta?.metalType || (Array.isArray(d.metalTypes) ? d.metalTypes[0] : d.metalTypes) || "GOLD").toString().toUpperCase();
          let karatStr = variant?.meta?.metalKt || (Array.isArray(d.goldKarats) ? d.goldKarats[0] : d.goldKarats) || "18";
          const karatNum = Number(String(karatStr).match(/\d+/)?.[0] || 18);

          let metalWeightGrams: number | null =
            variant?.meta?.metalWeightGrams != null ? n(variant.meta.metalWeightGrams) : variant?.netWeightGrams != null ? n(variant.netWeightGrams) : null;
          if ((metalWeightGrams == null || Number.isNaN(metalWeightGrams)) && includedStones.length) {
            const sum = includedStones.reduce((acc, s) => acc + (s.netWeightGrams ? Number(s.netWeightGrams) : 0), 0);
            metalWeightGrams = sum > 0 ? sum : null;
          }

          let metalPricePerGram = NaN;
          if (metalType === "GOLD" && !Number.isNaN(goldValue24)) {
            const factor = KARAT_FACTOR[String(karatNum)] ?? KARAT_FACTOR["18"];
            metalPricePerGram = goldValue24 * factor;
          } else if (metalType === "SILVER") metalPricePerGram = silverPricePerGram;
          else if (metalType === "PLATINUM") metalPricePerGram = platinumPricePerGram;
          else if (metalType === "TITANIUM") metalPricePerGram = titaniumPricePerGram;

          let metalCost = 0, labourCost = 0, metalIncomplete = false;
          if (metalWeightGrams && !Number.isNaN(metalPricePerGram)) {
            metalCost = metalPricePerGram * metalWeightGrams;
            labourCost = LABOUR_RATE[metalType] ?? LABOUR_RATE.GOLD; // flat fee
          } else metalIncomplete = true;

          const sellingPrice = metalCost + diamondCost + labourCost;
          baseOut.sellingPrice = !Number.isNaN(sellingPrice) && sellingPrice > 0 ? Math.round(sellingPrice) : null;
          baseOut.priceIncomplete = metalIncomplete || diamondIncomplete;
        } catch (err) {
          baseOut.sellingPrice = null;
          baseOut.priceIncomplete = true;
        }
      }

      normalized.push(baseOut);
    }

    // Apply min/max price filter for VARIANT_PRICE_CATEGORIES
    let filtered = normalized;
    const shouldApplyPriceFilter = VARIANT_PRICE_CATEGORIES.has(category) && (!Number.isNaN(minPrice) || !Number.isNaN(maxPrice));
    if (shouldApplyPriceFilter) {
      filtered = normalized.filter(p => {
        if (p.priceIncomplete || !p.sellingPrice) return false;
        if (!Number.isFinite(p.sellingPrice)) return false;
        if (!Number.isNaN(minPrice) && p.sellingPrice < minPrice) return false;
        if (!Number.isNaN(maxPrice) && p.sellingPrice > maxPrice) return false;
        return true;
      });
    }

    // Pagination in JS when variant-dependent filters present (we fetched unpaginated)
    let paged = filtered;
    let totalFiltered = filtered.length;
    if (variantDependentFilterPresent) {
      paged = filtered.slice(skip, skip + limit);
      totalFiltered = filtered.length;
    }

    const conn2 = getCatalogConnection();
    const total = await conn2.collection("products").countDocuments({ category });

    return res.status(200).json({
      success: true,
      count: paged.length,
      total,
      pagination: { totalPages: Math.ceil(totalFiltered / limit), currentPage: page, limit },
      appliedFilters: {
        category,
        centerStoneShape: shapesUpper,
        ringTypeRequested: ringTokens,
        ringPrefixesApplied: ringPrefixes,
        category1: cat1Filters.length ? cat1Filters : null,
        category2: cat2Filters.length ? cat2Filters : null,
        category3: cat3Filters.length ? cat3Filters : null,
        metalTypes: metalFilters.length ? metalFilters : null,
        isEngraving: category === "RINGS" ? (isEngraving ? true : false) : null,
        minPrice: !Number.isNaN(minPrice) ? minPrice : null,
        maxPrice: !Number.isNaN(maxPrice) ? maxPrice : null,
      },
      products: paged,
    });
  } catch (err) {
    console.error("getProductsByCategory error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err instanceof Error ? err.message : String(err)
    });
  }
};







// ---------- Controller: getProductByModelSku (unchanged) ----------
// export const getProductByModelSku = async (req: Request, res: Response) => {
//   try {
//     const rawSku = (req.params.modelSku || "").toString().trim();
//     if (!rawSku) return res.status(400).json({ success: false, message: "modelSku required" });

//     const modelSku = rawSku.toUpperCase();
//     const ProductModel = getCollectionModel("products");
//     const product: any = await ProductModel.findOne({ modelSku }).lean();

//     if (!product) {
//       return res.status(404).json({ success: false, message: `Model ${modelSku} not found` });
//     }

//     const title: string | null = product?.seo?.title ?? product?.title ?? null;
//     const description: string | null = product?.description ?? null;

//     const attributes: any = product?.attributes ?? {};
//     const metalTypes: string[] = Array.isArray(attributes?.metalTypes)
//       ? attributes.metalTypes
//       : attributes?.metalTypes ? [attributes.metalTypes] : [];
//     const goldKarats: string[] = Array.isArray(attributes?.goldKarats)
//       ? attributes.goldKarats
//       : attributes?.goldKarats ? [attributes.goldKarats] : [];

//     const diamondShape: any[] = Array.isArray(attributes?.centerStoneShape)
//       ? attributes.centerStoneShape
//       : Array.isArray(attributes?.diamondShapes) ? attributes.diamondShapes : [];
//     const diamondSize: any[] = Array.isArray(attributes?.centerStoneSize)
//       ? attributes.centerStoneSize
//       : Array.isArray(attributes?.diamondSizes) ? attributes.diamondSizes : [];

//     const diamondColorClarity: any[] = Array.isArray(attributes?.diamondColorClarity)
//       ? attributes.diamondColorClarity
//       : Array.isArray(attributes?.diamondColors) ? attributes.diamondColors : [];

//     const engravingIds: any[] = Array.isArray(product?.engravingDetailIds) ? product.engravingDetailIds : [];
//     const isEngraving: boolean = engravingIds.length > 0;
//     const engraving = engravingIds;

//     const variantIds: any[] = Array.isArray(product?.variantIds) ? product.variantIds : [];
//     const variantCount: number = variantIds.length;
//     const firstVariantSku: string | null = variantCount > 0 ? variantIds[0] : null;

//     const response = {
//       success: true,
//       modelSku,
//       title,
//       description,
//       metalTypes,
//       goldKarats,
//       diamondShape,
//       diamondSize,
//       diamondColorClarity,
//       isEngraving,
//       engraving,
//       variantCount,
//       firstVariantSku,
//     };

//     return res.status(200).json(response);
//   } catch (err) {
//     console.error("getProductByModelSku error:", err);
//     return res.status(500).json({
//       success: false,
//       message: "Server error",
//       error: err instanceof Error ? err.message : String(err),
//     });
//   }
// };

// export const getProductByModelSku = async (req: Request, res: Response) => {
//   try {
//     const rawSku = (req.params.modelSku || "").toString().trim();
//     if (!rawSku) return res.status(400).json({ success: false, message: "modelSku required" });

//     const modelSku = rawSku.toUpperCase();
//     const ProductModel = getCollectionModel("products");
//     const product: any = await ProductModel.findOne({ modelSku }).lean();

//     if (!product) {
//       return res.status(404).json({ success: false, message: `Model ${modelSku} not found` });
//     }

//     // Basic metadata
//     const title: string | null = product?.seo?.title ?? product?.title ?? null;
//     const description: string | null = product?.description ?? null;

//     const attributes: any = product?.attributes ?? {};
//     const metalTypes: string[] = Array.isArray(attributes?.metalTypes)
//       ? attributes.metalTypes
//       : attributes?.metalTypes ? [attributes.metalTypes] : [];
//     const goldKarats: string[] = Array.isArray(attributes?.goldKarats)
//       ? attributes.goldKarats
//       : attributes?.goldKarats ? [attributes.goldKarats] : [];

//     const diamondShape: any[] = Array.isArray(attributes?.centerStoneShape)
//       ? attributes.centerStoneShape
//       : Array.isArray(attributes?.diamondShapes) ? attributes.diamondShapes : [];
//     const diamondSize: any[] = Array.isArray(attributes?.centerStoneSize)
//       ? attributes.centerStoneSize
//       : Array.isArray(attributes?.diamondSizes) ? attributes.diamondSizes : [];

//     const diamondColorClarity: any[] = Array.isArray(attributes?.diamondColorClarity)
//       ? attributes.diamondColorClarity
//       : Array.isArray(attributes?.diamondColors) ? attributes.diamondColors : [];

//     const engravingIds: any[] = Array.isArray(product?.engravingDetailIds) ? product.engravingDetailIds : [];
//     const isEngraving: boolean = engravingIds.length > 0;
//     const engraving = engravingIds;

//     const variantIds: any[] = Array.isArray(product?.variantIds) ? product.variantIds : [];
//     const variantCount: number = variantIds.length;
//     const firstVariantSku: string | null = variantCount > 0 ? variantIds[0] : null;

//     // prepare default pricing values & final_pricing lookup
//     const conn = getCatalogConnection();
//     const finalPricingColl = conn.collection("final_pricing");
//     const defaultsColl = conn.collection("defaultValues");
//     const defaultVals: Record<string, any> = (await defaultsColl.findOne({})) || {};
//     const goldValue24 = n(defaultVals.goldValue24) || NaN;
//     const silverPricePerGram = n(defaultVals.silverPricePerGram) || NaN;
//     const platinumPricePerGram = n(defaultVals.platinumPricePerGram) || NaN;
//     const titaniumPricePerGram = n(defaultVals.titaniumPricePerGram) || NaN;

//     // default response pieces
//     let sellingPrice: number | null = null;
//     let priceIncomplete = true;

//     // fetch first variant doc if available (to compute price like in getProductsByCategory)
//     let firstVariantDoc: any = null;
//     if (firstVariantSku) {
//       firstVariantDoc = await conn.collection("variants").findOne({ sku: firstVariantSku });
//     }

//     // Only compute if we have a firstVariantDoc
//     if (firstVariantDoc) {
//       try {
//         const variant = firstVariantDoc;
//         const stonesArr: any[] =
//           Array.isArray(variant?.meta?.stones) && variant.meta.stones.length
//             ? variant.meta.stones
//             : Array.isArray(variant?.stones)
//               ? variant.stones
//               : [];

//         // pick included stones (same heuristic as other function)
//         const includedStones: { sequence: string; cts: number; netWeightGrams: number | null }[] = [];
//         for (let i = 0; i < stonesArr.length; i++) {
//           const st = stonesArr[i];
//           const seq = st?.sequence || (Array.isArray(st?.sequences) && st.sequences[0]?.sequence) || st?.sequenceNo;
//           if (!seq) continue;
//           const cts = typeof st?.cts === "number" ? st.cts : (Array.isArray(st?.sequences) && typeof st.sequences[0]?.cts === "number" ? st.sequences[0].cts : null);
//           if (cts == null) continue;
//           const net = st?.netWeightGrams != null ? n(st.netWeightGrams) : null;
//           if (i > 0 && net !== null) break;
//           includedStones.push({ sequence: seq, cts, netWeightGrams: net });
//         }

//         // diamond cost
//         let diamondCost = 0;
//         let diamondIncomplete = false;
//         for (const st of includedStones) {
//           const pricingDoc: any = (await finalPricingColl.findOne({ sequence: st.sequence })) || {};
//           const pricePerCt = parseNumeric(pricingDoc.selling_price ?? pricingDoc.sellingPrice ?? pricingDoc.price);
//           if (Number.isNaN(pricePerCt)) {
//             diamondIncomplete = true;
//             continue;
//           }
//           diamondCost += pricePerCt * st.cts;
//         }

//         // metal type & karat
//         const metalType =
//           (variant?.meta?.metalType || (Array.isArray(metalTypes) ? metalTypes[0] : metalTypes[0]) || "GOLD").toString().toUpperCase();
//         let karatStr = variant?.meta?.metalKt || (Array.isArray(goldKarats) ? goldKarats[0] : goldKarats) || "18";
//         const karatNum = Number(String(karatStr).match(/\d+/)?.[0] || 18);

//         // metal weight detection
//         let metalWeightGrams: number | null =
//           variant?.meta?.metalWeightGrams != null ? n(variant.meta.metalWeightGrams) : variant?.netWeightGrams != null ? n(variant.netWeightGrams) : null;
//         if ((metalWeightGrams == null || Number.isNaN(metalWeightGrams)) && includedStones.length) {
//           const sum = includedStones.reduce((acc, s) => acc + (s.netWeightGrams ? Number(s.netWeightGrams) : 0), 0);
//           metalWeightGrams = sum > 0 ? sum : null;
//         }

//         // metal price per gram
//         let metalPricePerGram = NaN;
//         if (metalType === "GOLD" && !Number.isNaN(goldValue24)) {
//           const factor = KARAT_FACTOR[String(karatNum)] ?? KARAT_FACTOR["18"];
//           metalPricePerGram = goldValue24 * factor;
//         } else if (metalType === "SILVER") metalPricePerGram = silverPricePerGram;
//         else if (metalType === "PLATINUM") metalPricePerGram = platinumPricePerGram;
//         else if (metalType === "TITANIUM") metalPricePerGram = titaniumPricePerGram;

//         let metalCost = 0, labourCost = 0, metalIncomplete = false;
//         if (metalWeightGrams && !Number.isNaN(metalPricePerGram)) {
//           metalCost = metalPricePerGram * metalWeightGrams;
//           labourCost = LABOUR_RATE[metalType] ?? LABOUR_RATE.GOLD;
//         } else {
//           metalIncomplete = true;
//         }

//         const computedSellingPrice = metalCost + diamondCost + labourCost;
//         sellingPrice = !Number.isNaN(computedSellingPrice) && computedSellingPrice > 0 ? Math.round(computedSellingPrice) : null;
//         priceIncomplete = metalIncomplete || diamondIncomplete;
//       } catch (err) {
//         sellingPrice = null;
//         priceIncomplete = true;
//       }
//     } else {
//       // no variant -> can't compute price
//       sellingPrice = null;
//       priceIncomplete = true;
//     }

//     const response = {
//       success: true,
//       modelSku,
//       title,
//       description,
//       metalTypes,
//       goldKarats,
//       diamondShape,
//       diamondSize,
//       diamondColorClarity,
//       isEngraving,
//       engraving,
//       variantCount,
//       firstVariantSku,
//       // price info added
//       sellingPrice,
//       priceIncomplete,
//     };

//     return res.status(200).json(response);
//   } catch (err) {
//     console.error("getProductByModelSku error:", err);
//     return res.status(500).json({
//       success: false,
//       message: "Server error",
//       error: err instanceof Error ? err.message : String(err),
//     });
//   }
// };

// export const getProductByModelSku = async (req: Request, res: Response) => {
//   try {
//     const rawSku = (req.params.modelSku || "").toString().trim();
//     if (!rawSku) return res.status(400).json({ success: false, message: "modelSku required" });

//     const modelSku = rawSku.toUpperCase();
//     const ProductModel = getCollectionModel("products");
//     const product: any = await ProductModel.findOne({ modelSku }).lean();

//     if (!product) {
//       return res.status(404).json({ success: false, message: `Model ${modelSku} not found` });
//     }

//     // Basic metadata
//     const title: string | null = product?.seo?.title ?? product?.title ?? null;
//     const description: string | null = product?.description ?? null;

//     const attributes: any = product?.attributes ?? {};
//     const metalTypes: string[] = Array.isArray(attributes?.metalTypes)
//       ? attributes.metalTypes
//       : attributes?.metalTypes ? [attributes.metalTypes] : [];
//     const goldKarats: string[] = Array.isArray(attributes?.goldKarats)
//       ? attributes.goldKarats
//       : attributes?.goldKarats ? [attributes.goldKarats] : [];

//     const diamondShape: any[] = Array.isArray(attributes?.centerStoneShape)
//       ? attributes.centerStoneShape
//       : Array.isArray(attributes?.diamondShapes) ? attributes.diamondShapes : [];
//     const diamondSize: any[] = Array.isArray(attributes?.centerStoneSize)
//       ? attributes.centerStoneSize
//       : Array.isArray(attributes?.diamondSizes) ? attributes.diamondSizes : [];

//     const diamondColorClarity: any[] = Array.isArray(attributes?.diamondColorClarity)
//       ? attributes.diamondColorClarity
//       : Array.isArray(attributes?.diamondColors) ? attributes.diamondColors : [];

//     const engravingIds: any[] = Array.isArray(product?.engravingDetailIds) ? product.engravingDetailIds : [];
//     const isEngraving: boolean = engravingIds.length > 0;
//     const engraving = engravingIds;

//     const variantIds: any[] = Array.isArray(product?.variantIds) ? product.variantIds : [];
//     const variantCount: number = variantIds.length;
//     const firstVariantSku: string | null = variantCount > 0 ? variantIds[0] : null;

//     // optional query param: variantId (treat as variant SKU or ObjectId)
//     const variantIdParam = (req.query.variantId ?? "").toString().trim();

//     // prepare default pricing values & final_pricing lookup
//     const conn = getCatalogConnection();
//     const finalPricingColl = conn.collection("final_pricing");
//     const defaultsColl = conn.collection("defaultValues");
//     const defaultVals: Record<string, any> = (await defaultsColl.findOne({})) || {};
//     const goldValue24 = n(defaultVals.goldValue24) || NaN;
//     const silverPricePerGram = n(defaultVals.silverPricePerGram) || NaN;
//     const platinumPricePerGram = n(defaultVals.platinumPricePerGram) || NaN;
//     const titaniumPricePerGram = n(defaultVals.titaniumPricePerGram) || NaN;

//     // fetch variant doc:
//     // if variantIdParam provided, try to fetch that variant (by sku or _id), otherwise fetch firstVariantSku
//     let chosenVariantSku: string | null = null;
//     let firstVariantDoc: any = null;

//     if (variantIdParam) {
//       // try by sku first
//       firstVariantDoc = await conn.collection("variants").findOne({ sku: variantIdParam });
//       if (!firstVariantDoc && mongoose.Types.ObjectId.isValid(variantIdParam)) {
//         try {
//           firstVariantDoc = await conn.collection("variants").findOne({ _id: new mongoose.Types.ObjectId(variantIdParam) });
//         } catch (e) {
//           // ignore
//         }
//       }
//       if (firstVariantDoc) chosenVariantSku = firstVariantDoc.sku ?? (firstVariantDoc._id ? String(firstVariantDoc._id) : null);
//     }

//     if (!firstVariantDoc && firstVariantSku) {
//       // fallback to firstVariantSku from product
//       firstVariantDoc = await conn.collection("variants").findOne({ sku: firstVariantSku }) || null;
//       chosenVariantSku = firstVariantDoc ? (firstVariantDoc.sku ?? firstVariantSku) : firstVariantSku;
//     }

//     // collect variant images (if any) based on the chosen variant (the one fetched above)
//     let variantImages: string[] = [];
//     if (firstVariantDoc && Array.isArray(firstVariantDoc.images)) {
//       variantImages = firstVariantDoc.images
//         .map((img: any) => (img?.url ?? img?.filename ?? img) )
//         .filter(Boolean);
//     }

//     // price calculation (same logic as in getProductsByCategory)
//     let sellingPrice: number | null = null;
//     let priceIncomplete = true;

//     if (firstVariantDoc) {
//       try {
//         const variant = firstVariantDoc;
//         const stonesArr: any[] =
//           Array.isArray(variant?.meta?.stones) && variant.meta.stones.length
//             ? variant.meta.stones
//             : Array.isArray(variant?.stones)
//               ? variant.stones
//               : [];

//         // pick included stones (same heuristic as other function)
//         const includedStones: { sequence: string; cts: number; netWeightGrams: number | null }[] = [];
//         for (let i = 0; i < stonesArr.length; i++) {
//           const st = stonesArr[i];
//           const seq = st?.sequence || (Array.isArray(st?.sequences) && st.sequences[0]?.sequence) || st?.sequenceNo;
//           if (!seq) continue;
//           const cts = typeof st?.cts === "number" ? st.cts : (Array.isArray(st?.sequences) && typeof st.sequences[0]?.cts === "number" ? st.sequences[0].cts : null);
//           if (cts == null) continue;
//           const net = st?.netWeightGrams != null ? n(st.netWeightGrams) : null;
//           if (i > 0 && net !== null) break;
//           includedStones.push({ sequence: seq, cts, netWeightGrams: net });
//         }

//         // diamond cost
//         let diamondCost = 0;
//         let diamondIncomplete = false;
//         for (const st of includedStones) {
//           const pricingDoc: any = (await finalPricingColl.findOne({ sequence: st.sequence })) || {};
//           const pricePerCt = parseNumeric(pricingDoc.selling_price ?? pricingDoc.sellingPrice ?? pricingDoc.price);
//           if (Number.isNaN(pricePerCt)) {
//             diamondIncomplete = true;
//             continue;
//           }
//           diamondCost += pricePerCt * st.cts;
//         }

//         // metal type & karat
//         const metalType =
//           (variant?.meta?.metalType || (Array.isArray(metalTypes) ? metalTypes[0] : metalTypes[0]) || "GOLD").toString().toUpperCase();
//         let karatStr = variant?.meta?.metalKt || (Array.isArray(goldKarats) ? goldKarats[0] : goldKarats) || "18";
//         const karatNum = Number(String(karatStr).match(/\d+/)?.[0] || 18);

//         // metal weight detection
//         let metalWeightGrams: number | null =
//           variant?.meta?.metalWeightGrams != null ? n(variant.meta.metalWeightGrams) : variant?.netWeightGrams != null ? n(variant.netWeightGrams) : null;
//         if ((metalWeightGrams == null || Number.isNaN(metalWeightGrams)) && includedStones.length) {
//           const sum = includedStones.reduce((acc, s) => acc + (s.netWeightGrams ? Number(s.netWeightGrams) : 0), 0);
//           metalWeightGrams = sum > 0 ? sum : null;
//         }

//         // metal price per gram
//         let metalPricePerGram = NaN;
//         if (metalType === "GOLD" && !Number.isNaN(goldValue24)) {
//           const factor = KARAT_FACTOR[String(karatNum)] ?? KARAT_FACTOR["18"];
//           metalPricePerGram = goldValue24 * factor;
//         } else if (metalType === "SILVER") metalPricePerGram = silverPricePerGram;
//         else if (metalType === "PLATINUM") metalPricePerGram = platinumPricePerGram;
//         else if (metalType === "TITANIUM") metalPricePerGram = titaniumPricePerGram;

//         let metalCost = 0, labourCost = 0, metalIncomplete = false;
//         if (metalWeightGrams && !Number.isNaN(metalPricePerGram)) {
//           metalCost = metalPricePerGram * metalWeightGrams;
//           labourCost = LABOUR_RATE[metalType] ?? LABOUR_RATE.GOLD;
//         } else {
//           metalIncomplete = true;
//         }

//         const computedSellingPrice = metalCost + diamondCost + labourCost;
//         sellingPrice = !Number.isNaN(computedSellingPrice) && computedSellingPrice > 0 ? Math.round(computedSellingPrice) : null;
//         priceIncomplete = metalIncomplete || diamondIncomplete;
//       } catch (err) {
//         sellingPrice = null;
//         priceIncomplete = true;
//       }
//     } else {
//       sellingPrice = null;
//       priceIncomplete = true;
//     }

//     const response = {
//       success: true,
//       modelSku,
//       title,
//       description,
//       metalTypes,
//       goldKarats,
//       diamondShape,
//       diamondSize,
//       diamondColorClarity,
//       isEngraving,
//       engraving,
//       variantCount,
//       firstVariantSku,
//       // price info
//       sellingPrice,
//       priceIncomplete,
//       // variant info / images
//       chosenVariantSku: chosenVariantSku ?? null,
//       variantImages,
//     };

//     return res.status(200).json(response);
//   } catch (err) {
//     console.error("getProductByModelSku error:", err);
//     return res.status(500).json({
//       success: false,
//       message: "Server error",
//       error: err instanceof Error ? err.message : String(err),
//     });
//   }
// };



// ---------- Controller: getProductByModelSku ----------
// export const getProductByModelSku = async (req: Request, res: Response) => {
//   try {
//     const rawSku = (req.params.modelSku || "").toString().trim();
//     if (!rawSku) return res.status(400).json({ success: false, message: "modelSku required" });

//     const modelSku = rawSku.toUpperCase();
//     const ProductModel = getCollectionModel("products");
//     const product: any = await ProductModel.findOne({ modelSku }).lean();

//     if (!product) {
//       return res.status(404).json({ success: false, message: `Model ${modelSku} not found` });
//     }

//     // Basic metadata
//     const title: string | null = product?.seo?.title ?? product?.title ?? null;
//     const description: string | null = product?.description ?? null;

//     const attributes: any = product?.attributes ?? {};
//     const metalTypes: string[] = Array.isArray(attributes?.metalTypes)
//       ? attributes.metalTypes
//       : attributes?.metalTypes ? [attributes.metalTypes] : [];
//     const goldKarats: string[] = Array.isArray(attributes?.goldKarats)
//       ? attributes.goldKarats
//       : attributes?.goldKarats ? [attributes.goldKarats] : [];

//     const diamondShape: any[] = Array.isArray(attributes?.centerStoneShape)
//       ? attributes.centerStoneShape
//       : Array.isArray(attributes?.diamondShapes) ? attributes.diamondShapes : [];
//     const diamondSize: any[] = Array.isArray(attributes?.centerStoneSize)
//       ? attributes.centerStoneSize
//       : Array.isArray(attributes?.diamondSizes) ? attributes.diamondSizes : [];

//     const diamondColorClarity: any[] = Array.isArray(attributes?.diamondColorClarity)
//       ? attributes.diamondColorClarity
//       : Array.isArray(attributes?.diamondColors) ? attributes.diamondColors : [];

//     const engravingIds: any[] = Array.isArray(product?.engravingDetailIds) ? product.engravingDetailIds : [];
//     const isEngraving: boolean = engravingIds.length > 0;
//     const engraving = engravingIds;

//     const variantIds: any[] = Array.isArray(product?.variantIds) ? product.variantIds : [];
//     const variantCount: number = variantIds.length;
//     const firstVariantSku: string | null = variantCount > 0 ? variantIds[0] : null;

//     // optional query param: variantId (treat as variant SKU or ObjectId)
//     const variantIdParam = (req.query.variantId ?? "").toString().trim();

//     // prepare default pricing values & final_pricing lookup
//     const conn = getCatalogConnection();
//     const finalPricingColl = conn.collection("final_pricing");
//     const defaultsColl = conn.collection("defaultValues");
//     const defaultVals: Record<string, any> = (await defaultsColl.findOne({})) || {};
//     const goldValue24 = n(defaultVals.goldValue24) || NaN;
//     const silverPricePerGram = n(defaultVals.silverPricePerGram) || NaN;
//     const platinumPricePerGram = n(defaultVals.platinumPricePerGram) || NaN;
//     const titaniumPricePerGram = n(defaultVals.titaniumPricePerGram) || NaN;

//     // fetch variant doc:
//     // if variantIdParam provided, try to fetch that variant (by sku or _id), otherwise fetch firstVariantSku
//     let chosenVariantSku: string | null = null;
//     let firstVariantDoc: any = null;

//     if (variantIdParam) {
//       // try by sku first
//       firstVariantDoc = await conn.collection("variants").findOne({ sku: variantIdParam });
//       if (!firstVariantDoc && mongoose.Types.ObjectId.isValid(variantIdParam)) {
//         try {
//           firstVariantDoc = await conn.collection("variants").findOne({ _id: new mongoose.Types.ObjectId(variantIdParam) });
//         } catch (e) {
//           // ignore and continue
//         }
//       }
//       if (firstVariantDoc) chosenVariantSku = firstVariantDoc.sku ?? (firstVariantDoc._id ? String(firstVariantDoc._id) : null);
//     }

//     if (!firstVariantDoc && firstVariantSku) {
//       // fallback to firstVariantSku from product
//       firstVariantDoc = (await conn.collection("variants").findOne({ sku: firstVariantSku })) || null;
//       chosenVariantSku = firstVariantDoc ? (firstVariantDoc.sku ?? firstVariantSku) : firstVariantSku;
//     }

//     // collect variant images (if any) based on the chosen variant (the one fetched above)
//     let variantImages: string[] = [];
//     if (firstVariantDoc && Array.isArray(firstVariantDoc.images)) {
//       // normalize to string urls
//       const allImgs = firstVariantDoc.images
//         .map((img: any) => (img?.url ?? img?.filename ?? img))
//         .filter(Boolean)
//         .map((s: any) => String(s));

//       // helper: try to pick images that contain a token (case-insensitive)
//       const pickByToken = (token: string) => {
//         if (!token) return [];
//         const up = token.toUpperCase();
//         return allImgs.filter((u: string) => u.toUpperCase().includes(up));
//       };

//       // Candidate tokens commonly used in your filenames
//       const TOKEN_CANDIDATES = ["WG", "YG", "RG", "GP", "PG", "NBV", "BV", "SV", "PV"];

//       // 1) try to detect metal token from chosenVariantSku (e.g. ENG1-CUS-30-WG-SV)
//       let detectedToken: string | null = null;
//       if (chosenVariantSku) {
//         const parts = String(chosenVariantSku).split(/[-_]/).map(p => p.trim().toUpperCase());
//         for (const t of TOKEN_CANDIDATES) {
//           if (parts.includes(t)) {
//             detectedToken = t;
//             break;
//           }
//         }
//       }

//       // 2) If detected, prefer images matching detectedToken
//       if (detectedToken) {
//         const matched = pickByToken(detectedToken);
//         if (matched.length) variantImages = matched;
//       }

//       // 3) If not found from sku or no matches, try fallback priority search
//       if (variantImages.length === 0) {
//         const FALLBACK_PRIORITY = ["WG", "YG", "RG", "GP", "NBV", "BV", "SV"];
//         for (const t of FALLBACK_PRIORITY) {
//           const matched = pickByToken(t);
//           if (matched.length) {
//             variantImages = matched;
//             break;
//           }
//         }
//       }

//       // 4) Final fallback: keep a small set of original images (don't return hundreds)
//       if (variantImages.length === 0) {
//         variantImages = allImgs.slice(0, 4);
//       }

//       // Optionally return only one image (uncomment if you want a single best match)
//       // variantImages = variantImages.length ? [variantImages[0]] : [];
//     }

//     // price calculation (same logic as in your code)
//     let sellingPrice: number | null = null;
//     let priceIncomplete = true;

//     if (firstVariantDoc) {
//       try {
//         const variant = firstVariantDoc;
//         const stonesArr: any[] =
//           Array.isArray(variant?.meta?.stones) && variant.meta.stones.length
//             ? variant.meta.stones
//             : Array.isArray(variant?.stones)
//               ? variant.stones
//               : [];

//         // pick included stones (same heuristic as other function)
//         const includedStones: { sequence: string; cts: number; netWeightGrams: number | null }[] = [];
//         for (let i = 0; i < stonesArr.length; i++) {
//           const st = stonesArr[i];
//           const seq = st?.sequence || (Array.isArray(st?.sequences) && st.sequences[0]?.sequence) || st?.sequenceNo;
//           if (!seq) continue;
//           const cts = typeof st?.cts === "number" ? st.cts : (Array.isArray(st?.sequences) && typeof st.sequences[0]?.cts === "number" ? st.sequences[0].cts : null);
//           if (cts == null) continue;
//           const net = st?.netWeightGrams != null ? n(st.netWeightGrams) : null;
//           if (i > 0 && net !== null) break;
//           includedStones.push({ sequence: seq, cts, netWeightGrams: net });
//         }

//         // diamond cost
//         let diamondCost = 0;
//         let diamondIncomplete = false;
//         for (const st of includedStones) {
//           const pricingDoc: any = (await finalPricingColl.findOne({ sequence: st.sequence })) || {};
//           const pricePerCt = parseNumeric(pricingDoc.selling_price ?? pricingDoc.sellingPrice ?? pricingDoc.price);
//           if (Number.isNaN(pricePerCt)) {
//             diamondIncomplete = true;
//             continue;
//           }
//           diamondCost += pricePerCt * st.cts;
//         }

//         // metal type & karat
//         const metalType =
//           (variant?.meta?.metalType || (Array.isArray(metalTypes) ? metalTypes[0] : metalTypes[0]) || "GOLD").toString().toUpperCase();
//         let karatStr = variant?.meta?.metalKt || (Array.isArray(goldKarats) ? goldKarats[0] : goldKarats) || "18";
//         const karatNum = Number(String(karatStr).match(/\d+/)?.[0] || 18);

//         // metal weight detection
//         let metalWeightGrams: number | null =
//           variant?.meta?.metalWeightGrams != null ? n(variant.meta.metalWeightGrams) : variant?.netWeightGrams != null ? n(variant.netWeightGrams) : null;
//         if ((metalWeightGrams == null || Number.isNaN(metalWeightGrams)) && includedStones.length) {
//           const sum = includedStones.reduce((acc, s) => acc + (s.netWeightGrams ? Number(s.netWeightGrams) : 0), 0);
//           metalWeightGrams = sum > 0 ? sum : null;
//         }

//         // metal price per gram
//         let metalPricePerGram = NaN;
//         if (metalType === "GOLD" && !Number.isNaN(goldValue24)) {
//           const factor = KARAT_FACTOR[String(karatNum)] ?? KARAT_FACTOR["18"];
//           metalPricePerGram = goldValue24 * factor;
//         } else if (metalType === "SILVER") metalPricePerGram = silverPricePerGram;
//         else if (metalType === "PLATINUM") metalPricePerGram = platinumPricePerGram;
//         else if (metalType === "TITANIUM") metalPricePerGram = titaniumPricePerGram;

//         let metalCost = 0, labourCost = 0, metalIncomplete = false;
//         if (metalWeightGrams && !Number.isNaN(metalPricePerGram)) {
//           metalCost = metalPricePerGram * metalWeightGrams;
//           labourCost = LABOUR_RATE[metalType] ?? LABOUR_RATE.GOLD;
//         } else {
//           metalIncomplete = true;
//         }

//         const computedSellingPrice = metalCost + diamondCost + labourCost;
//         sellingPrice = !Number.isNaN(computedSellingPrice) && computedSellingPrice > 0 ? Math.round(computedSellingPrice) : null;
//         priceIncomplete = metalIncomplete || diamondIncomplete;
//       } catch (err) {
//         sellingPrice = null;
//         priceIncomplete = true;
//       }
//     } else {
//       sellingPrice = null;
//       priceIncomplete = true;
//     }

//     const response = {
//       success: true,
//       modelSku,
//       title,
//       description,
//       metalTypes,
//       goldKarats,
//       diamondShape,
//       diamondSize,
//       diamondColorClarity,
//       isEngraving,
//       engraving,
//       variantCount,
//       firstVariantSku,
//       // price info
//       sellingPrice,
//       priceIncomplete,
//       // variant info / images
//       chosenVariantSku: chosenVariantSku ?? null,
//       variantImages,
//     };

//     return res.status(200).json(response);
//   } catch (err) {
//     console.error("getProductByModelSku error:", err);
//     return res.status(500).json({
//       success: false,
//       message: "Server error",
//       error: err instanceof Error ? err.message : String(err),
//     });
//   }
// };

export const getProductByModelSku = async (req: Request, res: Response) => {
  try {
    const rawSku = (req.params.modelSku || "").toString().trim();
    if (!rawSku) return res.status(400).json({ success: false, message: "modelSku required" });

    const modelSku = rawSku.toUpperCase();
    const ProductModel = getCollectionModel("products");
    const product: any = await ProductModel.findOne({ modelSku }).lean();
    if (!product) return res.status(404).json({ success: false, message: `Model ${modelSku} not found` });

    // Basic metadata
    const title: string | null = product?.seo?.title ?? product?.title ?? null;
    const description: string | null = product?.description ?? null;
    const attributes: any = product?.attributes ?? {};
    const metalTypes: string[] = Array.isArray(attributes?.metalTypes) ? attributes.metalTypes : attributes?.metalTypes ? [attributes.metalTypes] : [];
    const goldKarats: string[] = Array.isArray(attributes?.goldKarats) ? attributes.goldKarats : attributes?.goldKarats ? [attributes.goldKarats] : [];

    // diamondShape / diamondSize (may be overridden by variant introspection)
    let diamondShape: any[] = Array.isArray(attributes?.centerStoneShape) ? attributes.centerStoneShape : Array.isArray(attributes?.diamondShapes) ? attributes.diamondShapes : [];
    let diamondSize: any[] = Array.isArray(attributes?.centerStoneSize) ? attributes.centerStoneSize : Array.isArray(attributes?.diamondSizes) ? attributes.diamondSizes : [];
    const diamondColorClarity: any[] = Array.isArray(attributes?.diamondColorClarity) ? attributes.diamondColorClarity : Array.isArray(attributes?.diamondColors) ? attributes.diamondColors : [];

    const engravingIds: any[] = Array.isArray(product?.engravingDetailIds) ? product.engravingDetailIds : [];
    const isEngraving: boolean = engravingIds.length > 0;
    const engraving = engravingIds;

    const variantIds: any[] = Array.isArray(product?.variantIds) ? product.variantIds : [];
    const variantCount: number = variantIds.length;
    const firstVariantSku: string | null = variantCount > 0 ? variantIds[0] : null;
    const variantIdParam = (req.query.variantId ?? "").toString().trim();

    // pricing helpers
    const conn = getCatalogConnection();
    const finalPricingColl = conn.collection("final_pricing");
    const defaultsColl = conn.collection("defaultValues");
    const defaultVals: Record<string, any> = (await defaultsColl.findOne({})) || {};
    const goldValue24 = n(defaultVals.goldValue24) || NaN;
    const silverPricePerGram = n(defaultVals.silverPricePerGram) || NaN;
    const platinumPricePerGram = n(defaultVals.platinumPricePerGram) || NaN;
    const titaniumPricePerGram = n(defaultVals.titaniumPricePerGram) || NaN;

    // fetch variant doc
    let chosenVariantSku: string | null = null;
    let firstVariantDoc: any = null;
    if (variantIdParam) {
      firstVariantDoc = await conn.collection("variants").findOne({ sku: variantIdParam });
      if (!firstVariantDoc && mongoose.Types.ObjectId.isValid(variantIdParam)) {
        try { firstVariantDoc = await conn.collection("variants").findOne({ _id: new mongoose.Types.ObjectId(variantIdParam) }); } catch {}
      }
      if (firstVariantDoc) chosenVariantSku = firstVariantDoc.sku ?? (firstVariantDoc._id ? String(firstVariantDoc._id) : null);
    }
    if (!firstVariantDoc && firstVariantSku) {
      firstVariantDoc = (await conn.collection("variants").findOne({ sku: firstVariantSku })) || null;
      chosenVariantSku = firstVariantDoc ? (firstVariantDoc.sku ?? firstVariantSku) : firstVariantSku;
    }

    // fallback extraction for diamond shape/size from variant stones
    const normalize = (v: any) => (v == null ? null : (typeof v === "string" ? v.trim() : String(v).trim()));
    const extractFromVariantStones = (variant: any) => {
      const shapes: string[] = [];
      const sizes: string[] = [];
      if (!variant) return { shapes, sizes };

      const stonesArr: any[] =
        Array.isArray(variant?.meta?.stones) && variant.meta.stones.length ? variant.meta.stones
        : Array.isArray(variant?.stones) && variant.stones.length ? variant.stones
        : [];

      for (const st of stonesArr) {
        if (!st) continue;
        const possibleShapeKeys = ["centerStoneShape", "diamondGemstoneShape", "diamondGemstoneShapes", "diamondGemstoneShape"];
        for (const k of possibleShapeKeys) {
          const v = st[k];
          if (Array.isArray(v)) shapes.push(...v.map(normalize).filter(Boolean));
          else if (v != null && String(v).trim() !== "") shapes.push(normalize(v));
        }
        if (typeof st.cts === "number" || (!Number.isNaN(Number(st.cts)) && st.cts != null)) sizes.push(String(st.cts));
        else {
          const possibleSizeKeys = ["size", "carat", "cts", "ct", "carats"];
          for (const k of possibleSizeKeys) {
            const v = st[k];
            if (v != null && String(v).trim() !== "") { sizes.push(String(v).trim()); break; }
          }
        }
        if (Array.isArray(st.sequences)) {
          for (const seq of st.sequences) {
            for (const k of ["centerStoneShape", "diamondGemstoneShape", "diamondGemstoneShapes"]) {
              const v = seq[k];
              if (Array.isArray(v)) shapes.push(...v.map(normalize).filter(Boolean));
              else if (v != null && String(v).trim() !== "") shapes.push(normalize(v));
            }
            if (typeof seq.cts === "number" || (!Number.isNaN(Number(seq.cts)) && seq.cts != null)) sizes.push(String(seq.cts));
          }
        }
      }
      return {
        shapes: Array.from(new Set(shapes.map(s => s ? s.toUpperCase() : s))).filter(Boolean),
        sizes: Array.from(new Set(sizes.map(s => s ? String(s) : s))).filter(Boolean),
      };
    };
    if ((!diamondShape || diamondShape.length === 0) || (!diamondSize || diamondSize.length === 0)) {
      const fromVariant = extractFromVariantStones(firstVariantDoc);
      if ((!diamondShape || diamondShape.length === 0) && fromVariant.shapes.length) diamondShape = fromVariant.shapes;
      if ((!diamondSize || diamondSize.length === 0) && fromVariant.sizes.length) diamondSize = fromVariant.sizes;
    }
    diamondShape = Array.isArray(diamondShape) ? diamondShape : [];
    diamondSize = Array.isArray(diamondSize) ? diamondSize : [];

    // ---------- IMAGE SELECTION: update primary metals to include BLACK RHODIUM (BR) ----------
    let variantImages: string[] = [];
    if (firstVariantDoc && Array.isArray(firstVariantDoc.images)) {
      const allImgs = firstVariantDoc.images
        .map((img: any) => (img?.url ?? img?.filename ?? img))
        .filter(Boolean)
        .map((s: any) => String(s));

      // Primary metals now include BR (black rhodium) — these are exclusive among themselves.
      const PRIMARY_METALS = ["WG", "YG", "RG", "BR"];
      const OTHER_ALLOWED = ["NBV", "BV", "SV", "PV", "GP", "PG", "2T", "TV", "45", "FV", "EV", "BRD"]; // keep extras; BRD optionally if used
      const TOKEN_CANDIDATES = Array.from(new Set([...PRIMARY_METALS, ...OTHER_ALLOWED]));

      // bare generic basenames to drop
      const BARE_GENERIC = new Set(["GP", "360", "NBV", "BV", "45", "EV", "TV", "FV", "SV"]);

      // regex to match tokens as standalone parts
      const tokenRegex = (token: string) => new RegExp(`(?:^|[-_\\.\\/])${token}(?:$|[-_\\.\\/])`, "i");

      const basenameNoExt = (url: string) => {
        const name = (url.split("/").pop() || "");
        const dot = name.lastIndexOf(".");
        return dot === -1 ? name : name.slice(0, dot);
      };
      const removeBareGeneric = (url: string) => {
        const base = basenameNoExt(url).toUpperCase();
        return BARE_GENERIC.has(base);
      };

      const detectPrimariesInFilename = (url: string) =>
        PRIMARY_METALS.filter(pm => tokenRegex(pm).test(url)).map(x => x.toUpperCase());

      const strictPrimaryOnlyMatches = (token: string) => {
        if (!token) return [];
        const re = tokenRegex(token);
        return allImgs.filter(u => {
          if (removeBareGeneric(u)) return false;
          if (!re.test(u)) return false;
          const primariesFound = detectPrimariesInFilename(u);
          return primariesFound.length === 1 && primariesFound[0] === token.toUpperCase();
        });
      };
      const inclusivePrimaryMatches = (token: string) => {
        if (!token) return [];
        const re = tokenRegex(token);
        return allImgs.filter(u => {
          if (removeBareGeneric(u)) return false;
          return re.test(u);
        });
      };
      const looseMatches = (token: string) => {
        if (!token) return [];
        const up = token.toUpperCase();
        return allImgs.filter(u => {
          if (removeBareGeneric(u)) return false;
          return u.toUpperCase().includes(up);
        });
      };

      // Pre-filter out bare-generic files so they never appear
      const prefiltered = allImgs.filter(u => !removeBareGeneric(u));

      // normalize incoming metal query tokens including BLACK/BACK/RHODIUM synonyms
      const normalizeQueryToken = (raw: string | null) => {
        if (!raw) return null;
        const map: Record<string,string> = {
          WHITE: "WG", WHITEGOLD: "WG", WG: "WG",
          YELLOW: "YG", YG: "YG", YELLOWGOLD: "YG",
          RG: "RG", ROSEGOLD: "RG", ROSE: "RG",
          BR: "BR", BLACK: "BR", BLACKRHODIUM: "BR", "BLACK-RHODIUM": "BR",
          GP: "GP", GOLDPLATED: "GP",
          NBV: "NBV", BV: "BV", SV: "SV", SILVER: "SV", BRD: "BRD"
        };
        const k = raw.toString().trim().toUpperCase();
        return map[k] ?? k;
      };
      const metalQueryRaw = (req.query.metal ?? req.query.metalColor ?? "").toString().trim().toUpperCase();
      const requestedToken = normalizeQueryToken(metalQueryRaw);

      // selection logic: enforce exclusivity across PRIMARY_METALS
      if (requestedToken) {
        const rt = requestedToken.toUpperCase();
        if (PRIMARY_METALS.includes(rt)) {
          variantImages = strictPrimaryOnlyMatches(rt);
          if (variantImages.length === 0) variantImages = inclusivePrimaryMatches(rt);
          if (variantImages.length === 0) variantImages = looseMatches(rt);
        } else {
          const re = tokenRegex(rt);
          variantImages = prefiltered.filter(u => re.test(u));
          if (variantImages.length === 0) variantImages = prefiltered.filter(u => u.toUpperCase().includes(rt));
        }
      }

      // detect from SKU if needed
      if ((!requestedToken || variantImages.length === 0) && chosenVariantSku) {
        const parts = String(chosenVariantSku).split(/[-_]/).map(p => p.trim().toUpperCase()).filter(Boolean);
        const primaryInSku = parts.find(p => PRIMARY_METALS.includes(p));
        if (primaryInSku) {
          variantImages = strictPrimaryOnlyMatches(primaryInSku);
          if (variantImages.length === 0) variantImages = inclusivePrimaryMatches(primaryInSku);
          if (variantImages.length === 0) variantImages = looseMatches(primaryInSku);
        } else {
          const otherInSku = parts.find(p => TOKEN_CANDIDATES.includes(p));
          if (otherInSku) {
            const re = tokenRegex(otherInSku);
            variantImages = prefiltered.filter(u => re.test(u));
            if (variantImages.length === 0) variantImages = prefiltered.filter(u => u.toUpperCase().includes(otherInSku));
          }
        }
      }

      // final fallback: some non-bare images so frontend isn't starved
      if (!variantImages || variantImages.length === 0) {
        variantImages = prefiltered.slice(0, 6);
      }

      variantImages = Array.from(new Set(variantImages)).slice(0, 24);
    }

    // ---------- PRICE CALCULATION (unchanged) ----------
    let sellingPrice: number | null = null;
    let priceIncomplete = true;
    if (firstVariantDoc) {
      try {
        const variant = firstVariantDoc;
        const stonesArr: any[] =
          Array.isArray(variant?.meta?.stones) && variant.meta.stones.length ? variant.meta.stones
          : Array.isArray(variant?.stones) ? variant.stones
          : [];
        const includedStones: { sequence: string; cts: number; netWeightGrams: number | null }[] = [];
        for (let i = 0; i < stonesArr.length; i++) {
          const st = stonesArr[i];
          const seq = st?.sequence || (Array.isArray(st?.sequences) && st.sequences[0]?.sequence) || st?.sequenceNo;
          if (!seq) continue;
          const cts = typeof st?.cts === "number" ? st.cts : (Array.isArray(st?.sequences) && typeof st.sequences[0]?.cts === "number" ? st.sequences[0].cts : null);
          if (cts == null) continue;
          const net = st?.netWeightGrams != null ? n(st.netWeightGrams) : null;
          if (i > 0 && net !== null) break;
          includedStones.push({ sequence: seq, cts, netWeightGrams: net });
        }

        let diamondCost = 0;
        let diamondIncomplete = false;
        for (const st of includedStones) {
          const pricingDoc: any = (await finalPricingColl.findOne({ sequence: st.sequence })) || {};
          const pricePerCt = parseNumeric(pricingDoc.selling_price ?? pricingDoc.sellingPrice ?? pricingDoc.price);
          if (Number.isNaN(pricePerCt)) { diamondIncomplete = true; continue; }
          diamondCost += pricePerCt * st.cts;
        }

        const metalType =
          (variant?.meta?.metalType || (Array.isArray(metalTypes) ? metalTypes[0] : metalTypes[0]) || "GOLD").toString().toUpperCase();
        let karatStr = variant?.meta?.metalKt || (Array.isArray(goldKarats) ? goldKarats[0] : goldKarats) || "18";
        const karatNum = Number(String(karatStr).match(/\d+/)?.[0] || 18);

        let metalWeightGrams: number | null =
          variant?.meta?.metalWeightGrams != null ? n(variant.meta.metalWeightGrams) : variant?.netWeightGrams != null ? n(variant.netWeightGrams) : null;
        if ((metalWeightGrams == null || Number.isNaN(metalWeightGrams)) && includedStones.length) {
          const sum = includedStones.reduce((acc, s) => acc + (s.netWeightGrams ? Number(s.netWeightGrams) : 0), 0);
          metalWeightGrams = sum > 0 ? sum : null;
        }

        let metalPricePerGram = NaN;
        if (metalType === "GOLD" && !Number.isNaN(goldValue24)) {
          const factor = KARAT_FACTOR[String(karatNum)] ?? KARAT_FACTOR["18"];
          metalPricePerGram = goldValue24 * factor;
        } else if (metalType === "SILVER") metalPricePerGram = silverPricePerGram;
        else if (metalType === "PLATINUM") metalPricePerGram = platinumPricePerGram;
        else if (metalType === "TITANIUM") metalPricePerGram = titaniumPricePerGram;

        let metalCost = 0, labourCost = 0, metalIncomplete = false;
        if (metalWeightGrams && !Number.isNaN(metalPricePerGram)) {
          metalCost = metalPricePerGram * metalWeightGrams;
          labourCost = LABOUR_RATE[metalType] ?? LABOUR_RATE.GOLD;
        } else metalIncomplete = true;

        const computedSellingPrice = metalCost + diamondCost + labourCost;
        sellingPrice = !Number.isNaN(computedSellingPrice) && computedSellingPrice > 0 ? Math.round(computedSellingPrice) : null;
        priceIncomplete = metalIncomplete || diamondIncomplete;
      } catch (err) {
        sellingPrice = null;
        priceIncomplete = true;
      }
    } else {
      sellingPrice = null;
      priceIncomplete = true;
    }

    const response = {
      success: true,
      modelSku,
      title,
      description,
      metalTypes,
      goldKarats,
      diamondShape,
      diamondSize,
      diamondColorClarity,
      isEngraving,
      engraving,
      variantCount,
      firstVariantSku,
      sellingPrice,
      priceIncomplete,
      chosenVariantSku: chosenVariantSku ?? null,
      variantImages,
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



