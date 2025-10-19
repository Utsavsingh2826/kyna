import { Card, CardContent } from "@/components/ui/card";

export default function PromosSection() {
  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-4">Promo Codes & Offers</h2>
        <div className="space-y-4">
          <div className="bg-primary/10 p-4 rounded-lg">
            <h3 className="font-medium mb-2">FIRST10</h3>
            <p className="text-muted-foreground text-sm">
              Get 10% off on your first order. Valid for new customers only.
            </p>
          </div>
          <div className="bg-primary/10 p-4 rounded-lg">
            <h3 className="font-medium mb-2">WEDDING20</h3>
            <p className="text-muted-foreground text-sm">
              20% off on engagement rings and wedding bands. Valid until end of
              month.
            </p>
          </div>
          <div className="bg-primary/10 p-4 rounded-lg">
            <h3 className="font-medium mb-2">FREESHIP</h3>
            <p className="text-muted-foreground text-sm">
              Free shipping on orders above ₹25,000. No minimum purchase
              required.
            </p>
          </div>
          <div>
            <h3 className="font-medium mb-2">How to use promo codes?</h3>
            <p className="text-muted-foreground text-sm">
              Enter your promo code at checkout in the "Discount Code" field and
              click apply to see your savings.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
