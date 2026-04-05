'use client';

import React, { useState } from 'react';
import Link from 'next/link';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

// ─── Section ──────────────────────────────────────────────────────────────────

interface SectionProps {
  readonly title: string;
  readonly children: React.ReactNode;
  readonly className?: string;
}

export function Section({ title, children, className = '' }: SectionProps): React.JSX.Element {
  return (
    <section className={`mb-8 ${className}`}>
      <h2 className="text-2xl font-bold mb-4 text-slate-900">{title}</h2>
      <div className="text-slate-700">{children}</div>
    </section>
  );
}

// ─── CallToAction ─────────────────────────────────────────────────────────────

interface CallToActionProps {
  readonly href: string;
  readonly text: string;
  readonly className?: string;
}

export function CallToAction({ href, text, className = '' }: CallToActionProps): React.JSX.Element {
  const isMailto = href.startsWith('mailto:');
  return (
    <div className={`mt-8 mb-8 ${className}`}>
      <a
        href={href}
        className="inline-block bg-emerald-600 text-white px-6 py-3  -lg hover:bg-emerald-700 transition-colors font-medium border-[3px] border-slate-300 shadow-[4px_4px_0_0_#d1d5db] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_0_#d1d5db]"
        target={isMailto ? undefined : '_blank'}
        rel={isMailto ? undefined : 'noopener noreferrer'}
      >
        {text}
      </a>
    </div>
  );
}

// ─── CodeBlock ────────────────────────────────────────────────────────────────

interface CodeBlockProps {
  readonly language?: string;
  readonly children: string;
}

export function CodeBlock({ language = 'bash', children }: CodeBlockProps): React.JSX.Element {
  return (
    <div className="relative">
      <pre className={`language-${language} bg-gray-900 text-gray-100 p-4  -lg overflow-x-auto`}>
        <code className="text-sm">{children}</code>
      </pre>
    </div>
  );
}

// ─── FAQItem ──────────────────────────────────────────────────────────────────

interface FAQItemProps {
  readonly question: string;
  readonly answer: React.ReactNode;
  readonly defaultOpen?: boolean;
}

export function FAQItem({ question, answer, defaultOpen = false }: FAQItemProps): React.JSX.Element {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-slate-200 py-4">
      <button
        className="w-full text-left font-semibold text-slate-900 flex justify-between items-center hover:text-emerald-600 transition-colors"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
      >
        {question}
        <span className="text-xl font-light" aria-hidden="true">{isOpen ? '−' : '+'}</span>
      </button>
      {isOpen && <div className="mt-2 text-slate-600">{answer}</div>}
    </div>
  );
}

// ─── SearchBar ────────────────────────────────────────────────────────────────

interface SearchBarProps {
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly placeholder?: string;
}

export function SearchBar({ value, onChange, placeholder = 'Rechercher...' }: SearchBarProps): React.JSX.Element {
  return (
    <div className="mb-6">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-2 border-[3px] border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 shadow-[2px_2px_0_0_#d1d5db]"
      />
    </div>
  );
}

// ─── TechBadge ────────────────────────────────────────────────────────────────

interface TechBadgeProps {
  readonly name: string;
  readonly color?: string;
  readonly textColor?: string;
}

export function TechBadge({ name, color = 'bg-blue-100', textColor = 'text-blue-800' }: TechBadgeProps): React.JSX.Element {
  return (
    <span className={`inline-block px-3 py-1 border-2 border-slate-300 shadow-[2px_2px_0_0_#d1d5db] text-sm font-bold uppercase tracking-wide ${color} ${textColor}`}>
      {name}
    </span>
  );
}

// ─── Button ───────────────────────────────────────────────────────────────────

interface ButtonProps {
  readonly children: React.ReactNode;
  readonly onClick?: () => void;
  readonly type?: 'button' | 'submit' | 'reset';
  readonly className?: string;
  readonly variant?: ButtonVariant;
  readonly size?: ButtonSize;
  readonly isLoading?: boolean;
  readonly disabled?: boolean;
}

const BUTTON_VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:   'bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500 border-[3px] border-slate-300 shadow-[4px_4px_0_0_#d1d5db] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_0_#d1d5db] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none font-bold uppercase tracking-wide',
  secondary: 'bg-slate-200 text-slate-800 hover:bg-slate-300 focus:ring-slate-400 border-[3px] border-slate-300 shadow-[4px_4px_0_0_#d1d5db] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_0_#d1d5db] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none font-bold uppercase tracking-wide',
  outline:   'border-[3px] border-emerald-600 text-emerald-600 hover:bg-emerald-50 focus:ring-emerald-500 shadow-[4px_4px_0_0_#d1d5db] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_0_#d1d5db] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none font-bold uppercase tracking-wide',
  ghost:     'text-emerald-600 hover:bg-emerald-50 focus:ring-emerald-500 font-bold uppercase tracking-wide',
};

const BUTTON_SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

export function Button({
  children,
  onClick,
  type = 'button',
  className = '',
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
}: ButtonProps): React.JSX.Element {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isLoading || disabled}
      className={[
        '  font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        BUTTON_VARIANT_CLASSES[variant],
        BUTTON_SIZE_CLASSES[size],
        className,
      ].join(' ')}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Chargement…
        </span>
      ) : (
        children
      )}
    </button>
  );
}

// ─── Input ────────────────────────────────────────────────────────────────────

