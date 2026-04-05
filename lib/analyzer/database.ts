/**
 * @file database.ts
 * Base de données en mémoire pour la gestion des listes et de l'historique.
 */

import type { ListEntry, AnalysisHistory, AnalyzableType, ScamType, RiskLevel } from "./types";
import { createServerSupabaseClient } from '@/lib/supabase/server';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ReportedScam {
  readonly id: string;
  readonly value: string; // masqué
  readonly type: AnalyzableType;
  readonly score: number;
  readonly scamTypes: readonly ScamType[];
  readonly reportedAt: string; // ISO 8601
  readonly details: string;
}

// ─── Structure interne ────────────────────────────────────────────────────────

interface Db {
  blacklist:     Map<string, ListEntry>;
  whitelist:     Map<string, ListEntry>;
  history:       Map<string, AnalysisHistory>;
  reportedScams: Map<string, ReportedScam>;
}

const db: Db = {
  blacklist:     new Map(),
  whitelist:     new Map(),
  history:       new Map(),
  reportedScams: new Map(),
};

// ─── Données par défaut ───────────────────────────────────────────────────────

const DEFAULT_BLACKLIST: readonly Omit<ListEntry, "addedAt">[] = [
  { value: "amaz0n.com", type: "url", reason: "Domain spoofing – imitation d'Amazon",  addedBy: "system" },
  { value: "paypaI.com", type: "url", reason: "Domain spoofing – imitation de PayPal",  addedBy: "system" },
  { value: "g00gle.com", type: "url", reason: "Domain spoofing – imitation de Google",  addedBy: "system" },
] as const;

const DEFAULT_WHITELIST: readonly Omit<ListEntry, "addedAt">[] = [
  // Domaines officiels Biscuits IA / Anti-Pépins
  { value: "biscuits-ia.com",         type: "url", reason: "Domaine officiel Biscuits IA 🍪",        addedBy: "system" },
  { value: "anti-pepins.biscuits-ia.com", type: "url", reason: "Domaine officiel Anti-Pépins 🛡️",   addedBy: "system" },
  // Autres domaines de confiance
  { value: "google.com",         type: "url", reason: "Domaine de confiance",                        addedBy: "system" },
  { value: "amazon.com",         type: "url", reason: "Domaine de confiance",                        addedBy: "system" },
  { value: "paypal.com",         type: "url", reason: "Domaine de confiance",                        addedBy: "system" },
  { value: "impots.gouv.fr",     type: "url", reason: "Site gouvernemental français",                addedBy: "system" },
  { value: "ameli.fr",           type: "url", reason: "Site officiel de l'Assurance Maladie",        addedBy: "system" },
  { value: "laposte.fr",         type: "url", reason: "Site officiel de La Poste",                   addedBy: "system" },
  { value: "service-public.fr",  type: "url", reason: "Portail officiel de l'administration française", addedBy: "system" },
] as const;

function initDb(): void {
  const now = new Date().toISOString();
  for (const entry of DEFAULT_BLACKLIST) {
    const key = normalizeKey(entry.value);
    if (!db.blacklist.has(key)) db.blacklist.set(key, { ...entry, value: key, addedAt: now });
  }
  for (const entry of DEFAULT_WHITELIST) {
    const key = normalizeKey(entry.value);
    if (!db.whitelist.has(key)) db.whitelist.set(key, { ...entry, value: key, addedAt: now });
  }
}

initDb();

// ─── Normalisation ────────────────────────────────────────────────────────────

function normalizeKey(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/$/, "");
}

// ─── Blacklist ────────────────────────────────────────────────────────────────

export function isInBlacklist(value: string): boolean {
  const key = normalizeKey(value);
  if (db.blacklist.has(key)) return true;
  for (const k of db.blacklist.keys()) {
    if (key.includes(k) || k.includes(key)) return true;
  }
  return false;
}

