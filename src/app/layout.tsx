import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import Navigation from "@/components/Navigation";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-dmsans",
});

export const metadata: Metadata = {
  title: "Sacred Strings",
  description: "A classical guitar trainer for worship",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Sacred Strings",
  },
};

export const viewport: Viewport = {
  themeColor: "#2c1810",
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
      <html lang="en" className={`${cormorant.variable} ${dmSans.variable} h-full`}>
        <body className="min-h-full">
          <ServiceWorkerRegistration />
          <div className="min-h-screen bg-background text-foreground lg:pl-64">
            <Navigation />
            <main className="pb-24 lg:pb-0">{children}</main>
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}
