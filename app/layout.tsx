import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Toaster, type ToasterProps } from "react-hot-toast";
import { Analytics } from "@vercel/analytics/next";
import CookieBanner from "@/components/CookieBanner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://anti-pepins.biscuits-ia.com"),
  title: {
    default: "Anti-Pépins — Collectif contre les arnaques",
    template: "%s | Anti-Pépins",
  },
  description: "Signalement et analyse des arnaques en ligne. Plateforme gratuite pour protéger les citoyens français.",
  openGraph: {
    siteName: "Anti-Pépins",
    locale: "fr_FR",
    type: "website",
  },
  icons: { icon: "/logo.webp" },
};

const TOASTER_OPTIONS: ToasterProps["toastOptions"] = {
  className: "bg-white border border-gray-200 shadow-lg",
  duration: 5000,
  success: {
    icon: "✓",
    style: { background: "#10B981", color: "white" },
  },
  error: {
    icon: "✗",
    style: { background: "#EF4444", color: "white" },
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>): React.JSX.Element {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      data-theme="light"
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <CookieBanner />
        <SpeedInsights />
        <Analytics />
        <Toaster
          position="top-right"
          reverseOrder={false}
          toastOptions={TOASTER_OPTIONS}
        />
        {children}
      </body>
    </html>
  );
}