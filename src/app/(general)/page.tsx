"use client";

import { useTranslation } from "react-i18next";
import LewisButton from "~/components/partial/LewisButton";

export default function HomePage() {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t("home")}</h1>
      <p>{t("welcomeMessage")}</p>
      <LewisButton lewisSize="small" href="/sign-up">
        {t("signup")}
      </LewisButton>
      <LewisButton lewisSize="small" variant="outlined" href="/sign-up">
        {t("signup")}
      </LewisButton>
      <LewisButton lewisSize="small" color="pink" href="/sign-up">
        {t("signup")}
      </LewisButton>
      <LewisButton lewisSize="small" color="red" href="/sign-up">
        {t("signup")}
      </LewisButton>
      <LewisButton lewisSize="small" color="orange" href="/sign-up">
        {t("signup")}
      </LewisButton>
      <LewisButton lewisSize="small" color="yellow" href="/sign-up">
        {t("signup")}
      </LewisButton>
    </div>
  );
}
