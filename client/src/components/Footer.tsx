import React from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Facebook, Instagram, Youtube, ArrowRight } from "lucide-react";
import * as Accordion from "@radix-ui/react-accordion";

const columns = [
  {
    title: "ABOUT",
    links: [
      { label: "Our Story", href: "/about" },
      { label: "Customer Reviews", href: "/customer-service" },
      { label: "Quality & Certification", href: "/quality-certification" },
    ],
  },
  {
    title: "EDUCATION",
    links: [
      { label: "Blog", href: "/blog" },
      { label: "Lab Grown Diamonds", href: "/lab-grown-diamonds" },
      { label: "Ring Size Guide", href: "/RingSize-Education" },
      { label: "Bracelet Size Guide", href: "/Bracelet-education" },
    ],
  },
  {
    title: "CUSTOMER SERVICE",
    links: [
      { label: "FAQs", href: "/customer-service" },
      {
        label: "Jewellery Financing",
        href: "/customer-service?section=promos",
      },
      {
        label: "Promo Codes & Offers",
        href: "/customer-service?section=promos",
      },
      { label: "Refer A Friend", href: "/customer-service?section=referral" },
    ],
  },
  {
    title: "POLICIES",
    // links: [
    //   { label: "Privacy Policy", href: "/privacy-policy" },
    //   { label: "Shipping", href: "/customer-service/faqs/shipping-and-delivery?category=shipping-and-delivery&section=faqs" },
    //   { label: "Returns & Exchange", href: "/customer-service/faqs/Refund-&-Payment-Processing?category=Refund-%26-Payment-Processing&section=faqs" },
    //   { label: "Terms & Conditions", href: "/terms-conditions" },
    //   { label: "Cancellation & Refund", href: "/customer-service/faqs/Refund-&-Payment-Processing?category=Refund-%26-Payment-Processing&section=faqs" },
    // ],
    links: [
      { label: "Privacy Policy", href: "/privacy-policy" },
      { label: "Shipping", href: "/shipping-policy" },
      // { label: "Returns & Exchange", href: "/cancellation-refund" },
      { label: "Terms & Conditions", href: "/terms-conditions" },
      { label: "Cancellation & Refund", href: "/cancellation-refund" },
    ],
  },
];

