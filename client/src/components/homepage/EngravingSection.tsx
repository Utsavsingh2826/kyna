import { Link } from "react-router-dom";
export default function DesignBanner() {
  return (
    <section
      aria-label="Design your own jewelry"
      className=" pb-8 px-0 md:px-8 lg:px-16"
    >
      {/* Full-width background image */}
      {/* <img
          src="/ring.jpg"
          alt="Ring background"
          className="absolute rounded-2xl md:px-8 lg:px-16 inset-0 w-full h-full"
        /> */}

      {/* Spacer to control how much background is visible */}
      {/* <div className="min-h-[600px] md:min-h-[720px]" /> */}

      {/* Teal overlay panel - full width */}
      <div className="bg-[url(/ring.jpg)] bg-cover bg-center py-8 sm:py-3 md:px-8 lg:px-5 inset-x-0 bottom-0 flex items-end z-10">
        <article
          className="shadow-lg w-full"
          role="region"
          aria-label="Custom jewelry design call-to-action"
        >
          <div className="flex mx-10 flex-col md:flex-row justify-between items-center gap-8 max-w-[1600px] sm:mx-auto">
            <div></div>
            {/* White Content Box */}
            <div className="flex flex-col justify-center items-center sm:items-start bg-white/90 mt-0 x-2 sm:mt-28 sm:bg-white p-8 rounded-xl shadow-lg max-w-md w-full md:w-1/3 relative z-20">
              <h3 className="text-2xl md:text-3xl font-light mb-6 text-gray-800">
                Engraving
              </h3>
              <p className="text-sm text-center sm:text-start text-gray-600 leading-relaxed mb-6">
                Engravable jewellery is a special gift idea for people who are
                close to each other. That is why you can have our jewellery
                personalised with an engraving, as our gift to you. Start
                engraving and explore the full range of our creations with
                engraving options here.
              </p>
              <Link to="/engravings">
                <button className="border-2 border-[#68C5C0] text-[#68C5C0] px-8 py-3 rounded hover:bg-[#68C5C0] hover:text-white transition-all duration-300 font-medium">
                  Start Engraving
                </button>
              </Link>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
