import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Veðurspá vs. Raunveruleiki | Veðurstofa Íslands',
  description: 'Hversu rétt var veðurspáin á vedur.is miðað við raunmælingar veðurstöðva dagsins? Gagnvirkt mælaborð og greining á spágæðum á Íslandi.',
  keywords: ['Veður', 'Veðurspá', 'Veðurstofa Íslands', 'Veðurathugun', 'Spágæði', 'Ísland'],
  openGraph: {
    title: 'Veðurspá vs. Raunveruleg veðurathugun',
    description: 'Samanburður á veðurspá og veðurathugun dagsins á Íslandi.',
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
