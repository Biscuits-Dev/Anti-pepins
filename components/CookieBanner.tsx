'use client';

import React from 'react';
import Link from 'next/link';

interface CookiePreferences {
  analytics: boolean;
  marketing: boolean;
}

type ConsentStatus = 'idle' | 'accepted' | 'refused' | 'custom';

const STORAGE_KEY = 'cookie-consent';

function useCookieConsent() {
  const [status, setStatus]       = React.useState<ConsentStatus>('idle');
  const [preferences, setPreferences]   = React.useState<CookiePreferences>({ analytics: false, marketing: false });
  const [visible, setVisible]     = React.useState(false);

  React.useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored == null) {
      setVisible(true);
    } else {
      try {
        const parsed = JSON.parse(stored);
        setStatus(parsed.status as ConsentStatus);
      } catch {
        localStorage.removeItem(STORAGE_KEY);
        setVisible(true);
      }
    }
  }, []);

  function save(s: ConsentStatus, prefs?: CookiePreferences) {
    const payload = { status: s, preferences: prefs ?? preferences };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    setStatus(s);
    setVisible(false);
  }

  return { visible, status, preferences, setPreferences, save };
}

interface ToggleProps {
  checked:  boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}

function Toggle({ checked, onChange, disabled = false }: Readonly<ToggleProps>): React.JSX.Element {
  let bgColor: string;
  if (disabled) {
    bgColor = 'cursor-not-allowed opacity-60 bg-emerald-500';
  } else if (checked) {
    bgColor = 'bg-emerald-500 cursor-pointer';
  } else {
    bgColor = 'bg-slate-300 cursor-pointer';
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={[
        'relative inline-flex h-5 w-9 items-center  -full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500',
        bgColor,
      ].join(' ')}
    >
      <span
        className={[
          'inline-block h-3.5 w-3.5 transform  -full bg-white transition-transform',
          checked ? 'translate-x-4' : 'translate-x-1',
        ].join(' ')}
      />
    </button>
  );
}

interface CustomPanelProps {
  prefs:    CookiePreferences;
  onChange: (k: keyof CookiePreferences, v: boolean) => void;
}

function CustomPanel({ prefs, onChange }: Readonly<CustomPanelProps>): React.JSX.Element {
  const rows: { key: keyof CookiePreferences; label: string; desc: string; disabled?: boolean }[] = [
    { key: 'analytics' as keyof CookiePreferences, label: 'Analytiques',  desc: "Mesure d'audience",   disabled: false },
    { key: 'marketing' as keyof CookiePreferences, label: 'Marketing',    desc: 'Publicités ciblées',  disabled: false },
  ];

  return (
    <div className="mb-4  -lg border border-slate-200 overflow-hidden text-sm">
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-slate-100">
        <div>
          <p className="font-medium text-slate-800">Nécessaires</p>
          <p className="text-xs text-slate-400">Toujours actifs</p>
        </div>
        <Toggle checked disabled onChange={() => {}} />
      </div>
      {rows.map((r) => (
        <div key={r.key} className="flex items-center justify-between px-3 py-2.5 border-b last:border-0 border-slate-100">
          <div>
            <p className="font-medium text-slate-800">{r.label}</p>
            <p className="text-xs text-slate-400">{r.desc}</p>
          </div>
          <Toggle
            checked={prefs[r.key]}
            onChange={(v) => onChange(r.key, v)}
          />
        </div>
      ))}
    </div>
  );
}

export default function CookieBanner(): React.JSX.Element | null {
  const { visible, preferences, setPreferences, save } = useCookieConsent();
  const [showCustom, setShowCustom] = React.useState(false);
  const dialogRef = React.useRef<HTMLDialogElement>(null);

  React.useEffect(() => {
    if (visible && dialogRef.current) {
      dialogRef.current.showModal();
    }
  }, [visible]);

  if (!visible) return null;

  function togglePref(k: keyof CookiePreferences, v: boolean) {
    setPreferences((prev) => ({ ...prev, [k]: v }));
  }

  return (
    <dialog
      ref={dialogRef}
      aria-label="Gestion des cookies"
      className="fixed bottom-4 right-4 z-50 w-80  -xl border border-slate-200 bg-white p-5 shadow-lg"
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-base" aria-hidden="true">🍪</span>
        <h2 className="text-sm font-semibold text-slate-900">Gestion des cookies</h2>
      </div>

      <p className="text-xs text-slate-500 leading-relaxed mb-4">
        Nous utilisons des cookies pour améliorer votre expérience. Vous pouvez personnaliser vos choix à tout moment.
      </p>

      {showCustom && (
        <CustomPanel prefs={preferences} onChange={togglePref} />
      )}

      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => save('accepted', { analytics: true, marketing: true })}
            className="flex-1  -lg bg-emerald-600 py-2 text-xs font-medium text-white hover:bg-emerald-700 transition-colors"
          >
            Accepter tout
          </button>
          <button
            type="button"
            onClick={() => save('refused', { analytics: false, marketing: false })}
            className="flex-1  -lg border border-slate-200 bg-slate-50 py-2 text-xs text-slate-700 hover:bg-slate-100 transition-colors"
          >
            Refuser tout
          </button>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowCustom((v) => !v)}
            className="flex-1  -lg border border-slate-200 bg-slate-50 py-2 text-xs text-slate-700 hover:bg-slate-100 transition-colors"
          >
            {showCustom ? 'Masquer' : 'Personnaliser'}
          </button>
          <Link
            href="/politique-cookies"
            className="flex-1  -lg border border-slate-200 py-2 text-center text-xs text-slate-500 hover:bg-slate-50 transition-colors"
          >
            En savoir plus
          </Link>
        </div>
        {showCustom && (
          <button
            type="button"
            onClick={() => save('custom')}
            className="w-full  -lg bg-emerald-600 py-2 text-xs font-medium text-white hover:bg-emerald-700 transition-colors"
          >
            Enregistrer mes choix
          </button>
        )}
      </div>
    </dialog>
  );
}
