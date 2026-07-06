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

import LewisButton from "~/components/Partial/LewisButton";
import LewisTextInput from "~/components/Partial/LewisTextInput";
import { classroomService } from "~/services/classroomService";
import { useAuthStore } from "~/store/authStore";
import Classroom from "~/models/Classroom";
import { uploadService } from "~/services/uploadService";
import { CalendarDays, GraduationCap, MonitorPlay, Sparkles, Users } from "lucide-react";

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
          classroomService.getStudentRole(user?.id),
          classroomService.getTeacherRole(user?.id),
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
    const featureCards = [
      {
        icon: GraduationCap,
        title: "Structured classes",
        text: "Keep courses, classrooms, members, and learning paths in one clean workspace.",
      },
      {
        icon: CalendarDays,
        title: "Tasks with rhythm",
        text: "Plan assignments, deadlines, and classroom activity without the scattered tabs.",
      },
      {
        icon: MonitorPlay,
        title: "Meet and teach",
        text: "Launch lessons, live sessions, and course content from a focused learning hub.",
      },
    ];

    return (
      <div className="space-y-6">
        <section className="relative overflow-hidden rounded-[32px] border border-emerald-100 bg-white shadow-[0_24px_80px_rgba(8,55,45,0.12)]">
          <div className="absolute inset-0 bg-[#fbfcf8]" />
          <div className="relative grid min-h-[430px] gap-8 p-8 lg:grid-cols-[1fr_380px] lg:p-10">
            <div className="flex flex-col justify-center">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-800">
                <Sparkles className="h-4 w-4" />
                Skill Nest workspace
              </div>
              <h1 className="mt-6 max-w-3xl text-4xl font-semibold leading-tight text-[#10201d] lg:text-5xl">
                Build a calmer, smarter place for every class.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600">
                Sign in to manage classrooms, course content, assignments, meetings,
                and learning progress from one polished dashboard.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href="/sign-in"
                  className="inline-flex h-12 items-center justify-center rounded-2xl bg-[#0d5b49] px-6 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#0a493b] hover:shadow-md"
                >
                  Sign in to continue
                </Link>
                <Link
                  href="/course"
                  className="inline-flex h-12 items-center justify-center rounded-2xl border border-emerald-100 bg-white/80 px-6 text-sm font-semibold text-emerald-800 shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-50"
                >
                  Explore courses
                </Link>
              </div>
            </div>

            <div className="hidden items-center lg:flex">
              <div className="w-full rounded-[28px] border border-emerald-100 bg-white/82 p-5 shadow-2xl shadow-emerald-950/12 backdrop-blur">
                <div className="rounded-3xl bg-[#043a31] p-5 text-white">
                  <p className="text-sm text-emerald-100">Today in Skill Nest</p>
                  <div className="mt-5 space-y-3">
                    {[
                      ["Live class", "Product design sprint", "09:30"],
                      ["Assignment", "Research notes", "Due today"],
                      ["Course", "UI foundations", "12 lessons"],
                    ].map(([label, title, meta]) => (
                      <div
                        key={title}
                        className="rounded-2xl border border-white/10 bg-white/10 p-4"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-xs font-semibold uppercase text-emerald-100">
                            {label}
                          </p>
                          <span className="rounded-full bg-white/12 px-3 py-1 text-xs">
                            {meta}
                          </span>
                        </div>
                        <p className="mt-2 font-semibold">{title}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {featureCards.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="rounded-[26px] border border-emerald-100 bg-white/86 p-5 shadow-[0_18px_50px_rgba(8,55,45,0.08)]"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-[#10201d]">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {feature.text}
                </p>
              </div>
            );
          })}
        </section>
      </div>
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
    classes?.map((classroom) => (
      <Link href={`/${prefix}/${classroom.id}`} key={classroom.id}>
        <Card
          className="card-polished w-full overflow-hidden hover:cursor-pointer"
          imgAlt={`${classroom.name} thumbnail`}
          imgSrc={
            classroom.thumbnail ||
            "https://res.cloudinary.com/dukelewis-workspace/image/upload/v1747039662/uploads/a541itrjuslvtbifaz1q.jpg"
          }
        >
          <div className="flex items-center justify-between">
            <h5 className="text-xl font-semibold text-emerald-800 truncate">
              {classroom.name}
            </h5>
            <Badge color="success" className="ml-2 inline-flex items-center gap-1 rounded-full">
              <Users size={14} className="inline-block" />
              <span className="inline-block ml-1">
                {classroom.members?.length || 0}
              </span>
            </Badge>
          </div>
          <div className="flex items-center gap-3 mt-3">
            <div>
              <p className="text-sm text-gray-700">
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
    <div className="space-y-8">
      <section className="glass-panel rounded-2xl p-6">
        <p className="section-kicker">Skill Nest</p>
        <div className="mt-2 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-[#10201d]">
              Your learning spaces
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-gray-600">
              Manage your classrooms, assignments, meetings, and course flow from one polished workspace.
            </p>
          </div>
          <div className="flex gap-3">
            <div className="rounded-2xl border border-emerald-100 bg-white/80 px-4 py-3 shadow-sm">
              <p className="text-xs text-gray-500">Student</p>
              <p className="text-2xl font-semibold text-emerald-700">{studentClasses.length}</p>
            </div>
            <div className="rounded-2xl border border-cyan-100 bg-white/80 px-4 py-3 shadow-sm">
              <p className="text-xs text-gray-500">Teacher</p>
              <p className="text-2xl font-semibold text-cyan-700">{teacherClasses.length}</p>
            </div>
          </div>
        </div>
      </section>

      {hasNoClasses ? (
        <div className="glass-panel flex min-h-[420px] flex-col items-center justify-center rounded-2xl p-8 text-center">
          <Image
            src={`https://res.cloudinary.com/dukelewis-workspace/image/upload/v1746546890/uploads/rvllbvnf3l3yatsrtz9a.svg`}
            alt="Empty"
            width={400}
            height={400}
          />
          <p className="mt-1 text-gray-600">{t("noCurrentClass")}</p>
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
              <h2 className="section-title mb-4">
                {t("classroomAsStudent")}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {renderClassCards(studentClasses, "classroom")}
              </div>
            </>
          )}
          {teacherClasses.length > 0 && (
            <>
              <h2 className="section-title mb-4">
                {t("classroomAsTeacher")}
              </h2>
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
