import type { Metadata } from "next";
import { Instrument_Serif, DM_Sans, Source_Serif_4 } from "next/font/google";
import "./globals.css";

const display = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
  display: "swap",
});

const variableSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-variable",
  display: "swap",
});

const body = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Animal Medical Center · Mohali",
  description:
    "Animal Medical Center in Sector 70, Mohali — a care journey where serious veterinary medicine meets genuine care.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${variableSerif.variable} ${body.variable}`}
    >
      <head>
        <link
          rel="preload"
          as="image"
          href="/animations/allpets/start/01.webp"
          fetchPriority="high"
        />
        <link rel="preload" as="image" href="/animations/allpets/start/02.webp" />
        <link rel="preload" as="image" href="/animations/allpets/start/03.webp" />
        <link rel="preload" as="image" href="/animations/allpets/start/04.webp" />
      </head>
      <body className="bg-canvas font-body text-ink antialiased">{children}</body>
    </html>
  );
}
