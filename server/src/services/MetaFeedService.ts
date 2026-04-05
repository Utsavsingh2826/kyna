import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import { getPricingDefaults, getPricingMap, calculateProductPrice } from './pricingService';

const CHUNK_SIZE = 5000;
const PUBLIC_FEEDS_PATH = path.join(process.cwd(), 'public', 'feeds');

// Meta-compliant character escaping helper
const escapeXml = (str: string) => {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
};

const getModel = (name: string) => {
  const conn = mongoose.connection.useDb(process.env.MONGO_DB_NAME || 'catalog');
  const modelName = `${name}_static_feed_final_v1`;
  if (conn.models[modelName]) return conn.models[modelName];
  return conn.model(modelName, new mongoose.Schema({}, { strict: false, collection: name }), name);
};

export const generateStaticMetaFeed = async () => {
  try {
    if (!fs.existsSync(PUBLIC_FEEDS_PATH)) {
      fs.mkdirSync(PUBLIC_FEEDS_PATH, { recursive: true });
    }

    console.log('🚀 Finalizing Meta Feed with Zero-Verification Safety Filters...');
    const Variant2 = getModel('variants2');
    const baseUrl = (process.env.FRONTEND_URL || 'https://kynajewels.com').replace(/\/$/, "");
    const defaultPlaceholder = "https://cdn.kynajewels.com/placeholder-jewelry.png";

    const defaults = await getPricingDefaults();
    
    const allSequences = await Variant2.distinct('stonePricing.pricingSequence');
    const pricingMap = await getPricingMap(allSequences);

    const cursor = Variant2.find({ isActive: { $ne: false } }).cursor();
    
    let currentChunk = 1;
    let itemCount = 0;
    let fileStream: fs.WriteStream | null = null;
    const chunkFiles: string[] = [];

    const startNewChunk = (chunkNum: number) => {
      const fileName = `meta-feed-${chunkNum}.xml`;
      const filePath = path.join(PUBLIC_FEEDS_PATH, fileName);
      chunkFiles.push(fileName);
      
      const stream = fs.createWriteStream(filePath);
      stream.write(`<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
<channel>
<title>Kyna Jewels Feed Chunk ${chunkNum}</title>
<link>${baseUrl}</link>
<description>Automated product catalog for Meta (Verified Compliance)</description>\n`);
      return stream;
    };

    fileStream = startNewChunk(currentChunk);

    for (let variant = await cursor.next(); variant != null; variant = await cursor.next()) {
      itemCount++;

      if (itemCount % 30000 === 0) {
        console.log(`📈 Progress: ${itemCount.toLocaleString()} items processed...`);
      }

      const metalType = (variant.metalType || variant.metal || "GOLD").toString().toUpperCase();
      let metalColorParam = "YG"; 
      if (metalType === "PLATINUM") metalColorParam = "PT";
      else if (metalType === "SILVER") metalColorParam = "SLV";

      // 🖼️ SECURE IMAGE LOGIC
      const images = Array.isArray(variant.images) ? variant.images : [];
      const upperImages = images.map((i: any) => ({
        raw: i,
        url: (i?.url || i?.filename || "").toUpperCase(),
      }));
      
      const imgObj =
        upperImages.find((i: any) => i.url.includes(metalColorParam) && i.url.includes("GP")) ||
        upperImages.find((i: any) => i.url.includes(metalColorParam) && i.url.includes("FV")) ||
        upperImages.find((i: any) => i.url.includes(metalColorParam)) ||
        upperImages[0];
        
      const imageUrl = escapeXml(imgObj?.raw?.url || imgObj?.raw?.filename || defaultPlaceholder);

      // 💰 ACCURATE PRICING
      const priceResult = calculateProductPrice(variant, defaults, pricingMap);
      const finalPrice = priceResult.total;

      // 🔗 ESCAPED DEEP LINKS
      const category = (variant.category || 'jewellery').toLowerCase();
      const variantSku = variant.variantSku || variant.variantId;
      const deepLink = escapeXml(`${baseUrl}/product/${category}/${variant.parentSku}?variantId=${variantSku}&metalColor=${metalColorParam}`);

      if (finalPrice > 0) {
        // ✍️ CLEANED DESCRIPTION (Max 5000 chars for safety)
        const rawTitle = (variant.title || 'Exquisite Jewelry').substring(0, 150);
        const rawDesc = (variant.description || variant.title || 'Fine jewelry curated by Kyna Jewels').substring(0, 5000);
        
        const itemXml = `  <item>
    <g:id>${variantSku}</g:id>
    <g:item_group_id>${variant.parentSku}</g:item_group_id>
    <g:title><![CDATA[${rawTitle}]]></g:title>
    <g:description><![CDATA[${rawDesc}]]></g:description>
    <g:link>${deepLink}</g:link>
    <g:image_link>${imageUrl}</g:image_link>
    <g:condition>new</g:condition>
    <g:availability>in stock</g:availability>
    <g:price>${finalPrice} INR</g:price>
    <g:brand>Kyna Jewels</g:brand>
    <g:google_product_category>Apparel &amp; Accessories &gt; Jewelry</g:google_product_category>
    <g:custom_label_0>${category.toUpperCase()}</g:custom_label_0>
    <g:custom_label_1>${metalType}</g:custom_label_1>
  </item>\n`;
        fileStream.write(itemXml);
      }

      if (itemCount % CHUNK_SIZE === 0) {
        fileStream.write('</channel>\n</rss>');
        fileStream.end();
        currentChunk++;
        fileStream = startNewChunk(currentChunk);
      }
    }

    if (fileStream) {
      fileStream.write('</channel>\n</rss>');
      fileStream.end();
    }

    await generateMasterIndex(chunkFiles, baseUrl);
    
    console.log(`✅ FINAL GENERATION COMPLETE! ${itemCount} items split into ${currentChunk} files.`);
    return { success: true, itemCount, totalChunks: currentChunk };

  } catch (err) {
    console.error('❌ Static Feed Generation Failed:', err);
    throw err;
  }
};

const generateMasterIndex = async (files: string[], baseUrl: string) => {
  const indexPath = path.join(PUBLIC_FEEDS_PATH, 'index.xml');
  const lastMod = new Date().toISOString();
  
  let indexXml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

  files.forEach(file => {
    indexXml += `
  <sitemap>
    <loc>${baseUrl}/api/marketing/feeds/${escapeXml(file)}</loc>
    <lastmod>${lastMod}</lastmod>
  </sitemap>`;
  });

  indexXml += `\n</sitemapindex>`;
  fs.writeFileSync(indexPath, indexXml);
};
