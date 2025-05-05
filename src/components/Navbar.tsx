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

const AppNavbar = () => {
  const { i18n } = useTranslation();
  const currentLang = i18n.language;

  const handleChangeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem("i18nextLng", lang);
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
            SKILLNEST
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

        <Avatar
          className="ml-2"
          alt="User Avatar"
          rounded
          img="https://media.istockphoto.com/id/1337144146/vector/default-avatar-profile-icon-vector.jpg?s=612x612&w=0&k=20&c=BIbFwuv7FxTWvh5S3vB6bkT0Qv8Vn8N5Ffseq84ClGI="
          placeholderInitials=""
        />
      </div>
    </Navbar>
  );
};

export default AppNavbar;
