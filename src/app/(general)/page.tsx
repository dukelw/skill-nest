/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Image from "next/image";
// import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import LewisButton from "~/components/partial/LewisButton";
// import { User } from "~/context/AuthContext";
// import { userService } from "~/services/userService";
// import { useAuth } from "~/context/AuthContext";
import { useAuthStore } from "~/store/authStore";
// import useUserStore from "~/store/userStore";

export default function HomePage() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  // const { users, setUsers } = useUserStore();

  // const handleGetUsers = async () => {
  //   const response = await userService.getAll();
  //   setUsers(response);
  // };

  // useEffect(() => {
  //   handleGetUsers();
  // }, []);

  if (!user) return <div>Please log in</div>;

  return (
    <div
      style={{ minHeight: "calc(100vh - 80px)" }}
      className="flex flex-col items-center justify-center"
      suppressHydrationWarning
    >
      <Image
        src={`https://res.cloudinary.com/dukelewis-workspace/image/upload/v1746546890/uploads/rvllbvnf3l3yatsrtz9a.svg`}
        alt="Uploaded image"
        width={400}
        height={400}
      />

      <p className="mt-1">{t("noCurrentClass")}</p>

      <div className="mt-4 flex gap-4 justify-between">
        <LewisButton space={false} variant="outlined" href="/create-classroom">
          {t("createClassroom")}
        </LewisButton>
        <LewisButton space={false} href="/join-classroom">
          {t("joinClassroom")}
        </LewisButton>
      </div>
    </div>
  );
}
