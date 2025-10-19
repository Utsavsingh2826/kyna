import { useState, useEffect } from "react";
import SEO from "@/components/SEO";
import { ChevronRight, Menu, X } from "lucide-react";

const sections = [
  {
    id: "product-information",
    title: "PRODUCT INFORMATION AND DESCRIPTIONS",
    subsections: [
      { id: "accuracy-information", title: "Accuracy of Information" },
      { id: "pricing-policy", title: "Pricing Policy" },
      { id: "product-availability", title: "Availability of Products" },
      { id: "product-policy", title: "Product Policy" },
      { id: "product-care", title: "Product Care and Maintenance Guidelines" },
      {
        id: "health-safety",
        title: "Health and Safety Precautions for Product Use",
      },
      {
        id: "product-safety",
        title: "Product Safety Information and Compliance with Regulations",
      },
    ],
  },
  {
  id: "privacy-security-policies",
  title: "PRIVACY AND SECURITY POLICIES",
  subsections: [
    { id: "privacy-protection-policy", title: "Privacy Protection Policy" },
    { id: "use-of-information", title: "Use of Information" },
    { id: "disclosure-of-personal-data", title: "Disclosure of Personal Data" },
    { id: "cookies", title: "Cookies" },
    { id: "opt-out-privacy-preferences", title: "Opt-Out and Privacy Preferences" },
    { id: "data-protection-commitment", title: "Data Protection Commitment" },
    { id: "consumer-rights", title: "Consumer Rights" },
    { id: "data-retention-usage", title: "Data Retention and Usage Policy" }
  ]
},
{
  id: "legal-disclosures",
  title: "LEGAL DISCLOSURES",
  subsections: [
    { 
      id: "legal-compliance", 
      title: "Legal Compliance and Responsibilities",
      subpoints: [
        "Intellectual Property Rights and Content Usage",
        "External Material & Links",
        "Limitations of Liability",
        "Indemnification",
        "Force Majeure",
        "Termination",
        "Entire Agreement",
        "Fraudulent Transactions"
      ]
    },
    { id: "governing-law", title: "Governing Law and Jurisdiction" },
    { id: "site-changes", title: "Changes to the Site Disclaimer" },
    { id: "modifications-interruptions", title: "Modifications and Interruptions" },
    { id: "corrections-amendments", title: "Corrections and Amendments" }
  ]
}

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
        title="Privacy Policy | Kyna Jewellery"
        description="Read our privacy policy and learn how we handle your personal information."
        canonical="/privacy-policy"
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
                <span>Privacy Policy</span>
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
                  <span>Privacy Policy</span>
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
                <h1 className="text-3xl font-bold">Privacy Policy</h1>
              </div>
              {/* Product Information Section */}
              <section id="product-information" className="mb-12">
                <h2 className="text-2xl font-bold mb-6 text-[#328F94] ">
                  02. PRODUCT INFORMATION AND DESCRIPTIONS
                </h2>

                <div id="accuracy-information" className="mb-8">
                  <h3 className="text-xl font-semibold mb-4">
                    1.Accuracy of Information
                  </h3>
                  <ul className="text-muted-foreground leading-relaxed mb-4 list-disc pl-6">
                    <li>
                      <span className="font-bold">
                        Product Colors and Sizes:
                      </span>{" "}
                      We strive to accurately display the colors and sizes of
                      our products on our website. However, actual colors may
                      vary depending on your monitor or display device. We
                      cannot guarantee that your monitor's display will
                      perfectly reflect the color of the product you receive.
                      Additionally, the packaging of the product may differ from
                      what is shown online.
                    </li>
                    <li>
                      <span className="font-bold">Weight Variations:</span>{" "}
                      During the crafting process of jewellery items such as
                      rings and bracelets, slight variations in metal weight may
                      naturally occur. These differences may lead to the final
                      product weighing slightly more or less than initially
                      estimated, reflecting the unique nature of handcrafted
                      jewellery. For example, if you purchase a gold ring
                      initially estimated to weigh 10 grams, the final weight
                      may be slightly different, such as 9.9 grams or 10.1
                      grams. Similarly, the total weight of diamonds or
                      gemstones may also vary. For instance, if the total weight
                      is estimated to be 2 carats, it could range from 1.99
                      carats to 2.1 carats.
                    </li>
                    <li>
                      <span className="font-bold">
                        Fixed Pricing Assurance:
                      </span>{" "}
                      Please rest assured that the price agreed upon at the time
                      of purchase remains fixed and unchanged. Our rates are
                      determined by considering various factors to ensure smooth
                      operations and fair pricing, regardless of any minor
                      fluctuations in weight due to production process.
                    </li>
                    <li>
                      <span className="font-bold">Consistent Pricing:</span> The
                      metal, diamond, or gemstone weights of jewellery items may
                      vary slightly after crafting (either go higher or lower),
                      but the price will remain unchanged from the amount agreed
                      upon at the time of purchase.{" "}
                      <span className="italic">(DISCLAIMER POP UP)</span>
                    </li>
                  </ul>
                </div>

                <div id="pricing-policy" className="mb-8">
                  <h3 className="text-xl font-semibold mb-4">
                    2.Pricing Policy
                  </h3>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    Prices are quoted in INR and does not include applicable
                    taxes unless otherwise stated. We reserve the right to
                    change prices at any time without prior notice, although
                    such changes will not affect orders that have already been
                    placed and confirmed. Prices may change due to market
                    fluctuations, changes in supply, promotional offers, or
                    other factors. We periodically review and adjust our pricing
                    to remain competitive. Discounts and promotional offers
                    apply only during the specified promotional period and
                    cannot be applied retrospectively or combined with other
                    offers unless explicitly stated. While we strive for
                    accuracy, occasionally errors may occur in the prices listed
                    on our website. We reserve the right to correct any errors
                    and update information without prior notice. If a pricing
                    error is discovered after you have placed an order, we will
                    contact you promptly to reconfirm your order at the correct
                    price or cancel it for a full refund. The prices listed
                    include the cost of the product itself. Additional charges
                    such as shipping fees, taxes, and duties will be calculated
                    and displayed during the checkout process. Depending on the
                    destination of the shipment, your order may be subject to
                    taxes, customs duties, and fees levied by the destination
                    state/country. The recipient of the shipment is responsible
                    for all import-related fees.
                  </p>
                </div>

                <div id="product-availability" className="mb-8">
                  <h3 className="text-xl font-semibold mb-4">
                    3.Availability of Products
                  </h3>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    We strive to maintain accurate and up-to-date information
                    regarding the availability of our products. However, due to
                    the nature of our business, product availability is subject
                    to change without notice. We cannot guarantee that all
                    products will be in stock at all times.
                  </p>
                </div>

                <div id="product-policy" className="mb-8">
                  <h3 className="text-xl font-semibold mb-4">
                    4.Product Policy
                  </h3>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    We strive for precision, commitment to providing accurate
                    and detailed descriptions of our jewellery items please note
                    that slight variations in color, size, weight, and design
                    may occur due to the handcrafted nature of our products.{" "}
                    <br />
                    <br />
                    The colors of our items as displayed on our website may
                    differ from the actual products you receive. This can be
                    attributed to various factors, including natural variations
                    in metals and gemstones, the lighting conditions during
                    viewing (such as artificial and indoor lighting). While we
                    make every effort to accurately represent our products
                    online, the colors you see on your monitor may not perfectly
                    match the actual items upon delivery. Therefore, some minor
                    distinctions in texture and color should be expected.
                  </p>
                </div>

                <div id="product-care" className="mb-8">
                  <h3 className="text-xl font-semibold mb-4">
                    5.Product Care and Maintenance Guidelines
                  </h3>
                  <ul className="text-muted-foreground leading-relaxed mb-4 list-disc pl-6">
                    <li>
                      Avoid contact with chemicals such as chlorine bleach or
                      harsh cleaning agents.
                    </li>
                    <li>
                      Clean your jewellery regularly with a soft brush and mild
                      soap solution, and have them inspected and professionally
                      cleaned annually if further required.
                    </li>
                    <li>
                      These precious metals can tarnish over time due to
                      exposure to air and moisture — store jewellery in a dry
                      place, or in a jewellery box or pouch.
                    </li>
                    <li>
                      Remove jewellery before engaging in activities that could
                      damage it, such as swimming, gardening, or exercising etc.
                    </li>
                    <li>
                      We cannot be held responsible for any damage resulting
                      from failure to follow our care and maintenance
                      guidelines.
                    </li>
                  </ul>
                </div>

                <div id="health-safety" className="mb-8">
                  <h3 className="text-xl font-semibold mb-4">
                    6.Health and Safety Precautions for Product Use
                  </h3>
                  <ul className="text-muted-foreground leading-relaxed mb-4 list-disc pl-6">
                    <li>
                      <span className="font-bold">Allergies:</span> Some
                      individuals may be sensitive or allergic to certain
                      metals. Customers are advised to review product
                      descriptions for metal compositions and consult with a
                      healthcare professional if they have known metal
                      allergies.
                    </li>
                    <li>
                      <span className="font-bold">Choking Hazard:</span> Small
                      parts such as clasps or charms may pose a choking hazard,
                      especially to young children. Keep jewellery out of reach
                      of children and supervise them while wearing or handling
                      jewellery.
                    </li>
                    <li>
                      <span className="font-bold">
                        Health and Safety Disclaimer:
                      </span>{" "}
                      We cannot be held responsible for any damage resulting
                      from failure to follow Health and Safety Precautions for
                      Product Use.
                    </li>
                  </ul>
                </div>

                <div id="product-safety" className="mb-8">
                  <h3 className="text-xl font-semibold mb-4">
                    7.Product Safety Information and Compliance with Regulations
                  </h3>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    Our jewellery complies with industry standards and
                    regulations for safety and quality. We source materials from
                    reputable suppliers and adhere to ethical and sustainable
                    practices. Certifications and guarantees of authenticity are
                    provided for natural diamonds and precious metals. Customers
                    can shop with confidence knowing that our products meet
                    stringent safety and compliance standards.
                  </p>
                </div>
              </section>
              <section id="privacy-security-policies" className="mb-12">
  <h2 className="text-2xl font-bold mb-6 text-[#328F94]">
    02. PRIVACY AND SECURITY POLICIES
  </h2>

  <div id="privacy-protection-policy" className="mb-8">
    <h3 className="text-xl font-semibold mb-4">
      1. Privacy Protection Policy:
    </h3>
    <p className="text-muted-foreground leading-relaxed mb-4">
      This Privacy Policy applies to all users, including users who visit the website or mobile applications without conducting transactions and users who are registered on the website or mobile applications. When you visit our website, we may collect personal information such as your name, email address, phone number, address, and other relevant details. We may also gather non-personal information such as browser type, device information, and IP address for analytics purposes.
    </p>
    <ul className="list-disc pl-6 text-muted-foreground leading-relaxed">
      <li>At Kyna Jewellery, we prioritize compliance with data protection laws to safeguard all information.</li>
      <li>We strictly control the use and transfer of personal data for defined purposes.</li>
      <li>Your data subject rights, including access, rectification, and erasure, are upheld.</li>
      <li>Any data breaches are promptly reported and managed according to legal requirements.</li>
      <li>Personal data is collected and used only for disclosed purposes, ensuring misuse prevention.</li>
      <li>Robust security measures safeguard your personal data from unauthorized access or transfer.</li>
      <li>Data is encrypted during transmission and storage to protect against unauthorized access.</li>
      <li>Regular security assessments are done to maintain the confidentiality, integrity, and secure availability of your data.</li>
    </ul>
  </div>

  <div id="use-of-information" className="mb-8">
    <h3 className="text-xl font-semibold mb-4">2. Use of Information:</h3>
    <p className="text-muted-foreground leading-relaxed mb-4">
      We use your information for various purposes, including:
    </p>
    <ul className="list-disc pl-6 text-muted-foreground leading-relaxed">
      <li>Processing orders, exchange, returns, cancellations, etc.</li>
      <li>Providing customer support.</li>
      <li>Communicating promotions, updates, and exclusive offers related to our products and services.</li>
      <li>Troubleshooting problems, conducting surveys, and e-mail marketing to enhance our services.</li>
      <li>Analyzing demographic and profile data to better understand user activity on our website.</li>
      <li>Utilizing IP addresses to diagnose technical issues, improve website performance, and enhance marketing strategies.</li>
    </ul>
  </div>

  <div id="disclosure-of-personal-data" className="mb-8">
    <h3 className="text-xl font-semibold mb-4">3. Disclosure of Personal Data:</h3>
    <p className="text-muted-foreground leading-relaxed mb-4">
      We do not sell, trade, or otherwise transfer your personal information to outside parties. Your information may be shared with third parties who assist us in operating our website, conducting business activities, for marketing purposes, or servicing you, ensuring they keep your information confidential. We may also disclose your information when required by law or to protect our rights, property, or safety of the company, business partners, or customers, or enforce compliance with our service policies. These disclosures comply with applicable laws and prioritize protecting your privacy.
    </p>
  </div>

  <div id="cookies" className="mb-8">
    <h3 className="text-xl font-semibold mb-4">4. Cookies:</h3>
    <p className="text-muted-foreground leading-relaxed mb-4">
      Cookies are small text files stored in your computer's browser directory or program data subfolders. They are created when you visit a website and are used to track your movements within the site, helping you resume where you left off, remember your login, preferences, and other customization functions. We use cookies to remember useful information, such as items in a shopping cart, and to record browsing activity, including clicks on buttons, logins, and visited pages.
    </p>
  </div>

  <div id="opt-out-privacy-preferences" className="mb-8">
    <h3 className="text-xl font-semibold mb-4">5. Opt-Out and Privacy Preferences:</h3>
    <p className="text-muted-foreground leading-relaxed mb-4">
    Users have the option to opt out of receiving promotional and marketing communications from us at any time. You can manage your communication preferences by accessing your account settings. We respect your choices and aim to provide a personalized and tailored experience based on your preferences.
    </p>
  </div>

  <div id="data-protection-commitment" className="mb-8">
    <h3 className="text-xl font-semibold mb-4">6. Data Protection Commitment:</h3>
    <p className="text-muted-foreground leading-relaxed mb-4">
     At Kyna Jewellery, we prioritize compliance with data protection laws to safeguard all information. We comply with applicable data protection laws and regulations to ensure your rights are respected.
    </p>
  </div>

  <div id="consumer-rights" className="mb-8">
    <h3 className="text-xl font-semibold mb-4">7. Consumer Rights:</h3>
    <p className="text-muted-foreground leading-relaxed mb-4">
      You have the right to request access, correction, or deletion of your personal data. We respect your choices regarding data processing and offer clear opt-out mechanisms.
    </p>
  </div>

  <div id="data-retention-usage" className="mb-8">
    <h3 className="text-xl font-semibold mb-4">8. Data Retention and Usage Policy:</h3>
    <p className="text-muted-foreground leading-relaxed mb-4">
      At Kyna Jewellery, we prioritize the protection and responsible management of your personal data in accordance with applicable privacy laws. We collect personal information, such as name, email address, and phone number, address with others solely for processing orders, providing customer support, and delivering promotional communications related to our jewellery products. We retain your personal data only for as long as necessary to fulfill these purposes or to comply with legal obligations. This retention period includes archiving personal data to meet future tax requirements, exemptions, or to establish, exercise, or defend legal claims. Once we no longer require financial information and other personal information, we securely destroy it. Our Data Retention Policy undergoes periodic updates to reflect changes in data management practices or legal requirements. Additionally, we implement robust security measures to safeguard your data from unauthorized access, alteration, disclosure, or destruction. You have the right to request access, correction, or deletion of your personal data as permitted under applicable privacy laws.
    </p>
  </div>
</section>
<section id="legal-disclosures" className="mb-12">
  <h2 className="text-2xl font-bold mb-6 text-[#328F94]">
    09. LEGAL DISCLOSURES
  </h2>

  <div id="legal-compliance" className="mb-8">
    <h3 className="text-xl font-semibold mb-4">1. Legal Compliance and Responsibilities</h3>

    <p className="font-bold">• Intellectual Property Rights and Content Usage:</p>
    <p className="text-muted-foreground leading-relaxed mb-4">
      We retain all intellectual property rights to the content and services provided on this website, including source code, databases, functionality, software, designs, audio, video, graphics, text, programs, products, processes, technology, images, photographs, illustrations, icons, downloads, and other materials (referred to as "Content"), as well as the trademarks, service marks, and logos (the "Marks") contained therein. Our Content and Marks are protected by intellectual property rights and unfair competition laws, you may only print or download the Content for personal, non-commercial use. No rights, title, or interest in any Content are transferred to you through downloading, printing, or copying. It is strictly prohibited to reproduce, publish, transmit, distribute, display, modify, create derivative works from, sell, or exploit any Content or related software, either in whole or in part. All trademarks, registered marks, service marks, logos, software and others items used on this website are the property of Kyna Jewellery or its licensors/suppliers. Use of these without our prior written consent is strictly prohibited in whole or either part no Content or Marks may be copied, reproduced, aggregated, republished, uploaded, posted, publicly displayed, encoded, translated, transmitted, distributed, sold, licensed, or otherwise exploited for any commercial purpose. We reserve the right to revoke the permission granted to use the Content at any time and for any reason, and you agree to immediately cease any use of the Content upon our request.
    </p>

    <p className="font-bold">• External Material & Links:</p>
    <p className="text-muted-foreground leading-relaxed mb-4">
     The website is provided on an “AS-IS” AND “AS-AVAILABLE BASIS”. You agree that your use of the services/website will be at your sole risk. To the fullest extent permitted by law, we disclaim all warranties, express or implied, in connection with the services and your use thereof, including, without limitation, the implied warranties of merchantability, fitness for a particular purpose, and non- infringement. We make no warranties or representations about the accuracy or completeness of the website' content or the content of, any content or mobile applications linked to our services and we will assume no liability or responsibility for any (1) errors, mistakes, or inaccuracies of content and materials, (2) personal injury or property damage, of any nature whatsoever, resulting from your access to and use of the services/website, (3) any unauthorized access to or use of our secure servers and/or any and all personal information and/or financial information stored therein, (4) any interruption or cessation of transmission to or from the services, (5) any bugs, viruses, Trojan horses, or the like which may be transmitted to or through the services/website by any third party, and/or (6) any errors or omissions in any content and materials or for any loss or damage of any kind incurred as a result of the use of any content posted, transmitted, or otherwise made available via the services/website. We do not warrant, endorse, guarantee, or assume responsibility for any product or service advertised or offered by a third party through the website, any hyperlinked website, or any mobile application featured in any banner or other advertising, and we will not be a party to or in any way be responsible for monitoring any transaction between you and any third-party providers of products or services. As with the purchase of a product or service through any medium or in any environment, you should use your best judgment and exercise caution where appropriate.

    </p>

    <p className="font-bold">• Limitations of Liability:</p>
    <p className="text-muted-foreground leading-relaxed mb-4">
     In no event will we or our directors, employees, or agents be liable to you or any third party for any direct, indirect, consequential, exemplary, incidental, special, or punitive damages, including lost profit, lost revenue, loss of data, or other damages arising from your use of the services, even if we have been advised of the possibility of such damages.
    </p>

    <p className="font-bold">• Indemnification:</p>
    <p className="text-muted-foreground leading-relaxed mb-4">
      By using this website, you agree to indemnify, defend, and hold Kyna Jewellery harmless, including our officers, directors, employees, agents, partners and affiliates from and against any and all claims, damages, losses, liabilities, costs, and expenses (including legal fees) arising from or in connection with your use of the website or any violation of these Terms and Conditions. You acknowledge and accept that Kyna Jewellery shall not be held liable for any such claims, damages, or expenses incurred as a result of your actions or use of the website.
    </p>

    <p className="font-bold">• Force Majeure:</p>
    <p className="text-muted-foreground leading-relaxed mb-4">
     We shall not be held responsible for any delay or failure to fulfil our obligations under these terms and conditions, and we shall not be liable for any resulting loss or damages if such delay or failure is caused by circumstances beyond our control. These circumstances may include, but are not limited to: acts of God, war, civil disturbances, riots, strikes, lockouts, government or parliamentary restrictions, or enactments, changes in applicable laws or regulations, supplier or vendor failures or disruptions, unforeseen technical or operational issues prohibitions, cyberattacks or cybersecurity incidents, pandemics, import or export regulations, exchange control regulations, accidents, or non-availability/delay in transportation etc.
    </p>

    <p className="font-bold">• Termination:</p>
    <p className="text-muted-foreground leading-relaxed mb-4">
      We reserve the right to terminate or suspend your access to and use of the website at any time, without notice. As a result, your access to the website may be denied. This termination will not impose any liability on the company. The termination of your access to the website will not release you from your obligation to pay for any products already ordered from the website, nor will it affect any liabilities that may have arisen under these Terms and Conditions. In addition to other prohibitions as set forth in the Terms of Service, you are prohibited from using the site or its content: (a) for any unlawful purpose; (b) to solicit others to perform or participate in any unlawful acts; (c) to violate any local, international, federal, provincial or state regulations, rules, laws, or local ordinances; (d) to infringe upon or violate our intellectual property rights or the intellectual property rights of others; (e) to harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate based on gender, sexual orientation, religion, ethnicity, race, age, national origin, or disability; (f) to submit false or misleading information; (g) to upload or transmit viruses or any other type of malicious code that will or may be used in any way that will affect the functionality or operation of the Service or of any related website, other websites, or the Internet; (h) to collect or track the personal information of others; (i) to spam, phish, pharm, pretext, spider, crawl, or scrape; (j) for any obscene or immoral purpose; or (k) to interfere with or circumvent the security features of the Service or any related website, other websites, or the Internet. (i) Violating any guidelines or standards established by Kyna Jewellery for user behaviour on the website. We reserve the right to terminate your use of the Service or any related website for violating any of the prohibited uses.
    </p>

    <p className="font-bold">• Entire Agreement:</p>
    <p className="text-muted-foreground leading-relaxed mb-4">
      The failure of us to exercise or enforce any right or provision of these Terms of Service shall not constitute a waiver of such right or provision. These Terms of Service and any policies or operating rules posted by us on this site or in respect to The Service constitutes the entire agreement and understanding between you and us and govern your use of the Service, superseding any prior or contemporaneous agreements, communications and proposals, whether oral or written, between you and us (including, but not limited to, any prior versions of the Terms of Service), any ambiguities in the interpretation of these Terms of Service shall not be construed against the drafting party.
    </p>

    <p className="font-bold">• Fraudulent Transactions:</p>
    <p className="text-muted-foreground leading-relaxed mb-4">
      We retain the right to pursue recovery of the cost of goods, collection charges, and legal fees from individuals engaging in fraudulent activities on the site. Additionally, we reserve the right to commence legal proceedings against such individuals for fraudulent use of the website or any other unlawful acts in violation of these Terms & Conditions. All actions and disputes are subject to the jurisdiction of Mumbai, India.
    </p>
  </div>

  <div id="governing-law" className="mb-8">
    <h3 className="text-xl font-semibold mb-4">2. Governing Law and Jurisdiction</h3>
    <p className="text-muted-foreground leading-relaxed mb-4">
      This website and its services are governed by and construed in accordance with the laws of India. 
Any dispute arising out of or relating to the use of this website shall be subject to the exclusive jurisdiction of the courts located in [Mumbai/ Maharashtra, India] 
By accessing or using this website, you consent to the jurisdiction and venue of such courts for resolving any disputes in any proceedings arising out of this user agreement. The information provided when using the Services is not intended for distribution If you choose to access our Services from a different jurisdiction, you are responsible for complying with local laws that may apply. We advise against accessing our Services from locations where it would be illegal or subject us to registration requirements.
If you have any questions or concerns about these Terms and Conditions, please contact us on 
+91 8928610682 or write to us on enquiries@kynajewels.com 

    </p>
  </div>

  <div id="site-changes" className="mb-8">
    <h3 className="text-xl font-semibold mb-4">3. Changes to the Site Disclaimer</h3>
    <p className="text-muted-foreground leading-relaxed mb-4">
      We may periodically update or modify the information provided on our website to ensure accuracy and relevance. Please note that changes to our site may occur without prior notice. We recommend regularly reviewing to stay informed about any updates. You acknowledge and agree to these potential changes. 
If you have any questions or concerns regarding any terms, please contact us for clarification we respond within one month to your requests please contact us our customer service team call us on +91 8928610682 or write to us on enquiries@kynajewels.com 

    </p>
  </div>

  <div id="modifications-interruptions" className="mb-8">
    <h3 className="text-xl font-semibold mb-4">4. Modifications and Interruptions</h3>
    <p className="text-muted-foreground leading-relaxed mb-4">
      We reserve the right to change, modify, or remove the contents of the Website at any time or for any reason at our sole discretion without notice. We also reserve the right to modify or discontinue all or part of the website without notice at any time. We will not be liable to you or any third party for any modification, price change, suspension, or discontinuance of the website. We cannot guarantee the website will be available at all times because of website maintenance resulting in interruptions delays or errors. We reserve the right to change, revise, update, suspend, discontinue, or otherwise modify the Services and website at any time or for any reason without notice to you.
    </p>
  </div>

  <div id="corrections-amendments" className="mb-8">
    <h3 className="text-xl font-semibold mb-4">5. Corrections and Amendments</h3>
    <p className="text-muted-foreground leading-relaxed mb-4">
      There may be information on the Services that contains typographical errors, inaccuracies, or omissions, including descriptions, pricing, availability, and various other information. We reserve the right to correct any errors, inaccuracies, or omissions and to change or update the information on the Services at any time, without prior notice.
    </p>
  </div>
</section>
<section id="acknowledgment" className="mb-12">
  <h2 className="text-2xl font-bold mb-6 text-[#328F94]">
    3. ACKNOWLEDGMENT
  </h2>

  <div id="user-agreement" className="mb-8">
    <h3 className="text-xl font-semibold mb-4">User Agreement and Acceptance:</h3>
    <p className="text-muted-foreground leading-relaxed mb-4">
      Please read all the terms of use carefully before using this website. If you do not agree to these Terms of Use you may not use this Website.  By using this Website, you signify your explicit assent to this Terms of Use as well as the Website's Policy (which is hereby incorporated by reference herein). Any new features or tools which are added to the current website shall also be subject to the Terms of Service. You can review the most current version of the Terms of Service at any time on this page. These Terms of Use set out the legally binding on terms of services available on the Website as well as at the terms of use of this Website. These Terms of Use along with the Privacy Policy extends to both users, who visit the Website but do not transact business on the Website ("Users/Guests") as well as users who are registered with by the Website to transact business on the Website ("Members"). This Website offers services for Members who wish to purchase diamonds/jewellery for personal consumption, inclusive of, customized and readymade Jewellery.
    </p>
  </div>
</section>


            </div>
          </div>
        </div>
      </main>
    </>
  );
}
