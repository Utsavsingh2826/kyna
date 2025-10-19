import { useState, useEffect } from "react";
import SEO from "@/components/SEO";
import { ChevronRight, Menu, X } from "lucide-react";

const sections = [
  {
    id: "Shipping-and-Delivery",
    title: "SHIPPING AND DELIVERY",
    subsections: [
      { id: "Domestic", title: "Local (INDIA)" },
    ],
  },
];

export default function TermsAndConditions() {
  const [activeSection, setActiveSection] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100;

      for (const section of sections) {
        const element = document.getElementById(section.id);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (
            scrollPosition >= offsetTop &&
            scrollPosition < offsetTop + offsetHeight
          ) {
            setActiveSection(section.id);
            break;
          }
        }

        for (const subsection of section.subsections) {
          const element = document.getElementById(subsection.id);
          if (element) {
            const { offsetTop, offsetHeight } = element;
            if (
              scrollPosition >= offsetTop &&
              scrollPosition < offsetTop + offsetHeight
            ) {
              setActiveSection(subsection.id);
              break;
            }
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      setSidebarOpen(false);
    }
  };

  const SidebarContent = () => (
    <nav className="space-y-1">
      {sections.map((section) => (
        <div key={section.id}>
          <button
            onClick={() => scrollToSection(section.id)}
            className={`w-full text-left px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              activeSection === section.id
                ? "bg-primary/10 text-primary border-l-2 border-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {section.title}
          </button>
          <div className="ml-4 space-y-1">
            {section.subsections.map((subsection) => (
              <button
                key={subsection.id}
                onClick={() => scrollToSection(subsection.id)}
                className={`w-full text-left px-3 py-1 text-sm rounded-md transition-colors ${
                  activeSection === subsection.id
                    ? "bg-primary/10 text-primary border-l-2 border-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {subsection.title}
              </button>
            ))}
          </div>
        </div>
      ))}
    </nav>
  );

  return (
    <>
      <SEO
        title="Shipping Policy | Kyna Jewellery"
        description="Read our shipping policy to understand your rights and options."
        canonical="/shipping-policy"
      />

      {/* <Navbar /> */}

      <main className="bg-background min-h-screen">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row sm:gap-8 relative">
            {/* Mobile sidebar toggle */}
            <div className="lg:hidden">
              <nav
                aria-label="Breadcrumb"
                className="text-sm text-muted-foreground py-4"
              >
                <a href="/" className="hover:text-foreground">
                  Home
                </a>
                <ChevronRight className="inline w-4 h-4 mx-2" />
                <span>Shipping Policy</span>
              </nav>
              <div className="sticky top-40">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="flex bg-white items-center gap-2 px-4 py-2 text-sm font-medium border border-border rounded-md bg-background hover:bg-muted"
                >
                  <Menu className="w-4 h-4" />
                  Table of Contents
                </button>
              </div>
            </div>

            {/* Desktop Sidebar */}
            <aside className="hidden lg:block w-80 flex-shrink-0">
              <div className="sticky top-20 max-h-[calc(100vh-4rem)] overflow-y-auto">
                <nav
                  aria-label="Breadcrumb"
                  className="text-sm text-muted-foreground py-4"
                >
                  <a href="/" className="hover:text-foreground">
                    Home
                  </a>
                  <ChevronRight className="inline w-4 h-4 mx-2" />
                  <span>Shipping Policy</span>
                </nav>
                <div className="bg-card border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-4">
                    Table of Contents
                  </h3>
                  <SidebarContent />
                </div>
              </div>
            </aside>

            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
              <div className="fixed inset-0 z-50 lg:hidden bg-[#ffff]">
                <div
                  className="fixed inset-0"
                  onClick={() => setSidebarOpen(false)}
                />
                <div className="fixed top-0 left-0 h-full w-80 bg-card border-r border-border p-4 overflow-y-auto">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-lg">Table of Contents</h3>
                    <button
                      onClick={() => setSidebarOpen(false)}
                      className="p-2 hover:bg-muted rounded-md"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <SidebarContent />
                </div>
              </div>
            )}

            {/* Main Content */}
            <div className="flex-1 mt-8 sm:mt-12 max-w-4xl">
              {/* Header */}
              <div className="text-center mb-8">
                <p className="text-sm text-muted-foreground mb-2">
                  Last Update: Feb 16, 2025
                </p>
                <h1 className="text-3xl font-bold">Shipping Policy</h1>
              </div>
              {/* Product Information Section */}
              <section id="shipping-and-delivery" className="mb-12">
                <h2 className="text-2xl font-bold mb-6 text-[#328F94] ">
                  04. SHIPPING AND DELIVERY
                </h2>

                <div id="Domestic" className="mb-8">
                  <h3 className="text-xl font-semibold mb-4">
                    1.	Local (INDIA)
                  </h3>
                  <div className="text-muted-foreground leading-relaxed mb-4">
                    <ul>
                      <li>
                        <p className="font-bold inline">Shipping Methods and Costs: </p>
                        <span>
                          We offer FREE shipping on all orders within India. Our trusted domestic shipping partner is Sequel Global Critical Logistics.
                        </span>
                      </li>
                      <li>
                        <p className="font-bold inline">Delivery Timeframes: </p>
                        <span>
                          Orders shipped within India may take 15 – 30 working days from the date of order placement for delivery. The delivery period mentioned is tentative and based on major cities and primary locations. Deliveries to suburban areas and interiors of India may take longer. Customized orders, such as those with engraving, build your own, or upload your own designs, may also require additional time for processing and delivery.
                        </span>
                      </li>
                      <li>
                        <p className="font-bold inline">Tracking Your Order: </p>
                        <span>
                          Once your order is shipped, you will receive a confirmation email containing a tracking number and a link to track your shipment. You can use this information to monitor the status of your delivery through our shipping partner's website.
                        </span>
                      </li>
                      <li>
                        <p className="font-bold inline">Requirement for ID Proof: </p>
                        <span>
                          Certain logistic partners may require ID proof upon delivery of the shipment to ensure secure delivery. When the original recipient is not available or the shipment value is high, the delivery agent may request ID proof from whoever is collecting the shipment at the mentioned address on behalf of the customer. Acceptable forms of ID include Aadhaar Card, PAN Card, or Passport.
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
