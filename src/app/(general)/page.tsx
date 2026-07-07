"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import {
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Spinner,
} from "~/components/ui/primitives";

import LewisButton from "~/components/Partial/LewisButton";
import LewisTextInput from "~/components/Partial/LewisTextInput";
import LoadingButton from "~/components/Partial/LoadingButton";
import { classroomService } from "~/services/classroomService";
import { useAuthStore } from "~/store/authStore";
import Classroom from "~/models/Classroom";
import { uploadService } from "~/services/uploadService";
import { CalendarDays, GraduationCap, MonitorPlay, Sparkles, Upload, Users } from "lucide-react";

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
  const [submittingClassroom, setSubmittingClassroom] = useState(false);

  useEffect(() => {
    if (!user?.id) return;

    fetchClasses();
  }, [user?.id]);

  const fetchClasses = async () => {
    if (!user?.id) return;
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
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
          await fetchClasses();
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
      <Link
        href={`/${prefix}/${classroom.id}`}
        key={classroom.id}
        className="classroom-card group flex min-h-[330px] flex-col"
      >
        <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
          <Image
            src={
              classroom.thumbnail ||
              "https://res.cloudinary.com/dukelewis-workspace/image/upload/v1747039662/uploads/a541itrjuslvtbifaz1q.jpg"
            }
            alt={`${classroom.name} thumbnail`}
            fill
            className="object-cover transition duration-300 group-hover:scale-105"
          />
          <div className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-sm">
            <Users className="h-3.5 w-3.5 text-emerald-700" />
            {classroom.members?.length || 0}
          </div>
        </div>
        <div className="flex flex-1 flex-col space-y-3 p-4">
          <div>
            <h5 className="min-h-[48px] line-clamp-2 text-base font-bold leading-6 text-slate-950">
              {classroom.name}
            </h5>
            <p className="mt-1 text-xs font-medium uppercase tracking-wide text-emerald-700">
              {classroom.code}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[12px] font-bold text-slate-600">
            <span className="rounded-lg bg-[#eef7ef] px-2.5 py-2">
              {prefix === "teaching" ? "Teaching" : "Learning"}
            </span>
            <span className="rounded-lg bg-[#eef7ef] px-2.5 py-2 text-right">
              {classroom.members?.length || 0} members
            </span>
          </div>
          <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
            <span>Created</span>
            <span className="font-medium text-slate-700">
              {new Date(classroom.createdAt).toLocaleDateString("en-GB")}
            </span>
          </div>
        </div>
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
      <Modal show={modalType === "create"} onClose={() => !submittingClassroom && setModalType(null)} size="lg">
        <ModalHeader className="modal-titlebar">
          <div>
            <h2 className="text-base font-semibold text-slate-950">
              {t("createClassroom")}
            </h2>
            <p className="mt-1 text-xs font-normal text-slate-500">
              Create a focused learning space with a clean cover image.
            </p>
          </div>
        </ModalHeader>
        <ModalBody className="modal-body-pad">
          <LewisTextInput
            name="name"
            placeholder={t("classroomName")}
            value={form.name}
            onChange={handleChange}
            className="mb-4"
            disabled={submittingClassroom}
          />
          <LewisTextInput
            name="code"
            placeholder={t("classroomCode")}
            value={form.code}
            onChange={handleChange}
            disabled={submittingClassroom}
          />
          <label className="file-input-card">
            <span className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-emerald-700 shadow-sm">
                <Upload className="h-4 w-4" />
              </span>
              <span>
                <span className="block font-medium text-slate-800">
                  {file?.name || "Choose cover image"}
                </span>
                <span className="text-xs text-slate-500">PNG, JPG, or WEBP</span>
              </span>
            </span>
            <span className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700">
              Browse
            </span>
            <input
              name="thumbnail"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="sr-only"
              disabled={submittingClassroom}
            />
          </label>
        </ModalBody>
        <ModalFooter className="modal-footer-actions">
          <LewisButton variant="outlined" onClick={() => setModalType(null)} disabled={submittingClassroom}>
            {t("cancel")}
          </LewisButton>
          <LoadingButton onClick={handleSubmit} loading={submittingClassroom} loadingText="Creating...">
            {t("create")}
          </LoadingButton>
        </ModalFooter>
      </Modal>

      {/* Join modal */}
      <Modal show={modalType === "join"} onClose={() => !submittingClassroom && setModalType(null)} size="md">
        <ModalHeader className="modal-titlebar">
          <div>
            <h2 className="text-base font-semibold text-slate-950">
              {t("joinClassroom")}
            </h2>
            <p className="mt-1 text-xs font-normal text-slate-500">
              Send a join request with the class code.
            </p>
          </div>
        </ModalHeader>
        <ModalBody className="modal-body-pad">
          <LewisTextInput
            name="code"
            placeholder={t("classroomCode")}
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
            disabled={submittingClassroom}
          />
        </ModalBody>
        <ModalFooter className="modal-footer-actions">
          <LewisButton variant="outlined" onClick={() => setModalType(null)} disabled={submittingClassroom}>
            {t("cancel")}
          </LewisButton>
          <LoadingButton onClick={handleSubmit} loading={submittingClassroom} loadingText="Sending...">
            {t("submit")}
          </LoadingButton>
        </ModalFooter>
      </Modal>
    </div>
  );
}
