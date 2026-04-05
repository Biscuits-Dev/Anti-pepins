import type { Metadata } from 'next';
import ContactClient from './ContactClient';

export const metadata: Metadata = {
  title: 'Contactez-nous - Anti Pepins',
  description: "Une question, une suggestion, ou besoin d'aide ? Notre collectif est là pour vous accompagner.",
};

export default function ContactPage() {
  return <ContactClient />;
}