
'use client';

import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from '@/hooks/use-auth';
import { useThemeObserver } from '@/hooks/useThemeObserver';
import { Inter } from 'next/font/google';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';

const inter = Inter({ subsets: ['latin'] });

// Since the layout itself cannot be a client component for metadata reasons,
// we create a small client component to house the hook.
function ThemeObserver() {
  useThemeObserver();
  return null; // This component doesn't render anything.
}

// We cannot export metadata from a client component.
// But we can keep it here as the layout is still a server component.
/*
export const metadata: Metadata = {
  title: 'Habitica',
  description: 'Gamified habit tracker to motivate users.',
};
*/


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <title>Habitica</title>
        <meta name="description" content="Gamified habit tracker to motivate users." />
      </head>
      <body className={`${inter.className} antialiased`}>
        <AuthProvider>
          <ThemeObserver />
          <FirebaseErrorListener />
          {children}
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
