import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Veðurvaktin | Samanburður á spám & AI-Leiðrétting',
  description: 'Hversu rétt var veðurspáin miðað við raunmælingar veðurstöðva dagsins? Gagnvirkt mælaborð, 365 daga ársgreining og AI-leiðrétting á tölvuspám á Íslandi.',
  keywords: ['Veður', 'Veðurspá', 'Veðurathugun', 'Spágæði', 'Ísland', 'AI veðurspá', 'Veðurvaktin'],
  openGraph: {
    title: 'Veðurvaktin – Veðurspá vs. Raunveruleg veðurathugun',
    description: 'Samanburður á tölvuspám og veðurathugunum á Íslandi ásamt AI-leiðréttingu.',
    type: 'website',
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="is">
      <body>{children}</body>
    </html>
  );
}
