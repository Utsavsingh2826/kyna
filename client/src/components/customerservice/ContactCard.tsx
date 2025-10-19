import React from "react";
import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ContactCardProps {
  icon: LucideIcon;
  iconColor: string;
  title: string;
  description: string;
  contact: string;
  contactHref: string;
  buttonText: string;
  buttonColor?: string;
}

export default function ContactCard({
  icon: Icon,
  iconColor,
  title,
  description,
  contact,
  contactHref,
  buttonText,
  buttonColor,
}: ContactCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <Icon className={`h-8 w-8 mx-auto mb-4 ${iconColor}`} />
        <h3 className="font-medium mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground mb-2">{description}</p>
        <p className="font-semibold text-lg mb-4">
          <a href={contactHref} className="hover:underline">
            {contact}
          </a>
        </p>
        <a
          href={contactHref}
          target={contactHref.startsWith("https") ? "_blank" : undefined}
          rel={
            contactHref.startsWith("https") ? "noopener noreferrer" : undefined
          }
        >
          <Button className={`w-full ${buttonColor || ""}`}>
            {buttonText}
          </Button>
        </a>
      </CardContent>
    </Card>
  );
}
