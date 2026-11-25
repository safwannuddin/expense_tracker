import { Suspense } from "react";
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pocket – Expense Tracker",
  description: "AI-powered personal monthly expense tracker",
  applicationName: "Pocket",
  appleWebApp: { capable: true, title: "Pocket", statusBarStyle: "default" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f7fb" },
    { media: "(prefers-color-scheme: dark)", color: "#141320" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1, // stop iOS zooming into inputs
  viewportFit: "cover", // draw under the notch; we pad with safe-area insets
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en-GB"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* Clerk reads request data, so it streams in behind Suspense (cacheComponents). */}
        <Suspense>
          <ClerkProvider
            appearance={{
              variables: { colorPrimary: "#4f46e5", borderRadius: "0.75rem", fontFamily: "var(--font-geist-sans)" },
            }}
          >
            {children}
            <Toaster />
          </ClerkProvider>
        </Suspense>
      </body>
    </html>
  );
}
