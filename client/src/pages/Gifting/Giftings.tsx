import { useParams } from "react-router-dom";
import GiftingBanner from "./GiftingBanner";
import GiftingProducts from "./GiftingProducts";

export default function Giftings() {
  const { priceRange } = useParams();
  
  return (
    <div>
      <GiftingBanner />
      <GiftingProducts priceRange={priceRange} />
    </div>
  );
}
