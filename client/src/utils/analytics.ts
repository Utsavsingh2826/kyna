export const SITE_URL =
  import.meta.env.VITE_SITE_URL || "https://kynajewels.com";

const CURRENCY = "INR";

export interface GA4Item {
  item_id: string;
  item_name: string;
  item_category?: string;
  price: number;
  quantity: number;
}

declare global {
  interface Window {
    dataLayer: Record<string, unknown>[];
  }
}

function pushToDataLayer(payload: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ ecommerce: null });
  window.dataLayer.push(payload);
}

export function trackPageView(pagePath: string, pageTitle?: string) {
  pushToDataLayer({
    event: "page_view",
    page_path: pagePath,
    page_title: pageTitle || document.title,
    page_location: `${SITE_URL}${pagePath}`,
  });
}

export function ga4ViewItemList(
  items: GA4Item[],
  listName: string,
  listId?: string,
) {
  if (items.length === 0) return;
  pushToDataLayer({
    event: "view_item_list",
    ecommerce: {
      item_list_id: listId || listName,
      item_list_name: listName,
      items,
    },
  });
}

export function ga4ViewItem(item: GA4Item, value?: number) {
  pushToDataLayer({
    event: "view_item",
    ecommerce: {
      currency: CURRENCY,
      value: value ?? item.price,
      items: [item],
    },
  });
}

export function ga4AddToCart(item: GA4Item, value?: number) {
  pushToDataLayer({
    event: "add_to_cart",
    ecommerce: {
      currency: CURRENCY,
      value: value ?? item.price * item.quantity,
      items: [item],
    },
  });
}

export function ga4RemoveFromCart(item: GA4Item, value?: number) {
  pushToDataLayer({
    event: "remove_from_cart",
    ecommerce: {
      currency: CURRENCY,
      value: value ?? item.price * item.quantity,
      items: [item],
    },
  });
}

export function ga4ViewCart(items: GA4Item[], value: number) {
  if (items.length === 0) return;
  pushToDataLayer({
    event: "view_cart",
    ecommerce: {
      currency: CURRENCY,
      value,
      items,
    },
  });
}

export function ga4BeginCheckout(items: GA4Item[], value: number) {
  pushToDataLayer({
    event: "begin_checkout",
    ecommerce: {
      currency: CURRENCY,
      value,
      items,
    },
  });
}

export function ga4AddPaymentInfo(items: GA4Item[], value: number) {
  pushToDataLayer({
    event: "add_payment_info",
    ecommerce: {
      currency: CURRENCY,
      value,
      items,
    },
  });
}

export function ga4Purchase(
  transactionId: string,
  value: number,
  items: GA4Item[] = [],
) {
  pushToDataLayer({
    event: "purchase",
    ecommerce: {
      transaction_id: transactionId,
      currency: CURRENCY,
      value,
      items,
    },
  });
}

export function cartItemToGa4Item(item: {
  product?: {
    title?: string;
    category?: string;
    sellingPrice?: number;
    modelSku?: string;
    sku?: string;
    parentSku?: string;
  };
  variantSku?: string;
  productId?: string;
  quantity?: number;
  price?: number;
}): GA4Item {
  const product = item.product;
  return {
    item_id:
      item.variantSku ||
      product?.modelSku ||
      product?.sku ||
      product?.parentSku ||
      item.productId ||
      "unknown",
    item_name: product?.title || "Product",
    item_category: product?.category || "jewelry",
    price: product?.sellingPrice || product?.price || item.price || 0,
    quantity: item.quantity || 1,
  };
}

export function productToGa4Item(
  product: {
    title: string;
    modelSku?: string;
    _id?: string;
    category?: string;
    sellingPrice?: number;
  },
  variantSku?: string,
  categorySlug?: string,
  quantity = 1,
): GA4Item {
  return {
    item_id: variantSku || product.modelSku || product._id || "unknown",
    item_name: product.title,
    item_category: product.category || categorySlug || "jewelry",
    price: product.sellingPrice || 0,
    quantity,
  };
}

export function listingProductToGa4Item(
  product: {
    modelSku: string;
    title: string;
    sellingPrice: number;
  },
  category: string,
): GA4Item {
  return {
    item_id: product.modelSku,
    item_name: product.title,
    item_category: category,
    price: product.sellingPrice,
    quantity: 1,
  };
}

const PENDING_PURCHASE_KEY = "kyna_pending_purchase";

export function storePendingPurchase(data: {
  transactionId: string;
  value: number;
  items: GA4Item[];
}) {
  try {
    sessionStorage.setItem(PENDING_PURCHASE_KEY, JSON.stringify(data));
  } catch {
    // ignore storage errors
  }
}

export function consumePendingPurchase():
  | { transactionId: string; value: number; items: GA4Item[] }
  | null {
  try {
    const raw = sessionStorage.getItem(PENDING_PURCHASE_KEY);
    if (!raw) return null;
    sessionStorage.removeItem(PENDING_PURCHASE_KEY);
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
