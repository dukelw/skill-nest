"use client";

import Navbar from "~/components/Navbar";
import Sidebar from "~/components/Sidebar";
import { useState } from "react";
import { useTranslation } from "react-i18next";

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
      lang={i18n.language}
      className="overflow-hidden w-full font-sans bg-gray-50 flex"
    >
      <Sidebar toggleSidebar={toggleSidebar} isOpen={isOpen} />
      <div className="flex-1">
        <Navbar />
        <div className="ml-5 min-h-full">{children}</div>
      </div>
    </div>
  );
}
