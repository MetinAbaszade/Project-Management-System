import { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/providers/Providers';
import { Toaster } from '@/components/ui/toaster';
import ClientOnly from '@/components/ClientOnly'; 

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'TaskUp - Beautiful work, managed carefully',
  description: 'Modern task and project management for teams',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  themeColor: '#ef4444',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>
          <div className="min-h-screen bg-background">
            {children}
            <ClientOnly>
              <Toaster />
            </ClientOnly>
          </div>
        </Providers>
      </body>
    </html>
  );
}
