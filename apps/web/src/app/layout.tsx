import { Bricolage_Grotesque } from "next/font/google";
import { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { cn } from "@/lib/utils";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "acost — Financial Visibility for AI SaaS Products",
  description: "Track real AI token costs, latency, and request profitability in real time.",
  keywords: ["AI", "SaaS", "Financial Visibility", "Token Costs", "Latency Tracking", "Profitability Analysis"],
  authors: [{ name: "acost" }],
  openGraph: {
    title: "acost — Financial Visibility for AI SaaS Products",
    description: "Track real AI token costs, latency, and request profitability in real time.",
    url: "https://acost.fyi",
    siteName: "acost",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "acost — Financial Visibility for AI SaaS Products",
    description: "Track real AI token costs, latency, and request profitability in real time.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={cn("font-sans", bricolage.variable)} id="theme-root">
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-ECWNKKEYGM"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-ECWNKKEYGM');
          `}
        </Script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const storedTheme = localStorage.getItem('theme');
                  if (storedTheme === 'dark') {
                    document.getElementById('theme-root').classList.add('dark');
                  } else {
                    document.getElementById('theme-root').classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="bg-canvas text-primary">
        {children}
      </body>
    </html>
  );
}
