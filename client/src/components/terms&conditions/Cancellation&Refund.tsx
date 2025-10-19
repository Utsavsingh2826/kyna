import { useState, useEffect } from "react";
import SEO from "@/components/SEO";
import { ChevronRight, Menu, X } from "lucide-react";

const sections = [
  {
    id: "ordering-cancellation-payment",
    title: "01. ORDERING, CANCELLATION AND PAYMENT PROCESS",
    subsections: [
      { id: "how-to-order", title: "How to Order" },
      { id: "purchase-payment", title: "Pricing & Payment" },
      { id: "order-confirmation", title: "Order Confirmation" },
      { id: "cancellation-policy", title: "Cancellation Policy" },
    ],
  },
  {
    id: "return-exchange-lifetime-buy-back-policies",
    title: "02. RETURN, EXCHANGE AND LIFETIME BUY BACK POLICIES",
    subsections: [
      { id: "return-policy", title: "Return Policy" },
      { id: "exchange-policy", title: "Exchange Policy" },
      { id: "lifetime-buy-back-policy", title: "Lifetime Buy Back Policy" },
    ],
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
        title="Cancellation & Refund | Kyna Jewellery"
        description="Read our cancellation and refund policy to understand your rights and options."
        canonical="/cancellation-refund"
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
                <span>Cancellation & Refund</span>
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
                  <span>Cancellation & Refund</span>
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
                <h1 className="text-3xl font-bold">Cancellation & Refund</h1>
              </div>
              {/* Product Information Section */}
              <section id="ordering-cancellation-payment" className="mb-12">
                <h2 className="text-2xl font-bold mb-6 text-[#328F94] ">
                  01. ORDERING, CANCELLATION AND PAYMENT PROCESS
                </h2>

                <div id="how-to-order" className="mb-8">
                  <h3 className="text-xl font-semibold mb-4">
                    1.How to Order / How to Place an Order:
                  </h3>
                  <ul className="text-muted-foreground leading-relaxed mb-4 list-disc pl-6">
                    <li>
                      <span className="font-bold">
                        Retail purchase - 
                      </span>{" "}Any member/personnel who wishes to purchase an item from the website can either:
Add the selected diamond(s)/ jewellery directly to the shopping cart; or customize jewellery by adding diamond(s) to a ring, pendant, earring or any other type of jewellery that is expressly stated as customizable on the website and then add the item to the shopping cart; or  
Choose from the selection of jewellery available on the website and add the item to the shopping cart; or call our trained consultants on +91 8928610682 or write to us on enquiries@kynajewels.com   
The member will receive the form for ordering via email/fax/ courier based on their convenience.
In the event of a user wishing to make a purchase, the user may be required to register on the website after adding the item(s) to the shopping cart. 
Orders are normally considered complete only after we have received the payment. 
In the event the bank rejects to honour any payment transaction made by a customer towards an order, we shall have the right to refuse to ship the order without any liability whatsoever.


                    </li>
                    <li>
                      <span className="font-bold"> For bulk or wholesale purchases, contact customer service at 
+91 8928610682 or write to us on enquiries@kynajewels.com  for discounts and terms.
                      </span>
                    </li>
                  </ul>
                </div>

                <div id="purchase-payment" className="mb-8">
                  <h3 className="text-xl font-semibold mb-4">
                    2.Purchase & Payment: 
                  </h3>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    While making payment of purchase only provide current, complete, and accurate purchase and account information for all purchases; promptly update account and payment information, including email address, payment method, and payment card expiration date, so that we can complete your transactions and contact you as needed. Sales tax will be added to the price of purchases as deemed required by us. You agree to pay all charges at the prices then in effect for your purchases and any applicable shipping fees, packaging etc. and you authorize us to charge your chosen payment provider for any such amounts upon placing your order. We reserve the right to correct any errors or mistakes in pricing, even if we have already requested or received payment. We reserve the right to refuse any order placed through the Services. We may, in our sole discretion, limit or cancel quantities purchased per person, per household, or per order. These restrictions may include orders placed by or under the same customer account, the same payment method, and/or orders that use the same billing or shipping address. We reserve the right to limit or prohibit orders that, in our sole judgment, appear to be placed by dealers, resellers, or distributors. 
                  </p>
                  <h5 className="font-bold">Accepted Payment Methods</h5>
                  <p>We accept the following payment methods for purchases:
                    <ul>
                      <li>Credit/Debit Cards (Visa, MasterCard, American Express,)</li>
                      <li>Bank Transfers</li>
                      <li>Gift Cards</li>
                    </ul>
                  </p>
                  <p>For purchase above Rs. 2 lakhs, PAN card must be provided upon placing the order. Failure to provide the same shall result in cancellation of the order. The billing name is supposed to be the same as the PAN card else the PAN card will not get verified and the customer will not be able to proceed with the order. After placing an order, customers will be contacted by our customer service executive via phone or email to request the submission of a valid PAN card for orders exceeding Rs. 2 lakhs. The customer will be provided with instructions on how to submit the PAN card copy. Until the PAN card is received and verified, the order will be put on hold. Our team will review the PAN card details provided by the customer for verification purposes. Once the PAN card verification is successfully completed and the billing name matches the PAN card details, the order will be confirmed, and further processing will take place. If the customer fails to provide the PAN card or there is a mismatch in the billing name with the PAN card, the order may be cancelled. The customer will be notified promptly regarding the cancellation and provided with further instructions if required. If you have any questions or require assistance, please reach out to our team, who will be glad to assist you during the PAN card verification process.</p>
                </div>

                <div id="order-confirmation" className="mb-8">
                  <h3 className="text-xl font-semibold mb-4">
                    3.	Order Confirmation and Processing: 
                  </h3>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                   All products and information displayed on the website are an invitation to offer. Your purchase order constitutes your offer, which is subject to these Terms and Conditions. We reserve the right to accept or reject your offer in whole or in part. Our acceptance of your order occurs upon the dispatch of the ordered product(s). Dispatching may happen at different times for different portions of the order. In such cases, the dispatched portion will be considered accepted by us, while the remaining balance will continue to be an offer, and we retain the right to accept or reject the balance. If you have provided us with your email address, we will notify you via email to confirm the receipt of your order, its dispatch, and subsequent acceptance.Orders are processed within 14-30 working days depending upon product. 
                  </p>
                </div>

                <div id="cancellation-policy" className="mb-8">
                  <h3 className="text-xl font-semibold mb-4">
                    4.	Cancellation of Orders:
                  </h3>
                  <p>Customers may cancel a ready-to-ship order before it is shipped i.e. within 2 working days from the date of order placement</p>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                   <p className="font-bold">Cancellation Fees:</p>
                   </p>
                   <span>A pre-dispatch cancellation fee of 2% will be applied to eligible cancellations. 
The remaining 98% will be credited back to the customer's account.
</span>
<p>For customized products</p>
<span>With engraving, build your own, or upload your own, personalized jewellery, cancellation is not applicable, However, if a customer cancels their customizable order within 2 working days of purchase, the entire order value will be refunded. To request cancellation, customers must contact customer care via email or telephone within the specified timeframe only. 
We won’t entertain any cancellation request after specified timeframe. Upon cancellation of an eligible order, it will take approximately 21 – 30 working days for refund initiation. Refunds will be processed using electronic transfer methods such as RTGS, NEFT, or other appropriate means, and will be credited to the same account used for the transaction. 
</span>
<p>Cancellation of Order by Kyna Jewellery</p>
<span>Kyna Jewellery reserves the right to cancel any order at our discretion. Reasons for cancellation may include, but are not limited to, issues with inventory availability, suspected fraudulent activity, errors in product or pricing information, or situations where we are unable to verify the customer's payment or shipping information. If your order is cancelled, we will notify you promptly and provide a full refund to the original payment method used.</span>
                </div>

               </section>
               {/* 02.	RETURN, EXCHANGE AND LIFETIME BUY BACK POLICIES */}
              <section id="return-exchange-lifetime-buy-back-policies" className="mb-12">
                <h1 className="text-2xl text-[#328F94] font-bold mb-6">
                  02. RETURN, EXCHANGE AND LIFETIME BUY BACK POLICIES
                </h1>

                <div id="return-policy" className="mb-8">
                  <h3 className="text-xl font-semibold mb-4">
                    1.	Return Policy: 
                  </h3>
                  <ul>
                    <li><p className="font-bold">•	Eligibility for Returns: </p>If you are not entirely satisfied with your purchase or if a defective product has been delivered, you may return the item within 15 working days of receiving the product. The product must be unused, in its original condition, with its original tags, invoices, certificates and packaging.</li>
                    <li><p className="font-bold">•	Return Process: </p>
                    <ul>
                      <li>Contact our customer service team at enquiries@kynajewels.com  to request a Return.</li>
                      <li>To process returns, customers must provide Kyna Jewellery with a valid reason for return and send pictures via WhatsApp or mail within 24 hours of receiving the product.</li>
                      <li>Our courier partner will collect the order from the provided address within India.</li>
                      <li>A charge of Rs. 1800 will be borne by the customer to process the return from within India.</li>
                      <li>No charges will be applied if the delivered product is damaged as mentioned in Shipping and Delivery Policies.</li>
                    </ul>
                    <li><p className="font-bold">•	Quality Check & Approval: </p>Eligibility for returns is determined upon receipt and quality check conducted by our Quality Department. If the product does not meet the merchantable condition as dispatched by the company, the return will be rejected, and the product will be returned within 5 - 10 working days. Once approved by the Quality Department, the refund process will be initiated.</li>
                    <li><p className="font-bold">•	Refund Process: </p>Once received, we will inspect the item and process your refund using electronic transfer methods such as RTGS, NEFT, or other appropriate means. The refunded amount will be credited to the same account used for the transaction. It may take approximately 21 - 30 working days from the date we receive the returned product(s) at our warehouse for the refund process and amount to reflect in your bank account. Original shipping fees are non-refundable.</li>
                    <li><p className="font-bold">•	Defect Reporting: </p>The return of a defective product must be reported within 24 Hours of receipt of the product. You can report defects by calling us at +91 8928610682 or writing to us at enquiries@kynajewels.com
                    </li>
                    <li><p className="font-bold">•	Exclusions: </p>Design your own jewellery, custom-made jewellery, personalized jewellery, custom jewellery parts, or any alterations made to the jewellery is where the return policy is not applicable.</li>
                    </li>
                  </ul>
                </div>

                <div id="exchange-policy" className="mb-8">
                  <h3 className="text-xl font-semibold mb-4">
                    2. Exchange Policy:
                  </h3>
                  <ul>
                    <li>
                      <p className="font-bold">•	Exchange Eligibility: </p>The exchange is applicable for jewellery within 15 working days from the date of purchase.
Exchange is permitted if the jewellery is in its original condition with its original tags, invoices, certificates and packaging. The product must be unused, in its original condition, with its original tags, invoices, certificates and packaging. If you wish to exchange an item for a different size, colour, or style, please contact our Customer Service team for assistance. 

                    </li>
                    <li><p className="font-bold">•	Exchange Process: </p>
                   
<ul>
  <li>Contact our customer service team at enquiries@kynajewels.com  to request an Exchange.</li>
  <li>To process exchanges, customers must provide Kyna Jewellery with a valid reason for exchange and send pictures via WhatsApp or mail within 24 hours of receiving the product.</li>
  <li>A processing fee of Rs. 1800 will be borne by the customer to process the exchange within India.</li>
  <li>Processes & Charges of exchange for international orders will be communicated during the request for exchange process.</li>
</ul>
</li>
<li><p className="font-bold">•	Exclusions: </p>Design your own jewellery – Custom made jewellery, personalized jewellery, jewellery part or any type of alteration done to the jewellery such jewellery is where exchange policy is not applicable. The Company does not cover any consequential loss or damage of jewellery or precious stone in studded jewellery in exchange policy. </li>
                  </ul>
If the product does not meet the merchantable condition as dispatched by the company, the exchange will be rejected, and the product will be returned within 5 - 10 working days. Once approved by the Quality Department, the exchange process will be processed further.
                </div>

                <div id="lifetime-buy-back-policy" className="mb-8">
                  <h3 className="text-xl font-semibold mb-4">
                    3.	Lifetime Buy Back Policy: 
                  </h3>
                  <ul>
                      <li>
                        <p className="font-bold">•	Eligibility Criteria:</p>Jewellery must be in its original condition without significant alterations or damages include all original certificates and documentation.
                      </li>
                       <li>
                      <p className="font-bold">•	Valuation Process:</p>Contact our customer service team at enquiries@kynajewels.com to request for Buy Back.
Final valuation will be determined based on prevailing market prices, condition of the item, and other relevant considerations. The valuation process includes an inspection and quality check by our Quality Department.

                    </li>
                     <li>
                      <p className="font-bold">•	Approx. Buy Back Rates:</p>
<ul>
  <li>Get approximately 98% value of metal weight (Gold, Silver, and Platinum) at the prevailing metal rate (subject to change).</li>
  <li>Get approximately 80% value of Natural diamonds at prevailing market price (subject to change).</li>
  <li>Get approximately 80% value of LGD (Lab Grown Diamonds) at prevailing market price (subject to change).</li>
</ul>
                    </li>
                     <li>
                      <p className="font-bold">•	Valuation Process:</p>Contact our customer service team at enquiries@kynajewels.com to request for Buy Back.
Final valuation will be determined based on prevailing market prices, condition of the item, and other relevant considerations. The valuation process includes an inspection and quality check by our Quality Department.

                    </li>
                     <li>
                      <p className="font-bold">•	Approx. Buy Back Rates:</p>
<ul>
  <li>Get approximately 98% value of metal weight (Gold, Silver, and Platinum) at the prevailing metal rate (subject to change).</li>
  <li>Get approximately 80% value of Natural diamonds at prevailing market price (subject to change).</li>
  <li>Get approximately 80% value of LGD (Lab Grown Diamonds) at prevailing market price (subject to change).</li>
</ul>
                    </li>
                    <li>
                      <p className="font-bold">•	Documentation Required:</p>
<ul>
  <li>Original Product</li>
  <li>Original/Copy of Invoice</li>
  <li>Product Certificate (if any)</li>
  <li>Payment Receipt Invoice/Images</li>

  <li>Any additional documents if required</li>
</ul>
                    </li>
                    

<li>
  <p className="font-bold">• Policy Limitations:</p>
  <ul>
    <li>Buyback policy applies only if the invoice value is less than Rs. 2.00 Lacs.</li>
    <li>Lifetime Buy Back Value doesn't cover manufacturing charges, taxes, or labour charges.</li>
    <li>The policy is non-transferable and applies only to the original purchaser of the jewellery.</li>
  </ul>
</li>

<li>
  <p className="font-bold">• Payment Process:</p>
  <ul>
    <li>Refunds will be processed using electronic transfer methods such as RTGS, NEFT, or other appropriate means.</li>
    <li>It will take approximately 21 – 30 working days from the date of receiving the returned product(s) at our warehouse for the refund amount to reflect in your bank account.</li>
    <li>Any discounts given at the time of the original purchase will be deducted from the exchange amount.</li>
  </ul>
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
