import type { Metadata } from "next";
import "./globals.css";
import {  Providers } from "@/components/providers/privy-provider";

const metadata: Metadata = {
  title: "Block Game",
  description: "A Cross-Chain NFT Gaming Platform with AI NPCs",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
            {children}
+        </Providers>
      </body>
    </html>
  );
}
