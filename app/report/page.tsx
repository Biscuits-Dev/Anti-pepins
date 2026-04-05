import type { Metadata } from 'next';
import ReportClient from './ReportClient';

export const metadata: Metadata = {
  title: 'Signaler une arnaque - Anti Pepins',
  description: 'Signalez une arnaque ou une tentative de fraude. Votre signalement aide à protéger toute la communauté.',
};

export default function ReportPage() {
  return <ReportClient />;
}