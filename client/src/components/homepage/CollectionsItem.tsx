import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Link } from "react-router-dom";

interface CollectionItem {
  title: string;
  href: string;
  src: string;
  alt: string;
}

const collections: CollectionItem[] = [
  {
    title: "Earrings",
    href: "/earrings",
    src: "collections(Home)/1.jpeg",
    alt: "Diamond stud earrings close-up shimmering with light",
  },
  {
    title: "Men's Rings",
    href: "/rings?ring_category=Mens+Rings",
    src: "collections(Home)/2.png",
    alt: "Men's ring on hand with metallic finish",
  },
  {
    title: "Pendants",
    href: "/pendants",
    src: "collections(Home)/3.jpeg",
    alt: "Pendant necklace with gemstone on neckline",
  },
  {
    title: "Bracelets",
    href: "/bracelets",
    src: "collections(Home)/4.jpg",
    alt: "Elegant bracelet worn on wrist",
  },
];

export default function CollectionsSection() {
  return (
    <section aria-label="Collections" className="bg-[#faf9f7] py-16">
      <div className="max-w-6xl mx-auto px-6 md:px-10">

        {/* Header */}
        <header className="bg-[#68C5C0] rounded-lg shadow-lg mb-8">
          <div className="py-4 md:py-5 text-center">
            <h2 className="m-0 font-light text-2xl md:text-3xl tracking-widest uppercase text-white">
              Collections
            </h2>
          </div>
        </header>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
          {collections.map((item) => (
            <Link
              key={item.title}
              to={item.href}
              aria-label={`Explore ${item.title}`}
              className="group relative overflow-hidden rounded-xl shadow-lg block"
            >
              <AspectRatio ratio={4 / 5}>
                <img
                  src={item.src}
                  alt={item.alt}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                />
              </AspectRatio>

              {/* Hover-reveal overlay: slides up from bottom */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 via-black/25 to-transparent pt-12 pb-6 flex flex-col items-center justify-end translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out">
                <p className="text-white text-lg font-light tracking-[0.2em] uppercase mb-1">
                  {item.title}
                </p>
                <p className="text-white/75 text-xs tracking-widest uppercase">
                  Explore →
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
