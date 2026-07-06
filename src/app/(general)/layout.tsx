"use client";

import Navbar from "~/layout/_components/Navbar";
import Sidebar from "~/layout/_components/Sidebar";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import useIsMobile from "~/hooks/useIsMobile";
import Head from "./head";

export default function GeneralLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(true);
  const isMobile = useIsMobile();

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div
      suppressHydrationWarning
      lang={i18n.language}
      className="app-shell flex min-h-screen w-full font-sans"
    >
      <Head />
      <div
        className="fixed right-3 top-2.5 z-50 transition-all duration-300"
        style={{
          left: isMobile ? "10px" : isOpen ? "276px" : "100px",
        }}
      >
        <Navbar />
      </div>

      <div className="fixed left-2.5 top-2.5 z-40 h-[calc(100vh-20px)]">
        <Sidebar toggleSidebar={toggleSidebar} isOpen={isOpen} />
      </div>

      <main
        style={{
          width: isMobile
            ? "100vw"
            : isOpen
            ? "calc(100vw - 300px)"
            : "calc(100vw - 124px)",
          marginLeft: isMobile ? "0" : isOpen ? "276px" : "100px",
        }}
        className="min-h-screen overflow-x-hidden px-4 pb-6 pt-24 transition-all duration-300 sm:px-6 lg:px-8"
      >
        {children}
      </main>
    </div>
  );
}
