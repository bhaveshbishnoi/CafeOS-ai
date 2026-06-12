import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CafeOS AI - Cafe Operating System",
  description: "AI-Powered Cafe Operating System combining POS, Inventory, Recipe Costing, CRM, Loyalty, Analytics, and Demand Forecasting in one unified platform.",
  keywords: "cafe management, POS, inventory, CRM, AI analytics, cafe software",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Outfit:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        <meta name="color-scheme" content="dark light" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
