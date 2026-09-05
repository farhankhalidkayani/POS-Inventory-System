import type { Metadata } from "next";
import type { PropsWithChildren } from "react";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "POS & Inventory",
  description: "Generic, multi-tenant point-of-sale and inventory management platform",
};

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
