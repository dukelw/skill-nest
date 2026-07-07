import {
  Navbar,
  NavbarBrand,
  Button,
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
import { useCourseStore } from "~/store/courseStore";
import { useClassroomStore } from "~/store/classroomStore";
import { ChevronLeft, Languages } from "lucide-react";
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
  const [submittingClassroom, setSubmittingClassroom] = useState(false);
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
    if (!user || submittingClassroom) return;
    setSubmittingClassroom(true);
    try {
      if (modalType === "create") {
        let fileUrl = "";
        if (file) {
          fileUrl = await uploadService.uploadFile(file);
        }
        const res = await classroomService.create({
          ...form,
          creatorId: user.id,
          thumbnail: fileUrl,
        });
        if (res) {
          setForm({
            name: "",
            code: "",
            thumbnail: "",
          });
          setFile(null);
          const teacherClasses = await classroomService.getTeacherRole(user.id);
          setTeacherClassrooms(teacherClasses);
          toast.success("Classroom created");
          setModalType(null);
          router.replace("/teaching");
        }
      } else {
        await classroomService.requestToJoinClass(user.id, joinCode);
        setModalType(null);
        setJoinCode("");
        toast.success(`Request to join classroom ${joinCode} successfully`);
      }
    } catch (error: any) {
      toast.error(error?.message || "Action failed");
    } finally {
      setSubmittingClassroom(false);
    }
  };

  const { user, setUser, setTokens } = useAuthStore();
  const { setTeacherClassrooms } = useClassroomStore();

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
    <Navbar className="border-b border-emerald-100 bg-[#f7fbf7] text-slate-900" fluid>
      <div className="flex items-center space-x-2">
        <NavbarBrand href={`/course/${course?.id}`}>
          <ChevronLeft className="h-5 w-5 text-slate-600" />
          <span className="ml-2 self-center whitespace-nowrap text-sm font-bold text-slate-900">
            {course?.title}
          </span>
        </NavbarBrand>
      </div>

      <div className="flex md:order-2 space-x-2">
        <Button
          className="mr-2 h-9 w-9 rounded-lg bg-emerald-700 text-lg text-white hover:bg-emerald-800 hover:text-white"
          onClick={() => setOpenSelectModal(true)}
        >
          +
        </Button>
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
        loading={submittingClassroom}
      />

      <JoinClassroomModal
        show={modalType === "join"}
        onClose={() => setModalType(null)}
        joinCode={joinCode}
        setJoinCode={setJoinCode}
        onSubmit={handleSubmit}
        loading={submittingClassroom}
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
