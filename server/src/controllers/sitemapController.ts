import { Request, Response } from "express";
import mongoose, { Connection, Document, Model } from "mongoose";
import Blog from "../models/blogModel";

const SITE_URL = process.env.FRONTEND_URL?.split(",")[0]?.trim() || "https://kynajewels.com";

const STATIC_PAGES: Array<{ path: string; priority: string; changefreq: string }> = [
  { path: "/", priority: "1.0", changefreq: "daily" },
  { path: "/rings", priority: "0.9", changefreq: "daily" },
  { path: "/earrings", priority: "0.9", changefreq: "daily" },
  { path: "/pendants", priority: "0.9", changefreq: "daily" },
  { path: "/bracelets", priority: "0.9", changefreq: "daily" },
  { path: "/about", priority: "0.6", changefreq: "monthly" },
  { path: "/blogs", priority: "0.7", changefreq: "weekly" },
  { path: "/gifting", priority: "0.7", changefreq: "weekly" },
  { path: "/gifting/gift-card", priority: "0.6", changefreq: "monthly" },
  { path: "/customer-service", priority: "0.5", changefreq: "monthly" },
  { path: "/customer-reviews", priority: "0.6", changefreq: "weekly" },
  { path: "/build-your-jewellery/Gents-Rings", priority: "0.7", changefreq: "weekly" },
  { path: "/build-your-jewellery/Earrings", priority: "0.7", changefreq: "weekly" },
  { path: "/build-your-jewellery/Pendants", priority: "0.7", changefreq: "weekly" },
  { path: "/build-your-jewellery/Bracelets", priority: "0.7", changefreq: "weekly" },
  { path: "/terms-conditions", priority: "0.3", changefreq: "yearly" },
  { path: "/privacy-policy", priority: "0.3", changefreq: "yearly" },
  { path: "/shipping-policy", priority: "0.3", changefreq: "yearly" },
  { path: "/cancellation-refund", priority: "0.3", changefreq: "yearly" },
];

const getCatalogConnection = (): Connection => {
  const dbName = (process.env.MONGO_DB_NAME || "catalog").toString();
  return mongoose.connection.useDb(dbName, { useCache: true });
};

const getCollectionModel = (collectionName: string): Model<Document> => {
  const conn = getCatalogConnection();
  const modelName = `${collectionName}_sitemap_model`;
  if ((conn.models as Record<string, Model<Document>>)[modelName]) {
    return (conn.models as Record<string, Model<Document>>)[modelName];
  }
  const schema = new mongoose.Schema({}, { strict: false, collection: collectionName });
  return conn.model<Document>(modelName, schema, collectionName);
};

function categoryToSlug(category: string): string {
  const normalized = (category || "").toLowerCase();
  if (normalized.includes("earring")) return "earrings";
  if (normalized.includes("pendant")) return "pendants";
  if (normalized.includes("bracelet")) return "bracelets";
  return "rings";
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function formatDate(date?: Date | string): string {
  const d = date ? new Date(date) : new Date();
  return d.toISOString().split("T")[0];
}

function urlEntry(loc: string, lastmod?: Date | string, priority = "0.8", changefreq = "weekly"): string {
  return `  <url>
    <loc>${escapeXml(loc)}</loc>
    <lastmod>${formatDate(lastmod)}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

export const generateSitemap = async (_req: Request, res: Response) => {
  try {
    const VariantModel = getCollectionModel("variants2");
    const productEntries = await VariantModel.aggregate([
      {
        $group: {
          _id: {
            parentSku: "$parentSku",
            category: "$category",
          },
          updatedAt: { $max: "$updatedAt" },
        },
      },
      { $match: { "_id.parentSku": { $exists: true, $ne: null } } },
      { $sort: { "_id.parentSku": 1 } },
    ]).allowDiskUse(true);

    const blogs = await Blog.find({}, { _id: 1, updatedAt: 1, createdAt: 1 })
      .sort({ updatedAt: -1 })
      .lean();

    const urls: string[] = [];

    for (const page of STATIC_PAGES) {
      urls.push(
        urlEntry(`${SITE_URL}${page.path}`, new Date(), page.priority, page.changefreq),
      );
    }

    for (const entry of productEntries) {
      const parentSku = entry?._id?.parentSku;
      if (!parentSku) continue;
      const slug = categoryToSlug(entry?._id?.category || "rings");
      urls.push(
        urlEntry(
          `${SITE_URL}/product/${slug}/${parentSku}`,
          entry.updatedAt,
          "0.8",
          "weekly",
        ),
      );
    }

    for (const blog of blogs) {
      const blogRecord = blog as typeof blog & { updatedAt?: Date };
      urls.push(
        urlEntry(
          `${SITE_URL}/blog/${blog._id}`,
          blogRecord.updatedAt || blog.createdAt,
          "0.6",
          "monthly",
        ),
      );
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;

    res.set("Content-Type", "application/xml");
    res.set("Cache-Control", "public, max-age=3600");
    res.status(200).send(xml);
  } catch (error) {
    console.error("Sitemap generation error:", error);
    res.status(500).send("Failed to generate sitemap");
  }
};
