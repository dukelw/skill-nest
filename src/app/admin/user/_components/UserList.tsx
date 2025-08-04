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
import { Pencil, Ban } from "lucide-react";
import { Course } from "~/models/Course";
import { courseService } from "~/services/courseService";
import { useCourseStore } from "~/store/courseStore";
import { toast } from "react-toastify";
import ConfirmModal from "~/components/Modal/ConfirmModal";
import User from "~/models/User";
import { fallbackUserAvatar } from "~/constant";
import UpdateUserModal from "./UpdateUserModal";

interface Props {
  users: User[];
  userId: number;
  onUpdate?: (page?: number) => Promise<void>;
}

export default function UserList({ users, userId, onUpdate }: Props) {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedChapterIds, setSelectedChapterIds] = useState<number[]>([]);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteMode, setDeleteMode] = useState<"chapter" | "course" | null>(
    null
  );
  const [lessonToDelete, setLessonToDelete] = useState<{
    courseId: number;
    lessonId: number;
  } | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

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

  return (
    <div className="w-full overflow-x-auto rounded-xl border border-green-300 shadow-md">
      <Table className="min-w-[1000px] text-sm text-gray-700 dark:text-gray-700">
        <TableHead className="bg-green-200">
          <TableHeadCell>#</TableHeadCell>
          <TableHeadCell>Avatar</TableHeadCell>
          <TableHeadCell>Name</TableHeadCell>
          <TableHeadCell>Gender</TableHeadCell>
          <TableHeadCell>Email</TableHeadCell>
          <TableHeadCell>Phone</TableHeadCell>
          <TableHeadCell>Role</TableHeadCell>
          <TableHeadCell>Actions</TableHeadCell>
        </TableHead>
        <TableBody>
          {users?.map((user, index) => (
            <TableRow
              key={user.id}
              className="hover:bg-green-50 transition-colors"
            >
              <TableCell>{index + 1}</TableCell>
              <TableCell>
                <Image
                  src={user?.avatar?.trim() ? user.avatar : fallbackUserAvatar}
                  width={40}
                  height={40}
                  objectFit="cover"
                  alt="Avatar"
                  className="rounded-full w-10 h-10 object-fill"
                />
              </TableCell>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.gender}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.phone ?? "—"}</TableCell>
              <TableCell>
                <span
                  className={`px-2 py-1 rounded text-xs font-semibold ${
                    user.role === "ADMIN"
                      ? "bg-yellow-100 text-yellow-800"
                      : user.role === "TEACHER"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {user.role}
                </span>
              </TableCell>
              <TableCell className="flex gap-2">
                <Button
                  size="xs"
                  color="yellow"
                  onClick={() => setSelectedUser(user)}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  size="xs"
                  color="red"
                  // onClick={() => handleDisable(user.id)}
                >
                  <Ban className="w-4 h-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

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

      {selectedUser && (
        <UpdateUserModal
          show={!!selectedUser}
          onClose={() => setSelectedUser(null)}
          user={selectedUser}
          onUpdated={onUpdate}
        />
      )}

      <ConfirmModal
        show={lessonToDelete !== null}
        onClose={() => setLessonToDelete(null)}
        onConfirm={async () => {
          if (!lessonToDelete) return;
          try {
            await courseService.deleteLesson(
              lessonToDelete.courseId,
              lessonToDelete.lessonId
            );
            toast.success("Đã xoá bài học.");
            fetchData();
          } catch (err) {
            toast.error("Xoá bài học thất bại.");
          } finally {
            setLessonToDelete(null);
          }
        }}
        isLoading={false}
        title="Xác nhận xoá bài học"
        description="Bạn có chắc muốn xoá bài học này? Hành động này không thể hoàn tác."
        confirmText="Xoá bài học"
      />
    </div>
  );
}
