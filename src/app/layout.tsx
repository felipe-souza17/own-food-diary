import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";

import { APP_NAME } from "@/lib/constants";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: APP_NAME,
    template: `%s | ${APP_NAME}`,
  },
  description:
    "Diário alimentar pessoal: registre suas refeições com fotos e compartilhe com quem quiser por um link somente leitura.",
  openGraph: {
    title: APP_NAME,
    description: "Registre suas refeições com fotos e compartilhe por um link somente leitura.",
    type: "website",
    locale: "pt_BR",
    siteName: APP_NAME,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body>
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
