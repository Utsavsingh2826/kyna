import React, { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import faqData from "@/data/faq.json";

interface FAQSectionProps {
  isOpen: boolean;
  categorySlug?: string;
}

export default function FAQSection({ isOpen, categorySlug }: FAQSectionProps) {
  const [openFaqItems, setOpenFaqItems] = useState<{ [key: string]: boolean }>(
    {}
  );

  // Toggle an FAQ item and update the URL query param so the open item can be linked
  const slugify = (s: string) =>
    s
      .toLowerCase()
      .replace(/&/g, "and")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  // Toggle an FAQ item and update the URL query param so the open item can be linked
  const toggleFaqItem = (
    key: string,
    questionText?: string,
    categoryText?: string
  ) => {
    setOpenFaqItems((prev) => {
      const next = { ...prev, [key]: !prev[key] };

      try {
        const params = new URLSearchParams(window.location.search);
        // ensure section stays as faqs when toggling
        params.set("section", "faqs");

        if (next[key]) {
          // opened: set question param to the exact question text
          if (questionText) params.set("question", questionText);
          if (categoryText) params.set("category", slugify(categoryText));
        } else {
          // closed: remove question param but keep category
          params.delete("question");
        }

        const newQuery = params.toString();
        const newUrl = `${window.location.pathname}${newQuery ? `?${newQuery}` : ""}`;
        window.history.replaceState({}, "", newUrl);
      } catch {
        // ignore URL manipulation errors
      }

      return next;
    });
  };

  // Open a category (scroll into view and open its first question)
  const openCategory = (categoryIndex: number, categoryText: string) => {
    const firstKey = `${categoryIndex}-0`;
    setOpenFaqItems((prev) => ({ ...prev, [firstKey]: true }));

    try {
      const params = new URLSearchParams(window.location.search);
      params.set("section", "faqs");
      params.set("category", slugify(categoryText));
      params.delete("question");
      const newUrl = `${window.location.pathname}?${params.toString()}`;
      window.history.replaceState({}, "", newUrl);
    } catch {
      // ignore
    }

    setTimeout(() => {
      const el = document.getElementById(`category-${categoryIndex}`);
      if (el && typeof el.scrollIntoView === "function") {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 120);
  };

  // On mount: if a question param exists, open the matching FAQ item and scroll it into view
  useEffect(() => {
    try {
      // Prefer categorySlug prop if present (from path param)
      if (categorySlug) {
        // allow plus signs in paths and normalize the incoming slug
        const incoming = decodeURIComponent(categorySlug).replace(/\+/g, " ");
        const normalizedIncoming = slugify(incoming);
        for (let c = 0; c < faqData.length; c++) {
          const category = faqData[c];
          const catSlug = slugify(category.category);
          if (catSlug === normalizedIncoming) {
            // open first question for visibility and scroll to category
            const firstKey = `${c}-0`;
            setOpenFaqItems((prev) => ({ ...prev, [firstKey]: true }));
            setTimeout(() => {
              const el = document.getElementById(`category-${c}`);
              if (el && typeof el.scrollIntoView === "function") {
                el.scrollIntoView({ behavior: "smooth", block: "center" });
              }
            }, 120);
            return;
          }
        }
      } else {
        // fallback to query param logic
        const params = new URLSearchParams(window.location.search);
        const questionParam = params.get("question");
        const categoryParam = params.get("category");
        if (questionParam) {
          // find first matching FAQ by exact or partial (case-insensitive) match
          const decoded = decodeURIComponent(questionParam);
          for (let c = 0; c < faqData.length; c++) {
            const category = faqData[c];
            for (let f = 0; f < category.questions.length; f++) {
              const faq = category.questions[f];
              const faqKey = `${c}-${f}`;
              if (
                faq.question.toLowerCase() === decoded.toLowerCase() ||
                faq.question.toLowerCase().includes(decoded.toLowerCase()) ||
                decoded.toLowerCase().includes(faq.question.toLowerCase())
              ) {
                setOpenFaqItems((prev) => ({ ...prev, [faqKey]: true }));
                // scroll into view after a small delay to ensure layout is ready
                setTimeout(() => {
                  const el = document.getElementById(`faq-${faqKey}`);
                  if (el && typeof el.scrollIntoView === "function") {
                    el.scrollIntoView({ behavior: "smooth", block: "center" });
                  }
                }, 120);
                return; // open first match only
              }
            }
          }
        }
        // try category param if no question matched / provided
        if (categoryParam) {
          const incoming = decodeURIComponent(categoryParam).replace(/\+/g, " ");
          const decodedCatSlug = slugify(incoming);
          for (let c = 0; c < faqData.length; c++) {
            const category = faqData[c];
            const slug = slugify(category.category);
            if (slug === decodedCatSlug || category.category.toLowerCase().includes(incoming.toLowerCase()) || incoming.toLowerCase().includes(category.category.toLowerCase())) {
              // open first question for visibility and scroll to category
              const firstKey = `${c}-0`;
              setOpenFaqItems((prev) => ({ ...prev, [firstKey]: true }));
              setTimeout(() => {
                const el = document.getElementById(`category-${c}`);
                if (el && typeof el.scrollIntoView === "function") {
                  el.scrollIntoView({ behavior: "smooth", block: "center" });
                }
              }, 120);
              break;
            }
          }
        }
      }
    } catch {
      // ignore
    }
  }, [categorySlug]);

  return (
    <Collapsible open={isOpen}>
      <CollapsibleContent>
        <div className="space-y-4">
          {faqData.map((category, categoryIndex) => (
            <Card key={categoryIndex} id={`category-${categoryIndex}`}>
              <CardContent className="p-6">
                <h2
                  role="button"
                  tabIndex={0}
                  onClick={() => openCategory(categoryIndex, category.category)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ")
                      openCategory(categoryIndex, category.category);
                  }}
                  className="text-lg font-semibold mb-4 cursor-pointer"
                >
                  {category.category}
                </h2>
                <div className="space-y-2">
                  {category.questions.map((faq, faqIndex) => {
                    const faqKey = `${categoryIndex}-${faqIndex}`;
                    const isItemOpen = openFaqItems[faqKey];
                    return (
                      <div id={`faq-${faqKey}`}
                        key={faqIndex}
                        className="border border-border rounded-lg"
                      >
                        <button
                          onClick={() => toggleFaqItem(faqKey, faq.question, category.category)}
                          className={`w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors ${
                            isItemOpen ? "text-white" : ""
                          }`}
                          style={
                            isItemOpen ? { backgroundColor: "#328F94" } : {}
                          }
                        >
                          <span className="font-medium pr-4">
                            {faq.question}
                          </span>
                          <Plus
                            className={`h-4 w-4 flex-shrink-0 transition-transform ${
                              isItemOpen ? "rotate-45" : ""
                            }`}
                          />
                        </button>
                        {isItemOpen && (
                          <div className="px-4 pb-4">
                            <div className="bg-primary/5 p-4 rounded-lg">
                              <p className="text-sm text-muted-foreground leading-relaxed">
                                {faq.answer}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
