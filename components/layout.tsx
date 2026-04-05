'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { LinkButton } from '@/components/ui';
import { ChatWidget } from '@/components/chat';

export interface HeaderProps {
  readonly logoText?: string;
}

interface NavLink {
  readonly href: string;
  readonly label: string;
}

interface StatItem {
  readonly value: string;
  readonly label: string;
  readonly icon?: string;
}

export interface SectionHeaderProps {
  readonly id?: string;
  readonly title: string;
  readonly subtitle?: string;
  readonly align?: 'left' | 'center';
}


const NAV_LINKS: readonly NavLink[] = [
  { href: '/',         label: 'Accueil' },
  { href: '/analyze',   label: 'Analyse' },
  { href: '/support',  label: 'Soutien' },
  { href: '/temoignage',  label: 'Témoignage' },
  { href: '/blog',     label: 'Blog' },
  { href: '/about',    label: 'À propos' },
  { href: '/contact',  label: 'Contact' },
] as const;

const FOOTER_NAV = {
  main: [
    { name: 'Accueil',              href: '/' },
    { name: 'Signaler une arnaque', href: '/report' },
    { name: 'Blog',                 href: '/blog' },
  ],
  legal: [
    { name: 'Contact',              href: '/contact' },
    { name: 'Mentions légales',     href: '/mentions-legales' },
    { name: 'RGPD',                 href: '/rgpd' },
    { name: 'CGU',                  href: '/cgu' },
    { name: 'Politique de cookies', href: '/politique-cookies' },
    { name: 'Accessibilité',        href: '/accessibilite' },
  ],
  community: [
    { name: 'Biscuits IA',  href: 'https://biscuits-ia.com/' },
    { name: 'GitHub',  href: 'https://github.com/Biscuits-Dev/' }
  ],
} as const;

const GITHUB_REPO_URL = 'https://github.com/Biscuits-Dev/';
const BISCUITS_IA_URL = 'https://biscuits-ia.com/';

export function Header({ logoText = 'Anti Pepins' }: HeaderProps): React.JSX.Element {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
      <header className="bg-white border-b-4 border-slate-300 sticky top-0 z-50 shadow-[0_4px_0_0_#d1d5db]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <span className="font-black text-2xl text-emerald-700 group-hover:text-emerald-800 transition-colors uppercase tracking-wider">
              {logoText}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-1" aria-label="Navigation principale">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isActive ? 'page' : undefined}
                  className={[
                    'px-3 py-2 text-sm font-bold uppercase tracking-wide transition-all border-2 border-transparent',
                    isActive
                      ? 'bg-emerald-50 text-emerald-700 border-slate-300 shadow-[2px_2px_0_0_#d1d5db]'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 hover:shadow-[2px_2px_0_0_#d1d5db] hover:translate-x-[-1px] hover:translate-y-[-1px]',
                  ].join(' ')}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex">
            <LinkButton href="/report" variant="primary">
              Signaler une arnaque
            </LinkButton>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 border-2 border-slate-300 shadow-[2px_2px_0_0_#d1d5db] text-slate-600 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
            aria-label="Menu de navigation"
          >
            <span className="text-2xl" aria-hidden="true">☰</span>
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <nav id="mobile-menu" className="md:hidden border-t-4 border-slate-300 bg-white shadow-[0_4px_0_0_#d1d5db]" aria-label="Navigation mobile">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isActive ? 'page' : undefined}
                  className={[
                    'block px-3 py-2 border-2 border-transparent text-base font-bold uppercase tracking-wide',
                    isActive
                      ? 'bg-emerald-50 text-emerald-700 border-slate-300 shadow-[2px_2px_0_0_#d1d5db]'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 hover:shadow-[2px_2px_0_0_#d1d5db]',
                  ].join(' ')}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              );
            })}
            <div className="pt-4 pb-2 border-t border-slate-200">
              <LinkButton href="/report" className="w-full justify-center">
                Signaler une arnaque
              </LinkButton>
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}

export function Footer({ logoText = 'Anti Pepins' }: HeaderProps): React.JSX.Element {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-50 border-t-4 border-slate-300 shadow-[0_-4px_0_0_#d1d5db]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Image src="/logo.webp" alt="" width={32} height={32} />
              <span className="font-black text-xl text-emerald-700 uppercase tracking-wider">{logoText}</span>
            </div>
            <p className="text-slate-600 text-sm">
              Vos signalements aident toute la communauté à rester en sécurité en ligne. Ce collectif est une initiative de l&apos;association Biscuits IA
            </p>
            <div className="flex gap-2 items-center">
              <a
                href={GITHUB_REPO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-emerald-600 transition-colors"
                aria-label="GitHub Repository"
              >
                <Image src="/GitHub-Logo.svg" alt="GitHub" width={62} height={62} />
              </a>
              <a
                href={BISCUITS_IA_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-emerald-600 transition-colors"
                aria-label="Biscuits IA"
              >
                <Image src="/globe.svg" alt="Biscuits IA" width={32} height={32} />
              </a> 
            </div>
          </div>

          {/* Navigation columns */}
          {(
            [
              { title: 'Navigation', links: FOOTER_NAV.main },
              { title: 'Légal',      links: FOOTER_NAV.legal },
              { title: 'Communauté', links: FOOTER_NAV.community },
            ] as const
          ).map((column) => (
            <div key={column.title}>
              <h3 className="text-sm font-semibold text-slate-900 tracking-wider uppercase mb-4">
                {column.title}
              </h3>
              <ul className="space-y-2">
                {column.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-slate-600 hover:text-emerald-700 transition-all text-sm font-semibold border-l-2 border-transparent hover:border-emerald-700 hover:pl-2 inline-block"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-500 text-sm">
            © {currentYear} {logoText}. Tous droits réservés.
          </p>
          <LinkButton href="/report" variant="outline" size="sm">
            Signaler une arnaque
          </LinkButton>
        </div>
      </div>
    </footer>
  );
}

interface MainLayoutProps {
  readonly children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps): React.JSX.Element {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <ChatWidget />
    </div>
  );
}

export function SectionHeader({
  id,
  title,
  subtitle,
  align = 'center',
}: SectionHeaderProps): React.JSX.Element {
  return (
    <div
      id={id}
      className={[
        'mb-10 px-4',
        align === 'center' ? 'text-center' : 'text-left',
      ].join(' ')}
    >
      <h2 className="text-3xl font-black text-slate-900 mb-3 uppercase tracking-tight inline-block relative">
        {title}
        <span className="absolute bottom-[-6px] left-0 w-[60px] h-[4px] bg-emerald-600 shadow-[2px_2px_0_0_#d1d5db]"></span>
      </h2>
      {subtitle != null && subtitle !== '' && (
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">{subtitle}</p>
      )}
    </div>
  );
}

interface StatsSectionProps {
  readonly stats: readonly StatItem[];
}

export function StatsSection({ stats }: StatsSectionProps): React.JSX.Element {
  return (
    <section className="bg-white py-12" aria-label="Chiffres clés">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center p-4 border-[3px] border-slate-300 shadow-[4px_4px_0_0_#d1d5db] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_0_#d1d5db] transition-all">
              <div className="text-4xl text-emerald-600 mb-2">{stat.value}</div>
              <div className="text-sm font-medium text-slate-600 uppercase tracking-wide">
                {stat.icon != null && <span aria-hidden="true">{stat.icon} </span>}
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}