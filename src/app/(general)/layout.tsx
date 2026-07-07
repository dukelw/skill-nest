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
  const sidebarWidth = isOpen ? 260 : 84;

  return (
    <div
      suppressHydrationWarning
      lang={i18n.language}
      className="app-shell min-h-screen w-full font-sans"
    >
      <Head />
      <div
        className="fixed right-0 top-0 z-50 transition-all duration-300"
        style={{
          left: isMobile ? "0" : `${sidebarWidth}px`,
        }}
      >
        <Navbar />
      </div>

      <div className="fixed left-0 top-0 z-40 h-screen">
        <Sidebar toggleSidebar={toggleSidebar} isOpen={isOpen} />
      </div>

      <main
        style={{
          width: isMobile ? "100vw" : `calc(100vw - ${sidebarWidth}px)`,
          marginLeft: isMobile ? "0" : `${sidebarWidth}px`,
        }}
        className="app-main min-h-screen overflow-x-hidden px-4 pb-6 pt-20 transition-all duration-300 sm:px-6 lg:px-8"
      >
        {children}
      </main>
    </div>
  );
}
