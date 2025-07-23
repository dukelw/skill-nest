import { useTranslation } from "react-i18next";
import { useEffect } from "react";

export default function Head() {
  const { t } = useTranslation();

  useEffect(() => {
    document.title = `Skill Nest | ${t("meetingTab")}`;
  }, [t]);

  return null;
}
