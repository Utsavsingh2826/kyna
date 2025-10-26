// import { AspectRatio } from "@/components/ui/aspect-ratio";

// interface CollectionItem {
//   title: string;
//   href: string;
//   src: string;
//   alt: string;
// }

// const collections: CollectionItem[] = [
//   {
//     title: "Explore Earrings",
//     href: "/collections/earrings",
//     src: "collections(Home)/1.jpg",
//     alt: "Diamond stud earrings close-up shimmering with light",
//   },
//   {
//     title: "Explore Men's Rings",
//     href: "/collections/mens-rings",
//     src: "collections(Home)/2.jpg",
//     alt: "Men's ring on hand with metallic finish",
//   },
//   {
//     title: "Explore Pendants",
//     href: "/collections/pendants",
//     src: "collections(Home)/3.jpg",
//     alt: "Pendant necklace with gemstone on neckline",
//   },
//   {
//     title: "Explore Bracelets",
//     href: "/collections/bracelets",
//     src: "collections(Home)/4.jpg",
//     alt: "Elegant bracelet worn on wrist",
//   },
// ];

// export default function CollectionsSection() {
//   return (
//     <section aria-label="Collections" className="cs-section">
//       <style>{`
//         /* Layout */
//         .cs-section { position: relative; padding: 3rem 0; }
//         @media (min-width: 768px) { .cs-section { padding: 4rem 0; } }

//         .cs-container { max-width: 1200px; margin: 0 auto; padding: 0 1.5rem; }
//         @media (min-width: 768px) { .cs-container { padding: 0 2.5rem; } }

//         /* Header */
//         .cs-header { background: hsl(188 80% 35%); color: white; border-radius: 0.5rem; box-shadow: 0 10px 30px -10px hsl(188 80% 35% / 0.35); }
//         .cs-header-inner { padding: 1rem 0; text-align: center; }
//         @media (min-width: 768px) { .cs-header-inner { padding: 1.25rem 0; } }
//         .cs-title { margin: 0; font-weight: 600; font-size: 1.5rem; line-height: 2rem; }
//         @media (min-width: 768px) { .cs-title { font-size: 1.875rem; line-height: 2.25rem; } }

//         /* Grid */
//         .cs-grid { margin-top: 2rem; display: grid; grid-template-columns: 1fr; gap: 1.5rem; }
//         @media (min-width: 640px) { .cs-grid { grid-template-columns: repeat(2, 1fr); } }
//         @media (min-width: 768px) { .cs-grid { gap: 2rem; } }

//         /* Cards */
//         .cs-card { position: relative; overflow: hidden; border-radius: 0.75rem; box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.35); }
//         .cs-image { width: 100%; height: 100%; object-fit: cover; transition: transform .3s ease; }
//         .cs-card:hover .cs-image { transform: scale(1.05); }

//         /* CTA overlay */
//         .cs-cta-wrap { pointer-events: none; position: absolute; left: 0; right: 0; bottom: 1rem; display: flex; justify-content: center; }
//         .cs-btn { pointer-events: auto; display: inline-flex; align-items: center; justify-content: center; padding: .5rem 1rem; font-size: .875rem; font-weight: 600; color: #fff; border: 1px solid rgba(255,255,255,0.9); background: rgba(0,0,0,0.25); backdrop-filter: blur(4px); border-radius: 9999px; text-decoration: none; transition: all .2s ease; box-shadow: 0 8px 24px -12px rgba(0,0,0,0.4); }
//         .cs-btn:hover, .cs-btn:focus-visible { background: #fff; color: hsl(188 80% 30%); border-color: #fff; }
//         .cs-btn:focus-visible { outline: 3px solid hsl(188 80% 30% / .35); outline-offset: 2px; border-color: transparent; }
//       `}</style>

//       <div className="cs-container">
//         <header className="cs-header">
//           <div className="cs-header-inner">
//             <h2 className="cs-title">Collections</h2>
//           </div>
//         </header>

//         <div className="cs-grid">
//           {collections.map((item) => (
//             <article key={item.title} className="cs-card">
//               <AspectRatio ratio={4 / 5}>
//                 <img
//                   src={item.src}
//                   alt={item.alt}
//                   loading="lazy"
//                   decoding="async"
//                   className="cs-image"
//                 />
//               </AspectRatio>

//               <div className="cs-cta-wrap">
//                 <a href={item.href} aria-label={item.title} className="cs-btn">
//                   {item.title}
//                 </a>
//               </div>
//             </article>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// }

import { AspectRatio } from "@/components/ui/aspect-ratio";

interface CollectionItem {
  title: string;
  href: string;
  src: string;
  alt: string;
}

const collections: CollectionItem[] = [
  {
    title: "Explore Earrings",
    href: "/collections/earrings",
    src: "collections(Home)/1.jpg",
    alt: "Diamond stud earrings close-up shimmering with light",
  },
  {
    title: "Explore Men's Rings",
    href: "/collections/mens-rings",
    src: "collections(Home)/2.jpg",
    alt: "Men's ring on hand with metallic finish",
  },
  {
    title: "Explore Pendants",
    href: "/collections/pendants",
    src: "collections(Home)/3.jpg",
    alt: "Pendant necklace with gemstone on neckline",
  },
  {
    title: "Explore Bracelets",
    href: "/collections/bracelets",
    src: "collections(Home)/4.jpg",
    alt: "Elegant bracelet worn on wrist",
  },
];

export default function CollectionsSection() {
  return (
    <section aria-label="Collections" className="py-12 md:py-16">
      <div className="max-w-6xl mx-auto px-6 md:px-10">
        {/* Header */}
        <header className="bg-[#68C5C0;] rounded-lg shadow-lg">
          <div className="py-4 md:py-5 text-center">
            <h2
              className="m-0 font-semibold text-2xl md:text-3xl"
              style={{ color: "#ffff" }}
            >
              Collections
            </h2>
          </div>
        </header>

        {/* Grid */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
          {collections.map((item) => (
            <article
              key={item.title}
              className="relative overflow-hidden rounded-xl shadow-lg"
            >
              <AspectRatio ratio={4 / 5}>
                <img
                  src={item.src}
                  alt={item.alt}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                />
              </AspectRatio>

              {/* CTA Button */}
              <div className="absolute left-0 right-0 bottom-4 flex justify-center pointer-events-none">
                <a
                  href={item.href}
                  aria-label={item.title}
                  className="pointer-events-auto inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white border border-white/90 bg-black/25 backdrop-blur rounded-full shadow-md transition duration-200 hover:bg-white hover:text-teal-700 hover:border-white focus-visible:outline focus-visible:outline-3 focus-visible:outline-teal-700/35"
                >
                  {item.title}
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
