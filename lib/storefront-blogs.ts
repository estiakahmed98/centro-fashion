import { unstable_cache, revalidateTag } from "next/cache";
import { cache } from "react";
import { prisma } from "@/lib/prisma";

export const getPublicBlogIndex = cache(unstable_cache(async () => {
  const [blogs, count] = await Promise.all([
    prisma.blog.findMany({ take: 10, orderBy: { createdAt: "desc" }, select: { id: true, slug: true, title: true, summary: true, author: true, date: true, image: true, createdAt: true, updatedAt: true } }),
    prisma.blog.count(),
  ]);
  return { blogs: blogs.map(blog => ({ ...blog, date: blog.date.toISOString(), createdAt: blog.createdAt.toISOString(), updatedAt: blog.updatedAt.toISOString() })), count };
}, ["storefront-blog-index-v1"], { revalidate: 300, tags: ["storefront-blogs"] }));

const readBlog = unstable_cache(async (slug: string) => {
  let blog = await prisma.blog.findUnique({ where: { slug } });
  if (!blog && /^\d+$/.test(slug)) {
    const id = Number(slug);
    if (Number.isSafeInteger(id) && id > 0) blog = await prisma.blog.findUnique({ where: { id } });
  }
  return blog ? { ...blog, date: blog.date.toISOString(), createdAt: blog.createdAt.toISOString(), updatedAt: blog.updatedAt.toISOString() } : null;
}, ["storefront-blog-detail-v1"], { revalidate: 300, tags: ["storefront-blogs"] });

export const getPublicBlog = cache(async (slug: string) => {
  const blog = await readBlog(slug);
  return blog ? { ...blog, date: new Date(blog.date), createdAt: new Date(blog.createdAt), updatedAt: new Date(blog.updatedAt) } : null;
});

export function revalidatePublicBlogs() {
  revalidateTag("storefront-blogs", { expire: 0 });
}
