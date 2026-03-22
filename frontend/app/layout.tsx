import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Notes App',
  description: 'Keep track of your notes in an organized way',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
