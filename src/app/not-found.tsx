"use client";

import { useTranslation } from "react-i18next";

export default function NotFound() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen min-w-screen flex items-center justify-center bg-dark-green">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-white">404</h1>
        <p className="mt-4 text-white">{t("notFoundMessage")}</p>
      </div>
    </div>
  );
}
