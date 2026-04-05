import { createClient, groq } from "next-sanity";
import type { Scam, Article, ScamType, ScamStatus } from "../types";
import {
  isScamType,
  isScamStatus,
  isNonEmptyString,
  isNumber,
  isRecord,
} from "../types";
import { logError } from "./errors";

// ─── Sanity Client ────────────────────────────────────────────────────────────

function createSanityClient() {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset  = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
  const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? "2024-01-01";

  if (!projectId) {
    throw new Error(
      "Missing NEXT_PUBLIC_SANITY_PROJECT_ID environment variable"
    );
  }

  return createClient({
    projectId,
    dataset,
    apiVersion,
    // useCdn=true for reads (fast, cached); set false for preview/draft
    useCdn: process.env.NODE_ENV === "production",
    perspective: "published",
    stega: { enabled: false },
  });
}

// Lazy singleton — created once on first import
let _sanityClient: ReturnType<typeof createSanityClient> | null = null;

function getSanityClient() {
  _sanityClient ??= createSanityClient();
  return _sanityClient;
}

// ─── Raw Sanity Document Shape ────────────────────────────────────────────────

interface SanityScamDoc {
  readonly _id: string;
  readonly title?: unknown;
  readonly description?: unknown;
  readonly type?: unknown;
  readonly website?: unknown;
  readonly status?: unknown;
  readonly reports?: unknown;
  readonly severity?: unknown;
  readonly date?: unknown;
  readonly createdAt?: unknown;
  readonly lastUpdated?: unknown;
  readonly tags?: unknown;
  readonly imageUrl?: unknown;
}

interface SanityArticleDoc {
  readonly _id: string;
  readonly title?: unknown;
  readonly excerpt?: unknown;
  readonly date?: unknown;
  readonly category?: unknown;
  readonly readTime?: unknown;
  readonly imageUrl?: unknown;
  readonly slug?: unknown;
  readonly body?: unknown;
}

// ─── Mappers ──────────────────────────────────────────────────────────────────

function mapScam(doc: SanityScamDoc): Scam {
  const description = isNonEmptyString(doc.description) ? doc.description : undefined;
  const imageUrl    = isNonEmptyString(doc.imageUrl)    ? doc.imageUrl    : undefined;
  const createdAt   = isNonEmptyString(doc.createdAt)   ? doc.createdAt   : undefined;
  const updatedAt   = isNonEmptyString(doc.lastUpdated) ? doc.lastUpdated : undefined;
  const severity    = isNumber(doc.severity)            ? doc.severity    : undefined;
  const tags        = Array.isArray(doc.tags)
    ? (doc.tags as unknown[]).filter(isNonEmptyString)
    : undefined;
  const date        = isNonEmptyString(doc.date) ? doc.date : new Date().toISOString();

  return {
    id: doc._id,
    title: isNonEmptyString(doc.title) ? doc.title : "Untitled",
    ...(description === undefined ? { description } : {}),
    type: isScamType(doc.type) ? doc.type : "other",
    website: isNonEmptyString(doc.website) ? doc.website : "",
    status: isScamStatus(doc.status) ? doc.status : "non vérifié",
    reports: isNumber(doc.reports) ? doc.reports : 0,
    date,
    ...(severity  === undefined ? { severity }  : {}),
    ...(createdAt === undefined ? { createdAt } : {}),
    ...(updatedAt === undefined ? {} : { updatedAt }),
    ...(tags      === undefined ? { tags }      : {}),
    ...(imageUrl  === undefined ? { imageUrl }  : {}),
  };
}

function mapArticle(doc: SanityArticleDoc): Article {
  const imageUrl = isNonEmptyString(doc.imageUrl) ? doc.imageUrl : undefined;
  const slug     = isNonEmptyString(doc.slug)     ? doc.slug     : undefined;

  return {
    id: doc._id,
    title: isNonEmptyString(doc.title) ? doc.title : "Untitled",
    excerpt: isNonEmptyString(doc.excerpt) ? doc.excerpt : "",
    date: isNonEmptyString(doc.date) ? doc.date : new Date().toISOString(),
    category: isNonEmptyString(doc.category) ? doc.category : "general",
    readTime: isNonEmptyString(doc.readTime) ? doc.readTime : "?",
    ...(imageUrl === undefined ? { imageUrl } : {}),
    ...(slug     === undefined ? { slug }     : {}),
  };
}

// ─── Queries ──────────────────────────────────────────────────────────────────

const SCAM_FIELDS = groq`
  _id,
  title,
  description,
  type,
  website,
  status,
  reports,
  severity,
  date,
  createdAt,
  lastUpdated,
  tags,
  "imageUrl": mainImage.asset->url
`;

const ARTICLE_FIELDS = groq`
  _id,
  title,
  excerpt,
  date,
  category,
  readTime,
  "imageUrl": mainImage.asset->url,
  "slug": slug.current
`;

