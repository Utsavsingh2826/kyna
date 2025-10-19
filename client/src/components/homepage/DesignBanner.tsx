import rring from "/3ring.png";
export default function DesignBanner() {
  return (
    <section
      aria-label="Design your own jewelry"
      className="relative mt-10 md:mt-14"
    >
      {/* Full-width background image */}
      <img
        src="/rings.jpg"
        alt="Ring background"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Spacer to control how much background is visible */}
      <div className="min-h-[600px] md:min-h-[720px]" />

      {/* Teal overlay panel - full width */}
      <div className="absolute inset-x-0 bottom-0 flex items-end z-10">
        <article
          className="bg-[#68C5C0;] text-white shadow-lg w-full"
          role="region"
          aria-label="Custom jewelry design call-to-action"
        >
          <div className="p-8 md:p-12 flex flex-col md:flex-row justify-between items-center gap-8 max-w-[1600px] mx-auto">
            {/* Left text section */}
            <div className="max-w-xl">
              <h2 className="font-[Poppins] font-light text-[40px] md:text-[64px] leading-[148%]">
                Design Your Own
              </h2>
              <p className="mt-4 font-[Poppins] font-normal text-[16px] md:text-[20px] leading-[148%]">
                Looking to find something truly unique? Our online jewelry
                design tool lets you create your perfect piece. It’s simple –
                you design it and we carefully hand craft it for you. Give a
                try!
              </p>

              {/* Buttons */}
              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href="#upload"
                  className="inline-flex items-center justify-center px-6 py-3 text-sm font-semibold text-white border border-white bg-transparent rounded-full shadow-md backdrop-blur-sm transition hover:bg-white hover:text-[#267d79]"
                >
                  Upload Your Design
                </a>
                <a
                  href="#build"
                  className="inline-flex items-center justify-center px-6 py-3 text-sm font-semibold text-white border border-white bg-transparent rounded-full shadow-md backdrop-blur-sm transition hover:bg-white hover:text-[#267d79]"
                >
                  Build Your Jewellery
                </a>
              </div>
            </div>

            {/* Right image section */}
            <div className="flex-shrink-0">
              <img
                src={rring}
                alt="Ring showcase"
                className="max-h-[250px] md:max-h-[300px] object-contain"
              />
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
