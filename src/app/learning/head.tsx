import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function Head() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const currentBasePath = pathname.split("/")[1]
    ? "/" + pathname.split("/")[1]
    : "/";

  const ROUTES_METADATA: Record<string, string> = {
    "/": t("homeTab"),
    "/learning": t("learningTab"),
  };

  useEffect(() => {
    const tabLabel = ROUTES_METADATA[currentBasePath] || "Skill Nest";
    document.title = `Skill Nest | ${tabLabel}`;
  }, [pathname, t]);

  return null;
}
