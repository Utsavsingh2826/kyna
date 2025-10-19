import React from 'react';

const PromotionalBanner: React.FC = () => {
  return (
    <div className="bg-[#163E40] text-white text-center py-2 px-4 text-sm">
      Use promo code <span className="font-semibold">FIRST10</span> to avail 10% discount on your first order.
    </div>
  );
};

export default PromotionalBanner;