import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Heart } from "lucide-react";
import SEO from "@/components/SEO";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const blogPosts = [
  {
    id: "solitaire-rings-guide",
    title: "Solitaire Rings Guide",
    excerpt:
      "Discover the timeless elegance of solitaire rings and learn how to choose the perfect one for your special moment.",
    image: "/blogs/display.png",
    date: "December 15, 2024",
    category: "Rings",
  },
  {
    id: "diamond-care-guide",
    title: "Diamond Care & Maintenance",
    excerpt:
      "Essential tips to keep your diamonds sparkling and maintain their brilliance for years to come.",
    image: "/blogs/display.png",
    date: "December 12, 2024",
    category: "Care",
  },
  {
    id: "engagement-ring-styles",
    title: "Modern Engagement Ring Styles",
    excerpt:
      "Explore contemporary engagement ring designs that perfectly capture your unique love story.",
    image: "/blogs/display.png",
    date: "December 10, 2024",
    category: "Engagement",
  },
  {
    id: "jewelry-metals-guide",
    title: "Choosing the Right Metal",
    excerpt:
      "A comprehensive guide to different jewelry metals and their unique properties and benefits.",
    image: "/blogs/display.png",
    date: "December 8, 2024",
    category: "Materials",
  },
  {
    id: "custom-jewelry-process",
    title: "Custom Jewelry Design Process",
    excerpt:
      "Learn about our bespoke jewelry creation process from initial concept to finished masterpiece.",
    image: "/blogs/display.png",
    date: "December 5, 2024",
    category: "Custom",
  },
  {
    id: "jewelry-gifting-guide",
    title: "Perfect Jewelry Gifts",
    excerpt:
      "Find the ideal jewelry gift for every occasion with our comprehensive gifting guide.",
    image: "/blogs/display.png",
    date: "December 3, 2024",
    category: "Gifting",
  },
];

const Blogs = () => {
  return (
    <div className="">
      <SEO
        title="Jewelry Blog | Expert Tips & Guides | KYNA"
        description="Discover expert jewelry insights, care tips, and style guides. Learn about diamonds, engagement rings, and custom jewelry design."
        canonical="/blogs"
      />

      <main className="min-h-screen bg-background">
        <div className="container mx-auto max-w-6xl">
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
          <div className="py-10 px-4 md:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-10 items-center">
                {/* Text Content */}
                <div className="px-10 text-center sm:text-left sm:px-0 space-y-4">
                  <h1
                    className="text-[28px] sm:text-[32px] leading-[100%] tracking-[0] font-normal"
                    style={{ fontFamily: "Kaushan Script, cursive" }}
                  >
                    The Blog
                  </h1>

                  <h2
                    className="text-[40px] sm:text-[70px] leading-[100%] tracking-[0] font-light"
                    style={{ fontFamily: "KoPub Batang, serif" }}
                  >
                    Explore the Art of Timeless Jewelry Craftsmanship
                  </h2>

                  <p
                    className="text-sm sm:text-[18px] leading-[138%] tracking-[0] font-normal text-muted-foreground"
                    style={{ fontFamily: "Poppins, sans-serif" }}
                  >
                    Discover the beauty, heritage, and elegance behind every
                    piece. Our blogs bring you styling tips, care guides, and
                    the latest trends to celebrate your unique style and passion
                    for timeless jewelry.
                  </p>
                  <Link to="/about" className="inline-block mt-4">
                    <div className="border rounded-xl bg-white border-[#68C5C0] w-fit">
                      <button className="m-2 border rounded-xl bg-[#68C5C0] text-white h-full text-sm font-semibold px-2 py-2 transition-colors duration-300 hover:bg-white hover:text-[#68C5C0] ">
                        Our Stories
                        <ArrowRight className="ml-2 w-4 h-4 inline" />
                      </button>
                    </div>
                  </Link>
                </div>

                {/* Image + Quote */}
                <div className="flex flex-col items-center">
                  {/* Replace with your uploaded image */}
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
            <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
              <Input
                type="email"
                placeholder="Your Email Address"
                className="flex-1"
              />
              <Button
                type="submit"
                className="px-3 h-10 bg-[#68C5C0] hover:bg-[#5ab3ae]"
              >
                <ArrowRight className="h-4 w-4 text-white" />
              </Button>
            </form>
          </div>
        </div>
        <div className="container flex justify-center mx-auto px-4 py-8">
          <div className="max-w-6xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post) => (
              <Card
                key={post.id}
                className="group cursor-pointer hover:shadow-lg transition-shadow duration-300"
              >
                <Link to={`/blog/${post.id}`}>
                  <div className="aspect-square overflow-hidden rounded-t-lg">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3
                        style={{ fontFamily: "KoPub Batang, serif" }}
                        className="text-xl  text-foreground mb-3 group-hover:text-primary transition-colors"
                      >
                        {post.title}
                      </h3>
                      <Heart className="w-5 h-5  hover:text-primary cursor-pointer" />
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
        </div>
      </main>
    </div>
  );
};

export default Blogs;
