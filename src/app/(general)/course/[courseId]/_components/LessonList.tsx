"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "react-toastify";
import { Lesson } from "~/models/Lesson";
import { courseService } from "~/services/courseService";
import { useAuthStore } from "~/store/authStore";
import { useCourseStore } from "~/store/courseStore";
import { formatDuration } from "~/utils/format";

export default function LessonList({ lessons }: { lessons: Lesson[] }) {
  const router = useRouter();
  const { courseEnrollments, setCourseEnrollments } = useCourseStore();
  const { user } = useAuthStore();
  const { course } = useCourseStore();

  const fetchData = async () => {
    const res = await courseService.getMembers(lessons[0].courseId ?? 0);
    setCourseEnrollments(res ?? []);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <ul className="space-y-2 mt-4">
      {lessons.map((lesson) => (
        <li
          key={lesson.id}
          className="flex items-center text-gray-800 cursor-pointer hover:text-blue-600 transition"
          onClick={() => {
            let isJoined = courseEnrollments?.some((c) => {
              return c.userId === user?.id;
            });
            if (user?.id === course?.creatorId) isJoined = true;
            if (isJoined) {
              router.push(`/learning/${lesson.id}`);
            } else {
              toast.error("Please enroll this course first!");
            }
          }}
        >
          <span className="text-sm text-gray-500 mr-3 w-[60px] shrink-0">
            {formatDuration(lesson.duration ?? 0)}
          </span>
          <span className="text-base">{lesson.name}</span>
        </li>
      ))}
    </ul>
  );
}
