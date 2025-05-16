"use client";

import Navbar from "~/components/Navbar";
import Sidebar from "~/components/Sidebar";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import StreamVideoProvider from "~/providers/StreamClientProvider";

export default function GeneralLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(true);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div
      suppressHydrationWarning
      lang={i18n.language}
      className="font-sans bg-gray-50 flex"
    >
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
            width: isOpen ? "calc(100vw - 272px)" : "calc(100vw - 96px)",
            marginLeft: isOpen ? "256px" : "80px",
            marginTop: "-4px",
            overflowY: "hidden",
          }}
          className="min-h-screen overflow-x-hidden"
        >
          <StreamVideoProvider>{children}</StreamVideoProvider>
        </div>
      </div>
    </div>
  );
}