interface InputProps {
  readonly type?: string;
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly placeholder?: string;
  readonly className?: string;
  readonly required?: boolean;
  readonly autoComplete?: string;
  readonly id?: string;
  readonly'aria-describedby'?: string;
  readonly hasError?: boolean;
}

export function Input({
  type = 'text',
  value,
  onChange,
  placeholder = '',
  className = '',
  required,
  autoComplete,
  id,
  'aria-describedby': ariaDescribedby,
  hasError = false,
}: InputProps): React.JSX.Element {
  return (
    <input
      id={id}
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      autoComplete={autoComplete}
      aria-describedby={ariaDescribedby}
      aria-invalid={hasError || undefined}
      className={[
        'w-full px-3 py-2 border-[3px] focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 shadow-[2px_2px_0_0_#d1d5db]',
        hasError ? 'border-red-500' : 'border-slate-300',
        className,
      ].join(' ')}
    />
  );
}

// ─── TextArea ─────────────────────────────────────────────────────────────────

interface TextAreaProps {
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly placeholder?: string;
  readonly rows?: number;
  readonly className?: string;
  readonly id?: string;
  readonly required?: boolean;
  readonly hasError?: boolean;
  readonly'aria-describedby'?: string;
}

export function TextArea({
  value,
  onChange,
  placeholder = '',
  rows = 4,
  className = '',
  id,
  required,
  hasError = false,
  'aria-describedby': ariaDescribedby,
}: TextAreaProps): React.JSX.Element {
  return (
    <textarea
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      required={required}
      aria-describedby={ariaDescribedby}
      aria-invalid={hasError || undefined}
      className={[
        'w-full px-3 py-2 border-[3px] focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 shadow-[2px_2px_0_0_#d1d5db]',
        hasError ? 'border-red-500' : 'border-slate-300',
        className,
      ].join(' ')}
    />
  );
}

// ─── Select ───────────────────────────────────────────────────────────────────

interface SelectOption {
  readonly value: string;
  readonly label: string;
}

interface SelectProps {
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly options?: readonly SelectOption[];
  readonly className?: string;
  readonly id?: string;
  readonly required?: boolean;
  readonly hasError?: boolean;
}

export function Select({
  value,
  onChange,
  options = [],
  className = '',
  id,
  required,
  hasError = false,
}: SelectProps): React.JSX.Element {
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      aria-invalid={hasError || undefined}
      className={[
        'w-full px-3 py-2 border-[3px] focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 bg-white shadow-[2px_2px_0_0_#d1d5db]',
        hasError ? 'border-red-500' : 'border-slate-300',
        className,
      ].join(' ')}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

// ─── Checkbox ─────────────────────────────────────────────────────────────────

interface CheckboxProps {
  readonly checked: boolean;
  readonly onChange: (checked: boolean) => void;
  readonly label: string;
  readonly className?: string;
  readonly required?: boolean;
  readonly id?: string;
}

export function Checkbox({
  checked,
  onChange,
  label,
  className = '',
  required,
  id,
}: CheckboxProps): React.JSX.Element {
  return (
    <label className={`flex items-start gap-3 cursor-pointer ${className}`}>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        required={required}
        className="h-5 w-5 mt-0.5 text-emerald-600 focus:ring-emerald-500 border-slate-300 border-2 shrink-0 shadow-[2px_2px_0_0_#d1d5db]"
      />
      <span className="text-sm text-slate-700">{label}</span>
    </label>
  );
}

// ─── LinkButton ───────────────────────────────────────────────────────────────

interface LinkButtonProps {
  readonly href: string;
  readonly children: React.ReactNode;
  readonly className?: string;
  readonly variant?: ButtonVariant;
  readonly size?: ButtonSize;
}

const LINK_VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:   'bg-emerald-600 text-white hover:bg-emerald-700 border-[3px] border-slate-300 shadow-[4px_4px_0_0_#d1d5db] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_0_#d1d5db] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none font-bold uppercase tracking-wide',
  secondary: 'bg-slate-200 text-slate-800 hover:bg-slate-300 border-[3px] border-slate-300 shadow-[4px_4px_0_0_#d1d5db] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_0_#d1d5db] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none font-bold uppercase tracking-wide',
  outline:   'border-[3px] border-emerald-600 text-emerald-600 hover:bg-emerald-50 shadow-[4px_4px_0_0_#d1d5db] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_0_#d1d5db] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none font-bold uppercase tracking-wide',
  ghost:     'text-emerald-600 hover:bg-emerald-50 font-bold uppercase tracking-wide',
};

export function LinkButton({
  href,
  children,
  className = '',
  variant = 'primary',
  size = 'md',
}: LinkButtonProps): React.JSX.Element {
  const classes = [
    'inline-flex items-center justify-center gap-1   font-medium transition-colors',
    LINK_VARIANT_CLASSES[variant],
    BUTTON_SIZE_CLASSES[size],
    className,
  ].join(' ');

  const isExternal = href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:');

  if (isExternal) {
    return (
      <a
        href={href}
        className={classes}
        target={href.startsWith('mailto:') || href.startsWith('tel:') ? undefined : '_blank'}
        rel={href.startsWith('mailto:') || href.startsWith('tel:') ? undefined : 'noopener noreferrer'}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={classes}>
      {children}
    </Link>
  );
}