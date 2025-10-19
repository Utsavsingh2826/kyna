import { useState, useEffect } from "react";
import SEO from "@/components/SEO";
import { ChevronRight, Menu, X } from "lucide-react";

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
  },{
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
    { id: "hours-of-operation", title: "Hours of Operation for Customer Service" },
    {
      id: "resolving-customer-inquiries",
      title: "Process for Resolving Customer Inquiries and Complaints",
    },
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
                      href="mailto:enquiries@kynajewels.com"
                      className="underline text-[#328F94]"
                    >
                      enquiries@kynajewels.com
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
      <h4 className="text-lg font-semibold mb-3">1. Gift Cards</h4>
      <ul className="text-muted-foreground leading-relaxed mb-4 list-disc pl-6">
        <li>Gift Card(s) can be redeemed across the Website and Mobile site, or mobile apps.</li>
        <li>Gift Card(s) can be redeemed on the purchase of any jewellery products.</li>
        <li>On the payment page, click on the tab "Gift Card" and enter your Gift Card number and pin for redemption.</li>
        <li>Multiple Gift Cards can be used to make a payment in a single transaction.</li>
        <li>Gift Card(s) can be combined with any other payment type.</li>
        <li>Gift Card(s) once bought online, shall be considered as sold and cannot be Cancelled, Exchanged or Refunded.</li>
        <li>Gift card(s) can also be redeemed partially, as many times as a user wishes to, till its balance is consumed or it expires.</li>
        <li>Gift cards are valid for a period of one year from the date of issuance to the recipient.</li>
        <li>Gift cards cannot be used to purchase another Gift Card.</li>
        <li>If lost or misused, the Gift Card(s) cannot be replaced.</li>
        <li>Gift cards are void if resold and cannot be exchanged for credit(s) or cash and cannot be re-validated once past the expiry date.</li>
      </ul>
    </div>

    <div id="loyalty-points" className="mb-6">
      <h4 className="text-lg font-semibold mb-3">2. Loyalty Points</h4>
      <ul className="text-muted-foreground leading-relaxed mb-4 list-disc pl-6">
        <li>For every purchase made on the website, the customer is entitled to get loyalty points.</li>
        <li>1% of value before GST will be added as points.</li>
        <li>1 point will be equivalent to 1 rupee at the time of redemption.</li>
        <li>Loyalty Points cannot be clubbed with any other offer.</li>
        <li>Loyalty points are applicable on all products and will be valid for 3 years only.</li>
      </ul>
    </div>

    <div id="friends-family-discount" className="mb-6">
      <h4 className="text-lg font-semibold mb-3">3. Friends & Family Discount</h4>
      <ul className="text-muted-foreground leading-relaxed mb-4 list-disc pl-6">
        <li>15% discount on the total jewellery value.</li>
        <li>The discount value will be added to the customer account under credits and can be availed at the time of purchasing any product.</li>
        <li>Valid until one year from the date of receipt of advance on order confirmation.</li>
        <li>This offer can't be combined and redeemed with any other ongoing offer or discount.</li>
        <li>This offer is non-transferable to any other individual and can be availed by the person making the purchase.</li>
      </ul>
    </div>

    <div id="referral-discount" className="mb-6">
      <h4 className="text-lg font-semibold mb-3">4. Referral Discount</h4>
      <ul className="text-muted-foreground leading-relaxed mb-4 list-disc pl-6">
        <li>5% discount on the total jewellery value in case another customer purchases on the website through a reference/referral code.</li>
        <li>The discount value will be added to the customer account under credits and can be availed at the time of purchasing any product.</li>
        <li>Valid until one year from the date of receipt of advance on order confirmation.</li>
        <li>This offer can't be combined and redeemed with any other ongoing offer or discount.</li>
        <li>This offer is non-transferable to any other individual and can be availed by the person making the purchase.</li>
      </ul>
    </div>

    <div id="design-your-own-jewellery" className="mb-6">
      <h4 className="text-lg font-semibold mb-3">5. Design Your Own Jewellery</h4>
      <ul className="text-muted-foreground leading-relaxed mb-4 list-disc pl-6">
        <li>If a customer cancels a “Design your own jewellery” order before production starts (within 2 days), the whole amount will be refunded to the customer.</li>
        <li>Cancellation request after 2 days will not be accepted or entertained.</li>
      </ul>
    </div>
  </div>
</section>

<section id="customer-service-support" className="mb-12">
  <h2 className="text-2xl font-bold mb-6 text-[#328F94]">
    03. CUSTOMER SERVICE AND SUPPORT
  </h2>

  <div id="contact-information" className="mb-8">
    <h3 className="text-xl font-semibold mb-4">1. Contact Information:</h3>
    <p className="text-muted-foreground leading-relaxed mb-4">
      For any assistance, our dedicated customer support team is available via:
    </p>
    <ul className="text-muted-foreground leading-relaxed mb-4 list-disc pl-6">
      <li>Phone: +91 8928610682</li>
      <li>Email: enquiries@kynajewels.com</li>
      <li>Live Chat: Accessible through our website during operational hours.</li>
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
      <li>Please note that timings may vary on holidays and special occasions.</li>
    </ul>
  </div>

  <div id="resolving-customer-inquiries" className="mb-8">
    <h3 className="text-xl font-semibold mb-4">
      3. Process for Resolving Customer Inquiries and Complaints:
    </h3>
    <ul className="text-muted-foreground leading-relaxed mb-4 list-disc pl-6">
      <li>Upon receipt, the inquiry/complaint is logged into our system.</li>
      <li>A member of our customer support team promptly acknowledges receipt of the inquiry/complaint.</li>
      <li>Our dedicated team thoroughly investigates the matter to understand the root cause of the issue.</li>
      <li>This may involve gathering additional information from the customer, reviewing relevant records, or consulting with other departments.</li>
      <li>Based on the investigation, a resolution plan is formulated.</li>
      <li>The plan may include corrective actions, refunds, replacements, or other appropriate measures to address the customer's concerns.</li>
      <li>We keep the customer informed throughout the process, providing regular updates on the status of their inquiry/complaint.</li>
      <li>Once the resolution plan is finalized, it is implemented promptly.</li>
      <li>After the resolution has been implemented, we follow up with the customer to ensure their satisfaction.</li>
      <li>We encourage feedback on the resolution process, allowing us to continually improve our services and prevent similar issues in the future.</li>
      <li>The entire resolution process is documented for future reference and analysis.</li>
      <li>Once the inquiry/complaint has been satisfactorily resolved and the customer is content, the case is marked as closed in our system.</li>
      <li>Any claim for non-receipt of a product or empty box will be entertained only if submitted within 24 hours of receipt along with an unboxing video which includes the original outer seal. Send the video via WhatsApp within 24 hours of receiving the product.</li>
      <li>We provide resolution within 7 - 10 working days.</li>
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
