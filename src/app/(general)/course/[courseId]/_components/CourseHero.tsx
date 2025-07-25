import { Check } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo } from "react";
import { toast } from "react-toastify";
import LewisButton from "~/components/partial/LewisButton";
import { Course } from "~/models/Course";
import { courseService } from "~/services/courseService";
import { useCourseStore } from "~/store/courseStore";
import { formatDuration } from "~/utils/format";

export default function CourseHero({
  course,
  currentUser,
}: {
  course: Course;
  currentUser: { id: number } | null;
}) {
  const { courseEnrollments, setCourseEnrollments } = useCourseStore();
  const fetchData = async () => {
    const res = await courseService.getMembers(course.id);
    setCourseEnrollments(res);
  };

  const handleEnroll = async () => {
    toast.success("Enroll course successfully");
    const res = await courseService.enroll(course.id, currentUser?.id ?? 0);
    if (res) {
      fetchData();
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const isJoined = useMemo(() => {
    if (!currentUser) return false;
    if (currentUser.id === course.creatorId) return true;
    return courseEnrollments?.some((m) => m.userId === currentUser.id);
  }, [courseEnrollments, currentUser]);

  return (
    <div className="grid md:grid-cols-3 gap-6 p-6 bg-white rounded-xl shadow">
      {/* LEFT - 2/3 width */}

      <div className="md:col-span-2 space-y-6">
        {/* Thumbnail */}
        <div className="relative w-full max-h-[200px] aspect-video overflow-hidden rounded-xl">
          <Image
            src={course.thumbnail ?? ""}
            alt={course.title}
            fill
            className="object-contain h-full w-full rounded-xl"
            sizes="(max-width: 768px) 100vw, 66vw"
            priority
          />
        </div>

        {/* Title + Description */}
        <div className="space-y-3">
          <h1 className="text-3xl font-bold">{course.title}</h1>
          <p className="text-gray-600">{course.description}</p>
        </div>
        {/* Goals */}
        <div className="space-y-3">
          <h2 className="text-xl font-semibold">Bạn sẽ học được gì?</h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-gray-700">
            {course?.goals?.map((g, i) => (
              <li key={i} className="flex items-start gap-2">
                <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-xs">{g.content}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* RIGHT - 1/3 width */}
      <div className="rounded-xl shadow overflow-hidden bg-white">
        {/* Intro Video */}
        <div className="aspect-video bg-black">
          <video
            src={course.introVideoUrl || ""}
            controls
            className="w-full h-full object-contain"
          />
        </div>

        {/* Course Info */}
        <div className="p-5 space-y-3 w-full">
          <h2 className="text-xl font-semibold">Thông tin khóa học</h2>
          <ul className="text-gray-700 space-y-1 text-sm">
            <li>
              <b>Miễn phí:</b> {course.isFree ? "Có" : "Không"}
            </li>
            <li>
              <b>Trình độ:</b> {course.level}
            </li>
            <li>
              <b>Thời lượng:</b>{" "}
              {formatDuration(course.totalDuration) || "Đang cập nhật"}
            </li>
            <li>
              <b>Tổng số bài học:</b> {course.totalLessons || "Đang cập nhật"}
            </li>
            <li>
              <b>Người tạo:</b> {course.creator?.name}
            </li>
          </ul>
          {!isJoined && (
            <LewisButton className="mt-4 w-full" onClick={handleEnroll}>
              Đăng ký khóa học
            </LewisButton>
          )}
        </div>
      </div>
    </div>
  );
}
