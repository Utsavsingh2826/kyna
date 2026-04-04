import mongoose from 'mongoose';

const n = (v: any): number => {
  if (v == null) return NaN;
  if (typeof v === 'number') return Number.isFinite(v) ? v : NaN;
  if (typeof v === 'string') {
    const cleaned = v.replace(/[₹$,£€\s]/g, '').replace(/,/g, '');
    const num = Number(cleaned);
    return (!Number.isNaN(num) && Number.isFinite(num)) ? num : NaN;
  }
  return NaN;
};

const getModel = (name: string) => {
  const conn = mongoose.connection.useDb(process.env.MONGO_DB_NAME || 'catalog');
  const modelName = `${name}_catalog_feed_v4`;
  if (conn.models[modelName]) return conn.models[modelName];
  return conn.model(modelName, new mongoose.Schema({}, { strict: false, collection: name }), name);
};

export const generateMetaProductFeed = async (): Promise<string> => {
  const Product2 = getModel('products2');
  const Variant2 = getModel('variants2');
  const Pricing = getModel('pricing');
  const conn = mongoose.connection.useDb(process.env.MONGO_DB_NAME || 'catalog');
  
  // 1. Fetch Defaults (Minimal fields)
  let defaultDocs: any[] = [];
  const collNames = ["defaultvalues", "defaultValues", "defaultvalucs"];
  for (const name of collNames) {
    const coll = conn.collection(name);
    defaultDocs = await coll.find({}).toArray();
    if (defaultDocs.length > 0) break;
  }

  const mergedDefaults: Record<string, any> = Object.assign({}, ...defaultDocs.map(d => {
    const { _id, ...rest } = d;
    return rest;
  }));

  const goldValue24 = n(mergedDefaults.goldValue24PerGram || mergedDefaults.goldValue24);
  const gstPercent = n(mergedDefaults.gstValue) || 3;

  // 2. Optimized Fetch (Selected Fields Only)
  console.log('📦 Memory-efficient fetch starting...');
  const products = await Product2.find(
    { isActive: { $ne: false } }, 
    { parentSku: 1, category: 1, title: 1, description: 1 }
  ).lean();
  
  const parentSkus = products.map((p: any) => p.parentSku);
  const variants = await Variant2.find(
    { parentSku: { $in: parentSkus } },
    { parentSku: 1, images: 1, stonePricing: 1, metalKt: 1, netWeightInGrams: 1, sellingPrice: 1, sellingPriceWithGst: 1, expense: 1, title: 1, description: 1 }
  ).lean();
  
  const variantMap = new Map();
  variants.forEach((v: any) => { if (!variantMap.has(v.parentSku)) variantMap.set(v.parentSku, v); });

  const allSequences = new Set<string>();
  variants.forEach((v: any) => {
    if (Array.isArray(v.stonePricing)) {
      v.stonePricing.forEach((s: any) => { if (s.pricingSequence) allSequences.add(s.pricingSequence); });
    }
  });

  const pricingDocs = await Pricing.find(
    { pricingSequence: { $in: Array.from(allSequences) } },
    { pricingSequence: 1, sellingPrice: 1 }
  ).lean();
  const pricingMap = new Map(pricingDocs.map((doc: any) => [doc.pricingSequence, n(doc.sellingPrice)]));

  const baseUrl = process.env.FRONTEND_URL || 'https://kynajewels.com';
  
  // 3. Use Array for memory efficiency
  const xmlParts: string[] = [];
  xmlParts.push(`<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>Kyna Jewels Product Feed</title>
    <link>${baseUrl}</link>
    <description>Memory-optimized product feed for Meta Catalogue</description>`);

  products.forEach((product: any) => {
    const variant = variantMap.get(product.parentSku);
    if (!variant) return;

    const upperImages = (variant.images || []).map((i: any) => ({
      raw: i,
      url: (i?.url || i?.filename || "").toUpperCase(),
    }));

    const imgObj =
      upperImages.find((i: any) => i.url.includes("YG") && i.url.includes("GP")) ||
      upperImages.find((i: any) => i.url.includes("YG") && i.url.includes("FV")) ||
      upperImages.find((i: any) => i.url.includes("YG")) ||
      upperImages[0];

    const imageUrl = imgObj?.raw?.url || imgObj?.raw?.filename || '';

    let stoneTotal = 0;
    if (Array.isArray(variant.stonePricing)) {
      variant.stonePricing.forEach((s: any) => {
        const stoneUnitPrice = pricingMap.get(s.pricingSequence) || 0;
        const cts = n(s.cts);
        if (stoneUnitPrice > 0 && !Number.isNaN(cts)) {
          stoneTotal += (stoneUnitPrice * cts);
        }
      });
    }

    const karatStr = String(variant.metalKt || "").replace(/\D/g, "");
    const factor = karatStr === "18" ? 0.76 : karatStr === "14" ? 0.6 : 1;
    const weight = n(variant.netWeightInGrams);
    const metalCost = (!Number.isNaN(weight) && !Number.isNaN(goldValue24)) ? (weight * factor * goldValue24) : 0;
    
    const subtotal = stoneTotal + metalCost + (n(variant.expense) || 0);
    const finalPrice = Math.round(subtotal * (1 + gstPercent / 100));

    if (finalPrice <= 0) return;

    xmlParts.push(`
    <item>
      <g:id>${product.parentSku}</g:id>
      <g:title><![CDATA[${variant.title || product.title}]]></g:title>
      <g:description><![CDATA[${variant.description || product.description || product.title}]]></g:description>
      <g:link>${baseUrl}/product/${product.parentSku}</g:link>
      <g:image_link>${imageUrl}</g:image_link>
      <g:condition>new</g:condition>
      <g:availability>in stock</g:availability>
      <g:price>${finalPrice} INR</g:price>
      <g:brand>Kyna Jewels</g:brand>
      <g:google_product_category>Apparel &amp; Accessories &gt; Jewelry</g:google_product_category>
      <g:custom_label_0>${product.category || 'Jewelry'}</g:custom_label_0>
      <g:item_group_id>${product.parentSku}</g:item_group_id>
    </item>`);
  });

  xmlParts.push(`
  </channel>
</rss>`);

  console.log('✅ Memory-efficient XML generation complete.');
  return xmlParts.join('');
};
