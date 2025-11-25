## Wishlist Feature — Frontend ↔ Backend Flow

> Copy/export this file if you want to keep the documentation outside the repo. After that you can delete this file safely.

---

### 1. Overview

The wishlist sits on top of three Redux thunks (`fetchWishlist`, `addWishlistItem`, `removeWishlistItemThunk`) and four REST endpoints:

| HTTP Method | Endpoint | Description |
|-------------|----------|-------------|
| `GET`       | `/api/wishlist`           | Returns all wishlist items for the authenticated user. |
| `POST`      | `/api/wishlist`           | Adds a new entry. Payload includes product/variant info plus a hero image URL (`primaryImage`). |
| `DELETE`    | `/api/wishlist/:itemId`   | Removes a specific entry. |
| `GET`       | `/api/wishlist/check/:productId?variantSku=&metalColorCode=` | (Optional) quick status check. The UI now relies on Redux state, so this endpoint isn’t used in hearts anymore. |

**Important:** Cart no longer sends wishlist requests. Only the hearts on product listing/detail pages talk to these APIs.

---

### 2. Frontend data flow

#### 2.1 Hearts on Product Listing (`client/src/pages/ProductsPage.tsx`)

```tsx
dispatch(
  addWishlistItem({
    productId: product._id,
    modelSku: product.modelSku,
    categorySlug: category,
    categoryLabel: category,
    variantSku: product.firstVariantSku,
    primaryImage: product.firstVariantImageUrl || null,
    price: Number.isFinite(product.sellingPrice)
      ? product.sellingPrice
      : null,
  })
);
```

#### 2.2 Hearts on Product Detail (`client/src/pages/ProductDetail.tsx`)

```tsx
dispatch(
  addWishlistItem({
    productId: productData._id,
    modelSku: productData.modelSku || id || "",
    categorySlug: currentCategorySlug,
    categoryLabel: productData.category || currentCategorySlug,
    variantSku: activeVariantSku,
    metalColorName: selectedMetalColor,
    metalColorCode: currentMetalColorCode,
    primaryImage:
      productData.variantImages?.[selectedImage] ||
      productData.variantImages?.[0] ||
      null,
    price:
      typeof productData.sellingPrice === "number"
        ? productData.sellingPrice
        : typeof productData.priceBreakdown?.totalWithGst === "number"
        ? productData.priceBreakdown.totalWithGst
        : null,
    engraving: hasEngraving ? { text, motif, imageUrl } : undefined,
  })
);
```

Reasons we collect this data up front:

1. Catalog me product aur variant alag collections me hote hain. UI ke paas jo `_id` hota hai woh aksar `catalog.variants` ka hota hai, isliye hum hero image **aur** current price dono payload me bhejte hain taa ki backend ko dubara resolve na karna pade.
2. Snapshot ke through hearts turant fill ho jaate hain aur wishlist page bina extra calls ke image + price dikha deta hai (agar price null hai to hi “Price on request” aayega).

---

### 3. Backend controller (`server/src/controllers/wishlistController.ts`)

#### 3.1 `addToWishlist`

Steps:

1. Validate auth and required fields (`productId`, etc.).
2. Try to load the latest catalog product (`fetchCatalogProduct`) or fallback to the legacy `Product` model. This is still useful for title, price, engraving defaults, etc.
3. Build the document for `WishlistItem`:
   - `productId` → normalized string version of whichever doc we found.
   - `imageSnapshot` → **first priority** is `primaryImage` from the request; then fallback chain: `firstVariantImageUrl`, `images.main`, `variantImages[0]`, etc.
   - `ratingSnapshot`, `priceSnapshot`, category slug, etc. are stored for quick rendering.
4. Return the normalized item (the same structure `GET /wishlist` uses) so the Redux store can update instantly.

#### 3.2 `getWishlist`

* Reads `WishlistItem` entries for the user.
* For each item, tries to hydrate from catalog products (for fresh pricing/title) but **always** falls back to `item.imageSnapshot`/`item.titleSnapshot` if the live doc isn’t found.

