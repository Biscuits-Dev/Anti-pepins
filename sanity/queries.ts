import { defineQuery } from 'next-sanity'

export const POSTS_QUERY = defineQuery(`
  *[_type == "post"] | order(publishedAt desc) {
    _id,
    title,
    slug,
    publishedAt,
    mainImage,
    "author": author->{ name },
    "categories": categories[]->{ title, slug }
  }
`)

export const homepageQuery = defineQuery(`
  *[_type == "homepage"][0] {
    title,
    layout,
    heroTitle,
    heroSubtitle,
    heroImage,
    features[] {
      icon,
      title,
      description
    },
    content,
    ctaSection {
      title,
      description,
      buttonText,
      buttonLink
    }
  }
`)

export type Post = {
  _id: string
  title: string | null
slug: { current: string } | null
publishedAt: string | null
  mainImage: { asset: { url: string } } | null
  author: { name: string } | null
  categories: { title: string | null; slug: { current: string } | null }[] | null
}
