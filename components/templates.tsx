'use client';

import React from 'react';
import Link from 'next/link';
import { Header, Footer} from '@/components/layout';
import { LinkButton } from '@/components/ui';
import type { Article, Category, TeamMember, SiteValue, ContactMethod } from '@/types';

// DatabasePage Template
interface DatabasePageProps {
  title: string;
  subtitle: string;
  stats: { value: string; label: string }[];
  children: React.ReactNode;
  searchSection?: React.ReactNode;
}

export function DatabasePageTemplate({ title, subtitle, stats, children, searchSection }: Readonly<DatabasePageProps>) {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="bg-slate-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-4xl font-bold text-slate-900 mb-4">{title}</h1>
              <p className="text-lg text-slate-600 mb-8">{subtitle}</p>
              <div className="flex justify-center gap-8">
                {stats.map((stat) => (
                  <div key={stat.label}>
                    <div className="text-3xl font-bold text-emerald-600">{stat.value}</div>
                    <div className="text-sm text-slate-600">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Search Section */}
        {searchSection && (
          <section className="py-8 border-y border-slate-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {searchSection}
            </div>
          </section>
        )}

        {/* Content Section */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

// BlogPage Template
interface BlogPageProps {
  title: string;
  subtitle: string;
  stats: { value: string; label: string }[];
  categories: Category[];
  articles: Article[];
  children?: React.ReactNode;
}

export function BlogPageTemplate({ title, subtitle, stats, categories, articles }: Readonly<BlogPageProps>) {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="bg-slate-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-4xl font-bold text-slate-900 mb-4">{title}</h1>
              <p className="text-lg text-slate-600 mb-8">{subtitle}</p>
              <div className="flex justify-center gap-8">
                {stats.map((stat) => (
                  <div key={stat.label}>
                    <div className="text-3xl font-bold text-emerald-600">{stat.value}</div>
                    <div className="text-sm text-slate-600">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-white border border-slate-200  -lg p-6 sticky top-24">
                  <h2 className="font-bold text-slate-900 mb-4">Catégories</h2>
                  <div className="space-y-2">
                    {categories.map((cat) => (
                      <Link
                        key={cat.name}
                        href="#"
                        className="flex justify-between items-center p-2 hover:bg-slate-50   transition-colors"
                      >
                        <span className="text-slate-700">{cat.name}</span>
                        <span className="text-xs text-slate-400">{cat.count}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {/* Articles */}
              <div className="lg:col-span-3">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Derniers articles</h2>
                <div className="grid gap-6">
                  {articles.map((article) => (
                    <article key={article.id} className="flex flex-col sm:flex-row gap-6 p-6 bg-white border border-slate-200  -lg hover:shadow-md transition-shadow">
                      <div className="flex-1">
                        <div className="flex gap-3 text-xs text-slate-500 mb-2">
                          <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5  -full">{article.category}</span>
                          <span>{article.date}</span>
                          <span>{article.readTime}</span>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2 hover:text-emerald-700 transition-colors">
                          <Link href="#">{article.title}</Link>
                        </h3>
                        <p className="text-slate-600 mb-4">{article.excerpt}</p>
                        <Link href="#" className="text-emerald-600 hover:text-emerald-800 font-medium text-sm">
                          Lire l&apos;article →
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

// AboutPage Template
interface AboutPageProps {
  title: string;
  subtitle: string;
  stats: { value: string; label: string }[];
  teamMembers: TeamMember[];
  values: SiteValue[];
  children?: React.ReactNode;
}

export function AboutPageTemplate({ title, subtitle, stats, teamMembers, values }: Readonly<AboutPageProps>) {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="bg-slate-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-4xl font-bold text-slate-900 mb-4">{title}</h1>
              <p className="text-lg text-slate-600 mb-8">{subtitle}</p>
              <div className="flex justify-center gap-8">
                {stats.map((stat) => (
                  <div key={stat.label}>
                    <div className="text-3xl font-bold text-emerald-600">{stat.value}</div>
                    <div className="text-sm text-slate-600">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teamMembers.map((member) => (
                <div key={member.name} className="bg-white border border-slate-200  -lg p-6 text-center">
                  <div className="w-20 h-20 mx-auto bg-emerald-100  -full flex items-center justify-center text-2xl mb-4">
                    👤
                  </div>
                  <h3 className="font-bold text-lg text-slate-900">{member.name}</h3>
                  <p className="text-emerald-600 text-sm mb-2">{member.role}</p>
                  <p className="text-slate-500 text-sm mb-3">{member.expertise}</p>
                  <p className="text-slate-600 text-sm">{member.bio}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="bg-slate-50 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center">Nos valeurs</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {values.map((value) => (
                <div key={value.title} className="flex gap-4 items-start">
                  <div className="text-2xl">✨</div>
                  <div>
                    <h3 className="font-bold text-slate-900 mb-2">{value.title}</h3>
                    <p className="text-slate-600 text-sm">{value.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

// ContactPage Template
interface ContactPageProps {
  title: string;
  subtitle: string;
  stats: { value: string; label: string }[];
  contactMethods: ContactMethod[];
}

export function ContactPageTemplate({ title, subtitle, stats, contactMethods }: Readonly<ContactPageProps>) {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="bg-slate-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-4xl font-bold text-slate-900 mb-4">{title}</h1>
              <p className="text-lg text-slate-600 mb-8">{subtitle}</p>
              <div className="flex justify-center gap-8">
                {stats.map((stat) => (
                  <div key={stat.label}>
                    <div className="text-3xl font-bold text-emerald-600">{stat.value}</div>
                    <div className="text-sm text-slate-600">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Contact Methods */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {contactMethods.map((method) => (
                <div key={method.id} className="bg-white border border-slate-200  -lg p-6 text-center hover:shadow-md transition-shadow">
                  <div className="text-4xl mb-4">{method.icon}</div>
                  <h3 className="font-bold text-lg text-slate-900 mb-2">{method.name}</h3>
                  <p className="text-slate-600 text-sm mb-4">{method.description}</p>
                  <div className="space-y-2 text-sm mb-4">
                    <div>
                      <span className="text-slate-500">{method.infoLabel}: </span>
                      <a href={method.href} className="text-emerald-600 hover:underline">
                        {method.infoValue}
                      </a>
                    </div>
                    {method.availability && (
                      <div>
                        <span className="text-slate-500">Disponibilité: </span>
                        <span className="text-slate-700">{method.availability}</span>
                      </div>
                    )}
                  </div>
                  <LinkButton href={method.href} variant="outline" className="w-full">
                    {method.actionLabel}
                  </LinkButton>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

// ReportPage Template
interface ReportPageProps {
  title: string;
  subtitle: string;
  stats: { value: string; label: string }[];
  children: React.ReactNode;
}

export function ReportPageTemplate({ title, subtitle, stats, children }: Readonly<ReportPageProps>) {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="bg-slate-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-4xl font-bold text-slate-900 mb-4">{title}</h1>
              <p className="text-lg text-slate-600 mb-8">{subtitle}</p>
              <div className="flex justify-center gap-8">
                {stats.map((stat) => (
                  <div key={stat.label}>
                    <div className="text-3xl font-bold text-emerald-600">{stat.value}</div>
                    <div className="text-sm text-slate-600">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Form Section */}
        <section className="py-12">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white border border-slate-200  -lg p-8 shadow-sm">
              {children}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

// TipCard Component
export function TipCard({ icon, title, description }: Readonly<{ icon: string; title: string; description: string }>) {
  return (
    <div className="bg-white border border-slate-200  -lg p-6 hover:shadow-md transition-shadow">
      <div className="text-3xl mb-4">{icon}</div>
      <h3 className="font-bold text-lg text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-600 text-sm">{description}</p>
    </div>
  );
}

// CTASection Component
export function CTASection({ title, subtitle, primaryAction, secondaryAction }: Readonly<{ title: string; subtitle: string; primaryAction?: React.ReactNode; secondaryAction?: React.ReactNode }>) {
  return (
    <section className="bg-emerald-600 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">{title}</h2>
        <p className="text-emerald-100 text-lg mb-6">{subtitle}</p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          {primaryAction && <div className="inline-block">{primaryAction}</div>}
          {secondaryAction && <div className="inline-block">{secondaryAction}</div>}
        </div>
      </div>
    </section>
  );
}
