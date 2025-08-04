"use client";

import { useEffect, useState } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "flowbite-react";
import { useRouter } from "next/navigation";
import { uploadService } from "~/services/uploadService";
import { useClassroomStore } from "~/store/classroomStore";
import { AssignmentType } from "~/models/AssignmentType";
import LewisButton from "~/components/Partial/LewisButton";
import { useAuthStore } from "~/store/authStore";
import Assignment from "~/models/Assignment";
import { submissionService } from "~/services/submissionService";
import { classroomService } from "~/services/classroomService";
import Classroom from "~/models/Classroom";
import Loader from "~/components/Partial/Loader";
import { useTranslation } from "react-i18next";

export default function Tasks() {
  const { studentClassrooms, setStudentClassrooms } = useClassroomStore();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<
    number | null
  >(null);
  const [isConfirmAttempOpen, setIsConfirmAttempOpen] = useState(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { t } = useTranslation();

  const router = useRouter();

  const handleGoToAttemp = (quizId: number) => {
    router.push(`/quiz/${quizId}`);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmitHomework = async () => {
    if (!file || selectedAssignmentId === null || !user) return;
    try {
      setUploading(true);
      const fileUrl = await uploadService.uploadFile(file);
      await submissionService.createSubmission({
        assignmentId: selectedAssignmentId,
        fileUrl,
        userId: user?.id,
      });
      handleGetStudentClasses();
      setUploading(false);
      setIsSubmitModalOpen(false);
      setFile(null);
      setSelectedAssignmentId(null);
      router.refresh();
    } catch (err) {
      console.error("Failed to submit", err);
      setUploading(false);
    }
  };

  const handleGetStudentClasses = async () => {
    if (!user?.id) return;
    const response = await classroomService.getStudentRole(user?.id);
    setStudentClassrooms(response);
    setLoading(false);
  };

  useEffect(() => {
    handleGetStudentClasses();
  }, [user?.id]);

  if (!user) {
    return (
      <p className="text-gray-500 p-4 text-center">
        Please sign in to see your tasks.
      </p>
    );
  }

  if (loading) {
    return <Loader />;
  }

  if (!studentClassrooms || studentClassrooms.length === 0) {
    return <p className="text-gray-500 p-4">You have no assignment yet.</p>;
  }

  return (
    <div className="p-6">
      <Breadcrumb aria-label="Breadcrumb" className="mb-4">
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem href="/tasks">Tasks</BreadcrumbItem>
      </Breadcrumb>
      {studentClassrooms?.map((classroom: Classroom, index: number) => (
        <div key={index}>
          <div className="flex justify-between items-center w-full">
            <h2 className="mt-4 text-xl font-semibold">
              {t("taskPage.taskOf")}{" "}
              <span className="text-green font-bold">{classroom.name}</span>
            </h2>
          </div>
          <div className="w-full h-px bg-gray-700 my-4" />

          <div className="space-y-4">
            {classroom?.assignments
              .filter((c: Assignment) => c.type !== AssignmentType.DOCUMENT)
              .sort(
                (a, b) =>
                  new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
              )
              ?.map((assignment) => {
                const submission = assignment.submissions.find(
                  (s) => s.userId === user?.id
                );
                const isSubmitted = !!submission;

                return (
                  <div
                    key={assignment.id}
                    className="grid grid-cols-1 md:grid-cols-12 rounded-lg shadow-md"
                  >
                    <div className="col-span-12 md:col-span-8 md:mr-4 p-6">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">
                          {assignment.title}
                        </h3>
                        <span
                          className={`px-2 py-1 text-sm font-semibold rounded-md ${
                            assignment.type === "HOMEWORK"
                              ? "bg-orange text-white"
                              : assignment.type === "QUIZ"
                              ? "bg-yellow text-white"
                              : "bg-green text-white"
                          }`}
                        >
                          {assignment.type}
                        </span>
                      </div>
                      <p className="mt-2">{assignment.description}</p>
                      <p className="mt-2 text-sm text-gray-500">
                        {t("dueDate")}:{" "}
                        {new Date(assignment.dueDate).toLocaleString()}
                      </p>
                      {isSubmitted && (
                        <div className="mt-2 text-sm text-green-700">
                          ✅ {t("submitted")}
                          {submission.fileUrl && (
                            <a
                              href={
                                assignment.type === AssignmentType.QUIZ
                                  ? `/result/${submission.id}`
                                  : `${submission.fileUrl}`
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ml-4 underline text-blue-600"
                            >
                              {t("view")}
                            </a>
                          )}
                          <span className="ml-4 font-bold">
                            {t("score")}:{" "}
                            {submission.grade === null
                              ? t("doesNotHaveScore")
                              : submission.grade}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="col-span-12 md:col-span-4 p-6 md:border-l-2 border-l-green-500">
                      <h4 className="text-center hidden md:block font-bold text-green m-6">
                        {t("actions")}
                      </h4>
                      <div className="flex justify-end items-center">
                        {assignment.fileUrl && (
                          <a
                            href={assignment.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm inline-block bg-blue-600 hover:bg-blue-500 text-white py-2.5 px-4 rounded-md"
                          >
                            {t("attach")}
                          </a>
                        )}

                        {/* Student - Homework */}
                        {assignment.type === AssignmentType.HOMEWORK &&
                          classroom.creatorId !== user?.id &&
                          !submission?.grade && (
                            <LewisButton
                              className="ml-2"
                              space={false}
                              lewisSize="small"
                              onClick={() => {
                                setSelectedAssignmentId(assignment.id);
                                setIsSubmitModalOpen(true);
                              }}
                            >
                              {!isSubmitted ? t("upload") : t("resubmit")}
                            </LewisButton>
                          )}

                        {/* Student - Quiz */}
                        {assignment.type === AssignmentType.QUIZ &&
                          classroom.creatorId !== user?.id &&
                          !isSubmitted && (
                            <LewisButton
                              className="ml-2"
                              space={false}
                              lewisSize="small"
                              color="pink"
                              onClick={() => {
                                setSelectedAssignmentId(assignment.id);
                                setIsConfirmAttempOpen(true);
                              }}
                            >
                              {t("attemp")}
                            </LewisButton>
                          )}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      ))}

      {/* MODAL - ATTEMPT QUIZ */}
      <Modal
        show={isConfirmAttempOpen}
        onClose={() => setIsConfirmAttempOpen(false)}
      >
        <ModalHeader className="bg-blue-500 text-white">
          {t("confirm")}
        </ModalHeader>
        <ModalBody>
          <p> {t("taskPage.areYouSureToStartTheQuiz")}</p>
        </ModalBody>
        <ModalFooter>
          <Button
            className="bg-blue-500"
            onClick={() => {
              if (selectedAssignmentId !== null) {
                handleGoToAttemp(selectedAssignmentId);
              }
              setIsConfirmAttempOpen(false);
              setSelectedAssignmentId(null);
            }}
          >
            {t("yes")}
          </Button>
          <Button color="gray" onClick={() => setIsConfirmAttempOpen(false)}>
            {t("cancel")}
          </Button>
        </ModalFooter>
      </Modal>

      {/* MODAL - SUBMIT HOMEWORK */}
      <Modal
        show={isSubmitModalOpen}
        onClose={() => {
          setIsSubmitModalOpen(false);
          setFile(null);
        }}
      >
        <ModalHeader className="bg-green text-white">{t("submit")}</ModalHeader>
        <ModalBody>
          <input
            type="file"
            onChange={handleFileChange}
            className="block w-full mt-4 text-sm file:bg-green-700 text-gray-500 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:bg-green file:text-white hover:file:bg-green-600"
          />
        </ModalBody>
        <ModalFooter>
          <Button
            className="bg-green"
            onClick={handleSubmitHomework}
            disabled={!file || uploading}
          >
            {uploading ? "Uploading..." : "Submit"}
          </Button>
          <Button color="gray" onClick={() => setIsSubmitModalOpen(false)}>
            {t("cancel")}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
