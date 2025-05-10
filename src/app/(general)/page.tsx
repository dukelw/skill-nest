/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Image from "next/image";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import LewisButton from "~/components/partial/LewisButton";
// import { User } from "~/context/AuthContext";
// import { userService } from "~/services/userService";
// import { useAuth } from "~/context/AuthContext";
import { useAuthStore } from "~/store/authStore";
import { Modal, ModalBody, ModalFooter, ModalHeader } from "flowbite-react";
import LewisTextInput from "~/components/partial/LewisTextInput";
import { classroomService } from "~/services/classroomService";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const router = useRouter();
  const [openModal, setOpenModal] = useState(false);
  const [form, setForm] = useState({
    name: "",
    code: "",
    thumbnail: "",
  });
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    const res = await classroomService.create({
      ...form,
      creatorId: user.id,
    });
    if (res) {
      setForm({
        name: "",
        code: "",
        thumbnail: "",
      });
      setOpenModal(false);
      router.replace("/teaching");
      toast.success("Create classroom successfully");
    }
  };

  return (
    <div
      style={{ minHeight: "calc(100vh - 80px)" }}
      className="flex flex-col items-center justify-center"
      suppressHydrationWarning
    >
      <Image
        src={`https://res.cloudinary.com/dukelewis-workspace/image/upload/v1746546890/uploads/rvllbvnf3l3yatsrtz9a.svg`}
        alt="Uploaded image"
        width={400}
        height={400}
      />

      <p className="mt-1">{t("noCurrentClass")}</p>

      <div className="mt-4 flex gap-4 justify-between">
        <LewisButton
          space={false}
          variant="outlined"
          onClick={() => setOpenModal(true)}
        >
          {t("createClassroom")}
        </LewisButton>
        <LewisButton space={false} href="/join-classroom">
          {t("joinClassroom")}
        </LewisButton>
      </div>

      {/* Modal tạo lớp */}
      <Modal show={openModal} onClose={() => setOpenModal(false)}>
        <ModalHeader className="dark:border-green-500 border-green-500">
          <p className="text-green font-bold uppercase">
            {t("createClassroom")}
          </p>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <LewisTextInput
              name="name"
              placeholder={t("classroomName")}
              value={form.name}
              onChange={handleChange}
            />
            <LewisTextInput
              name="code"
              placeholder={t("classroomCode")}
              value={form.code}
              onChange={handleChange}
            />
            <input
              placeholder={t("thumbnailUrl")}
              name="thumbnail"
              type="file"
              value={form.thumbnail}
              onChange={handleChange}
              className="block w-full mt-4 text-sm file:bg-green-700 text-gray-500 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:bg-green file:text-white hover:file:bg-green-600"
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <LewisButton onClick={handleSubmit}>{t("create")}</LewisButton>
          <LewisButton variant="outlined" onClick={() => setOpenModal(false)}>
            {t("cancel")}
          </LewisButton>
        </ModalFooter>
      </Modal>
    </div>
  );
}
