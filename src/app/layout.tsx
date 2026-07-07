"use client";

import { useTranslation } from "react-i18next";
import "./globals.css";
import "../i18n/client";
import { useEffect } from "react";
import { Toaster } from "sonner";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { i18n } = useTranslation();

  useEffect(() => {
    const languageFromStorage = localStorage.getItem("i18nextLng") || "en";
    i18n.changeLanguage(languageFromStorage);
  }, [i18n]);

  return (
    <html className="w-full scroll-smooth" lang={i18n.language} suppressHydrationWarning>
      <head>
      </head>
      <body className="min-h-screen font-sans text-color flex">
        <Toaster richColors position="top-right" closeButton />
        {children}
      </body>
    </html>
  );
}
