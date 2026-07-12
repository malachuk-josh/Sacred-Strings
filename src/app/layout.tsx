import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import Navigation from "@/components/Navigation";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });

export const metadata: Metadata = {
  title: "Sacred Strings",
  description: "Classical guitar trainer for worship",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Sacred Strings",
  },
};

export const viewport: Viewport = {
  themeColor: "#e2b857",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${inter.variable} ${playfair.variable} h-full antialiased`}>
        <head>
          <link rel="apple-touch-icon" href="/icons/icon-192.svg" />
        </head>
        <body className="min-h-full flex flex-col">
          <ServiceWorkerRegistration />
          <div className="min-h-screen bg-background text-foreground">
            <Navigation />
            <main className="pb-20 lg:pb-0 lg:pl-64">
              {children}
            </main>
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}
