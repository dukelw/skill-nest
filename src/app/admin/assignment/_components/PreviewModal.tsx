"use client";

import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Table,
  TableBody,
  TableHead,
  TableHeadCell,
  TableRow,
  TableCell,
  Badge,
} from "flowbite-react";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { fallbackUserAvatar } from "~/constant";
import Assignment from "~/models/Assignment";
import { AssignmentType } from "~/models/AssignmentType";
import Submission from "~/models/Submission";

interface Props {
  show: boolean;
  onClose: () => void;
  data: Assignment;
}

export default function PreviewAssignmentModal({ show, onClose, data }: Props) {
  const { t } = useTranslation();
  if (!data) return null;

  return (
    <Modal show={show} onClose={onClose} size="4xl">
      <ModalHeader className="bg-green text-white">{t("preview")}</ModalHeader>
      <ModalBody className="bg-green-50">
        <div className="space-y-4">
          {/* Title & Type (same row) */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-green-800">Title:</h3>
              <p>{data.title}</p>
            </div>
            <div>
              <Badge color="success" className="text-sm">
                {data.type}
              </Badge>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold text-green-800">
              {t("description")}:
            </h3>
            <p>{data.description || "—"}</p>
          </div>

          {/* Due Date & Created At (same row) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-lg font-semibold text-green-800">
                {t("dueDate")}:
              </h3>
              <p>{new Date(data.dueDate).toLocaleString()}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-green-800">
                {t("createdAt")}:
              </h3>
              <p>{new Date(data.createdAt).toLocaleString()}</p>
            </div>
          </div>

          {/* Submissions */}
          <div>
            <h3 className="text-lg font-semibold text-green-800">
              {t("submission")}:
            </h3>
            {data.submissions?.length > 0 ? (
              <div className="overflow-x-auto">
                <Table className="min-w-[700px] text-sm">
                  <TableHead className="bg-green-200 text-green-900">
                    <TableHeadCell>#</TableHeadCell>
                    <TableHeadCell>{t("user")}</TableHeadCell>
                    <TableHeadCell>{t("file")}</TableHeadCell>
                    <TableHeadCell>{t("submmitedAt")}</TableHeadCell>
                    <TableHeadCell>{t("grade")}</TableHeadCell>
                  </TableHead>
                  <TableBody>
                    {data.submissions.map((s: Submission, index: number) => (
                      <TableRow key={s.id} className="hover:bg-green-100">
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Image
                              src={s.user?.avatar || fallbackUserAvatar}
                              alt="avatar"
                              width={32}
                              height={32}
                              className="rounded-full w-8 h-8 object-cover"
                            />
                            <div>
                              <div className="font-medium">
                                {s.user?.name || `User #${s.userId}`}
                              </div>
                              <div className="text-xs text-gray-500">
                                {s.user?.email || "—"}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <a
                            href={
                              data.type === AssignmentType.QUIZ
                                ? `/result/${s.id}`
                                : `${s.fileUrl}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 underline"
                          >
                            {t("view")}
                          </a>
                        </TableCell>
                        <TableCell>
                          {new Date(s.submittedAt).toLocaleString()}
                        </TableCell>
                        <TableCell>{s.grade ?? "—"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p>No submissions found.</p>
            )}
          </div>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button className="ml-auto" color="gray" onClick={onClose}>
          {t("close")}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
