import type { Metadata } from "next";
import { Chakra_Petch, JetBrains_Mono } from "next/font/google";
// import Providers from "@/components/Providers"; // Wallet connect disabled — saves ~3MB bundle
import "./globals.css";

const display = Chakra_Petch({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "KYCScan — Can Govt Track Your Crypto Wallet?",
  description: "Check if any wallet has interacted with centralized exchanges. Supports EVM chains (Ethereum, Arbitrum, BSC, Polygon, Optimism, Base).",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body
        className={`${display.variable} ${mono.variable} antialiased overflow-x-hidden`}
      >
        {children}
      </body>
    </html>
  );
}
