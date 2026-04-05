'use client';

import { useState, useLayoutEffect } from 'react';
import { SectionHeader } from '@/components/layout';
import { reportTypes } from '@/lib/scam-types';

// Les 3 arnaques les plus fréquentes affichées par défaut
const commonScamIds = new Set(['phishing', 'romance', 'investment']);

export default function ScamTypesSection() {
  const [showAll, setShowAll] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const visibleTypes = showAll ? reportTypes : reportTypes.filter(type => commonScamIds.has(type.id));

  useLayoutEffect(() => {
    if (isTransitioning) {
      const timer = setTimeout(() => setIsTransitioning(false), 600);
      return () => clearTimeout(timer);
    }
  }, [isTransitioning]);

  const handleToggle = () => {
    setIsTransitioning(true);
    setShowAll(!showAll);
  };

  return (
    <section className="py-12 bg-white">
      <SectionHeader
        title="Voici les types d'arnaque que vous pouriez subir"
        subtitle="Les 3 arnaques les plus fréquentes sont affichées par défaut"
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 transition-all duration-600">
          {reportTypes.map((type) => {
            const isVisible = visibleTypes.some(t => t.id === type.id);
            return (
              <div
                key={type.id}
                className={`p-6 border-[3px] border-slate-900 shadow-[4px_4px_0_0_#171717] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_0_#171717] transition-all duration-300 overflow-hidden ${
                  isVisible
                    ? 'opacity-100 scale-100 max-h-96'
                    : 'opacity-0 scale-95 max-h-0'
                }`}
                style={{
                  transitionProperty: 'opacity, transform, max-height',
                  transitionDuration: '500ms',
                  transitionTimingFunction: 'cubic-bezier(0.3, 0, 0.2, 1)',
                }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className={`text-4xl ${type.iconColor}`}>{type.icon}</div>
                  <h3 className="font-bold text-slate-900 text-lg">{type.title}</h3>
                </div>
                <p className="text-slate-700 mb-4 text-sm leading-relaxed">{type.description}</p>
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-slate-500 uppercase">Exemples :</p>
                  <ul className="space-y-1">
                    {type.examples.map((example) => (
                      <li key={example} className="text-sm text-slate-600 flex items-start gap-2">
                        <span className="text-slate-400 mt-1">•</span>
                        {example}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
        <div className="text-center mt-6">
          <button
            onClick={handleToggle}
            className="inline-flex items-center gap-2 px-6 py-3 border-[3px] border-slate-900 shadow-[4px_4px_0_0_#171717] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_0_#171717] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none text-slate-700 font-bold uppercase tracking-wide transition-all duration-200"
          >
            {showAll ? (
              <>
                {' '}
                Afficher les plus fréquentes
              </>
            ) : (
              <>
                {' '}
                {'Voir tous les types d\u0027arnaques (' + reportTypes.length + ')'}
              </>
            )}
          </button>
        </div>
      </div>
    </section>
  );
}