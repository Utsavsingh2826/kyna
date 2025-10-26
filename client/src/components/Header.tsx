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
  Search,
  User,
  Heart,
  ShoppingCart,
  Phone,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import logo from "/logo.png";

export default function Navbar() {
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );
  const displayName = useSelector(
    (state: RootState) => state.auth.user?.firstName
  );
  const [isUserMenuOpen, setIsUserMenuOpen] = React.useState(false);
  const userMenuRef = React.useRef<HTMLDivElement | null>(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

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
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div>
            <div className="flex items-start justify-between md:grid md:grid-cols-3">
              {/* Left side */}
              <div className="flex mt-1 text-white ">
                <div className="flex items-start space-x-2">
                  <Phone className="w-6 h-6" />
                  <span>+91 8920610062</span>
                </div>
                <span className="hidden md:inline">
                  Book Virtual Appointment
                </span>
              </div>

              {/* Brand */}
              <Link
                to="/"
                className="hidden md:flex md:col-start-2 md:col-end-3 md:justify-self-center"
              >
                <img
                  src={logo}
                  alt="KYNA"
                  className="h-20 font-semibold tracking-widest text-lg"
                />
              </Link>
              {/* Quick actions */}
              <div className="flex items-center gap-0 sm:gap-3 text-foreground/80 md:col-start-3 md:col-end-4 md:justify-self-end relative">
                <button
                  aria-label="Search"
                  className="p-2 hover:text-foreground"
                >
                  <Search className="h-5 w-5 text-white" />
                </button>
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
                <Link to="/cart" aria-label="Cart" className="p-2 hover:text-foreground">
                  <ShoppingCart className="h-5 w-5 text-white" />
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
      <SheetContent side="left" className="w-80 bg-white">
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
                    "Ring",
                    "Earring",
                    "Pendant",
                    "Bracelet",
                    "Necklace",
                    "Bangle",
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
                    "Necklaces",
                    "Bangles",
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
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[/]+/g, " ")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
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
      return `/rings/${slugify(itemLabel)}`;
    case "Earrings":
      return `/earrings/${slugify(itemLabel)}`;
    case "Pendants":
      return `/pendants/${slugify(itemLabel)}`;
    case "Jewellery": {
      switch (itemLabel) {
        case "Rings":
          return "/rings";
        case "Earrings":
          return "/earrings";
        case "Pendants":
          return "/pendants";
        case "Bracelets":
          return "/jewellery/bracelets";
        case "Design Your Own":
          return "/design-your-own";
        case "Upload Your Design":
          return "/upload-design";
        case "Build Your Jewellery":
          return "/build-jewellery";
        case "Engraving":
          return "/engravings";
        default:
          return `/jewellery/${slugify(itemLabel)}`;
      }
    }
    case "Gifting": {
      if (itemLabel.toLowerCase().includes("gift card")) {
        return "/gifting/gift-card";
      }
      return `/gifting/${slugify(itemLabel)}`;
    }
    case "About": {
      if (itemLabel === "Our Story") return "/about";
      if (itemLabel === "Contact") return "/customer-service";
      return "/about";
    }
    default:
      return getBasePath(sectionTitle);
  }
}

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

  return (
    <div className="border-b border-gray-100 last:border-b-0">
      <div className="flex items-center justify-between">
        {/* Main category link */}
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

        {/* Expand/Collapse button - only show if there are sub-items */}
        {hasItems && (
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
        )}
      </div>

      {/* Sub-items - only render if expanded and has items and NOT for "Design Your Own" */}
      {hasItems && isOpen && title !== "Design Your Own" && (
        <ul className="space-y-1 pb-2 ml-3">
          {items.map((item) => (
            <li key={item}>
              <SheetClose asChild>
                <NavLink
                  to={
                    title === "Upload Your Design"
                      ? `/upload-your-design/${slugify(item)}`
                      : getLinkForItem(title, item)
                  }
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
      )}
    </div>
  );
}
