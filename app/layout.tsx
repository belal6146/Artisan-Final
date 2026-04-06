import { Suspense } from "react";
import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { cn } from "@/frontend/lib/utils";
import { AuthProvider } from "@/contexts/AuthContext";
import { LocaleProvider } from "@/frontend/contexts/LocaleContext";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";


const sans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const serif = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Artisan",
  description: "A professional ecosystem for emerging artists.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          sans.variable,
          serif.variable
        )}
      >
        <AuthProvider>
          <LocaleProvider>
            <div className="flex flex-col min-h-screen">
              <Header />
              <main className="flex-1">
                <Suspense fallback={
                  <div className="min-h-[60vh] flex items-center justify-center p-20">
                    <div className="h-4 w-4 bg-primary/20 rounded-full animate-pulse" />
                  </div>
                }>
                  {children}
                </Suspense>
              </main>
              <Footer />
            </div>
          </LocaleProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
