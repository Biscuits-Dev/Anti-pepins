import { create } from "zustand";
import type { Scam, ScamFilter, ScamType } from "../types";

// ─── App Store (global UI) ────────────────────────────────────────────────────

export type NotificationType = "success" | "error" | "info" | "warning";

interface Notification {
  message: string;
  type: NotificationType;
  visible: boolean;
}

export interface AppState {
  // State
  isLoading: boolean;
  error: string | null;
  notification: Notification;
  // Actions
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  showNotification: (message: string, type?: NotificationType) => void;
  hideNotification: () => void;
  clearError: () => void;
}

const DEFAULT_NOTIFICATION: Notification = {
  message: "",
  type: "info",
  visible: false,
};

export const useAppStore = create<AppState>((set) => ({
  isLoading: false,
  error: null,
  notification: DEFAULT_NOTIFICATION,

  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  showNotification: (message, type = "info") =>
    set({ notification: { message, type, visible: true } }),

  hideNotification: () => set({ notification: DEFAULT_NOTIFICATION }),
}));

// ─── Scam Store ───────────────────────────────────────────────────────────────

export interface ScamState {
  // Data
  scams: Scam[];
  filteredScams: Scam[];
  scamFilters: ScamFilter;
  totalScams: number;
  isLoadingScams: boolean;
  scamError: string | null;

  // Actions
  setScams: (scams: Scam[]) => void;
  setScamFilters: (filters: Partial<ScamFilter>) => void;
  clearScamFilters: () => void;
  addScam: (scam: Scam) => void;
  updateScam: (id: string, updates: Partial<Scam>) => void;
  removeScam: (id: string) => void;
  filterScams: () => void;

  // Async
  fetchScams: () => Promise<void>;
}

// ─── Typed Selectors ──────────────────────────────────────────────────────────

export const selectFilteredScams = (s: ScamState) => s.filteredScams;
export const selectScamFilters   = (s: ScamState) => s.scamFilters;
export const selectIsLoadingScams = (s: ScamState) => s.isLoadingScams;
export const selectScamError     = (s: ScamState) => s.scamError;

export const selectIsLoading    = (s: AppState) => s.isLoading;
export const selectError        = (s: AppState) => s.error;
export const selectNotification = (s: AppState) => s.notification;

// ─── useFormStore compatibility shim ─────────────────────────────────────────
interface ReportFormSlice {
  values: Partial<{
    scamType: ScamType;
    date: string;
    description: string;
    website: string;
    contact: string;
    loss: "yes" | "no" | "attempted";
    acknowledgeTruth: boolean;
    shareData: boolean;
    severity: number;
    categoryDetails: string;
    evidence: File[];
  }>;
  errors: Record<string, string>;
  isSubmitting: boolean;
  isValid: boolean;
}

interface ContactFormSlice {
  values: Partial<{
    name: string;
    email: string;
    subject: string;
    message: string;
    acceptTerms: boolean;
  }>;
  errors: Record<string, string>;
  isSubmitting: boolean;
  isValid: boolean;
}

interface FormStoreState {
  reportForm: ReportFormSlice;
  contactForm: ContactFormSlice;
  setReportFormValues: (v: Partial<ReportFormSlice["values"]>) => void;
  setReportFormErrors: (e: Record<string, string>) => void;
  setReportFormSubmitting: (b: boolean) => void;
  setReportFormValid: (b: boolean) => void;
  resetReportForm: () => void;
  setContactFormValues: (v: Partial<ContactFormSlice["values"]>) => void;
  setContactFormErrors: (e: Record<string, string>) => void;
  setContactFormSubmitting: (b: boolean) => void;
  setContactFormValid: (b: boolean) => void;
  resetContactForm: () => void;
}

const EMPTY_FORM = { values: {}, errors: {}, isSubmitting: false, isValid: false } as const;

export const useFormStore = create<FormStoreState>((set) => ({
  reportForm: { ...EMPTY_FORM },
  contactForm: { ...EMPTY_FORM },

  setReportFormValues: (v) =>
    set((s) => ({ reportForm: { ...s.reportForm, values: { ...s.reportForm.values, ...v } } })),
  setReportFormErrors: (errors) =>
    set((s) => ({ reportForm: { ...s.reportForm, errors } })),
  setReportFormSubmitting: (isSubmitting) =>
    set((s) => ({ reportForm: { ...s.reportForm, isSubmitting } })),
  setReportFormValid: (isValid) =>
    set((s) => ({ reportForm: { ...s.reportForm, isValid } })),
  resetReportForm: () =>
    set({ reportForm: { ...EMPTY_FORM } }),

  setContactFormValues: (v) =>
    set((s) => ({ contactForm: { ...s.contactForm, values: { ...s.contactForm.values, ...v } } })),
  setContactFormErrors: (errors) =>
    set((s) => ({ contactForm: { ...s.contactForm, errors } })),
  setContactFormSubmitting: (isSubmitting) =>
    set((s) => ({ contactForm: { ...s.contactForm, isSubmitting } })),
  setContactFormValid: (isValid) =>
    set((s) => ({ contactForm: { ...s.contactForm, isValid } })),
  resetContactForm: () =>
    set({ contactForm: { ...EMPTY_FORM } }),
}));

export const selectReportForm  = (s: FormStoreState) => s.reportForm;
export const selectContactForm = (s: FormStoreState) => s.contactForm;