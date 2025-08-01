"use client";

import Navbar from "~/components/DashboardNavbar";
import Sidebar from "~/components/DashboardSidebar";
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
      className="font-sans bg-gray-50 flex"
    >
      <Head />
      {/* Navbar cố định top */}
      <div className={`fixed top-0 right-0 z-50 left-20`}>
        <Navbar />
      </div>

      <div className="flex pt-16 min-h-screen">
        {/* Sidebar cố định trái */}
        <div className="fixed top-0 left-0 z-40 h-[calc(100vh-64px)]">
          <Sidebar toggleSidebar={toggleSidebar} isOpen={isOpen} />
        </div>

        {/* Nội dung chính */}
        <div
          style={{
            width: isMobile
              ? "100vw"
              : isOpen
              ? "calc(100vw - 272px)"
              : "calc(100vw - 96px)",
            marginLeft: isMobile ? "0" : isOpen ? "256px" : "80px",
          }}
          className="min-h-full overflow-x-hidden"
        >
          {children}
        </div>
      </div>
    </div>
  );
}
