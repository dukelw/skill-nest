"use client";

import { Dropdown, DropdownItem, Avatar } from "flowbite-react";
import { useTranslation } from "react-i18next";
import {
  LayoutDashboard,
  UserCircle,
  Lock,
  LogOut,
  LogIn,
  UserPlus,
} from "lucide-react";
import { FiMenu } from "react-icons/fi";

interface Props {
  user?: {
    avatar?: string;
  } | null;
  handleLogout?: () => void;
}

export default function UserDropdown({ user, handleLogout }: Props) {
  const { t } = useTranslation();

  return user ? (
    <Dropdown
      arrowIcon={false}
      inline
      label={
        <Avatar
          className="ml-2 cursor-pointer"
          alt="User Avatar"
          rounded
          img={
            user?.avatar ||
            "https://cdn-icons-png.freepik.com/512/3607/3607444.png"
          }
        />
      }
    >
      <DropdownItem href="/dashboard">
        <LayoutDashboard className="mr-2 h-4 w-4" />
        {t("dashboard")}
      </DropdownItem>

      <DropdownItem href="/profile">
        <UserCircle className="mr-2 h-4 w-4" />
        {t("accountInformation")}
      </DropdownItem>

      <DropdownItem href="/password">
        <Lock className="mr-2 h-4 w-4" />
        {t("changePassword")}
      </DropdownItem>

      <DropdownItem onClick={handleLogout}>
        <LogOut className="mr-2 h-4 w-4" />
        {t("logout")}
      </DropdownItem>
    </Dropdown>
  ) : (
    <Dropdown
      arrowIcon={false}
      inline
      label={
        <span className="rounded-full flex items-center justify-center w-10 h-10 text-white bg-transparent hover:bg-white/10 transition-colors duration-200">
          <FiMenu size={22} />
        </span>
      }
    >
      <DropdownItem href="/sign-in">
        <LogIn className="mr-2 h-4 w-4" />
        {t("signin")}
      </DropdownItem>

      <DropdownItem href="/sign-up">
        <UserPlus className="mr-2 h-4 w-4" />
        {t("signup")}
      </DropdownItem>
    </Dropdown>
  );
}
