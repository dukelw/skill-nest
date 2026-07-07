import {
  Dropdown,
  DropdownItem,
} from "~/components/ui/primitives";
import { useTranslation } from "react-i18next";
import { authService } from "~/services/authService";
// import { useAuth } from "~/context/AuthContext";
import { useAuthStore } from "~/store/authStore";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { classroomService } from "~/services/classroomService";
import { toast } from "sonner";
import { uploadService } from "~/services/uploadService";
import useUserAnnouncements from "~/hooks/useUserAnnouncements";
import SelectActionModal from "./Modal/SelectActionModal";
import CreateClassroomModal from "./Modal/CreateClassroomModal";
import JoinClassroomModal from "./Modal/JoinClassroomModal";
import NotificationModal from "./Modal/NotificationModal";
import NotificationDropdown from "./Dropdown/NotificationDropdown";
import UserDropdown from "./Dropdown/UserDropdown";
import { Plus } from "lucide-react";

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
    <header className="flex min-h-14 items-center rounded-lg border border-slate-200 bg-white px-4 text-slate-900 shadow-sm">
      <div className="hidden md:block">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          Workspace
        </p>
        <h1 className="text-base font-semibold leading-tight text-slate-950">
          {t("home")}
        </h1>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <button
          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800 shadow-sm transition hover:bg-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-200"
          onClick={() => setOpenSelectModal(true)}
          aria-label="Create or join"
        >
          <Plus className="h-4 w-4" />
        </button>
        <Dropdown
          arrowIcon={false}
          label={
            <span className="flex h-9 items-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">
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
    </header>
  );
};

export default AppNavbar;
