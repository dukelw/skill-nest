/* eslint-disable react-hooks/rules-of-hooks */
import { useTranslation } from "react-i18next";
import { FaHome, FaGraduationCap, FaUser } from "react-icons/fa";

export default function staticSidebarItems() {
  const { t } = useTranslation();

  return [
    { label: t("statisticTab"), icon: FaHome, href: "/admin" },
    { label: t("courseTab"), icon: FaGraduationCap, href: "/admin/course" },
    { label: t("userTab"), icon: FaUser, href: "/admin/user" },
  ];
}
