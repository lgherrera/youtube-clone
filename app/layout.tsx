import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SEXOTV",
  description: "Mobile Video Platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-black text-white antialiased min-h-screen flex flex-col`}>
        
        {/* The Header component handles the logo, menu, and categories link */}
        <Header />
        
        {/* Main container optimized for mobile viewing (max-width 500px). 
            Centered on desktop screens.
        */}
        <main className="flex-1 max-w-[500px] mx-auto w-full">
          {children}
        </main>

      </body>
    </html>
  );
}
