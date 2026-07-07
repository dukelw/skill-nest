"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import {
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Badge,
  Breadcrumb,
  BreadcrumbItem,
} from "~/components/ui/primitives";

import LewisButton from "~/components/Partial/LewisButton";
import LewisTextInput from "~/components/Partial/LewisTextInput";
import { courseService } from "~/services/courseService";
import { useAuthStore } from "~/store/authStore";
import { uploadService } from "~/services/uploadService";
import { BookOpen, CalendarDays, Clock, GraduationCap, LockKeyhole, Users } from "lucide-react";
import { Course } from "~/models/Course";
import CourseCreateModal from "./_components/CourseModal";
import { formatDuration } from "~/utils/format";
import Loader from "~/components/Partial/Loader";
import EmptyState from "~/components/EmptyState";

const DEFAULT_COURSE_THUMBNAIL = "/logo-bg.png";

export default function CourseOverview() {
  const { t } = useTranslation();
  const { user } = useAuthStore();

  const [form, setForm] = useState({
    title: "",
    description: "",
    thumbnail: "",
  });

  const [newCourses, setNewCourses] = useState<Course[]>([]);
  const [popularCourses, setPopularCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalType, setModalType] = useState<"create" | "join" | null>(null);
  const [joinCode, setJoinCode] = useState("");
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    if (!user?.id) return;

    const fetchClasses = async () => {
      try {
        const courses = await courseService.getAll();
        setNewCourses(courses);
        setPopularCourses(courses);
      } catch (err) {
        console.error("Error loading classes", err);
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, [user?.id]);

  const handleReset = async () => {
    setForm({ title: "", description: "", thumbnail: "" });
    setModalType(null);
    const course = await courseService.getAll();
    setNewCourses(course);
    setPopularCourses(course);
  };

  const handleSubmit = async () => {
    if (!user) return;

    if (modalType === "create") {
      let fileUrl = "";
      if (file) {
        fileUrl = await uploadService.uploadFile(file);
      }

      const res = await courseService.create({
        ...form,
        thumbnail: fileUrl,
        creatorId: user.id,
      });

      if (res) {
        handleReset();
      }
    }

    setModalType(null);
  };

  if (!user) {
    return (
      <EmptyState
        icon={LockKeyhole}
        eyebrow="Course library"
        title="Sign in to see your courses"
        description="Your enrollments, created courses, lessons, and reviews will appear here after sign-in."
        actionLabel="Sign in"
        actionHref="/sign-in"
      />
    );
  }

  if (loading) {
    return <Loader />;
  }

  const renderClassCards = (classes: Course[], prefix: string) =>
    classes?.map((course) => (
      <Link
        href={`/${prefix}/${course.id}`}
        key={`${prefix}-${course.id}`}
        className="group flex h-full min-h-[430px] flex-col overflow-hidden rounded-xl border border-emerald-100 bg-[#f7fbf7] shadow-sm transition hover:-translate-y-1 hover:border-emerald-200 hover:shadow-md"
      >
        <div className="relative aspect-[16/9] overflow-hidden bg-emerald-50">
          <Image
            src={course.thumbnail || DEFAULT_COURSE_THUMBNAIL}
            alt={`${course.title} thumbnail`}
            fill
            className="object-cover transition duration-300 group-hover:scale-105"
          />
          <Badge className="absolute right-3 top-3 gap-1 bg-white/95 text-slate-700 shadow-sm">
            <Users size={14} />
            <span>{course.totalMembers ?? course.members?.length ?? 0}</span>
          </Badge>
        </div>
        <div className="flex flex-1 flex-col p-5">
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-emerald-200 bg-[#eef7ef] px-2.5 py-1 text-xs font-extrabold uppercase tracking-wide text-emerald-800">
              {course.level || "All levels"}
            </span>
            <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-600">
              #{course.id}
            </span>
          </div>

          <h5 className="mt-4 min-h-[58px] line-clamp-2 text-[20px] font-extrabold leading-7 text-slate-950">
            {course.title}
          </h5>

          <p className="mt-2 min-h-[48px] line-clamp-2 text-sm leading-6 text-slate-600">
            {course.description || "No description has been added for this course yet."}
          </p>

          <div className="mt-auto grid grid-cols-2 gap-2 border-t border-emerald-100 pt-4 text-xs font-bold text-slate-600">
            <span className="flex items-center gap-2 rounded-lg bg-[#eef7ef] px-2.5 py-2">
              <GraduationCap className="h-3.5 w-3.5 text-emerald-700" />
              {course.totalLessons ?? course.lessons?.length ?? 0} lessons
            </span>
            <span className="flex items-center gap-2 rounded-lg bg-[#eef7ef] px-2.5 py-2">
              <Clock className="h-3.5 w-3.5 text-emerald-700" />
              {course.totalDuration ? formatDuration(course.totalDuration) : "0m"}
            </span>
            <span className="col-span-2 flex items-center gap-2 rounded-lg bg-[#eef7ef] px-2.5 py-2">
              <CalendarDays className="h-3.5 w-3.5 text-emerald-700" />
              Created {new Date(course.createdAt).toLocaleDateString("en-GB")}
            </span>
          </div>
        </div>
      </Link>
    ));

  const hasNoClasses = newCourses.length === 0 && popularCourses.length === 0;

  return (
    <div className="space-y-8">
      <Breadcrumb aria-label="Breadcrumb">
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem href="/course">Course</BreadcrumbItem>
      </Breadcrumb>
      <section className="glass-panel rounded-2xl p-6">
        <p className="section-kicker">Course studio</p>
        <div className="mt-2 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-[#10201d]">
              Curated courses for focused learning
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-gray-600">
              Build structured lessons, publish learning paths, and keep progress visible.
            </p>
          </div>
          <div className="flex gap-4">
          <LewisButton space={false} onClick={() => setModalType("create")}>
            {t("courseComponent.createCourse")}
          </LewisButton>
          <LewisButton
            space={false}
            onClick={() => setModalType("join")}
            variant="outlined"
          >
            {t("courseComponent.joinCourse")}
          </LewisButton>
        </div>
        </div>
      </section>
      {hasNoClasses ? (
        <EmptyState
          icon={BookOpen}
          eyebrow="No courses yet"
          title="Start your course library"
          description="Create a course, add chapters and lessons, or join a course shared by your teacher."
          actionLabel={t("courseComponent.createCourse")}
          onAction={() => setModalType("create")}
          secondaryLabel={t("courseComponent.joinCourse")}
          secondaryHref="/course"
        />
      ) : (
        <>
          {newCourses.length > 0 && (
            <>
              <h2 className="section-title mb-4">
                {t("courseComponent.newCourse")}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {renderClassCards(newCourses, "course")}
              </div>
            </>
          )}
          {popularCourses.length > 0 && (
            <>
              <h2 className="section-title mb-4">
                {t("courseComponent.popularCourse")}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {renderClassCards(popularCourses, "teaching")}
              </div>
            </>
          )}
        </>
      )}

      {/* Create modal */}
      <CourseCreateModal
        show={modalType === "create"}
        onClose={() => setModalType(null)}
        onCreated={handleReset}
      />

      {/* Join modal */}
      <Modal show={modalType === "join"} onClose={() => setModalType(null)}>
        <ModalHeader className="bg-green-500 text-white">
          {t("courseComponent.joinCourse")}
        </ModalHeader>
        <ModalBody>
          <LewisTextInput
            name="code"
            placeholder={t("courseComponent.courseId")}
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
