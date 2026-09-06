import { useEffect } from "react";

const SITE_URL =
  import.meta.env.VITE_SITE_URL || "https://kynajewels.com";

type SEOProps = {
  title: string;
  description?: string;
  canonical?: string;
  image?: string;
  type?: "website" | "product" | "article";
  noindex?: boolean;
};

function toAbsoluteUrl(pathOrUrl: string): string {
  if (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")) {
    return pathOrUrl;
  }
  return `${SITE_URL}${pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`}`;
}

function upsertMeta(
  name: string,
  content?: string,
  attr: "name" | "property" = "name",
) {
  if (!content) return;

  let el = document.querySelector(
    `meta[${attr}='${name}']`,
  ) as HTMLMetaElement | null;

  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }

  el.setAttribute("content", content);
}

function upsertLink(rel: string, href: string) {
  let el = document.querySelector(
    `link[rel='${rel}']`,
  ) as HTMLLinkElement | null;

  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }

  el.setAttribute("href", href);
}

export default function SEO({
  title,
  description,
  canonical,
  image,
  type = "website",
  noindex = false,
}: SEOProps) {
  useEffect(() => {
    if (title) document.title = title;

    upsertMeta("description", description);
    upsertMeta(
      "robots",
      noindex ? "noindex, nofollow" : "index, follow",
    );

    const absoluteCanonical = canonical
      ? toAbsoluteUrl(canonical)
      : `${SITE_URL}${window.location.pathname}`;

    upsertLink("canonical", absoluteCanonical);

    upsertMeta("og:title", title, "property");
    upsertMeta("og:description", description, "property");
    upsertMeta("og:type", type, "property");
    upsertMeta("og:url", absoluteCanonical, "property");
    upsertMeta("og:site_name", "Kyna Jewels", "property");

    upsertMeta("twitter:card", "summary_large_image", "property");
    upsertMeta("twitter:title", title, "property");
    upsertMeta("twitter:description", description, "property");
    upsertMeta("twitter:url", absoluteCanonical, "property");

    const absoluteImage = image ? toAbsoluteUrl(image) : `${SITE_URL}/logo.png`;
    upsertMeta("og:image", absoluteImage, "property");
    upsertMeta("og:image:width", "1200", "property");
    upsertMeta("og:image:height", "630", "property");
    upsertMeta("twitter:image", absoluteImage, "property");
  }, [title, description, canonical, image, type, noindex]);

  return null;
}

export { SITE_URL, toAbsoluteUrl };
