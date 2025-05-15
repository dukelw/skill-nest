"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import {
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Card,
  Spinner,
  Badge,
} from "flowbite-react";

import LewisButton from "~/components/partial/LewisButton";
import LewisTextInput from "~/components/partial/LewisTextInput";
import { classroomService } from "~/services/classroomService";
import { useAuthStore } from "~/store/authStore";
import Classroom from "~/models/Classroom";
import { uploadService } from "~/services/uploadService";
import { Users } from "lucide-react";

export default function HomePage() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const router = useRouter();

  const [form, setForm] = useState({ name: "", code: "", thumbnail: "" });

  const [studentClasses, setStudentClasses] = useState<Classroom[]>([]);
  const [teacherClasses, setTeacherClasses] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalType, setModalType] = useState<"create" | "join" | null>(null);
  const [joinCode, setJoinCode] = useState("");
  const [file, setFile] = useState<File | null>(null); // State to hold file

  useEffect(() => {
    if (!user?.id) return;

    const fetchClasses = async () => {
      try {
        const [studentRes, teacherRes] = await Promise.all([
          classroomService.getStudentRole(user.id),
          classroomService.getTeacherRole(user.id),
        ]);
        setStudentClasses(studentRes);
        setTeacherClasses(teacherRes);
      } catch (err) {
        console.error("Error loading classes", err);
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, [user?.id]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
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

  if (!user) {
    return (
      <p className="text-gray-500 p-4 text-center">
        Please sign in to see your classrooms.
      </p>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <Spinner size="xl" aria-label="Loading classrooms..." />
      </div>
    );
  }

  const renderClassCards = (classes: Classroom[], prefix: string) =>
    classes.map((classroom) => (
      <Link href={`/${prefix}/${classroom.id}`} key={classroom.id}>
        <Card
          className="w-full hover:cursor-pointer transition-transform hover:scale-[1.02]"
          imgAlt={`${classroom.name} thumbnail`}
          imgSrc={
            classroom.thumbnail ||
            "https://res.cloudinary.com/dukelewis-workspace/image/upload/v1747039662/uploads/a541itrjuslvtbifaz1q.jpg"
          }
        >
          <div className="flex items-center justify-between">
            <h5 className="text-xl font-semibold text-green-600 dark:text-green-600 truncate">
              {classroom.name}
            </h5>
            <Badge color="info" className="ml-2 inline-flex items-center gap-1">
              <Users size={14} className="inline-block" />
              <span className="inline-block ml-1">
                {classroom.members?.length || 0}
              </span>
            </Badge>
          </div>
          <div className="flex items-center gap-3 mt-3">
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <strong>Code:</strong> {classroom.code}
              </p>
              <p className="text-xs text-gray-500">
                Created:{" "}
                {new Date(classroom.createdAt).toLocaleDateString("en-GB")}
              </p>
            </div>
          </div>
        </Card>
      </Link>
    ));

  const hasNoClasses =
    studentClasses.length === 0 && teacherClasses.length === 0;

  return (
    <div className="p-6">
      {hasNoClasses ? (
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <Image
            src={`https://res.cloudinary.com/dukelewis-workspace/image/upload/v1746546890/uploads/rvllbvnf3l3yatsrtz9a.svg`}
            alt="Empty"
            width={400}
            height={400}
          />
          <p className="mt-1">{t("noCurrentClass")}</p>
          <div className="mt-4 flex gap-4">
            <LewisButton onClick={() => setModalType("create")}>
              {t("createClassroom")}
            </LewisButton>
            <LewisButton
              onClick={() => setModalType("join")}
              variant="outlined"
            >
              {t("joinClassroom")}
            </LewisButton>
          </div>
        </div>
      ) : (
        <>
          {studentClasses.length > 0 && (
            <>
              <h1 className="text-2xl uppercase font-bold mb-4 text-green-600">
                {t("classroomAsStudent")}
              </h1>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {renderClassCards(studentClasses, "classroom")}
              </div>
            </>
          )}
          {teacherClasses.length > 0 && (
            <>
              <h1 className="text-2xl uppercase font-bold mb-4 text-purple-600">
                {t("classroomAsTeacher")}
              </h1>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {renderClassCards(teacherClasses, "teaching")}
              </div>
            </>
          )}
        </>
      )}

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
    </div>
  );
}
