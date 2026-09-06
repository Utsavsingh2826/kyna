import { useParams, Navigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, User, ArrowLeft } from "lucide-react";
import SEO from "@/components/SEO";

// Define interfaces
interface BlogImage {
  url: string;
  publicId: string;
}

interface BlogType {
  _id: string;
  title: string;
  displayImage: string;
  displayImagePublicId?: string;
  notes: string;
  images: BlogImage[];
  createdAt: string;
  updatedAt: string;
}

const BlogPost = () => {
  const { id } = useParams<{ id: string }>();
  const [blog, setBlog] = useState<BlogType | null>(null);
  const [relatedBlogs, setRelatedBlogs] = useState<BlogType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const res = await fetch(`/api/blogs/${id}`);
        if (!res.ok) throw new Error("Blog not found");
        const data = await res.json();
        setBlog(data.data);

        // Fetch all blogs for related section
        const relatedRes = await fetch("/api/blogs");
        const relatedData = await relatedRes.json();
        const allBlogs = relatedData.data.blogs || [];
        const filtered = allBlogs.filter((b: BlogType) => b._id !== id);

        setRelatedBlogs(filtered.slice(0, 2)); // limit to 2
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

    if (id) fetchBlog();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Loading blog...
      </div>
    );
  }

  if (error || !blog) {
    return <Navigate to="/blogs" replace />;
  }

  return (
    <>
      <SEO
        title={`${blog.title} | KYNA Blog`}
        description={blog.notes.slice(0, 150)}
        canonical={`/blog/${id}`}
        type="article"
        image={blog.displayImage}
      />

      <main
        style={{ fontFamily: "Poppins, sans-serif" }}
        className="min-h-screen bg-background"
      >
        {/* Breadcrumbs */}
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
            <span className="text-gray-800">{blog.title}</span>
          </nav>
        </div>

        {/* Main Blog Section */}
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Link
            to="/blogs"
            className="inline-flex items-center text-gray-600 mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Blog
          </Link>

          <article>
            <header className="flex-col items-center mb-8">
              <div className="flex-col justify-items-center gap-4 mb-4">
                <div className="flex space-x-6 mb-2">
                  <div className="flex items-center text-[#328F94] font-bold text-sm">
                    <User className="w-4 h-4 mr-1 text-[#328F94]" />
                    KYNA
                  </div>
                  <div className="flex text-[#8D8A91] items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {new Date(blog.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </div>
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-black mb-4">
                    {blog.title}
                  </h1>
                </div>
              </div>
              <div className="aspect-[16/9] w-full mb-6 rounded-lg overflow-hidden">
                <img
                  src={blog.displayImage}
                  alt={blog.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* <p className="text-lg text-muted-foreground">
                {blog.notes.length > 200
                  ? blog.notes.slice(0, 200) + "..."
                  : blog.notes}
              </p> */}
            </header>

            <div className="prose prose-lg max-w-none">
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  About this blog
                </h2>
                <div className="text-muted-foreground text-justify whitespace-pre-line">
                  {blog.notes}
                </div>
              </section>

              {blog.images.length > 0 && (
                <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                  {blog.images.map((img, i) => (
                    <img
                      key={i}
                      src={img.url}
                      alt={`Blog Image ${i + 1}`}
                      className="rounded-lg object-cover w-full h-64"
                    />
                  ))}
                </section>
              )}
            </div>
          </article>

          {/* Related Articles */}
          {relatedBlogs.length > 0 && (
            <div className="mt-12 pt-8 border-t">
              <h3 className="text-xl font-semibold mb-6">Related Articles</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {relatedBlogs.map((related) => (
                  <Card
                    key={related._id}
                    className="group cursor-pointer hover:shadow-lg transition-shadow duration-300"
                  >
                    <Link to={`/blog/${related._id}`}>
                      <div className="aspect-video overflow-hidden rounded-t-lg">
                        <img
                          src={related.displayImage}
                          alt={related.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <CardContent className="p-4">
                        <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors mb-2">
                          {related.title}
                        </h4>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {related.notes.length > 100
                            ? related.notes.slice(0, 100) + "..."
                            : related.notes}
                        </p>
                      </CardContent>
                    </Link>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default BlogPost;
