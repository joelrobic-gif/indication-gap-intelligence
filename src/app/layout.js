import "./globals.css";

export const metadata = {
  title: "ExpandRx — Indication-Expansion Intelligence",
  description: "ExpandRx turns the global drug-approval map into ranked, risk-adjusted (rNPV) indication-expansion opportunities and committee-ready business cases. Demonstration platform on an illustrative dataset.",
  keywords: "ExpandRx, indication expansion, drug repurposing, rNPV, PTRS, regulatory intelligence, pharmaceutical business development",
  openGraph: {
    title: "ExpandRx — Indication-Expansion Intelligence",
    description: "From the global approval map to a costed, decision-ready business case. Clarity of signal for drug repurposing.",
    type: "website",
  },
  // Demonstration build on an illustrative dataset — keep out of search indexes.
  robots: { index: false, follow: false },
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
