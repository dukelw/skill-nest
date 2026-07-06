import { HiPlus, HiMinus, HiBookOpen, HiClock } from "react-icons/hi";
import { useState } from "react";
import { BookOpen } from "lucide-react";
import { Chapter } from "~/models/Chapter";
import EmptyState from "~/components/EmptyState";
import LessonList from "./LessonList";
import { formatDuration } from "~/utils/format";

type Props = {
  chapters: Chapter[];
};

export default function CourseContent({ chapters }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <div className="rounded-[26px] border border-emerald-100 bg-white/88 p-5 shadow-[0_18px_50px_rgba(8,55,45,0.08)]">
      <h2 className="text-xl font-semibold text-[#10201d]">Course content</h2>

      {chapters.length === 0 ? (
        <div className="mt-4">
          <EmptyState
            compact
            icon={BookOpen}
            eyebrow="No chapters"
            title="Course content is coming soon"
            description="Chapters and lessons will appear here when the creator publishes the curriculum."
          />
        </div>
      ) : (
        <div className="mt-4 space-y-2">
          {chapters.map((chapter, idx) => (
            <div
              key={chapter.id}
              className={`overflow-hidden border transition-all duration-200 ${
                openIndex === idx
                  ? "rounded-2xl border-emerald-300 bg-emerald-50"
                  : "rounded-2xl border-emerald-100 bg-white"
              }`}
            >
              <button
                className={`flex w-full cursor-pointer items-center justify-between px-4 py-3 text-left font-medium transition-colors ${
                  openIndex === idx
                    ? "bg-emerald-600 text-white"
                    : "bg-white text-gray-800 hover:bg-emerald-50"
                }`}
                onClick={() => toggle(idx)}
              >
                <span className="flex items-center">
                  {openIndex === idx ? <HiMinus /> : <HiPlus />}
                  <span className="ml-3">{chapter.title}</span>
                </span>

                <span className="flex items-center space-x-4 text-sm">
                  <span className="flex items-center">
                    <HiBookOpen className="mr-1" />
                    {chapter.lessons.length}
                  </span>
                  <span className="flex min-w-[80px] items-center">
                    <HiClock className="mr-1" />
                    {formatDuration(
                      chapter.lessons.reduce(
                        (sum, lesson) => sum + (lesson.duration || 0),
                        0
                      )
                    )}
                  </span>
                </span>
              </button>

              {openIndex === idx && (
                <div className="px-6 pb-4 pt-4 text-sm text-gray-700">
                  {chapter.lessons.length > 0 ? (
                    <LessonList lessons={chapter.lessons} />
                  ) : (
                    <EmptyState
                      compact
                      icon={BookOpen}
                      eyebrow="No lessons"
                      title="This chapter has no lessons yet"
                      description="Lesson videos and materials will be listed here once they are added."
                    />
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
