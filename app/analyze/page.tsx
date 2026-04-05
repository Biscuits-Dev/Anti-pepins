import type { Metadata } from "next";
import AnalyzeClient from "./AnalyzeClient";

export const metadata: Metadata = {
  title: "Analyser un contenu suspect",
  description: "Collez une URL, email, téléphone ou message pour détecter les arnaques grâce à notre analyseur gratuit (IA + règles expertes).",
  openGraph: {
    title: "Analyser un contenu suspect — Anti-Pépins",
    description: "Outil gratuit d'analyse anti-arnaque : URL, email, téléphone, message.",
  },
};

export default function AnalyzePage() {
  return <AnalyzeClient />;
}
