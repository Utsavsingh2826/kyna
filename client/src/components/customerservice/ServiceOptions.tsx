import { Card, CardContent } from "@/components/ui/card";
import { HelpCircle, Gift, Users } from "lucide-react";

export type SectionType = "faqs" | "promos" | "referral" | null;

interface ServiceOptionsProps {
  activeSection: SectionType;
  onToggle: (section: SectionType) => void;
}

export default function ServiceOptions({ onToggle }: ServiceOptionsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
      <Card
        className="cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => onToggle("faqs")}
      >
        <CardContent className="p-6 text-center">
          <HelpCircle className="h-8 w-8 mx-auto mb-3 text-primary" />
          <h3 className="font-medium">FAQs</h3>
        </CardContent>
      </Card>

      <Card
        className="cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => onToggle("promos")}
      >
        <CardContent className="p-6 text-center">
          <Gift className="h-8 w-8 mx-auto mb-3 text-primary" />
          <h3 className="font-medium">Promo Code & Offers</h3>
        </CardContent>
      </Card>

      <Card
        className="cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => onToggle("referral")}
      >
        <CardContent className="p-6 text-center">
          <Users className="h-8 w-8 mx-auto mb-3 text-primary" />
          <h3 className="font-medium">Refer A Friend</h3>
        </CardContent>
      </Card>
    </div>
  );
}
