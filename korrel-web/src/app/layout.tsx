import type { Metadata } from "next";
import { Jost, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { LightboxProvider } from "@/components/lightbox/LightboxProvider";

const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Korrel",
  description: "Korrel — scans, guides, and reference wiki.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${jost.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <LightboxProvider>
          <Nav />
          <main className="flex flex-1 flex-col">{children}</main>
          <Footer />
        </LightboxProvider>
      </body>
    </html>
  );
}
