/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import {
  Avatar,
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "~/components/ui/primitives";
import { useParams, useRouter } from "next/navigation";
import { assignmentService } from "~/services/assignmentService";
import { uploadService } from "~/services/uploadService"; // Import the uploadService
import LewisTextInput from "../Partial/LewisTextInput";
import { classroomService } from "~/services/classroomService";
import { useClassroomStore } from "~/store/classroomStore";
import { AssignmentType } from "~/models/AssignmentType";
import LewisButton from "../Partial/LewisButton";
import { useAuthStore } from "~/store/authStore";
import { submissionService } from "~/services/submissionService";
import Assignment from "~/models/Assignment";
import useComments from "~/hooks/useComments";
import useSocket from "~/hooks/useSocket";
import Comment from "~/models/Comment";
import { useTranslation } from "react-i18next";
import { CheckCircleIcon, ClipboardList, Plus, Upload } from "lucide-react";
import EmptyState from "../EmptyState";

export default function Assignments() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showTypeSelection, setShowTypeSelection] = useState(true); // To toggle between type selection and form
  const [assignmentType, setAssignmentType] = useState<
    "HOMEWORK" | "QUIZ" | "DOCUMENT"
  >("HOMEWORK");
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [dueDate, setDueDate] = useState<string>("");
  const [file, setFile] = useState<File | null>(null); // State to hold file
  const { classroomId } = useParams();
  const { classroom, setClassroom } = useClassroomStore();
  const { user } = useAuthStore();
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<
    number | null
  >(null);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [isConfirmAttempOpen, setIsConfirmAttempOpen] = useState(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [visibleCommentBox, setVisibleCommentBox] = useState<number | null>(
    null
  );
  const [newComment, setNewComment] = useState<string>("");
  const { createComment, deleteComment, updateComment } = useComments(
    Number(classroomId)
  );
  const [edit, isEdit] = useState<boolean>(false);
  const [replyInfo, setReplyInfo] = useState<{
    id: number | undefined;
    email: string | null;
    userId: number;
  }>({ id: undefined, email: null, userId: -1 });
  const { t } = useTranslation();

  const toggleCommentBox = (id: number) => {
    setVisibleCommentBox((prev) => (prev === id ? null : id));
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
      handleGetClassroomDetail();
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

  const findRootCommentId = (comments: any[], comment: Comment) => {
    let current = comment;
    while (current.parentId) {
      current = comments.find((c) => c.id === current.parentId);
    }
    return current?.id;
  };

  const handleGoToAttemp = (quizId: number) => {
    router.push(`/quiz/${quizId}`);
  };

  // Handle assignment type selection
  const handleTypeSelection = (type: "HOMEWORK" | "QUIZ" | "DOCUMENT") => {
    setAssignmentType(type);
    setShowTypeSelection(false);
  };

  const handleGetClassroomDetail = async () => {
    const res = await classroomService.getDetail(Number(classroomId));
    setClassroom(res);
  };

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]); // Set the selected file
    }
  };

  // Handle creating assignment
  const handleCreateAssignment = async () => {
    let fileUrl = "";

    // If a file is selected, upload it first
    if (file) {
      fileUrl = await uploadService.uploadFile(file); // Upload the file and get the URL
    }

    const newAssignmentData = {
      title,
      description,
      dueDate: new Date(dueDate),
      classroomId: Number(classroomId),
      type: assignmentType,
      fileUrl, // Include the uploaded file URL
    };

    const res = await assignmentService.createAssignment(newAssignmentData);

    if (res) {
      handleGetClassroomDetail();
      setIsModalOpen(false);
      setTitle("");
      setDescription("");
      setDueDate("");
      setFile(null); // Clear file after submission
    }
  };

  const handleDelete = async (id: number) => {
    const res = await assignmentService.deleteAssignment(id);
    if (res) {
      handleGetClassroomDetail();
    }
  };

  const handleReplyClick = (id: number, email: string, userId: number) => {
    setReplyInfo({ id, email, userId });
  };

  const handleCreateComment = async (assignmentId: number) => {
    if (!newComment.trim() || !user) return;

    try {
      if (edit && replyInfo.id) {
        updateComment({
          id: replyInfo.id,
          content: newComment,
          userId: user?.id,
          classroomId: Number(classroomId),
        });
      } else {
        createComment({
          content: newComment,
          assignmentId,
          userId: user?.id,
          classroomId: Number(classroomId),
          parentId: replyInfo.id,
        });
        socket?.emit("createAnnouncement", {
          title: "Bình luận mới",
          content: `Lớp học "${classroom?.name}" có bình luận mới: ${newComment}`,
          senderId: user?.id,
          href: `/teaching/${classroom?.id}`,
          userIds: [classroom?.creatorId, replyInfo.userId].filter(
            Boolean
          ) as number[],
        });
      }

      setNewComment("");
      setReplyInfo({ id: undefined, email: null, userId: -1 });
      isEdit(false);
    } catch (error) {
      console.error("Failed to post comment", error);
    }
  };

  const socket = useSocket();

  useEffect(() => {
    if (!socket) return;

    socket.emit("joinAssignmentRoom", Number(classroomId));

    const onCommentChange = async () => {
      await handleGetClassroomDetail();
    };

    socket.on("commentChange", onCommentChange);
    return () => {
      socket.off("commentChange", onCommentChange);
    };
  }, [socket]);

  const handleEditComment = (comment: Comment) => {
    setReplyInfo({ id: comment.id, email: null, userId: -1 });
    setNewComment(comment.content);
    isEdit(true);
  };

  const visibleAssignments =
    classroom?.assignments
      .filter((c: Assignment) => c.type !== AssignmentType.DOCUMENT)
      .sort(
        (a, b) =>
          new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      ) ?? [];

  return (
    <div className="space-y-5">
      <section className="detail-panel p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">
              Classroom work
            </p>
            <h2 className="mt-1 text-xl font-bold text-slate-950">
            {t("assignmentComponent.assignment")}
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Homework and quizzes for this class are collected here.
            </p>
          </div>
          {classroom?.creatorId === user?.id && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg bg-[#0d3f2a] px-4 text-sm font-bold text-white shadow-sm transition hover:bg-[#0a3322]"
            >
              <Plus className="h-4 w-4" />
              New assignment
            </button>
          )}
        </div>
      </section>

      {/* Display assignments */}
      <div className="space-y-4">
        {visibleAssignments.length === 0 && (
          <EmptyState
            compact
            icon={ClipboardList}
            eyebrow="No assignments"
            title="No assignments yet"
            description="Create the first homework or quiz so students know what to work on next."
            actionLabel={
              classroom?.creatorId === user?.id ? "New assignment" : undefined
            }
            onAction={() => setIsModalOpen(true)}
          />
        )}
        {visibleAssignments.map((assignment) => {
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
                  <div className="flex items-center justify-between mt-2">
                    <p className="mt-2 text-sm text-gray-500">
                      {t("assignmentComponent.dueDate")}:{" "}
                      {new Date(assignment.dueDate).toLocaleString()}
                    </p>
                    <button
                      onClick={() => toggleCommentBox(assignment.id)}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      💬 {assignment.comments.length}{" "}
                      {t("assignmentComponent.comments")}
                    </button>
                  </div>
                  {visibleCommentBox === assignment.id && (
                    <div className="mt-2 overflow-x-scroll">
                      {/* Danh sách comment gốc */}
                      <div className="mt-4 space-y-3">
                        {assignment.comments
                          .filter((c) => !c.parentId) // comment cấp 1
                          ?.map((comment) => {
                            const replies = assignment.comments.filter(
                              (r) =>
                                findRootCommentId(assignment.comments, r) ===
                                  comment.id && r.parentId
                            );

                            return (
                              <div
                                key={comment.id}
                                className="flex items-start space-x-2"
                              >
                                {/* Avatar người comment gốc */}
                                <Avatar
                                  rounded
                                  img={comment.user.avatar}
                                  className="w-10 h-10 rounded-full"
                                />
                                <div className="flex-1 ml-1">
                                  <div className="text-sm font-semibold text-green-700">
                                    {comment.user.name}
                                    <span className="ml-1 text-xs font-light text-gray-400">
                                      ({comment.user.email})
                                    </span>
                                  </div>
                                  <div className="text-sm text-gray-700">
                                    {comment.content}
                                  </div>
                                  <div className="text-xs text-gray-400">
                                    {new Date(
                                      comment.createdAt
                                    ).toLocaleString()}
                                  </div>
                                  <button
                                    onClick={() =>
                                      handleReplyClick(
                                        comment.id,
                                        comment.user.email,
                                        comment.user?.id
                                      )
                                    }
                                    className="cursor-pointer text-blue-500 text-xs hover:underline mt-1"
                                  >
                                    {t("reply")}
                                  </button>
                                  {comment.user?.id === user?.id && (
                                    <button
                                      onClick={() => handleEditComment(comment)}
                                      className="cursor-pointer ml-4 text-yellow-500 text-xs hover:underline mt-1"
                                    >
                                      {t("edit")}
                                    </button>
                                  )}
                                  {comment.user?.id === user?.id && (
                                    <button
                                      onClick={() =>
                                        deleteComment({
                                          id: comment.id,
                                          userId: user?.id,
                                          classroomId: Number(classroomId),
                                        })
                                      }
                                      className="cursor-pointer ml-4 text-red-500 text-xs hover:underline mt-1"
                                    >
                                      {t("delete")}
                                    </button>
                                  )}

                                  {/* Danh sách reply cấp 2 (bao gồm từ cấp 2 trở đi gộp chung) */}
                                  {replies?.map((reply) => {
                                    const parentComment =
                                      assignment.comments.find(
                                        (c) => c.id === reply.parentId
                                      );

                                    return (
                                      <div
                                        key={reply.id}
                                        className="flex items-start space-x-2 mt-3 ml-6 pl-2 border-gray-300"
                                      >
                                        <Avatar
                                          rounded
                                          img={reply.user.avatar}
                                          className="w-10 h-10 rounded-full"
                                        />
                                        <div>
                                          <div className="text-sm font-semibold text-green-700">
                                            {reply.user.name}
                                            <span className="ml-1 text-xs font-light text-gray-400">
                                              ({reply.user.email})
                                            </span>
                                          </div>
                                          <div className="text-xs text-gray-700">
                                            <span className="text-gray-500 mr-1">
                                              {t("reply")} @
                                              {parentComment?.user.email}
                                            </span>
                                            {reply.content}
                                          </div>
                                          <div className="text-[10px] text-gray-400">
                                            {new Date(
                                              reply.createdAt
                                            ).toLocaleString()}
                                          </div>
                                          <button
                                            onClick={() =>
                                              handleReplyClick(
                                                comment.id,
                                                comment.user.email,
                                                comment.user?.id
                                              )
                                            }
                                            className="text-blue-500 text-xs hover:underline mt-1"
                                          >
                                            {t("reply")}
                                          </button>
                                          {reply.user?.id === user?.id && (
                                            <button
                                              onClick={() =>
                                                handleEditComment(reply)
                                              }
                                              className="cursor-pointer ml-4 text-yellow-500 text-xs hover:underline mt-1"
                                            >
                                              {t("edit")}
                                            </button>
                                          )}
                                          {reply.user?.id === user?.id && (
                                            <button
                                              onClick={() =>
                                                deleteComment({
                                                  id: reply.id,
                                                  userId: user?.id,
                                                  classroomId:
                                                    Number(classroomId),
                                                })
                                              }
                                              className="cursor-pointer ml-4 text-red-500 text-xs hover:underline mt-1"
                                            >
                                              {t("delete")}
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                      </div>

                      {/* Ô nhập comment */}
                      <div className="mt-4">
                        {replyInfo.email && (
                          <div className="text-xs text-gray-500 mb-1">
                            {t("reply")} @{replyInfo.email}
                          </div>
                        )}
                        <textarea
                          className="w-full border border-green-500 rounded-md p-2 text-sm"
                          rows={2}
                          placeholder="Viết bình luận..."
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                        />
                        <div className="flex justify-end mt-2">
                          <button
                            onClick={() => handleCreateComment(assignment.id)}
                            className="bg-green text-white px-4 py-2 rounded-md text-sm hover:bg-green-600"
                          >
                            {edit ? t("update") : t("send")}
                          </button>
                          {edit && (
                            <button
                              onClick={() => {
                                setNewComment("");
                                setReplyInfo({
                                  id: undefined,
                                  email: null,
                                  userId: -1,
                                });
                                isEdit(false);
                              }}
                              className="bg-red text-white px-4 py-2 ml-2 rounded-md text-sm hover:bg-red-600"
                            >
                              {t("cancel")}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {isSubmitted && (
                    <div className="mt-2 text-sm text-green-700">
                      <span className="flex items-center gap-1 text-green-600 font-medium">
                        <CheckCircleIcon className="w-5 h-5" />
                        {t("submitted")}
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
                      </span>
                    </div>
                  )}
                </div>

                <div className="col-span-12 md:col-span-4 px-6 bg-white md:border-l-2 border-l-green-500">
                  <h4 className="text-center hidden md:block font-bold text-green m-6">
                    {t("actions")}
                  </h4>
                  <div className="flex justify-end items-center mb-2">
                    {assignment.fileUrl && (
                      <a
                        href={assignment.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm inline-block bg-blue-600 hover:bg-blue-500 text-white py-2.5 px-4 rounded-md"
                      >
                        {t("attached")}
                      </a>
                    )}

                    {/* Student - Homework */}
                    {assignment.type === AssignmentType.HOMEWORK &&
                      classroom?.creatorId !== user?.id &&
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
                      classroom?.creatorId !== user?.id &&
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

      {/* MODAL ADD ASSIGNMENT */}
      <Modal show={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <ModalHeader className="modal-titlebar">
          <div>
            <h2 className="text-base font-bold text-slate-950">
              {showTypeSelection ? "Select assignment type" : "Create assignment"}
            </h2>
            <p className="mt-1 text-xs font-normal text-slate-500">
              Keep class work clear with a title, due date and optional attachment.
            </p>
          </div>
        </ModalHeader>
        <ModalBody className="modal-body-pad">
          {/* Step 1: Show type selection */}
          {showTypeSelection ? (
            <div className="grid gap-3 sm:grid-cols-3">
              <Button
                color="none"
                onClick={() => handleTypeSelection("HOMEWORK")}
                className="h-24 w-full flex-col items-start justify-between rounded-xl border border-emerald-200 bg-[#f7fbf7] px-4 py-4 text-left font-bold text-slate-900 shadow-sm hover:border-emerald-300 hover:bg-emerald-50"
              >
                {t("assignmentComponent.homework")}
              </Button>
              <Button
                color="none"
                href={`/quiz-creatory/${classroomId}`}
                className="h-24 w-full flex-col items-start justify-between rounded-xl border border-emerald-200 bg-[#f7fbf7] px-4 py-4 text-left font-bold text-slate-900 shadow-sm hover:border-emerald-300 hover:bg-emerald-50"
              >
                {t("assignmentComponent.quiz")}
              </Button>
              <Button
                color="none"
                onClick={() => handleTypeSelection("DOCUMENT")}
                className="h-24 w-full flex-col items-start justify-between rounded-xl border border-emerald-200 bg-[#f7fbf7] px-4 py-4 text-left font-bold text-slate-900 shadow-sm hover:border-emerald-300 hover:bg-emerald-50"
              >
                {t("assignmentComponent.document")}
              </Button>
            </div>
          ) : (
            // Step 2: Show form for selected assignment type
            <div>
              {/* Title */}
              <div className="mb-4">
                <label className="block text-sm font-medium">
                  {t("assignmentComponent.title")}
                </label>
                <LewisTextInput
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-2"
                />
              </div>

              {/* Description */}
              <div className="mb-4">
                <label className="block text-sm font-medium">
                  {t("assignmentComponent.description")}
                </label>
                <LewisTextInput
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-2"
                />
              </div>

              {/* Due Date */}
              <div className="mb-4">
                <label className="block text-sm font-medium">
                  {t("assignmentComponent.dueDate")}
                </label>
                <input
                  type="datetime-local" // Change from "date" to "datetime-local"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="mt-2 block h-11 w-full rounded-xl border border-slate-200 bg-[#f7fbf7] px-3 text-sm font-medium outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              {/* File Upload */}
              <div className="mb-4">
                <label className="block text-sm font-medium">
                  {t("upload")}
                </label>
                <label className="mt-2 flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-dashed border-emerald-200 bg-[#eef7ef] px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-emerald-50">
                  <span className="flex items-center gap-2">
                    <Upload className="h-4 w-4 text-emerald-700" />
                    {file?.name || "Choose attachment"}
                  </span>
                  <span className="rounded-lg bg-white px-3 py-1 text-xs text-emerald-800">
                    Browse
                  </span>
                  <input type="file" onChange={handleFileChange} className="sr-only" />
                </label>
              </div>
            </div>
          )}
        </ModalBody>
        <ModalFooter className="modal-footer-actions">
          {showTypeSelection ? (
            <Button color="none" className="h-10 rounded-lg border border-emerald-200 bg-[#f7fbf7] px-4 text-sm font-bold text-emerald-800 hover:bg-emerald-50" onClick={() => setIsModalOpen(false)}>
              {t("cancel")}
            </Button>
          ) : (
            <>
              <Button className="bg-green" onClick={handleCreateAssignment}>
                {t("create")}
              </Button>
              <Button color="gray" onClick={() => setShowTypeSelection(true)}>
                {t("cancel")}
              </Button>
            </>
          )}
        </ModalFooter>
      </Modal>

      {/* MODAL DELETE */}
      <Modal
        show={isConfirmDeleteOpen}
        onClose={() => setIsConfirmDeleteOpen(false)}
      >
        <ModalHeader className="bg-red-500 text-white">
          {t("confirmDelete")}
        </ModalHeader>
        <ModalBody>
          <p>{t("assignmentComponent.confirmStatement")}</p>
        </ModalBody>
        <ModalFooter>
          <Button
            className="bg-red-600"
            onClick={async () => {
              if (selectedAssignmentId !== null) {
                await handleDelete(selectedAssignmentId);
              }
              setIsConfirmDeleteOpen(false);
              setSelectedAssignmentId(null);
            }}
          >
            {t("imsure")}
          </Button>
          <Button color="gray" onClick={() => setIsConfirmDeleteOpen(false)}>
            {t("cancel")}
          </Button>
        </ModalFooter>
      </Modal>

      {/* MODAL ATTEMP */}
      <Modal
        show={isConfirmAttempOpen}
        onClose={() => setIsConfirmAttempOpen(false)}
      >
        <ModalHeader className="bg-blue-500 text-white">
          {t("confirmAttemp")}
        </ModalHeader>
        <ModalBody>
          <p>{t("assignmentComponent.confirmAttemp")}</p>
        </ModalBody>
        <ModalFooter>
          <Button
            className="bg-blue-500"
            onClick={async () => {
              if (selectedAssignmentId !== null) {
                handleGoToAttemp(selectedAssignmentId);
              }
              setIsConfirmAttempOpen(false);
              setSelectedAssignmentId(null);
            }}
          >
            {t("imsure")}
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
        <ModalHeader className="bg-green text-white">
          {t("assignmentComponent.submitHomework")}
        </ModalHeader>
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
            {uploading ? t("uploading") : t("submit")}
          </Button>
          <Button color="gray" onClick={() => setIsSubmitModalOpen(false)}>
            {t("cancel")}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
