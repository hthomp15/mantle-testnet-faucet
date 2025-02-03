import Script from 'next/script';
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Mantle Testnet Faucet',
  description: 'Request TFIDE tokens on Mantle Sepolia testnet',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body suppressHydrationWarning={true}>
        {children}
        <Script
          src={`https://www.google.com/recaptcha/api.js?render=${process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}`}
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}