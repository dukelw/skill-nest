/* eslint-disable react-hooks/rules-of-hooks */
import { useTranslation } from "react-i18next";
import { FaHome, FaGraduationCap } from "react-icons/fa";

export default function staticSidebarItems() {
  const { t } = useTranslation();

  return [
    { label: t("homeTab"), icon: FaHome, href: "/dashboard" },
    { label: t("courseTab"), icon: FaGraduationCap, href: "/dashboard/course" },
  ];
}
