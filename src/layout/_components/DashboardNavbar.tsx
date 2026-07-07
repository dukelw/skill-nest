import {
  Navbar,
  NavbarBrand,
  Dropdown,
  DropdownItem,
  NavbarCollapse,
} from "~/components/ui/primitives";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { authService } from "~/services/authService";
// import { useAuth } from "~/context/AuthContext";
import { useAuthStore } from "~/store/authStore";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import useUserAnnouncements from "~/hooks/useUserAnnouncements";
import NotificationModal from "./Modal/NotificationModal";
import NotificationDropdown from "./Dropdown/NotificationDropdown";
import UserDropdown from "./Dropdown/UserDropdown";
import { Languages } from "lucide-react";

const AppNavbar = () => {
  const { i18n, t } = useTranslation();
  const currentLang = i18n.language;
  const router = useRouter();
  const {
    announcements,
    markAsRead,
    deleteAnnouncement,
    markAllAsRead,
    deleteAll,
  } = useUserAnnouncements();

  const [showNotificationDropdown, setShowNotificationDropdown] =
    useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const notificationRef = useRef<HTMLDivElement | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleChangeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem("i18nextLng", lang);
  };

  const { user, setUser, setTokens } = useAuthStore();

  const handleLogout = async () => {
    await authService.logout();
    setUser(null);
    setTokens(null);
    router.push("/sign-in");
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setShowNotificationDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <Navbar className="app-header h-16 bg-white text-slate-900" fluid>
      <Image
        src="/logo.png"
        alt="Skill Nest Logo"
        className="block md:hidden"
        width={40}
        height={40}
        onClick={() => {
          router.push("/");
        }}
      />
      <NavbarCollapse>
        <div className="flex items-center space-x-2">
          <NavbarBrand href="/">
            <Image
              src="/logo.png"
              alt="Skill Nest Logo"
              width={40}
              height={40}
            />
            <span className="ml-2 self-center whitespace-nowrap text-sm font-bold uppercase tracking-wide text-slate-900">
              {t("home")}
            </span>
          </NavbarBrand>
        </div>
      </NavbarCollapse>
      <div className="flex ml-auto md:order-2 space-x-2">
        <Dropdown
          arrowIcon={false}
          label={
            <span
              title="Change language"
              aria-label="Change language"
              className="flex h-10 items-center gap-2 rounded-full border border-emerald-100 bg-[#eef7ef] px-3 text-[14px] font-bold text-slate-700 transition hover:bg-[#dcf5e2] hover:text-emerald-700"
            >
              <Languages className="h-4 w-4" />
              {i18n?.language?.toUpperCase()}
            </span>
          }
          inline
          className="text-slate-700"
        >
          <DropdownItem
            className={` ${currentLang === "en" ? "text-green font-bold" : ""}`}
            onClick={() => handleChangeLanguage("en")}
          >
            EN English
          </DropdownItem>
          <DropdownItem
            className={`${currentLang === "vi" ? "text-green font-bold" : ""}`}
            onClick={() => handleChangeLanguage("vi")}
          >
            VI Vietnamese
          </DropdownItem>
        </Dropdown>
        <NotificationDropdown
          announcements={announcements}
          isMobile={isMobile}
          showDropdown={showNotificationDropdown}
          setShowDropdown={setShowNotificationDropdown}
          openModal={() => setShowNotificationModal(true)}
          markAsRead={markAsRead}
          deleteAnnouncement={deleteAnnouncement}
          markAllAsRead={markAllAsRead}
          deleteAll={deleteAll}
        />

        <UserDropdown user={user} handleLogout={handleLogout} />
      </div>

      <NotificationModal
        show={showNotificationModal}
        onClose={() => setShowNotificationModal(false)}
        announcements={announcements}
      />
    </Navbar>
  );
};

export default AppNavbar;
