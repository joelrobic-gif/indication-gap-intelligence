import "./globals.css";

export const metadata = {
  title: "Indication Gap Intelligence | L99 Panel Analysis",
  description: "Cross-reference global drug indications across 12 jurisdictions with AI-powered L99 multi-panel analysis. PTRS scoring, competitive pipeline intelligence, portfolio analytics, and natural language querying.",
  keywords: "pharmaceutical intelligence, indication gap, PTRS, drug approval, regulatory, clinical trials, competitive landscape, portfolio analytics",
  openGraph: {
    title: "Indication Gap Intelligence v2.0",
    description: "AI-powered pharma intelligence platform. PTRS engine, competitive radar, portfolio optimizer.",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#08080d",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Fraunces:wght@400;700&family=DM+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body style={{ margin: 0, padding: 0, background: "#08080d" }}>
        {children}
      </body>
    </html>
  );
}