export async function addToBlacklist(
  value: string,
  type: AnalyzableType,
  reason: string,
  addedBy = "user",
): Promise<ListEntry> {
  const entry: ListEntry = {
    value:   normalizeKey(value),
    type,
    reason,
    addedAt: new Date().toISOString(),
    addedBy,
  };
  db.blacklist.set(entry.value, entry);
  await _persistBlacklistEntry(entry);
  return entry;
}

export async function removeFromBlacklist(value: string): Promise<boolean> {
  const key = normalizeKey(value);
  const existed = db.blacklist.delete(key);
  await _deleteBlacklistEntry(key);
  return existed;
}

export function getBlacklist(): ListEntry[] {
  return Array.from(db.blacklist.values());
}

// ─── Whitelist ────────────────────────────────────────────────────────────────

export function isInWhitelist(value: string): boolean {
  const key = normalizeKey(value);
  if (db.whitelist.has(key)) return true;
  for (const k of db.whitelist.keys()) {
    if (key.includes(k)) return true;
  }
  return false;
}

export async function addToWhitelist(
  value: string,
  type: AnalyzableType,
  reason: string,
  addedBy = "user",
): Promise<ListEntry> {
  const entry: ListEntry = {
    value:   normalizeKey(value),
    type,
    reason,
    addedAt: new Date().toISOString(),
    addedBy,
  };
  db.whitelist.set(entry.value, entry);
  await _persistWhitelistEntry(entry);
  return entry;
}

export async function removeFromWhitelist(value: string): Promise<boolean> {
  const key = normalizeKey(value);
  const existed = db.whitelist.delete(key);
  await _deleteWhitelistEntry(key);
  return existed;
}

export function getWhitelist(): ListEntry[] {
  return Array.from(db.whitelist.values());
}

// ─── Historique ───────────────────────────────────────────────────────────────

export async function addToHistory(
  id: string,
  inputType: AnalyzableType,
  inputValue: string,
  score: number,
  risk: RiskLevel,
  scamTypes: readonly ScamType[],
): Promise<AnalysisHistory> {
  const entry: AnalysisHistory = {
    id,
    inputType,
    inputValue: maskValue(inputValue, inputType),
    score,
    risk,
    scamTypes,
    timestamp: new Date().toISOString(),
    reported: false,
  };
  db.history.set(id, entry);

  try {
    const supabase = createServerSupabaseClient();
    const { error } = await supabase.from('analysis_history').insert({
      id,
      input_type:  inputType,
      input_value: maskValue(inputValue, inputType),
      score,
      risk,
      scam_types:  [...scamTypes],
      reported:    false,
    });
    if (error) console.error('[database] Erreur persistance history:', error);
  } catch (err) {
    console.error('[database] Erreur persistance history:', err);
  }

  return entry;
}

export async function getHistory(limit = 50): Promise<AnalysisHistory[]> {
  try {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from('analysis_history')
      .select('id,input_type,input_value,score,risk,scam_types,reported,created_at')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('[database] Erreur lecture history:', error);
      // Fallback en mémoire
      return Array.from(db.history.values())
        .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
        .slice(0, limit);
    }

    return (data ?? []).map((row) => ({
      id:         row.id,
      inputType:  row.input_type as AnalyzableType,
      inputValue: row.input_value,
      score:      row.score,
      risk:       row.risk as RiskLevel,
      scamTypes:  (row.scam_types ?? []) as ScamType[],
      timestamp:  row.created_at,
      reported:   row.reported,
    }));
  } catch (err) {
    console.error('[database] Erreur lecture history:', err);
    return Array.from(db.history.values())
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
      .slice(0, limit);
  }
}

export function getHistoryEntry(id: string): AnalysisHistory | undefined {
  return db.history.get(id);
}

