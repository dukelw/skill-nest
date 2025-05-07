/* eslint-disable react-hooks/rules-of-hooks */
import { useTranslation } from "react-i18next";
import {
  FaHome,
  FaCalendarAlt,
  FaTasks,
  FaRecordVinyl,
  FaBox,
  FaChalkboardTeacher, // icon cho teaching
} from "react-icons/fa";

export default function staticSidebarItems() {
  const { t } = useTranslation();

  return [
    { label: t("homeTab"), icon: FaHome, href: "/" },
    { label: t("calendarTab"), icon: FaCalendarAlt, href: "/calendar" },
    { label: t("teachingTab"), icon: FaChalkboardTeacher, href: "/teaching" },
    { label: t("taskTab"), icon: FaTasks, href: "/tasks" },
    { label: t("reviewTab"), icon: FaRecordVinyl, href: "/review" },
    { label: t("storageTab"), icon: FaBox, href: "/storage" },
  ];
}