const QUERIES = {
  ALL_SCAMS: groq`*[_type == "scam"]{ ${SCAM_FIELDS} }`,

  SCAM_BY_ID: groq`*[_type == "scam" && _id == $id][0]{ ${SCAM_FIELDS} }`,

  SCAMS_BY_TYPE: groq`
    *[_type == "scam" && type == $type]{ ${SCAM_FIELDS} }
  `,

  SCAMS_BY_STATUS: groq`
    *[_type == "scam" && status == $status]{ ${SCAM_FIELDS} }
  `,

  ALL_ARTICLES: groq`
    *[_type == "post"] | order(date desc){ ${ARTICLE_FIELDS} }
  `,

  ARTICLE_BY_SLUG: groq`
    *[_type == "post" && slug.current == $slug][0]{
      ${ARTICLE_FIELDS},
      body
    }
  `,

  ARTICLES_BY_CATEGORY: groq`
    *[_type == "post" && category == $category] | order(date desc){
      ${ARTICLE_FIELDS}
    }
  `,

  COUNT_SCAMS: groq`count(*[_type == "scam"])`,
  COUNT_ARTICLES: groq`count(*[_type == "post"])`,
} as const;

// ─── Client Class ─────────────────────────────────────────────────────────────

class SanityApiClient {
  private get client() {
    return getSanityClient();
  }

  // ─── Scam Methods ──────────────────────────────────────────────────────────

  async getAllScams(): Promise<Scam[]> {
    try {
      const data: unknown = await this.client.fetch(QUERIES.ALL_SCAMS);
      if (!Array.isArray(data)) return [];
      return (data as SanityScamDoc[]).map(mapScam);
    } catch (error) {
      logError(error, { method: "getAllScams" });
      return [];
    }
  }

  async getScamById(id: string): Promise<Scam | null> {
    try {
      const data: unknown = await this.client.fetch(QUERIES.SCAM_BY_ID, { id });
      if (!isRecord(data)) return null;
      return mapScam(data as unknown as SanityScamDoc);
    } catch (error) {
      logError(error, { method: "getScamById", id });
      return null;
    }
  }

  async getScamsByType(type: ScamType): Promise<Scam[]> {
    try {
      const data: unknown = await this.client.fetch(QUERIES.SCAMS_BY_TYPE, {
        type,
      });
      if (!Array.isArray(data)) return [];
      return (data as SanityScamDoc[]).map(mapScam);
    } catch (error) {
      logError(error, { method: "getScamsByType", type });
      return [];
    }
  }

  async getScamsByStatus(status: ScamStatus): Promise<Scam[]> {
    try {
      const data: unknown = await this.client.fetch(QUERIES.SCAMS_BY_STATUS, {
        status,
      });
      if (!Array.isArray(data)) return [];
      return (data as SanityScamDoc[]).map(mapScam);
    } catch (error) {
      logError(error, { method: "getScamsByStatus", status });
      return [];
    }
  }

  // ─── Article Methods ───────────────────────────────────────────────────────

  async getAllArticles(): Promise<Article[]> {
    try {
      const data: unknown = await this.client.fetch(QUERIES.ALL_ARTICLES);
      if (!Array.isArray(data)) return [];
      return (data as SanityArticleDoc[]).map(mapArticle);
    } catch (error) {
      logError(error, { method: "getAllArticles" });
      return [];
    }
  }

  async getArticleBySlug(slug: string): Promise<Article | null> {
    try {
      const data: unknown = await this.client.fetch(QUERIES.ARTICLE_BY_SLUG, {
        slug,
      });
      if (!isRecord(data)) return null;
      return mapArticle(data as unknown as SanityArticleDoc);
    } catch (error) {
      logError(error, { method: "getArticleBySlug", slug });
      return null;
    }
  }

  async getArticlesByCategory(category: string): Promise<Article[]> {
    try {
      const data: unknown = await this.client.fetch(
        QUERIES.ARTICLES_BY_CATEGORY,
        { category }
      );
      if (!Array.isArray(data)) return [];
      return (data as SanityArticleDoc[]).map(mapArticle);
    } catch (error) {
      logError(error, { method: "getArticlesByCategory", category });
      return [];
    }
  }

  // ─── Utility Methods ───────────────────────────────────────────────────────

  async countScams(): Promise<number> {
    try {
      const count: unknown = await this.client.fetch(QUERIES.COUNT_SCAMS);
      return isNumber(count) ? count : 0;
    } catch (error) {
      logError(error, { method: "countScams" });
      return 0;
    }
  }

  async countArticles(): Promise<number> {
    try {
      const count: unknown = await this.client.fetch(QUERIES.COUNT_ARTICLES);
      return isNumber(count) ? count : 0;
    } catch (error) {
      logError(error, { method: "countArticles" });
      return 0;
    }
  }
}

// ─── Singleton ────────────────────────────────────────────────────────────────

export const sanityApi = new SanityApiClient();
export { SanityApiClient };