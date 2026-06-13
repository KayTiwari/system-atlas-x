import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "System Atlas | Guided architecture planning",
  description:
    "System Atlas turns product requirements into system architecture, trade-off decisions, and implementation-ready design docs.",
  keywords: [
    "system design",
    "architecture",
    "design review",
    "ADR",
    "trade-off analysis",
    "System Atlas",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="antialiased">{children}</body>
    </html>
  );
}
