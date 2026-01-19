import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/store";
import { logoutSucceeded } from "@/store/slices/authSlice";
import { clearAccessToken } from "@/lib/authToken";
import {
  Menu,
  User,
  Heart,
  Calendar,
  ShoppingCart,
  Phone,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import logo from "/logo.png";

declare global {
  interface CalendlyWidget {
    initPopupWidget(options: { url: string }): void;
  }

  interface Window {
    Calendly: CalendlyWidget;
  }
}

export {};

export default function Navbar() {
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated,
  );
  const displayName = useSelector(
    (state: RootState) => state.auth.user?.firstName,
  );
  const cart = useSelector((state: RootState) => state.cart.cart);
  const [isUserMenuOpen, setIsUserMenuOpen] = React.useState(false);
  const userMenuRef = React.useRef<HTMLDivElement | null>(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Calculate unique product count from cart
  const cartItemCount = cart?.items?.length || 0;

  // Fetch cart data when user is authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      // Import fetchCart from cart slice
      import("@/store/slices/cartSlice").then(({ fetchCart }) => {
        dispatch(fetchCart() as any);
      });
    }
  }, [isAuthenticated, dispatch]);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        isUserMenuOpen &&
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setIsUserMenuOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isUserMenuOpen]);

  const openCalendly = () => {
    window.Calendly.initPopupWidget({
      url: "https://calendly.com/pranaytiwariprpk",
    });
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem("isAuthenticated");
      localStorage.removeItem("displayName");
    } catch {
      /* ignore storage errors */
    }
    clearAccessToken();
    dispatch(logoutSucceeded());
    setIsUserMenuOpen(false);
    navigate("/");
  };
  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Brand and quick actions */}
      <div className="border-b bg-[#68C5C0] text-cta-foreground">
        <div className="mx-auto max-w-10xl px-4 md:px-6">
          <div>
            <div className="flex items-start justify-between md:grid md:grid-cols-3">
              {/* Left side */}
              <div className="flex mt-2 md:gap-4 text-white ">
                <a href="tel:+918920610062" className="flex mt-1">
                  <Phone className="w-5 h-5" />
                  <span className="hover:underline hidden md:inline">
                    +91 8920610062
                  </span>
                </a>

                <button
                  onClick={openCalendly}
                  className="inline ld:px-4 hover:underline ml-2 text-white hover:text-gray-100"
                >
                  <Calendar className="w-5 h-5 inline-block mr-1" />
                  <p className="hidden md:inline"> Book Virtual Appointment</p>
                </button>
              </div>
              {/* Brand */}
              <Link
                to="/"
                className="hidden md:flex md:col-start-2 md:col-end-3 md:justify-self-center"
              >
                <img
                  src={logo}
                  alt="KYNA"
                  className="h-20 py-3 font-semibold tracking-widest text-lg"
                />
              </Link>
              {/* Quick actions */}
              <div className="flex items-center gap-0 sm:gap-3 text-foreground/80 md:col-start-3 md:col-end-4 md:justify-self-end relative">
                <button
                  aria-label="Search"
                  className="p-2 hover:text-foreground"
                ></button>
                <div className="relative" ref={userMenuRef}>
                  <button
                    aria-label="Account"
                    className="p-2 hover:text-foreground sm:inline-flex"
                    onClick={() => setIsUserMenuOpen((v) => !v)}
                  >
                    <User className="h-5 w-5 text-white" />
                  </button>
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-52 rounded-md border bg-white shadow-lg z-50">
                      <div className="py-1">
                        {isAuthenticated ? (
                          <>
                            <div className="px-3 py-2 text-xs text-gray-500">
                              {displayName
                                ? `Signed in as ${displayName}`
                                : "Signed in"}
                            </div>
                            <button
                              className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-[#68C5C0]/15"
                              onClick={() => {
                                setIsUserMenuOpen(false);
                                navigate("/profile");
                              }}
                            >
                              Profile
                            </button>
                            <button
                              className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-[#68C5C0]/15"
                              onClick={handleLogout}
                            >
                              Logout
                            </button>
                          </>
                        ) : (
                          <>
                            <Link
                              to="/login"
                              onClick={() => setIsUserMenuOpen(false)}
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-[#68C5C0]/15"
                            >
                              Login
                            </Link>
                            <Link
                              to="/signup"
                              onClick={() => setIsUserMenuOpen(false)}
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-[#68C5C0]/15"
                            >
                              Sign up
                            </Link>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <Link
                  to="/wishlist"
                  aria-label="Wishlist"
                  className="p-2 hover:text-foreground sm:inline-flex"
                >
                  <Heart className="h-5 w-5 text-white" />
                </Link>
                <Link
                  to="/cart"
                  aria-label="Cart"
                  className="p-2 hover:text-foreground relative"
                >
                  <ShoppingCart className="h-5 w-5 text-white" />
                  {cartItemCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-red-500 rounded-full shadow-md border-2 border-[#68C5C0]">
                      {cartItemCount}
                    </span>
                  )}
                </Link>
              </div>
            </div>
            <div className="relative md:hidden flex justify-center my-2">
              <div className="absolute left-4 top-4">
                <MobileMenu />
              </div>
              <Link to="/" className="">
                <img
                  src={logo}
                  alt="KYNA"
                  className="h-20 font-semibold tracking-widest text-lg"
                />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
function MobileMenu() {
  const [openSections, setOpenSections] = React.useState<
    Record<string, boolean>
  >({});

  const toggleSection = (sectionTitle: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [sectionTitle]: !prev[sectionTitle],
    }));
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          className="bg-white"
          variant="outline"
          size="icon"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="w-80 bg-white max-h-screen overflow-y-auto"
      >
        <nav className="mt-6 space-y-2">
          <CollapsibleSection
            title="Rings"
            items={["Solitaire Rings", "Engagement Rings", "Fashion Rings"]}
            isOpen={!!openSections["Rings"]}
            onToggle={() => toggleSection("Rings")}
          />
          <CollapsibleSection
            title="Earrings"
            items={[
              "Studs",
              "Hoops / Huggies",
              "Halo Earrings",
              "Fashion Earrings",
              "Drop Earrings",
            ]}
            isOpen={!!openSections["Earrings"]}
            onToggle={() => toggleSection("Earrings")}
          />
          <CollapsibleSection
            title="Pendants"
            items={["Solitaire Pendants", "Fashion Pendants", "Solitaire Halo"]}
            isOpen={!!openSections["Pendants"]}
            onToggle={() => toggleSection("Pendants")}
          />
          <CollapsibleSection
            title="Jewellery"
            items={[
              "Rings",
              "Earrings",
              "Pendants",
              "Bracelets",
              "Design Your Own",
              "Upload Your Design",
              "Build Your Jewellery",
              "Engraving",
            ]}
            isOpen={!!openSections["Jewellery"]}
            onToggle={() => toggleSection("Jewellery")}
          />
          {/* Nested Collapsible for Design Your Own */}
          <div>
            <CollapsibleSection
              title="Design Your Own"
              items={["Upload Your Design", "Build Your Jewellery"]}
              isOpen={!!openSections["Design Your Own"]}
              onToggle={() => toggleSection("Design Your Own")}
              hasSubItems={true}
            />
            {/* Nested: Upload Your Design */}
            {openSections["Design Your Own"] && (
              <div className="ml-4">
                <CollapsibleSection
                  title="Upload Your Design"
                  items={[
                    "Rings",
                    "Earrings",
                    "Pendants",
                    "Bracelets",
                    "Necklaces",
                    "Bangles",
                  ]}
                  isOpen={!!openSections["Upload Your Design"]}
                  onToggle={() => toggleSection("Upload Your Design")}
                  hasSubItems={true}
                />
                {/* Nested: Build Your Jewellery */}
                <CollapsibleSection
                  title="Build Your Jewellery"
                  items={[
                    "Rings",
                    "Earrings",
                    "Pendants",
                    "Bracelets",
                    "Gents Rings",
                  ]}
                  isOpen={!!openSections["Build Your Jewellery"]}
                  onToggle={() => toggleSection("Build Your Jewellery")}
                  hasSubItems={true}
                />
              </div>
            )}
          </div>
          <CollapsibleSection
            title="Engraving"
            items={[]}
            isOpen={!!openSections["Engraving"]}
            onToggle={() => toggleSection("Engraving")}
            hasSubItems={false}
          />
          <CollapsibleSection
            title="Gifting"
            items={[
              "Under Rs. 25,000/-",
              "Rs. 25,001/- to 50,000/-",
              "Gift Card",
            ]}
            isOpen={!!openSections["Gifting"]}
            onToggle={() => toggleSection("Gifting")}
          />
          <CollapsibleSection
            title="About"
            items={["Our Story", "Contact"]}
            isOpen={!!openSections["About"]}
            onToggle={() => toggleSection("About")}
          />
        </nav>
      </SheetContent>
    </Sheet>
  );
}

// Helpers to generate links for mobile menu items
function slugify(label: string): string {
  return label
    .replace(/\s+/g, "+") // Replace spaces with '+'
    .replace(/[^a-zA-Z0-9+]/g, "") // Remove special characters except '+'
    .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize first letter of each word
}

function getBasePath(sectionTitle: string): string {
  switch (sectionTitle) {
    case "Rings":
      return "/rings";
    case "Earrings":
      return "/earrings";
    case "Pendants":
      return "/pendants";
    case "Jewellery":
      return "/jewellery";
    case "Gifting":
      return "/gifting";
    case "About":
      return "/about";
    default:
      return "/";
  }
}

function getLinkForItem(sectionTitle: string, itemLabel: string): string {
  switch (sectionTitle) {
    case "Rings":
      switch (itemLabel) {
        case "Solitaire Rings":
          return "/rings?ring_category=Solitaire+Rings";
        case "Engagement Rings":
          return "/rings?ring_category=Engagement+Rings";
        case "Fashion Rings":
          return "/rings?ring_category=Fashion+Rings";
        default:
          return "/rings";
      }
    case "Earrings":
      switch (itemLabel) {
        case "Studs":
          return "/earrings?category1=stud%27s&centerStoneShape=&category2=&category3=";
        case "Hoops / Huggies":
          return "/earrings?category1=hoops/huggies&centerStoneShape=&category2=&category3=";
        case "Halo Earrings":
          return "/earrings?category1=halo&centerStoneShape=&category2=&category3=";
        case "Fashion Earrings":
          return "/earrings?category1=fashion+earrings&centerStoneShape=&category2=&category3=";
        case "Drop Earrings":
          return "/earrings?category1=drop+earrings&centerStoneShape=&category2=&category3=";
        default:
          return "/earrings";
      }
    case "Pendants":
      switch (itemLabel) {
        case "Solitaire Pendants":
          return "/pendants?pendant_category=Solitaire+Pendants";
        case "Fashion Pendants":
          return "/pendants?pendant_category=Fashion+Pendants";
        case "Solitaire Halo":
          return "/pendants?pendant_category=Solitaire+Halo";
        default:
          return "/pendants";
      }
    case "Jewellery":
      switch (itemLabel) {
        case "Rings":
          return "/rings";
        case "Earrings":
          return "/earrings";
        case "Pendants":
          return "/pendants";
        case "Bracelets":
          return "/bracelets";
        case "Upload Your Design":
          return "/upload-your-design/rings";
        case "Build Your Jewellery":
          return "/build-your-jewellery/Rings";
        case "Engraving":
          return "/engravings";
        default:
          return "/jewellery";
      }
    case "Design Your Own":
      switch (itemLabel) {
        case "Upload Your Design":
          return "/upload-your-design/rings";
        case "Build Your Jewellery":
          return "/build-your-jewellery/Rings";
        default:
          return "/design-your-own";
      }
    case "Build Your Jewellery":
      switch (itemLabel) {
        case "Rings":
          return "/build-your-jewellery/Rings";
        case "Earrings":
          return "/build-your-jewellery/Earrings";
        case "Bracelets":
          return "/build-your-jewellery/Bracelets";
        case "Pendants":
          return "/build-your-jewellery/Pendants";
        case "Gents Rings":
          return "/build-your-jewellery/Gents-Rings";
        default:
          return "/build-your-jewellery";
      }
    case "Gifting":
      switch (itemLabel) {
        case "Under Rs. 25,000/-":
          return "/gifting/0-25000";
        case "Rs. 25,001/- to 50,000/-":
          return "/gifting/25000-50000";
        case "Gift Card":
          return "/gifting/gift-card";
        default:
          return "/gifting";
      }
    case "About":
      switch (itemLabel) {
        case "Our Story":
          return "/about";
        case "Contact":
          return "/customer-service";
        default:
          return "/about";
      }
    default:
      return "/";
  }
}

// Image data for Upload Your Design
const uploadDesignImages: Record<
  string,
  { src: string; label: string; path: string }
> = {
  Rings: {
    src: "/navigation/upload-your-design/ring.jpg",
    label: "Rings",
    path: "/upload-your-design/rings",
  },
  Earrings: {
    src: "/navigation/upload-your-design/earrings.png",
    label: "Earrings",
    path: "/upload-your-design/earrings",
  },
  Pendants: {
    src: "/navigation/upload-your-design/pendants.png",
    label: "Pendants",
    path: "/upload-your-design/pendants",
  },
  Bracelets: {
    src: "/navigation/upload-your-design/bracelets.png",
    label: "Bracelets",
    path: "/upload-your-design/bracelets",
  },
  Necklaces: {
    src: "/navigation/upload-your-design/necklace.jpg",
    label: "Necklaces",
    path: "/upload-your-design/necklaces",
  },
  Bangles: {
    src: "/navigation/upload-your-design/bangeldisplay.png",
    label: "Bangles",
    path: "/upload-your-design/bangles",
  },
};

// Image data for Build Your Jewellery
const buildJewelleryImages: Record<
  string,
  { src: string; label: string; path: string }
> = {
  Rings: {
    src: "/navigation/build-your-jewellery/rings.jpg",
    label: "Engagement / Solitaire Rings",
    path: "/build-your-jewellery/Rings",
  },
  Earrings: {
    src: "/navigation/build-your-jewellery/earrings.png",
    label: "Earring Studs",
    path: "/build-your-jewellery/Earrings",
  },
  Bracelets: {
    src: "/navigation/build-your-jewellery/bracelate.png",
    label: "Tennis Bracelets",
    path: "/build-your-jewellery/Bracelets",
  },
  Pendants: {
    src: "/navigation/build-your-jewellery/pendants.png",
    label: "Solitaire Pendants",
    path: "/build-your-jewellery/Pendants",
  },
  "Gents Rings": {
    src: "/navigation/build-your-jewellery/band.png",
    label: "Wedding Bands",
    path: "/build-your-jewellery/Gents-Rings",
  },
};

function CollapsibleSection({
  title,
  items,
  isOpen,
  onToggle,
  hasSubItems = true,
}: {
  title: string;
  items: string[];
  isOpen: boolean;
  onToggle: () => void;
  hasSubItems?: boolean;
}) {
  const hasItems = hasSubItems && items.length > 0;

  // Check if this section should display images
  const shouldShowImages =
    title === "Upload Your Design" || title === "Build Your Jewellery";
  const imageData =
    title === "Upload Your Design" ? uploadDesignImages : buildJewelleryImages;

  return (
    <div className="border-b border-gray-100 last:border-b-0">
      <div className="flex items-center justify-between">
        {/* Main category link */}
        <div className="flex items-center justify-between">
          {/* For NON-clickable titles: only toggle, no navigation */}
          {[
            "Design Your Own",
            "Upload Your Design",
            "Build Your Jewellery",
          ].includes(title) ? (
            <button
              onClick={onToggle}
              className="flex-1 text-left rounded-md px-3 py-3 text-sm font-medium uppercase tracking-wide text-muted-foreground hover:bg-[#68C5C0]/15"
            >
              {title}
            </button>
          ) : (
            <SheetClose asChild>
              <NavLink
                to={getBasePath(title)}
                className={({ isActive }) =>
                  `flex-1 block rounded-md px-3 py-3 text-sm font-medium uppercase tracking-wide hover:bg-[#68C5C0]/15 ${
                    isActive
                      ? "bg-[#68C5C0]/20 text-foreground"
                      : "text-muted-foreground"
                  }`
                }
              >
                {title}
              </NavLink>
            </SheetClose>
          )}

          {/* Expand / collapse arrow */}
          {hasItems && (
            <button
              onClick={onToggle}
              className="p-2 hover:bg-[#68C5C0]/15 rounded-md"
            >
              {isOpen ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
          )}
        </div>

        {/* Expand/Collapse button - only show if there are sub-items */}
        {/* {hasItems && (
          <button
            onClick={onToggle}
            className="p-2 hover:bg-[#68C5C0]/15 rounded-md"
            aria-label={`${isOpen ? "Collapse" : "Expand"} ${title} menu`}
          >
            {isOpen ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
        )} */}
      </div>

      {/* Sub-items - only render if expanded and has items and NOT for "Design Your Own" */}
      {hasItems &&
        isOpen &&
        title !== "Design Your Own" &&
        (shouldShowImages ? (
          // Image grid for Upload Your Design and Build Your Jewellery
          <div className="grid grid-cols-2 gap-3 pb-4 px-3 mt-2">
            {items.map((item) => {
              const itemData = imageData[item];
              if (!itemData) return null;
              return (
                <SheetClose key={item} asChild>
                  <Link
                    to={itemData.path}
                    className="flex flex-col items-center p-2 rounded-md hover:bg-[#68C5C0]/15 transition-colors"
                  >
                    <img
                      src={itemData.src}
                      alt={itemData.label}
                      className="w-full h-24 object-cover rounded mb-2"
                    />
                    <span className="text-xs text-center font-medium text-gray-700">
                      {itemData.label}
                    </span>
                  </Link>
                </SheetClose>
              );
            })}
          </div>
        ) : (
          // Text list for other sections
          <ul className="space-y-1 pb-2 ml-3">
            {items.map((item) => (
              <li key={item}>
                <SheetClose asChild>
                  <NavLink
                    to={getLinkForItem(title, item)}
                    className={({ isActive }) =>
                      `block rounded-md px-3 py-2 text-sm hover:bg-[#68C5C0]/15 ${
                        isActive ? "bg-[#68C5C0]/20" : ""
                      }`
                    }
                  >
                    {item}
                  </NavLink>
                </SheetClose>
              </li>
            ))}
          </ul>
        ))}
    </div>
  );
}
