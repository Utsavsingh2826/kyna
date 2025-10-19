import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";

interface PromoSectionProps {
  isOpen: boolean;
}

const promoData = [
  {
    code: "FIRST10",
    description:
      "Get 10% off on your first order. Valid for new customers only.",
  },
  {
    code: "WEDDING20",
    description:
      "20% off on engagement rings and wedding bands. Valid until end of month.",
  },
  {
    code: "FREESHIP",
    description:
      "Free shipping on orders above ₹25,000. No minimum purchase required.",
  },
];

export default function PromoSection({ isOpen }: PromoSectionProps) {
  return (
    <Collapsible open={isOpen}>
      <CollapsibleContent>
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Promo Codes & Offers</h2>
            <div className="space-y-4">
              {promoData.map((promo, index) => (
                <div key={index} className="bg-primary/10 p-4 rounded-lg">
                  <h3 className="font-medium mb-2">{promo.code}</h3>
                  <p className="text-muted-foreground text-sm">
                    {promo.description}
                  </p>
                </div>
              ))}
              <div>
                <h3 className="font-medium mb-2">How to use promo codes?</h3>
                <p className="text-muted-foreground text-sm">
                  Enter your promo code at checkout in the "Discount Code" field
                  and click apply to see your savings.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </CollapsibleContent>
    </Collapsible>
  );
}
