import { Header, Footer, SectionHeader } from '@/components/layout';
import { LinkButton } from '@/components/ui';

export default function NotFound(): React.JSX.Element {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-1 flex items-center justify-center py-16 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">

          <div className="mb-8" aria-hidden="true">
            <div className="relative w-64 h-64 mx-auto">
              <div className="absolute inset-0 bg-emerald-100  -full opacity-50 animate-pulse" />
              <div className="relative bg-white  -full p-8 shadow-xl border-4 border-emerald-200">
                <p className="text-8xl mb-4" suppressHydrationWarning>🚨</p>
                <p className="text-6xl font-bold text-slate-900 mb-2">404</p>
                <p className="text-lg text-slate-600">Page non trouvée</p>
              </div>
            </div>
          </div>

          <SectionHeader
            title="Oups ! Cette page s'est fait arnaquer"
            subtitle="La page que vous recherchez a disparu dans la nature, comme un escroc qui prend la fuite."
            align="center"
          />

          <nav
            className="flex flex-col sm:flex-row gap-4 justify-center mt-8"
            aria-label="Navigation de secours"
          >
            <LinkButton href="/" variant="primary" size="lg">
              <span aria-hidden="true" suppressHydrationWarning>🏠</span>
              {' '}Retour à l&apos;accueil
            </LinkButton>
            <LinkButton href="/report" variant="secondary" size="lg">
              <span aria-hidden="true" suppressHydrationWarning>📝</span>
              {' '}Signaler une arnaque
            </LinkButton>
          </nav>

          <aside className="mt-12 p-6 bg-white  -lg border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-3">Besoin d&apos;aide&nbsp;?</h3>
            <p className="text-slate-600 mb-4">
              Si vous pensez que cette page devrait exister, merci de nous le signaler.
              Nous travaillons chaque jour à améliorer votre expérience de navigation.
            </p>
            <LinkButton href="/contact" variant="ghost" size="sm">
              Nous contacter
            </LinkButton>
          </aside>

        </div>
      </main>

      <Footer />
    </div>
  );
}