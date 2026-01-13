import React from "react";
import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface ServiceCardProps {
  icon: LucideIcon;
  title: string;
  onClick: () => void;
}

export default function ServiceCard({
  icon: Icon,
  title,
  onClick,
}: ServiceCardProps) {
  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow border-2 border-[#328F94]"
      onClick={onClick}
    >
      <CardContent className="p-6 flex justify-center items-center gap-4 text-center">
        <Icon className="h-6 w-6 text-[#328F94]" />
        <h3 className="font-medium">{title}</h3>
      </CardContent>
    </Card>
  );
}
