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
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <CardContent className="p-6 text-center">
        <Icon className="h-8 w-8 mx-auto mb-3 text-primary" />
        <h3 className="font-medium">{title}</h3>
      </CardContent>
    </Card>
  );
}
