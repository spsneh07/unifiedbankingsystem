import type { Metadata } from "next";
import "./globals.css";

import { ToastProvider } from "@/components/ui/Toast";

export const metadata: Metadata = {
  title: "NexusBank",
  description: "Unified Banking System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="bg-white text-black dark:bg-[#0b0f14] dark:text-white">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
