"use client";

import { Dropdown, DropdownItem, Avatar } from "~/components/ui/primitives";
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
    name?: string;
    email?: string;
  } | null;
  handleLogout?: () => void;
}

export default function UserDropdown({ user, handleLogout }: Props) {
  const { t } = useTranslation();
  const initial = (user?.name || user?.email || "U").trim().charAt(0).toUpperCase();
  const avatarUrl = user?.avatar?.trim();

  return user ? (
    <Dropdown
      arrowIcon={false}
      inline
      label={
        avatarUrl ? (
          <Avatar
            className="ml-1 cursor-pointer rounded-2xl ring-2 ring-white/20 transition hover:ring-emerald-200"
            alt="User Avatar"
            rounded
            img={avatarUrl}
          />
        ) : (
          <span className="ml-1 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-700 text-sm font-semibold text-white ring-2 ring-white/20 transition hover:ring-emerald-200">
            {initial}
          </span>
        )
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
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-white transition-colors duration-200 hover:bg-white/18">
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
