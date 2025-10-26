import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { HelpCircle, Gift, Users, Phone, MessageCircle } from "lucide-react";
import SEO from "@/components/SEO";
import ServiceCard from "@/components/customerservice/ServiceCard";
import FAQSection from "@/components/customerservice/FAQSection";
import PromoSection from "@/components/customerservice/PromoSection";
import ReferralSection from "@/components/customerservice/ReferralSection";
import ContactCard from "@/components/customerservice/ContactCard";

type SectionType = "faqs" | "promos" | "referral" | null;

export default function CustomerService() {
  const [activeSection, setActiveSection] = useState<SectionType>(null);
  const params = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const toggleSection = (section: SectionType) => {
    setActiveSection(activeSection === section ? null : section);
  };

  useEffect(() => {
    // Prefer route params (pretty URLs) over search params
    const routeSection = params.categorySlug || params.questionSlug ? "faqs" : null;
    const sectionFromQuery = searchParams.get("section");

    if (routeSection) {
      setActiveSection("faqs");
      // map path parameters to search params so FAQSection keeps working
      const newParams = new URLSearchParams(Array.from(searchParams.entries()));
      if (params.categorySlug) newParams.set("category", params.categorySlug);
      if (params.questionSlug) newParams.set("question", decodeURIComponent(params.questionSlug));
      newParams.set("section", "faqs");
      setSearchParams(newParams, { replace: true });
      return;
    }

    if (
      sectionFromQuery === "faqs" ||
      sectionFromQuery === "promos" ||
      sectionFromQuery === "referral"
    ) {
      setActiveSection(sectionFromQuery as SectionType);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params, searchParams]);

  useEffect(() => {
    const url = new URL(window.location.href);
    if (activeSection) {
      url.searchParams.set("section", activeSection);
    } else {
      url.searchParams.delete("section");
    }
    window.history.replaceState({}, "", url.toString());
  }, [activeSection]);

  const serviceOptions = [
    {
      icon: HelpCircle,
      title: "FAQs",
      section: "faqs" as const,
    },
    {
      icon: Gift,
      title: "Promo Code & Offers",
      section: "promos" as const,
    },
    {
      icon: Users,
      title: "Refer A Friend",
      section: "referral" as const,
    },
  ];

  const contactOptions = [
    {
      icon: Phone,
      iconColor: "text-blue-500",
      title: "Call us now",
      description:
        "We are available online from 9:00 AM to 7:00 PM IST\n(+5:30) Talk with us now",
      contact: "+91 8928610682",
      contactHref: "tel:+918928610682",
      buttonText: "Call Now →",
    },
    {
      icon: MessageCircle,
      iconColor: "text-green-500",
      title: "Chat with us",
      description:
        "We are available online from 9:00 AM to 7:00 PM IST\n(+5:30) Talk with us now",
      contact: "enquiries@kynajewels.com",
      contactHref: "https://wa.me/918928610682",
      buttonText: "Contact Us →",
      buttonColor: "bg-green-600 hover:bg-green-700",
    },
  ];

  return (
    <>
      <SEO
        title="Customer Service | Help & Support - Kyna Jewellery"
        description="Get help with your questions about our jewellery, promo codes, and referral program. Contact our customer service team."
        canonical="/customer-service"
      />
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold mb-4">
              What can we assist you with today?
            </h1>
          </div>

          {/* Service Options */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {serviceOptions.map((option) => (
              <ServiceCard
                key={option.section}
                icon={option.icon}
                title={option.title}
                onClick={() => toggleSection(option.section)}
              />
            ))}
          </div>

          {/* Expandable Content Sections */}
          <div className="space-y-6">
            <FAQSection isOpen={activeSection === "faqs"} />
            <PromoSection isOpen={activeSection === "promos"} />
            <ReferralSection isOpen={activeSection === "referral"} />
          </div>

          {/* Contact Section */}
          <div className="mt-16 text-center">
            <h2 className="text-xl font-semibold mb-4">
              Don't find your answer?
            </h2>
            <p className="text-muted-foreground mb-8">Contact with us</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              {contactOptions.map((option, index) => (
                <ContactCard
                  key={index}
                  icon={option.icon}
                  iconColor={option.iconColor}
                  title={option.title}
                  description={option.description}
                  contact={option.contact}
                  contactHref={option.contactHref}
                  buttonText={option.buttonText}
                  buttonColor={option.buttonColor}
                />
              ))}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
