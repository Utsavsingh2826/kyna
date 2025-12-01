import React from "react";
import { MessageCircle } from "lucide-react";

const WhatsAppButton = () => {
  const handleWhatsAppClick = () => {
    const message = encodeURIComponent("Hi Kyna Jewels");
    const whatsappUrl = `https://wa.me/917558769753?text=${message}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <button
      onClick={handleWhatsAppClick}
      className="fixed bottom-6 right-6 bg-[#68C5C0] hover:bg-[#163E40] text-white rounded-full p-4 shadow-lg transition-all duration-300 hover:scale-110 z-50"
      aria-label="Contact us on WhatsApp"
    >
      <MessageCircle size={24} className="fill-current" />
    </button>
  );
};

export default WhatsAppButton;
