import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/src/components/AuthProvider";

export const metadata: Metadata = {
  title: "HR – Upravljanje ljudskim resursima",
  description: "Aplikacija za upravljanje ljudskim resursima",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="sr">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
