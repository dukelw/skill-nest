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
  Card,
  Badge,
  Breadcrumb,
  BreadcrumbItem,
} from "~/components/ui/primitives";

import LewisButton from "~/components/Partial/LewisButton";
import LewisTextInput from "~/components/Partial/LewisTextInput";
import { courseService } from "~/services/courseService";
import { useAuthStore } from "~/store/authStore";
import { uploadService } from "~/services/uploadService";
import { BookOpen, LockKeyhole, Users } from "lucide-react";
import { Course } from "~/models/Course";
import CourseCreateModal from "./_components/CourseModal";
import { formatDuration } from "~/utils/format";
import Loader from "~/components/Partial/Loader";
import EmptyState from "~/components/EmptyState";

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
        const [studentRes, teacherRes] = await Promise.all([
          courseService.getAll(),
          courseService.getAll(),
        ]);
        setNewCourses(studentRes);
        setPopularCourses(teacherRes);
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
      <Link href={`/${prefix}/${course.id}`} key={course.id}>
        <Card
          className="card-polished w-full overflow-hidden hover:cursor-pointer"
          imgAlt={`${course.title} thumbnail`}
          imgSrc={
            course.thumbnail ||
            "https://res.cloudinary.com/dukelewis-workspace/image/upload/v1747039662/uploads/a541itrjuslvtbifaz1q.jpg"
          }
        >
          <h5 className="text-xl font-semibold text-emerald-800 truncate">
            {course.title}
          </h5>

          <p className="text-sm">{course.description}</p>
          <div className="flex flex-col gap-1 text-sm text-gray-600">
            <p>
              <strong>Code:</strong> {course.id}
            </p>
            <p>
              <strong>Created:</strong>{" "}
              {new Date(course.createdAt).toLocaleDateString("en-GB")}
            </p>
            {course.totalLessons !== null && (
              <p>
                <strong>Lessons:</strong> {course.totalLessons}
              </p>
            )}
            <div className="flex items-center justify-between">
              {course.totalDuration !== null && (
                <p>
                  <strong>Duration:</strong>{" "}
                  {formatDuration(course.totalDuration)}
                </p>
              )}
              <Badge
                color="success"
                className="ml-2 flex-nowrap items-center gap-1 rounded-full"
              >
                <Users size={14} className="inline-block" />
                <span className="inline-block ml-1">{course.totalMembers}</span>
              </Badge>
            </div>
          </div>
        </Card>
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
