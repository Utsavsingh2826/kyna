import React from "react";
import { X } from "lucide-react";

interface PdfPopupProps {
  isOpen: boolean;
  onClose: () => void;
  pdfUrl: string;
  title: string;
}

const PdfPopup: React.FC<PdfPopupProps> = ({ isOpen, onClose, pdfUrl, title }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl h-[90vh] bg-white rounded-lg shadow-2xl overflow-hidden scale-in-95 animate-in zoom-in-95 duration-200">
        <div className="absolute top-0 left-0 right-0 h-14 bg-white border-b flex items-center justify-between px-6 z-10">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="w-full h-full pt-14">
          <iframe
            src={`${pdfUrl}#toolbar=0`}
            className="w-full h-full border-none"
            title={title}
          />
        </div>
      </div>
    </div>
  );
};

export default PdfPopup;
