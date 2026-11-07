import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import { ModalProvider } from "@/contexts/ModalContext";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Scho",
  description: "A full-stack personal organization application for capturing and managing tasks, reminders, notes, and saved links in one centralized platform.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} h-full antialiased`}
    >
      <body className={`${manrope.className} min-h-full flex flex-col bg-slate-200`}>
        <ModalProvider>
          {children}
        </ModalProvider>
      </body>
    </html>
  );
}
