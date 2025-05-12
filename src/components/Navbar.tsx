import {
  Navbar,
  NavbarBrand,
  NavbarToggle,
  Avatar,
  Button,
  Dropdown,
  DropdownItem,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "flowbite-react";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { authService } from "~/services/authService";
import { FiMenu } from "react-icons/fi";
// import { useAuth } from "~/context/AuthContext";
import { useAuthStore } from "~/store/authStore";
import { useRouter } from "next/navigation";
import LewisButton from "./partial/LewisButton";
import LewisTextInput from "./partial/LewisTextInput";
import { useState } from "react";
import { classroomService } from "~/services/classroomService";
import { toast } from "react-toastify";
import { uploadService } from "~/services/uploadService";

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
        creatorId: user.id,
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
      await classroomService.requestToJoinClass(user.id, joinCode);
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

      {/* Type modal */}
      <Modal show={openSelectModal} onClose={() => setOpenSelectModal(false)}>
        <ModalHeader className="bg-green-500 text-white">
          {t("selectAction")}
        </ModalHeader>
        <ModalBody className="flex justify-around gap-4">
          <LewisButton
            onClick={() => {
              setModalType("create");
              setOpenSelectModal(false);
            }}
          >
            ➕ {t("createClassroom")}
          </LewisButton>
          <LewisButton
            onClick={() => {
              setModalType("join");
              setOpenSelectModal(false);
            }}
          >
            🔑 {t("joinClassroom")}
          </LewisButton>
        </ModalBody>
      </Modal>

      {/* Create modal */}
      <Modal show={modalType === "create"} onClose={() => setModalType(null)}>
        <ModalHeader className="bg-green-500 text-white">
          {t("createClassroom")}
        </ModalHeader>
        <ModalBody>
          <LewisTextInput
            name="name"
            placeholder={t("classroomName")}
            value={form.name}
            onChange={handleChange}
            className="mb-4"
          />
          <LewisTextInput
            name="code"
            placeholder={t("classroomCode")}
            value={form.code}
            onChange={handleChange}
          />
          <input
            name="thumbnail"
            type="file"
            onChange={handleFileChange}
            className="block w-full mt-4 text-sm file:bg-green-700 text-gray-500 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:bg-green file:text-white hover:file:bg-green-600"
          />
        </ModalBody>
        <ModalFooter>
          <LewisButton onClick={handleSubmit}>{t("create")}</LewisButton>
          <LewisButton variant="outlined" onClick={() => setModalType(null)}>
            {t("cancel")}
          </LewisButton>
        </ModalFooter>
      </Modal>

      {/* Join modal */}
      <Modal show={modalType === "join"} onClose={() => setModalType(null)}>
        <ModalHeader className="bg-green-500 text-white">
          {t("joinClassroom")}
        </ModalHeader>
        <ModalBody>
          <LewisTextInput
            name="code"
            placeholder={t("classroomCode")}
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
          />
        </ModalBody>
        <ModalFooter>
          <LewisButton onClick={handleSubmit}>{t("submit")}</LewisButton>
          <LewisButton variant="outlined" onClick={() => setModalType(null)}>
            {t("cancel")}
          </LewisButton>
        </ModalFooter>
      </Modal>
    </Navbar>
  );
};

export default AppNavbar;
