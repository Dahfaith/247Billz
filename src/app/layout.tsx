import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Header } from "@/components/header";
import Footer from "@/components/footer";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "247Billz – Invoice, Quote & Get Paid Faster",
  description: "247Billz is a premium invoicing and receipt generation platform designed for modern African businesses. Create invoices, quotations, and receipts in seconds.",
  verification: {
    google: "n_28Rc86Tuj-cZiAS6kySq1X-X95g7jTkZuK9jAshAQ",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        {process.env.NODE_ENV === 'production' && (
          <>
            <Script
              src="https://www.googletagmanager.com/gtag/js?id=G-P97MRNC4NR"
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);} 
                gtag('js', new Date());
              
                gtag('config', 'G-P97MRNC4NR');
              `}
            </Script>
          </>
        )}
      </head>
      <body className="antialiased">
        <Header />
        <main className="min-h-[calc(100vh-6rem)]">{children}</main>
        <Footer />
        <Toaster position="top-center" richColors closeButton duration={3000} />
      </body>
    </html>
  );
}
