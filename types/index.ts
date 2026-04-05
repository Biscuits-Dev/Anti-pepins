import type React from "react";

// ─── Utility Types ────────────────────────────────────────────────────────────

export type WithId<T> = T & { id: string };
export type Nullable<T> = T | null;
export type DeepPartial<T> = { [P in keyof T]?: DeepPartial<T[P]> };
export type Prettify<T> = { [K in keyof T]: T[K] } & {};

export type FormState<T extends Record<string, unknown>> = {
  readonly values: T;
  readonly errors: Partial<Record<keyof T, string>>;
  readonly isValid: boolean;
  readonly isSubmitting: boolean;
  readonly isDirty: boolean;
};

export type AsyncResult<T> = {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
};

export function isDefined<T>(value: T | undefined | null): value is T {
  return value !== undefined && value !== null;
}

export function isError(value: unknown): value is Error {
  return value instanceof Error;
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isString(value: unknown): value is string {
  return typeof value === "string";
}

export function isNonEmptyString(value: unknown): value is string {
  return isString(value) && value.trim().length > 0;
}

export function isNumber(value: unknown): value is number {
  return typeof value === "number" && !Number.isNaN(value);
}

export function isBoolean(value: unknown): value is boolean {
  return typeof value === "boolean";
}

export const SCAM_TYPES = [
  "phishing",
  "fake-website",
  "scam-call",
  "investment",
  "romance",
  "social-engineering",
  "tech-support",
  "other",
] as const;

export type ScamType = (typeof SCAM_TYPES)[number];

export const SCAM_STATUSES = ["confirmé", "en cours", "non vérifié"] as const;

export type ScamStatus = (typeof SCAM_STATUSES)[number];

export function isScamType(value: unknown): value is ScamType {
  return isString(value) && (SCAM_TYPES as readonly string[]).includes(value);
}

export function isScamStatus(value: unknown): value is ScamStatus {
  return isString(value) && (SCAM_STATUSES as readonly string[]).includes(value);
}

export interface Scam {
  readonly id: string;
  readonly type: ScamType;
  readonly title: string;
  readonly date: string; // ISO 8601
  readonly website: string;
  readonly status: ScamStatus;
  readonly reports: number;
  readonly description?: string;
  readonly imageUrl?: string;
  readonly createdAt?: string;
  readonly updatedAt?: string;
  readonly severity?: number; // 1–5
  readonly tags?: string[];
  readonly value?: string;
  readonly riskLevel?: number;
  readonly source?: string;
  readonly verified?: boolean;
}

export function isScam(value: unknown): value is Scam {
  if (!isRecord(value)) return false;
  return (
    isNonEmptyString(value["id"]) &&
    isScamType(value["type"]) &&
    isNonEmptyString(value["title"]) &&
    isNonEmptyString(value["date"]) &&
    isString(value["website"]) &&
    isScamStatus(value["status"]) &&
    isNumber(value["reports"])
  );
}

export function isScamArray(value: unknown): value is Scam[] {
  return Array.isArray(value) && value.every(isScam);
}

export interface ScamFilter {
  search?: string;
  type?: ScamType;
  status?: ScamStatus;
  sortBy?: "date" | "reports" | "severity" | "title";
  minSeverity?: number;
  maxSeverity?: number;
  dateFrom?: string;
  dateTo?: string;
}

export const LOSS_STATUSES = ["yes", "no", "attempted"] as const;
export type LossStatus = (typeof LOSS_STATUSES)[number];

export const REPORT_STATUSES = [
  "draft",
  "submitted",
  "reviewed",
  "rejected",
  "published",
] as const;
export type ReportStatus = (typeof REPORT_STATUSES)[number];

export interface ReportFormValues {
  readonly scamType: ScamType;
  readonly date: string;
  readonly description: string;
  readonly website?: string;
  readonly contact?: string;
  readonly loss: LossStatus;
  readonly evidence?: FileList;
  readonly acknowledgeTruth: boolean;
  readonly shareData: boolean;
  readonly severity?: number;
  readonly categoryDetails?: string;
}

export interface ReportSubmission {
  readonly success: boolean;
  readonly reportId?: string;
  readonly error?: string;
  readonly status?: ReportStatus;
  readonly message?: string;
}

export interface Article {
  readonly id: string;
  readonly title: string;
  readonly excerpt: string;
  readonly date: string;
  readonly category: string;
  readonly readTime: string;
  readonly imageUrl?: string;
  readonly content?: string;
  readonly slug?: string;
}

export function isArticle(value: unknown): value is Article {
  if (!isRecord(value)) return false;
  return (
    isNonEmptyString(value["id"]) &&
    isNonEmptyString(value["title"]) &&
    isNonEmptyString(value["excerpt"]) &&
    isNonEmptyString(value["date"])
  );
}

export interface Category {
  readonly name: string;
  readonly count: number;
}

export interface ContactFormValues {
  readonly name: string;
  readonly email: string;
  readonly subject: string;
  readonly message: string;
  readonly acceptTerms: boolean;
}

export type ContactMethodId = "email" | "discord" | "phone";

export interface ContactMethod {
  readonly id: ContactMethodId;
  readonly name: string;
  readonly description: string;
  readonly infoLabel: string;
  readonly infoValue: string;
  readonly availability?: string;
  readonly icon: string;
  readonly actionLabel: string;
  readonly href: string;
}

export interface TeamMember {
  readonly name: string;
  readonly role: string;
  readonly expertise: string;
  readonly bio: string;
  readonly avatar?: string;
}

export interface SiteValue {
  readonly title: string;
  readonly description: string;
  readonly icon?: string;
}

export interface PaginationInfo {
  readonly currentPage: number;
  readonly totalPages: number;
  readonly totalItems: number;
  readonly itemsPerPage: number;
}

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";
export type ComponentSize = "sm" | "md" | "lg";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ComponentSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export interface LinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ComponentSize;
  className?: string;
}

