import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function Head() {
  const { t } = useTranslation();
  const pathname = usePathname();

  const ROUTES_METADATA: Record<string, string> = {
    "/dashboard": t("homeTab"),
    "/calendar": t("calendarTab"),
    "/teaching": t("teachingTab"),
    "/classroom": t("classroomTab"),
    "/tasks": t("taskTab"),
    "/meeting": t("meetingTab"),
    "/review": t("reviewTab"),
    "/storage": t("storageTab"),
    "/dashboard/course": t("courseTab"),
  };

  useEffect(() => {
    const tabLabel = ROUTES_METADATA[pathname] || "Skill Nest";
    document.title = `Skill Nest | ${tabLabel} Management`;
  }, [pathname, t]);

  return null;
}
