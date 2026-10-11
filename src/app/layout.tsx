import type { Metadata } from "next";
import "./globals.css";
import "./admin.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://kwarihub.com"),
  title: { default: "KwariHub | The Digital Textile Marketplace", template: "%s | KwariHub" },
  description: "Discover textile products and connect with buyers and sellers through KwariHub, the digital textile marketplace.",
  alternates: { canonical: "https://kwarihub.com" },
  openGraph: { type: "website", url: "https://kwarihub.com", siteName: "KwariHub", title: "KwariHub | The Digital Textile Marketplace", description: "Explore textile products and connect with textile traders across Nigeria." },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
