/**
 * @file types.ts
 * Source unique de vérité pour tous les types du système anti-arnaque.
 */

// ─── Primitives métier ────────────────────────────────────────────────────────

export type AnalyzableType = "url" | "email" | "message" | "phone" | "text";

export type SanitizedString = string & { readonly __brand: unique symbol };

export type RiskLevel = "safe" | "low" | "suspicious" | "dangerous" | "critical";

export type ScamType =
  | "phishing"
  | "fake-website"
  | "scam-call"
  | "investment"
  | "romance"
  | "social-engineering"
  | "tech-support"
  | "fake-delivery"
  | "brouteur"
  | "lottery"
  | "crypto-scam"
  | "impersonation"
  | "unknown";

export type TriggerSeverity = "low" | "medium" | "high" | "critical";

export type SupportedLanguage = "fr" | "en" | "unknown";

// ─── Champs contextuels optionnels ────────────────────────────────────────────

/**
 * Champ personnalisé défini par l'utilisateur.
 */
export interface CustomField {
  readonly id: string;
  readonly label: string;
  readonly value: string;
  readonly type?: 'text' | 'email' | 'tel' | 'url' | 'textarea';
}

export interface AnalysisContextFields {
  readonly senderName?: string;
  readonly senderEmail?: string;
  readonly recipientEmail?: string;
  readonly senderPhone?: string;
  readonly platform?: string;
  readonly subject?: string;
  readonly customFields?: Readonly<Record<string, string>>;
  readonly dynamicFields?: readonly CustomField[];
}

// ─── Résultats d'analyse ──────────────────────────────────────────────────────

export interface RegexTrigger {
  readonly type: string;
  /** Extrait du pattern source, tronqué à 50 chars */
  readonly pattern: string;
  /** Valeur capturée, tronquée à 100 chars */
  readonly match: string;
  readonly severity: TriggerSeverity;
  readonly description: string;
}

export interface RegexResult {
  readonly score: number; // 0–100
  readonly triggers: readonly RegexTrigger[];
  readonly details: Readonly<Record<string, unknown>>;
}

export interface AIResult {
  readonly score: number; // 0–100
  readonly risk: RiskLevel;
  readonly type: ScamType;
  readonly explanation: string;
  readonly confidence: number; // 0–100
  readonly language?: SupportedLanguage;
  readonly indicators?: readonly string[];
}

export interface AnalysisResult {
  readonly inputType: AnalyzableType;
  readonly inputValue: string;
  readonly contextFields?: AnalysisContextFields;
  readonly score: number; // 0–100
  readonly risk: RiskLevel;
  readonly regex: RegexResult;
  readonly ai: AIResult | null;
  readonly triggers: readonly string[];
  readonly scamTypes: readonly ScamType[];
  readonly timestamp: string; // ISO 8601
  readonly analysisId: string;
  readonly cached: boolean;
  readonly recommendation: string;
  readonly actions: readonly string[];
}

// ─── Requêtes ─────────────────────────────────────────────────────────────────

export interface AnalyzeRequest {
  readonly type: AnalyzableType;
  readonly value: string;
  readonly context?: string;
  readonly language?: SupportedLanguage;
  readonly contextFields?: AnalysisContextFields;
}

// ─── Base de données ──────────────────────────────────────────────────────────

export interface ListEntry {
  readonly value: string;
  readonly type: AnalyzableType;
  readonly reason: string;
  readonly addedAt: string; // ISO 8601
  readonly addedBy: string;
}

export interface AnalysisHistory {
  readonly id: string;
  readonly inputType: AnalyzableType;
  readonly inputValue: string;
  readonly score: number;
  readonly risk: RiskLevel;
  readonly scamTypes: readonly ScamType[];
  readonly timestamp: string; // ISO 8601
  /** Intentionnellement mutable — mis à jour après signalement utilisateur */
  reported: boolean;
}

// ─── Configuration Mistral ────────────────────────────────────────────────────

export interface MistralConfig {
  readonly apiKey: string;
  readonly model: string;
  readonly endpoint: string;
  readonly maxTokens: number;
  readonly temperature: number;
  readonly timeoutMs: number;
  readonly maxRetries: number;
}