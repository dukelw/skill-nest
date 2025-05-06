"use client";

import { useTranslation } from "react-i18next";
import LewisButton from "~/components/partial/LewisButton";
// import { useAuth } from "~/context/AuthContext";
import { useAuthStore } from "~/store/authStore";

export default function HomePage() {
  const { t } = useTranslation();
  const { user } = useAuthStore();

  if (!user) return <div>Please log in</div>;

  return (
    <div suppressHydrationWarning>
      <h1>{t("home")}</h1>
      <p>{t("welcomeMessage")}</p>
      {["default", "outlined", "pink", "red", "orange", "yellow"].map(
        (color) => (
          <LewisButton
            key={color}
            lewisSize="small"
            variant={color === "outlined" ? "outlined" : undefined}
            color="green"
            href="/sign-up"
          >
            {t("signup")}
          </LewisButton>
        )
      )}
    </div>
  );
}
