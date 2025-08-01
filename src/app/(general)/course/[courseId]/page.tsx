"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  Dropdown,
  DropdownItem,
} from "flowbite-react";
import { useCourseStore } from "~/store/courseStore";
import { useAuthStore } from "~/store/authStore";
import { courseService } from "~/services/courseService";
import Loader from "~/components/partial/Loader";
import CourseHero from "./_components/CourseHero";
import CourseContent from "./_components/CourseContent";
import CreateChapterModal from "./_components/CreateChapterModal";
import CreateLessonModal from "./_components/CreateLessonModal";
import LewisButton from "~/components/partial/LewisButton";

export default function CourseDetail() {
  const { courseId } = useParams();
  const { course, setCourse } = useCourseStore();
  const { user } = useAuthStore();
  const router = useRouter();

  const [modal, setModal] = useState<"chapter" | "lesson" | null>(null);

  const fetchCourse = async () => {
    try {
      const res = await courseService.getDetail(Number(courseId));
      if (!res) {
        router.replace("/not-found");
        return;
      }
      setCourse(res);
    } catch (err) {
      console.error("Error fetching course detail", err);
      router.replace("/not-found");
    }
  };

  useEffect(() => {
    if (courseId) fetchCourse();
  }, [courseId, router]);

  if (!course) return <Loader />;

  const isCreator = course.creatorId === user?.id;

  return (
    <div className="p-6 space-y-6">
      <Breadcrumb aria-label="Breadcrumb">
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem href="/course">Course</BreadcrumbItem>
        <BreadcrumbItem>{course.title}</BreadcrumbItem>
      </Breadcrumb>

      <div className="flex justify-end items-center">
        {isCreator && (
          <div className="flex items-center gap-2">
            <LewisButton
              onClick={() => {
                router.push("/dashboard/course");
              }}
              color="blue"
              lewisSize="small"
              space={false}
            >
              Edit
            </LewisButton>

            <Dropdown
              label=""
              renderTrigger={() => (
                <LewisButton lewisSize="small" space={false}>
                  Add
                </LewisButton>
              )}
              placement="bottom-end"
              inline
            >
              <DropdownItem onClick={() => setModal("chapter")}>
                Create Chapter
              </DropdownItem>
              <DropdownItem onClick={() => setModal("lesson")}>
                Create Lesson
              </DropdownItem>
            </Dropdown>
          </div>
        )}
      </div>

      <CourseHero course={course} currentUser={user} />
      <CourseContent chapters={course.chapters ?? []} />

      <CreateChapterModal
        show={modal === "chapter"}
        onClose={() => setModal(null)}
        courseId={course.id}
        existingChapters={course.chapters || []}
        onCreated={fetchCourse}
      />
      <CreateLessonModal
        open={modal === "lesson"}
        onClose={() => setModal(null)}
        chapters={course.chapters ?? []}
        courseId={course.id}
        onSuccess={fetchCourse}
      />
    </div>
  );
}
