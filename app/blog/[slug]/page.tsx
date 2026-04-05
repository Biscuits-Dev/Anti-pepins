import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { MainLayout } from '@/components/layout';
import { client, previewClient  } from '@/sanity/client';
import { urlFor } from '@/sanity/image';
import { PortableText } from '@portabletext/react';
import type { Post } from '@/sanity/queries';
import { POSTS_QUERY } from '@/sanity/queries';
import { PortableTextBlock } from '@sanity/types';

const POST_QUERY = `
  *[_type == "post" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    publishedAt,
    mainImage,
    "author": author->{ name },
    "categories": categories[]->{ title, slug },
    body
  }
`;

type FullPost = Post & {
  body: PortableTextBlock[];
};

function isValidPost(post: unknown): post is FullPost {
  return (
    typeof post === 'object' &&
    post !== null &&
    '_id' in post &&
    typeof (post as FullPost)._id === 'string'
  );
}

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  try {
    const posts: Post[] = await client.fetch(POSTS_QUERY);
    return posts
      .filter((post) => post.slug?.current != null)
      .map((post) => ({
        slug: post.slug!.current,
      }));
  } catch (error) {
    console.error('Erreur lors de la génération des paramètres statiques :', error);
    return [];
  }
}

function EmptyState(): React.JSX.Element {
  return (
    <div className="text-center py-20 text-slate-500">
      <p className="text-5xl mb-4" aria-hidden="true" suppressHydrationWarning>📝</p>
      <p className="text-xl font-medium">Article introuvable</p>
      <p className="text-sm mt-2">L&apos;article que vous cherchez n&apos;existe pas ou a été supprimé.</p>
    </div>
  );
}

interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function BlogPostPage({ params }: Readonly<BlogPostPageProps>): Promise<React.JSX.Element> {
  const resolvedParams = await params;
  const { slug } = resolvedParams;

  try {
    const rawPost: unknown = await previewClient.fetch(POST_QUERY, { slug });
    const post: FullPost | null = isValidPost(rawPost) ? rawPost : null;

    if (post == null) {
      notFound();
    }

    const publishedDate =
      post.publishedAt == null
        ? null
        : new Date(post.publishedAt).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          });

    return (
      <MainLayout>

        <section className="bg-slate-50 py-16" aria-labelledby="post-heading">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h1 id="post-heading" className="text-3xl font-bold text-slate-900 mb-4">
                {post.title}
              </h1>
              <div className="flex items-center justify-center gap-4 text-sm text-slate-500">
                {post.author?.name != null && (
                  <span>
                    <span aria-hidden="true" suppressHydrationWarning>✍️</span>
                    &nbsp;{post.author.name}
                  </span>
                )}
                {publishedDate != null && (
                  <time dateTime={post.publishedAt ?? undefined}>{publishedDate}</time>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <article className="prose prose-lg max-w-none">
              {post.mainImage != null && (
                <div className="relative h-96 w-full mb-8">
                  <Image
                    src={urlFor(post.mainImage).width(1200).height(600).url()}
                    alt={post.title ?? "Image de l'article"}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover  -lg"
                  />
                </div>
              )}

              {post.categories != null && post.categories.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6" aria-label="Catégories">
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

              <div className="text-gray-900 space-y-6">
                <PortableText value={post.body} />
              </div>
            </article>
          </div>
        </section>

      </MainLayout>
    );
  } catch (error) {
    console.error('Erreur lors du chargement de l\'article :', error);
    return <EmptyState />;
  }
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const { slug } = resolvedParams;

  try {
    const rawPost: unknown = await previewClient.fetch(POST_QUERY, { slug });
    const post: FullPost | null = isValidPost(rawPost) ? rawPost : null;

    if (post == null) {
      return {
        title: 'Article introuvable - Anti Pepins',
        description: `L'article que vous cherchez n'existe pas ou a été supprimé.`,
      };
    }

    return {
      title: `${post.title ?? 'Article'} - Anti Pepins`,
      description: post.title ?? "Article de blog",
      openGraph: {
        title: post.title ?? 'Article',
        description: post.title ?? `Article de blog`,
        images: post.mainImage == null
          ? undefined
          : [urlFor(post.mainImage).width(1200).height(600).url()],
      },
    };
  } catch (error) {
    console.error('Erreur lors de la génération des métadonnées :', error);
    return {
      title: 'Article introuvable - Anti Pepins',
        description: `L'article que vous cherchez n'existe pas ou a été supprimé.`,
    };
  }
}