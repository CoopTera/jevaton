import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "jevaton — terminal de decisiones",
  description: "Template de hackathon: Jev devuelve probabilidades, tu código decide.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="antialiased">{children}</body>
    </html>
  );
}
