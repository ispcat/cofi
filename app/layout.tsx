import type { Metadata } from 'next';
import './globals.css';
import SessionManager from '@/components/SessionManager';

export const metadata: Metadata = {
  title: 'Co-Fi - Collaborative Lofi Music',
  description: 'A multi-user collaborative visual Lo-Fi music social platform.',
  icons: {
    icon: '/favicon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <SessionManager />
        {children}
      </body>
    </html>
  );
}
