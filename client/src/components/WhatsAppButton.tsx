// Remove this:
// import { MessageCircle } from "lucide-react";

// Instead, import your SVG (adjust the path!)
import whatsappIcon from "/motif/whatsapp.svg"; // e.g. "../assets/whatsapp.svg"

const WhatsAppButton = () => {
  const handleWhatsAppClick = () => {
    const message = encodeURIComponent("Hi Kyna Jewels");
    const whatsappUrl = `https://wa.me/918928610682?text=${message}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <button
      onClick={handleWhatsAppClick}
      className="fixed bottom-6 right-6 text-white rounded-full p-4 shadow-lg transition-all duration-300 hover:scale-110 z-50"
      aria-label="Contact us on WhatsApp"
    >
      <img
        src={whatsappIcon}
        alt="Contact us on WhatsApp"
        className="w-12 h-12"
      />
    </button>
  );
};

export default WhatsAppButton;
