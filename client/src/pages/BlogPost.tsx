import { useParams, Navigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, User, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";

// Define types
interface BlogSection {
  heading: string;
  text: string;
}

interface BlogPostType {
  title: string;
  date: string;
  author: string;
  category: string;
  image: string;
  excerpt: string;
  content: BlogSection[];
}

const blogContent: Record<string, BlogPostType> = {
  "solitaire-rings-guide": {
    title: "Solitaire Rings Guide",
    date: "December 15, 2024",
    author: "KYNA",
    category: "Rings",
    image: "/images/collections/mens-ring.jpg",
    excerpt:
      "Discover the timeless elegance of solitaire rings and learn how to choose the perfect one for your special moment.",
    content: [
      {
        heading: "What Are Solitaire Rings?",
        text: "Solitaire rings are the epitome of classic elegance for symbolically and aesthetically speaking. Whether you're considering a solitaire engagement ring, or want to add this classic style to your jewelry collection, it's good to know what makes a ring a solitaire and what you can expect from this type of ring. The defining characteristic of a solitaire ring is its single center stone that sits prominently above the band, like a crown in a royal favorite.",
      },
      {
        heading: "When To Solder Rings Together",
        text: "Solitaire rings and bands meant rings become together using a means called soldered. You likes help permanently secure the rings, choosing a solitaire and one ring band or band of women. The most common type of settings tend to join engagement rings and wedding bands for a polished look. Permanent contact, and aesthetic mechanic achieved them rings.",
      },
      {
        heading: "Pros Of Soldered Rings",
        text: "Soldering rings together offers several advantages:\n\n• Improved alignment: Ensure exceptional rings positioning benefits any pumping choice, creating a seamless look.\n• Enhanced Comfort: Proper band arrangements unify for basic movement, enhancing purchasing.\n• Reduced Wear: Solitaire rings relating less with general decreased wear on both rings.\n• Secure fit: Band rings in place, reducing the chance of a ring lost.",
      },
    ],
  },
  "diamond-care-guide": {
    title: "Diamond Care & Maintenance",
    date: "December 12, 2024",
    author: "KYNA",
    category: "Care",
    image: "/images/collections/pendant.jpg",
    excerpt:
      "Essential tips to keep your diamonds sparkling and maintain their brilliance for years to come.",
    content: [
      {
        heading: "Daily Diamond Care",
        text: "Diamonds are among the hardest natural substances, but they still require proper care to maintain their brilliance. Daily exposure to oils from your skin, lotions, and environmental factors can dull their sparkle over time.",
      },
      {
        heading: "Cleaning Your Diamonds",
        text: "Regular cleaning is essential for maintaining your diamond's fire and brilliance. Use warm water with mild dish soap and a soft brush to gently clean your diamonds. Avoid harsh chemicals and ultrasonic cleaners unless recommended by a professional.",
      },
      {
        heading: "Storage and Protection",
        text: "Store your diamond jewelry separately to prevent scratching. Use individual soft pouches or a jewelry box with compartments. Remove diamond jewelry before engaging in physical activities, cleaning, or gardening.",
      },
    ],
  },
};

const BlogPost = () => {
  const { id } = useParams<{ id: string }>();

  if (!id || !blogContent[id]) {
    return <Navigate to="/blogs" replace />;
  }

  const post = blogContent[id];

  return (
    <>
      <SEO
        title={`${post.title} | KYNA Blog`}
        description={post.excerpt}
        canonical={`/blog/${id}`}
      />

      <main className="min-h-screen bg-background">
        {/* breadcrumbs */}
        <div className="container max-w-6xl mx-auto px-4 py-3">
          <nav className="text-sm text-gray-600">
            <Link to="/" className="hover:text-teal-600">
              Home
            </Link>
            <span className="mx-2">-</span>
            <Link to="/blogs" className="hover:text-teal-600">
              Blog
            </Link>
            <span className="mx-2">-</span>
            <span className="text-gray-800">{post.title}</span>
          </nav>
        </div>
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Link
            to="/blogs"
            className="inline-flex items-center text-[#328F94] hover:text-primary/80 mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Blog
          </Link>

          <article>
            <header className="mb-8">
              <div className="aspect-[16/9] w-full mb-6 rounded-lg overflow-hidden">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center text-muted-foreground text-sm">
                  <Calendar className="w-4 h-4 mr-1" />
                  {post.date}
                </div>
                <div className="flex items-center text-muted-foreground text-sm">
                  <User className="w-4 h-4 mr-1" />
                  {post.author}
                </div>
              </div>

              <h1 className="text-4xl font-bold text-foreground mb-4">
                {post.title}
              </h1>

              <p className="text-lg text-muted-foreground">{post.excerpt}</p>
            </header>

            <div className="prose prose-lg max-w-none">
              {post.content.map((section, index) => (
                <section key={index} className="mb-8">
                  <h2 className="text-2xl font-semibold text-foreground mb-4">
                    {section.heading}
                  </h2>
                  <div className="text-muted-foreground whitespace-pre-line">
                    {section.text}
                  </div>
                </section>
              ))}
            </div>
          </article>

          <div className="mt-12 pt-8 border-t">
            <h3 className="text-xl font-semibold mb-6">Related Articles</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(blogContent)
                .filter(([key]) => key !== id)
                .slice(0, 2)
                .map(([key, relatedPost]) => (
                  <Card
                    key={key}
                    className="group cursor-pointer hover:shadow-lg transition-shadow duration-300"
                  >
                    <Link to={`/blog/${key}`}>
                      <div className="aspect-video overflow-hidden rounded-t-lg">
                        <img
                          src={relatedPost.image}
                          alt={relatedPost.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <CardContent className="p-4">
                        {/* <Badge variant="secondary" className="text-xs mb-2">
                          {relatedPost.category}
                        </Badge> */}
                        <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors mb-2">
                          {relatedPost.title}
                        </h4>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {relatedPost.excerpt}
                        </p>
                      </CardContent>
                    </Link>
                  </Card>
                ))}
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default BlogPost;
