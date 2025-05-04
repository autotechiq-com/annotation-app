import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import DictionaryProvider from '@/components/dictionary-provider';
import { getDictionary, getLangCookie } from '@/lib/lang';
import ClientProvider from '@/components/client-provider';

const inter = Inter({ subsets: ['latin', 'cyrillic'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Annotation App',
  description: '',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const langCookie = await getLangCookie();
  const lang = langCookie || 'en';
  const dictionary = await getDictionary(lang);
  return (
    <html lang={lang}>
      <DictionaryProvider dictionary={dictionary}>
        <ClientProvider>
          <body className={`${inter.className} antialiased`}>{children}</body>
        </ClientProvider>
      </DictionaryProvider>
    </html>
  );
}
