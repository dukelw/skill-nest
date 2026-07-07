"use client";

import Navbar from "~/layout/_components/Navbar";
import Sidebar from "~/layout/_components/Sidebar";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import StreamVideoProvider from "~/providers/StreamClientProvider";
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
      {/* Navbar cố định top */}
      <div
        className="fixed right-0 top-0 z-50 transition-all duration-300"
        style={{
          left: isMobile ? "0" : `${sidebarWidth}px`,
        }}
      >
        <Navbar />
      </div>

      <div>
        {/* Sidebar cố định trái */}
        <div className="fixed left-0 top-0 z-40 h-screen">
          <Sidebar toggleSidebar={toggleSidebar} isOpen={isOpen} />
        </div>

        {/* Nội dung chính */}
        <div
          style={{
            width: isMobile ? "100vw" : `calc(100vw - ${sidebarWidth}px)`,
            marginLeft: isMobile ? "0" : `${sidebarWidth}px`,
          }}
          className="app-main min-h-screen overflow-x-hidden pt-16 transition-all duration-300"
        >
          <StreamVideoProvider>{children}</StreamVideoProvider>
        </div>
      </div>
    </div>
  );
}
