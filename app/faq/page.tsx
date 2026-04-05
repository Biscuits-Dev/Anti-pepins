import type { Metadata } from "next";
import FAQClient from "./FAQClient";

export const metadata: Metadata = {
  title: "Foire Aux Questions",
  description: "Réponses aux questions fréquentes sur Anti-Pépins : signalement d'arnaques, RGPD, modération et fonctionnement de la plateforme.",
  openGraph: {
    title: "FAQ — Anti-Pépins",
    description: "Questions fréquentes sur le signalement d'arnaques et l'utilisation d'Anti-Pépins.",
  },
};

export default function FAQPage() {
  return <FAQClient />;
}