const Footer: React.FC = () => {
  // Function to open Calendly popup
  const openCalendly = () => {
    // Replace 'your-calendly-url' with your actual Calendly scheduling URL
    const calendlyUrl = "https://calendly.com/pranaytiwariprpk"; // Update this with your actual Calendly URL

    // Open Calendly in a popup window
    window.open(
      calendlyUrl,
      "calendly-popup",
      "width=800,height=600,scrollbars=yes,resizable=yes"
    );
  };

  return (
    <footer className="mt-12 md:mt-16 border-t bg-white overflow-hidden">
      <div className="w-full max-w-7xl mx-auto px-4 py-10 md:py-14">
        {/* Mobile Accordion */}
        <div className="block md:hidden w-full">
          <Accordion.Root type="single" collapsible className="w-full">
            {columns.map((col) => (
              <Accordion.Item key={col.title} value={col.title}>
                <Accordion.Trigger className="w-full flex justify-between items-center py-3 border-b text-sm font-semibold tracking-wide text-gray-700 uppercase">
                  {col.title}
                  <span className="text-gray-500">+</span>
                </Accordion.Trigger>
                <Accordion.Content className="pb-3">
                  <ul className="space-y-2 mt-2 pl-2">
                    {col.links.map((item) => (
                      <li key={item.label}>
                        <a
                          href={item.href}
                          className="text-sm text-gray-600 hover:text-teal-600 hover:underline transition-colors"
                        >
                          {item.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </Accordion.Content>
              </Accordion.Item>
            ))}
          </Accordion.Root>

          {/* Socials */}
          <div className="flex items-center gap-4 mt-6 text-gray-600">
            <Youtube size={20} className="hover:text-teal-600 cursor-pointer" />
            <Facebook
              size={20}
              className="hover:text-teal-600 cursor-pointer"
            />
            <Instagram
              size={20}
              className="hover:text-teal-600 cursor-pointer"
            />
          </div>

          {/* Copyright */}
          <div className="pt-6 border-t mt-6">
            <p className="text-xs text-gray-500 text-center">
              © 2024 HYUN Jewellery. All Rights Reserved
            </p>
          </div>
        </div>

        {/* Desktop Grid */}
        <div className="hidden md:block">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {/* ABOUT */}
            <div>
              <h3 className="text-xs font-semibold tracking-wide text-gray-600 uppercase">
                ABOUT
              </h3>
              <ul className="mt-4 space-y-3">
                <li>
                  <a
                    href="/about"
                    className="text-sm text-gray-700 hover:text-teal-600 hover:underline"
                  >
                    Our Story
                  </a>
                </li>
                <li>
                  <a
                    href="/customer-service"
                    className="text-sm text-gray-700 hover:text-teal-600 hover:underline"
                  >
                    Customer Reviews
                  </a>
                </li>
                <li>
                  <a
                    href="/quality-certification"
                    className="text-sm text-gray-700 hover:text-teal-600 hover:underline"
                  >
                    Quality & Certification
                  </a>
                </li>
              </ul>
            </div>

            {/* CUSTOMER SERVICE */}
            <div>
              <h3 className="text-xs font-semibold tracking-wide text-gray-600 uppercase">
                CUSTOMER SERVICE
              </h3>
              <ul className="mt-4 space-y-3">
                <li>
                  <a
                    href="/customer-service"
                    className="text-sm text-gray-700 hover:text-teal-600 hover:underline"
                  >
                    FAQs
                  </a>
                </li>
                <li>
                  <a
                    href="/customer-service?section=promos"
                    className="text-sm text-gray-700 hover:text-teal-600 hover:underline"
                  >
                    Jewellery Financing
                  </a>
                </li>
                <li>
                  <a
                    href="/customer-service?section=promos"
                    className="text-sm text-gray-700 hover:text-teal-600 hover:underline"
                  >
                    Promo Codes & Offers
                  </a>
                </li>
                <li>
                  <a
                    href="/customer-service?section=referral"
                    className="text-sm text-gray-700 hover:text-teal-600 hover:underline"
                  >
                    Refer A Friend
                  </a>
                </li>
              </ul>
            </div>

            {/* CONTACT US */}
            <div>
              <h3 className="text-xs font-semibold tracking-wide text-gray-600 uppercase">
                CONTACT US
              </h3>
              <ul className="mt-4 space-y-3 text-sm">
                <li className="text-gray-700">+91 8928610682</li>
                <li>
                  <a
                    href="mailto:enquires@hyunjewellery.com"
                    className="text-teal-600 hover:underline"
                  >
                    enquires@hyunjewellery.com
                  </a>
                </li>
                <li>
                  <button
                    onClick={openCalendly}
                    className="text-teal-600 hover:underline text-left p-0 border-none bg-transparent cursor-pointer text-sm"
                  >
                    Book Virtual Appointment
                  </button>
                </li>
              </ul>
            </div>

            {/* ORDER */}
            <div>
              <h3 className="text-xs font-semibold tracking-wide text-gray-600 uppercase">
                ORDER
              </h3>
              <ul className="mt-4 space-y-3">
                <li>
                  <a
                    href="/track-order"
                    className="text-sm text-gray-700 hover:text-teal-600 hover:underline"
                  >
                    Track Your Order
                  </a>
                </li>
              </ul>
            </div>

            {/* EDUCATION */}
            <div>
              <h3 className="text-xs font-semibold tracking-wide text-gray-600 uppercase">
                EDUCATION
              </h3>
              <ul className="mt-4 space-y-3">
                <li>
                  <a
                    href="/blogs"
                    className="text-sm text-gray-700 hover:text-teal-600 hover:underline"
                  >
                    Blog
                  </a>
                </li>
                <li>
                  <a
                    href="/lab-grown-diamonds"
                    className="text-sm text-gray-700 hover:text-teal-600 hover:underline"
                  >
                    Lab Grown Diamonds
                  </a>
                </li>
                <li>
                  <a
                    href="/RingSize-Education"
                    className="text-sm text-gray-700 hover:text-teal-600 hover:underline"
                  >
                    Ring Size Guide
                  </a>
                </li>
                <li>
                  <a
                    href="/Bracelet-education"
                    className="text-sm text-gray-700 hover:text-teal-600 hover:underline"
                  >
                    Bracelet Size Guide
                  </a>
                </li>
              </ul>
            </div>

            {/* POLICIES */}
            <div>
              <h3 className="text-xs font-semibold tracking-wide text-gray-600 uppercase">
                POLICIES
              </h3>
              <ul className="mt-4 space-y-3">
                <li>
                  <a
                    href="/privacy-policy"
                    className="text-sm text-gray-700 hover:text-teal-600 hover:underline"
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    href="/shipping-policy"
                    className="text-sm text-gray-700 hover:text-teal-600 hover:underline"
                  >
                    Shipping
                  </a>
                </li>
                {/* <li>
                  <a
                    href="/cancellation-refund"
                    className="text-sm text-gray-700 hover:text-teal-600 hover:underline"
                  >
                    Returns & Exchange
                  </a>
                </li> */}
                <li>
                  <a
                    href="/terms-conditions"
                    className="text-sm text-gray-700 hover:text-teal-600 hover:underline"
                  >
                    Terms & Conditions
                  </a>
                </li>
                <li>
                  <a
                    href="/cancellation-refund"
                    className="text-sm text-gray-700 hover:text-teal-600 hover:underline"
                  >
                    Cancellation & Refunds
                  </a>
                </li>
              </ul>
            </div>

            {/* SIGN UP FOR EMAIL */}
            <div className="col-span-2">
              <h3 className="text-xs font-semibold tracking-wide text-gray-600 uppercase">
                SIGN UP FOR EMAIL
              </h3>
              <p className="mt-3 text-sm text-gray-600">
                Send me HYUN news, updates and offers.
              </p>
              <form
                className="mt-4 flex gap-2 w-full max-w-sm"
                onSubmit={(e) => e.preventDefault()}
              >
                <Input
                  type="email"
                  placeholder="Your Email Address"
                  className="flex-1 h-10" // set fixed height
                />
                <Button className="h-10 w-10 flex items-center justify-center bg-[#68C5C0] hover:bg-[#5ab3ae] p-0">
                  <ArrowRight className="h-5 w-5 text-white" />
                </Button>
              </form>

              <div className="mt-6 flex items-center gap-4 text-gray-600">
                <Youtube
                  size={18}
                  className="hover:text-teal-600 cursor-pointer"
                />
                <Facebook
                  size={18}
                  className="hover:text-teal-600 cursor-pointer"
                />
                <Instagram
                  size={18}
                  className="hover:text-teal-600 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-12 pt-8 border-t">
            <p className="text-xs text-gray-500">
              © 2024 HYUN Jewellery. All Rights Reserved
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
