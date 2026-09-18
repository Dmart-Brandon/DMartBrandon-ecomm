import "./globals.css";
import { Suspense } from "react";
import type { Metadata, Viewport } from "next";
import { DM_Sans, Outfit } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { CartProvider } from "@/lib/cart-context";
import { Toaster } from "@/components/ui/sonner";
import { RouteProgress } from "@/components/storefront/route-progress";
import { MobileCartBar } from "@/components/storefront/mobile-cart-bar";
import { MobileCartSpacer } from "@/components/storefront/mobile-cart-spacer";
import { BulkQuoteSheet } from "@/components/storefront/bulk-quote-sheet";
import { MobileSplashLoader } from "@/components/storefront/mobile-splash-loader";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://dmartbrandon.com";

const SITE_TITLE = "DMartBrandon — Farm-Fresh Produce for Your Business";
const SITE_DESCRIPTION =
  "DMartBrandon connects Indian businesses with verified farmers for fresh produce procurement. Wholesale vegetables, fruits, dairy, bakery and electronics with tiered B2B pricing, GST invoices, cold-chain delivery and same-day dispatch in Hyderabad.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: "%s · DMartBrandon",
  },
  description: SITE_DESCRIPTION,
  applicationName: "DMartBrandon",
  keywords: [
    "DMartBrandon",
    "fresh produce",
    "farm to business",
    "verified farmers",
    "cold chain delivery",
    "B2B procurement",
    "B2B marketplace",
    "wholesale produce",
    "wholesale vegetables",
    "wholesale fruits",
    "kirana supply",
    "restaurant supply",
    "GST invoice",
    "bulk pricing",
    "tiered pricing",
    "Hyderabad",
    "dairy",
    "bakery",
    "electronics",
  ],
  authors: [{ name: "Niravana Software Services" }],
  robots: { index: true, follow: true },
  icons: {
    icon: "/icon.png",
    apple: "/apple-icon.png",
    shortcut: "/DMartBrandon_logo.png",
  },
  openGraph: {
    type: "website",
    siteName: "DMartBrandon",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    locale: "en_IN",
    images: [
      {
        url: "/DMartBrandon_logo.png",
        width: 1024,
        height: 1024,
        alt: "DMartBrandon — Farm-Fresh Produce for Your Business",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: ["/DMartBrandon_logo.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#0E5C33",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      appearance={{
        variables: {
          colorPrimary: "#0E5C33",
          colorText: "#1A2E1A",
          colorBackground: "#F8F6F0",
          borderRadius: "0.75rem",
          fontFamily: "var(--font-dm-sans), system-ui, sans-serif",
        },
      }}
    >
      <html lang="en" className={`${dmSans.variable} ${outfit.variable}`}>
        <body className="font-sans antialiased">
          <CartProvider>
            <MobileSplashLoader />
            <Suspense fallback={null}>
              <RouteProgress />
            </Suspense>
            {children}
            <MobileCartSpacer />
            <MobileCartBar />
            <BulkQuoteSheet />
          </CartProvider>
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
