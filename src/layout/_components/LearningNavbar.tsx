import {
  Navbar,
  NavbarBrand,
  Button,
  Dropdown,
  DropdownItem,
} from "flowbite-react";
import { useTranslation } from "react-i18next";
import { authService } from "~/services/authService";
// import { useAuth } from "~/context/AuthContext";
import { useAuthStore } from "~/store/authStore";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { classroomService } from "~/services/classroomService";
import { toast } from "react-toastify";
import { uploadService } from "~/services/uploadService";
import useUserAnnouncements from "~/hooks/useUserAnnouncements";
import { useCourseStore } from "~/store/courseStore";
import { ChevronLeft } from "lucide-react";
import NotificationModal from "./Modal/NotificationModal";
import JoinClassroomModal from "./Modal/JoinClassroomModal";
import CreateClassroomModal from "./Modal/CreateClassroomModal";
import SelectActionModal from "./Modal/SelectActionModal";
import UserDropdown from "./Dropdown/UserDropdown";
import NotificationDropdown from "./Dropdown/NotificationDropdown";

const AppNavbar = () => {
  const { i18n, t } = useTranslation();
  const currentLang = i18n.language;
  const router = useRouter();
  const [openSelectModal, setOpenSelectModal] = useState(false);
  const [modalType, setModalType] = useState<"create" | "join" | null>(null);
  const [joinCode, setJoinCode] = useState("");
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
  const { course } = useCourseStore();

  const [showNotificationDropdown, setShowNotificationDropdown] =
    useState(false);
  const notificationRef = useRef<HTMLDivElement | null>(null);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

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

  const handleSubmit = async () => {
    if (modalType === "create") {
      let fileUrl = "";
      if (file) {
        fileUrl = await uploadService.uploadFile(file);
      }
      const res = await classroomService.create({
        ...form,
        creatorId: user!.id,
        thumbnail: fileUrl,
      });
      if (res) {
        setForm({
          name: "",
          code: "",
          thumbnail: "",
        });
        setModalType(null);
        router.replace("/teaching");
      }
    } else {
      await classroomService.requestToJoinClass(user!.id, joinCode);
      setModalType(null);
      toast.success(`Request to join classroom ${joinCode} successfully`);
    }
    setModalType(null);
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
        <NavbarBrand href={`/course/${course?.id}`}>
          <ChevronLeft className="w-5 h-5 text-white dark:text-white" />
          <span className="ml-2 self-center whitespace-nowrap text-xl font-semibold dark:text-white">
            {course?.title}
          </span>
        </NavbarBrand>
      </div>

      <div className="flex md:order-2 space-x-2">
        <Button
          className="w-10 h-10 text-white text-2xl bg-green-700 hover:bg-green-800 
             focus:outline-none focus:ring-4 focus:ring-green-300 font-medium rounded-full 
             text-center dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800 mr-4"
          onClick={() => setOpenSelectModal(true)}
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

      <SelectActionModal
        show={openSelectModal}
        onClose={() => setOpenSelectModal(false)}
        onSelect={(type) => {
          setModalType(type);
          setOpenSelectModal(false);
        }}
      />

      <CreateClassroomModal
        show={modalType === "create"}
        onClose={() => setModalType(null)}
        onChange={handleChange}
        onFileChange={handleFileChange}
        onSubmit={handleSubmit}
        form={form}
      />

      <JoinClassroomModal
        show={modalType === "join"}
        onClose={() => setModalType(null)}
        joinCode={joinCode}
        setJoinCode={setJoinCode}
        onSubmit={handleSubmit}
      />

      <NotificationModal
        show={showNotificationModal}
        onClose={() => setShowNotificationModal(false)}
        announcements={announcements}
      />
    </Navbar>
  );
};

export default AppNavbar;
