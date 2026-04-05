import type { Metadata } from "next";
import PolitiqueCookiesClient from "./PolitiqueCookiesClient";

export const metadata: Metadata = {
  title: "Politique de cookies",
  description: "Informations sur l'utilisation des cookies sur Anti-Pépins : types, finalités, durées et gestion de vos préférences.",
};

export default function PolitiqueCookiesPage() {
  return <PolitiqueCookiesClient />;
}
