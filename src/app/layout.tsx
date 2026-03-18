import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

const auxMono = localFont({
  src: [
    {
      path: "../fonts/AuxMono.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/AuxMono.woff",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-aux-mono",
  display: "swap",
});

const nonSans = localFont({
  src: [
    {
      path: "../fonts/NON-Sans-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../fonts/NON-Sans-Medium.woff",
      weight: "500",
      style: "normal",
    },
  ],
  variable: "--font-non-sans",
  display: "swap",
});

const ppEditorial = localFont({
  src: [
    {
      path: "../fonts/PPEditorialNew-Light.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "../fonts/PPEditorialNew-Light.woff",
      weight: "300",
      style: "normal",
    },
  ],
  variable: "--font-pp-editorial",
  display: "swap",
});

const siteTitle =
  "Softchain | Software Design & Engineering, AI Systems, IT Infrastructure, and Technology Management";
const siteDescription =
  "Softchain delivers software design and engineering, AI systems, IT infrastructure, and technology management for companies that need senior execution from scoping through long-term support.";

export const metadata: Metadata = {
  metadataBase: new URL("https://softchain.ae"),
  title: siteTitle,
  description: siteDescription,
  applicationName: "Softchain",
  alternates: {
    canonical: "/",
  },
  manifest: "/manifest.webmanifest",
  icons: {
    shortcut: [{ url: "/favicon.ico" }],
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icons/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/icons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Softchain",
    title: siteTitle,
    description: siteDescription,
  },
  twitter: {
    card: "summary",
    title: siteTitle,
    description: siteDescription,
  },
  other: {
    "msapplication-TileColor": "#0a0a0a",
    "msapplication-TileImage": "/icons/mstile-150x150.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${auxMono.variable} ${nonSans.variable} ${ppEditorial.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
