import {
  Navbar,
  NavbarBrand,
  NavbarToggle,
  Avatar,
  Dropdown,
  DropdownItem,
  Badge,
} from "flowbite-react";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { authService } from "~/services/authService";
import { FiBell, FiMenu } from "react-icons/fi";
// import { useAuth } from "~/context/AuthContext";
import { useAuthStore } from "~/store/authStore";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnnouncementReceiver } from "~/models/AnnouncementReceiver";
import useUserAnnouncements from "~/hooks/useUserAnnouncements";

const DashboardNavbar = () => {
  const { i18n, t } = useTranslation();
  const currentLang = i18n.language;
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null); // State to hold file
  const [form, setForm] = useState({
    name: "",
    code: "",
    thumbnail: "",
  });
  const {
    announcements,
    markAsRead,
    deleteAnnouncement,
    markAllAsRead,
    deleteAll,
  } = useUserAnnouncements();

  const [showNotificationDropdown, setShowNotificationDropdown] =
    useState(false);
  const notificationRef = useRef<HTMLDivElement | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleChangeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem("i18nextLng", lang);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]); // Set the selected file
    }
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
    <Navbar className="bg-dark-green" fluid>
      <div className="flex items-center space-x-2">
        <NavbarBrand href="/">
          <Image
            src="/logo-white.png"
            alt="Flowbite Logo"
            width={40}
            height={40}
          />
          <span className="ml-2 self-center whitespace-nowrap text-xl font-semibold dark:text-white">
            {t("home")}
          </span>
        </NavbarBrand>
      </div>

      <div className="flex md:order-2 space-x-2">
        <Dropdown
          arrowIcon={false}
          label={
            <span className="text-white font-medium">
              {i18n?.language?.toUpperCase()}
            </span>
          }
          inline
          className="text-white"
        >
          <DropdownItem
            className={` ${currentLang === "en" ? "text-green font-bold" : ""}`}
            onClick={() => handleChangeLanguage("en")}
          >
            🇬🇧 English
          </DropdownItem>
          <DropdownItem
            className={`${currentLang === "vi" ? "text-green font-bold" : ""}`}
            onClick={() => handleChangeLanguage("vi")}
          >
            🇻🇳 Tiếng Việt
          </DropdownItem>
        </Dropdown>
        <div
          className="relative mx-2 cursor-pointer flex items-center"
          onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}
          ref={notificationRef}
        >
          <FiBell className="text-white" size={24} />
          {announcements?.length > 0 && (
            <Badge
              size="xs"
              className="absolute top-0 right-0 -mt-1 -mr-1 rounded-full px-[6px] py-[2px] text-[10px] font-semibold border-2 border-red z-10 bg-red-600 text-white hover:!text-green-500"
            >
              {
                announcements?.filter((a: AnnouncementReceiver) => !a?.isRead)
                  .length
              }
            </Badge>
          )}

          {showNotificationDropdown && (
            <div className="absolute right-0 top-full mt-2 w-100 bg-white rounded shadow-lg z-50 text-black">
              <div className="flex items-center justify-between px-4 py-2 border-b font-semibold bg-green text-white">
                🔔 {t("notifications")}
                {/* Hành động */}
                <div className="flex items-center gap-1 ml-2">
                  <button
                    className="cursor-pointer text-white-500 text-xs hover:underline"
                    onClick={(e) => {
                      e.stopPropagation();
                      markAllAsRead();
                    }}
                  >
                    {t("markAllAsRead")}
                  </button>

                  <button
                    className="cursor-pointer text-red-600 text-xs hover:underline ml-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteAll();
                    }}
                  >
                    {t("deleteAll")}
                  </button>
                </div>
              </div>
              <ul className="max-h-60 overflow-y-auto">
                {announcements?.length > 0 ? (
                  announcements
                    ?.sort(
                      (a, b) =>
                        new Date(b?.announcement?.createdAt).getTime() -
                        new Date(a?.announcement?.createdAt).getTime()
                    )
                    ?.map((a: AnnouncementReceiver, index) => (
                      <li
                        key={index}
                        className={`flex items-start px-4 py-2 gap-2 border-b text-sm cursor-pointer hover:bg-gray-100 ${
                          a?.isRead ? "opacity-60" : ""
                        }`}
                        onClick={() => {
                          router.push(
                            `${process.env.NEXT_PUBLIC_CLIENT_URL}${a?.announcement?.href}` ||
                              ""
                          );
                          setShowNotificationDropdown(false);
                        }}
                      >
                        {/* Avatar */}
                        <Avatar
                          img={
                            a?.user?.avatar ||
                            "https://cdn-icons-png.freepik.com/512/3607/3607444.png"
                          }
                          rounded
                          size="sm"
                          alt="avatar"
                        ></Avatar>

                        {/* Nội dung */}
                        <div className="flex-1">
                          <p className="text-green font-bold">
                            {a?.announcement?.title}
                          </p>
                          <p className="text-gray-800">
                            {a?.announcement?.content}
                          </p>
                          <div className="text-xs text-gray-500 mt-1">
                            {(() => {
                              const createdAt = a?.announcement?.createdAt;
                              return createdAt && !isNaN(Date.parse(createdAt))
                                ? new Date(createdAt).toLocaleString()
                                : "Không rõ thời gian";
                            })()}
                          </div>
                        </div>

                        {/* Hành động */}
                        <div className="flex flex-col items-end gap-1 ml-2">
                          {/* Đánh dấu đã đọc */}
                          {!a?.isRead && (
                            <button
                              className="cursor-pointer text-blue-500 text-xs hover:underline"
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(a?.id);
                              }}
                            >
                              {t("markAsRead")}
                            </button>
                          )}

                          {/* Xóa */}
                          <button
                            className="cursor-pointer text-red-500 text-xs hover:underline"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteAnnouncement(a?.id);
                            }}
                          >
                            {t("delete")}
                          </button>
                        </div>
                      </li>
                    ))
                ) : (
                  <p className="text-center text-sm p-6">No announcement</p>
                )}
              </ul>

              <div
                className="text-center text-green-600 text-sm py-2 hover:underline cursor-pointer"
                onClick={() => {
                  router.push("/notifications");
                  setShowNotificationDropdown(false);
                }}
              >
                {t("viewAll")}
              </div>
            </div>
          )}
        </div>

        <NavbarToggle />

        {user ? (
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
                placeholderInitials="https://cdn-icons-png.freepik.com/512/3607/3607444.png"
              />
            }
          >
            <DropdownItem href="/dashboard">👤 {t("dashboard")}</DropdownItem>
            <DropdownItem href="/profile">
              👤 {t("accountInformation")}
            </DropdownItem>
            <DropdownItem href="/password">
              🔒 {t("changePassword")}
            </DropdownItem>
            <DropdownItem onClick={handleLogout}>🚪 {t("logout")}</DropdownItem>
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
            <DropdownItem href="/sign-in">🔑 {t("signin")}</DropdownItem>
            <DropdownItem href="/sign-up">📝 {t("submit")}</DropdownItem>
          </Dropdown>
        )}
      </div>
    </Navbar>
  );
};

export default DashboardNavbar;
