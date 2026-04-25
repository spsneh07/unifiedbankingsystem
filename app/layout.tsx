import type { Metadata } from "next";
import "./globals.css";

import { ToastProvider } from "@/components/ui/Toast";

export const metadata: Metadata = {
  title: "NexusBank — Unified Banking System",
  description:
    "Centralized banking platform for managing multiple bank accounts",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-white text-black dark:bg-[#0b0f14] dark:text-white">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
