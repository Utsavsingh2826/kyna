import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, ArrowRight } from "lucide-react";
import SEO from "@/components/SEO";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Blog {
  _id: string;
  title: string;
  displayImage: string;
}

const Blogs = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address.");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/marketing/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success(data.message || "Subscribed successfully!");
        setEmail("");
      } else {
        toast.error(data.message || "Failed to subscribe. Please try again.");
      }
    } catch (error) {
      console.error("Subscription error:", error);
      toast.error("Something went wrong. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch blogs from backend
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/blogs");
        if (!response.ok) {
          throw new Error("Failed to fetch blogs");
        }
        const data = await response.json();
        setBlogs(data.data.blogs || []);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  return (
    <div>
      <SEO
        title="Jewelry Blog | Expert Tips & Guides | KYNA"
        description="Discover expert jewelry insights, care tips, and style guides. Learn about diamonds, engagement rings, and custom jewelry design."
        canonical="/blogs"
      />

      <main className="min-h-screen bg-background">
        <div className="container mx-auto max-w-6xl">
          {/* Breadcrumb */}
          <div className="bg-white">
            <div className="container mx-auto px-4 py-3">
              <nav className="text-sm text-gray-600">
                <Link to="/" className="hover:text-teal-600">
                  Home
                </Link>
                <span className="mx-2">-</span>
                <span className="text-gray-800">Blogs</span>
              </nav>
            </div>
          </div>

          {/* Hero Section */}
          <div className="py-10 px-4 md:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-10 items-center">
                <div className="px-10 text-center sm:text-left sm:px-0 space-y-4">
                  <h1
                    className="text-[28px] sm:text-[32px] leading-[100%]"
                    style={{ fontFamily: "Kaushan Script, cursive" }}
                  >
                    The Blog
                  </h1>
                  <h2
                    className="text-[40px] sm:text-[70px] leading-[100%] font-light"
                    style={{ fontFamily: "KoPub Batang, serif" }}
                  >
                    Explore the Art of Timeless Jewelry Craftsmanship
                  </h2>
                  <p
                    className="text-sm sm:text-[18px] text-muted-foreground"
                    style={{ fontFamily: "Poppins, sans-serif" }}
                  >
                    Discover the beauty, heritage, and elegance behind every
                    piece. Our blogs bring you styling tips, care guides, and
                    the latest trends to celebrate your unique style and passion
                    for timeless jewelry.
                  </p>
                  <Link to="/about" className="inline-block mt-4">
                    <div className="border rounded-xl bg-white border-[#68C5C0] w-fit">
                      <button className="m-2 border rounded-xl bg-[#68C5C0] text-white h-full text-sm font-semibold px-2 py-2 transition-colors duration-300 hover:bg-white hover:text-[#68C5C0]">
                        Our Stories
                        <ArrowRight className="ml-2 w-4 h-4 inline" />
                      </button>
                    </div>
                  </Link>
                </div>

                <div className="flex flex-col items-center">
                  <img
                    src="/blogs/hero.jpg"
                    alt="Jewellery Moment"
                    className="rounded-3xl w-full max-w-md object-cover mb-6"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="bg-[#328F94] text-white h-24 gap-12 flex justify-center items-center">
          <div
            style={{ fontFamily: "Poppins, sans-serif" }}
            className="flex max-w-sm flex-col"
          >
            <h2 className="font-bold">Let's Keep In Touch</h2>
            <p className="text-[12px] text-wrap">
              Be the first to know about new arrivals,
              <br /> exclusive offers, and the latest trends.
            </p>
          </div>
          <div className="">
            <form className="flex gap-2" onSubmit={handleSubscribe}>
              <Input
                type="email"
                placeholder="Your Email Address"
                className="flex-1 text-black"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
              <Button
                type="submit"
                className="px-3 h-10 bg-[#68C5C0] hover:bg-[#5ab3ae]"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <ArrowRight className="h-4 w-4 text-white" />
                )}
              </Button>
            </form>
          </div>
        </div>
        {/* Blog Cards Section */}
        <div className="container flex justify-center mx-auto px-4 py-8">
          {loading ? (
            <p className="text-gray-500">Loading blogs...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <div className="max-w-6xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogs.map((post) => (
                <Card
                  key={post._id}
                  className="group cursor-pointer hover:shadow-lg transition-shadow duration-300"
                >
                  <Link to={`/blog/${post._id}`}>
                    <div className="aspect-square overflow-hidden rounded-t-lg">
                      <img
                        src={post.displayImage}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <h3
                          style={{ fontFamily: "KoPub Batang, serif" }}
                          className="text-xl text-foreground mb-3 group-hover:text-primary transition-colors"
                        >
                          {post.title}
                        </h3>
                        <Heart className="w-5 h-5 hover:text-primary cursor-pointer" />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#328F94] text-sm font-medium group-hover:underline">
                          Read More →
                        </span>
                      </div>
                    </CardContent>
                  </Link>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Blogs;
