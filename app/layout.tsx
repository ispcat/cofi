import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Cofi - Ambient Rooms',
  description: 'Create and join ambient rooms with friends',
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
