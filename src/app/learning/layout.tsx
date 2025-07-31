"use client";

import LearningNavbar from "~/components/LearningNavbar";
import { useTranslation } from "react-i18next";
import useIsMobile from "~/hooks/useIsMobile";

export default function GeneralLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { i18n } = useTranslation();
  const isMobile = useIsMobile();

  return (
    <div
      suppressHydrationWarning
      lang={i18n.language}
      className="font-sans bg-gray-50 flex"
    >
      {/* Navbar cố định top */}
      <div className={`fixed top-0 right-0 z-50 left-0`}>
        <LearningNavbar />
      </div>

      <div className="flex pt-15 min-h-screen">
        {/* Nội dung chính */}
        <div
          style={{
            width: isMobile ? "100vw" : "calc(100vw - 16px)",
          }}
          className="min-h-full overflow-x-hidden"
        >
          {children}
        </div>
      </div>
    </div>
  );
}
