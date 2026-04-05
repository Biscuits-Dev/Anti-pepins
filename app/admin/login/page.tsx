'use client';

import React, { useState, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

interface FormState {
  readonly email: string;
  readonly password: string;
}

type SubmitStatus = 'idle' | 'loading' | 'error';

export default function AdminLoginPage() {
  const router = useRouter();

  const [form, setForm] = useState<FormState>({ email: '', password: '' });
  const [status, setStatus] = useState<SubmitStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AdminLoginContent
        form={form}
        setForm={setForm}
        status={status}
        setStatus={setStatus}
        errorMessage={errorMessage}
        setErrorMessage={setErrorMessage}
        router={router}
      />
    </Suspense>
  );
}

function AdminLoginContent({
  form,
  setForm,
  status,
  setStatus,
  errorMessage,
  setErrorMessage,
  router,
}: Readonly<{
  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
  status: SubmitStatus;
  setStatus: React.Dispatch<React.SetStateAction<SubmitStatus>>;
  errorMessage: string;
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>;
  router: ReturnType<typeof useRouter>;
}>) {
  const searchParams = useSearchParams();

  const rawRedirect = searchParams.get('next') ?? '/admin';
  // Prevent open redirect: only allow relative paths starting with /
  const redirectTo = rawRedirect.startsWith('/') && !rawRedirect.startsWith('//') ? rawRedirect : '/admin';
  const authError = searchParams.get('error');

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>): void => {
      const { name, value } = e.target;
      setForm(prev => ({ ...prev, [name]: value }));
      if (status === 'error') setStatus('idle');
    },
    [status, setForm, setStatus]
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
      e.preventDefault();
      if (status === 'loading') return;

      setStatus('loading');
      setErrorMessage('');

      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseAnonKey) {
        setStatus('error');
        setErrorMessage('Configuration error. Merci de contacter le support.');
        return;
      }

      const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

      const { data, error } = await supabase.auth.signInWithPassword({
        email: form.email.trim(),
        password: form.password,
      });

      if (error !== null) {
        setStatus('error');
        setErrorMessage('Identifiants incorrects. Veuillez réessayer.');
        return;
      }

      // Vérification du rôle via app_metadata (non modifiable par l'utilisateur)
      const role = data.user?.app_metadata?.role;
      if (role !== 'admin') {
        await supabase.auth.signOut();
        setStatus('error');
        setErrorMessage('Accès non autorisé.');
        return;
      }

      router.replace(redirectTo);
    },
    [form, status, redirectTo, router, setStatus, setErrorMessage]
  );

  const isSubmittable = form.email.trim().length > 0 && form.password.length > 0;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4 select-none">
            🤝
          </div>
          <h1 className="text-xl font-semibold text-slate-900">Accès bénévole</h1>
          <p className="text-sm text-slate-500 mt-1">Panneau d&apos;administration du chat</p>
        </div>

        {authError === 'unauthorized' && status !== 'error' && (
          <p role="alert" className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2 mb-4 text-center">
            Accès non autorisé.
          </p>
        )}

        <form
          onSubmit={handleSubmit}
          noValidate
          className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4"
        >
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">
              Adresse e-mail
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={form.email}
              onChange={handleChange}
              disabled={status === 'loading'}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:bg-slate-50 disabled:cursor-not-allowed transition-colors"
              placeholder="vous@exemple.fr"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1.5">
              Mot de passe
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={form.password}
              onChange={handleChange}
              disabled={status === 'loading'}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:bg-slate-50 disabled:cursor-not-allowed transition-colors"
              placeholder="••••••••"
            />
          </div>

          {status === 'error' && (
            <p role="alert" className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
              {errorMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={!isSubmittable || status === 'loading'}
            className="w-full py-2.5 bg-emerald-600 text-white text-sm font-medium rounded-xl hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {status === 'loading' ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  );
}