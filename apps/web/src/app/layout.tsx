import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { cookies } from "next/headers";
import Navigation from "./components/Navigation";
import { ToastProvider } from "./components/Toast";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap"
});

export const metadata: Metadata = {
  title: "GBP Stablecoin Issuer Console",
  description: "Internal issuer console for GBP stablecoin operations."
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const isLoggedIn = !!cookieStore.get("auth_token");

  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased">
        <ToastProvider>
          {isLoggedIn ? (
            <div className="flex min-h-screen">
              <div className="hidden lg:block lg:w-[240px] lg:flex-shrink-0 border-r border-[var(--stroke)] bg-[var(--surface)]">
                <Navigation />
              </div>
              <main className="flex-1 overflow-y-auto">
                <div className="px-8 py-8 lg:px-12">
                  {children}
                </div>
              </main>
            </div>
          ) : (
            children
          )}
          {isLoggedIn && (
            <div className="lg:hidden border-b border-[var(--stroke)] bg-[var(--surface)]">
              <Navigation />
            </div>
          )}
        </ToastProvider>
      </body>
    </html>
  );
}
