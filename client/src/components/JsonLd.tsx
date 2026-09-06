import { useEffect } from "react";

type JsonLdProps = {
  data: Record<string, unknown>;
  id?: string;
};

export default function JsonLd({ data, id = "json-ld-data" }: JsonLdProps) {
  useEffect(() => {
    const existing = document.getElementById(id);
    if (existing) existing.remove();

    const script = document.createElement("script");
    script.id = id;
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(data);
    document.head.appendChild(script);

    return () => {
      script.remove();
    };
  }, [data, id]);

  return null;
}
