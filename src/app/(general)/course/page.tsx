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
  Breadcrumb,
  BreadcrumbItem,
} from "flowbite-react";

import LewisButton from "~/components/partial/LewisButton";
import LewisTextInput from "~/components/partial/LewisTextInput";
import { courseService } from "~/services/courseService";
import { useAuthStore } from "~/store/authStore";
import { uploadService } from "~/services/uploadService";
import { Users } from "lucide-react";
import Head from "./head";
import { Course } from "~/models/Course";
import CourseCreateModal from "./_components/CourseModal";
import { formatDuration } from "~/utils/format";
import Loader from "~/components/partial/Loader";

export default function CourseOverview() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const router = useRouter();

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
      <p className="text-gray-500 p-4 text-center">
        Please sign in to see your coursess.
      </p>
    );
  }

  if (loading) {
    return <Loader />;
  }

  const renderClassCards = (classes: Course[], prefix: string) =>
    classes?.map((course) => (
      <Link href={`/${prefix}/${course.id}`} key={course.id}>
        <Card
          className="w-full hover:cursor-pointer transition-transform hover:scale-[1.02]"
          imgAlt={`${course.title} thumbnail`}
          imgSrc={
            course.thumbnail ||
            "https://res.cloudinary.com/dukelewis-workspace/image/upload/v1747039662/uploads/a541itrjuslvtbifaz1q.jpg"
          }
        >
          <h5 className="text-xl font-semibold text-green-600 dark:text-green-600 truncate">
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
                color="info"
                className="ml-2 flex-nowrap items-center gap-1"
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
    <div className="p-6">
      <Breadcrumb aria-label="Breadcrumb">
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem href="/course">Course</BreadcrumbItem>
      </Breadcrumb>
      <div className="w-full flex flex-col items-center justify-end">
        <div className="ml-auto mt-4 flex gap-4">
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
      {hasNoClasses ? (
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <Image
            src={`https://res.cloudinary.com/dukelewis-workspace/image/upload/v1746546890/uploads/rvllbvnf3l3yatsrtz9a.svg`}
            alt="Empty"
            width={400}
            height={400}
          />
          <p className="mt-1">{t("noCurrentClass")}</p>
        </div>
      ) : (
        <>
          {newCourses.length > 0 && (
            <>
              <h1 className="text-2xl uppercase font-bold mb-4 text-green-600">
                {t("courseComponent.newCourse")}
              </h1>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {renderClassCards(newCourses, "course")}
              </div>
            </>
          )}
          {popularCourses.length > 0 && (
            <>
              <h1 className="text-2xl uppercase font-bold mb-4 text-purple-600">
                {t("courseComponent.popularCourse")}
              </h1>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {renderClassCards(popularCourses, "teaching")}
              </div>
            </>
          )}
        </>
      )}

      <Head />

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
