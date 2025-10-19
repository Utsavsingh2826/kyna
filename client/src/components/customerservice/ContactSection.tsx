import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Phone, MessageCircle } from "lucide-react";

export default function ContactSection() {
  return (
    <div className="mt-16 text-center">
      <h2 className="text-xl font-semibold mb-4">Don't find your answer?</h2>
      <p className="text-muted-foreground mb-8">Contact with us</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
        <Card>
          <CardContent className="p-6">
            <Phone className="h-8 w-8 mx-auto mb-4 text-blue-500" />
            <h3 className="font-medium mb-2">Call us now</h3>
            <p className="text-sm text-muted-foreground mb-2">
              We are available online from 9:00 AM to 7:00 PM IST
              <br />
              (+5:30) Talk with us now
            </p>
            <p className="font-semibold text-lg mb-4">+91 8928610682</p>
            <Button className="w-full">Call Now →</Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <MessageCircle className="h-8 w-8 mx-auto mb-4 text-green-500" />
            <h3 className="font-medium mb-2">Chat with us</h3>
            <p className="text-sm text-muted-foreground mb-2">
              We are available online from 9:00 AM to 7:00 PM IST
              <br />
              (+5:30) Talk with us now
            </p>
            <p className="font-semibold text-lg mb-4">
              enquiries@kynajewels.com
            </p>
            <Button className="w-full bg-green-600 hover:bg-green-700">
              Contact Us →
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
