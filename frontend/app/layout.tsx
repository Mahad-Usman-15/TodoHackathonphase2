import type { Metadata } from "next";
import { Poppins, Montserrat, Oswald } from "next/font/google";
import { ClientProviders } from "./providers";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-poppins",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-montserrat",
});

const oswald = Oswald({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-oswald",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://todo-hackathonphase2.vercel.app"),
  title: {
    default: "Taskify — Smart Task Manager",
    template: "%s | Taskify",
  },
  description:
    "Taskify helps you manage tasks securely with JWT authentication and a clean, fast interface. Free forever.",
  openGraph: {
    siteName: "Taskify",
    type: "website",
    url: "https://todo-hackathonphase2.vercel.app",
    title: "Taskify — Smart Task Manager",
    description:
      "Taskify helps you manage tasks securely with JWT authentication and a clean, fast interface. Free forever.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Taskify — Smart Task Manager",
    description:
      "Taskify helps you manage tasks securely with JWT authentication and a clean, fast interface. Free forever.",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      name: "Taskify",
      url: "https://todo-hackathonphase2.vercel.app",
      applicationCategory: "ProductivityApplication",
      operatingSystem: "Web",
      description:
        "Smart task manager with JWT authentication and a clean interface.",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
    },
    {
      "@type": "Organization",
      name: "Taskify",
      url: "https://todo-hackathonphase2.vercel.app",
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} ${montserrat.variable} ${oswald.variable}`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased">
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
