import { Link } from "react-router-dom";
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import rring from "/3ring.png";

export default function DesignBanner() {
  const [activeTab, setActiveTab] = useState("upload");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopOpen, setDesktopOpen] = useState(false);

  const DesignOptions = ({ showTabs = true }: { showTabs?: boolean }) => (
    <div className="p-6">
      {/* Tab buttons */}
      {showTabs && (
        <div className="flex gap-3 mb-6">
        <Button
          variant={activeTab === "upload" ? "default" : "outline"}
          size="sm"
          className={`flex-1 ${
            activeTab === "upload"
              ? "bg-[#68C5C0] hover:bg-[#68C5C0]/90 text-white border-[#68C5C0]"
              : ""
          }`}
          onClick={() => setActiveTab("upload")}
        >
          Upload Your Design
        </Button>
        <Button
          variant={activeTab === "build" ? "default" : "outline"}
          size="sm"
          className={`flex-1 ${
            activeTab === "build"
              ? "bg-[#68C5C0] hover:bg-[#68C5C0]/90 text-white border-[#68C5C0]"
              : "hover:bg-[#68C5C0]/10 hover:border-[#68C5C0] hover:text-[#68C5C0]"
          }`}
          onClick={() => setActiveTab("build")}
        >
          Build Your Jewellery
        </Button>
      </div>
      )}

      {/* Upload Your Design content */}
      {activeTab === "upload" && (
        <>
          <p className="text-sm text-muted-foreground mb-4">
            Turn any design idea into reality by uploading a drawing or an
            inspirational image.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              {
                path: "/upload-your-design/rings",
                img: "/navigation/upload-your-design/ring.jpg",
                label: "Rings",
              },
              {
                path: "/upload-your-design/earrings",
                img: "/navigation/upload-your-design/earrings.png",
                label: "Earrings",
              },
              {
                path: "/upload-your-design/pendants",
                img: "/navigation/upload-your-design/pendants.png",
                label: "Pendants",
              },
              {
                path: "/upload-your-design/bracelets",
                img: "/navigation/upload-your-design/bracelets.png",
                label: "Bracelets",
              },
              {
                path: "/upload-your-design/necklaces",
                img: "/navigation/upload-your-design/necklace.jpg",
                label: "Necklaces",
              },
              {
                path: "/upload-your-design/bangles",
                img: "/navigation/upload-your-design/bangeldisplay.jpeg",
                label: "Bangles",
              },
            ].map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="flex flex-col items-center p-2 rounded-md hover:bg-[#68C5C0]/15 transition-colors"
                onClick={() => {
                  setMobileOpen(false);
                  setDesktopOpen(false);
                }}
              >
                <img
                  src={item.img}
                  alt={item.label}
                  className="w-full h-24 md:h-32 object-cover rounded mb-2"
                />
                <span className="text-xs md:text-sm text-center font-medium text-gray-700">
                  {item.label}
                </span>
              </Link>
            ))}
          </div>
        </>
      )}

      {/* Build Your Jewellery content */}
      {activeTab === "build" && (
        <>
          <p className="text-sm text-muted-foreground mb-4">
            Use our jewellery builder to create your unique look. Style your
            way.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
            {[
              {
                path: "/build-your-jewellery/Rings",
                img: "/navigation/build-your-jewellery/rings.png",
                label: "Engagement / Solitaire Rings",
              },
              {
                path: "/build-your-jewellery/Earrings",
                img: "/navigation/build-your-jewellery/earrings.png",
                label: "Earring Studs",
              },
              {
                path: "/build-your-jewellery/Bracelets",
                img: "/navigation/build-your-jewellery/bracelate.png",
                label: "Tennis Bracelets",
              },
              {
                path: "/build-your-jewellery/Pendants",
                img: "/navigation/build-your-jewellery/pendants.png",
                label: "Solitaire Pendants",
              },
              {
                path: "/build-your-jewellery/Gents-Rings",
                img: "/navigation/build-your-jewellery/band.png",
                label: "Wedding Bands",
              },
            ].map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="flex flex-col items-center p-2 rounded-md hover:bg-[#68C5C0]/15 transition-colors"
                onClick={() => {
                  setMobileOpen(false);
                  setDesktopOpen(false);
                }}
              >
                <img
                  src={item.img}
                  alt={item.label}
                  className="w-full h-24 md:h-32 object-cover rounded mb-2"
                />
                <span className="text-xs md:text-sm text-center font-medium text-gray-700">
                  {item.label}
                </span>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );

  return (
    <section
      aria-label="Design your own jewelry"
      className="relative pb-8 px-0 sm:pb-12 md:px-8 lg:px-16 mt-20 md:mt-14"
    >
      {/* Full-width background image */}
      <img
        src="/rings.jpg"
        alt="Ring background"
        className="absolute inset-0 w-full h-full"
      />

      {/* Spacer to control how much background is visible */}
      <div className="min-h-[600px] md:min-h-[720px]" />

      {/* Teal overlay panel - full width */}
      <div className="absolute py-8 sm:py-12 md:px-8 lg:px-16 inset-x-0 bottom-0 flex items-end z-10">
        <article
          className="bg-[#68C5C0;] text-white shadow-lg w-full"
          role="region"
          aria-label="Custom jewelry design call-to-action"
        >
          <div className="p-8 md:p-8 flex flex-col md:flex-row justify-between items-center gap-8 max-w-[1600px] mx-auto">
            {/* Left text section */}
            <div className="max-w-xl">
              <h2 className="font-[Poppins] font-light text-[40px] md:text-[40px] leading-[148%]">
                Design Your Own
              </h2>
              <p className="mt-4 font-[Poppins] font-normal text-[16px] md:text-[16px] leading-[148%]">
                Looking to find something truly unique? Our online jewelry
                design tool lets you create your perfect piece. It’s simple –
                you design it and we carefully hand craft it for you. Give a
                try!
              </p>

              {/* Buttons */}
              <div className="mt-6 flex flex-wrap gap-3">
                {/* Mobile: Sheet (Sidebar) for Upload */}
                <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                  <SheetTrigger asChild className="md:hidden">
                    <button
                      className="inline-flex items-center justify-center px-6 py-3 text-sm font-semibold text-white border border-white bg-transparent rounded-full shadow-md backdrop-blur-sm transition hover:bg-white hover:text-[#267d79]"
                      onClick={() => {
                        setActiveTab("upload");
                      }}
                    >
                      Upload Your Design
                    </button>
                  </SheetTrigger>
                  <SheetContent
                    side="left"
                    className="w-80 bg-white max-h-screen overflow-y-auto"
                  >
                    <DesignOptions showTabs={false} />
                  </SheetContent>
                </Sheet>

                {/* Desktop: Dialog (Modal) for Upload */}
                <Dialog open={desktopOpen} onOpenChange={setDesktopOpen}>
                  <DialogTrigger asChild className="hidden md:inline-flex">
                    <button
                      className="inline-flex items-center justify-center px-6 py-3 text-sm font-semibold text-white border border-white bg-transparent rounded-full shadow-md backdrop-blur-sm transition hover:bg-white hover:text-[#267d79]"
                      onClick={() => {
                        setActiveTab("upload");
                      }}
                    >
                      Upload Your Design
                    </button>
                  </DialogTrigger>
                  <DialogContent className="bg-white max-w-3xl max-h-[90vh] overflow-hidden">
                    <div className="overflow-y-auto max-h-[85vh]">
                      <DesignOptions showTabs={true} />
                    </div>
                  </DialogContent>
                </Dialog>

                {/* Mobile: Sheet for Build */}
                <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                  <SheetTrigger asChild className="md:hidden">
                    <button
                      className="inline-flex items-center justify-center px-6 py-3 text-sm font-semibold text-white border border-white bg-transparent rounded-full shadow-md backdrop-blur-sm transition hover:bg-white hover:text-[#267d79]"
                      onClick={() => {
                        setActiveTab("build");
                      }}
                    >
                      Build Your Jewellery
                    </button>
                  </SheetTrigger>
                  <SheetContent
                    side="left"
                    className="w-80 bg-white max-h-screen overflow-y-auto"
                  >
                    <DesignOptions showTabs={false} />
                  </SheetContent>
                </Sheet>

                {/* Desktop: Dialog for Build */}
                <Dialog open={desktopOpen} onOpenChange={setDesktopOpen}>
                  <DialogTrigger asChild className="hidden md:inline-flex">
                    <button
                      className="inline-flex items-center justify-center px-6 py-3 text-sm font-semibold text-white border border-white bg-transparent rounded-full shadow-md backdrop-blur-sm transition hover:bg-white hover:text-[#267d79]"
                      onClick={() => {
                        setActiveTab("build");
                      }}
                    >
                      Build Your Jewellery
                    </button>
                  </DialogTrigger>
                  <DialogContent className="bg-white max-w-3xl max-h-[90vh] overflow-hidden">
                    <div className="overflow-y-auto max-h-[85vh]">
                      <DesignOptions showTabs={true} />
                    </div>
                  </DialogContent>
                </Dialog>
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
