import express from "express";
import fetch from "node-fetch";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    console.log("🖼️ IMAGE PROXY REQUEST RECEIVED");
    const encodedImageUrl = req.query.url as string;
    if (!encodedImageUrl) {
      return res.status(400).send("Image URL missing");
    }

    // Decode the URL parameter multiple times to handle double/triple encoding
    let imageUrl = encodedImageUrl;
    let previousUrl;
    let decodeCount = 0;
    do {
      previousUrl = imageUrl;
      imageUrl = decodeURIComponent(imageUrl);
      decodeCount++;
    } while (
      imageUrl !== previousUrl &&
      imageUrl.includes("%") &&
      decodeCount < 5
    );

    console.log("🔍 Image proxy request:", {
      encoded: encodedImageUrl,
      decoded: imageUrl,
      decodeCount: decodeCount,
    });

    const response = await fetch(imageUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    });

    console.log("📡 Fetch response:", {
      url: imageUrl,
      status: response.status,
      ok: response.ok,
      contentType: response.headers.get("content-type"),
    });

    if (!response.ok) {
      console.error("❌ Failed to fetch image:", {
        url: imageUrl,
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
      });
      return res
        .status(response.status)
        .send(`Failed to fetch image: ${response.statusText}`);
    }

    const contentType = response.headers.get("content-type");

    res.setHeader("Content-Type", contentType || "image/webp");
    res.setHeader("Access-Control-Allow-Origin", "*");

    response.body.pipe(res);
  } catch (err) {
    console.error("Image proxy error:", err);
    res.status(500).send("Proxy error");
  }
});

export default router;
