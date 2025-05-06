import {
  Navbar,
  NavbarBrand,
  NavbarToggle,
  Avatar,
  Button,
  Dropdown,
  DropdownItem,
} from "flowbite-react";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { authService } from "~/services/authService";
import { FiMenu } from "react-icons/fi";
// import { useAuth } from "~/context/AuthContext";
import { useAuthStore } from "~/store/authStore";
import { useRouter } from "next/navigation";

const AppNavbar = () => {
  const { i18n, t } = useTranslation();
  const currentLang = i18n.language;
  const router = useRouter();

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

  return (
    <Navbar className="bg-dark-green" fluid>
      <div className="flex items-center space-x-2">
        <NavbarBrand href="/">
          <Image
            src="https://flowbite.com/docs/images/logo.svg"
            alt="Flowbite Logo"
            width={32}
            height={32}
          />
          <span className="ml-2 self-center whitespace-nowrap text-xl font-semibold dark:text-white">
            {t("home")}
          </span>
        </NavbarBrand>
      </div>

      <div className="flex md:order-2 space-x-2">
        <Button
          className="w-10 h-10 text-white text-2xl bg-green-700 hover:bg-green-800 
             focus:outline-none focus:ring-4 focus:ring-green-300 font-medium rounded-full 
             text-center dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800 mr-4"
        >
          +
        </Button>
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
                  user.avatarUrl ||
                  "https://cdn-icons-png.freepik.com/512/3607/3607444.png"
                }
                placeholderInitials="https://cdn-icons-png.freepik.com/512/3607/3607444.png"
              />
            }
          >
            <DropdownItem href="/profile">
              👤 {t("accountInformation")}
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

export default AppNavbar;
