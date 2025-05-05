"use client";

import { ThemeModeScript } from "flowbite-react";
import { useTranslation } from "react-i18next";
import "./globals.css";
import "../i18n/client";
import { useEffect } from "react";

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
    <html lang={i18n.language} suppressHydrationWarning>
      <head>
        <ThemeModeScript />
      </head>
      <body className="min-h-screen font-sans bg-gray-50 flex">{children}</body>
    </html>
  );
}
