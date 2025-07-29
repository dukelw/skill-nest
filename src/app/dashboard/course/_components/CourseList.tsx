"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
  Button,
} from "flowbite-react";
import { ChevronDown, ChevronUp, Plus, Pencil, Trash } from "lucide-react";
import { Course } from "~/models/Course";
import { Chapter } from "~/models/Chapter";
import { Lesson } from "~/models/Lesson";
import { formatDuration } from "~/utils/format";
import CourseModal from "~/app/(general)/course/_components/CourseModal";
import { courseService } from "~/services/courseService";
import { useCourseStore } from "~/store/courseStore";
import UpdateChapterModal from "./UpdateChapterModal";
import CreateChapterModal from "~/app/(general)/course/[courseId]/_components/CreateChapterModal";
import { toast } from "react-toastify";
import ConfirmModal from "~/components/Modal/ConfirmModal";

interface Props {
  data: Course[];
  userId: number;
}

export default function CourseList({ data, userId }: Props) {
  const [openCourseId, setOpenCourseId] = useState<number | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showCreateChapterModal, setShowCreateChapterModal] = useState(false);
  const [showUpdateChapterModal, setShowUpdateChapterModal] = useState(false);
  const [selectedCourseForChapter, setSelectedCourseForChapter] =
    useState<Course | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [selectedChapterIds, setSelectedChapterIds] = useState<number[]>([]);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteMode, setDeleteMode] = useState<"chapter" | "course" | null>(
    null
  );

  const { setCourses } = useCourseStore();

  const fetchData = async () => {
    const res = await courseService.getCoursesOfUser(userId);
    setCourses(res);
  };

  const handleDeleteConfirmed = async () => {
    setIsDeleting(true);
    try {
      if (deleteMode === "chapter") {
        await courseService.deleteChapters(selectedChapterIds);
        toast.success("Đã xóa chương.");
      } else if (deleteMode === "course" && selectedCourse) {
        await courseService.deleteCourse(selectedCourse.id);
        toast.success("Đã xoá khoá học.");
      }
      fetchData();
      setShowConfirmDelete(false);
    } catch (err) {
      toast.error("Xoá thất bại. Thử lại.");
    } finally {
      setIsDeleting(false);
      setDeleteMode(null);
      setSelectedCourse(null);
      setSelectedChapterIds([]);
    }
  };

  const toggleCourse = (id: number) => {
    setOpenCourseId(openCourseId === id ? null : id);
  };

  const [openChapterIds, setOpenChapterIds] = useState<number[]>([]);

  const toggleChapter = (id: number) => {
    setOpenChapterIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const handleEditCourse = (course: Course) => {
    setSelectedCourse(course);
    setShowCourseModal(true);
  };

  const handleAddChapter = (course: Course) => {
    setSelectedCourseForChapter(course);
    setShowCreateChapterModal(true);
  };

  const handleEditChapter = (chapter: Chapter) => {
    setSelectedChapter(chapter);
    setShowUpdateChapterModal(true);
  };

  return (
    <div className="w-full overflow-x-auto rounded-xl border border-green-300 shadow-md">
      <Table className="min-w-[1000px] text-sm text-gray-700 dark:text-gray-700">
        <TableHead className="bg-green-500 text-[#0D1216] uppercase text-xs tracking-wider">
          <TableHeadCell />
          <TableHeadCell>Thumbnail</TableHeadCell>
          <TableHeadCell>Title</TableHeadCell>
          <TableHeadCell>Description</TableHeadCell>
          <TableHeadCell>Level</TableHeadCell>
          <TableHeadCell>Lessons</TableHeadCell>
          <TableHeadCell>Duration</TableHeadCell>
          <TableHeadCell>Members</TableHeadCell>
          <TableHeadCell>Free?</TableHeadCell>
          <TableHeadCell>Created At</TableHeadCell>
          <TableHeadCell>Actions</TableHeadCell>
        </TableHead>
        <TableBody>
          {data.map((course) => (
            <>
              <TableRow
                key={course.id}
                className="border-b border-green-100 even:bg-green-50 hover:bg-green-100 transition-colors duration-200"
                onClick={() => toggleCourse(course.id)}
              >
                <TableCell className="w-2 px-2 text-center cursor-pointer">
                  {openCourseId === course.id ? (
                    <ChevronUp size={18} />
                  ) : (
                    <ChevronDown size={18} />
                  )}
                </TableCell>

                <TableCell>
                  <div className="relative w-16 h-10 rounded overflow-hidden border border-green-200">
                    <Image
                      src={course.thumbnail ?? ""}
                      alt={course.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                </TableCell>
                <TableCell className="font-medium">{course.title}</TableCell>
                <TableCell>{course.description}</TableCell>
                <TableCell>{course.level ?? "N/A"}</TableCell>
                <TableCell>{course.totalLessons ?? "—"}</TableCell>
                <TableCell>
                  {course.totalDuration
                    ? formatDuration(course.totalDuration)
                    : "—"}
                </TableCell>
                <TableCell>{course.totalMembers}</TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                      course.isFree
                        ? "bg-green-200 text-green-800"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {course.isFree ? "Yes" : "No"}
                  </span>
                </TableCell>
                <TableCell>
                  {new Date(course.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell className="flex items-center justify-evenly">
                  <Button
                    size="xs"
                    color="yellow"
                    onClick={() => handleEditCourse(course)}
                    className="mr-2"
                  >
                    <Pencil className="w-3 h-3" />
                  </Button>
                  <Button
                    size="xs"
                    color="red"
                    onClick={() => {
                      setSelectedCourse(course);
                      setDeleteMode("course");
                      setShowConfirmDelete(true);
                    }}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>

              {/* Expand Row */}
              {openCourseId === course.id && (
                <TableRow className="bg-green-50">
                  <TableCell colSpan={12}>
                    <div className="p-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <h4 className="text-green-800 font-semibold">
                          Chapters
                        </h4>
                        <div className="flex items-center gap-2">
                          <Button
                            size="xs"
                            onClick={() => handleAddChapter(course)}
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            Chapter
                          </Button>

                          <Button
                            size="xs"
                            onClick={() => {
                              // Select all chapters của course này
                              const chapterIds =
                                course?.chapters?.map((c) => c.id) ?? [];

                              const allSelected = chapterIds?.every((id) =>
                                selectedChapterIds.includes(id)
                              );
                              if (allSelected) {
                                setSelectedChapterIds((prev) =>
                                  prev.filter((id) => !chapterIds?.includes(id))
                                );
                              } else {
                                setSelectedChapterIds((prev) => [
                                  ...prev,
                                  ...chapterIds.filter(
                                    (id) => !prev.includes(id)
                                  ),
                                ]);
                              }
                            }}
                          >
                            Select All
                          </Button>

                          <Button
                            size="xs"
                            color="red"
                            onClick={() => {
                              setDeleteMode("chapter");
                              setShowConfirmDelete(true);
                            }}
                            disabled={selectedChapterIds.length === 0}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {course?.chapters
                          ?.filter((c) => c.courseId === course.id)
                          .map((chapter) => (
                            <div
                              key={chapter.id}
                              className="border border-green-200 p-3 rounded flex items-center gap-2"
                            >
                              <input
                                type="checkbox"
                                checked={selectedChapterIds.includes(
                                  chapter.id
                                )}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedChapterIds((prev) => [
                                      ...prev,
                                      chapter.id,
                                    ]);
                                  } else {
                                    setSelectedChapterIds((prev) =>
                                      prev.filter((id) => id !== chapter.id)
                                    );
                                  }
                                }}
                              />

                              <div className="w-full">
                                <div className="flex justify-between items-center">
                                  <div
                                    onClick={() => toggleChapter(chapter.id)}
                                    className="flex items-center gap-2 cursor-pointer"
                                  >
                                    {openChapterIds.includes(chapter.id) ? (
                                      <ChevronUp className="w-4 h-4 text-green-700" />
                                    ) : (
                                      <ChevronDown className="w-4 h-4 text-green-700" />
                                    )}
                                    <span className="font-medium">
                                      {chapter.title}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <Button size="xs">
                                      <Plus className="w-3 h-3 mr-1" />
                                      Lesson
                                    </Button>
                                    <Button
                                      size="xs"
                                      color="yellow"
                                      onClick={() => handleEditChapter(chapter)}
                                    >
                                      <Pencil className="w-3 h-3" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                              {openChapterIds.includes(chapter.id) && (
                                <ul className="pl-4 mt-2 list-disc text-sm text-gray-600">
                                  {chapter.lessons.map((lesson) => (
                                    <div
                                      key={lesson.id}
                                      className="flex justify-between items-center text-sm text-gray-700 pl-4"
                                    >
                                      <span>
                                        {lesson.name} –{" "}
                                        {Math.floor(lesson.duration / 60)}m{" "}
                                        {lesson.duration % 60}s
                                      </span>
                                      <div className="flex gap-2">
                                        <Pencil className="w-4 h-4 text-yellow-600 hover:text-yellow-800 cursor-pointer" />
                                        <Trash className="w-4 h-4 text-red-500 hover:text-red-700 cursor-pointer" />
                                      </div>
                                    </div>
                                  ))}
                                </ul>
                              )}
                            </div>
                          ))}
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </>
          ))}
        </TableBody>
      </Table>
      <CourseModal
        show={showCourseModal}
        onClose={() => {
          setShowCourseModal(false);
          setSelectedCourse(null);
        }}
        course={selectedCourse}
        onUpdated={() => {
          setShowCourseModal(false);
          setSelectedCourse(null);
          fetchData();
        }}
      />
      <CreateChapterModal
        show={showCreateChapterModal}
        onClose={() => {
          setShowCreateChapterModal(false);
          setSelectedCourseForChapter(null);
        }}
        courseId={selectedCourseForChapter?.id ?? 0}
        existingChapters={selectedCourseForChapter?.chapters ?? []}
        onCreated={() => {
          setShowCreateChapterModal(false);
          fetchData(); // Reload
        }}
      />

      <UpdateChapterModal
        show={showUpdateChapterModal}
        onClose={() => {
          setShowUpdateChapterModal(false);
          setSelectedChapter(null);
        }}
        chapterId={selectedChapter?.id ?? 0}
        initialTitle={selectedChapter?.title ?? ""}
        order={selectedChapter?.order ?? 1}
        onUpdated={() => {
          setShowUpdateChapterModal(false);
          fetchData(); // Reload
        }}
      />

      <ConfirmModal
        show={showConfirmDelete}
        onClose={() => {
          setShowConfirmDelete(false);
          setDeleteMode(null);
        }}
        onConfirm={handleDeleteConfirmed}
        isLoading={isDeleting}
        title={
          deleteMode === "chapter"
            ? "Xác nhận xóa chương"
            : "Xác nhận xóa khoá học"
        }
        description={
          deleteMode === "chapter"
            ? "Bạn có chắc muốn xóa chương này? Các bài học liên quan cũng sẽ bị xóa."
            : "Bạn có chắc muốn xóa khoá học này? Tất cả chương, bài học và mục tiêu sẽ bị xóa vĩnh viễn."
        }
        confirmText={deleteMode === "chapter" ? "Xóa chương" : "Xóa khoá học"}
      />
    </div>
  );
}