export async function markAsReported(id: string): Promise<boolean> {
  const entry = db.history.get(id);
  if (entry) entry.reported = true;

  try {
    const supabase = createServerSupabaseClient();
    const { error } = await supabase
      .from('analysis_history')
      .update({ reported: true })
      .eq('id', id);
    if (error) console.error('[database] Erreur markAsReported:', error);
  } catch (err) {
    console.error('[database] Erreur markAsReported:', err);
  }

  return !!entry;
}

export function clearHistory(): void {
  db.history.clear();
}

// ─── Signalements ─────────────────────────────────────────────────────────────

export function addReportedScam(
  value: string,
  type: AnalyzableType,
  score: number,
  scamTypes: readonly ScamType[],
  details: string,
): ReportedScam {
  const id = `scam_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;
  const scam: ReportedScam = {
    id,
    value: maskValue(value, type),
    type,
    score,
    scamTypes,
    reportedAt: new Date().toISOString(),
    details,
  };
  db.reportedScams.set(id, scam);
  return scam;
}

export function getReportedScams(limit = 50): ReportedScam[] {
  return Array.from(db.reportedScams.values())
    .sort((a, b) => b.reportedAt.localeCompare(a.reportedAt))
    .slice(0, limit);
}

// ─── Statistiques ─────────────────────────────────────────────────────────────

interface DbStats {
  readonly blacklistCount: number;
  readonly whitelistCount: number;
  readonly historyCount: number;
  readonly reportedScamsCount: number;
  readonly recentAnalyses: number;
  readonly scamRate: number;
}

export function getDatabaseStats(): DbStats {
  const history = Array.from(db.history.values());
  const oneDayAgo = Date.now() - 86_400_000;

  const recentAnalyses = history.filter(
    (h) => new Date(h.timestamp).getTime() > oneDayAgo,
  ).length;

  const scamCount = history.filter((h) => h.score >= 50).length;
  const scamRate  = history.length > 0
    ? Math.round((scamCount / history.length) * 100)
    : 0;

  return {
    blacklistCount:     db.blacklist.size,
    whitelistCount:     db.whitelist.size,
    historyCount:       db.history.size,
    reportedScamsCount: db.reportedScams.size,
    recentAnalyses,
    scamRate,
  };
}

// ─── Import / Export ──────────────────────────────────────────────────────────

export async function exportDatabase(): Promise<string> {
  return JSON.stringify({
    blacklist:     getBlacklist(),
    whitelist:     getWhitelist(),
    history:       await getHistory(1_000),
    reportedScams: getReportedScams(1_000),
    exportedAt:    new Date().toISOString(),
  }, null, 2);
}

export function importDatabase(json: string): void {
  let data: Record<string, unknown>;
  try {
    data = JSON.parse(json) as Record<string, unknown>;
  } catch {
    console.error("[database] JSON invalide lors de l'import");
    return;
  }

  const importList = <T extends { value: string }>(
    raw: unknown,
    map: Map<string, T>,
  ): void => {
    if (!Array.isArray(raw)) return;
    for (const entry of raw as T[]) {
      if (typeof entry?.value === "string") map.set(entry.value, entry);
    }
  };

  const importById = <T extends { id: string }>(
    raw: unknown,
    map: Map<string, T>,
  ): void => {
    if (!Array.isArray(raw)) return;
    for (const entry of raw as T[]) {
      if (typeof entry?.id === "string") map.set(entry.id, entry);
    }
  };

  importList(data.blacklist, db.blacklist);
  importList(data.whitelist, db.whitelist);
  importById(data.history,       db.history       as Map<string, AnalysisHistory & { id: string }>);
  importById(data.reportedScams, db.reportedScams  as Map<string, ReportedScam   & { id: string }>);
}

export function resetDatabase(): void {
  db.blacklist.clear();
  db.whitelist.clear();
  db.history.clear();
  db.reportedScams.clear();
  initDb();
}

// ─── Synchronisation Supabase ─────────────────────────────────────────────────

let _loadingPromise: Promise<void> | null = null;

async function _doLoadLists(): Promise<void> {
  try {
    const supabase = createServerSupabaseClient();
    const [bl, wl] = await Promise.all([
      supabase.from('analyzer_blacklist').select('value,type,reason,added_by,added_at'),
      supabase.from('analyzer_whitelist').select('value,type,reason,added_by,added_at'),
    ]);
    if (bl.error) console.error('[database] Erreur lecture blacklist:', bl.error);
    if (wl.error) console.error('[database] Erreur lecture whitelist:', wl.error);
    if (bl.data) {
      for (const row of bl.data) {
        db.blacklist.set(row.value, {
          value:   row.value,
          type:    row.type as AnalyzableType,
          reason:  row.reason,
          addedBy: row.added_by,
          addedAt: row.added_at,
        });
      }
    }
    if (wl.data) {
      for (const row of wl.data) {
        db.whitelist.set(row.value, {
          value:   row.value,
          type:    row.type as AnalyzableType,
          reason:  row.reason,
          addedBy: row.added_by,
          addedAt: row.added_at,
        });
      }
    }
  } catch (err) {
    console.error('[database] Erreur chargement listes depuis Supabase:', err);
    // Continuer avec les données par défaut en mémoire
  }
}

/**
 * Charge blacklist et whitelist depuis Supabase dans les Maps en mémoire.
 * No-op si déjà chargé (une fois par cold start). Utilise un pattern Promise
 * pour éviter les race conditions sur les appels concurrents.
 */
export async function loadListsFromSupabase(): Promise<void> {
  if (_loadingPromise) return _loadingPromise;
  _loadingPromise = _doLoadLists();
  return _loadingPromise;
}

/** Resets la Promise de chargement (pour les tests). */
export function resetLoadFlag(): void {
  _loadingPromise = null;
}

async function _persistBlacklistEntry(entry: ListEntry): Promise<void> {
  try {
    const supabase = createServerSupabaseClient();
    await supabase.from('analyzer_blacklist').upsert({
      value:    entry.value,
      type:     entry.type,
      reason:   entry.reason,
      added_by: entry.addedBy,
      added_at: entry.addedAt,
    }, { onConflict: 'value' });
  } catch (err) {
    console.error('[database] Erreur persistance blacklist:', err);
  }
}

async function _persistWhitelistEntry(entry: ListEntry): Promise<void> {
  try {
    const supabase = createServerSupabaseClient();
    await supabase.from('analyzer_whitelist').upsert({
      value:    entry.value,
      type:     entry.type,
      reason:   entry.reason,
      added_by: entry.addedBy,
      added_at: entry.addedAt,
    }, { onConflict: 'value' });
  } catch (err) {
    console.error('[database] Erreur persistance whitelist:', err);
  }
}

async function _deleteBlacklistEntry(value: string): Promise<void> {
  try {
    const supabase = createServerSupabaseClient();
    await supabase.from('analyzer_blacklist').delete().eq('value', value);
  } catch (err) {
    console.error('[database] Erreur suppression blacklist:', err);
  }
}

async function _deleteWhitelistEntry(value: string): Promise<void> {
  try {
    const supabase = createServerSupabaseClient();
    await supabase.from('analyzer_whitelist').delete().eq('value', value);
  } catch (err) {
    console.error('[database] Erreur suppression whitelist:', err);
  }
}

// ─── Masquage des données ─────────────────────────────────────────────────────

function maskValue(value: string, type: AnalyzableType): string {
  if (type === "phone") {
    const digits = value.replaceAll(/\D/g, "");
    return digits.length > 4 ? "*".repeat(digits.length - 4) + digits.slice(-4) : value;
  }
  if (type === "email") {
    const [local, domain] = value.split("@");
    if (local && domain && local.length > 3) {
      return `${local[0]}***${local.slice(-1)}@${domain}`;
    }
  }
  return value;
}