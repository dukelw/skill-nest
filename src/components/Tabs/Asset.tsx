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
import LoadingButton from "../Partial/LoadingButton";
import { useAuthStore } from "~/store/authStore";
import useComments from "~/hooks/useComments";
import useSocket from "~/hooks/useSocket";
import Comment from "~/models/Comment";
import { useTranslation } from "react-i18next";
import { FileText, Plus, Upload } from "lucide-react";
import EmptyState from "../EmptyState";

export default function Asset() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showTypeSelection, setShowTypeSelection] = useState(true); // To toggle between type selection and form
  const [assignmentType, setAssignmentType] = useState<
    "HOMEWORK" | "QUIZ" | "DOCUMENT"
  >("HOMEWORK");
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [dueDate, setDueDate] = useState<string>("");
  const [file, setFile] = useState<File | null>(null); // State to hold file
  const [creatingAssignment, setCreatingAssignment] = useState(false);
  const { classroomId } = useParams();
  const { classroom, setClassroom } = useClassroomStore();
  const { user } = useAuthStore();
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<
    number | null
  >(null);
  const [editingAssignmentId, setEditingAssignmentId] = useState<number | null>(
    null
  );
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [isConfirmAttempOpen, setIsConfirmAttempOpen] = useState(false);
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
  const visibleMaterials =
    classroom?.assignments
      ?.slice()
      .sort(
        (a, b) =>
          new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      ) ?? [];

  const toggleCommentBox = (id: number) => {
    setVisibleCommentBox((prev) => (prev === id ? null : id));
  };
  const router = useRouter();

  const handleGoToAttemp = (quizId: number) => {
    router.push(`/quiz/${quizId}`);
  };

  // Handle assignment type selection
  const handleTypeSelection = (type: "HOMEWORK" | "QUIZ" | "DOCUMENT") => {
    setAssignmentType(type);
    setShowTypeSelection(false);
  };

  const resetAssignmentForm = () => {
    setTitle("");
    setDescription("");
    setDueDate("");
    setFile(null);
    setEditingAssignmentId(null);
    setAssignmentType("HOMEWORK");
    setShowTypeSelection(true);
  };

  const formatDateTimeLocal = (value: string | Date) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return offsetDate.toISOString().slice(0, 16);
  };

  const handleEditClick = (assignment: any) => {
    setEditingAssignmentId(assignment.id);
    setSelectedAssignmentId(assignment.id);
    setAssignmentType(assignment.type);
    setTitle(assignment.title ?? "");
    setDescription(assignment.description ?? "");
    setDueDate(formatDateTimeLocal(assignment.dueDate));
    setFile(null);
    setShowTypeSelection(false);
    setIsModalOpen(true);
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
  const handleSaveAssignment = async () => {
    if (creatingAssignment) return;
    setCreatingAssignment(true);
    try {
      let fileUrl = "";

      if (file) {
        fileUrl = await uploadService.uploadFile(file);
      }

      const res = editingAssignmentId
        ? await assignmentService.updateAssignment(editingAssignmentId, {
            title,
            description,
            dueDate: new Date(dueDate),
            type: assignmentType,
            ...(fileUrl ? { fileUrl } : {}),
          })
        : await assignmentService.createAssignment({
            title,
            description,
            dueDate: new Date(dueDate),
            classroomId: Number(classroomId),
            type: assignmentType,
            fileUrl,
          });

      if (res) {
        await handleGetClassroomDetail();
        setIsModalOpen(false);
        resetAssignmentForm();
      }
    } finally {
      setCreatingAssignment(false);
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

        const userIds = [];
        if (typeof replyInfo.userId === "number" && replyInfo.userId !== -1) {
          userIds.push(replyInfo.userId);
        }

        if (
          classroom?.creatorId !== user?.id &&
          typeof classroom?.creatorId === "number"
        ) {
          userIds.push(classroom.creatorId);
        }

        socket?.emit("createAnnouncement", {
          title: "Bình luận mới",
          content: `Lớp học "${classroom?.name}" có bình luận mới: ${newComment}`,
          senderId: user?.id,
          href: `/teaching/${classroom?.id}`,
          userIds,
        });
      }

      setNewComment("");
      setReplyInfo({ id: undefined, email: null, userId: -1 });
      isEdit(false);
    } catch (error) {
      console.error("Failed to post comment", error);
    }
  };

  const findRootCommentId = (comments: any[], comment: Comment) => {
    let current = comment;
    while (current.parentId) {
      current = comments.find((c) => c.id === current.parentId);
    }
    return current?.id;
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

  return (
    <div className="space-y-5">
      <section className="detail-panel p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">
              Learning materials
            </p>
            <h2 className="mt-1 text-xl font-bold text-slate-950">
              {t("assetsComponent.assignment")}
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Documents, homework and quizzes shared with this classroom.
            </p>
          </div>
          {classroom?.creatorId === user?.id && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg bg-[#0d3f2a] px-4 text-sm font-bold text-white shadow-sm transition hover:bg-[#0a3322]"
            >
              <Plus className="h-4 w-4" />
              New material
            </button>
          )}
        </div>
      </section>

      {/* Display assignments */}
      <div className="space-y-4">
        {visibleMaterials.length === 0 && (
          <EmptyState
            compact
            icon={FileText}
            eyebrow="No materials"
            title="No materials yet"
            description="Upload a document or create a classroom activity to start building the lesson stream."
            actionLabel={
              classroom?.creatorId === user?.id ? "New material" : undefined
            }
            onAction={() => setIsModalOpen(true)}
          />
        )}
        {visibleMaterials.map((assignment) => (
            <div
              key={assignment.id}
              className="grid grid-cols-1 overflow-hidden rounded-xl border border-emerald-100 bg-white shadow-sm transition hover:border-emerald-200 hover:shadow-md md:grid-cols-12"
            >
              <div className="col-span-12 p-5 pb-0">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <h3 className="text-xl font-bold text-slate-950">{assignment.title}</h3>
                  {/* Badge for assignment type */}
                  <span
                    className={`w-fit rounded-full px-2.5 py-1 text-xs font-bold ${
                      assignment.type === "HOMEWORK"
                        ? "bg-orange-100 text-orange-700"
                        : assignment.type === "QUIZ"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-emerald-100 text-emerald-800"
                    }`}
                  >
                    {assignment.type}
                  </span>
                </div>
              </div>
              <div className="col-span-12 p-5 md:col-span-8">
                <div>
                  <p className="mt-2">{assignment.description}</p>
                  <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm font-medium text-slate-500">
                      {t("assetsComponent.dueDate")}:{" "}
                      {new Date(assignment.dueDate).toLocaleString()}
                    </p>
                    <button
                      onClick={() => toggleCommentBox(assignment.id)}
                      className="w-fit cursor-pointer rounded-full bg-sky-50 px-3 py-1 text-sm font-bold text-sky-700 transition hover:bg-sky-100"
                    >
                      💬 {assignment.comments.length}{" "}
                      {t("assetsComponent.comments")}
                    </button>
                  </div>
                  {visibleCommentBox === assignment.id && (
                    <div className="mt-2">
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
                                className="flex items-start space-x-2 overflow-x-auto sm:overflow-x-visible"
                              >
                                {/* Avatar người comment gốc */}
                                <Avatar
                                  rounded
                                  img={comment.user.avatar}
                                  className="w-10 h-10 rounded-full"
                                />
                                <div className="flex-1 md:ml-1">
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
                                        className="flex items-start space-x-2 mt-3 md:ml-6 md:pl-2 border-gray-300"
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
                                                reply.id,
                                                reply.user.email,
                                                reply.user?.id
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
                            {edit ? "Cập nhật" : "Gửi"}
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
                </div>
              </div>
              <div className="col-span-12 border-t border-emerald-100 bg-[#eef7ef] p-5 md:col-span-4 md:border-l md:border-t-0">
                <p className="mb-3 text-xs font-bold uppercase tracking-wide text-emerald-700">
                  {t("actions")}
                </p>
                <div className="flex flex-wrap justify-end gap-2">
                  {assignment.fileUrl && (
                    <a
                      href={assignment.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-10 items-center rounded-lg bg-sky-600 px-3 text-sm font-bold text-white transition hover:bg-sky-700"
                    >
                      {t("attached")}
                    </a>
                  )}
                  {assignment.type === AssignmentType.HOMEWORK &&
                    classroom?.creatorId !== user?.id && (
                      <LewisButton
                        className="ml-2"
                        space={false}
                        lewisSize="small"
                      >
                        {t("submit")}
                      </LewisButton>
                    )}
                  {assignment.type === AssignmentType.QUIZ &&
                    classroom?.creatorId !== user?.id && (
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
                  {assignment.type === AssignmentType.QUIZ &&
                    classroom?.creatorId === user?.id && (
                      <LewisButton
                        className="ml-2"
                        space={false}
                        lewisSize="small"
                        color="pink"
                      >
                        {t("review")}
                      </LewisButton>
                    )}
                  {classroom?.creatorId === user?.id && (
                    <>
                      <LewisButton
                        color="yellow"
                        className="ml-2"
                        space={false}
                        lewisSize="small"
                        onClick={() => handleEditClick(assignment)}
                      >
                        {t("edit")}
                      </LewisButton>
                      <LewisButton
                        color="red"
                        className="ml-2"
                        space={false}
                        lewisSize="small"
                        onClick={() => {
                          setSelectedAssignmentId(assignment.id);
                          setIsConfirmDeleteOpen(true);
                        }}
                      >
                        {t("delete")}
                      </LewisButton>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
      </div>

      {/* MODAL ADD ASSIGNMENT */}
      <Modal
        show={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetAssignmentForm();
        }}
      >
        <ModalHeader className="modal-titlebar">
          <div>
            <h2 className="text-base font-bold text-slate-950">
              {showTypeSelection
                ? "Select material type"
                : editingAssignmentId
                  ? "Edit material"
                  : "Create material"}
            </h2>
            <p className="mt-1 text-xs font-normal text-slate-500">
              Choose how this classroom resource should appear to students.
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
                {t("assetsComponent.homework")}
              </Button>
              <Button
                color="none"
                href={`/quiz-creatory/${classroomId}`}
                className="h-24 w-full flex-col items-start justify-between rounded-xl border border-emerald-200 bg-[#f7fbf7] px-4 py-4 text-left font-bold text-slate-900 shadow-sm hover:border-emerald-300 hover:bg-emerald-50"
              >
                {t("assetsComponent.quiz")}
              </Button>
              <Button
                color="none"
                onClick={() => handleTypeSelection("DOCUMENT")}
                className="h-24 w-full flex-col items-start justify-between rounded-xl border border-emerald-200 bg-[#f7fbf7] px-4 py-4 text-left font-bold text-slate-900 shadow-sm hover:border-emerald-300 hover:bg-emerald-50"
              >
                {t("assetsComponent.document")}
              </Button>
            </div>
          ) : (
            // Step 2: Show form for selected assignment type
            <div>
              {/* Title */}
              <div className="mb-4">
                <label className="block text-sm font-medium">Title</label>
                <LewisTextInput
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-2"
                />
              </div>

              {/* Description */}
              <div className="mb-4">
                <label className="block text-sm font-medium">Description</label>
                <LewisTextInput
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-2"
                />
              </div>

              {/* Due Date */}
              <div className="mb-4">
                <label className="block text-sm font-medium">Due Date</label>
                <input
                  type="datetime-local" // Change from "date" to "datetime-local"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="mt-2 block h-11 w-full rounded-xl border border-slate-200 bg-[#f7fbf7] px-3 text-sm font-medium outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              {/* File Upload */}
              <div className="mb-4">
                <label className="block text-sm font-medium">Upload File</label>
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
              <LoadingButton
                loading={creatingAssignment}
                loadingText={editingAssignmentId ? "Saving..." : "Creating..."}
                onClick={handleSaveAssignment}
              >
                {editingAssignmentId ? t("save") || "Save" : t("create")}
              </LoadingButton>
              <Button
                color="gray"
                onClick={() =>
                  editingAssignmentId ? resetAssignmentForm() : setShowTypeSelection(true)
                }
                disabled={creatingAssignment}
              >
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
          <p>
            Are you sure you want to delete this material? This action cannot be
            undone.
          </p>
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
            Delete material
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
          <p>{t("assetsComponent.confirmAttemp")}</p>
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
    </div>
  );
}
