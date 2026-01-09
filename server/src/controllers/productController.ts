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
  const schema = new mongoose.Schema(
    {},
    { strict: false, collection: collectionName }
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

// export const getProductsByCategory = async (req: Request, res: Response) => {
//   try {
//     const rawCategory = (req.params.category || "").toString();
//     if (!rawCategory)
//       return res
//         .status(400)
//         .json({ success: false, message: "Category required" });
//     const category = rawCategory.toUpperCase();

//     const page = Math.max(1, parseInt((req.query.page as string) || "1", 10));
//     const limit = Math.max(
//       1,
//       Math.min(100, parseInt((req.query.limit as string) || "20", 10))
//     );
//     const skip = (page - 1) * limit;

//     // Price filters
//     const minPrice = n(req.query.minPrice);
//     const maxPrice = n(req.query.maxPrice);

//     // centerStoneShape - always passed as centerStoneShape
//     const shapesRaw = (req.query.centerStoneShape || "").toString().trim();
//     const shapesUpper = shapesRaw
//       ? shapesRaw.split(",").map((s) => s.trim().toUpperCase())
//       : [];

//     // ringType / ring -> SKU prefixes (for rings)
//     const ringRaw = (req.query.ringType || req.query.ring || "")
//       .toString()
//       .trim();
//     const ringTokens = ringRaw ? ringRaw.split(",").map((s) => s.trim()) : [];
//     const mapRingTypeToPrefixes = (token: string): string[] => {
//       const t = token
//         .trim()
//         .toLowerCase()
//         .replace(/[-_\s]+/g, "");
//       if (
//         [
//           "engagement",
//           "eng",
//           "engring",
//           "engagementring",
//           "engagement-ring",
//         ].includes(t)
//       )
//         return ["ENG"];
//       if (
//         ["solitaire", "sol", "sr", "solitairering", "solitaire-ring"].includes(
//           t
//         )
//       )
//         return ["SR"];
//       if (["fashion", "fash", "fr", "fashionring", "fashion-ring"].includes(t))
//         return ["FR"];
//       if (["men", "mens", "gr", "menring", "men-ring"].includes(t))
//         return ["GR"];
//       if (/^(eng|sr|fr|gr)$/i.test(t)) return [t.toUpperCase()];
//       return [];
//     };
//     const ringPrefixes = Array.from(
//       new Set(ringTokens.flatMap(mapRingTypeToPrefixes))
//     );

//     // category1/category2/category3 filters (substring, case-insensitive)
//     const parseCatParam = (v: any) =>
//       v
//         ? String(v)
//             .split(",")
//             .map((s: string) => s.trim())
//             .filter(Boolean)
//             .map((x: string) => x.toUpperCase())
//         : [];
//     const cat1Filters = parseCatParam(req.query.category1);
//     const cat2Filters = parseCatParam(req.query.category2);
//     const cat3Filters = parseCatParam(req.query.category3);

//     // metalTypes filter (comma-separated, case-insensitive)
//     const parseMetalParam = (v: any) =>
//       v
//         ? String(v)
//             .split(",")
//             .map((s: string) => s.trim().toUpperCase())
//             .filter(Boolean)
//         : [];
//     const metalFilters = parseMetalParam(req.query.metalTypes);

//     // NEW: isEngraving filter (only meaningful for RINGS)
//     const isEngravingRaw = (req.query.isEngraving ?? "")
//       .toString()
//       .trim()
//       .toLowerCase();
//     const isEngraving =
//       isEngravingRaw === "true" ||
//       isEngravingRaw === "1" ||
//       isEngravingRaw === "yes";

//     // helpers
//     const normalizeStr = (s: any): string => {
//       if (s == null) return "";
//       return String(s)
//         .replace(/[^\w\s]/g, " ")
//         .replace(/\s+/g, " ")
//         .trim()
//         .toUpperCase();
//     };

//     const centerShapeArrayExpr = {
//       $cond: [
//         { $isArray: "$attributes.centerStoneShape" },
//         "$attributes.centerStoneShape",
//         {
//           $cond: [
//             { $in: ["$attributes.centerStoneShape", [null]] },
//             [],
//             ["$attributes.centerStoneShape"],
//           ],
//         },
//       ],
//     };

//     // categories that require variant-dependent checks and pricing
//     const VARIANT_PRICE_CATEGORIES = new Set([
//       "RINGS",
//       "EARRINGS",
//       "PENDANTS",
//       "BRACELETS",
//     ]);

//     const variantDependentFilterPresent =
//       shapesUpper.length > 0 ||
//       ringPrefixes.length > 0 ||
//       (VARIANT_PRICE_CATEGORIES.has(category) &&
//         (!Number.isNaN(minPrice) || !Number.isNaN(maxPrice)));

//     // Build aggregation pipeline
//     const pipeline: any[] = [{ $match: { category } }];

//     // ring/sku-prefix filter
//     if (
//       (category === "RINGS" ||
//         category === "EARRINGS" ||
//         category === "PENDANTS" ||
//         category === "BRACELETS") &&
//       ringPrefixes.length > 0
//     ) {
//       const prefixExprs = ringPrefixes.map((prefix) => ({
//         $regexMatch: {
//           input: { $ifNull: ["$modelSku", ""] },
//           regex: `^${prefix}`,
//           options: "i",
//         },
//       }));
//       pipeline.push({ $match: { $expr: { $or: prefixExprs } } });
//     }

//     // attribute category filters (substring)
//     if (cat1Filters.length > 0) {
//       pipeline.push({
//         $match: {
//           $or: cat1Filters.map((v) => ({
//             "attributes.category1": { $regex: v, $options: "i" },
//           })),
//         },
//       });
//     }
//     if (cat2Filters.length > 0) {
//       pipeline.push({
//         $match: {
//           $or: cat2Filters.map((v) => ({
//             "attributes.category2": { $regex: v, $options: "i" },
//           })),
//         },
//       });
//     }
//     if (cat3Filters.length > 0) {
//       pipeline.push({
//         $match: {
//           $or: cat3Filters.map((v) => ({
//             "attributes.category3": { $regex: v, $options: "i" },
//           })),
//         },
//       });
//     }

//     // metalTypes DB-level filter (matches if any attribute metalType equals requested metals)
//     if (metalFilters.length > 0) {
//       pipeline.push({
//         $match: {
//           $expr: {
//             $gt: [
//               {
//                 $size: {
//                   $filter: {
//                     input: { $ifNull: ["$attributes.metalTypes", []] },
//                     as: "mt",
//                     cond: { $in: [{ $toUpper: "$$mt" }, metalFilters] },
//                   },
//                 },
//               },
//               0,
//             ],
//           },
//         },
//       });
//     }

//     // DB-level shape match only for categories where attributes.centerStoneShape is authoritative
//     if (
//       shapesUpper.length > 0 &&
//       category !== "EARRINGS" &&
//       category !== "PENDANTS"
//     ) {
//       pipeline.push({
//         $match: {
//           $expr: {
//             $gt: [
//               {
//                 $size: {
//                   $filter: {
//                     input: centerShapeArrayExpr,
//                     as: "sh",
//                     cond: { $in: [{ $toUpper: "$$sh" }, shapesUpper] },
//                   },
//                 },
//               },
//               0,
//             ],
//           },
//         },
//       });
//     }

//     // Project + lookup first variant — include engraving fields in projection
//     pipeline.push(
//       {
//         $project: {
//           modelSku: 1,
//           "attributes.metalTypes": 1,
//           "attributes.goldKarats": 1,
//           "attributes.centerStoneShape": 1,
//           "attributes.category1": 1,
//           "attributes.category2": 1,
//           "attributes.category3": 1,
//           "seo.metaTitle": 1,
//           engraving: 1,
//           engravingDetailIds: 1, // left for compatibility but NOT used for engraving decision anymore
//           firstVariantSku: { $arrayElemAt: ["$variantIds", 0] },
//           variantCount: { $size: { $ifNull: ["$variantIds", []] } },
//         },
//       },
//       {
//         $lookup: {
//           from: "variants",
//           localField: "firstVariantSku",
//           foreignField: "sku",
//           as: "firstVariantDoc",
//         },
//       },
//       {
//         $unwind: { path: "$firstVariantDoc", preserveNullAndEmptyArrays: true },
//       },
//       {
//         $project: {
//           modelSku: 1,
//           metalTypes: "$attributes.metalTypes",
//           goldKarats: "$attributes.goldKarats",
//           title: {
//             $ifNull: [
//               "$firstVariantDoc.meta.title",
//               "$seo.metaTitle",
//               "$title",
//             ],
//           },
//           variantCount: 1,
//           firstVariantSku: 1,
//           firstVariantDoc: 1,
//           attributesCenterShape: "$attributes.centerStoneShape",
//           attributesCategory1: "$attributes.category1",
//           attributesCategory2: "$attributes.category2",
//           attributesCategory3: "$attributes.category3",
//           engraving: 1,
//           engravingDetailIds: 1,
//         },
//       }
//     );

//     // NEW: if isEngraving=true and category is RINGS, enforce DB-level filter now that variant is available
//     // BUT per your instruction: only check product engraving object presence — do NOT check ids or variant fields.
//     if (category === "RINGS" && isEngraving) {
//       pipeline.push({
//         $match: {
//           $expr: {
//             // require the product-level 'engraving' field to be an object
//             $eq: [{ $type: "$engraving" }, "object"],
//           },
//         },
//       });
//     }

//     pipeline.push({ $sort: { modelSku: 1 } });
//     if (!variantDependentFilterPresent)
//       pipeline.push({ $skip: skip }, { $limit: limit });

//     const ProductModel = getCollectionModel("products");
//     const docs = await ProductModel.aggregate(pipeline)
//       .allowDiskUse(true)
//       .exec();

//     // Prepare pricing/defaults
//     const conn = getCatalogConnection();
//     const finalPricingColl = conn.collection("final_pricing");
//     const defaultsColl = conn.collection("defaultValues");

//     // ----------------- Helper functions reused for robust default lookup -----------------
//     const toNumberRobust = (v: unknown): number => {
//       if (v == null) return NaN;
//       if (typeof v === "number") return Number.isFinite(v) ? v : NaN;
//       if (typeof v === "string") {
//         const cleaned = v.replace(/[₹$,£€\s]/g, "").replace(/,/g, "");
//         const n = Number(cleaned);
//         if (!Number.isNaN(n) && Number.isFinite(n)) return n;
//         const m = cleaned.match(/-?\d+(\.\d+)?/);
//         if (m) {
//           const nf = Number(m[0]);
//           return Number.isFinite(nf) ? nf : NaN;
//         }
//         return NaN;
//       }
//       try {
//         const s = (v as any).toString?.();
//         const n = Number(s);
//         return Number.isFinite(n) ? n : NaN;
//       } catch {
//         return NaN;
//       }
//     };

//     const normalizeKey = (k: string) =>
//       k
//         .toString()
//         .trim()
//         .toLowerCase()
//         .replace(/[^a-z0-9]/g, "");

//     const findNumericDefault = (
//       obj: Record<string, any>,
//       candidateNames: string[]
//     ): { value: number; matchedKey?: string } => {
//       if (!obj || typeof obj !== "object") return { value: NaN };

//       const candNorm = candidateNames.map((c) => normalizeKey(c));

//       // 1) exact-normalized match
//       for (const [k, v] of Object.entries(obj)) {
//         const kn = normalizeKey(k);
//         if (candNorm.includes(kn)) {
//           const val = toNumberRobust(v);
//           if (!Number.isNaN(val)) return { value: val, matchedKey: k };
//         }
//       }

//       // 2) substring-normalized match
//       for (const [k, v] of Object.entries(obj)) {
//         const kn = normalizeKey(k);
//         for (const cn of candNorm) {
//           if (kn.includes(cn) || cn.includes(kn)) {
//             const val = toNumberRobust(v);
//             if (!Number.isNaN(val)) return { value: val, matchedKey: k };
//           }
//         }
//       }

//       // 3) one-level nested objects
//       for (const [k, v] of Object.entries(obj)) {
//         if (v && typeof v === "object" && !Array.isArray(v)) {
//           for (const [k2, v2] of Object.entries(v as Record<string, any>)) {
//             const kn2 = normalizeKey(k2);
//             if (candNorm.includes(kn2)) {
//               const val = toNumberRobust(v2);
//               if (!Number.isNaN(val))
//                 return { value: val, matchedKey: `${k}.${k2}` };
//             }
//             for (const cn of candNorm) {
//               if (kn2.includes(cn) || cn.includes(kn2)) {
//                 const val = toNumberRobust(v2);
//                 if (!Number.isNaN(val))
//                   return { value: val, matchedKey: `${k}.${k2}` };
//               }
//             }
//           }
//         }
//       }

//       return { value: NaN };
//     };
//     // ----------------- end helpers -----------------

//     // Merge all default docs (same approach as used in the other controller)
//     const defaultDocs = (await defaultsColl.find({}).toArray()) as Record<
//       string,
//       any
//     >[];
//     const mergedDefaults: Record<string, any> = Object.assign(
//       {},
//       ...defaultDocs.map((doc) => {
//         const copy = { ...doc };
//         delete (copy as any)._id;
//         return copy;
//       })
//     );

//     // Resolve base metal prices from merged defaults robustly
//     const goldRes = findNumericDefault(mergedDefaults, [
//       "goldValue24PerGram",
//       "goldValue24",
//       "goldPerGram",
//       "gold24",
//       "goldvalue24pergram",
//     ]);
//     const platinumRes = findNumericDefault(mergedDefaults, [
//       "platinumPricePerGram",
//       "platinumPricePerGrm",
//       "platinumPerGram",
//       "ptPricePerGram",
//     ]);
//     const silverRes = findNumericDefault(mergedDefaults, [
//       "silverPricePerGram",
//       "silverPerGram",
//       "silverPrice",
//       "svPricePerGram",
//     ]);
//     const titaniumRes = findNumericDefault(mergedDefaults, [
//       "titaniumPricePerGram",
//       "titaniumPerGram",
//       "titaniumPrice",
//     ]);

//     const goldValue24 = goldRes.value;
//     const silverPricePerGram = silverRes.value;
//     const platinumPricePerGram = platinumRes.value;
//     const titaniumPricePerGram = titaniumRes.value;

//     // Prepare normalized output
//     const normalized: any[] = [];

//     for (const d of docs) {
//       // image
//       let imageUrl: string | null = null;
//       if (
//         Array.isArray(d.firstVariantDoc?.images) &&
//         d.firstVariantDoc.images.length > 0
//       ) {
//         const img = d.firstVariantDoc.images[1] ?? d.firstVariantDoc.images[1];
//         if (img) imageUrl = (img.url ?? img.filename) || null;
//       }

//       const engravingObj = d.engraving ?? null;
//       const engravingMaxChars =
//         engravingObj && typeof engravingObj.maxCharacters === "number"
//           ? engravingObj.maxCharacters
//           : null;
//       const engravingFontSize =
//         engravingObj && engravingObj.fontSize != null
//           ? engravingObj.fontSize
//           : null;

//       const baseOut: any = {
//         _id: d._id, // Add MongoDB _id for cart compatibility
//         modelSku: d.modelSku,
//         metalTypes: Array.isArray(d.metalTypes)
//           ? d.metalTypes
//           : d.metalTypes
//           ? [d.metalTypes]
//           : [],
//         title: d.title ?? null,
//         variantCount: d.variantCount ?? 0,
//         firstVariantSku: d.firstVariantSku ?? null,
//         firstVariantImageUrl: imageUrl,
//         attributesCategory1: d.attributesCategory1 ?? null,
//         attributesCategory2: d.attributesCategory2 ?? null,
//         attributesCategory3: d.attributesCategory3 ?? null,
//         // engraving fields returned only for rings (per request) — keep null otherwise
//         engravingMaxCharacters: category === "RINGS" ? engravingMaxChars : null,
//         engravingFontSize: category === "RINGS" ? engravingFontSize : null,
//         sellingPrice: null,
//         priceIncomplete: true,
//       };

//       // If isEngraving filter requested but engraving info missing, skip.
//       if (category === "RINGS" && isEngraving) {
//         // Per requirement: only consider product-level engraving object presence.
//         if (!d.engraving || typeof d.engraving !== "object") {
//           continue;
//         }
//       }

//       // SHAPE check (JS-side for EARRINGS and PENDANTS; extra check for other categories too)
//       if (shapesUpper.length > 0) {
//         const productShapes: string[] = [];
//         if (d.attributesCenterShape) {
//           if (Array.isArray(d.attributesCenterShape))
//             productShapes.push(
//               ...d.attributesCenterShape.map((s: any) => normalizeStr(s))
//             );
//           else productShapes.push(normalizeStr(d.attributesCenterShape));
//         }

//         const variant = d.firstVariantDoc;
//         const variantShapes: string[] = [];
//         if (variant) {
//           const stonesArr: any[] =
//             Array.isArray(variant?.meta?.stones) && variant.meta.stones.length
//               ? variant.meta.stones
//               : Array.isArray(variant?.stones)
//               ? variant.stones
//               : [];

//           for (const st of stonesArr) {
//             if (category === "EARRINGS" || category === "PENDANTS") {
//               if (st?.diamondGemstoneShapes) {
//                 if (Array.isArray(st.diamondGemstoneShapes))
//                   variantShapes.push(
//                     ...st.diamondGemstoneShapes.map((x: any) => normalizeStr(x))
//                   );
//                 else variantShapes.push(normalizeStr(st.diamondGemstoneShapes));
//               }
//               if (st?.diamondGemstoneShape)
//                 variantShapes.push(normalizeStr(st.diamondGemstoneShape));
//             } else if (category === "BRACELETS") {
//               if (st?.centerStoneShape)
//                 variantShapes.push(normalizeStr(st.centerStoneShape));
//               if (st?.diamondGemstoneShapes) {
//                 if (Array.isArray(st.diamondGemstoneShapes))
//                   variantShapes.push(
//                     ...st.diamondGemstoneShapes.map((x: any) => normalizeStr(x))
//                   );
//                 else variantShapes.push(normalizeStr(st.diamondGemstoneShapes));
//               }
//             } else {
//               if (st?.centerStoneShape)
//                 variantShapes.push(normalizeStr(st.centerStoneShape));
//               if (st?.diamondGemstoneShapes) {
//                 if (Array.isArray(st.diamondGemstoneShapes))
//                   variantShapes.push(
//                     ...st.diamondGemstoneShapes.map((x: any) => normalizeStr(x))
//                   );
//                 else variantShapes.push(normalizeStr(st.diamondGemstoneShapes));
//               }
//               if (st?.diamondGemstoneShape)
//                 variantShapes.push(normalizeStr(st.diamondGemstoneShape));
//             }

//             if (Array.isArray(st?.sequences)) {
//               for (const seq of st.sequences) {
//                 if (category === "EARRINGS" || category === "PENDANTS") {
//                   if (seq?.diamondGemstoneShapes) {
//                     if (Array.isArray(seq.diamondGemstoneShapes))
//                       variantShapes.push(
//                         ...seq.diamondGemstoneShapes.map((x: any) =>
//                           normalizeStr(x)
//                         )
//                       );
//                     else
//                       variantShapes.push(
//                         normalizeStr(seq.diamondGemstoneShapes)
//                       );
//                   }
//                   if (seq?.diamondGemstoneShape)
//                     variantShapes.push(normalizeStr(seq.diamondGemstoneShape));
//                 } else if (category === "BRACELETS") {
//                   if (seq?.centerStoneShape)
//                     variantShapes.push(normalizeStr(seq.centerStoneShape));
//                   if (seq?.diamondGemstoneShapes) {
//                     if (Array.isArray(seq.diamondGemstoneShapes))
//                       variantShapes.push(
//                         ...seq.diamondGemstoneShapes.map((x: any) =>
//                           normalizeStr(x)
//                         )
//                       );
//                     else
//                       variantShapes.push(
//                         normalizeStr(seq.diamondGemstoneShapes)
//                       );
//                   }
//                 } else {
//                   if (seq?.centerStoneShape)
//                     variantShapes.push(normalizeStr(seq.centerStoneShape));
//                   if (seq?.diamondGemstoneShapes) {
//                     if (Array.isArray(seq.diamondGemstoneShapes))
//                       variantShapes.push(
//                         ...seq.diamondGemstoneShapes.map((x: any) =>
//                           normalizeStr(x)
//                         )
//                       );
//                     else
//                       variantShapes.push(
//                         normalizeStr(seq.diamondGemstoneShapes)
//                       );
//                   }
//                   if (seq?.diamondGemstoneShape)
//                     variantShapes.push(normalizeStr(seq.diamondGemstoneShape));
//                 }
//               }
//             }
//           }
//         }

//         const combinedShapes = Array.from(
//           new Set([...productShapes, ...variantShapes].filter(Boolean))
//         );
//         const targets = shapesUpper.map((t) => normalizeStr(t));
//         const matched = combinedShapes.some((h) =>
//           targets.some((t) => t && (h === t || h.includes(t) || t.includes(h)))
//         );
//         if (!matched) continue;
//       }

//       // PRICE calc for VARIANT_PRICE_CATEGORIES
//       if (VARIANT_PRICE_CATEGORIES.has(category) && d.firstVariantDoc) {
//         try {
//           const variant = d.firstVariantDoc;
//           const stonesArr: any[] =
//             Array.isArray(variant?.meta?.stones) && variant.meta.stones.length
//               ? variant.meta.stones
//               : Array.isArray(variant?.stones)
//               ? variant.stones
//               : [];

//           const includedStones: {
//             sequence: string;
//             cts: number;
//             netWeightGrams: number | null;
//           }[] = [];
//           for (let i = 0; i < stonesArr.length; i++) {
//             const st = stonesArr[i];
//             const seq =
//               st?.sequence ||
//               (Array.isArray(st?.sequences) && st.sequences[0]?.sequence) ||
//               st?.sequenceNo;
//             if (!seq) continue;
//             const cts =
//               typeof st?.cts === "number"
//                 ? st.cts
//                 : Array.isArray(st?.sequences) &&
//                   typeof st.sequences[0]?.cts === "number"
//                 ? st.sequences[0].cts
//                 : null;
//             if (cts == null) continue;
//             const net =
//               st?.netWeightGrams != null ? n(st.netWeightGrams) : null;
//             if (i > 0 && net !== null) break;
//             includedStones.push({ sequence: seq, cts, netWeightGrams: net });
//           }

//           let diamondCost = 0;
//           let diamondIncomplete = false;
//           for (const st of includedStones) {
//             const pricingDoc: any =
//               (await finalPricingColl.findOne({ sequence: st.sequence })) || {};
//             const pricePerCt = parseNumeric(
//               pricingDoc.selling_price ??
//                 pricingDoc.sellingPrice ??
//                 pricingDoc.price
//             );
//             if (Number.isNaN(pricePerCt)) {
//               diamondIncomplete = true;
//               continue;
//             }
//             diamondCost += pricePerCt * st.cts;
//           }

//           const metalType = (
//             variant?.meta?.metalType ||
//             (Array.isArray(d.metalTypes) ? d.metalTypes[0] : d.metalTypes) ||
//             "GOLD"
//           )
//             .toString()
//             .toUpperCase();
//           let karatStr =
//             variant?.meta?.metalKt ||
//             (Array.isArray(d.goldKarats) ? d.goldKarats[0] : d.goldKarats) ||
//             "18";
//           const karatNum = Number(String(karatStr).match(/\d+/)?.[0] || 18);

//           let metalWeightGrams: number | null =
//             variant?.meta?.metalWeightGrams != null
//               ? n(variant.meta.metalWeightGrams)
//               : variant?.netWeightGrams != null
//               ? n(variant.netWeightGrams)
//               : null;
//           if (
//             (metalWeightGrams == null || Number.isNaN(metalWeightGrams)) &&
//             includedStones.length
//           ) {
//             const sum = includedStones.reduce(
//               (acc, s) =>
//                 acc + (s.netWeightGrams ? Number(s.netWeightGrams) : 0),
//               0
//             );
//             metalWeightGrams = sum > 0 ? sum : null;
//           }

//           let metalPricePerGram = NaN;
//           if (metalType === "GOLD" && !Number.isNaN(goldValue24)) {
//             const factor = KARAT_FACTOR[String(karatNum)] ?? KARAT_FACTOR["18"];
//             metalPricePerGram = goldValue24 * factor;
//           } else if (metalType === "SILVER")
//             metalPricePerGram = silverPricePerGram;
//           else if (metalType === "PLATINUM")
//             metalPricePerGram = platinumPricePerGram;
//           else if (metalType === "TITANIUM")
//             metalPricePerGram = titaniumPricePerGram;

//           let metalCost = 0,
//             labourCost = 0,
//             metalIncomplete = false;
//           if (metalWeightGrams && !Number.isNaN(metalPricePerGram)) {
//             metalCost = metalPricePerGram * metalWeightGrams;
//             labourCost = LABOUR_RATE[metalType] ?? LABOUR_RATE.GOLD; // flat fee
//           } else metalIncomplete = true;

//           const sellingPrice = metalCost + diamondCost + labourCost;
//           baseOut.sellingPrice =
//             !Number.isNaN(sellingPrice) && sellingPrice > 0
//               ? Math.round(sellingPrice)
//               : null;
//           baseOut.priceIncomplete = metalIncomplete || diamondIncomplete;
//         } catch (err) {
//           baseOut.sellingPrice = null;
//           baseOut.priceIncomplete = true;
//         }
//       }

//       normalized.push(baseOut);
//     }

//     // Apply min/max price filter for VARIANT_PRICE_CATEGORIES
//     let filtered = normalized;
//     const shouldApplyPriceFilter =
//       VARIANT_PRICE_CATEGORIES.has(category) &&
//       (!Number.isNaN(minPrice) || !Number.isNaN(maxPrice));
//     if (shouldApplyPriceFilter) {
//       filtered = normalized.filter((p) => {
//         if (p.priceIncomplete || !p.sellingPrice) return false;
//         if (!Number.isFinite(p.sellingPrice)) return false;
//         if (!Number.isNaN(minPrice) && p.sellingPrice < minPrice) return false;
//         if (!Number.isNaN(maxPrice) && p.sellingPrice > maxPrice) return false;
//         return true;
//       });
//     }

//     // Pagination in JS when variant-dependent filters present (we fetched unpaginated)
//     let paged = filtered;
//     let totalFiltered = filtered.length;
//     if (variantDependentFilterPresent) {
//       paged = filtered.slice(skip, skip + limit);
//       totalFiltered = filtered.length;
//     }

//     const conn2 = getCatalogConnection();
//     const total = await conn2
//       .collection("products")
//       .countDocuments({ category });

//     // When no variant-dependent filters, use the total from DB for pagination calculation
//     const totalForPagination = variantDependentFilterPresent
//       ? totalFiltered
//       : total;

//     return res.status(200).json({
//       success: true,
//       count: paged.length,
//       total,
//       pagination: {
//         totalPages: Math.ceil(totalForPagination / limit),
//         currentPage: page,
//         limit,
//       },
//       appliedFilters: {
//         category,
//         centerStoneShape: shapesUpper,
//         ringTypeRequested: ringTokens,
//         ringPrefixesApplied: ringPrefixes,
//         category1: cat1Filters.length ? cat1Filters : null,
//         category2: cat2Filters.length ? cat2Filters : null,
//         category3: cat3Filters.length ? cat3Filters : null,
//         metalTypes: metalFilters.length ? metalFilters : null,
//         isEngraving: category === "RINGS" ? (isEngraving ? true : false) : null,
//         minPrice: !Number.isNaN(minPrice) ? minPrice : null,
//         maxPrice: !Number.isNaN(maxPrice) ? maxPrice : null,
//       },
//       products: paged,
//     });
//   } catch (err) {
//     console.error("getProductsByCategory error:", err);
//     return res.status(500).json({
//       success: false,
//       message: "Server error",
//       error: err instanceof Error ? err.message : String(err),
//     });
//   }
// };



// export const getProductsByCategory = async (req: Request, res: Response) => {
//   try {
//     const rawCategory = String(req.params.category || "").trim();
//     if (!rawCategory)
//       return res.status(400).json({ success: false, message: "Category required" });

//     const category = rawCategory.toUpperCase();

//     const page = Math.max(1, parseInt(String(req.query.page || "1"), 10));
//     const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit || "20"), 10)));
//     const skip = (page - 1) * limit;

//     const minPrice = n(req.query.minPrice);
//     const maxPrice = n(req.query.maxPrice);

//     // Parse filters
//     const shapesRaw = String(req.query.centerStoneShape || "").trim();
//     const shapes = shapesRaw
//       ? shapesRaw.split(",").map(s => s.trim().toUpperCase()).filter(Boolean)
//       : [];

//     const metalTypesRaw = String(req.query.metalTypes || "").trim();
//     const metalTypes = metalTypesRaw
//       ? metalTypesRaw.split(",").map(s => s.trim().toUpperCase()).filter(Boolean)
//       : [];

//     const isEngravingRaw = String(req.query.isEngraving || "").trim().toLowerCase();
//     const isEngraving = ["true", "1", "yes"].includes(isEngravingRaw);

//     // Ring type filters
//     const ringRaw = String(req.query.ringType || req.query.ring || "").trim();
//     const ringTokens = ringRaw ? ringRaw.split(",").map(s => s.trim()) : [];

//     const mapRingTypeToPrefixes = (token: string): string[] => {
//       const t = token.trim().toLowerCase().replace(/[-_\s]+/g, "");
//       if (["engagement", "eng", "engring", "engagementring", "engagement-ring"].includes(t))
//         return ["ENG"];
//       if (["solitaire", "sol", "sr", "solitairering", "solitaire-ring"].includes(t))
//         return ["SR"];
//       if (["fashion", "fash", "fr", "fashionring", "fashion-ring"].includes(t))
//         return ["FR"];
//       if (["men", "mens", "gr", "menring", "men-ring"].includes(t))
//         return ["GR"];
//       if (/^(eng|sr|fr|gr)$/i.test(t)) return [t.toUpperCase()];
//       return [];
//     };

//     const ringPrefixes = Array.from(
//       new Set(ringTokens.flatMap(mapRingTypeToPrefixes))
//     );

//     // Category filters
//     const parseCatParam = (v: any) =>
//       v
//         ? String(v).split(",").map((s: string) => s.trim()).filter(Boolean).map((x: string) => x.toUpperCase())
//         : [];

//     const cat1Filters = parseCatParam(req.query.category1);
//     const cat2Filters = parseCatParam(req.query.category2);
//     const cat3Filters = parseCatParam(req.query.category3);

//     const VariantModel = getCollectionModel("variants");

//     /**
//      * BUILD VARIANT MATCH
//      */
//     const variantMatch: any = { category };

//     // Metal type filter
//     if (metalTypes.length > 0) {
//       variantMatch["meta.metalType"] = { $in: metalTypes };
//     }

//     // Engraving filter
//     if (isEngraving) {
//       variantMatch["engraving"] = { $type: "object" };
//     }

//     // Shape filter
//     if (shapes.length > 0) {
//       variantMatch.$or = [
//         { "meta.stones.centerStoneShape": { $in: shapes } },
//         { "meta.stones.diamondGemstoneShape": { $in: shapes } },
//         { "meta.stones.diamondGemstoneShapes": { $in: shapes } },
//         { "meta.stones.sequences.centerStoneShape": { $in: shapes } },
//         { "meta.stones.sequences.diamondGemstoneShape": { $in: shapes } },
//         { "meta.stones.sequences.diamondGemstoneShapes": { $in: shapes } },
//       ];
//     }

//     // Ring type (SKU prefix) filter
//     if (ringPrefixes.length > 0) {
//       const prefixRegexes = ringPrefixes.map(prefix => new RegExp(`^${prefix}`, "i"));
//       variantMatch.modelSku = { $in: prefixRegexes };
//     }

//     /**
//      * AGGREGATION PIPELINE
//      */
//     const pipeline: any[] = [
//       { $match: variantMatch },

//       // Group by modelSku - keep FULL variant document
//       {
//         $group: {
//           _id: "$modelSku",
//           firstVariant: { $first: "$$ROOT" },
//         },
//       },

//       // Lookup product
//       {
//         $lookup: {
//           from: "products",
//           localField: "_id",
//           foreignField: "modelSku",
//           as: "product",
//         },
//       },
//       { $unwind: { path: "$product", preserveNullAndEmptyArrays: false } },
//     ];

//     // Apply product-level category filters
//     if (cat1Filters.length > 0) {
//       pipeline.push({
//         $match: {
//           $or: cat1Filters.map(v => ({
//             "product.attributes.category1": { $regex: v, $options: "i" },
//           })),
//         },
//       });
//     }

//     if (cat2Filters.length > 0) {
//       pipeline.push({
//         $match: {
//           $or: cat2Filters.map(v => ({
//             "product.attributes.category2": { $regex: v, $options: "i" },
//           })),
//         },
//       });
//     }

//     if (cat3Filters.length > 0) {
//       pipeline.push({
//         $match: {
//           $or: cat3Filters.map(v => ({
//             "product.attributes.category3": { $regex: v, $options: "i" },
//           })),
//         },
//       });
//     }

//     pipeline.push({ $sort: { "_id": 1 } });

//     const allResults = await VariantModel.aggregate(pipeline)
//       .allowDiskUse(true)
//       .exec();

//     /**
//      * PRICING CALCULATION (SAME AS OLD CONTROLLER)
//      */
//     const conn = getCatalogConnection();
//     const finalPricingColl = conn.collection("final_pricing");
//     const defaultsColl = conn.collection("defaultValues");

//     const defaultDocs = await defaultsColl.find({}).toArray();
//     const mergedDefaults = Object.assign(
//       {},
//       ...defaultDocs.map(d => {
//         const c = { ...d };
//         delete (c as any)._id;
//         return c;
//       })
//     );

//     const toNumberRobust = (v: unknown): number => {
//       if (v == null) return NaN;
//       if (typeof v === "number") return Number.isFinite(v) ? v : NaN;
//       if (typeof v === "string") {
//         const cleaned = v.replace(/[₹$,£€\s]/g, "").replace(/,/g, "");
//         const n = Number(cleaned);
//         if (!Number.isNaN(n) && Number.isFinite(n)) return n;
//         const m = cleaned.match(/-?\d+(\.\d+)?/);
//         if (m) {
//           const nf = Number(m[0]);
//           return Number.isFinite(nf) ? nf : NaN;
//         }
//         return NaN;
//       }
//       try {
//         const s = (v as any).toString?.();
//         const n = Number(s);
//         return Number.isFinite(n) ? n : NaN;
//       } catch {
//         return NaN;
//       }
//     };

//     const normalizeKey = (k: string) =>
//       k.toString().trim().toLowerCase().replace(/[^a-z0-9]/g, "");

//     const findNumericDefault = (
//       obj: Record<string, any>,
//       candidateNames: string[]
//     ): { value: number; matchedKey?: string } => {
//       if (!obj || typeof obj !== "object") return { value: NaN };
//       const candNorm = candidateNames.map((c) => normalizeKey(c));

//       for (const [k, v] of Object.entries(obj)) {
//         const kn = normalizeKey(k);
//         if (candNorm.includes(kn)) {
//           const val = toNumberRobust(v);
//           if (!Number.isNaN(val)) return { value: val, matchedKey: k };
//         }
//       }

//       for (const [k, v] of Object.entries(obj)) {
//         const kn = normalizeKey(k);
//         for (const cn of candNorm) {
//           if (kn.includes(cn) || cn.includes(kn)) {
//             const val = toNumberRobust(v);
//             if (!Number.isNaN(val)) return { value: val, matchedKey: k };
//           }
//         }
//       }

//       for (const [k, v] of Object.entries(obj)) {
//         if (v && typeof v === "object" && !Array.isArray(v)) {
//           for (const [k2, v2] of Object.entries(v as Record<string, any>)) {
//             const kn2 = normalizeKey(k2);
//             if (candNorm.includes(kn2)) {
//               const val = toNumberRobust(v2);
//               if (!Number.isNaN(val))
//                 return { value: val, matchedKey: `${k}.${k2}` };
//             }
//             for (const cn of candNorm) {
//               if (kn2.includes(cn) || cn.includes(kn2)) {
//                 const val = toNumberRobust(v2);
//                 if (!Number.isNaN(val))
//                   return { value: val, matchedKey: `${k}.${k2}` };
//               }
//             }
//           }
//         }
//       }

//       return { value: NaN };
//     };

//     const goldRes = findNumericDefault(mergedDefaults, [
//       "goldValue24PerGram",
//       "goldValue24",
//       "goldPerGram",
//       "gold24",
//       "goldvalue24pergram",
//     ]);
//     const platinumRes = findNumericDefault(mergedDefaults, [
//       "platinumPricePerGram",
//       "platinumPricePerGrm",
//       "platinumPerGram",
//       "ptPricePerGram",
//     ]);
//     const silverRes = findNumericDefault(mergedDefaults, [
//       "silverPricePerGram",
//       "silverPerGram",
//       "silverPrice",
//       "svPricePerGram",
//     ]);
//     const titaniumRes = findNumericDefault(mergedDefaults, [
//       "titaniumPricePerGram",
//       "titaniumPerGram",
//       "titaniumPrice",
//     ]);

//     const goldValue24 = goldRes.value;
//     const silverPricePerGram = silverRes.value;
//     const platinumPricePerGram = platinumRes.value;
//     const titaniumPricePerGram = titaniumRes.value;

//     const products: any[] = [];

//     for (const row of allResults) {
//       const variant = row.firstVariant;
//       const product = row.product;

//       // Get image
//       let imageUrl: string | null = null;
//       if (Array.isArray(variant.images) && variant.images.length > 0) {
//         const img = variant.images[0];
//         imageUrl = img?.url || img?.filename || null;
//       }

//       // Get engraving from variant (not product)
//       const engravingObj = variant.engraving ?? null;
//       const engravingMaxChars =
//         engravingObj && typeof engravingObj.maxCharacters === "number"
//           ? engravingObj.maxCharacters
//           : null;
//       const engravingFontSize =
//         engravingObj && engravingObj.fontSize != null ? engravingObj.fontSize : null;

//       // Get metal types from PRODUCT attributes
//       const productMetalTypes = Array.isArray(product.attributes?.metalTypes)
//         ? product.attributes.metalTypes
//         : product.attributes?.metalTypes
//         ? [product.attributes.metalTypes]
//         : [];

//       const baseOut: any = {
//         _id: product._id,
//         modelSku: product.modelSku,
//         metalTypes: productMetalTypes,
//         title: variant.meta?.title || product.seo?.metaTitle || product.title || null,
//         variantCount: Array.isArray(product.variantIds) ? product.variantIds.length : 0,
//         firstVariantSku: variant.sku,
//         firstVariantImageUrl: imageUrl,
//         attributesCategory1: product.attributes?.category1 ?? null,
//         attributesCategory2: product.attributes?.category2 ?? null,
//         attributesCategory3: product.attributes?.category3 ?? null,
//         engravingMaxCharacters: category === "RINGS" ? engravingMaxChars : null,
//         engravingFontSize: category === "RINGS" ? engravingFontSize : null,
//         sellingPrice: null,
//         priceIncomplete: true,
//       };

//       // Calculate price
//       try {
//         const stonesArr: any[] = Array.isArray(variant.meta?.stones) && variant.meta.stones.length
//           ? variant.meta.stones
//           : Array.isArray(variant.stones)
//           ? variant.stones
//           : [];

//         const includedStones: {
//           sequence: string;
//           cts: number;
//           netWeightGrams: number | null;
//         }[] = [];

//         for (let i = 0; i < stonesArr.length; i++) {
//           const st = stonesArr[i];
//           const seq =
//             st?.sequence ||
//             (Array.isArray(st?.sequences) && st.sequences[0]?.sequence) ||
//             st?.sequenceNo;
//           if (!seq) continue;

//           const cts =
//             typeof st?.cts === "number"
//               ? st.cts
//               : Array.isArray(st?.sequences) && typeof st.sequences[0]?.cts === "number"
//               ? st.sequences[0].cts
//               : null;
//           if (cts == null) continue;

//           const net = st?.netWeightGrams != null ? n(st.netWeightGrams) : null;
//           if (i > 0 && net !== null) break;

//           includedStones.push({ sequence: seq, cts, netWeightGrams: net });
//         }

//         let diamondCost = 0;
//         let diamondIncomplete = false;

//         for (const st of includedStones) {
//           const pricingDoc: any =
//             (await finalPricingColl.findOne({ sequence: st.sequence })) || {};
//           const pricePerCt = parseNumeric(
//             pricingDoc.selling_price ?? pricingDoc.sellingPrice ?? pricingDoc.price
//           );
//           if (Number.isNaN(pricePerCt)) {
//             diamondIncomplete = true;
//             continue;
//           }
//           diamondCost += pricePerCt * st.cts;
//         }

//         const metalType = (
//           variant?.meta?.metalType ||
//           (Array.isArray(productMetalTypes) ? productMetalTypes[0] : productMetalTypes) ||
//           "GOLD"
//         ).toString().toUpperCase();

//         let karatStr =
//           variant?.meta?.metalKt ||
//           (Array.isArray(product.attributes?.goldKarats)
//             ? product.attributes.goldKarats[0]
//             : product.attributes?.goldKarats) ||
//           "18";
//         const karatNum = Number(String(karatStr).match(/\d+/)?.[0] || 18);

//         let metalWeightGrams: number | null =
//           variant?.meta?.metalWeightGrams != null
//             ? n(variant.meta.metalWeightGrams)
//             : variant?.netWeightGrams != null
//             ? n(variant.netWeightGrams)
//             : null;

//         if (
//           (metalWeightGrams == null || Number.isNaN(metalWeightGrams)) &&
//           includedStones.length
//         ) {
//           const sum = includedStones.reduce(
//             (acc, s) => acc + (s.netWeightGrams ? Number(s.netWeightGrams) : 0),
//             0
//           );
//           metalWeightGrams = sum > 0 ? sum : null;
//         }

//         let metalPricePerGram = NaN;
//         if (metalType === "GOLD" && !Number.isNaN(goldValue24)) {
//           const factor = KARAT_FACTOR[String(karatNum)] ?? KARAT_FACTOR["18"];
//           metalPricePerGram = goldValue24 * factor;
//         } else if (metalType === "SILVER") metalPricePerGram = silverPricePerGram;
//         else if (metalType === "PLATINUM") metalPricePerGram = platinumPricePerGram;
//         else if (metalType === "TITANIUM") metalPricePerGram = titaniumPricePerGram;

//         let metalCost = 0,
//           labourCost = 0,
//           metalIncomplete = false;

//         if (metalWeightGrams && !Number.isNaN(metalPricePerGram)) {
//           metalCost = metalPricePerGram * metalWeightGrams;
//           labourCost = LABOUR_RATE[metalType] ?? LABOUR_RATE.GOLD;
//         } else metalIncomplete = true;

//         const sellingPrice = metalCost + diamondCost + labourCost;
//         baseOut.sellingPrice =
//           !Number.isNaN(sellingPrice) && sellingPrice > 0
//             ? Math.round(sellingPrice)
//             : null;
//         baseOut.priceIncomplete = metalIncomplete || diamondIncomplete;
//       } catch (err) {
//         baseOut.sellingPrice = null;
//         baseOut.priceIncomplete = true;
//       }

//       // Price filter
//       if (!Number.isNaN(minPrice) && (baseOut.sellingPrice === null || baseOut.sellingPrice < minPrice))
//         continue;
//       if (!Number.isNaN(maxPrice) && (baseOut.sellingPrice === null || baseOut.sellingPrice > maxPrice))
//         continue;

//       products.push(baseOut);
//     }

//     // Pagination
//     const totalFiltered = products.length;
//     const paged = products.slice(skip, skip + limit);

//     const ProductModel = getCollectionModel("products");
//     const totalProducts = await ProductModel.countDocuments({ category });

//     return res.status(200).json({
//       success: true,
//       count: paged.length,
//       total: totalProducts,
//       totalFiltered,
//       pagination: {
//         totalPages: Math.ceil(totalFiltered / limit),
//         currentPage: page,
//         limit,
//       },
//       appliedFilters: {
//         category,
//         centerStoneShape: shapes.length > 0 ? shapes : null,
//         ringTypeRequested: ringTokens.length > 0 ? ringTokens : null,
//         ringPrefixesApplied: ringPrefixes.length > 0 ? ringPrefixes : null,
//         category1: cat1Filters.length > 0 ? cat1Filters : null,
//         category2: cat2Filters.length > 0 ? cat2Filters : null,
//         category3: cat3Filters.length > 0 ? cat3Filters : null,
//         metalTypes: metalTypes.length > 0 ? metalTypes : null,
//         isEngraving: category === "RINGS" ? isEngraving : null,
//         minPrice: !Number.isNaN(minPrice) ? minPrice : null,
//         maxPrice: !Number.isNaN(maxPrice) ? maxPrice : null,
//       },
//       products: paged,
//     });
//   } catch (err) {
//     console.error("getProductsByCategory error:", err);
//     return res.status(500).json({
//       success: false,
//       message: "Server error",
//       error: err instanceof Error ? err.message : String(err),
//     });
//   }
// };


// export const getProductsByCategory = async (req: Request, res: Response) => {
//   try {
//     const rawCategory = String(req.params.category || "").trim();
//     if (!rawCategory)
//       return res.status(400).json({ success: false, message: "Category required" });

//     const category = rawCategory.toUpperCase();

//     const page = Math.max(1, parseInt(String(req.query.page || "1"), 10));
//     const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit || "20"), 10)));
//     const skip = (page - 1) * limit;

//     const minPrice = n(req.query.minPrice);
//     const maxPrice = n(req.query.maxPrice);

//     // Parse filters
//     const shapesRaw = String(req.query.centerStoneShape || "").trim();
//     const shapes = shapesRaw
//       ? shapesRaw.split(",").map(s => s.trim().toUpperCase()).filter(Boolean)
//       : [];

//     const metalTypesRaw = String(req.query.metalTypes || "").trim();
//     const metalTypes = metalTypesRaw
//       ? metalTypesRaw.split(",").map(s => s.trim().toUpperCase()).filter(Boolean)
//       : [];

//     const isEngravingRaw = String(req.query.isEngraving || "").trim().toLowerCase();
//     const isEngraving = category === "RINGS" && ["true", "1", "yes"].includes(isEngravingRaw);

//     // Ring type filters
//     const ringRaw = String(req.query.ringType || req.query.ring || "").trim();
//     const ringTokens = ringRaw ? ringRaw.split(",").map(s => s.trim()) : [];

//     const mapRingTypeToPrefixes = (token: string): string[] => {
//       const t = token.trim().toLowerCase().replace(/[-_\s]+/g, "");
//       if (["engagement", "eng", "engring", "engagementring", "engagement-ring"].includes(t))
//         return ["ENG"];
//       if (["solitaire", "sol", "sr", "solitairering", "solitaire-ring"].includes(t))
//         return ["SR"];
//       if (["fashion", "fash", "fr", "fashionring", "fashion-ring"].includes(t))
//         return ["FR"];
//       if (["men", "mens", "gr", "menring", "men-ring"].includes(t))
//         return ["GR"];
//       if (/^(eng|sr|fr|gr)$/i.test(t)) return [t.toUpperCase()];
//       return [];
//     };

//     const ringPrefixes = Array.from(
//       new Set(ringTokens.flatMap(mapRingTypeToPrefixes))
//     );

//     // Category filters
//     const parseCatParam = (v: any) =>
//       v
//         ? String(v).split(",").map((s: string) => s.trim()).filter(Boolean).map((x: string) => x.toUpperCase())
//         : [];

//     const cat1Filters = parseCatParam(req.query.category1);
//     const cat2Filters = parseCatParam(req.query.category2);
//     const cat3Filters = parseCatParam(req.query.category3);

//     const VariantModel = getCollectionModel("variants");
//     const ProductModel = getCollectionModel("products");

//     let eligibleModelSkus: string[] | null = null;

//     /**
//      * ENGRAVING FILTER - Get eligible modelSkus from products collection
//      */
//     if (isEngraving) {
//       const productMatch: any = { category };
//       productMatch["engraving"] = { $type: "object", $ne: null };

//       const engravingProducts = await ProductModel.find(productMatch, { modelSku: 1 }).lean().exec();
//       eligibleModelSkus = engravingProducts.map((p: any) => p.modelSku).filter(Boolean);

//       if (eligibleModelSkus.length === 0) {
//         // No products with engraving found
//         return res.status(200).json({
//           success: true,
//           count: 0,
//           total: await ProductModel.countDocuments({ category }),
//           totalFiltered: 0,
//           pagination: {
//             totalPages: 0,
//             currentPage: page,
//             limit,
//           },
//           appliedFilters: {
//             category,
//             centerStoneShape: shapes.length > 0 ? shapes : null,
//             ringTypeRequested: ringTokens.length > 0 ? ringTokens : null,
//             ringPrefixesApplied: ringPrefixes.length > 0 ? ringPrefixes : null,
//             category1: cat1Filters.length > 0 ? cat1Filters : null,
//             category2: cat2Filters.length > 0 ? cat2Filters : null,
//             category3: cat3Filters.length > 0 ? cat3Filters : null,
//             metalTypes: metalTypes.length > 0 ? metalTypes : null,
//             isEngraving: true,
//             minPrice: !Number.isNaN(minPrice) ? minPrice : null,
//             maxPrice: !Number.isNaN(maxPrice) ? maxPrice : null,
//           },
//           products: [],
//         });
//       }
//     }

//     /**
//      * BUILD VARIANT MATCH
//      */
//     const variantMatch: any = { category };

//     // If engraving filter is active, restrict to eligible modelSkus
//     if (eligibleModelSkus !== null) {
//       variantMatch.modelSku = { $in: eligibleModelSkus };
//     }

//     // Metal type filter
//     if (metalTypes.length > 0) {
//       if (variantMatch.modelSku && variantMatch.modelSku.$in) {
//         // Already have $in for modelSku from engraving, add metal filter separately
//         variantMatch["meta.metalType"] = { $in: metalTypes };
//       } else {
//         variantMatch["meta.metalType"] = { $in: metalTypes };
//       }
//     }

//     // Shape filter
//     if (shapes.length > 0) {
//       variantMatch.$or = [
//         { "meta.stones.centerStoneShape": { $in: shapes } },
//         { "meta.stones.diamondGemstoneShape": { $in: shapes } },
//         { "meta.stones.diamondGemstoneShapes": { $in: shapes } },
//         { "meta.stones.sequences.centerStoneShape": { $in: shapes } },
//         { "meta.stones.sequences.diamondGemstoneShape": { $in: shapes } },
//         { "meta.stones.sequences.diamondGemstoneShapes": { $in: shapes } },
//       ];
//     }

//     // Ring type (SKU prefix) filter
//     if (ringPrefixes.length > 0) {
//       const prefixRegexes = ringPrefixes.map(prefix => new RegExp(`^${prefix}`, "i"));
//       if (variantMatch.modelSku && variantMatch.modelSku.$in) {
//         // Need to combine: modelSku must be in eligibleModelSkus AND match prefix
//         // This requires filtering eligibleModelSkus by prefix
//         const filteredSkus = eligibleModelSkus!.filter(sku =>
//           prefixRegexes.some(regex => regex.test(sku))
//         );
//         variantMatch.modelSku = { $in: filteredSkus };
//       } else {
//         variantMatch.modelSku = { $in: prefixRegexes };
//       }
//     }

//     /**
//      * AGGREGATION PIPELINE
//      */
//     const pipeline: any[] = [
//       { $match: variantMatch },

//       // Group by modelSku - keep FULL variant document
//       {
//         $group: {
//           _id: "$modelSku",
//           firstVariant: { $first: "$$ROOT" },
//         },
//       },

//       // Lookup product
//       {
//         $lookup: {
//           from: "products",
//           localField: "_id",
//           foreignField: "modelSku",
//           as: "product",
//         },
//       },
//       { $unwind: { path: "$product", preserveNullAndEmptyArrays: false } },
//     ];

//     // Apply product-level category filters
//     if (cat1Filters.length > 0) {
//       pipeline.push({
//         $match: {
//           $or: cat1Filters.map(v => ({
//             "product.attributes.category1": { $regex: v, $options: "i" },
//           })),
//         },
//       });
//     }

//     if (cat2Filters.length > 0) {
//       pipeline.push({
//         $match: {
//           $or: cat2Filters.map(v => ({
//             "product.attributes.category2": { $regex: v, $options: "i" },
//           })),
//         },
//       });
//     }

//     if (cat3Filters.length > 0) {
//       pipeline.push({
//         $match: {
//           $or: cat3Filters.map(v => ({
//             "product.attributes.category3": { $regex: v, $options: "i" },
//           })),
//         },
//       });
//     }

//     pipeline.push({ $sort: { "_id": 1 } });

//     const allResults = await VariantModel.aggregate(pipeline)
//       .allowDiskUse(true)
//       .exec();

//     /**
//      * PRICING CALCULATION (SAME AS OLD CONTROLLER)
//      */
//     const conn = getCatalogConnection();
//     const finalPricingColl = conn.collection("final_pricing");
//     const defaultsColl = conn.collection("defaultValues");

//     const defaultDocs = await defaultsColl.find({}).toArray();
//     const mergedDefaults = Object.assign(
//       {},
//       ...defaultDocs.map(d => {
//         const c = { ...d };
//         delete (c as any)._id;
//         return c;
//       })
//     );

//     const toNumberRobust = (v: unknown): number => {
//       if (v == null) return NaN;
//       if (typeof v === "number") return Number.isFinite(v) ? v : NaN;
//       if (typeof v === "string") {
//         const cleaned = v.replace(/[₹$,£€\s]/g, "").replace(/,/g, "");
//         const n = Number(cleaned);
//         if (!Number.isNaN(n) && Number.isFinite(n)) return n;
//         const m = cleaned.match(/-?\d+(\.\d+)?/);
//         if (m) {
//           const nf = Number(m[0]);
//           return Number.isFinite(nf) ? nf : NaN;
//         }
//         return NaN;
//       }
//       try {
//         const s = (v as any).toString?.();
//         const n = Number(s);
//         return Number.isFinite(n) ? n : NaN;
//       } catch {
//         return NaN;
//       }
//     };

//     const normalizeKey = (k: string) =>
//       k.toString().trim().toLowerCase().replace(/[^a-z0-9]/g, "");

//     const findNumericDefault = (
//       obj: Record<string, any>,
//       candidateNames: string[]
//     ): { value: number; matchedKey?: string } => {
//       if (!obj || typeof obj !== "object") return { value: NaN };
//       const candNorm = candidateNames.map((c) => normalizeKey(c));

//       for (const [k, v] of Object.entries(obj)) {
//         const kn = normalizeKey(k);
//         if (candNorm.includes(kn)) {
//           const val = toNumberRobust(v);
//           if (!Number.isNaN(val)) return { value: val, matchedKey: k };
//         }
//       }

//       for (const [k, v] of Object.entries(obj)) {
//         const kn = normalizeKey(k);
//         for (const cn of candNorm) {
//           if (kn.includes(cn) || cn.includes(kn)) {
//             const val = toNumberRobust(v);
//             if (!Number.isNaN(val)) return { value: val, matchedKey: k };
//           }
//         }
//       }

//       for (const [k, v] of Object.entries(obj)) {
//         if (v && typeof v === "object" && !Array.isArray(v)) {
//           for (const [k2, v2] of Object.entries(v as Record<string, any>)) {
//             const kn2 = normalizeKey(k2);
//             if (candNorm.includes(kn2)) {
//               const val = toNumberRobust(v2);
//               if (!Number.isNaN(val))
//                 return { value: val, matchedKey: `${k}.${k2}` };
//             }
//             for (const cn of candNorm) {
//               if (kn2.includes(cn) || cn.includes(kn2)) {
//                 const val = toNumberRobust(v2);
//                 if (!Number.isNaN(val))
//                   return { value: val, matchedKey: `${k}.${k2}` };
//               }
//             }
//           }
//         }
//       }

//       return { value: NaN };
//     };

//     const goldRes = findNumericDefault(mergedDefaults, [
//       "goldValue24PerGram",
//       "goldValue24",
//       "goldPerGram",
//       "gold24",
//       "goldvalue24pergram",
//     ]);
//     const platinumRes = findNumericDefault(mergedDefaults, [
//       "platinumPricePerGram",
//       "platinumPricePerGrm",
//       "platinumPerGram",
//       "ptPricePerGram",
//     ]);
//     const silverRes = findNumericDefault(mergedDefaults, [
//       "silverPricePerGram",
//       "silverPerGram",
//       "silverPrice",
//       "svPricePerGram",
//     ]);
//     const titaniumRes = findNumericDefault(mergedDefaults, [
//       "titaniumPricePerGram",
//       "titaniumPerGram",
//       "titaniumPrice",
//     ]);

//     const goldValue24 = goldRes.value;
//     const silverPricePerGram = silverRes.value;
//     const platinumPricePerGram = platinumRes.value;
//     const titaniumPricePerGram = titaniumRes.value;

//     const products: any[] = [];

//     for (const row of allResults) {
//       const variant = row.firstVariant;
//       const product = row.product;

//       // Get image
//       let imageUrl: string | null = null;
//       if (Array.isArray(variant.images) && variant.images.length > 0) {
//         const img = variant.images[1];
//         imageUrl = img?.url || img?.filename || null;
//       }

//       // Get engraving from PRODUCT (not variant)
//       const engravingObj = product.engraving ?? null;
//       const engravingMaxChars =
//         engravingObj && typeof engravingObj.maxCharacters === "number"
//           ? engravingObj.maxCharacters
//           : null;
//       const engravingFontSize =
//         engravingObj && engravingObj.fontSize != null ? engravingObj.fontSize : null;

//       // Get metal types from PRODUCT attributes
//       const productMetalTypes = Array.isArray(product.attributes?.metalTypes)
//         ? product.attributes.metalTypes
//         : product.attributes?.metalTypes
//           ? [product.attributes.metalTypes]
//           : [];

//       const baseOut: any = {
//         _id: product._id,
//         modelSku: product.modelSku,
//         metalTypes: productMetalTypes,
//         title: variant.meta?.title || product.seo?.metaTitle || product.title || null,
//         variantCount: Array.isArray(product.variantIds) ? product.variantIds.length : 0,
//         firstVariantSku: variant.sku,
//         firstVariantImageUrl: imageUrl,
//         attributesCategory1: product.attributes?.category1 ?? null,
//         attributesCategory2: product.attributes?.category2 ?? null,
//         attributesCategory3: product.attributes?.category3 ?? null,
//         engravingMaxCharacters: category === "RINGS" ? engravingMaxChars : null,
//         engravingFontSize: category === "RINGS" ? engravingFontSize : null,
//         sellingPrice: null,
//         priceIncomplete: true,
//       };

//       // Calculate price
//       try {
//         const stonesArr: any[] = Array.isArray(variant.meta?.stones) && variant.meta.stones.length
//           ? variant.meta.stones
//           : Array.isArray(variant.stones)
//             ? variant.stones
//             : [];

//         const includedStones: {
//           sequence: string;
//           cts: number;
//           netWeightGrams: number | null;
//         }[] = [];

//         for (let i = 0; i < stonesArr.length; i++) {
//           const st = stonesArr[i];
//           const seq =
//             st?.sequence ||
//             (Array.isArray(st?.sequences) && st.sequences[0]?.sequence) ||
//             st?.sequenceNo;
//           if (!seq) continue;

//           const cts =
//             typeof st?.cts === "number"
//               ? st.cts
//               : Array.isArray(st?.sequences) && typeof st.sequences[0]?.cts === "number"
//                 ? st.sequences[0].cts
//                 : null;
//           if (cts == null) continue;

//           const net = st?.netWeightGrams != null ? n(st.netWeightGrams) : null;
//           if (i > 0 && net !== null) break;

//           includedStones.push({ sequence: seq, cts, netWeightGrams: net });
//         }

//         let diamondCost = 0;
//         let diamondIncomplete = false;

//         for (const st of includedStones) {
//           const pricingDoc: any =
//             (await finalPricingColl.findOne({ sequence: st.sequence })) || {};
//           const pricePerCt = parseNumeric(
//             pricingDoc.selling_price ?? pricingDoc.sellingPrice ?? pricingDoc.price
//           );
//           if (Number.isNaN(pricePerCt)) {
//             diamondIncomplete = true;
//             continue;
//           }
//           diamondCost += pricePerCt * st.cts;
//         }

//         const metalType = (
//           variant?.meta?.metalType ||
//           (Array.isArray(productMetalTypes) ? productMetalTypes[0] : productMetalTypes) ||
//           "GOLD"
//         ).toString().toUpperCase();

//         let karatStr =
//           variant?.meta?.metalKt ||
//           (Array.isArray(product.attributes?.goldKarats)
//             ? product.attributes.goldKarats[0]
//             : product.attributes?.goldKarats) ||
//           "18";
//         const karatNum = Number(String(karatStr).match(/\d+/)?.[0] || 18);

//         let metalWeightGrams: number | null =
//           variant?.meta?.metalWeightGrams != null
//             ? n(variant.meta.metalWeightGrams)
//             : variant?.netWeightGrams != null
//               ? n(variant.netWeightGrams)
//               : null;

//         if (
//           (metalWeightGrams == null || Number.isNaN(metalWeightGrams)) &&
//           includedStones.length
//         ) {
//           const sum = includedStones.reduce(
//             (acc, s) => acc + (s.netWeightGrams ? Number(s.netWeightGrams) : 0),
//             0
//           );
//           metalWeightGrams = sum > 0 ? sum : null;
//         }

//         let metalPricePerGram = NaN;
//         if (metalType === "GOLD" && !Number.isNaN(goldValue24)) {
//           const factor = KARAT_FACTOR[String(karatNum)] ?? KARAT_FACTOR["18"];
//           metalPricePerGram = goldValue24 * factor;
//         } else if (metalType === "SILVER") metalPricePerGram = silverPricePerGram;
//         else if (metalType === "PLATINUM") metalPricePerGram = platinumPricePerGram;
//         else if (metalType === "TITANIUM") metalPricePerGram = titaniumPricePerGram;

//         let metalCost = 0,
//           labourCost = 0,
//           metalIncomplete = false;

//         if (metalWeightGrams && !Number.isNaN(metalPricePerGram)) {
//           metalCost = metalPricePerGram * metalWeightGrams;
//           labourCost = LABOUR_RATE[metalType] ?? LABOUR_RATE.GOLD;
//         } else metalIncomplete = true;

//         const sellingPrice = metalCost + diamondCost + labourCost;
//         baseOut.sellingPrice =
//           !Number.isNaN(sellingPrice) && sellingPrice > 0
//             ? Math.round(sellingPrice)
//             : null;
//         baseOut.priceIncomplete = metalIncomplete || diamondIncomplete;
//       } catch (err) {
//         baseOut.sellingPrice = null;
//         baseOut.priceIncomplete = true;
//       }

//       // Price filter
//       if (!Number.isNaN(minPrice) && (baseOut.sellingPrice === null || baseOut.sellingPrice < minPrice))
//         continue;
//       if (!Number.isNaN(maxPrice) && (baseOut.sellingPrice === null || baseOut.sellingPrice > maxPrice))
//         continue;

//       products.push(baseOut);
//     }

//     // Pagination
//     const totalFiltered = products.length;
//     const paged = products.slice(skip, skip + limit);

//     const totalProducts = await ProductModel.countDocuments({ category });

//     return res.status(200).json({
//       success: true,
//       count: paged.length,
//       total: totalProducts,
//       totalFiltered,
//       pagination: {
//         totalPages: Math.ceil(totalFiltered / limit),
//         currentPage: page,
//         limit,
//       },
//       appliedFilters: {
//         category,
//         centerStoneShape: shapes.length > 0 ? shapes : null,
//         ringTypeRequested: ringTokens.length > 0 ? ringTokens : null,
//         ringPrefixesApplied: ringPrefixes.length > 0 ? ringPrefixes : null,
//         category1: cat1Filters.length > 0 ? cat1Filters : null,
//         category2: cat2Filters.length > 0 ? cat2Filters : null,
//         category3: cat3Filters.length > 0 ? cat3Filters : null,
//         metalTypes: metalTypes.length > 0 ? metalTypes : null,
//         isEngraving: category === "RINGS" ? isEngraving : null,
//         minPrice: !Number.isNaN(minPrice) ? minPrice : null,
//         maxPrice: !Number.isNaN(maxPrice) ? maxPrice : null,
//       },
//       products: paged,
//     });
//   } catch (err) {
//     console.error("getProductsByCategory error:", err);
//     return res.status(500).json({
//       success: false,
//       message: "Server error",
//       error: err instanceof Error ? err.message : String(err),
//     });
//   }
// };



// export const getProductByModelSku = async (
//   req: Request,
//   res: Response
// ): Promise<Response> => {
//   try {
//     // ----------------- Local types (scoped to this controller) -----------------
//     type DefaultValuesDoc = Record<string, any>;

//     interface PricingDoc {
//       sequence: string;
//       selling_price?: number;
//       sellingPrice?: number;
//       price?: number;
//       [key: string]: any;
//     }

//     interface StoneSeq {
//       sequence?: string;
//       cts?: number;
//       pts?: number;
//       pcs?: number;
//       [key: string]: any;
//     }

//     interface Stone {
//       netWeightGrams?: number | null;
//       sequences?: StoneSeq[];
//       cts?: number;
//       sequence?: string;
//       [key: string]: any;
//     }

//     interface VariantDoc {
//       _id?: any;
//       sku?: string;
//       meta?: {
//         stones?: Stone[];
//         metalWeightGrams?: number | string | null;
//         netWeightGrams?: number | string | null;
//         metalType?: string | null;
//         metalKt?: string | number | null;
//         engraving?: any;
//         [key: string]: any;
//       };
//       stones?: Stone[];
//       metalType?: string | null;
//       metalKt?: string | number | null;
//       netWeightGrams?: number | string | null;
//       images?: any[];
//       engraving?: any;
//       [key: string]: any;
//     }

//     interface ProductDoc {
//       modelSku?: string;
//       seo?: { title?: string };
//       title?: string;
//       description?: string;
//       attributes?: {
//         metalTypes?: string[] | string;
//         goldKarats?: string[] | string;
//         centerStoneShape?: string | string[];
//         centerStoneSize?: string | string[];
//         diamondColorClarity?: string[] | string;
//         diamondShapes?: string[] | string;
//         diamondSizes?: string[] | string;
//         [key: string]: any;
//       };
//       engravingDetailIds?: any[]; // keep legacy field name if present
//       engraving?: any; // object-based engraving storage (your screenshots)
//       variantIds?: string[];
//       [key: string]: any;
//     }

//     interface PriceBreakdown {
//       metalCost: number | null;
//       diamondCost: number | null;
//       labourCost: number | null;
//       expense?: number | null;
//       gstPercent?: number | null;
//       gstAmount?: number | null;
//       totalBeforeGst?: number | null;
//       totalWithGst?: number | null;
//       missingDefaults?: string[];
//       error?: string;
//     }

//     // ----------------- Helpers scoped to this controller -----------------
//     const toNumberRobust = (v: unknown): number => {
//       if (v == null) return NaN;
//       if (typeof v === "number") return Number.isFinite(v) ? v : NaN;
//       if (typeof v === "string") {
//         const cleaned = v.replace(/[₹$,£€\s]/g, "").replace(/,/g, "");
//         const n = Number(cleaned);
//         if (!Number.isNaN(n) && Number.isFinite(n)) return n;
//         const m = cleaned.match(/-?\d+(\.\d+)?/);
//         if (m) {
//           const nf = Number(m[0]);
//           return Number.isFinite(nf) ? nf : NaN;
//         }
//         return NaN;
//       }
//       try {
//         const s = (v as any).toString?.();
//         const n = Number(s);
//         return Number.isFinite(n) ? n : NaN;
//       } catch {
//         return NaN;
//       }
//     };

//     const normalizeKey = (k: string) =>
//       k
//         .toString()
//         .trim()
//         .toLowerCase()
//         .replace(/[^a-z0-9]/g, "");

//     const findNumericDefault = (
//       obj: Record<string, any>,
//       candidateNames: string[]
//     ): { value: number; matchedKey?: string } => {
//       if (!obj || typeof obj !== "object") return { value: NaN };

//       const candNorm = candidateNames.map((c) => normalizeKey(c));

//       // 1) exact-normalized match
//       for (const [k, v] of Object.entries(obj)) {
//         const kn = normalizeKey(k);
//         if (candNorm.includes(kn)) {
//           const val = toNumberRobust(v);
//           if (!Number.isNaN(val)) return { value: val, matchedKey: k };
//         }
//       }

//       // 2) substring-normalized match
//       for (const [k, v] of Object.entries(obj)) {
//         const kn = normalizeKey(k);
//         for (const cn of candNorm) {
//           if (kn.includes(cn) || cn.includes(kn)) {
//             const val = toNumberRobust(v);
//             if (!Number.isNaN(val)) return { value: val, matchedKey: k };
//           }
//         }
//       }

//       // 3) one-level nested objects
//       for (const [k, v] of Object.entries(obj)) {
//         if (v && typeof v === "object" && !Array.isArray(v)) {
//           for (const [k2, v2] of Object.entries(v as Record<string, any>)) {
//             const kn2 = normalizeKey(k2);
//             if (candNorm.includes(kn2)) {
//               const val = toNumberRobust(v2);
//               if (!Number.isNaN(val))
//                 return { value: val, matchedKey: `${k}.${k2}` };
//             }
//             for (const cn of candNorm) {
//               if (kn2.includes(cn) || cn.includes(kn2)) {
//                 const val = toNumberRobust(v2);
//                 if (!Number.isNaN(val))
//                   return { value: val, matchedKey: `${k}.${k2}` };
//               }
//             }
//           }
//         }
//       }

//       return { value: NaN };
//     };

//     const normalize = (v: any) =>
//       v == null ? null : typeof v === "string" ? v.trim() : String(v).trim();

//     // ----------------- Request validation -----------------
//     const rawSku = (req.params.modelSku ?? "").toString().trim();
//     if (!rawSku)
//       return res
//         .status(400)
//         .json({ success: false, message: "modelSku required" });
//     const modelSku = rawSku.toUpperCase();

//     console.info(
//       `[getProductByModelSku] entry modelSku=${modelSku} query=${JSON.stringify(
//         req.query
//       )}`
//     );

//     // ----------------- Load product -----------------
//     const ProductModel = getCollectionModel("products");
//     const product = (await ProductModel.findOne({
//       modelSku,
//     }).lean()) as ProductDoc | null;
//     if (!product) {
//       console.warn(
//         `[getProductByModelSku] product not found modelSku=${modelSku}`
//       );
//       return res
//         .status(404)
//         .json({ success: false, message: `Model ${modelSku} not found` });
//     }
//     console.debug(
//       `[getProductByModelSku] product loaded id=${(product as any)?._id ?? "unknown"
//       }`
//     );

//     // ----------------- Basic metadata -----------------

//     const attributes = product?.attributes ?? {};

//     const metalTypes: string[] = Array.isArray(attributes?.metalTypes)
//       ? attributes.metalTypes.map(String)
//       : attributes?.metalTypes
//         ? [String(attributes.metalTypes)]
//         : [];

//     const goldKarats: string[] = Array.isArray(attributes?.goldKarats)
//       ? attributes.goldKarats.map(String)
//       : attributes?.goldKarats
//         ? [String(attributes.goldKarats)]
//         : [];

//     let diamondShape: string[] = Array.isArray(attributes?.centerStoneShape)
//   ? attributes.centerStoneShape.map(String)
//   : attributes?.centerStoneShape
//     ? [String(attributes.centerStoneShape)]
//     : Array.isArray(attributes?.diamondShapes)
//       ? attributes.diamondShapes.map(String)
//       : [];


//     let diamondSize: string[] = Array.isArray(attributes?.centerStoneSize)
//       ? attributes.centerStoneSize.map(String)
//       : Array.isArray(attributes?.diamondSizes)
//         ? attributes.diamondSizes.map(String)
//         : [];

//     const conn = getCatalogConnection();

//     // =================================================================
//     // ===================== ADDED: METAL OPTIONS ======================
//     // =================================================================
//     const metalOptions: Record<string, string[]> = {};
//     metalTypes.forEach((m) => (metalOptions[m] = []));

//     const metalColorDocs = await conn
//       .collection("metalcolorsupports")
//       .find({
//         metalType: { $in: metalTypes },
//         isSupported: true,
//       })
//       .toArray();

//     for (const doc of metalColorDocs) {
//       const metal = String(doc.metalType).toUpperCase();
//       const color = String(doc.metalColor).toUpperCase();
//       if (!metalOptions[metal]) metalOptions[metal] = [];
//       metalOptions[metal].push(color);
//     }

//     for (const m of Object.keys(metalOptions)) {
//       metalOptions[m] = Array.from(new Set(metalOptions[m]));
//     }

//     // =================================================================
//     // ===================== ADDED: DIAMOND OPTIONS ====================
//     // =================================================================
//     const diamondOptions: Record<string, Record<string, string[]>> = {};

//     const diamondDocs = await conn
//       .collection("diamondqualitysupports")
//       .find({ isSupported: true })
//       .toArray();

//     for (const doc of diamondDocs) {
//       const dType = String(doc.diamondType).toUpperCase(); // LAB / NATURAL
//       const metal = String(doc.metalType).toUpperCase();
//       const quality = String(doc.quality).toUpperCase();

//       if (!diamondOptions[dType]) diamondOptions[dType] = {};
//       if (!diamondOptions[dType][metal]) diamondOptions[dType][metal] = [];

//       diamondOptions[dType][metal].push(quality);
//     }

//     for (const dType of Object.keys(diamondOptions)) {
//       for (const metal of Object.keys(diamondOptions[dType])) {
//         diamondOptions[dType][metal] = Array.from(
//           new Set(diamondOptions[dType][metal])
//         );
//       }
//     }

//     // ----------------- diamondColorClarity (STRICT: only after LG or ND) -----------------
//     let diamondColorClarity: string[] = [];
//     const variantIdsArr: string[] = Array.isArray(product?.variantIds)
//       ? (product.variantIds as any[]).filter((v) => typeof v === "string")
//       : [];

//     if (variantIdsArr.length) {
//       const collected: string[] = [];
//       const prefixRegex = /(?:LG|ND)([A-Z]{2,10})/gi; // captures letters after LG/ND in same token
//       for (const rawSku of variantIdsArr) {
//         if (!rawSku || typeof rawSku !== "string") continue;
//         const upSku = rawSku.toUpperCase();

//         // 1) capture inline occurrences like ...LGEFVVS... or ...NDGHVS...
//         let m: RegExpExecArray | null;
//         prefixRegex.lastIndex = 0;
//         while ((m = prefixRegex.exec(upSku)) !== null) {
//           if (m[1]) collected.push(m[1].toUpperCase());
//         }

//         // 2) capture cases where LG or ND is a standalone SKU part and clarity is next part:
//         const parts = upSku.split(/[-_\/\.]/).map((p) => (p || "").trim());
//         for (let i = 0; i < parts.length; i++) {
//           const p = parts[i];
//           if (p === "LG" || p === "ND") {
//             const next = parts[i + 1] ?? "";
//             const lead = (next.match(/^([A-Z]{2,10})/) || [])[1];
//             if (lead) collected.push(lead.toUpperCase());
//           } else {
//             // also handle tokens that are exactly "LGXXXX" or "NDXXXX" but maybe separated oddly;
//             // already covered by prefixRegex above, so no-op here.
//           }
//         }
//       }

//       // dedupe & sanitize
//       const seen = new Set<string>();
//       const uniq: string[] = [];
//       for (const t of collected) {
//         const tok = String(t || "")
//           .toUpperCase()
//           .trim();
//         if (!tok) continue;
//         // sanity: only letters, length 2..10
//         if (!/^[A-Z]{2,10}$/.test(tok)) continue;
//         if (!seen.has(tok)) {
//           seen.add(tok);
//           uniq.push(tok);
//         }
//       }
//       diamondColorClarity = uniq;
//     }

//     // ----------------- ENGRAVING: maintain legacy behavior AND return object fields ----------
//     // Legacy: keep engravingDetailIds array available as `engraving` for compatibility
//     const engravingIds = Array.isArray(product?.engravingDetailIds)
//       ? product.engravingDetailIds
//       : [];

//     // New/actual model (from your screenshots): engraving object on product
//     const productEngravingObj =
//       product &&
//         typeof product.engraving === "object" &&
//         product.engraving !== null
//         ? product.engraving
//         : null;

//     // ----------------- Variant metadata (will be used later) -----------------
//     const engravingPlaceholderFromVariant = null; // defined later after variant fetch if needed

//     const isEngravingFromLegacyArray = engravingIds.length > 0;

//     // We'll compute final isEngraving and engravingInfo after variant fetch so variant fields can override product ones.

//     const variantCount = Array.isArray(product?.variantIds)
//       ? product.variantIds.length
//       : 0;
//     const firstVariantSku =
//       variantCount > 0 ? (product.variantIds as any[])[0] : null;
//     const variantIdParam = (req.query.variantId ?? "").toString().trim();

//     // ----------------- Pricing setup (merge multi-doc defaults) -----------------
//     // const conn = getCatalogConnection();
//     const finalPricingColl = conn.collection("final_pricing");
//     const defaultsColl = conn.collection("defaultValues");

//     const defaultDocs = (await defaultsColl
//       .find({})
//       .toArray()) as DefaultValuesDoc[];
//     const mergedDefaults: DefaultValuesDoc = Object.assign(
//       {},
//       ...defaultDocs.map((doc) => {
//         const copy = { ...doc };
//         delete (copy as any)._id;
//         return copy;
//       })
//     );

//     console.debug(
//       "[getProductByModelSku] mergedDefaults keys:",
//       Object.keys(mergedDefaults)
//     );
//     // Candidate/resolution for base metal prices
//     const goldRes = findNumericDefault(mergedDefaults, [
//       "goldValue24PerGram",
//       "goldValue24",
//       "goldPerGram",
//       "gold24",
//       "goldvalue24pergram",
//     ]);
//     const platinumRes = findNumericDefault(mergedDefaults, [
//       "platinumPricePerGram",
//       "platinumPricePerGrm",
//       "platinumPerGram",
//       "ptPricePerGram",
//     ]);
//     const silverRes = findNumericDefault(mergedDefaults, [
//       "silverPricePerGram",
//       "silverPerGram",
//       "silverPrice",
//       "svPricePerGram",
//     ]);
//     const titaniumRes = findNumericDefault(mergedDefaults, [
//       "titaniumPricePerGram",
//       "titaniumPerGram",
//       "titaniumPrice",
//     ]);

//     const goldValue24 = goldRes.value;
//     const platinumPricePerGram = platinumRes.value;
//     const silverPricePerGram = silverRes.value;
//     const titaniumPricePerGram = titaniumRes.value;

//     // Candidate/resolution for labour, expense and gst values (new)
//     const labourGoldRes = findNumericDefault(mergedDefaults, [
//       "labourCostGold",
//       "labourGold",
//       "labourCost_Gold",
//       "labourcostgold",
//     ]);
//     const labourPlatinumRes = findNumericDefault(mergedDefaults, [
//       "labourCostPlatinum",
//       "labourPlatinum",
//       "labourCost_PT",
//       "labourcostplatinum",
//     ]);
//     const labourSilverRes = findNumericDefault(mergedDefaults, [
//       "labourCostSilver",
//       "labourSilver",
//       "labour_cost_silver",
//       "labourcostsilver",
//     ]);
//     const labourTitaniumRes = findNumericDefault(mergedDefaults, [
//       "labourCostTitanium",
//       "labourTitanium",
//       "labour_cost_titanium",
//       "labourcosttitanium",
//     ]);

//     const expenseGoldRes = findNumericDefault(mergedDefaults, [
//       "goldExpense",
//       "expenseGold",
//       "gold_expense",
//       "goldexpense",
//     ]);
//     const expensePlatinumRes = findNumericDefault(mergedDefaults, [
//       "platinumExpense",
//       "expensePlatinum",
//       "platinum_expense",
//       "platinumexpense",
//     ]);
//     const expenseSilverRes = findNumericDefault(mergedDefaults, [
//       "silverExpense",
//       "expenseSilver",
//       "silver_expense",
//       "silverexpense",
//     ]);
//     const expenseTitaniumRes = findNumericDefault(mergedDefaults, [
//       "titaniumExpense",
//       "expenseTitanium",
//       "titanium_expense",
//       "titaniumexpense",
//     ]);

//     const gstRes = findNumericDefault(mergedDefaults, [
//       "gstValue",
//       "gstPercent",
//       "gst",
//       "gstvalue",
//     ]);

//     const labourDefaults = {
//       GOLD: labourGoldRes.value,
//       PLATINUM: labourPlatinumRes.value,
//       SILVER: labourSilverRes.value,
//       TITANIUM: labourTitaniumRes.value,
//     };

//     const expenseDefaults = {
//       GOLD: expenseGoldRes.value,
//       PLATINUM: expensePlatinumRes.value,
//       SILVER: expenseSilverRes.value,
//       TITANIUM: expenseTitaniumRes.value,
//     };

//     const gstPercentDefault = gstRes.value; // may be NaN -> treat as 0%

//     const missingDefaults: string[] = [];
//     if (Number.isNaN(goldValue24)) missingDefaults.push("goldValue24");
//     if (Number.isNaN(platinumPricePerGram))
//       missingDefaults.push("platinumPricePerGram");
//     if (Number.isNaN(silverPricePerGram))
//       missingDefaults.push("silverPricePerGram");
//     if (Number.isNaN(titaniumPricePerGram))
//       missingDefaults.push("titaniumPricePerGram");

//     // don't strictly require labour/expense/gst in missingDefaults but log unresolved keys
//     if (Number.isNaN(labourDefaults.GOLD))
//       console.debug(
//         "[getProductByModelSku] labourDefaults GOLD not found in defaults"
//       );
//     if (Number.isNaN(labourDefaults.PLATINUM))
//       console.debug(
//         "[getProductByModelSku] labourDefaults PLATINUM not found in defaults"
//       );
//     if (Number.isNaN(labourDefaults.SILVER))
//       console.debug(
//         "[getProductByModelSku] labourDefaults SILVER not found in defaults"
//       );
//     if (Number.isNaN(labourDefaults.TITANIUM))
//       console.debug(
//         "[getProductByModelSku] labourDefaults TITANIUM not found in defaults"
//       );

//     if (Number.isNaN(expenseDefaults.GOLD))
//       console.debug(
//         "[getProductByModelSku] expenseDefaults GOLD not found in defaults"
//       );
//     if (Number.isNaN(expenseDefaults.PLATINUM))
//       console.debug(
//         "[getProductByModelSku] expenseDefaults PLATINUM not found in defaults"
//       );
//     if (Number.isNaN(expenseDefaults.SILVER))
//       console.debug(
//         "[getProductByModelSku] expenseDefaults SILVER not found in defaults"
//       );
//     if (Number.isNaN(expenseDefaults.TITANIUM))
//       console.debug(
//         "[getProductByModelSku] expenseDefaults TITANIUM not found in defaults"
//       );

//     if (Number.isNaN(gstPercentDefault))
//       console.debug(
//         "[getProductByModelSku] gstPercent not found in defaults; defaulting to 0%"
//       );

//     if (missingDefaults.length) {
//       console.warn(
//         "[getProductByModelSku] pricing: missing/NaN defaultValues:",
//         {
//           missingDefaults,
//           mergedDefaultsKeys: Object.keys(mergedDefaults),
//         }
//       );
//     } else {
//       console.info("[getProductByModelSku] pricing: defaults detected ->", {
//         goldKey: goldRes.matchedKey ?? null,
//         goldValue24,
//         platinumKey: platinumRes.matchedKey ?? null,
//         platinumPricePerGram,
//         silverKey: silverRes.matchedKey ?? null,
//         silverPricePerGram,
//         titaniumKey: titaniumRes.matchedKey ?? null,
//         titaniumPricePerGram,
//       });
//     }

//     // ----------------- Variant fetch (sku or ObjectId) -----------------
//     let chosenVariantSku: string | null = null;
//     let firstVariantDoc: VariantDoc | null = null;


//     if (variantIdParam) {
//       firstVariantDoc = await conn
//         .collection("variants")
//         .findOne({ sku: variantIdParam });

//       if (firstVariantDoc) {
//         chosenVariantSku =
//           firstVariantDoc.sku ??
//           (firstVariantDoc._id ? String(firstVariantDoc._id) : null);
//       } else {
//         // 👇 THIS is the fix
//         return res.status(200).json({
//           success: true,
//           data:"Variant not found for the provided variantId",
//         });
//       }
//     }

//     // Only fallback when variantId is NOT provided
//     if (!firstVariantDoc && !variantIdParam && firstVariantSku) {
//       firstVariantDoc = await conn
//         .collection("variants")
//         .findOne({ sku: firstVariantSku });

//       chosenVariantSku = firstVariantDoc
//         ? firstVariantDoc.sku ?? firstVariantSku
//         : firstVariantSku;
//     }


//     console.debug(
//       "[getProductByModelSku] chosenVariantSku:",
//       chosenVariantSku,
//       "variant found:",
//       !!firstVariantDoc
//     );
//     let title =
//       firstVariantDoc?.meta?.title ??
//       product?.seo?.title ??
//       product?.title ??
//       null;

//     let description =
//       firstVariantDoc?.meta?.description ?? product?.description ?? null;

//     // ----------------- diamond shape/size fallback from variant stones -----------------
//     const extractFromVariantStones = (variant: VariantDoc | null) => {
//       const shapes: string[] = [];
//       const sizes: string[] = [];
//       if (!variant) return { shapes, sizes };

//       const stonesArr: Stone[] =
//         Array.isArray(variant?.meta?.stones) && variant.meta!.stones!.length
//           ? variant.meta!.stones!
//           : Array.isArray(variant?.stones) && variant.stones!.length
//             ? variant.stones!
//             : [];

//       for (const st of stonesArr) {
//         if (!st) continue;
//         const possibleShapeKeys = [
//           "centerStoneShape",
//           "diamondGemstoneShape",
//           "diamondGemstoneShapes",
//           "diamondShapes",
//         ];
//         for (const k of possibleShapeKeys) {
//           const v = (st as any)[k];
//           if (Array.isArray(v))
//             shapes.push(...(v.map(normalize).filter(Boolean) as string[]));
//           else if (v != null && String(v).trim() !== "")
//             shapes.push(normalize(v) as string);
//         }
//         if (
//           typeof st.cts === "number" ||
//           (!Number.isNaN(Number((st as any).cts)) && (st as any).cts != null)
//         ) {
//           sizes.push(String((st as any).cts));
//         } else {
//           const possibleSizeKeys = ["size", "carat", "cts", "ct", "carats"];
//           for (const k of possibleSizeKeys) {
//             const v = (st as any)[k];
//             if (v != null && String(v).trim() !== "") {
//               sizes.push(String(v).trim());
//               break;
//             }
//           }
//         }
//         if (Array.isArray(st.sequences)) {
//           for (const seq of st.sequences) {
//             for (const k of [
//               "centerStoneShape",
//               "diamondGemstoneShape",
//               "diamondGemstoneShapes",
//             ]) {
//               const v = (seq as any)[k];
//               if (Array.isArray(v))
//                 shapes.push(...(v.map(normalize).filter(Boolean) as string[]));
//               else if (v != null && String(v).trim() !== "")
//                 shapes.push(normalize(v) as string);
//             }
//             if (
//               typeof (seq as any).cts === "number" ||
//               (!Number.isNaN(Number((seq as any).cts)) &&
//                 (seq as any).cts != null)
//             ) {
//               sizes.push(String((seq as any).cts));
//             }
//           }
//         }
//       }
//       return {
//         shapes: Array.from(
//           new Set(shapes.map((s) => (s ? s.toUpperCase() : s)))
//         ).filter(Boolean) as string[],
//         sizes: Array.from(
//           new Set(sizes.map((s) => (s ? String(s) : s)))
//         ).filter(Boolean),
//       };
//     };

//     if (
//       !diamondShape ||
//       diamondShape.length === 0 ||
//       !diamondSize ||
//       diamondSize.length === 0
//     ) {
//       const fromVariant = extractFromVariantStones(firstVariantDoc);
//       if (
//         (!diamondShape || diamondShape.length === 0) &&
//         fromVariant.shapes.length
//       )
//         diamondShape = fromVariant.shapes;
//       if (
//         (!diamondSize || diamondSize.length === 0) &&
//         fromVariant.sizes.length
//       )
//         diamondSize = fromVariant.sizes;
//     }
//     diamondShape = Array.isArray(diamondShape) ? diamondShape : [];
//     diamondSize = Array.isArray(diamondSize) ? diamondSize : [];

//     // ----------------- IMAGE selection + availableColors -----------------
//     let variantImages: string[] = [];
//     let availableColors: string[] = [];

//     if (firstVariantDoc && Array.isArray(firstVariantDoc.images)) {
//       const allImgs = firstVariantDoc.images
//         .map((img: any) => img?.url ?? img?.filename ?? img)
//         .filter(Boolean)
//         .map(String);

//       const PRIMARY_METALS = ["WG", "YG", "RG", "BR", "3T"];

//       const OTHER_ALLOWED = [
//         "NBV",
//         "BV",
//         "SV",
//         "PV",
//         "GP",
//         "PG",
//         "2T",
//         "TV",
//         "45",
//         "FV",
//         "EV",
//         "BRD",
//       ];
//       const TOKEN_CANDIDATES = Array.from(
//         new Set([...PRIMARY_METALS, ...OTHER_ALLOWED])
//       );
//       const BARE_GENERIC = new Set([
//         "GP",
//         "360",
//         "NBV",
//         "BV",
//         "45",
//         "EV",
//         "TV",
//         "FV",
//         "SV",
//       ]);

//       const tokenRegex = (token: string) =>
//         new RegExp(`(?:^|[-_\\.\\/])${token}(?:$|[-_\\.\\/])`, "i");

//       const basenameNoExt = (url: string) => {
//         const name = url.split("/").pop() || "";
//         const dot = name.lastIndexOf(".");
//         return dot === -1 ? name : name.slice(0, dot);
//       };

//       const removeBareGeneric = (url: string) =>
//         BARE_GENERIC.has(basenameNoExt(url).toUpperCase());

//       const detectPrimariesInFilename = (url: string) =>
//         PRIMARY_METALS.filter((pm) => tokenRegex(pm).test(url)).map((x) =>
//           x.toUpperCase()
//         );

//       const extractOrderedMetalsFromFilename = (url: string): string[] => {
//         const name = url.split("/").pop()?.toUpperCase() || "";
//         const parts = name.split(/[-_.]/).filter(Boolean);

//         return parts.filter((p) =>
//           ["WG", "YG", "RG", "BR", "3T"].includes(p)
//         );
//       };

//       // NEW: compute availableColors from all images of this variant
//       const availableColorsSet = new Set<string>();

//       for (const url of allImgs) {
//         const metals = extractOrderedMetalsFromFilename(url);

//         // 3-tone (explicit)
//         if (metals.includes("3T")) {
//           availableColorsSet.add("3T");
//           continue;
//         }

//         // single metal
//         if (metals.length === 1) {
//           availableColorsSet.add(metals[0]);
//         }

//         // multi-tone (order preserved)
//         if (metals.length >= 2) {
//           for (let i = 0; i < metals.length - 1; i++) {
//             availableColorsSet.add(`${metals[i]}-${metals[i + 1]}`);
//           }
//         }
//       }

//       availableColors = Array.from(availableColorsSet);



//       const strictPrimaryOnlyMatches = (token: string) => {
//         if (!token) return [];
//         const re = tokenRegex(token);
//         return allImgs.filter((u) => {
//           if (removeBareGeneric(u)) return false;
//           if (!re.test(u)) return false;
//           const primariesFound = detectPrimariesInFilename(u);
//           return (
//             primariesFound.length === 1 &&
//             primariesFound[0] === token.toUpperCase()
//           );
//         });
//       };

//       const inclusivePrimaryMatches = (token: string) => {
//         if (!token) return [];
//         const re = tokenRegex(token);
//         return allImgs.filter((u) => !removeBareGeneric(u) && re.test(u));
//       };

//       const looseMatches = (token: string) => {
//         if (!token) return [];
//         const up = token.toUpperCase();
//         return allImgs.filter(
//           (u) => !removeBareGeneric(u) && u.toUpperCase().includes(up)
//         );
//       };

//       const prefiltered = allImgs.filter((u) => !removeBareGeneric(u));

//       const normalizeQueryToken = (raw: string | null) => {
//         if (!raw) return null;
//         const map: Record<string, string> = {
//           WHITE: "WG",
//           WHITEGOLD: "WG",
//           WG: "WG",
//           YELLOW: "YG",
//           YG: "YG",
//           YELLOWGOLD: "YG",
//           RG: "RG",
//           ROSEGOLD: "RG",
//           ROSE: "RG",
//           BR: "BR",
//           BLACK: "BR",
//           BLACKRHODIUM: "BR",
//           "BLACK-RHODIUM": "BR",
//           GP: "GP",
//           GOLDPLATED: "GP",
//           NBV: "NBV",
//           BV: "BV",
//           SV: "SV",
//           SILVER: "SV",
//           BRD: "BRD",
//         };
//         const k = raw.toString().trim().toUpperCase();
//         return map[k] ?? k;
//       };

//       const metalQueryRaw = (req.query.metal ?? req.query.metalColor ?? "")
//         .toString()
//         .trim()
//         .toUpperCase();
//       const requestedToken = normalizeQueryToken(metalQueryRaw);

//       if (requestedToken === "3T") {
//         variantImages = allImgs.filter((u) =>
//           /(?:^|[-_.\/])3T(?:$|[-_.\/])/i.test(u)
//         );
//       }

//       if (requestedToken) {
//         const rt = requestedToken.toUpperCase();
//         if (PRIMARY_METALS.includes(rt)) {
//           variantImages = strictPrimaryOnlyMatches(rt);
//           if (variantImages.length === 0)
//             variantImages = inclusivePrimaryMatches(rt);
//           if (variantImages.length === 0) variantImages = looseMatches(rt);
//         } else {
//           const re = tokenRegex(rt);
//           variantImages = prefiltered.filter((u) => re.test(u));
//           if (variantImages.length === 0)
//             variantImages = prefiltered.filter((u) =>
//               u.toUpperCase().includes(rt)
//             );
//         }
//       }

//       if ((!requestedToken || variantImages.length === 0) && chosenVariantSku) {
//         const parts = String(chosenVariantSku)
//           .split(/[-_]/)
//           .map((p) => p.trim().toUpperCase())
//           .filter(Boolean);
//         const primaryInSku = parts.find((p) => PRIMARY_METALS.includes(p));
//         if (primaryInSku) {
//           variantImages = strictPrimaryOnlyMatches(primaryInSku);
//           if (variantImages.length === 0)
//             variantImages = inclusivePrimaryMatches(primaryInSku);
//           if (variantImages.length === 0)
//             variantImages = looseMatches(primaryInSku);
//         } else {
//           const otherInSku = parts.find((p) => TOKEN_CANDIDATES.includes(p));
//           if (otherInSku) {
//             const re = tokenRegex(otherInSku);
//             variantImages = prefiltered.filter((u) => re.test(u));
//             if (variantImages.length === 0)
//               variantImages = prefiltered.filter((u) =>
//                 u.toUpperCase().includes(otherInSku)
//               );
//           }
//         }
//       }

//       if (!variantImages || variantImages.length === 0) {
//         variantImages = prefiltered.slice(0, 6);
//       }

//       variantImages = Array.from(new Set(variantImages)).slice(0, 24);
//     }

//     // ----------------- PRICE CALCULATION -----------------
//     let sellingPrice: number | null = null;
//     let priceIncomplete = true;
//     let priceBreakdown: PriceBreakdown = {
//       metalCost: null,
//       diamondCost: null,
//       labourCost: null,
//       missingDefaults: missingDefaults.length ? missingDefaults : undefined,
//     };
//     const priceIncompleteReasons: string[] = [];

//     // <-- net weight in grams (metal net weight for this variant)
//     let netWeightGrams: number | null = null;

//     if (firstVariantDoc) {
//       try {
//         const variant = firstVariantDoc;
//         const stonesArr: Stone[] =
//           Array.isArray(variant?.meta?.stones) && variant.meta!.stones!.length
//             ? variant.meta!.stones!
//             : Array.isArray(variant?.stones) && variant.stones!.length
//               ? variant.stones!
//               : [];

//         const includedStones: {
//           sequence: string;
//           cts: number;
//           netWeightGrams: number | null;
//         }[] = [];

//         for (const st of stonesArr) {
//           if (!st) continue;
//           if (Array.isArray(st.sequences) && st.sequences.length) {
//             for (const s of st.sequences) {
//               const sSeq = s?.sequence || null;
//               const sCts = typeof s?.cts === "number" ? s.cts : null;
//               if (sSeq && sCts != null) {
//                 includedStones.push({
//                   sequence: String(sSeq),
//                   cts: sCts,
//                   netWeightGrams: st.netWeightGrams ?? null,
//                 });
//               }
//             }
//           } else {
//             const seq = st?.sequence || (st as any).sequenceNo || null;
//             const cts = typeof st?.cts === "number" ? st.cts : null;
//             if (seq && cts != null) {
//               includedStones.push({
//                 sequence: String(seq),
//                 cts,
//                 netWeightGrams: st.netWeightGrams ?? null,
//               });
//             }
//           }
//         }

//         console.debug("[getProductByModelSku] includedStones:", includedStones);

//         const sequences = Array.from(
//           new Set(includedStones.map((s) => s.sequence).filter(Boolean))
//         );

//         type RawPricingDoc = {
//           sequence?: unknown;
//           selling_price?: unknown;
//           sellingPrice?: unknown;
//           price?: unknown;
//           [k: string]: unknown;
//         };

//         const pricingMap: Record<string, PricingDoc> = {};
//         if (sequences.length) {
//           const rawDocs = (await finalPricingColl
//             .find({ sequence: { $in: sequences } })
//             .toArray()) as RawPricingDoc[];

//           console.debug(
//             "[getProductByModelSku] pricing rawDocs count:",
//             rawDocs.length
//           );

//           for (const raw of rawDocs) {
//             const seq =
//               raw && raw.sequence != null ? String(raw.sequence) : null;
//             if (!seq) continue;

//             const sp1 =
//               raw.selling_price !== undefined
//                 ? toNumberRobust(raw.selling_price)
//                 : undefined;
//             const sp2 =
//               raw.sellingPrice !== undefined
//                 ? toNumberRobust(raw.sellingPrice)
//                 : undefined;
//             const p =
//               raw.price !== undefined ? toNumberRobust(raw.price) : undefined;

//             const pd: PricingDoc = { sequence: seq };
//             if (sp1 !== undefined && !Number.isNaN(sp1)) pd.selling_price = sp1;
//             if (sp2 !== undefined && !Number.isNaN(sp2)) pd.sellingPrice = sp2;
//             if (p !== undefined && !Number.isNaN(p)) pd.price = p;

//             for (const k of Object.keys(raw)) {
//               if (
//                 k === "sequence" ||
//                 k === "selling_price" ||
//                 k === "sellingPrice" ||
//                 k === "price"
//               )
//                 continue;
//               (pd as any)[k] = (raw as any)[k];
//             }

//             pricingMap[seq] = pd;
//           }

//           // === LOGGING: show resolved per-sequence pricing info ===
//           console.debug(
//             "[getProductByModelSku] resolved pricingMap (raw -> normalized):"
//           );
//           for (const seq of sequences) {
//             const pd = pricingMap[seq];
//             if (!pd) {
//               console.debug(`  sequence=${seq} -> NOT FOUND in final_pricing`);
//               continue;
//             }
//             const resolved = {
//               sequence: seq,
//               selling_price_raw: pd.selling_price ?? null,
//               sellingPrice_raw: pd.sellingPrice ?? null,
//               price_raw: pd.price ?? null,
//               chosen_unit_price:
//                 toNumberRobust(
//                   pd.selling_price ?? pd.sellingPrice ?? pd.price
//                 ) ?? null,
//             };
//             console.debug("  pricing:", resolved);
//           }
//         } else {
//           console.debug(
//             "[getProductByModelSku] no sequences extracted; skipping pricing fetch"
//           );
//         }

//         let diamondCost = 0;
//         let diamondIncomplete = false;
//         for (const st of includedStones) {
//           const pd = pricingMap[st.sequence];
//           const pricePerCt = toNumberRobust(
//             pd?.selling_price ?? pd?.sellingPrice ?? pd?.price
//           );
//           if (Number.isNaN(pricePerCt)) {
//             diamondIncomplete = true;
//             continue;
//           }
//           diamondCost += pricePerCt * st.cts;
//         }

//         // ----------------- METAL DETECTION LOGIC -----------------
//         // If SKU contains SLV -> SILVER
//         // If SKU contains PT -> PLATINUM
//         // If SKU contains 18 or 9 -> GOLD
//         // Otherwise fall back to variant.meta.metalType or default to GOLD
//         const skuToCheck = String(
//           variant?.sku ?? chosenVariantSku ?? ""
//         ).toUpperCase();
//         let detectedMetalFromSku: string | null = null;
//         if (skuToCheck.includes("SLV")) {
//           detectedMetalFromSku = "SILVER";
//         } else if (skuToCheck.includes("PT")) {
//           detectedMetalFromSku = "PLATINUM";
//         } else if (skuToCheck.includes("18") || skuToCheck.includes("9")) {
//           detectedMetalFromSku = "GOLD";
//         }

//         const metalType = (
//           detectedMetalFromSku ||
//           variant?.meta?.metalType ||
//           variant?.metalType ||
//           "GOLD"
//         )
//           .toString()
//           .toUpperCase();

//         let karatStr: string | number =
//           variant?.meta?.metalKt ??
//           (Array.isArray(goldKarats) ? goldKarats[0] : goldKarats) ??
//           variant?.metalKt ??
//           "18";

//         const karatNum = Number(
//           String(karatStr).match(/\d+/)?.[0] ||
//           (metalType === "PLATINUM" ? 950 : 18)
//         );

//         // Resolve net weight in grams (metal net weight for pricing and response)
//         netWeightGrams = null;
//         if (variant?.meta?.metalWeightGrams != null)
//           netWeightGrams = toNumberRobust(variant.meta.metalWeightGrams);
//         else if (variant?.meta?.netWeightGrams != null)
//           netWeightGrams = toNumberRobust(variant.meta.netWeightGrams);
//         else if (variant?.netWeightGrams != null)
//           netWeightGrams = toNumberRobust(variant.netWeightGrams);

//         if (Number.isNaN(netWeightGrams as any)) netWeightGrams = null;

//         if (
//           (netWeightGrams == null || Number.isNaN(netWeightGrams as any)) &&
//           includedStones.length
//         ) {
//           const sum = includedStones.reduce(
//             (acc, s) => acc + (s.netWeightGrams ? Number(s.netWeightGrams) : 0),
//             0
//           );
//           netWeightGrams = sum > 0 ? sum : null;
//         }

//         let metalPricePerGram = NaN;
//         const mType = (metalType || "GOLD").toUpperCase();

//         if (mType === "GOLD" && !Number.isNaN(goldValue24)) {
//           const factor =
//             KARAT_FACTOR[String(karatNum)] ?? KARAT_FACTOR["18"] ?? 18 / 24;
//           metalPricePerGram = goldValue24 * factor;
//         } else if (mType === "SILVER" && !Number.isNaN(silverPricePerGram)) {
//           metalPricePerGram = silverPricePerGram;
//         } else if (
//           mType === "PLATINUM" &&
//           !Number.isNaN(platinumPricePerGram)
//         ) {
//           metalPricePerGram = platinumPricePerGram;
//         } else if (
//           mType === "TITANIUM" &&
//           !Number.isNaN(titaniumPricePerGram)
//         ) {
//           metalPricePerGram = titaniumPricePerGram;
//         }

//         let metalCost = 0;
//         let labourCost = 0;
//         let metalIncomplete = false;

//         // labour resolution: prefer DB default, else fallback to LABOUR_RATE constant
//         const labourFromDefaults =
//           labourDefaults[mType as keyof typeof labourDefaults];
//         const expenseFromDefaults =
//           expenseDefaults[mType as keyof typeof expenseDefaults];
//         const resolvedLabourCost = !Number.isNaN(labourFromDefaults)
//           ? labourFromDefaults
//           : LABOUR_RATE[mType] ?? LABOUR_RATE.GOLD;
//         const resolvedExpense = !Number.isNaN(expenseFromDefaults)
//           ? expenseFromDefaults
//           : 0;
//         const resolvedGstPercent = Number.isNaN(gstPercentDefault)
//           ? 0
//           : gstPercentDefault;

//         if (netWeightGrams && !Number.isNaN(metalPricePerGram)) {
//           metalCost = metalPricePerGram * netWeightGrams;
//           labourCost = resolvedLabourCost;
//         } else {
//           metalIncomplete = true;
//           if (!netWeightGrams)
//             priceIncompleteReasons.push("missing_metal_weight");
//           if (Number.isNaN(metalPricePerGram))
//             priceIncompleteReasons.push("missing_metal_unit_price");
//         }

//         // computedSellingPrice is BEFORE adding "expense" and GST
//         const computedSellingPriceBeforeExpense =
//           metalCost + diamondCost + labourCost;

//         // add expense (per-metal)
//         const expenseValue = resolvedExpense || 0;
//         const totalBeforeGst = computedSellingPriceBeforeExpense + expenseValue;

//         // compute gst
//         const gstPercent = resolvedGstPercent || 0;
//         const gstAmount = totalBeforeGst * (gstPercent / 100);

//         const totalWithGst = totalBeforeGst + gstAmount;

//         sellingPrice =
//           !Number.isNaN(totalWithGst) && totalWithGst > 0
//             ? Math.round(totalWithGst)
//             : null;

//         priceIncomplete =
//           metalIncomplete || diamondIncomplete || missingDefaults.length > 0;

//         priceBreakdown = {
//           metalCost: metalCost || 0,
//           diamondCost: diamondCost || 0,
//           labourCost: labourCost || 0,
//           expense: expenseValue || 0,
//           gstPercent: gstPercent || 0,
//           gstAmount: Math.round(gstAmount) || 0,
//           totalBeforeGst: Math.round(totalBeforeGst) || 0,
//           totalWithGst: Math.round(totalWithGst) || 0,
//           missingDefaults: missingDefaults.length ? missingDefaults : undefined,
//         };

//         if (diamondIncomplete)
//           priceIncompleteReasons.push("missing_diamond_price_entries");
//         if (missingDefaults.length)
//           priceIncompleteReasons.push("missing_default_values");

//         console.info("[getProductByModelSku] price result", {
//           modelSku,
//           chosenVariantSku,
//           metalType: mType,
//           karatNum,
//           netWeightGrams,
//           metalPricePerGram,
//           metalCost,
//           diamondCost,
//           labourCost,
//           expenseValue,
//           gstPercent,
//           gstAmount,
//           totalBeforeGst,
//           totalWithGst,
//           sellingPrice,
//           priceIncomplete,
//           priceIncompleteReasons,
//         });
//       } catch (err) {
//         console.error("[getProductByModelSku] pricing calc error:", err);
//         sellingPrice = null;
//         priceIncomplete = true;
//         priceBreakdown = {
//           metalCost: null,
//           diamondCost: null,
//           labourCost: null,
//           error: err instanceof Error ? err.message : String(err),
//         };
//         priceIncompleteReasons.push("exception_in_pricing");
//       }
//     } else {
//       sellingPrice = null;
//       priceIncomplete = true;
//       priceBreakdown = {
//         metalCost: null,
//         diamondCost: null,
//         labourCost: null,
//       };
//       priceIncompleteReasons.push("missing_variant");
//       console.warn(
//         "[getProductByModelSku] no variant doc found; cannot compute price",
//         { modelSku, firstVariantSku }
//       );
//     }

//     // ----------------- ENGRAVING: finalize detection & extraction ----------
//     // Variant-level engraving override (if present)
//     const variantEngravingObj =
//       firstVariantDoc &&
//         typeof (firstVariantDoc.meta?.engraving ?? firstVariantDoc.engraving) ===
//         "object"
//         ? firstVariantDoc.meta?.engraving ?? firstVariantDoc.engraving
//         : null;

//     // Final engraving object: prefer variant engraving object, else product engraving object
//     const finalEngravingObj =
//       variantEngravingObj ?? productEngravingObj ?? null;

//     // Extract numeric-like fontSize and maxCharacters robustly
//     const engravingFontSize =
//       finalEngravingObj && finalEngravingObj.fontSize != null
//         ? (() => {
//           const n = toNumberRobust(finalEngravingObj.fontSize);
//           return Number.isNaN(n) ? undefined : n;
//         })()
//         : undefined;

//     const engravingMaxCharacters =
//       finalEngravingObj && finalEngravingObj.maxCharacters != null
//         ? (() => {
//           const n = toNumberRobust(finalEngravingObj.maxCharacters);
//           return Number.isNaN(n) ? undefined : n;
//         })()
//         : undefined;

//     // isEngraving: true if legacy array exists OR the final engraving object has meaningful fields
//     const isEngraving =
//       isEngravingFromLegacyArray ||
//       (!!finalEngravingObj &&
//         (engravingFontSize !== undefined ||
//           engravingMaxCharacters !== undefined));

//     // ----------------- Final response -----------------
//     const response = {
//       _id: (product as any)._id, // Add MongoDB _id for cart compatibility
//       success: true,
//       modelSku,
//       title,
//       description,
//       metalTypes,
//       metalOptions,
//       goldKarats,
//       diamondShape,
//       diamondSize,
//       diamondOptions,
//       diamondColorClarity,
//       isEngraving,
//       engravingInfo: finalEngravingObj
//         ? {
//           fontSize:
//             engravingFontSize !== undefined ? engravingFontSize : null,
//           maxCharacters:
//             engravingMaxCharacters !== undefined
//               ? engravingMaxCharacters
//               : null,
//         }
//         : null,
//       variantCount,
//       firstVariantSku,
//       sellingPrice,
//       priceIncomplete,
//       priceBreakdown,
//       priceIncompleteReasons,
//       chosenVariantSku: chosenVariantSku ?? null,
//       variantImages,
//       availableColors, // <-- WG / YG / RG / BR etc inferred from image filenames
//       netWeightGrams, // <-- exposed net weight in grams for the chosen variant
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



// export const getProductsByCategory = async (req: Request, res: Response) => {
//   try {
//     const rawCategory = String(req.params.category || "").trim();
//     if (!rawCategory)
//       return res.status(400).json({ success: false, message: "Category required" });

//     const category = rawCategory.toUpperCase();

//     const page = Math.max(1, parseInt(String(req.query.page || "1"), 10));
//     const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit || "20"), 10)));
//     const skip = (page - 1) * limit;

//     const minPrice = n(req.query.minPrice);
//     const maxPrice = n(req.query.maxPrice);

//     // Parse filters
//     const shapesRaw = String(req.query.centerStoneShape || "").trim();
//     const shapes = shapesRaw
//       ? shapesRaw.split(",").map(s => s.trim().toUpperCase()).filter(Boolean)
//       : [];

//     const metalTypesRaw = String(req.query.metalTypes || "").trim();
//     const metalTypes = metalTypesRaw
//       ? metalTypesRaw.split(",").map(s => s.trim().toUpperCase()).filter(Boolean)
//       : [];

//     const isEngravingRaw = String(req.query.isEngraving || "").trim().toLowerCase();
//     const isEngraving = category === "RINGS" && ["true", "1", "yes"].includes(isEngravingRaw);

//     // Ring type filters
//     const ringRaw = String(req.query.ringType || req.query.ring || "").trim();
//     const ringTokens = ringRaw ? ringRaw.split(",").map(s => s.trim()) : [];

//     const mapRingTypeToPrefixes = (token: string): string[] => {
//       const t = token.trim().toLowerCase().replace(/[-_\s]+/g, "");
//       if (["engagement", "eng", "engring", "engagementring", "engagement-ring"].includes(t))
//         return ["ENG"];
//       if (["solitaire", "sol", "sr", "solitairering", "solitaire-ring"].includes(t))
//         return ["SR"];
//       if (["fashion", "fash", "fr", "fashionring", "fashion-ring"].includes(t))
//         return ["FR"];
//       if (["men", "mens", "gr", "menring", "men-ring"].includes(t))
//         return ["GR"];
//       if (/^(eng|sr|fr|gr)$/i.test(t)) return [t.toUpperCase()];
//       return [];
//     };

//     const ringPrefixes = Array.from(
//       new Set(ringTokens.flatMap(mapRingTypeToPrefixes))
//     );

//     // Category filters
//     const parseCatParam = (v: any) =>
//       v
//         ? String(v).split(",").map((s: string) => s.trim()).filter(Boolean).map((x: string) => x.toUpperCase())
//         : [];

//     const cat1Filters = parseCatParam(req.query.category1);
//     const cat2Filters = parseCatParam(req.query.category2);
//     const cat3Filters = parseCatParam(req.query.category3);

//     const VariantModel = getCollectionModel("variants");
//     const ProductModel = getCollectionModel("products");

//     let eligibleModelSkus: string[] | null = null;

//     /**
//      * ENGRAVING FILTER - Get eligible modelSkus from products collection
//      */
//     if (isEngraving) {
//       const productMatch: any = { category };
//       productMatch["engraving"] = { $type: "object", $ne: null };

//       const engravingProducts = await ProductModel.find(productMatch, { modelSku: 1 }).lean().exec();
//       eligibleModelSkus = engravingProducts.map((p: any) => p.modelSku).filter(Boolean);

//       if (eligibleModelSkus.length === 0) {
//         return res.status(200).json({
//           success: true,
//           count: 0,
//           total: await ProductModel.countDocuments({ category }),
//           totalFiltered: 0,
//           pagination: {
//             totalPages: 0,
//             currentPage: page,
//             limit,
//           },
//           appliedFilters: {
//             category,
//             centerStoneShape: shapes.length > 0 ? shapes : null,
//             ringTypeRequested: ringTokens.length > 0 ? ringTokens : null,
//             ringPrefixesApplied: ringPrefixes.length > 0 ? ringPrefixes : null,
//             category1: cat1Filters.length > 0 ? cat1Filters : null,
//             category2: cat2Filters.length > 0 ? cat2Filters : null,
//             category3: cat3Filters.length > 0 ? cat3Filters : null,
//             metalTypes: metalTypes.length > 0 ? metalTypes : null,
//             isEngraving: true,
//             minPrice: !Number.isNaN(minPrice) ? minPrice : null,
//             maxPrice: !Number.isNaN(maxPrice) ? maxPrice : null,
//           },
//           products: [],
//         });
//       }
//     }

//     /**
//      * BUILD VARIANT MATCH
//      */
//     const variantMatch: any = { category };

//     // If engraving filter is active, restrict to eligible modelSkus
//     if (eligibleModelSkus !== null) {
//       variantMatch.modelSku = { $in: eligibleModelSkus };
//     }

//     // Metal type filter
//     if (metalTypes.length > 0) {
//       variantMatch["meta.metalType"] = { $in: metalTypes };
//     }

//     // Shape filter
//     if (shapes.length > 0) {
//       variantMatch.$or = [
//         { "meta.stones.centerStoneShape": { $in: shapes } },
//         { "meta.stones.diamondGemstoneShape": { $in: shapes } },
//         { "meta.stones.diamondGemstoneShapes": { $in: shapes } },
//         { "meta.stones.sequences.centerStoneShape": { $in: shapes } },
//         { "meta.stones.sequences.diamondGemstoneShape": { $in: shapes } },
//         { "meta.stones.sequences.diamondGemstoneShapes": { $in: shapes } },
//       ];
//     }

//     // Ring type (SKU prefix) filter
//     if (ringPrefixes.length > 0) {
//       const prefixRegexes = ringPrefixes.map(prefix => new RegExp(`^${prefix}`, "i"));
//       if (variantMatch.modelSku && variantMatch.modelSku.$in) {
//         const filteredSkus = eligibleModelSkus!.filter(sku =>
//           prefixRegexes.some(regex => regex.test(sku))
//         );
//         variantMatch.modelSku = { $in: filteredSkus };
//       } else {
//         variantMatch.modelSku = { $in: prefixRegexes };
//       }
//     }

//     /**
//      * OPTIMIZED AGGREGATION PIPELINE
//      * Key changes:
//      * 1. Project only needed fields immediately after match
//      * 2. Limit aggregation before lookup if no product filters
//      * 3. Use pipeline in $lookup to project only needed fields
//      */
//     const hasProductFilters = cat1Filters.length > 0 || cat2Filters.length > 0 || cat3Filters.length > 0;

//     const pipeline: any[] = [
//       { $match: variantMatch },

//       // Project only needed fields early
//       {
//         $project: {
//           modelSku: 1,
//           sku: 1,
//           category: 1,
//           images: 1,
//           stones: 1,
//           netWeightGrams: 1,
//           "meta.title": 1,
//           "meta.metalType": 1,
//           "meta.metalKt": 1,
//           "meta.metalWeightGrams": 1,
//           "meta.stones": 1,
//         },
//       },

//       // Group by modelSku
//       {
//         $group: {
//           _id: "$modelSku",
//           firstVariant: { $first: "$$ROOT" },
//         },
//       },

//       // Sort early to ensure consistent results
//       { $sort: { "_id": 1 } },
//     ];

//     // If no product-level filters, we can count and limit early
//     if (!hasProductFilters) {
//       // Get total count before limiting
//       const countPipeline = [...pipeline, { $count: "total" }];
//       const countResult = await VariantModel.aggregate(countPipeline).exec();
//       const totalFiltered = countResult[0]?.total || 0;

//       // Now add pagination to main pipeline
//       pipeline.push(
//         { $skip: skip },
//         { $limit: limit }
//       );

//       // Execute limited query
//       const limitedResults = await VariantModel.aggregate(pipeline)
//         .allowDiskUse(true)
//         .exec();

//       // Lookup products for only the limited results
//       const modelSkus = limitedResults.map(r => r._id);
//       const products = await ProductModel.find(
//         { modelSku: { $in: modelSkus } },
//         {
//           modelSku: 1,
//           title: 1,
//           variantIds: 1,
//           engraving: 1,
//           "attributes.metalTypes": 1,
//           "attributes.goldKarats": 1,
//           "attributes.category1": 1,
//           "attributes.category2": 1,
//           "attributes.category3": 1,
//           "seo.metaTitle": 1,
//         }
//       ).lean().exec() as any[];

//       const productMap = new Map(products.map((p: any) => [p.modelSku, p]));

//       // Combine results
//       const combinedResults = limitedResults
//         .map(row => ({
//           firstVariant: row.firstVariant,
//           product: productMap.get(row._id),
//         }))
//         .filter(row => row.product); // Only keep results with matching product

//       // Process with batched pricing
//       const finalProducts = await processProductsWithBatchedPricing(
//         combinedResults,
//         category,
//         minPrice,
//         maxPrice
//       );

//       const totalProducts = await ProductModel.countDocuments({ category });

//       return res.status(200).json({
//         success: true,
//         count: finalProducts.length,
//         total: totalProducts,
//         totalFiltered: totalFiltered,
//         pagination: {
//           totalPages: Math.ceil(totalFiltered / limit),
//           currentPage: page,
//           limit,
//         },
//         appliedFilters: {
//           category,
//           centerStoneShape: shapes.length > 0 ? shapes : null,
//           ringTypeRequested: ringTokens.length > 0 ? ringTokens : null,
//           ringPrefixesApplied: ringPrefixes.length > 0 ? ringPrefixes : null,
//           category1: cat1Filters.length > 0 ? cat1Filters : null,
//           category2: cat2Filters.length > 0 ? cat2Filters : null,
//           category3: cat3Filters.length > 0 ? cat3Filters : null,
//           metalTypes: metalTypes.length > 0 ? metalTypes : null,
//           isEngraving: category === "RINGS" ? isEngraving : null,
//           minPrice: !Number.isNaN(minPrice) ? minPrice : null,
//           maxPrice: !Number.isNaN(maxPrice) ? maxPrice : null,
//         },
//         products: finalProducts,
//       });
//     }

//     // If we have product filters, we need to do the lookup first
//     pipeline.push(
//       {
//         $lookup: {
//           from: "products",
//           localField: "_id",
//           foreignField: "modelSku",
//           as: "product",
//           pipeline: [
//             {
//               $project: {
//                 modelSku: 1,
//                 title: 1,
//                 variantIds: 1,
//                 engraving: 1,
//                 "attributes.metalTypes": 1,
//                 "attributes.goldKarats": 1,
//                 "attributes.category1": 1,
//                 "attributes.category2": 1,
//                 "attributes.category3": 1,
//                 "seo.metaTitle": 1,
//               },
//             },
//           ],
//         },
//       },
//       { $unwind: { path: "$product", preserveNullAndEmptyArrays: false } }
//     );

//     // Apply product-level category filters
//     if (cat1Filters.length > 0) {
//       pipeline.push({
//         $match: {
//           $or: cat1Filters.map(v => ({
//             "product.attributes.category1": { $regex: v, $options: "i" },
//           })),
//         },
//       });
//     }

//     if (cat2Filters.length > 0) {
//       pipeline.push({
//         $match: {
//           $or: cat2Filters.map(v => ({
//             "product.attributes.category2": { $regex: v, $options: "i" },
//           })),
//         },
//       });
//     }

//     if (cat3Filters.length > 0) {
//       pipeline.push({
//         $match: {
//           $or: cat3Filters.map(v => ({
//             "product.attributes.category3": { $regex: v, $options: "i" },
//           })),
//         },
//       });
//     }

//     // Get all results for pricing calculation and filtering
//     const allResults = await VariantModel.aggregate(pipeline)
//       .allowDiskUse(true)
//       .exec();

//     // Process with batched pricing (includes price filtering)
//     const allProducts = await processProductsWithBatchedPricing(
//       allResults,
//       category,
//       minPrice,
//       maxPrice
//     );

//     // Now paginate after price filtering
//     const totalFiltered = allProducts.length;
//     const paged = allProducts.slice(skip, skip + limit);

//     const totalProducts = await ProductModel.countDocuments({ category });

//     return res.status(200).json({
//       success: true,
//       count: paged.length,
//       total: totalProducts,
//       totalFiltered,
//       pagination: {
//         totalPages: Math.ceil(totalFiltered / limit),
//         currentPage: page,
//         limit,
//       },
//       appliedFilters: {
//         category,
//         centerStoneShape: shapes.length > 0 ? shapes : null,
//         ringTypeRequested: ringTokens.length > 0 ? ringTokens : null,
//         ringPrefixesApplied: ringPrefixes.length > 0 ? ringPrefixes : null,
//         category1: cat1Filters.length > 0 ? cat1Filters : null,
//         category2: cat2Filters.length > 0 ? cat2Filters : null,
//         category3: cat3Filters.length > 0 ? cat3Filters : null,
//         metalTypes: metalTypes.length > 0 ? metalTypes : null,
//         isEngraving: category === "RINGS" ? isEngraving : null,
//         minPrice: !Number.isNaN(minPrice) ? minPrice : null,
//         maxPrice: !Number.isNaN(maxPrice) ? maxPrice : null,
//       },
//       products: paged,
//     });
//   } catch (err) {
//     console.error("getProductsByCategory error:", err);
//     return res.status(500).json({
//       success: false,
//       message: "Server error",
//       error: err instanceof Error ? err.message : String(err),
//     });
//   }
// };



/**
 * BATCHED PRICING CALCULATION
 * This function calculates prices with batched database lookups
 */
// async function processProductsWithBatchedPricing(
//   allResults: any[],
//   category: string,
//   minPrice: number,
//   maxPrice: number
// ): Promise<any[]> {
//   const conn = getCatalogConnection();
//   const finalPricingColl = conn.collection("final_pricing");
//   const defaultsColl = conn.collection("defaultValues");

//   // Get defaults once
//   const defaultDocs = await defaultsColl.find({}).toArray();
//   const mergedDefaults = Object.assign(
//     {},
//     ...defaultDocs.map(d => {
//       const c = { ...d };
//       delete (c as any)._id;
//       return c;
//     })
//   );

//   const toNumberRobust = (v: unknown): number => {
//     if (v == null) return NaN;
//     if (typeof v === "number") return Number.isFinite(v) ? v : NaN;
//     if (typeof v === "string") {
//       const cleaned = v.replace(/[₹$,£€\s]/g, "").replace(/,/g, "");
//       const n = Number(cleaned);
//       if (!Number.isNaN(n) && Number.isFinite(n)) return n;
//       const m = cleaned.match(/-?\d+(\.\d+)?/);
//       if (m) {
//         const nf = Number(m[0]);
//         return Number.isFinite(nf) ? nf : NaN;
//       }
//       return NaN;
//     }
//     try {
//       const s = (v as any).toString?.();
//       const n = Number(s);
//       return Number.isFinite(n) ? n : NaN;
//     } catch {
//       return NaN;
//     }
//   };

//   const normalizeKey = (k: string) =>
//     k.toString().trim().toLowerCase().replace(/[^a-z0-9]/g, "");

//   const findNumericDefault = (
//     obj: Record<string, any>,
//     candidateNames: string[]
//   ): { value: number; matchedKey?: string } => {
//     if (!obj || typeof obj !== "object") return { value: NaN };
//     const candNorm = candidateNames.map((c) => normalizeKey(c));

//     for (const [k, v] of Object.entries(obj)) {
//       const kn = normalizeKey(k);
//       if (candNorm.includes(kn)) {
//         const val = toNumberRobust(v);
//         if (!Number.isNaN(val)) return { value: val, matchedKey: k };
//       }
//     }

//     for (const [k, v] of Object.entries(obj)) {
//       const kn = normalizeKey(k);
//       for (const cn of candNorm) {
//         if (kn.includes(cn) || cn.includes(kn)) {
//           const val = toNumberRobust(v);
//           if (!Number.isNaN(val)) return { value: val, matchedKey: k };
//         }
//       }
//     }

//     for (const [k, v] of Object.entries(obj)) {
//       if (v && typeof v === "object" && !Array.isArray(v)) {
//         for (const [k2, v2] of Object.entries(v as Record<string, any>)) {
//           const kn2 = normalizeKey(k2);
//           if (candNorm.includes(kn2)) {
//             const val = toNumberRobust(v2);
//             if (!Number.isNaN(val))
//               return { value: val, matchedKey: `${k}.${k2}` };
//           }
//           for (const cn of candNorm) {
//             if (kn2.includes(cn) || cn.includes(kn2)) {
//               const val = toNumberRobust(v2);
//               if (!Number.isNaN(val))
//                 return { value: val, matchedKey: `${k}.${k2}` };
//             }
//           }
//         }
//       }
//     }

//     return { value: NaN };
//   };

//   const goldRes = findNumericDefault(mergedDefaults, [
//     "goldValue24PerGram",
//     "goldValue24",
//     "goldPerGram",
//     "gold24",
//     "goldvalue24pergram",
//   ]);
//   const platinumRes = findNumericDefault(mergedDefaults, [
//     "platinumPricePerGram",
//     "platinumPricePerGrm",
//     "platinumPerGram",
//     "ptPricePerGram",
//   ]);
//   const silverRes = findNumericDefault(mergedDefaults, [
//     "silverPricePerGram",
//     "silverPerGram",
//     "silverPrice",
//     "svPricePerGram",
//   ]);
//   const titaniumRes = findNumericDefault(mergedDefaults, [
//     "titaniumPricePerGram",
//     "titaniumPerGram",
//     "titaniumPrice",
//   ]);

//   const goldValue24 = goldRes.value;
//   const silverPricePerGram = silverRes.value;
//   const platinumPricePerGram = platinumRes.value;
//   const titaniumPricePerGram = titaniumRes.value;

//   // STEP 1: Collect all unique stone sequences from ALL results
//   const allSequences = new Set<string>();
  
//   for (const row of allResults) {
//     const variant = row.firstVariant;
//     const stonesArr: any[] = Array.isArray(variant.meta?.stones) && variant.meta.stones.length
//       ? variant.meta.stones
//       : Array.isArray(variant.stones)
//         ? variant.stones
//         : [];

//     for (let i = 0; i < stonesArr.length; i++) {
//       const st = stonesArr[i];
//       const seq =
//         st?.sequence ||
//         (Array.isArray(st?.sequences) && st.sequences[0]?.sequence) ||
//         st?.sequenceNo;
      
//       if (seq) {
//         allSequences.add(seq);
//       }
//     }
//   }

//   // STEP 2: Batch fetch ALL pricing data in ONE query
//   const pricingDocs = await finalPricingColl
//     .find({ sequence: { $in: Array.from(allSequences) } })
//     .toArray();

//   // Create a Map for O(1) lookups
//   const pricingMap = new Map(
//     pricingDocs.map((doc: any) => [
//       doc.sequence,
//       {
//         price: toNumberRobust(doc.selling_price ?? doc.sellingPrice ?? doc.price),
//       },
//     ])
//   );

//   // STEP 3: Process all products using the cached pricing data
//   const products: any[] = [];

//   for (const row of allResults) {
//     const variant = row.firstVariant;
//     const product = row.product;

//     // Get image
//     let imageUrl: string | null = null;
//     if (Array.isArray(variant.images) && variant.images.length > 0) {
//       const img = variant.images[1] || variant.images[0];
//       imageUrl = img?.url || img?.filename || null;
//     }

//     // Get engraving from PRODUCT (not variant)
//     const engravingObj = product.engraving ?? null;
//     const engravingMaxChars =
//       engravingObj && typeof engravingObj.maxCharacters === "number"
//         ? engravingObj.maxCharacters
//         : null;
//     const engravingFontSize =
//       engravingObj && engravingObj.fontSize != null ? engravingObj.fontSize : null;

//     // Get metal types from PRODUCT attributes
//     const productMetalTypes = Array.isArray(product.attributes?.metalTypes)
//       ? product.attributes.metalTypes
//       : product.attributes?.metalTypes
//         ? [product.attributes.metalTypes]
//         : [];

//     const baseOut: any = {
//       _id: product._id,
//       modelSku: product.modelSku,
//       metalTypes: productMetalTypes,
//       title: variant.meta?.title || product.seo?.metaTitle || product.title || null,
//       variantCount: Array.isArray(product.variantIds) ? product.variantIds.length : 0,
//       firstVariantSku: variant.sku,
//       firstVariantImageUrl: imageUrl,
//       attributesCategory1: product.attributes?.category1 ?? null,
//       attributesCategory2: product.attributes?.category2 ?? null,
//       attributesCategory3: product.attributes?.category3 ?? null,
//       engravingMaxCharacters: category === "RINGS" ? engravingMaxChars : null,
//       engravingFontSize: category === "RINGS" ? engravingFontSize : null,
//       sellingPrice: null,
//       priceIncomplete: true,
//     };

//     // Calculate price using cached pricing data
//     try {
//       const stonesArr: any[] = Array.isArray(variant.meta?.stones) && variant.meta.stones.length
//         ? variant.meta.stones
//         : Array.isArray(variant.stones)
//           ? variant.stones
//           : [];

//       const includedStones: {
//         sequence: string;
//         cts: number;
//         netWeightGrams: number | null;
//       }[] = [];

//       for (let i = 0; i < stonesArr.length; i++) {
//         const st = stonesArr[i];
//         const seq =
//           st?.sequence ||
//           (Array.isArray(st?.sequences) && st.sequences[0]?.sequence) ||
//           st?.sequenceNo;
//         if (!seq) continue;

//         const cts =
//           typeof st?.cts === "number"
//             ? st.cts
//             : Array.isArray(st?.sequences) && typeof st.sequences[0]?.cts === "number"
//               ? st.sequences[0].cts
//               : null;
//         if (cts == null) continue;

//         const net = st?.netWeightGrams != null ? n(st.netWeightGrams) : null;
//         if (i > 0 && net !== null) break;

//         includedStones.push({ sequence: seq, cts, netWeightGrams: net });
//       }

//       let diamondCost = 0;
//       let diamondIncomplete = false;

//       // Use cached pricing data instead of individual queries
//       for (const st of includedStones) {
//         const pricingData = pricingMap.get(st.sequence);
//         const pricePerCt = pricingData?.price ?? NaN;
        
//         if (Number.isNaN(pricePerCt)) {
//           diamondIncomplete = true;
//           continue;
//         }
//         diamondCost += pricePerCt * st.cts;
//       }

//       const metalType = (
//         variant?.meta?.metalType ||
//         (Array.isArray(productMetalTypes) ? productMetalTypes[0] : productMetalTypes) ||
//         "GOLD"
//       ).toString().toUpperCase();

//       let karatStr =
//         variant?.meta?.metalKt ||
//         (Array.isArray(product.attributes?.goldKarats)
//           ? product.attributes.goldKarats[0]
//           : product.attributes?.goldKarats) ||
//         "18";
//       const karatNum = Number(String(karatStr).match(/\d+/)?.[0] || 18);

//       let metalWeightGrams: number | null =
//         variant?.meta?.metalWeightGrams != null
//           ? n(variant.meta.metalWeightGrams)
//           : variant?.netWeightGrams != null
//             ? n(variant.netWeightGrams)
//             : null;

//       if (
//         (metalWeightGrams == null || Number.isNaN(metalWeightGrams)) &&
//         includedStones.length
//       ) {
//         const sum = includedStones.reduce(
//           (acc, s) => acc + (s.netWeightGrams ? Number(s.netWeightGrams) : 0),
//           0
//         );
//         metalWeightGrams = sum > 0 ? sum : null;
//       }

//       let metalPricePerGram = NaN;
//       if (metalType === "GOLD" && !Number.isNaN(goldValue24)) {
//         const factor = KARAT_FACTOR[String(karatNum)] ?? KARAT_FACTOR["18"];
//         metalPricePerGram = goldValue24 * factor;
//       } else if (metalType === "SILVER") metalPricePerGram = silverPricePerGram;
//       else if (metalType === "PLATINUM") metalPricePerGram = platinumPricePerGram;
//       else if (metalType === "TITANIUM") metalPricePerGram = titaniumPricePerGram;

//       let metalCost = 0,
//         labourCost = 0,
//         metalIncomplete = false;

//       if (metalWeightGrams && !Number.isNaN(metalPricePerGram)) {
//         metalCost = metalPricePerGram * metalWeightGrams;
//         labourCost = LABOUR_RATE[metalType] ?? LABOUR_RATE.GOLD;
//       } else metalIncomplete = true;

//       const sellingPrice = metalCost + diamondCost + labourCost;
//       baseOut.sellingPrice =
//         !Number.isNaN(sellingPrice) && sellingPrice > 0
//           ? Math.round(sellingPrice)
//           : null;
//       baseOut.priceIncomplete = metalIncomplete || diamondIncomplete;
//     } catch (err) {
//       baseOut.sellingPrice = null;
//       baseOut.priceIncomplete = true;
//     }

//     // Price filter
//     if (!Number.isNaN(minPrice) && (baseOut.sellingPrice === null || baseOut.sellingPrice < minPrice))
//       continue;
//     if (!Number.isNaN(maxPrice) && (baseOut.sellingPrice === null || baseOut.sellingPrice > maxPrice))
//       continue;

//     products.push(baseOut);
//   }

//   return products;
// }


export const getProductsByCategory = async (req: Request, res: Response) => {
  try {
    const rawCategory = String(req.params.category || "").trim();
    if (!rawCategory)
      return res.status(400).json({ success: false, message: "Category required" });

    const category = rawCategory.toUpperCase();

    const page = Math.max(1, parseInt(String(req.query.page || "1"), 10));
    const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit || "20"), 10)));
    const skip = (page - 1) * limit;

    const minPrice = n(req.query.minPrice);
    const maxPrice = n(req.query.maxPrice);

    // Parse sort parameter
    const sortByRaw = String(req.query.sortBy || "").trim().toLowerCase();
    let sortBy: "price_asc" | "price_desc" | null = null;
    if (["price_asc", "priceasc", "low", "lowtohigh", "ascending"].includes(sortByRaw)) {
      sortBy = "price_asc";
    } else if (["price_desc", "pricedesc", "high", "hightolow", "descending"].includes(sortByRaw)) {
      sortBy = "price_desc";
    }

    // Parse filters
    const shapesRaw = String(req.query.centerStoneShape || "").trim();
    const shapes = shapesRaw
      ? shapesRaw.split(",").map(s => s.trim().toUpperCase()).filter(Boolean)
      : [];

    const metalTypesRaw = String(req.query.metalTypes || "").trim();
    const metalTypes = metalTypesRaw
      ? metalTypesRaw.split(",").map(s => s.trim().toUpperCase()).filter(Boolean)
      : [];

    const isEngravingRaw = String(req.query.isEngraving || "").trim().toLowerCase();
    const isEngraving = category === "RINGS" && ["true", "1", "yes"].includes(isEngravingRaw);

    // Ring type filters
    const ringRaw = String(req.query.ringType || req.query.ring || "").trim();
    const ringTokens = ringRaw ? ringRaw.split(",").map(s => s.trim()) : [];

    const mapRingTypeToPrefixes = (token: string): string[] => {
      const t = token.trim().toLowerCase().replace(/[-_\s]+/g, "");
      if (["engagement", "eng", "engring", "engagementring", "engagement-ring"].includes(t))
        return ["ENG"];
      if (["solitaire", "sol", "sr", "solitairering", "solitaire-ring"].includes(t))
        return ["SR"];
      if (["fashion", "fash", "fr", "fashionring", "fashion-ring"].includes(t))
        return ["FR"];
      if (["men", "mens", "gr", "menring", "men-ring"].includes(t))
        return ["GR"];
      if (/^(eng|sr|fr|gr)$/i.test(t)) return [t.toUpperCase()];
      return [];
    };

    const ringPrefixes = Array.from(
      new Set(ringTokens.flatMap(mapRingTypeToPrefixes))
    );

    // Category filters
    const parseCatParam = (v: any) =>
      v
        ? String(v).split(",").map((s: string) => s.trim()).filter(Boolean).map((x: string) => x.toUpperCase())
        : [];

    const cat1Filters = parseCatParam(req.query.category1);
    const cat2Filters = parseCatParam(req.query.category2);
    const cat3Filters = parseCatParam(req.query.category3);

    const VariantModel = getCollectionModel("variants");
    const ProductModel = getCollectionModel("products");

    let eligibleModelSkus: string[] | null = null;

    /**
     * ENGRAVING FILTER - Get eligible modelSkus from products collection
     */
    if (isEngraving) {
      const productMatch: any = { category };
      productMatch["engraving"] = { $type: "object", $ne: null };

      const engravingProducts = await ProductModel.find(productMatch, { modelSku: 1 }).lean().exec();
      eligibleModelSkus = engravingProducts.map((p: any) => p.modelSku).filter(Boolean);

      if (eligibleModelSkus.length === 0) {
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

    // If engraving filter is active, restrict to eligible modelSkus
    if (eligibleModelSkus !== null) {
      variantMatch.modelSku = { $in: eligibleModelSkus };
    }

    // Metal type filter
    if (metalTypes.length > 0) {
      variantMatch["meta.metalType"] = { $in: metalTypes };
    }

    // Shape filter
    if (shapes.length > 0) {
      variantMatch.$or = [
        { "meta.stones.centerStoneShape": { $in: shapes } },
        { "meta.stones.diamondGemstoneShape": { $in: shapes } },
        { "meta.stones.diamondGemstoneShapes": { $in: shapes } },
        { "meta.stones.sequences.centerStoneShape": { $in: shapes } },
        { "meta.stones.sequences.diamondGemstoneShape": { $in: shapes } },
        { "meta.stones.sequences.diamondGemstoneShapes": { $in: shapes } },
      ];
    }

    // Ring type (SKU prefix) filter
    if (ringPrefixes.length > 0) {
      const prefixRegexes = ringPrefixes.map(prefix => new RegExp(`^${prefix}`, "i"));
      if (variantMatch.modelSku && variantMatch.modelSku.$in) {
        const filteredSkus = eligibleModelSkus!.filter(sku =>
          prefixRegexes.some(regex => regex.test(sku))
        );
        variantMatch.modelSku = { $in: filteredSkus };
      } else {
        variantMatch.modelSku = { $in: prefixRegexes };
      }
    }

    /**
     * OPTIMIZED AGGREGATION PIPELINE
     */
    const hasProductFilters = cat1Filters.length > 0 || cat2Filters.length > 0 || cat3Filters.length > 0;

    const pipeline: any[] = [
      { $match: variantMatch },

      // Project only needed fields early
      {
        $project: {
          modelSku: 1,
          sku: 1,
          category: 1,
          images: 1,
          stones: 1,
          netWeightGrams: 1,
          "meta.title": 1,
          "meta.metalType": 1,
          "meta.metalKt": 1,
          "meta.metalWeightGrams": 1,
          "meta.stones": 1,
        },
      },

      // Group by modelSku
      {
        $group: {
          _id: "$modelSku",
          firstVariant: { $first: "$$ROOT" },
        },
      },

      // Sort early to ensure consistent results
      { $sort: { "_id": 1 } },
    ];

    // If no product-level filters and no price sorting, we can limit early
    if (!hasProductFilters && !sortBy) {
      // Get total count before limiting
      const countPipeline = [...pipeline, { $count: "total" }];
      const countResult = await VariantModel.aggregate(countPipeline).exec();
      const totalFiltered = countResult[0]?.total || 0;

      // Now add pagination to main pipeline
      pipeline.push(
        { $skip: skip },
        { $limit: limit }
      );

      // Execute limited query
      const limitedResults = await VariantModel.aggregate(pipeline)
        .allowDiskUse(true)
        .exec();

      // Lookup products for only the limited results
      const modelSkus = limitedResults.map(r => r._id);
      const products = (await ProductModel.find(
        { modelSku: { $in: modelSkus } },
        {
          modelSku: 1,
          title: 1,
          variantIds: 1,
          engraving: 1,
          "attributes.metalTypes": 1,
          "attributes.goldKarats": 1,
          "attributes.category1": 1,
          "attributes.category2": 1,
          "attributes.category3": 1,
          "seo.metaTitle": 1,
        }
      ).lean().exec()) as any[];

      const productMap = new Map(products.map(p => [p.modelSku, p]));

      // Combine results
      const combinedResults = limitedResults
        .map(row => ({
          firstVariant: row.firstVariant,
          product: productMap.get(row._id),
        }))
        .filter(row => row.product);

      // Process with batched pricing
      const finalProducts = await processProductsWithBatchedPricing(
        combinedResults,
        category,
        minPrice,
        maxPrice
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
          from: "products",
          localField: "_id",
          foreignField: "modelSku",
          as: "product",
          pipeline: [
            {
              $project: {
                modelSku: 1,
                title: 1,
                variantIds: 1,
                engraving: 1,
                "attributes.metalTypes": 1,
                "attributes.goldKarats": 1,
                "attributes.category1": 1,
                "attributes.category2": 1,
                "attributes.category3": 1,
                "seo.metaTitle": 1,
              },
            },
          ],
        },
      },
      { $unwind: { path: "$product", preserveNullAndEmptyArrays: false } }
    );

    // Apply product-level category filters
    if (cat1Filters.length > 0) {
      pipeline.push({
        $match: {
          $or: cat1Filters.map(v => ({
            "product.attributes.category1": { $regex: v, $options: "i" },
          })),
        },
      });
    }

    if (cat2Filters.length > 0) {
      pipeline.push({
        $match: {
          $or: cat2Filters.map(v => ({
            "product.attributes.category2": { $regex: v, $options: "i" },
          })),
        },
      });
    }

    if (cat3Filters.length > 0) {
      pipeline.push({
        $match: {
          $or: cat3Filters.map(v => ({
            "product.attributes.category3": { $regex: v, $options: "i" },
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
      maxPrice
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
  maxPrice: number
): Promise<any[]> {
  const conn = getCatalogConnection();
  const finalPricingColl = conn.collection("final_pricing");
  const defaultsColl = conn.collection("defaultValues");

  // Get defaults once
  const defaultDocs = await defaultsColl.find({}).toArray();
  const mergedDefaults = Object.assign(
    {},
    ...defaultDocs.map(d => {
      const c = { ...d };
      delete (c as any)._id;
      return c;
    })
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

  const normalizeKey = (k: string) =>
    k.toString().trim().toLowerCase().replace(/[^a-z0-9]/g, "");

  const findNumericDefault = (
    obj: Record<string, any>,
    candidateNames: string[]
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
  const silverPricePerGram = silverRes.value;
  const platinumPricePerGram = platinumRes.value;
  const titaniumPricePerGram = titaniumRes.value;

  // STEP 1: Collect all unique stone sequences from ALL results
  const allSequences = new Set<string>();
  
  for (const row of allResults) {
    const variant = row.firstVariant;
    const stonesArr: any[] = Array.isArray(variant.meta?.stones) && variant.meta.stones.length
      ? variant.meta.stones
      : Array.isArray(variant.stones)
        ? variant.stones
        : [];

    for (let i = 0; i < stonesArr.length; i++) {
      const st = stonesArr[i];
      const seq =
        st?.sequence ||
        (Array.isArray(st?.sequences) && st.sequences[0]?.sequence) ||
        st?.sequenceNo;
      
      if (seq) {
        allSequences.add(seq);
      }
    }
  }

  // STEP 2: Batch fetch ALL pricing data in ONE query
  const pricingDocs = await finalPricingColl
    .find({ sequence: { $in: Array.from(allSequences) } })
    .toArray();

  // Create a Map for O(1) lookups
  const pricingMap = new Map(
    pricingDocs.map((doc: any) => [
      doc.sequence,
      {
        price: toNumberRobust(doc.selling_price ?? doc.sellingPrice ?? doc.price),
      },
    ])
  );

  // STEP 3: Process all products using the cached pricing data
  const products: any[] = [];

  for (const row of allResults) {
    const variant = row.firstVariant;
    const product = row.product;

    // Get image
    let imageUrl: string | null = null;
    if (Array.isArray(variant.images) && variant.images.length > 0) {
      const img = variant.images[1] || variant.images[0];
      imageUrl = img?.url || img?.filename || null;
    }

    // Get engraving from PRODUCT (not variant)
    const engravingObj = product.engraving ?? null;
    const engravingMaxChars =
      engravingObj && typeof engravingObj.maxCharacters === "number"
        ? engravingObj.maxCharacters
        : null;
    const engravingFontSize =
      engravingObj && engravingObj.fontSize != null ? engravingObj.fontSize : null;

    // Get metal types from PRODUCT attributes
    const productMetalTypes = Array.isArray(product.attributes?.metalTypes)
      ? product.attributes.metalTypes
      : product.attributes?.metalTypes
        ? [product.attributes.metalTypes]
        : [];

    const baseOut: any = {
      _id: product._id,
      modelSku: product.modelSku,
      metalTypes: productMetalTypes,
      title: variant.meta?.title || product.seo?.metaTitle || product.title || null,
      variantCount: Array.isArray(product.variantIds) ? product.variantIds.length : 0,
      firstVariantSku: variant.sku,
      firstVariantImageUrl: imageUrl,
      attributesCategory1: product.attributes?.category1 ?? null,
      attributesCategory2: product.attributes?.category2 ?? null,
      attributesCategory3: product.attributes?.category3 ?? null,
      engravingMaxCharacters: category === "RINGS" ? engravingMaxChars : null,
      engravingFontSize: category === "RINGS" ? engravingFontSize : null,
      sellingPrice: null,
      priceIncomplete: true,
    };

    // Calculate price using cached pricing data
    try {
      const stonesArr: any[] = Array.isArray(variant.meta?.stones) && variant.meta.stones.length
        ? variant.meta.stones
        : Array.isArray(variant.stones)
          ? variant.stones
          : [];

      const includedStones: {
        sequence: string;
        cts: number;
        netWeightGrams: number | null;
      }[] = [];

      for (let i = 0; i < stonesArr.length; i++) {
        const st = stonesArr[i];
        const seq =
          st?.sequence ||
          (Array.isArray(st?.sequences) && st.sequences[0]?.sequence) ||
          st?.sequenceNo;
        if (!seq) continue;

        const cts =
          typeof st?.cts === "number"
            ? st.cts
            : Array.isArray(st?.sequences) && typeof st.sequences[0]?.cts === "number"
              ? st.sequences[0].cts
              : null;
        if (cts == null) continue;

        const net = st?.netWeightGrams != null ? n(st.netWeightGrams) : null;
        if (i > 0 && net !== null) break;

        includedStones.push({ sequence: seq, cts, netWeightGrams: net });
      }

      let diamondCost = 0;
      let diamondIncomplete = false;

      // Use cached pricing data instead of individual queries
      for (const st of includedStones) {
        const pricingData = pricingMap.get(st.sequence);
        const pricePerCt = pricingData?.price ?? NaN;
        
        if (Number.isNaN(pricePerCt)) {
          diamondIncomplete = true;
          continue;
        }
        diamondCost += pricePerCt * st.cts;
      }

      const metalType = (
        variant?.meta?.metalType ||
        (Array.isArray(productMetalTypes) ? productMetalTypes[0] : productMetalTypes) ||
        "GOLD"
      ).toString().toUpperCase();

      let karatStr =
        variant?.meta?.metalKt ||
        (Array.isArray(product.attributes?.goldKarats)
          ? product.attributes.goldKarats[0]
          : product.attributes?.goldKarats) ||
        "18";
      const karatNum = Number(String(karatStr).match(/\d+/)?.[0] || 18);

      let metalWeightGrams: number | null =
        variant?.meta?.metalWeightGrams != null
          ? n(variant.meta.metalWeightGrams)
          : variant?.netWeightGrams != null
            ? n(variant.netWeightGrams)
            : null;

      if (
        (metalWeightGrams == null || Number.isNaN(metalWeightGrams)) &&
        includedStones.length
      ) {
        const sum = includedStones.reduce(
          (acc, s) => acc + (s.netWeightGrams ? Number(s.netWeightGrams) : 0),
          0
        );
        metalWeightGrams = sum > 0 ? sum : null;
      }

      let metalPricePerGram = NaN;
      if (metalType === "GOLD" && !Number.isNaN(goldValue24)) {
        const factor = KARAT_FACTOR[String(karatNum)] ?? KARAT_FACTOR["18"];
        metalPricePerGram = goldValue24 * factor;
      } else if (metalType === "SILVER") metalPricePerGram = silverPricePerGram;
      else if (metalType === "PLATINUM") metalPricePerGram = platinumPricePerGram;
      else if (metalType === "TITANIUM") metalPricePerGram = titaniumPricePerGram;

      let metalCost = 0,
        labourCost = 0,
        metalIncomplete = false;

      if (metalWeightGrams && !Number.isNaN(metalPricePerGram)) {
        metalCost = metalPricePerGram * metalWeightGrams;
        labourCost = LABOUR_RATE[metalType] ?? LABOUR_RATE.GOLD;
      } else metalIncomplete = true;

      const sellingPrice = metalCost + diamondCost + labourCost;
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
    if (!Number.isNaN(minPrice) && (baseOut.sellingPrice === null || baseOut.sellingPrice < minPrice))
      continue;
    if (!Number.isNaN(maxPrice) && (baseOut.sellingPrice === null || baseOut.sellingPrice > maxPrice))
      continue;

    products.push(baseOut);
  }

  return products;
}

// Helper function



export const getProductByModelSku = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    // ----------------- Local types (scoped to this controller) -----------------
    type DefaultValuesDoc = Record<string, any>;

    interface PricingDoc {
      sequence: string;
      selling_price?: number;
      sellingPrice?: number;
      price?: number;
      [key: string]: any;
    }

    interface StoneSeq {
      sequence?: string;
      cts?: number;
      pts?: number;
      pcs?: number;
      [key: string]: any;
    }

    interface Stone {
      netWeightGrams?: number | null;
      sequences?: StoneSeq[];
      cts?: number;
      sequence?: string;
      [key: string]: any;
    }

    interface VariantDoc {
      _id?: any;
      sku?: string;
      meta?: {
        stones?: Stone[];
        metalWeightGrams?: number | string | null;
        netWeightGrams?: number | string | null;
        metalType?: string | null;
        metalKt?: string | number | null;
        engraving?: any;
        [key: string]: any;
      };
      stones?: Stone[];
      metalType?: string | null;
      metalKt?: string | number | null;
      netWeightGrams?: number | string | null;
      images?: any[];
      engraving?: any;
      [key: string]: any;
    }

    interface ProductDoc {
      modelSku?: string;
      seo?: { title?: string };
      title?: string;
      description?: string;
      attributes?: {
        metalTypes?: string[] | string;
        goldKarats?: string[] | string;
        centerStoneShape?: string | string[];
        centerStoneSize?: string | string[];
        diamondColorClarity?: string[] | string;
        diamondShapes?: string[] | string;
        diamondSizes?: string[] | string;
        [key: string]: any;
      };
      engravingDetailIds?: any[];
      engraving?: any;
      variantIds?: string[];
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
    }

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
      candidateNames: string[]
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

    const normalize = (v: any) =>
      v == null ? null : typeof v === "string" ? v.trim() : String(v).trim();

    // ----------------- Helper: Extract metals from image filename -----------------
    const extractOrderedMetalsFromFilename = (url: string): string[] => {
      const name = url.split("/").pop()?.toUpperCase() || "";
      const parts = name.split(/[-_.]/).filter(Boolean);
      return parts.filter((p) =>
        ["WG", "YG", "RG", "BR", "3T"].includes(p)
      );
    };

    // ----------------- NEW: SKU Parser -----------------
    const parseSKU = (sku: string): ParsedSKU => {
      const parts = sku.split("-").map((p) => p.trim());

      const parsed: ParsedSKU = {
        modelSku: parts[0] || "",
        shape: null,
        size: null,
        karat: null,
        diamondType: null,
        clarity: null,
        length: null,
      };

      if (parts.length < 2) return parsed;

      // Part 1: shape (letters only, typically 2-3 chars like EM, RD, PR)
      if (parts[1] && /^[A-Z]{2,4}$/i.test(parts[1])) {
        parsed.shape = parts[1].toUpperCase();
      }

      // Part 2: size (numeric, could be 10, 15, 20, etc.)
      if (parts[2] && /^\d+(\.\d+)?$/.test(parts[2])) {
        parsed.size = parts[2];
      }

      // Part 3: karat (numeric, like 9, 14, 18)
      if (parts[3] && /^\d+$/.test(parts[3])) {
        parsed.karat = parts[3];
      }

      // Part 4: diamond type + clarity (e.g., LGEFVVS, NDGHVS)
      if (parts[4]) {
        const match = parts[4].match(/^(LG|ND)([A-Z]{2,10})$/i);
        if (match) {
          parsed.diamondType = match[1].toUpperCase();
          parsed.clarity = match[2].toUpperCase();
        }
      }

      // Part 5: length (optional, numeric)
      if (parts[5] && /^\d+(\.\d+)?$/.test(parts[5])) {
        parsed.length = parts[5];
      }

      return parsed;
    };

    // ----------------- NEW: Build candidate SKU -----------------
    const buildCandidateSKU = (
      base: ParsedSKU,
      overrides: Partial<ParsedSKU>
    ): string | null => {
      const candidate = { ...base, ...overrides };

      const parts: string[] = [candidate.modelSku];

      if (candidate.shape) parts.push(candidate.shape);
      else return null; // shape is required

      if (candidate.size) parts.push(candidate.size);
      else return null; // size is required

      if (candidate.karat) parts.push(candidate.karat);
      else return null; // karat is required

      if (candidate.diamondType && candidate.clarity) {
        parts.push(`${candidate.diamondType}${candidate.clarity}`);
      } else {
        return null; // diamond info is required
      }

      // length is optional, ignore it for availability checks

      return parts.join("-");
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
        req.query
      )}`
    );

    // ----------------- Load product -----------------
    const ProductModel = getCollectionModel("products");
    const product = (await ProductModel.findOne({
      modelSku,
    }).lean()) as ProductDoc | null;
    if (!product) {
      console.warn(
        `[getProductByModelSku] product not found modelSku=${modelSku}`
      );
      return res
        .status(404)
        .json({ success: false, message: `Model ${modelSku} not found` });
    }
    console.debug(
      `[getProductByModelSku] product loaded id=${(product as any)?._id ?? "unknown"
      }`
    );

    // ----------------- Basic metadata -----------------
    const attributes = product?.attributes ?? {};

    // ----------------- CATEGORY DETECTION -----------------
    const category =
      (product as any)?.category ??
      (product as any)?.meta?.category ??
      null;

    const isPendant =
      typeof category === "string" &&
      category.toUpperCase().startsWith("PENDANT");



    const metalTypes: string[] = Array.isArray(attributes?.metalTypes)
      ? attributes.metalTypes.map(String)
      : attributes?.metalTypes
        ? [String(attributes.metalTypes)]
        : [];

    const goldKarats: string[] = Array.isArray(attributes?.goldKarats)
      ? attributes.goldKarats.map(String)
      : attributes?.goldKarats
        ? [String(attributes.goldKarats)]
        : [];

    let diamondShape: string[] = [];

    if (Array.isArray(attributes?.centerStoneShape)) {
      diamondShape = attributes.centerStoneShape.map(String);
    } else if (
      typeof attributes?.centerStoneShape === "string" &&
      attributes.centerStoneShape.trim() !== ""
    ) {
      diamondShape = [attributes.centerStoneShape.trim()];
    } else {
      // STRICT: if centerStoneShape not present → return nothing
      diamondShape = [];
    }


    let diamondSize: string[] = Array.isArray(attributes?.centerStoneSize)
      ? attributes.centerStoneSize.map(String)
      : Array.isArray(attributes?.diamondSizes)
        ? attributes.diamondSizes.map(String)
        : [];

    const conn = getCatalogConnection();

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
          new Set(diamondOptions[dType][metal])
        );
      }
    }

    // ----------------- diamondColorClarity (STRICT: only after LG or ND) -----------------
    let diamondColorClarity: string[] = [];
    let diamondTypes: string[] = []; // NEW: separate diamond types (LG, ND)
    const variantIdsArr: string[] = Array.isArray(product?.variantIds)
      ? (product.variantIds as any[]).filter((v) => typeof v === "string")
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

    // ----------------- ENGRAVING -----------------
    const engravingIds = Array.isArray(product?.engravingDetailIds)
      ? product.engravingDetailIds
      : [];

    const productEngravingObj =
      product &&
        typeof product.engraving === "object" &&
        product.engraving !== null
        ? product.engraving
        : null;

    const isEngravingFromLegacyArray = engravingIds.length > 0;

    const variantCount = Array.isArray(product?.variantIds)
      ? product.variantIds.length
      : 0;
    const firstVariantSku =
      variantCount > 0 ? (product.variantIds as any[])[0] : null;
    const variantIdParam = (req.query.variantId ?? "").toString().trim();

    // ----------------- Pricing setup (merge multi-doc defaults) -----------------
    const finalPricingColl = conn.collection("final_pricing");
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
      })
    );

    console.debug(
      "[getProductByModelSku] mergedDefaults keys:",
      Object.keys(mergedDefaults)
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
        "[getProductByModelSku] labourDefaults GOLD not found in defaults"
      );
    if (Number.isNaN(labourDefaults.PLATINUM))
      console.debug(
        "[getProductByModelSku] labourDefaults PLATINUM not found in defaults"
      );
    if (Number.isNaN(labourDefaults.SILVER))
      console.debug(
        "[getProductByModelSku] labourDefaults SILVER not found in defaults"
      );
    if (Number.isNaN(labourDefaults.TITANIUM))
      console.debug(
        "[getProductByModelSku] labourDefaults TITANIUM not found in defaults"
      );

    if (Number.isNaN(expenseDefaults.GOLD))
      console.debug(
        "[getProductByModelSku] expenseDefaults GOLD not found in defaults"
      );
    if (Number.isNaN(expenseDefaults.PLATINUM))
      console.debug(
        "[getProductByModelSku] expenseDefaults PLATINUM not found in defaults"
      );
    if (Number.isNaN(expenseDefaults.SILVER))
      console.debug(
        "[getProductByModelSku] expenseDefaults SILVER not found in defaults"
      );
    if (Number.isNaN(expenseDefaults.TITANIUM))
      console.debug(
        "[getProductByModelSku] expenseDefaults TITANIUM not found in defaults"
      );

    if (Number.isNaN(gstPercentDefault))
      console.debug(
        "[getProductByModelSku] gstPercent not found in defaults; defaulting to 0%"
      );

    if (missingDefaults.length) {
      console.warn(
        "[getProductByModelSku] pricing: missing/NaN defaultValues:",
        {
          missingDefaults,
          mergedDefaultsKeys: Object.keys(mergedDefaults),
        }
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

    // ----------------- Variant fetch (sku or ObjectId) -----------------
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
      .collection("variants")
      .findOne({ sku: variantIdParam });

    // ----------------- PENDANT CHAIN INFO -----------------
    let chainOption: string | null = null;
    let chainLengthInches: string | null = null;

    if (isPendant && firstVariantDoc?.meta) {
      chainOption = firstVariantDoc.meta.chainOption ?? null;
      chainLengthInches = firstVariantDoc.meta.chainLengthInches ?? null;
    }


    if (!firstVariantDoc) {
      return res.status(200).json({
        success: true,
        data: "Variant not found for the provided variantId",
      });
    }

    chosenVariantSku =
      firstVariantDoc.sku ??
      (firstVariantDoc._id ? String(firstVariantDoc._id) : null);

    console.debug(
      "[getProductByModelSku] chosenVariantSku:",
      chosenVariantSku,
      "variant found:",
      !!firstVariantDoc
    );

    let title =
      firstVariantDoc?.meta?.title ??
      product?.seo?.title ??
      product?.title ??
      null;

    let description =
      firstVariantDoc?.meta?.description ?? product?.description ?? null;

    // ----------------- Parse the chosen variant SKU -----------------
    const parsedSKU = parseSKU(chosenVariantSku!);
    console.debug("[getProductByModelSku] parsedSKU:", parsedSKU);


    diamondShape = Array.isArray(diamondShape) ? diamondShape : [];
    diamondSize = Array.isArray(diamondSize) ? diamondSize : [];

    // ----------------- IMAGE selection + availableColors -----------------
    let variantImages: string[] = [];
    let availableColors: string[] = [];

    if (firstVariantDoc && Array.isArray(firstVariantDoc.images)) {
      const allImgs = firstVariantDoc.images
        .map((img: any) => img?.url ?? img?.filename ?? img)
        .filter(Boolean)
        .map(String);

      const PRIMARY_METALS = ["WG", "YG", "RG", "BR", "3T"];
      const OTHER_ALLOWED = [
        "NBV",
        "BV",
        "SV",
        "PV",
        "GP",
        "PG",
        "2T",
        "TV",
        "45",
        "FV",
        "EV",
        "BRD",
      ];
      const TOKEN_CANDIDATES = Array.from(
        new Set([...PRIMARY_METALS, ...OTHER_ALLOWED])
      );
      const BARE_GENERIC = new Set([
        "GP",
        "360",
        "NBV",
        "BV",
        "45",
        "EV",
        "TV",
        "FV",
        "SV",
      ]);

      const tokenRegex = (token: string) =>
        new RegExp(`(?:^|[-_\\.\\/])${token}(?:$|[-_\\.\\/])`, "i");

      const basenameNoExt = (url: string) => {
        const name = url.split("/").pop() || "";
        const dot = name.lastIndexOf(".");
        return dot === -1 ? name : name.slice(0, dot);
      };

      const removeBareGeneric = (url: string) =>
        BARE_GENERIC.has(basenameNoExt(url).toUpperCase());

      const detectPrimariesInFilename = (url: string) =>
        PRIMARY_METALS.filter((pm) => tokenRegex(pm).test(url)).map((x) =>
          x.toUpperCase()
        );

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

      const strictPrimaryOnlyMatches = (token: string) => {
        if (!token) return [];
        const re = tokenRegex(token);
        return allImgs.filter((u) => {
          if (removeBareGeneric(u)) return false;
          if (!re.test(u)) return false;
          const primariesFound = detectPrimariesInFilename(u);
          return (
            primariesFound.length === 1 &&
            primariesFound[0] === token.toUpperCase()
          );
        });
      };

      const inclusivePrimaryMatches = (token: string) => {
        if (!token) return [];
        const re = tokenRegex(token);
        return allImgs.filter((u) => !removeBareGeneric(u) && re.test(u));
      };

      const looseMatches = (token: string) => {
        if (!token) return [];
        const up = token.toUpperCase();
        return allImgs.filter(
          (u) => !removeBareGeneric(u) && u.toUpperCase().includes(up)
        );
      };

      const prefiltered = allImgs.filter((u) => !removeBareGeneric(u));

      const normalizeQueryToken = (raw: string | null) => {
        if (!raw) return null;
        const map: Record<string, string> = {
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
          "BLACK-RHODIUM": "BR",
          GP: "GP",
          GOLDPLATED: "GP",
          NBV: "NBV",
          BV: "BV",
          SV: "SV",
          SILVER: "SV",
          BRD: "BRD",
        };
        const k = raw.toString().trim().toUpperCase();
        return map[k] ?? k;
      };

      const metalQueryRaw = (req.query.metal ?? req.query.metalColor ?? "")
        .toString()
        .trim()
        .toUpperCase();
      const requestedToken = normalizeQueryToken(metalQueryRaw);

      if (requestedToken === "3T") {
        variantImages = allImgs.filter((u) =>
          /(?:^|[-_.\/])3T(?:$|[-_.\/])/i.test(u)
        );
      }

      if (requestedToken) {
        const rt = requestedToken.toUpperCase();
        if (PRIMARY_METALS.includes(rt)) {
          variantImages = strictPrimaryOnlyMatches(rt);
          if (variantImages.length === 0)
            variantImages = inclusivePrimaryMatches(rt);
          if (variantImages.length === 0) variantImages = looseMatches(rt);
        } else {
          const re = tokenRegex(rt);
          variantImages = prefiltered.filter((u) => re.test(u));
          if (variantImages.length === 0)
            variantImages = prefiltered.filter((u) =>
              u.toUpperCase().includes(rt)
            );
        }
      }

      if ((!requestedToken || variantImages.length === 0) && chosenVariantSku) {
        const parts = String(chosenVariantSku)
          .split(/[-_]/)
          .map((p) => p.trim().toUpperCase())
          .filter(Boolean);
        const primaryInSku = parts.find((p) => PRIMARY_METALS.includes(p));
        if (primaryInSku) {
          variantImages = strictPrimaryOnlyMatches(primaryInSku);
          if (variantImages.length === 0)
            variantImages = inclusivePrimaryMatches(primaryInSku);
          if (variantImages.length === 0)
            variantImages = looseMatches(primaryInSku);
        } else {
          const otherInSku = parts.find((p) => TOKEN_CANDIDATES.includes(p));
          if (otherInSku) {
            const re = tokenRegex(otherInSku);
            variantImages = prefiltered.filter((u) => re.test(u));
            if (variantImages.length === 0)
              variantImages = prefiltered.filter((u) =>
                u.toUpperCase().includes(otherInSku)
              );
          }
        }
      }

      if (!variantImages || variantImages.length === 0) {
        variantImages = prefiltered.slice(0, 6);
      }

      variantImages = Array.from(new Set(variantImages)).slice(0, 24);
    }

    // =================================================================
    // =============== AVAILABILITY CHECKING LOGIC =====================
    // =================================================================

    const availability: Record<string, Record<string, boolean>> = {
      diamondShape: {},
      diamondSize: {},
      goldKarats: {},
      diamondType: {},
      clarity: {},
      metalColors: {},
    };

    // Helper: check if a variant SKU exists in DB
    const variantExists = async (candidateSKU: string): Promise<boolean> => {
      const exists = await conn
        .collection("variants")
        .findOne({ sku: candidateSKU }, { projection: { _id: 1 } });
      return !!exists;
    };

    // Helper: normalize size (0.15 -> 15, 15 -> 15)
    const normalizeSizeForSKU = (size: string): string => {
      const num = parseFloat(size);
      if (isNaN(num)) return size;

      // If size is like "0.15", convert to "15" (remove leading zero and decimal)
      if (num < 1) {
        return String(Math.round(num * 100));
      }
      return String(Math.round(num));
    };

    // Check diamond shape availability
    for (const shape of diamondShape) {
      const candidate = buildCandidateSKU(parsedSKU, {
        shape: shape.toUpperCase(),
      });
      if (candidate) {
        availability.diamondShape[shape] = await variantExists(candidate);
      } else {
        availability.diamondShape[shape] = false;
      }
    }

    // Check diamond size availability
    for (const size of diamondSize) {
      const normalizedSize = normalizeSizeForSKU(size);
      const candidate = buildCandidateSKU(parsedSKU, { size: normalizedSize });
      if (candidate) {
        availability.diamondSize[size] = await variantExists(candidate);
      } else {
        availability.diamondSize[size] = false;
      }
    }

    // Check gold karat availability
    for (const karat of goldKarats) {
      // Extract just the number (18kt -> 18, 925 -> 925)
      const karatNum = String(karat).match(/\d+/)?.[0] || karat;
      const candidate = buildCandidateSKU(parsedSKU, { karat: karatNum });
      if (candidate) {
        availability.goldKarats[karat] = await variantExists(candidate);
      } else {
        availability.goldKarats[karat] = false;
      }
    }

    // Check diamond type availability (LG, ND)
    for (const dType of diamondTypes) {
      const candidate = buildCandidateSKU(parsedSKU, {
        diamondType: dType.toUpperCase(),
      });
      if (candidate) {
        availability.diamondType[dType] = await variantExists(candidate);
      } else {
        availability.diamondType[dType] = false;
      }
    }

    // Check clarity availability
    for (const clarity of diamondColorClarity) {
      const candidate = buildCandidateSKU(parsedSKU, {
        clarity: clarity.toUpperCase(),
      });
      if (candidate) {
        availability.clarity[clarity] = await variantExists(candidate);
      } else {
        availability.clarity[clarity] = false;
      }
    }

    // Check metal color availability (Option A: query all matching variants)
    // Build pattern: BR15-EM-15-18-LGEFVVS-* (ignoring length)
    const basePattern = buildCandidateSKU(parsedSKU, {});
    if (basePattern) {
      const matchingVariants = await conn
        .collection("variants")
        .find(
          { sku: new RegExp(`^${basePattern.replace(/\*/g, ".*")}`) },
          { projection: { images: 1 } }
        )
        .toArray();

      const allMetalColors = new Set<string>();

      for (const variant of matchingVariants) {
        if (!Array.isArray(variant.images)) continue;

        const imgs = variant.images
          .map((img: any) => img?.url ?? img?.filename ?? img)
          .filter(Boolean)
          .map(String);

        for (const url of imgs) {
          const metals = extractOrderedMetalsFromFilename(url);

          if (metals.includes("3T")) {
            allMetalColors.add("3T");
            continue;
          }

          if (metals.length === 1) {
            allMetalColors.add(metals[0]);
          }

          if (metals.length >= 2) {
            for (let i = 0; i < metals.length - 1; i++) {
              allMetalColors.add(`${metals[i]}-${metals[i + 1]}`);
            }
          }
        }
      }

      // Mark availability for each metal color
      const PRIMARY_METALS = ["WG", "YG", "RG", "BR", "3T"];
      for (const metal of PRIMARY_METALS) {
        availability.metalColors[metal] = allMetalColors.has(metal);
      }

      // Also check multi-tone combinations if present in availableColors
      for (const color of availableColors) {
        if (!availability.metalColors[color]) {
          availability.metalColors[color] = allMetalColors.has(color);
        }
      }
    }

    console.debug("[getProductByModelSku] availability computed:", availability);

    // ----------------- PRICE CALCULATION -----------------
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
        const stonesArr: Stone[] =
          Array.isArray(variant?.meta?.stones) && variant.meta!.stones!.length
            ? variant.meta!.stones!
            : Array.isArray(variant?.stones) && variant.stones!.length
              ? variant.stones!
              : [];

        const includedStones: {
          sequence: string;
          cts: number;
          netWeightGrams: number | null;
        }[] = [];

        for (const st of stonesArr) {
          if (!st) continue;
          if (Array.isArray(st.sequences) && st.sequences.length) {
            for (const s of st.sequences) {
              const sSeq = s?.sequence || null;
              const sCts = typeof s?.cts === "number" ? s.cts : null;
              if (sSeq && sCts != null) {
                includedStones.push({
                  sequence: String(sSeq),
                  cts: sCts,
                  netWeightGrams: st.netWeightGrams ?? null,
                });
              }
            }
          } else {
            const seq = st?.sequence || (st as any).sequenceNo || null;
            const cts = typeof st?.cts === "number" ? st.cts : null;
            if (seq && cts != null) {
              includedStones.push({
                sequence: String(seq),
                cts,
                netWeightGrams: st.netWeightGrams ?? null,
              });
            }
          }
        }

        console.debug("[getProductByModelSku] includedStones:", includedStones);

        const sequences = Array.from(
          new Set(includedStones.map((s) => s.sequence).filter(Boolean))
        );

        type RawPricingDoc = {
          sequence?: unknown;
          selling_price?: unknown;
          sellingPrice?: unknown;
          price?: unknown;
          [k: string]: unknown;
        };

        const pricingMap: Record<string, PricingDoc> = {};
        if (sequences.length) {
          const rawDocs = (await finalPricingColl
            .find({ sequence: { $in: sequences } })
            .toArray()) as RawPricingDoc[];

          console.debug(
            "[getProductByModelSku] pricing rawDocs count:",
            rawDocs.length
          );

          for (const raw of rawDocs) {
            const seq =
              raw && raw.sequence != null ? String(raw.sequence) : null;
            if (!seq) continue;

            const sp1 =
              raw.selling_price !== undefined
                ? toNumberRobust(raw.selling_price)
                : undefined;
            const sp2 =
              raw.sellingPrice !== undefined
                ? toNumberRobust(raw.sellingPrice)
                : undefined;
            const p =
              raw.price !== undefined ? toNumberRobust(raw.price) : undefined;

            const pd: PricingDoc = { sequence: seq };
            if (sp1 !== undefined && !Number.isNaN(sp1)) pd.selling_price = sp1;
            if (sp2 !== undefined && !Number.isNaN(sp2)) pd.sellingPrice = sp2;
            if (p !== undefined && !Number.isNaN(p)) pd.price = p;

            for (const k of Object.keys(raw)) {
              if (
                k === "sequence" ||
                k === "selling_price" ||
                k === "sellingPrice" ||
                k === "price"
              )
                continue;
              (pd as any)[k] = (raw as any)[k];
            }

            pricingMap[seq] = pd;
          }

          console.debug(
            "[getProductByModelSku] resolved pricingMap (raw -> normalized):"
          );
          for (const seq of sequences) {
            const pd = pricingMap[seq];
            if (!pd) {
              console.debug(`  sequence=${seq} -> NOT FOUND in final_pricing`);
              continue;
            }
            const resolved = {
              sequence: seq,
              selling_price_raw: pd.selling_price ?? null,
              sellingPrice_raw: pd.sellingPrice ?? null,
              price_raw: pd.price ?? null,
              chosen_unit_price:
                toNumberRobust(
                  pd.selling_price ?? pd.sellingPrice ?? pd.price
                ) ?? null,
            };
            console.debug("  pricing:", resolved);
          }
        } else {
          console.debug(
            "[getProductByModelSku] no sequences extracted; skipping pricing fetch"
          );
        }

        let diamondCost = 0;
        let diamondIncomplete = false;
        for (const st of includedStones) {
          const pd = pricingMap[st.sequence];
          const pricePerCt = toNumberRobust(
            pd?.selling_price ?? pd?.sellingPrice ?? pd?.price
          );
          if (Number.isNaN(pricePerCt)) {
            diamondIncomplete = true;
            continue;
          }
          diamondCost += pricePerCt * st.cts;
        }

        const skuToCheck = String(
          variant?.sku ?? chosenVariantSku ?? ""
        ).toUpperCase();
        let detectedMetalFromSku: string | null = null;
        if (skuToCheck.includes("SLV")) {
          detectedMetalFromSku = "SILVER";
        } else if (skuToCheck.includes("PT")) {
          detectedMetalFromSku = "PLATINUM";
        } else if (skuToCheck.includes("18") || skuToCheck.includes("9")) {
          detectedMetalFromSku = "GOLD";
        }

        const metalType = (
          detectedMetalFromSku ||
          variant?.meta?.metalType ||
          variant?.metalType ||
          "GOLD"
        )
          .toString()
          .toUpperCase();

        let karatStr: string | number =
          variant?.meta?.metalKt ??
          (Array.isArray(goldKarats) ? goldKarats[0] : goldKarats) ??
          variant?.metalKt ??
          "18";

        const karatNum = Number(
          String(karatStr).match(/\d+/)?.[0] ||
          (metalType === "PLATINUM" ? 950 : 18)
        );

        netWeightGrams = null;
        if (variant?.meta?.metalWeightGrams != null)
          netWeightGrams = toNumberRobust(variant.meta.metalWeightGrams);
        else if (variant?.meta?.netWeightGrams != null)
          netWeightGrams = toNumberRobust(variant.meta.netWeightGrams);
        else if (variant?.netWeightGrams != null)
          netWeightGrams = toNumberRobust(variant.netWeightGrams);

        if (Number.isNaN(netWeightGrams as any)) netWeightGrams = null;

        if (
          (netWeightGrams == null || Number.isNaN(netWeightGrams as any)) &&
          includedStones.length
        ) {
          const sum = includedStones.reduce(
            (acc, s) => acc + (s.netWeightGrams ? Number(s.netWeightGrams) : 0),
            0
          );
          netWeightGrams = sum > 0 ? sum : null;
        }

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
          : LABOUR_RATE[mType] ?? LABOUR_RATE.GOLD;
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
        { modelSku, firstVariantSku }
      );
    }

    // ----------------- ENGRAVING: finalize detection & extraction ----------
    const variantEngravingObj =
      firstVariantDoc &&
        typeof (firstVariantDoc.meta?.engraving ?? firstVariantDoc.engraving) ===
        "object"
        ? firstVariantDoc.meta?.engraving ?? firstVariantDoc.engraving
        : null;

    const finalEngravingObj =
      variantEngravingObj ?? productEngravingObj ?? null;

    const engravingFontSize =
      finalEngravingObj && finalEngravingObj.fontSize != null
        ? (() => {
          const n = toNumberRobust(finalEngravingObj.fontSize);
          return Number.isNaN(n) ? undefined : n;
        })()
        : undefined;

    const engravingMaxCharacters =
      finalEngravingObj && finalEngravingObj.maxCharacters != null
        ? (() => {
          const n = toNumberRobust(finalEngravingObj.maxCharacters);
          return Number.isNaN(n) ? undefined : n;
        })()
        : undefined;

    const isEngraving =
      isEngravingFromLegacyArray ||
      (!!finalEngravingObj &&
        (engravingFontSize !== undefined ||
          engravingMaxCharacters !== undefined));

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
      goldKarats,
      diamondShape,
      diamondSize,
      diamondOptions,
      diamondColorClarity,
      diamondTypes, // NEW: separate array of diamond types
      isEngraving,
      engravingInfo: finalEngravingObj
        ? {
          fontSize:
            engravingFontSize !== undefined ? engravingFontSize : null,
          maxCharacters:
            engravingMaxCharacters !== undefined
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
      availability, // NEW: availability map
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
          (x: any) => Array.isArray(x.images) && x.images.length
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