export interface SelectOption {
  readonly value: string;
  readonly label: string;
}

export interface SeoMetadata {
  readonly title: string;
  readonly description: string;
  readonly keywords?: string[];
  readonly ogImage?: string;
  readonly ogType?: string;
  readonly url?: string;
  readonly canonical?: string;
  readonly robots?: string;
}

export interface ApiResponse<T> {
  readonly success: boolean;
  readonly data?: T;
  readonly error?: string;
  readonly statusCode?: number;
  readonly timestamp?: string;
}

export function isApiResponse<T>(
  value: unknown,
  dataGuard?: (d: unknown) => d is T
): value is ApiResponse<T> {
  if (!isRecord(value)) return false;
  if (!isBoolean(value["success"])) return false;
  if (isDefined(dataGuard) && isDefined(value["data"])) {
    return dataGuard(value["data"]);
  }
  return true;
}

export interface PaginatedResponse<T> {
  readonly data: T[];
  readonly pagination: {
    readonly total: number;
    readonly page: number;
    readonly limit: number;
    readonly pages: number;
  };
}

export class ApiError extends Error {
  override readonly name = "ApiError" as const;

  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

export function isApiError(value: unknown): value is ApiError {
  return value instanceof ApiError;
}

export interface ValidationError {
  readonly field: string;
  readonly message: string;
  readonly code?: string;
}

export interface ValidationResult<T = Record<string, unknown>> {
  readonly success: boolean;
  readonly errors?: ValidationError[];
  readonly data?: T;
}

export interface SanityImageAsset {
  readonly url: string;
  readonly metadata?: Record<string, unknown>;
}

export interface Homepage {
  readonly _id?: string;
  readonly _type?: string;
  readonly title?: string;
  readonly layout?: "hero" | "default";
  readonly heroTitle?: string;
  readonly heroSubtitle?: string;
  readonly heroImage?: { readonly asset?: SanityImageAsset };
  readonly features?: ReadonlyArray<{
    readonly icon?: string;
    readonly title?: string;
    readonly description?: string;
  }>;
  readonly content?: ReadonlyArray<Record<string, unknown>> | string;
  readonly ctaSection?: {
    readonly title?: string;
    readonly description?: string;
    readonly buttonText?: string;
    readonly buttonLink?: string;
  };
}

export type ValidationRule = {
  readonly type: string;
  readonly required?: boolean;
  readonly min?: number;
  readonly max?: number;
  readonly pattern?: string;
  readonly custom?: (value: unknown) => boolean | string;
};