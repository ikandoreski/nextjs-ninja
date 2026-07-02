import { AdminShell } from "@/components/admin/admin-shell";
import { BlogManager } from "@/components/admin/blog-manager";
import { getBlogPosts } from "@/lib/admin-queries";

export default async function BlogPage() {
  const posts = await getBlogPosts();

  return (
    <AdminShell
      title="Blog Ninja388"
      description="Buat artikel, atur thumbnail, dan siapkan konten yang siap dipublish ke website publik."
      currentPath="/blog"
    >
      <BlogManager initialPosts={posts} />
    </AdminShell>
  );
}
