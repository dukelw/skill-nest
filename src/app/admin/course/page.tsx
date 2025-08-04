"use client";

import { useEffect, useState } from "react";
import { courseService } from "~/services/courseService";
import { useAuthStore } from "~/store/authStore";
import { useCourseStore } from "~/store/courseStore";
import { Breadcrumb, BreadcrumbItem } from "flowbite-react";
import CourseList from "./_components/CourseList";
import LewisButton from "~/components/partial/LewisButton";
import CourseModal from "~/app/(general)/course/_components/CourseModal";

function Course() {
  const { courses, setCourses } = useCourseStore();
  const { user } = useAuthStore();
  const [form, setForm] = useState({
    title: "",
    description: "",
    thumbnail: "",
  });

  const [modalType, setModalType] = useState<"create" | "join" | null>(null);

  const fetchData = async () => {
    const res = await courseService.getAll();
    setCourses(res);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleReset = async () => {
    setForm({ title: "", description: "", thumbnail: "" });
    setModalType(null);
    const course = await courseService.getAll();
    setCourses(course);
  };

  return (
    <div className="p-6 gap-4">
      <Breadcrumb aria-label="Breadcrumb" className="mb-4">
        <BreadcrumbItem href="/">Dashboard</BreadcrumbItem>
        <BreadcrumbItem href="/classroom">Course</BreadcrumbItem>
      </Breadcrumb>
      <LewisButton
        onClick={() => setModalType("create")}
        className="ml-auto mb-3"
        lewisSize="small"
        space={false}
      >
        + Course
      </LewisButton>
      <CourseList userId={user?.id || 0} data={courses ?? []} />
      <CourseModal
        show={modalType === "create"}
        onClose={() => setModalType(null)}
        onCreated={handleReset}
      />
    </div>
  );
}

export default Course;
