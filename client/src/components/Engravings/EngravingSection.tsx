export default function EngravingSection() {
  return (
    <section aria-label="Engraving section" className="relative mt-12 md:mt-16">
      {/* Background image */}
      <div
        className="absolute inset-0 -z-10 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "url('/lovable-uploads/5392cf55-b28f-4fbd-8889-824dfe20dc8f.png')",
        }}
        aria-hidden="true"
      />

      {/* Spacer for section height */}
      <div className="min-h-[520px] md:min-h-[640px]" />

      {/* Overlay with panel */}
      <div className="absolute inset-0 z-10 flex items-end justify-end">
        <article
          className="w-full bg-white text-[#0b0b0b] rounded-tl-xl shadow-[0_10px_30px_-10px_rgba(0,0,0,0.35)] p-6 md:w-1/2 md:h-1/2 md:p-8 lg:w-1/3"
          role="region"
          aria-label="Engraving information"
        >
          <p className="m-0 text-[0.9375rem] leading-[1.7] md:text-base">
            Engravable jewellery is a special gift idea for people who are close
            to each other. That is why you can have our jewellery personalised
            with an engraving, as our gift to you. Start engraving and explore
            the full range of our creations with engraving options here.
          </p>

          {/* Button */}
          <div className="mt-6">
            <a
              href="/engraving"
              aria-label="Start engraving"
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-[hsl(177,45%,59%)] border border-[hsl(177,45%,59%)] bg-transparent rounded-lg no-underline transition-all duration-200 ease-in-out shadow-[0_8px_24px_-12px_rgba(0,0,0,0.2)] hover:bg-[hsl(177,45%,59%)] hover:text-white focus-visible:outline focus-visible:outline-3 focus-visible:outline-[hsl(177,45%,59%/.35)] focus-visible:outline-offset-2 focus-visible:border-transparent"
            >
              Start Engraving
            </a>
          </div>
        </article>
      </div>
    </section>
  );
}
