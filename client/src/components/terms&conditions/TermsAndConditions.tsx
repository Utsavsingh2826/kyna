import { useState, useEffect } from "react";
import SEO from "@/components/SEO";
import { ChevronRight, Menu, X } from "lucide-react";
import { title } from "process";

const sections = [
  {
    id: "website-usage-policies",
    title: "WEBSITE USAGE POLICIES",
    subsections: [
      { id: "user-registration", title: "User Registration and Knowledge" },
      {
        id: "user-representations",
        title: "User Representations and Responsibilities",
      },
      { id: "security-measures", title: "Security Measures and Precautions" },
      { id: "content-usage", title: "Website Content Usage Guidelines" },
      {
        id: "user-generated-content",
        title: "User-Generated Content Guidelines",
      },
      { id: "reviews-feedback", title: "Submission of Reviews and Feedback" },
    ],
  },
  {
    id: "loyalty-programs-promotions",
    title: "LOYALTY PROGRAMS AND PROMOTIONS",
    subsections: [
      {
        id: "extension-privileges-promos",
        title: "Extension of Privileges / Promos",
      },
      {
        id: "gift-cards",
        title: "Gift Cards",
      },
      {
        id: "loyalty-points",
        title: "Loyalty Points",
      },
      {
        id: "friends-family-discount",
        title: "Friends & Family Discount",
      },
      {
        id: "referral-discount",
        title: "Referral Discount",
      },
      {
        id: "design-your-own-jewellery",
        title: "Design Your Own Jewellery",
      },
    ],
  },
  {
    id: "customer-service-support",
    title: "CUSTOMER SERVICE AND SUPPORT",
    subsections: [
      { id: "contact-information", title: "Contact Information" },
      {
        id: "hours-of-operation",
        title: "Hours of Operation for Customer Service",
      },
      {
        id: "resolving-customer-inquiries",
        title: "Process for Resolving Customer Inquiries and Complaints",
      },
    ],
  },
  {
    id: "terms-conditions-metals",
    title:
      "Terms and Conditions for Kyna Jewellery - Metals (Gold, Silver, Platinum, Diamond)",
    subsections: [
      { id: "gold-jewelry", title: "Gold Jewelry" },
      { id: "silver-jewelry", title: "Silver Jewelry" },
      { id: "platinum-jewelry", title: "Platinum Jewelry" },
      { id: "diamond-jewelry", title: "Diamond Jewelry" },
      { id: "metal-alloy-combination", title: "Metal Alloy Combination" },
      { id: "metal-variations", title: "Metal Variations" },
      { id: "care-and-maintenance", title: "Care and Maintenance" },
      {
        id: "warranty-and-defects",
        title: "Warranty for Metal-Related Defects",
      },
      {
        id: "returns-and-exchanges",
        title: "Returns and Exchanges for Metal Jewelry",
      },
    ],
  },
  {
    id: "terms-conditions-repolishing",
    title: "Terms and Conditions – Free Lifetime Repolishing for Tarnish",
    subsections: [
      { id: "eligibility", title: "Eligibility" },
      { id: "exclusions", title: "Exclusions" },
      { id: "service-process", title: "Service Process" },
      { id: "care-recommendations", title: "Care Recommendations" },
      { id: "limitations", title: "Limitations" },
      { id: "modification-of-terms", title: "Modification of Terms" },
    ],
  },
  {
    id: "terms-conditions-packaging",
    title: "Terms and Conditions – Packaging",
    subsections: [
      { id: "shipping-partner", title: "Shipping Partner" },
      { id: "insurance-and-liability", title: "Insurance and Liability" },
      { id: "packaging-security", title: "Packaging and Security" },
      { id: "delivery-acceptance", title: "Delivery and Acceptance" },
      { id: "returns-refunds", title: "Returns and Refunds" },
      { id: "customer-responsibilities", title: "Customer Responsibilities" },
      {
        id: "governing-law-jurisdiction",
        title: "Governing Law and Jurisdiction",
      },
    ],
  },
  {
    id: "terms-conditions-product-collection-nominee",
    title: "Terms and Conditions - Product Collection by a Nominee",
    subsections: [
      { id: "introduction", title: "Introduction" },
      { id: "authorization-of-nominee", title: "Authorization of Nominee" },
      {
        id: "identification-and-verification",
        title: "Identification and Verification",
      },
      { id: "security-and-liability", title: "Security and Liability" },
      { id: "timeframe-for-collection", title: "Timeframe for Collection" },
      {
        id: "collection-from-sequel-logistics-store",
        title: "Collection from Sequel Logistics or Store",
      },
      {
        id: "governing-law-jurisdiction",
        title: "Discrepancies and Disputes",
      },
    ],
  },
  {
    id: "terms-conditions-engraved-products",
    title: "Terms and Conditions – Engraved Products",
    subsections: [
      {
        id: "customization-and-personalization",
        title: "Customization and Personalization",
      },
      { id: "production-timeline", title: "Production Timeline" },
      { id: "returns-and-refunds-engraved", title: "Returns & Refunds Policy" },
      { id: "customer-responsibility", title: "Customer Responsibility" },
      {
        id: "intellectual-property",
        title: "Intellectual Property and Messaging",
      },
      { id: "limitation-of-liability", title: "Limitation of Liability" },
      { id: "cancellations-engraved", title: "Cancellations" },
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
        title="Terms & Conditions | Kyna Jewellery"
        description="Read our terms and conditions, website usage policies, and product information guidelines."
        canonical="/terms-conditions"
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
                <span>Terms & Conditions</span>
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
                  <span>Terms & Conditions</span>
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
                <h1 className="text-3xl font-bold">Terms & Conditions</h1>
              </div>

              {/* Website Usage Policies Section */}
              <section id="website-usage-policies" className="mb-12">
                <h1 className="text-2xl text-[#328F94] font-bold mb-6">
                  01. WEBSITE USAGE POLICIES
                </h1>

                <div id="user-registration" className="mb-8">
                  <h3 className="text-xl font-semibold mb-4">
                    1.User Registration and Knowledge{" "}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    Users may register on the website to become members prior to
                    the completion of any transaction on the website. Guest
                    checkouts will be provided with a user account on completion
                    of purchase. To register onto our website, the user will
                    have to provide personal information (as defined in the
                    privacy policy), including but not limited name, e-mail,
                    contact number, address, etc. Registration is only a
                    one-time process and if the member has previously
                    registered, he/she shall login/ sign into his/her account.
                    We prioritize the security and confidentiality of user
                    information. The personal information collected during
                    registration is handled in accordance with our privacy
                    policy, which outlines how we collect, use, store, and
                    protect user data. We encourage users to review the privacy
                    policy for detailed information on data handling practices
                    and their rights concerning their personal information. By
                    registering and becoming a member, users acknowledge and
                    agree to comply with the terms and conditions outlined in
                    our website's user agreement and privacy policy.
                  </p>
                </div>

                <div id="user-representations" className="mb-8">
                  <h3 className="text-xl font-semibold mb-4">
                    2. User Representations and Responsibilities
                  </h3>
                  <h3 className="text-xl text-[#328F94]  font-semibold mb-4">
                    Cultural Sensitivity{" "}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    At Kyna Jewellery, we uphold cultural sensitivity by
                    respecting diverse audiences and promoting inclusivity in
                    all our marketing and communications. We prioritize cultural
                    awareness and sensitivity in every interaction, ensuring our
                    marketing materials and product representations are
                    respectful and inclusive. We aim to use culturally
                    appropriate imagery and language in our marketing campaigns
                    to celebrate and honour the diversity of our global
                    community. By fostering cultural sensitivity, we strive to
                    create a welcoming and respectful environment where everyone
                    feels valued and represented.
                  </p>
                  <h3 className="text-xl text-[#328F94]  font-semibold mb-4">
                    Prohibited Activities and Conduct{" "}
                  </h3>
                  <ul className="text-muted-foreground leading-relaxed mb-4 list-disc pl-6">
                    <li>
                      Use the Services/website only for their intended purposes
                      and refrain from engaging in commercial activities unless
                      expressly authorized by us.
                    </li>
                    <li>
                      Do not retrieve data from the Services/website to create
                      collections or directories without our written permission.
                    </li>
                    <li>
                      Do not attempt to trick, defraud, or mislead us or other
                      users to obtain sensitive account information.
                    </li>
                    <li>
                      Do not circumvent or interfere with security features of
                      the Services/website.
                    </li>
                    <li>
                      Avoid actions that may disparage or harm us or the
                      Services/website.
                    </li>
                    <li>
                      Do not use information obtained from the Services/website
                      to harass or harm others.
                    </li>
                    <li>
                      Do not misuse support services or submit false reports.
                    </li>
                    <li>
                      Comply with all applicable laws and regulations when using
                      the Services & website.
                    </li>
                    <li>
                      Do not engage in unauthorized framing or linking to the
                      Services/website.
                    </li>
                    <li>
                      Refrain from uploading viruses or interfering with the
                      Services' operation.
                    </li>
                    <li>
                      Do not use automated scripts or tools to interact with the
                      Services/website.
                    </li>
                    <li>
                      Do not delete copyright notices or impersonate other
                      users.
                    </li>
                    <li>
                      Avoid uploading or transmitting spyware or similar
                      mechanisms.
                    </li>
                    <li>
                      Do not disrupt or burden the Services/website or
                      associated networks.
                    </li>
                    <li>Do not harass or threaten our employees or agents.</li>
                    <li>
                      Do not attempt to bypass access restrictions or copy the
                      Services' software.
                    </li>
                    <li>
                      Do not decipher, decompile, or reverse engineer the
                      Services' software.
                    </li>
                    <li>
                      Do not use automated systems to access or interact with
                      the Services/website.
                    </li>
                    <li>
                      Do not collect usernames or email addresses for
                      unsolicited emails.
                    </li>
                    <li>
                      Forgery of TCP/IP packet headers or email information.
                    </li>
                    <li>
                      Do not use the Services/website for commercial purposes
                      without authorization.
                    </li>
                    <li>
                      Avoid using the Services to distribute spam, chain
                      letters, pyramid schemes, or other forms of unsolicited or
                      unauthorized advertising.
                    </li>
                    <li>
                      Avoid engaging in any activities that could disrupt the
                      normal operation of the Services or cause harm to our
                      infrastructure.
                    </li>
                  </ul>
                </div>

                <div id="security-measures" className="mb-8">
                  <h3 className="text-xl font-semibold mb-4">
                    3.Security Measures and Precautions
                  </h3>
                  <ul className="text-muted-foreground leading-relaxed mb-4 list-disc pl-6">
                    <li>
                      We have implemented strict security measures to protect
                      your information from loss, alteration, and misuse.
                    </li>
                    <li>
                      Our website utilizes secure servers to store and safeguard
                      your personal account information.
                    </li>
                    <li>
                      Once your information is in our possession, we adhere to
                      security guidelines to prevent unauthorized access.
                    </li>
                    <li>
                      Avoid engaging in any form of cyberbullying, harassment,
                      or intimidation towards other users or our staff.
                    </li>
                    <li>
                      Refrain from using automated tools or bots that may
                      disrupt the normal functioning of the website or Services.
                    </li>
                    <li>
                      Do not engage in any activities that violate the privacy
                      or personal data of other users.
                    </li>
                    <li>
                      Respect intellectual property rights and refrain from
                      using any copyrighted material without proper
                      authorization.
                    </li>
                    <li>
                      Do not engage in activities that could compromise the
                      integrity or availability of our systems or networks.
                    </li>
                    <li>
                      Avoid attempting to gain unauthorized access to sensitive
                      or confidential information, including financial data or
                      proprietary information.
                    </li>
                    <li>
                      Refrain from sharing your account credentials or allowing
                      unauthorized individuals to access your account.
                    </li>
                    <li>
                      Report any security concerns or suspicious activities to
                      our support team immediately.
                    </li>
                    <li>
                      Be cautious when clicking on links or downloading
                      attachments from unknown or suspicious sources.
                    </li>
                  </ul>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    Kyna Jewellery prioritizes safety and trust for all
                    customers. These guidelines and precautions are essential
                    for ensuring the safety, security, and fair use of our
                    services. Violations of system or network security or
                    services may lead to civil or criminal liability,
                    emphasizing the importance of adhering to these measures for
                    the benefit of all users. We take any violations of our
                    security measures seriously and will cooperate with law
                    enforcement authorities to prosecute individuals involved in
                    such activities.
                  </p>
                </div>

                <div id="content-usage" className="mb-8">
                  <h3 className="text-xl font-semibold mb-4">
                    4.Website Content Usage Guidelines
                  </h3>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    All content on this website, including text, images,
                    graphics, and logos, is the property of Kyna Jewellery.
                    Users may view, download, and print content for personal use
                    only. Commercial use, reproduction, or distribution of any
                    content without explicit written permission from Kyna
                    Jewellery is strictly prohibited. Unauthorized use may
                    result in legal action. For inquiries regarding content
                    usage, please contact us at +91 8928610682 or write to us on{" "}
                    <a
                      href="mailto:info@akynajewels.com"
                      className="underline text-[#328F94]"
                    >
                      info@akynajewels.com
                    </a>
                  </p>
                </div>

                <div id="user-generated-content" className="mb-8">
                  <h3 className="text-xl font-semibold mb-4">
                    5.User-Generated Content Guidelines
                  </h3>
                  <ul>
                    <li>
                      Blogs: By submitting any content, including customer
                      stories, videos, images, testimonials, user-generated
                      content, reviews, and #KynaJewellery stories ("Content"),
                      to Kyna Jewellery, you grant us Kyna Jewellery a
                      non-exclusive, worldwide, royalty-free, perpetual,
                      irrevocable, and fully sub licensable right to use,
                      reproduce, modify, adapt, publish, translate, create
                      derivative works from, distribute, and display such
                      Content in any form, media, or technology. This includes
                      using the Content on our website, social media channels,
                      marketing materials, advertisements, and any other
                      promotional or communication materials related to Kyna
                      Jewellery. Your submission of content signifies your
                      consent to these terms. We reserve the right to edit or
                      remove any content at our discretion. This grant of rights
                      allows Kyna Jewellery to promote, market, and showcase the
                      Content across various platforms without any compensation
                      or attribution to you.
                    </li>
                  </ul>
                  <p className="text-muted-foreground leading-relaxed mb-2 font-bold">
                    Review Guidelines:
                  </p>
                  <ul className="text-muted-foreground leading-relaxed mb-4 list-disc pl-6">
                    <li>
                      Have first-hand experience with the person/entity being
                      reviewed.
                    </li>
                    <li>
                      Avoid offensive, profane, racist, or hateful language.
                    </li>
                    <li>
                      Refrain from discriminatory references based on religion,
                      race, gender, national origin, age, marital status, sexual
                      orientation, or disability etc.
                    </li>
                    <li>Do not reference illegal activities.</li>
                    <li>
                      Avoid affiliation with competitors when posting negative
                      reviews.
                    </li>
                    <li>Refrain from making legal conclusions.</li>
                    <li>Do not post false or misleading statements.</li>
                    <li>
                      Do not organize campaigns encouraging others to post
                      reviews, positive or negative.
                    </li>
                  </ul>
                  <p>
                    We reserve the right to accept, reject, or remove reviews
                    any comments made at our discretion without obligation.
                    Reviews are not endorsed by us and do not necessarily
                    reflect our opinions or those of our affiliates. We do not
                    assume liability for any review or related claims. By
                    posting a review, any comments etc. you grant us Kyna
                    Jewellery the right to reproduce, modify, translate,
                    transmit, display, perform, or distribute its content
                    worldwide.
                  </p>
                </div>

                <div id="reviews-feedback" className="mb-8">
                  <h3 className="text-xl font-semibold mb-4">
                    6.Submission of Reviews and Feedback
                  </h3>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    By directly sending us any question, comment, suggestion,
                    idea, feedback, or other information about the Services
                    ("Submissions"), you agree to assign to us all intellectual
                    property rights in such Submission. You agree that we shall
                    own this Submission and be entitled to its unrestricted use
                    and dissemination for any lawful purpose, commercial or
                    otherwise, without acknowledgment or compensation to you.
                    The Services may invite you to chat, contribute, or
                    participate in blogs, message boards, online forums, and
                    other functionality during which you may create, submit,
                    post, display, transmit, publish, distribute, or broadcast
                    content and materials to us or through the Services,
                    including but not limited to text, writings, video, audio,
                    photographs, music, graphics, comments, reviews, rating
                    suggestions, personal information, or other material
                    ("Contributions"). Any Submission that is publicly posted
                    shall also be treated as a Contribution. You understand that
                    Contributions may be viewable by other users of the Services
                    and possibly through third-party websites. When you post
                    Contributions, you grant us a license (including use of your
                    name, trademarks, and logos): By posting any Contributions,
                    you grant us an unrestricted, unlimited, irrevocable,
                    perpetual, non-exclusive, transferable, royalty-free,
                    fully-paid, worldwide right, and license to: use, copy,
                    reproduce, distribute, sell, resell, publish, broadcast,
                    retitle, store, publicly perform, publicly display,
                    reformat, translate, excerpt (in whole or in part), and
                    exploit your Contributions (including, without limitation,
                    your image, name, and voice) for any purpose, commercial,
                    advertising, or otherwise, to prepare derivative works of,
                    or incorporate into other works, your Contributions, and to
                    sublicense the licenses granted in this section. Our use and
                    distribution may occur in any media formats and through any
                    media channels. Kyna Jewellery holds sole ownership of these
                    rights, titles, and interests and is unrestricted in their
                    use, whether commercial or otherwise. You may agree and
                    confirm that any comments, suggestions, reviews, or feedback
                    you submit to Kyna Jewellery's website must not violate, not
                    contain unlawful, threatening, abusive, or obscene material,
                    software viruses, political campaigning, commercial
                    solicitation, chain letters, mass emails, or any form of
                    spam. Kyna Jewellery reserves the right (but not the
                    obligation) to monitor, edit, or remove any comments
                    submitted to the website. You agree not to use a false email
                    address, impersonate any person or entity, or mislead as to
                    the origin of your comments. Kyna Jewellery reserves the
                    right to terminate or restrict your access to the website if
                    you violate these terms regarding comments, suggestions, or
                    feedback.
                  </p>
                </div>
              </section>

              {/* 02.	LOYALTY PROGRAMS AND PROMOTIONS */}
              {/* <section id="loyalty-programs-and-promotions" className="mb-12">
                <h2 className="text-2xl font-bold mb-4">Loyalty Programs and Promotions</h2>
                <p className="text-sm text-muted-foreground">
                  Kyna Jewellery may offer loyalty programs and promotions to
                  reward our customers for their continued support. These programs
                  may include discounts, special offers, and exclusive access to
                  new products or events. Participation in these programs may be
                  subject to additional terms and conditions, which will be
                  provided at the time of enrollment or participation.
                </p>
              </section> */}
              <section id="loyalty-programs-promotions" className="mb-12">
                <h2 className="text-2xl font-bold mb-6 text-[#328F94]">
                  06. LOYALTY PROGRAMS AND PROMOTIONS
                </h2>

                <div id="extension-privileges-promos" className="mb-8">
                  <h3 className="text-xl font-semibold mb-4">
                    Extension of Privileges / Promos
                  </h3>

                  <div id="gift-cards" className="mb-6">
                    <h4 className="text-lg font-semibold mb-3">
                      1. Gift Cards
                    </h4>
                    <ul className="text-muted-foreground leading-relaxed mb-4 list-disc pl-6">
                      <li>
                        Gift Card(s) can be redeemed across the Website and
                        Mobile site, or mobile apps.
                      </li>
                      <li>
                        Gift Card(s) can be redeemed on the purchase of any
                        jewellery products.
                      </li>
                      <li>
                        On the payment page, click on the tab "Gift Card" and
                        enter your Gift Card number and pin for redemption.
                      </li>
                      <li>
                        Multiple Gift Cards can be used to make a payment in a
                        single transaction.
                      </li>
                      <li>
                        Gift Card(s) can be combined with any other payment
                        type.
                      </li>
                      <li>
                        Gift Card(s) once bought online, shall be considered as
                        sold and cannot be Cancelled, Exchanged or Refunded.
                      </li>
                      <li>
                        Gift card(s) can also be redeemed partially, as many
                        times as a user wishes to, till its balance is consumed
                        or it expires.
                      </li>
                      <li>
                        Gift cards are valid for a period of one year from the
                        date of issuance to the recipient.
                      </li>
                      <li>
                        Gift cards cannot be used to purchase another Gift Card.
                      </li>
                      <li>
                        If lost or misused, the Gift Card(s) cannot be replaced.
                      </li>
                      <li>
                        Gift cards are void if resold and cannot be exchanged
                        for credit(s) or cash and cannot be re-validated once
                        past the expiry date.
                      </li>
                    </ul>
                  </div>

                  <div id="loyalty-points" className="mb-6">
                    <h4 className="text-lg font-semibold mb-3">
                      2. Loyalty Points
                    </h4>
                    <ul className="text-muted-foreground leading-relaxed mb-4 list-disc pl-6">
                      <li>
                        For every purchase made on the website, the customer is
                        entitled to get loyalty points.
                      </li>
                      <li>1% of value before GST will be added as points.</li>
                      <li>
                        1 point will be equivalent to 1 rupee at the time of
                        redemption.
                      </li>
                      <li>
                        Loyalty Points cannot be clubbed with any other offer.
                      </li>
                      <li>
                        Loyalty points are applicable on all products and will
                        be valid for 3 years only.
                      </li>
                    </ul>
                  </div>

                  <div id="friends-family-discount" className="mb-6">
                    <h4 className="text-lg font-semibold mb-3">
                      3. Friends & Family Discount
                    </h4>
                    <ul className="text-muted-foreground leading-relaxed mb-4 list-disc pl-6">
                      <li>15% discount on the total jewellery value.</li>
                      <li>
                        The discount value will be added to the customer account
                        under credits and can be availed at the time of
                        purchasing any product.
                      </li>
                      <li>
                        Valid until one year from the date of receipt of advance
                        on order confirmation.
                      </li>
                      <li>
                        This offer can't be combined and redeemed with any other
                        ongoing offer or discount.
                      </li>
                      <li>
                        This offer is non-transferable to any other individual
                        and can be availed by the person making the purchase.
                      </li>
                    </ul>
                  </div>

                  <div id="referral-discount" className="mb-6">
                    <h4 className="text-lg font-semibold mb-3">
                      4. Referral Discount
                    </h4>
                    <ul className="text-muted-foreground leading-relaxed mb-4 list-disc pl-6">
                      <li>
                        5% discount on the total jewellery value in case another
                        customer purchases on the website through a
                        reference/referral code.
                      </li>
                      <li>
                        The discount value will be added to the customer account
                        under credits and can be availed at the time of
                        purchasing any product.
                      </li>
                      <li>
                        Valid until one year from the date of receipt of advance
                        on order confirmation.
                      </li>
                      <li>
                        This offer can't be combined and redeemed with any other
                        ongoing offer or discount.
                      </li>
                      <li>
                        This offer is non-transferable to any other individual
                        and can be availed by the person making the purchase.
                      </li>
                    </ul>
                  </div>

                  <div id="design-your-own-jewellery" className="mb-6">
                    <h4 className="text-lg font-semibold mb-3">
                      5. Design Your Own Jewellery
                    </h4>
                    <ul className="text-muted-foreground leading-relaxed mb-4 list-disc pl-6">
                      <li>
                        If a customer cancels a “Design your own jewellery”
                        order before production starts (within 2 days), the
                        whole amount will be refunded to the customer.
                      </li>
                      <li>
                        Cancellation request after 2 days will not be accepted
                        or entertained.
                      </li>
                    </ul>
                  </div>
                </div>
              </section>

              <section id="customer-service-support" className="mb-12">
                <h2 className="text-2xl font-bold mb-6 text-[#328F94]">
                  03. CUSTOMER SERVICE AND SUPPORT
                </h2>

                <div id="contact-information" className="mb-8">
                  <h3 className="text-xl font-semibold mb-4">
                    1. Contact Information:
                  </h3>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    For any assistance, our dedicated customer support team is
                    available via:
                  </p>
                  <ul className="text-muted-foreground leading-relaxed mb-4 list-disc pl-6">
                    <li>Phone: +91 8928610682</li>
                    <li>Email: info@akynajewels.com</li>
                    <li>
                      Live Chat: Accessible through our website during
                      operational hours.
                    </li>
                  </ul>
                </div>

                <div id="hours-of-operation" className="mb-8">
                  <h3 className="text-xl font-semibold mb-4">
                    2. Hours of Operation for Customer Service:
                  </h3>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    Our customer service operates during the following hours:
                  </p>
                  <ul className="text-muted-foreground leading-relaxed mb-4 list-disc pl-6">
                    <li>Monday to Friday: 9 a.m. to 6 p.m. IST</li>
                    <li>
                      Please note that timings may vary on holidays and special
                      occasions.
                    </li>
                  </ul>
                </div>

                <div id="resolving-customer-inquiries" className="mb-8">
                  <h3 className="text-xl font-semibold mb-4">
                    3. Process for Resolving Customer Inquiries and Complaints:
                  </h3>
                  <ul className="text-muted-foreground leading-relaxed mb-4 list-disc pl-6">
                    <li>
                      Upon receipt, the inquiry/complaint is logged into our
                      system.
                    </li>
                    <li>
                      A member of our customer support team promptly
                      acknowledges receipt of the inquiry/complaint.
                    </li>
                    <li>
                      Our dedicated team thoroughly investigates the matter to
                      understand the root cause of the issue.
                    </li>
                    <li>
                      This may involve gathering additional information from the
                      customer, reviewing relevant records, or consulting with
                      other departments.
                    </li>
                    <li>
                      Based on the investigation, a resolution plan is
                      formulated.
                    </li>
                    <li>
                      The plan may include corrective actions, refunds,
                      replacements, or other appropriate measures to address the
                      customer's concerns.
                    </li>
                    <li>
                      We keep the customer informed throughout the process,
                      providing regular updates on the status of their
                      inquiry/complaint.
                    </li>
                    <li>
                      Once the resolution plan is finalized, it is implemented
                      promptly.
                    </li>
                    <li>
                      After the resolution has been implemented, we follow up
                      with the customer to ensure their satisfaction.
                    </li>
                    <li>
                      We encourage feedback on the resolution process, allowing
                      us to continually improve our services and prevent similar
                      issues in the future.
                    </li>
                    <li>
                      The entire resolution process is documented for future
                      reference and analysis.
                    </li>
                    <li>
                      Once the inquiry/complaint has been satisfactorily
                      resolved and the customer is content, the case is marked
                      as closed in our system.
                    </li>
                    <li>
                      Any claim for non-receipt of a product or empty box will
                      be entertained only if submitted within 24 hours of
                      receipt along with an unboxing video which includes the
                      original outer seal. Send the video via WhatsApp within 24
                      hours of receiving the product.
                    </li>
                    <li>We provide resolution within 7 - 10 working days.</li>
                  </ul>
                </div>
              </section>

              <section id="terms-conditions-metals" className="mb-12">
                <div id="gold-jewelry">
                  <h2 className="text-2xl font-bold mb-6 text-[#328F94]">
                    Gold Jewelry
                  </h2>
                  <ul className="text-muted-foreground leading-relaxed mb-4 list-disc pl-6">
                    <li>
                      Gold Content: All gold jewelry offered by Kyna Jewellery
                      is crafted from high-quality gold. Our gold items are made
                      with a minimum purity of 14K unless specified otherwise in
                      the product description.
                    </li>
                    <li>
                      Gold Plating: Some of our jewelry items may feature gold
                      plating over silver or other metals. This plating is
                      applied to enhance the appearance of the item, but over
                      time, it may wear off due to regular use
                    </li>
                    <li>
                      Gold Color Options: Kyna Jewellery offers various gold
                      colors, including yellow, white, and rose gold. The color
                      of the gold may vary slightly due to the unique nature of
                      each batch and alloy mixture.
                    </li>
                    <li>
                      Gold Care:To maintain the quality and shine of your gold
                      jewelry, we recommend regular cleaning and avoiding
                      exposure to harsh chemicals, water, or perfumes. Store
                      your gold jewelry in a soft cloth pouch or jewelry box to
                      prevent scratching.
                    </li>
                  </ul>
                </div>
                <div id="silver-jewelry">
                  <h2 className="text-2xl font-bold mb-6 text-[#328F94]">
                    Silver jewellery
                  </h2>
                  <ul className="text-muted-foreground leading-relaxed mb-4 list-disc pl-6">
                    <li>
                      Silver Content: Kyna Jewellery uses sterling silver (92.5%
                      pure silver) for the majority of our silver jewelry
                      pieces. Some items may include additional alloy metals to
                      provide strength and durability.
                    </li>
                    <li>
                      Tarnishing: Silver jewelry may tarnish over time due to
                      exposure to air, moisture, or chemicals. Tarnishing is a
                      natural occurrence and does not indicate poor quality.
                      Regular cleaning with a silver polishing cloth can restore
                      its shine.
                    </li>
                    <li>
                      Tarnishing: Silver jewelry may tarnish over time due to
                      exposure to air, moisture, or chemicals. Tarnishing is a
                      natural occurrence and does not indicate poor quality.
                      Regular cleaning with a silver polishing cloth can restore
                      its shine.
                    </li>
                  </ul>
                </div>
                <div id="platinum-jewelry">
                  <h2 className="text-2xl font-bold mb-6 text-[#328F94]">
                    Platinum jewellery
                  </h2>
                  <ul className="text-muted-foreground leading-relaxed mb-4 list-disc pl-6">
                    <li>
                      Platinum Purity: All platinum jewelry from Kyna Jewellery
                      is made with a minimum purity of 95%. Platinum is known
                      for its rarity, strength, and long-lasting quality.
                    </li>
                    <li>
                      Platinum Maintenance: Platinum does not tarnish in the
                      same way as silver, but it can develop a natural patina
                      over time. This patina is a characteristic of platinum and
                      adds to its unique appearance. If you prefer a high-gloss
                      finish, polishing can be done to restore the original
                      shine.
                    </li>
                    <li>
                      Durability: Platinum is highly durable and resistant to
                      wear, making it an ideal choice for everyday jewelry.
                      However, as with all metals, it may still accumulate
                      scratches over time, which can be buffed out by a
                      professional jeweler.
                    </li>
                  </ul>
                </div>
                <div id="diamond-jewelry">
                  <h2 className="text-2xl font-bold mb-6 text-[#328F94]">
                    Diamond jewellery
                  </h2>
                  <ul className="text-muted-foreground leading-relaxed mb-4 list-disc pl-6">
                    <li>
                      Diamond Setting: Kyna Jewellery offers diamonds set in a
                      variety of precious metals, including gold, silver, and
                      platinum. The metal choice can affect the appearance,
                      durability, and overall value of the jewelry.
                    </li>
                    <li>
                      Diamond Care: Diamonds are extremely durable but can be
                      chipped or scratched if exposed to harsh impacts. We
                      recommend cleaning your diamond jewelry regularly with a
                      soft cloth and avoiding exposure to chlorine or other
                      harsh chemicals.
                    </li>
                    <li>
                      Diamond Quality: All diamonds used in Kyna Jewellery
                      pieces are carefully selected for their quality. We
                      provide details regarding the cut, color, clarity, and
                      carat weight of each diamond in the product description.
                    </li>
                  </ul>
                </div>
                <div id="metal-alloy-combination">
                  <h2 className="text-2xl font-bold mb-6 text-[#328F94]">
                    Metal Alloy Combinations
                  </h2>
                  <ul className="text-muted-foreground leading-relaxed mb-4 list-disc pl-6">
                    <li>
                      Alloying Metals:To ensure durability and workability, we
                      may use various metal alloys in the crafting of our
                      jewelry. This includes the use of copper, silver,
                      palladium, and other elements, which are carefully blended
                      to enhance the strength, color, and finish of the final
                      piece.
                    </li>
                    <li>
                      Hypoallergenic Options: Our gold and platinum jewelry is
                      designed to minimize the likelihood of allergic reactions.
                      However, some individuals may have sensitivities to
                      specific alloys. If you have known allergies to certain
                      metals, we recommend contacting our customer service for
                      guidance on suitable options.
                    </li>
                  </ul>
                </div>
                <div id="metal-variations">
                  <h2 className="text-2xl font-bold mb-6 text-[#328F94]">
                    Metal Variations
                  </h2>
                  <ul className="text-muted-foreground leading-relaxed mb-4 list-disc pl-6">
                    <li>
                      Natural Metal Variations: Each metal, whether gold,
                      silver, or platinum, may have slight color variations due
                      to its natural composition and the methods used in
                      crafting the jewelry. These variations do not affect the
                      quality of the piece.
                    </li>
                    <li>
                      Customization and Metal Choices: Kyna Jewellery offers
                      customization options for certain jewelry pieces, where
                      you may choose from different metals, such as gold,
                      silver, or platinum, based on your personal preferences.
                      Please note that customization may affect the price and
                      lead time.
                    </li>
                  </ul>
                </div>
                <div id="care-and-maintenance">
                  <h2 className="text-2xl font-bold mb-6 text-[#328F94]">
                    Care and Maintenance
                  </h2>
                  <ul className="text-muted-foreground leading-relaxed mb-4 list-disc pl-6">
                    <li>
                      General Metal Care: To prolong the beauty and longevity of
                      your jewelry, avoid exposure to harsh chemicals, excessive
                      heat, or rough environments. Regular maintenance and
                      professional cleaning will help preserve the brilliance of
                      your jewelry.
                    </li>
                    <li>
                      Professional Inspection: We recommend having your jewelry
                      inspected by a professional jeweler periodically,
                      especially if it contains diamonds, to ensure the settings
                      and metal are intact.
                    </li>
                  </ul>
                </div>
                <div id="warranty-and-defects">
                  <h2 className="text-2xl font-bold mb-6 text-[#328F94]">
                    Warranty for Metal-Related Defects
                  </h2>
                  <ul className="text-muted-foreground leading-relaxed mb-4 list-disc pl-6">
                    <li>
                      Warranty Coverage: Kyna Jewellery offers a limited
                      warranty for defects in metal craftsmanship under normal
                      use for 15 days from the date of purchase.The warranty
                      covers issues such as loose settings, broken clasps, or
                      manufacturing defects in the metal.
                    </li>
                    <li>
                      Exclusions: The warranty does not cover damage caused by
                      misuse, accidental damage, tarnishing, or natural wear and
                      tear of the metal.
                    </li>
                  </ul>
                </div>
                <div id="returns-and-exchanges">
                  <h2 className="text-2xl font-bold mb-6 text-[#328F94]">
                    Returns and Exchanges for Metal Jewelry
                  </h2>
                  <ul className="text-muted-foreground leading-relaxed mb-4 list-disc pl-6">
                    <li>
                      Return Policy: Due to the nature of precious metals,
                      returns or exchanges on jewelry are accepted under certain
                      conditions, such as defects or damage upon receipt. For
                      more information on our return policy, please refer to our
                      general terms and conditions.
                    </li>
                    <li>
                      Non-Refundable Metals: Custom-made pieces, including those
                      crafted in specific metal choices, may not be eligible for
                      return or exchange unless defective
                    </li>
                  </ul>
                </div>
              </section>

              <section id="terms-conditions-repolishing">
                <h2 className="text-2xl font-bold mb-6 text-[#328F94]">
                  Repolishing Services
                </h2>
                <div id="eligibility">
                  <h2 className="text-2xl font-bold mb-6 text-black">
                    1 Eligibility:
                  </h2>
                  <ul className="text-muted-foreground leading-relaxed mb-4 list-disc pl-6">
                    <li>
                      Free lifetime repolishing is available only for tarnishing
                      of gold-plated silver jewellery.
                    </li>
                    <li>
                      Jewellery must pass QC inspection before approval for
                      repolishing.
                    </li>
                  </ul>
                </div>
                <div id="exclusions">
                  <h2 className="text-2xl font-bold mb-6 text-black">
                    2 Exclusions:
                  </h2>
                  <ul className="text-muted-foreground leading-relaxed mb-4 list-disc pl-6">
                    <li>
                      The service does not cover physical damage, stone loss, or
                      general wear and tear.
                    </li>
                    <li>
                      Scratches, dents, or structural damage are excluded.
                    </li>
                  </ul>
                </div>
                <div id="service-process">
                  <h2 className="text-2xl font-bold mb-6 text-black">
                    3 Service Process:
                  </h2>
                  <ul className="text-muted-foreground leading-relaxed mb-4 list-disc pl-6">
                    <li>
                      Customers must bring or send their jewellery for QC
                      inspection.
                    </li>
                    <li>
                      If approved, repolishing will be performed free of charge.
                    </li>
                    <li>
                      If rejected, repolishing or repairs may be available at an
                      additional cost.
                    </li>
                  </ul>
                </div>
                <div id="care-recommendations">
                  <h2 className="text-2xl font-bold mb-6 text-black">
                    4 Care Recommendations:
                  </h2>
                  <ul className="text-muted-foreground leading-relaxed mb-4 list-disc pl-6">
                    <li>
                      Customers should follow proper care instructions to
                      maintain the gold plating.
                    </li>
                    <li>
                      Excessive exposure to moisture, sweat, or chemicals may
                      reduce plating longevity.
                    </li>
                  </ul>
                </div>
                <div id="limitations">
                  <h2 className="text-2xl font-bold mb-6 text-black">
                    5 Limitations:
                  </h2>
                  <ul className="text-muted-foreground leading-relaxed mb-4 list-disc pl-6">
                    <li>
                      The free repolishing service applies only to tarnishing
                      and does not include full re-plating.
                    </li>
                    <li>
                      The company reserves the right to deny service if the
                      jewellery does not meet QC requirements.
                    </li>
                  </ul>
                </div>
                <div id="modification-of-terms">
                  <h2 className="text-2xl font-bold mb-6 text-black">
                    6 Modification of Terms:
                  </h2>
                  <ul className="text-muted-foreground leading-relaxed mb-4 list-disc pl-6">
                    <li>
                      The company may modify or discontinue the free repolishing
                      service at any time without prior notice.
                    </li>
                  </ul>
                </div>
                <p>
                  By purchasing jewelry from Kyna Jewellery, you agree to these
                  terms regarding the metals used in our products. Should you
                  have any questions about specific metal-related concerns or
                  need further clarification, please do not hesitate to contact
                  our customer service team.
                </p>
              </section>

              <section id="terms-conditions-packaging">
                <h2 className="text-2xl pt-4 font-bold mb-6 text-[#328F94]">
                  Terms and conditions - Packaging Services
                </h2>
                <p className="pb-4">
                  We have partnered with Sequel Logistics, a specialized
                  logistics company, to ensure the secure and reliable delivery
                  of all jewellery orders. Sequel offers insured and tracked
                  shipping services to protect your valuable purchases.
                </p>
                <div>
                  <h2 className="text-2xl font-bold mb-6 text-black">
                    1 Service Availability:
                  </h2>
                  <ul className="text-muted-foreground leading-relaxed mb-4 list-disc pl-6">
                    <li>
                      Free lifetime repolishing is available only for tarnishing
                      of gold-plated silver jewellery.
                    </li>
                    <li>
                      Jewellery must pass QC inspection before approval for
                      repolishing.
                    </li>
                  </ul>
                </div>
                <div id="insurance-and-liability">
                  <h2 className="text-2xl pt-4 font-bold mb-6 text-[#328F94]">
                    Insurance and Liability
                  </h2>
                  <div>
                    <h2 className="text-2xl font-bold mb-6 text-black">
                      1 Insurance Coverage:
                    </h2>
                    <ul className="text-muted-foreground leading-relaxed mb-4 list-disc pl-6">
                      <li>
                        All shipments through Sequel Logistics are fully insured
                        against theft, loss, and damage during transit.
                      </li>
                      <li>
                        The insurance coverage is valid until the shipment is
                        signed for by the customer or their authorized
                        representative.
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold mb-6 text-black">
                      2 Liability Limitations
                    </h2>
                    <ul className="text-muted-foreground leading-relaxed mb-4 list-disc pl-6">
                      <li>
                        We are not liable for delays caused by Sequel Logistics
                        or force majeure events (e.g., natural disasters,
                        strikes, or governmental actions).
                      </li>
                      <li>
                        Any claims regarding loss or damage during shipping must
                        be reported to us within 24 hours of receiving the
                        shipment. Sequel’s insurance terms will apply.
                      </li>
                    </ul>
                  </div>
                </div>
                <div id="packaging-security">
                  <h2 className="text-2xl pt-4 font-bold mb-6 text-[#328F94]">
                    Packaging and Security
                  </h2>
                  <ul className="text-muted-foreground leading-relaxed mb-4 list-disc pl-6">
                    <li>
                      All jewellery items are securely packaged to prevent
                      tampering or damage.
                    </li>
                    <li>
                      For security reasons, the package will not display any
                      branding indicating that it contains jewellery.
                    </li>
                  </ul>
                </div>
                <div id="delivery-acceptance">
                  <h2 className="text-2xl pt-4 font-bold mb-6 text-[#328F94]">
                    Delivery and Acceptance
                  </h2>
                  <ul className="text-muted-foreground leading-relaxed mb-4 list-disc pl-6">
                    <li>
                      Upon delivery, customers or their authorized
                      representatives must inspect the package before signing
                      the receipt.
                    </li>
                    <li>
                      If you notice any damage or tampering, you must inform the
                      delivery agent immediately and refuse the package. Notify
                      us within 24 hours.
                    </li>
                  </ul>
                </div>
                <div id="returns-refunds">
                  <h2 className="text-2xl pt-4 font-bold mb-6 text-[#328F94]">
                    Returns and Refunds
                  </h2>
                  <h2 className="">1 Return Shipping</h2>
                  <ul className="text-muted-foreground leading-relaxed mb-4 list-disc pl-6">
                    <li>
                      In case of returns, Sequel Logistics will be used as the
                      shipping partner.
                    </li>
                    <li>
                      The cost of return shipping will be deducted from your
                      refund unless the return is due to our error.
                    </li>
                  </ul>
                  <h2>2 Refunds for Lost or Damaged Shipments</h2>
                  <ul className="text-muted-foreground leading-relaxed mb-4 list-disc pl-6">
                    <li>
                      In the rare event of shipment loss or damage, the claim
                      will be processed through Sequel’s insurance policy.
                    </li>
                    <li>
                      Refunds will be issued only after the claim is approved by
                      Sequel Logistics, which may take 7-15 business days.
                    </li>
                  </ul>
                </div>
                <div id="customer-responsibilities">
                  <h2 className="text-2xl pt-4 font-bold mb-6 text-[#328F94]">
                    Customer Responsibilities
                  </h2>
                  <ul className="text-muted-foreground leading-relaxed mb-4 list-disc pl-6">
                    <li>
                      You must provide accurate shipping details. We are not
                      responsible for delays or losses due to incorrect
                      addresses.
                    </li>
                    <li>
                      You agree to be available to receive the shipment. If
                      Sequel Logistics attempts delivery and you are
                      unavailable, additional re-delivery charges may apply.
                    </li>
                  </ul>
                </div>
                <div id="governing-law-jurisdiction">
                  <h2 className="text-2xl pt-4 font-bold mb-6 text-[#328F94]">
                    Governing Law and Jurisdiction
                  </h2>
                  <ul className="text-muted-foreground leading-relaxed mb-4 list-disc pl-6">
                    <li>
                      These Terms are governed by the laws of India Any disputes
                      related to shipping or Sequel Logistics will be resolved
                      in the courts of Mumbai
                    </li>
                  </ul>
                </div>
              </section>
              <section
                id="terms-conditions-product-collection-nominee"
                className="mb-12"
              >
                <h2 className="text-2xl font-bold mb-6 text-[#328F94]">
                  Terms and Conditions – Product Collection by a Nominee
                </h2>

                <div id="introduction" className="mb-8">
                  <h3 className="text-xl font-semibold mb-4">
                    1. Introduction
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    These Terms and Conditions govern the collection of
                    jewellery products by a third-party nominee (“Nominee”) on
                    behalf of the original purchaser (“Customer”). By
                    authorizing a nominee for collection, the Customer agrees to
                    be bound by these Terms.
                  </p>
                </div>

                <div id="authorization-of-nominee" className="mb-8">
                  <h3 className="text-xl font-semibold mb-4">
                    2. Authorization of Nominee
                  </h3>
                  <ul className="text-muted-foreground leading-relaxed list-disc pl-6">
                    <li>
                      The Customer may authorize a nominee by providing a
                      written authorization letter or completing an official
                      nominee collection form.
                    </li>
                    <li>The authorization must include:</li>
                    <ul className="list-disc pl-6 mt-2">
                      <li>Customer’s full name and contact details</li>
                      <li>
                        Nominee’s full name, government-issued ID number, and
                        contact details
                      </li>
                      <li>Order number and collection details</li>
                      <li>Customer’s signature and date</li>
                    </ul>
                    <li>
                      Verbal or informal authorizations will not be accepted.
                    </li>
                  </ul>
                </div>

                <div id="identification-and-verification" className="mb-8">
                  <h3 className="text-xl font-semibold mb-4">
                    3. Identification and Verification
                  </h3>
                  <ul className="text-muted-foreground leading-relaxed list-disc pl-6">
                    <li>Valid government-issued ID of the nominee</li>
                    <li>Copy of the original order confirmation or invoice</li>
                    <li>Signed authorization letter or nominee form</li>
                  </ul>
                  <p className="mt-3 text-muted-foreground">
                    <strong>Verification Process:</strong>
                  </p>
                  <ul className="text-muted-foreground leading-relaxed list-disc pl-6">
                    <li>
                      Identity and documents will be verified by our staff
                    </li>
                    <li>Nominee must sign an acknowledgment receipt</li>
                    <li>
                      Failure to provide valid documents may result in refusal
                      of collection
                    </li>
                  </ul>
                </div>

                <div id="security-and-liability" className="mb-8">
                  <h3 className="text-xl font-semibold mb-4">
                    4. Security and Liability
                  </h3>
                  <ul className="text-muted-foreground leading-relaxed list-disc pl-6">
                    <li>
                      Responsibility transfers to the Customer once the
                      jewellery is handed over to the nominee.
                    </li>
                    <li>
                      We are not liable for loss, theft, or damage after
                      collection.
                    </li>
                    <li>
                      The Customer is responsible for ensuring the nominee is
                      trustworthy.
                    </li>
                  </ul>
                </div>

                <div id="timeframe-for-collection" className="mb-8">
                  <h3 className="text-xl font-semibold mb-4">
                    5. Timeframe for Collection
                  </h3>
                  <ul className="text-muted-foreground leading-relaxed list-disc pl-6">
                    <li>
                      Collection must be completed within the timeframe stated
                      in the order confirmation (typically 7–10 business days).
                    </li>
                    <li>
                      Failure to collect within this period may result in return
                      of the order and applicable re-stocking or logistics
                      charges.
                    </li>
                  </ul>
                </div>

                <div
                  id="collection-from-sequel-logistics-store"
                  className="mb-8"
                >
                  <h3 className="text-xl font-semibold mb-4">
                    6. Collection from Sequel Logistics or Store
                  </h3>
                  <ul className="text-muted-foreground leading-relaxed list-disc pl-6">
                    <li>
                      Nominees must comply with security procedures of Sequel
                      Logistics or the store location.
                    </li>
                    <li>
                      Contact details and signature will be recorded at the time
                      of collection.
                    </li>
                  </ul>
                </div>

                <div id="governing-law-jurisdiction" className="mb-8">
                  <h3 className="text-xl font-semibold mb-4">
                    7. Discrepancies and Disputes
                  </h3>
                  <ul className="text-muted-foreground leading-relaxed list-disc pl-6">
                    <li>
                      Any discrepancy must be reported within 24 hours of
                      collection.
                    </li>
                    <li>
                      Failure to report within this period will be considered
                      acceptance of the product.
                    </li>
                  </ul>
                </div>
              </section>
              <section
                id="terms-conditions-engraved-products"
                className="mb-12"
              >
                <h2 className="text-2xl font-bold mb-6 text-[#328F94]">
                  Terms and Conditions – Engraved Products
                </h2>

                <div id="customization-and-personalization" className="mb-8">
                  <h3 className="text-xl font-semibold mb-4">
                    1. Customization and Personalization
                  </h3>
                  <ul className="text-muted-foreground leading-relaxed list-disc pl-6">
                    <li>
                      All engravings are performed exactly as submitted. Please
                      ensure spelling, dates, initials, and symbols are correct.
                    </li>
                    <li>
                      We reserve the right to refuse engraving requests
                      containing offensive, defamatory, or illegal content.
                    </li>
                    <li>
                      Font style, size, and placement depend on the product
                      design and will be communicated during ordering.
                    </li>
                    <li>
                      Once an engraving is submitted and confirmed, changes
                      cannot be made.
                    </li>
                  </ul>
                </div>

                <div id="production-timeline" className="mb-8">
                  <h3 className="text-xl font-semibold mb-4">
                    2. Production Timeline
                  </h3>
                  <ul className="text-muted-foreground leading-relaxed list-disc pl-6">
                    <li>
                      Engraved jewellery requires an additional 3–7 business
                      days for production.
                    </li>
                    <li>
                      During peak seasons or high demand, timelines may extend
                      slightly. Customers will be notified if delays occur.
                    </li>
                  </ul>
                </div>

                <div id="returns-and-refunds-engraved" className="mb-8">
                  <h3 className="text-xl font-semibold mb-4">
                    3. Returns & Refunds Policy
                  </h3>
                  <ul className="text-muted-foreground leading-relaxed list-disc pl-6">
                    <li>
                      Engraved or personalized items are final sale and not
                      eligible for return, exchange, or refund.
                    </li>
                    <li>
                      Exceptions apply only if the product arrives damaged or
                      contains an engraving error not caused by the customer.
                    </li>
                    <li>
                      Issues must be reported within 3 business days of delivery
                      with clear images of the product and packaging.
                    </li>
                    <li>
                      Approved cases may be repaired, replaced, or refunded at
                      our discretion.
                    </li>
                  </ul>
                </div>

                <div id="customer-responsibility" className="mb-8">
                  <h3 className="text-xl font-semibold mb-4">
                    4. Customer Responsibility
                  </h3>
                  <ul className="text-muted-foreground leading-relaxed list-disc pl-6">
                    <li>
                      Customers are fully responsible for the accuracy of
                      engraving text.
                    </li>
                    <li>
                      We are not liable for spelling errors, incorrect dates, or
                      formatting submitted by the customer.
                    </li>
                    <li>
                      Customers must carefully review engraving details before
                      confirming orders.
                    </li>
                  </ul>
                </div>

                <div id="intellectual-property" className="mb-8">
                  <h3 className="text-xl font-semibold mb-4">
                    5. Intellectual Property and Messaging
                  </h3>
                  <ul className="text-muted-foreground leading-relaxed list-disc pl-6">
                    <li>
                      By submitting engraving content, you confirm you own the
                      rights or have permission to use the text or symbols.
                    </li>
                    <li>
                      Kyna Jewellery is not responsible for copyright or IP
                      violations arising from customer-provided content.
                    </li>
                  </ul>
                </div>

                <div id="limitation-of-liability" className="mb-8">
                  <h3 className="text-xl font-semibold mb-4">
                    6. Limitation of Liability
                  </h3>
                  <ul className="text-muted-foreground leading-relaxed list-disc pl-6">
                    <li>
                      Minor variations in engraving depth, alignment, or finish
                      may occur due to the handcrafted nature of engraving.
                    </li>
                    <li>Such variations are not considered defects.</li>
                    <li>
                      Kyna’s liability is limited to the original purchase value
                      of the product.
                    </li>
                  </ul>
                </div>

                <div id="cancellations-engraved" className="mb-8">
                  <h3 className="text-xl font-semibold mb-4">
                    7. Cancellations
                  </h3>
                  <ul className="text-muted-foreground leading-relaxed list-disc pl-6">
                    <li>
                      Engraved orders cannot be cancelled once production has
                      begun.
                    </li>
                  </ul>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
