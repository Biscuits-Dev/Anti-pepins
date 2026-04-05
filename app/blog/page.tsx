// app/blog/page.tsx
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { MainLayout } from '@/components/layout';
import { previewClient } from '@/sanity/client';
import { urlFor } from '@/sanity/image';
import { POSTS_QUERY, type Post } from '@/sanity/queries';

export const metadata: Metadata = {
  title: 'Blog - Anti Pepins',
  description:
    'Actualités, conseils et alertes pour vous protéger des arnaques. Partagez et apprenez avec notre collectif.',
};

function isValidPost(post: unknown): post is Post {
  return (
    typeof post === 'object' &&
    post !== null &&
    '_id' in post &&
    typeof (post as Post)._id === 'string'
  );
}

function EmptyState(): React.JSX.Element {
  return (
    <div className="text-center py-20 text-slate-500">
      <p className="text-5xl mb-4" aria-hidden="true" suppressHydrationWarning>📝</p>
      <p className="text-xl font-medium">Aucun article pour le moment</p>
      <p className="text-sm mt-2">Revenez bientôt&nbsp;!</p>
    </div>
  );
}

interface PostCardProps {
  post: Post;
}

function PostCard({ post }: Readonly<PostCardProps>): React.JSX.Element {
  const publishedDate =
    post.publishedAt == null
      ? null
      : new Date(post.publishedAt).toLocaleDateString('fr-FR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        });

  const slug = post.slug?.current;

  return (
    <article className="bg-white border border-slate-200  -lg overflow-hidden hover:shadow-md transition-shadow">

      {post.mainImage == null ? (
        <div
          className="h-48 bg-slate-100 flex items-center justify-center text-4xl"
          aria-hidden="true"
          suppressHydrationWarning
        >
          📰
        </div>
      ) : (
        <div className="relative h-48 w-full">
          <Image
            src={urlFor(post.mainImage).width(600).height(400).url()}
            alt={post.title ?? 'Image de l\'article'}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
          />
        </div>
      )}

      <div className="p-6">
        {post.categories != null && post.categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3" aria-label="Catégories">
            {post.categories.map((cat) => (
              <span
                key={cat.slug?.current ?? cat.title}
                className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1  -full"
              >
                {cat.title}
              </span>
            ))}
          </div>
        )}

        <h2 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2">
          {slug == null ? (
            post.title
          ) : (
            <Link
              href={`/blog/${slug}`}
              className="hover:text-emerald-600 transition-colors"
            >
              {post.title}
            </Link>
          )}
        </h2>

        <div className="flex items-center justify-between text-sm text-slate-500 mt-4">
          {post.author?.name != null && (
            <span>
              <span aria-hidden="true" suppressHydrationWarning>✍️</span>
              {' '}{post.author.name}
            </span>
          )}
          {publishedDate != null && (
            <time dateTime={post.publishedAt ?? undefined}>{publishedDate}</time>
          )}
        </div>
      </div>
    </article>
  );
}

export default async function BlogPage(): Promise<React.JSX.Element> {
  const rawPosts: unknown = await previewClient.fetch(POSTS_QUERY);
  const posts: Post[] = Array.isArray(rawPosts) ? rawPosts.filter(isValidPost) : [];

  return (
    <MainLayout>

      <section className="bg-slate-50 py-16" aria-labelledby="blog-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 id="blog-heading" className="text-4xl font-bold text-slate-900 mb-4">
            Blog
          </h1>
          <p className="text-lg text-slate-600">
            Actualités, conseils et alertes pour vous protéger des arnaques. Partagez et
            apprenez avec notre collectif.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {posts.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>
          )}
        </div>
      </section>

    </MainLayout>
  );
}