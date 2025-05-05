"use client";

import Navbar from "~/components/Navbar";
import Sidebar from "~/components/Sidebar";
import { useState } from "react";

export default function GeneralLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(true);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="w-full font-sans bg-gray-50 flex">
      <Sidebar toggleSidebar={toggleSidebar} isOpen={isOpen} />
      <div className="flex-1">
        <Navbar />
        <div className="ml-5">{children}</div>
      </div>
    </div>
  );
}
