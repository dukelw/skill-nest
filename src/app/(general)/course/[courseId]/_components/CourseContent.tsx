import { HiPlus, HiMinus, HiBookOpen, HiClock } from "react-icons/hi";
import { useState } from "react";
import { Chapter } from "~/models/Chapter";
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
    <div className="bg-white p-5 rounded-xl shadow space-y-3">
      <h2 className="text-xl font-semibold">Nội dung khóa học</h2>

      {chapters.length === 0 ? (
        <p className="text-gray-600">Chưa có chương nào.</p>
      ) : (
        <div className="space-y-2">
          {chapters.map((chapter, idx) => (
            <div
              key={chapter.id}
              className={`border transition-all duration-200 ${
                openIndex === idx
                  ? "rounded-t-lg bg-green-50 border-green-400"
                  : "rounded-lg border-gray-200"
              }`}
            >
              <button
                className={`cursor-pointer w-full flex justify-between items-center px-4 py-3 text-left font-medium transition-colors ${
                  openIndex === idx
                    ? "text-white bg-green-500 rounded-t-lg"
                    : "text-gray-800 bg-white rounded-lg"
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
                  <span className="flex items-center min-w-[80px]">
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
                <div className="px-6 pb-4 text-sm text-gray-700">
                  {chapter.lessons.length > 0 ? (
                    <LessonList lessons={chapter.lessons} />
                  ) : (
                    <p className="text-gray-500 mt-4">Chưa có bài học nào.</p>
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
