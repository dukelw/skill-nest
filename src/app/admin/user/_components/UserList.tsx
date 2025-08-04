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
import { Pencil, Lock, UnlockIcon } from "lucide-react";
import { Course } from "~/models/Course";
import { courseService } from "~/services/courseService";
import { toast } from "react-toastify";
import ConfirmModal from "~/components/Modal/ConfirmModal";
import User from "~/models/User";
import { fallbackUserAvatar } from "~/constant";
import UpdateUserModal from "./UpdateUserModal";
import { userService } from "~/services/userService";

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
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userToToggle, setUserToToggle] = useState<User | null>(null);
  const [isToggling, setIsToggling] = useState(false);

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
      onUpdate?.();
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
          <TableHeadCell>Active</TableHeadCell>
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
              <TableCell>
                <span
                  className={`inline-block w-2 h-2 rounded-full mr-2 ${
                    user.isActive ? "bg-green-500" : "bg-gray-400"
                  }`}
                  title={user.isActive ? "Đang hoạt động" : "Đã vô hiệu hoá"}
                ></span>
                {user.isActive ? "Active" : "Inactive"}
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
                  color={user.isActive ? "red" : "green"}
                  onClick={() => setUserToToggle(user)}
                >
                  {user.isActive ? (
                    <Lock className="w-4 h-4" />
                  ) : (
                    <UnlockIcon className="w-4 h-4" />
                  )}
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
        show={!!userToToggle}
        onClose={() => setUserToToggle(null)}
        onConfirm={async () => {
          if (!userToToggle) return;
          setIsToggling(true);
          try {
            await userService.toggleActiveUser(userToToggle.id);
            toast.success(
              userToToggle.isActive
                ? "Đã vô hiệu hóa người dùng."
                : "Đã kích hoạt người dùng."
            );
            setUserToToggle(null);
            onUpdate?.();
          } catch {
            toast.error("Thao tác thất bại.");
          } finally {
            setIsToggling(false);
          }
        }}
        isLoading={isToggling}
        title={
          userToToggle?.isActive
            ? "Vô hiệu hóa người dùng"
            : "Kích hoạt người dùng"
        }
        description={
          userToToggle?.isActive
            ? "Bạn có chắc muốn vô hiệu hóa người dùng này? Họ sẽ không thể đăng nhập."
            : "Bạn có chắc muốn kích hoạt người dùng này? Họ sẽ có thể đăng nhập lại."
        }
        confirmText={userToToggle?.isActive ? "Vô hiệu hóa" : "Kích hoạt"}
      />
    </div>
  );
}
