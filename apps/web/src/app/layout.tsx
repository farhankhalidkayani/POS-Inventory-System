import type { Metadata } from "next";
import type { PropsWithChildren } from "react";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "POS & Inventory",
  description: "Generic, multi-tenant point-of-sale and inventory management platform",
};

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en" className={plusJakartaSans.variable}>
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
