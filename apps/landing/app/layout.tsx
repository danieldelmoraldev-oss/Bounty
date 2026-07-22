import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bounty",
  description: "El juego social para tus fiestas con amigos.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
