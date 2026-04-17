import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';

export const metadata: Metadata = {
  title: 'Career Copilot Studio',
  description: 'Premium AI career copilot. CV studio, upload analysis, photo refinement, versioned output ve application tracking deneyimi.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="tr" data-theme="light" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
