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
  const { course, lesson, setLesson } = useCourseStore();
  const router = useRouter();
  const { lessonId: lessonIdParam } = useParams();
  const lessonId = Number(lessonIdParam);

  const [openChapterIds, setOpenChapterIds] = useState<number[]>([]);
  const { t } = useTranslation();

  const getFlatLessons = () =>
    course?.chapters?.flatMap((chapter: Chapter) => chapter.lessons) ?? [];

  const getPrevLessonId = () => {
    const flatLessons = getFlatLessons();
    const currentIndex = flatLessons.findIndex(
      (item: Lesson) => item.id === lessonId
    );

    if (currentIndex > 0) return flatLessons[currentIndex - 1].id;
    return null;
  };

  const getNextLessonId = () => {
    const flatLessons = getFlatLessons();
    const currentIndex = flatLessons.findIndex(
      (item: Lesson) => item.id === lessonId
    );

    if (currentIndex >= 0 && currentIndex < flatLessons.length - 1) {
      return flatLessons[currentIndex + 1].id;
    }

    return null;
  };

  const fetchData = async () => {
    const res = await courseService.getLessonDetail(lessonId);
    setLesson(res);
  };

  useEffect(() => {
    fetchData();
    if (!course) return;

    const chapterWithLesson = course.chapters?.find((chapter) =>
      chapter.lessons.some((item) => item.id === lessonId)
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
    <div className="grid h-[calc(100vh-56px)] grid-cols-1 overflow-hidden bg-[#f4f8f5] md:grid-cols-[minmax(0,1fr)_340px]">
      <main className="flex min-h-0 flex-col overflow-y-auto">
        <div className="bg-[#111827] p-3 sm:p-4">
          <div className="relative mx-auto aspect-video max-h-[calc(100vh-230px)] min-h-[260px] w-full overflow-hidden rounded-xl bg-black shadow-sm">
            <ReactPlayer
              src={lesson?.contentUrl || ""}
              width="100%"
              height="100%"
              controls
            />
          </div>
        </div>

        <section className="border-b border-emerald-100 bg-white px-5 py-4 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">
                Current lesson
              </p>
              <h1 className="mt-1 text-2xl font-extrabold text-slate-950">
                {lesson?.name}
              </h1>
            </div>

            <LewisButton
              size="sm"
              onClick={() => alert("Đi đến hỏi đáp")}
              className="flex items-center gap-2"
              space={false}
            >
              <MessageCircle className="h-4 w-4" />
              {t("Q&A")}
            </LewisButton>
          </div>
        </section>

        <div className="mt-auto flex justify-between gap-3 border-t border-emerald-100 bg-white px-5 py-4">
          <LewisButton
            space={false}
            onClick={() => {
              const prevId = getPrevLessonId();
              if (prevId) router.push(`/learning/${prevId}`);
            }}
            disabled={!getPrevLessonId()}
            className="flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ChevronLeft className="h-4 w-4" />
            {t("prev")}
          </LewisButton>

          <LewisButton
            space={false}
            onClick={() => {
              const nextId = getNextLessonId();
              if (nextId) router.push(`/learning/${nextId}`);
            }}
            disabled={!getNextLessonId()}
            className="flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t("next")}
            <ChevronRight className="h-4 w-4" />
          </LewisButton>
        </div>
      </main>

      <aside className="min-h-0 overflow-y-auto border-l border-emerald-100 bg-white">
        <div className="sticky top-0 z-10 border-b border-emerald-100 bg-white px-5 py-4">
          <h2 className="flex items-center gap-2 text-lg font-extrabold text-slate-950">
            <GraduationCap className="h-5 w-5 text-emerald-700" />
            {t("learningPage.courseContent")}
          </h2>
        </div>

        <div className="space-y-3 p-4">
          {course?.chapters?.map((chapter) => (
            <section
              key={chapter.id}
              className="overflow-hidden rounded-xl border border-emerald-100 bg-[#f7fbf7]"
            >
              <button
                onClick={() => toggleChapter(chapter.id)}
                className="flex w-full cursor-pointer items-center justify-between gap-3 px-4 py-3 text-left text-sm font-extrabold text-slate-800 transition hover:bg-emerald-50"
              >
                <span className="line-clamp-2">
                  {chapter.order}. {chapter.title}
                </span>
                <span className="text-xs font-bold text-emerald-700">
                  {chapter.lessons?.length ?? 0}
                </span>
              </button>

              {openChapterIds.includes(chapter.id) && (
                <ul className="space-y-2 border-t border-emerald-100 p-2">
                  {chapter.lessons.map((item) => {
                    const isActive = item.id === lessonId;
                    return (
                      <li
                        key={item.id}
                        onClick={() => router.push(`/learning/${item.id}`)}
                        className={`flex cursor-pointer items-center justify-between rounded-lg p-3 transition ${
                          isActive
                            ? "bg-emerald-700 text-white shadow-sm"
                            : "bg-white text-slate-700 hover:bg-emerald-50"
                        }`}
                      >
                        <div className="flex min-w-0 flex-col">
                          <span className="line-clamp-2 text-sm font-bold">
                            {item.name}
                          </span>
                          <span
                            className={`text-xs ${
                              isActive ? "text-white/80" : "text-slate-500"
                            }`}
                          >
                            {Math.floor(item.duration / 60)
                              .toString()
                              .padStart(2, "0")}
                            :{(item.duration % 60).toString().padStart(2, "0")}
                          </span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          ))}
        </div>
      </aside>
    </div>
  );
}
