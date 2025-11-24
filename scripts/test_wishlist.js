const fetch = globalThis.fetch || require("node-fetch");
const BASE = "";
const TOKEN =
  "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OTE5YjBhNzhlYmMyODBiM2ViN2RlZjciLCJpYXQiOjE3NjM4Mzg1MjAsImV4cCI6MTc2NDQ0MzMyMH0.0X2iMQCWvOO33xy1REpNct_WCLBP2SmFGQY-7TM4SvA";

async function run() {
  try {
    console.log("1) Fetching current wishlist...");
    let res = await fetch(`${BASE}/api/wishlist`, {
      headers: { Authorization: TOKEN },
    });
    let json = await res.json();
    console.log("GET /api/wishlist ->", res.status, json);

    // If wishlist is empty, pick a product id from products endpoint
    let productId = null;
    if (
      json &&
      json.data &&
      Array.isArray(json.data.wishlist) &&
      json.data.wishlist.length > 0
    ) {
      productId = json.data.wishlist[0]._id || json.data.wishlist[0];
      console.log("Using product from wishlist:", productId);
    } else {
      console.log("Wishlist empty: fetching a product id from products API...");
      res = await fetch(`${BASE}/api/products/category/RINGS?limit=5&page=1`);
      json = await res.json();
      if (json && Array.isArray(json.products) && json.products.length > 0) {
        productId = json.products[0]._id;
        console.log(
          "Picked product id:",
          productId,
          "title:",
          json.products[0].title
        );
      } else {
        throw new Error("No product found to test with");
      }
    }

    if (!productId) throw new Error("No productId available");

    // 2) Check if product is in wishlist
    console.log(
      `2) Checking presence of product ${productId} with /api/wishlist/check/...`
    );
    res = await fetch(`${BASE}/api/wishlist/check/${productId}`, {
      headers: { Authorization: TOKEN },
    });
    console.log("GET /api/wishlist/check ->", res.status, await res.text());

    // 3) Add product to wishlist
    console.log(
      `3) Adding product ${productId} to wishlist (POST /api/wishlist)`
    );
    res = await fetch(`${BASE}/api/wishlist`, {
      method: "POST",
      headers: { Authorization: TOKEN, "Content-Type": "application/json" },
      body: JSON.stringify({ productId, productModel: "Ring" }),
    });
    json = await res.json().catch(() => null);
    console.log("POST /api/wishlist ->", res.status, json);

    // 4) Get wishlist again
    console.log("4) Fetching wishlist after add...");
    res = await fetch(`${BASE}/api/wishlist`, {
      headers: { Authorization: TOKEN },
    });
    json = await res.json();
    console.log("GET /api/wishlist ->", res.status, json);

    // 5) Delete the product from wishlist
    console.log(
      `5) Deleting product ${productId} from wishlist (DELETE /api/wishlist/${productId})`
    );
    res = await fetch(`${BASE}/api/wishlist/${productId}`, {
      method: "DELETE",
      headers: { Authorization: TOKEN },
    });
    json = await res.json().catch(() => null);
    console.log("DELETE ->", res.status, json);

    // 6) Add it back to confirm re-add works
    console.log(`6) Re-adding product ${productId} to wishlist (POST)`);
    res = await fetch(`${BASE}/api/wishlist`, {
      method: "POST",
      headers: { Authorization: TOKEN, "Content-Type": "application/json" },
      body: JSON.stringify({ productId, productModel: "Ring" }),
    });
    json = await res.json().catch(() => null);
    console.log("POST (re-add) ->", res.status, json);

    console.log("Test sequence complete.");
  } catch (err) {
    console.error("ERROR", err && err.message ? err.message : err);
    process.exitCode = 1;
  }
}

run();
