import { useEffect } from "react";

type SEOProps = {
  title: string;
  description?: string;
  canonical?: string;
};

function upsertMeta(
  name: string,
  content?: string,
  attr: "name" | "property" = "name"
) {
  if (!content) return;
  let el = document.querySelector(
    `meta[${attr}='${name}']`
  ) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

export default function SEO({ title, description, canonical }: SEOProps) {
  useEffect(() => {
    if (title) document.title = title;
    upsertMeta("description", description);
    if (canonical) {
      let link = document.querySelector(
        "link[rel='canonical']"
      ) as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement("link");
        link.setAttribute("rel", "canonical");
        document.head.appendChild(link);
      }
      link.setAttribute("href", canonical);
    }
    // Open Graph basics
    upsertMeta("og:title", title, "property");
    upsertMeta("og:description", description, "property");
    upsertMeta("og:type", "website", "property");
  }, [title, description, canonical]);

  return null;
}
