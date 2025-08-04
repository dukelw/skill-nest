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
import { Eye, Pencil } from "lucide-react";
import { toast } from "react-toastify";
import { fallbackUserAvatar } from "~/constant";
import Assignment from "~/models/Assignment";
import { assignmentService } from "~/services/assignmentService";
import PreviewAssignmentModal from "./PreviewModal";

interface Props {
  assignments: Assignment[];
  onUpdate?: () => Promise<void>;
}

export default function AssignmentList({ assignments, onUpdate }: Props) {
  const [showPreview, setShowPreview] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);

  const handleView = async (id: number) => {
    try {
      const data = await assignmentService.getAssignmentById(id);
      setSelectedAssignment(data);
      setShowPreview(true);
    } catch (err) {
      toast.error("Failed to fetch assignment");
      console.error(err);
    }
  };

  return (
    <div className="w-full overflow-x-auto rounded-xl border border-green-300 shadow-md">
      <Table className="min-w-[1000px] text-sm text-gray-700 dark:text-gray-700">
        <TableHead className="bg-green-200">
          <TableHeadCell>#</TableHeadCell>
          <TableHeadCell>Title</TableHeadCell>
          <TableHeadCell>Type</TableHeadCell>
          <TableHeadCell>Due Date</TableHeadCell>
          <TableHeadCell>Classroom</TableHeadCell>
          <TableHeadCell>Creator</TableHeadCell>
          <TableHeadCell>Actions</TableHeadCell>
        </TableHead>
        <TableBody>
          {assignments?.map((a, index) => (
            <TableRow
              key={a.id}
              className="hover:bg-green-50 transition-colors"
            >
              <TableCell>{index + 1}</TableCell>
              <TableCell className="font-medium">{a.title}</TableCell>
              <TableCell>
                <span
                  className={`px-2 py-1 rounded text-xs font-semibold ${
                    a.type === "QUIZ"
                      ? "bg-purple-100 text-purple-800"
                      : a.type === "DOCUMENT"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {a.type}
                </span>
              </TableCell>
              <TableCell>{new Date(a.dueDate).toLocaleDateString()}</TableCell>
              <TableCell>{a.classroom?.name ?? "—"}</TableCell>
              <TableCell className="flex items-center gap-2">
                <Image
                  src={
                    a.classroom?.creator?.avatar?.trim()
                      ? a.classroom.creator.avatar
                      : fallbackUserAvatar
                  }
                  alt="avatar"
                  width={32}
                  height={32}
                  className="rounded-full w-8 h-8 object-cover"
                />
                <div>
                  <div className="font-semibold">
                    {a.classroom?.creator?.name ?? "Unknown"}
                  </div>
                  <div className="text-xs text-gray-500">
                    {a.classroom?.creator?.email ?? "—"}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button
                    size="xs"
                    color="yellow"
                    onClick={() =>
                      toast.info(
                        "Tính năng cập nhật assignment đang phát triển."
                      )
                    }
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    size="xs"
                    color="blue"
                    onClick={() => handleView(a.id)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <PreviewAssignmentModal
        show={showPreview}
        onClose={() => setShowPreview(false)}
        data={selectedAssignment}
      />
    </div>
  );
}
