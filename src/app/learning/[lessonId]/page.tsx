"use client";

import { useEffect, useState } from "react";
import ReactPlayer from "react-player";
import {
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  MessageCircle,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import LewisButton from "~/components/Partial/LewisButton";
import { useCourseStore } from "~/store/courseStore";
import { courseService } from "~/services/courseService";
import { Chapter } from "~/models/Chapter";
import { Lesson } from "~/models/Lesson";
import { useTranslation } from "react-i18next";

export default function LessonPage() {
  const { course } = useCourseStore();
  const router = useRouter();
  const { lessonId: lessonIdParam } = useParams();
  const lessonId = Number(lessonIdParam);

  const [openChapterIds, setOpenChapterIds] = useState<number[]>([]);
  const { lesson, setLesson } = useCourseStore();
  const { t } = useTranslation();

  const getPrevLessonId = () => {
    if (!course || !course.chapters) return null;

    const flatLessons = course.chapters.flatMap(
      (chapter: Chapter) => chapter.lessons
    );
    const currentIndex = flatLessons.findIndex(
      (l: Lesson) => l.id === lessonId
    );

    if (currentIndex > 0) return flatLessons[currentIndex - 1].id;
    return null;
  };

  const getNextLessonId = () => {
    if (!course || !course.chapters) return null;

    const flatLessons = course.chapters.flatMap(
      (chapter: Chapter) => chapter.lessons
    );
    const currentIndex = flatLessons?.findIndex(
      (l: Lesson) => l.id === lessonId
    );

    if (currentIndex < flatLessons.length - 1)
      return flatLessons[currentIndex + 1].id;

    return null;
  };

  const fetchData = async () => {
    const res = await courseService.getLessonDetail(lessonId);
    setLesson(res);
  };

  useEffect(() => {
    fetchData();
    if (!course) return;

    const chapterWithLesson = course?.chapters?.find((chapter) =>
      chapter.lessons.some((lesson) => lesson.id === lessonId)
    );

    if (chapterWithLesson) {
      setOpenChapterIds([chapterWithLesson.id]);
    }
  }, [course, lessonId]);

  const toggleChapter = (chapterId: number) => {
    setOpenChapterIds((prev) =>
      prev.includes(chapterId)
        ? prev.filter((id) => id !== chapterId)
        : [...prev, chapterId]
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] min-h-screen">
      {/* Left - Video + nội dung */}
      <div className="max-h-screen overflow-y-auto">
        <div className="relative w-full aspect-video">
          <ReactPlayer
            src={lesson?.contentUrl || ""}
            width="100%"
            height="100%"
            controls
          />
        </div>

        <div className="px-6 py-2">
          {/* Ghi chú & hỏi đáp */}
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-xl font-bold">{lesson?.name}</h1>

            <LewisButton
              size="sm"
              onClick={() => alert("Đi đến hỏi đáp")}
              className="flex items-center gap-2"
              space={false}
            >
              <MessageCircle className="w-4 h-4" />
              {t("Q&A")}
            </LewisButton>
          </div>
        </div>

        {/* Điều hướng */}
        <div className="flex justify-between py-6 md:pt-2 px-6 border-t">
          <LewisButton
            space={false}
            onClick={() => {
              const prevId = getPrevLessonId();
              if (prevId) router.push(`/learning/${prevId}`);
            }}
            disabled={!getPrevLessonId()}
            className="flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
            {t("prev")}
          </LewisButton>

          <LewisButton
            space={false}
            onClick={() => {
              const nextId = getNextLessonId();
              if (nextId) router.push(`/learning/${nextId}`);
            }}
            disabled={!getNextLessonId()}
            className="flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t("next")}
            <ChevronRight className="w-4 h-4" />
          </LewisButton>
        </div>
      </div>

      {/* Right - Danh sách bài học */}
      <div className="p-6 md:p-0">
        <h2 className="text-xl font-bold text-gray-800 py-2 flex items-center gap-2">
          <GraduationCap className="w-5 h-5 ml-2" />
          {t("learningPage.courseContent")}
        </h2>

        {course?.chapters?.map((chapter) => (
          <div key={chapter.id}>
            {/* Chapter Header */}
            <button
              onClick={() => toggleChapter(chapter.id)}
              className="w-full text-left p-4 bg-gray-100 hover:bg-gray-200 transition font-semibold text-sm text-gray-800"
            >
              {chapter.order}. {chapter.title}
            </button>

            {/* Lessons */}
            {openChapterIds.includes(chapter.id) && (
              <ul className="space-y-2 pl-2">
                {chapter.lessons.map((lesson) => {
                  const isActive = lesson.id === lessonId;
                  return (
                    <li
                      key={lesson.id}
                      onClick={() => router.push(`/learning/${lesson.id}`)}
                      className={`p-2 rounded-lg cursor-pointer flex justify-between items-center transition
                  ${
                    isActive ? "bg-green-600 text-white" : "hover:bg-gray-100"
                  }`}
                    >
                      <div className="flex flex-col">
                        <span className="text-sm">{lesson.name}</span>
                        <span
                          className={`text-xs ${
                            isActive ? "text-white/80" : "text-gray-500"
                          }`}
                        >
                          {Math.floor(lesson.duration / 60)
                            .toString()
                            .padStart(2, "0")}
                          :{(lesson.duration % 60).toString().padStart(2, "0")}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
