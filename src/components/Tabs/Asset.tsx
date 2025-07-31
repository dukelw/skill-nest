/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa";
import {
  Avatar,
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "flowbite-react";
import { useParams, useRouter } from "next/navigation";
import { assignmentService } from "~/services/assignmentService";
import { uploadService } from "~/services/uploadService"; // Import the uploadService
import LewisTextInput from "../partial/LewisTextInput";
import { classroomService } from "~/services/classroomService";
import { useClassroomStore } from "~/store/classroomStore";
import { AssignmentType } from "~/models/AssignmentType";
import LewisButton from "../partial/LewisButton";
import { useAuthStore } from "~/store/authStore";
import useComments from "~/hooks/useComments";
import useSocket from "~/hooks/useSocket";
import Comment from "~/models/Comment";
import { useTranslation } from "react-i18next";

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
  const { classroomId } = useParams();
  const { classroom, setClassroom } = useClassroomStore();
  const { user } = useAuthStore();
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<
    number | null
  >(null);
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
    <div>
      <div className="flex flex-col items-start">
        <div className="flex justify-between items-center w-full">
          <h2 className="text-xl font-semibold">
            {t("assetsComponent.assignment")}
          </h2>
          {classroom?.creatorId === user?.id && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="rounded-full flex items-center justify-center w-10 h-10 text-green bg-transparent hover:bg-green-500/10 transition-colors duration-200"
            >
              <FaPlus />
            </button>
          )}
        </div>
        <div className="w-full h-px bg-gray-700 my-4" />
      </div>

      {/* Display assignments */}
      <div className="space-y-4">
        {classroom?.assignments
          .sort(
            (a, b) =>
              new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
          ) // Sorting by createdAt
          ?.map((assignment) => (
            <div
              key={assignment.id}
              className="grid grid-cols-1 md:grid-cols-12 p-4 border border-green-500 rounded-lg shadow-md"
            >
              <div className="col-span-12">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">{assignment.title}</h3>
                  {/* Badge for assignment type */}
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
              </div>
              <div className="col-span-12 md:col-span-8">
                <div>
                  <p className="mt-2">{assignment.description}</p>
                  <div className="flex items-center justify-between mt-2">
                    <p className="mt-2 text-sm text-gray-500">
                      {t("assetsComponent.dueDate")}:{" "}
                      {new Date(assignment.dueDate).toLocaleString()}
                    </p>
                    <button
                      onClick={() => toggleCommentBox(assignment.id)}
                      className="text-blue-600 hover:underline text-sm"
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
              <div className="col-span-12 md:col-span-4 mt-4">
                <div className="flex justify-end items-center overflow-x-auto">
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
                  {assignment.type === AssignmentType.HOMEWORK &&
                    classroom.creatorId !== user?.id && (
                      <LewisButton
                        className="ml-2"
                        space={false}
                        lewisSize="small"
                      >
                        {t("submit")}
                      </LewisButton>
                    )}
                  {assignment.type === AssignmentType.QUIZ &&
                    classroom.creatorId !== user?.id && (
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
                    classroom.creatorId === user?.id && (
                      <LewisButton
                        className="ml-2"
                        space={false}
                        lewisSize="small"
                        color="pink"
                      >
                        {t("review")}
                      </LewisButton>
                    )}
                  {classroom.creatorId === user?.id && (
                    <>
                      <LewisButton
                        color="yellow"
                        className="ml-2"
                        space={false}
                        lewisSize="small"
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
      <Modal show={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <ModalHeader className="bg-green">
          {showTypeSelection ? "Select Assignment Type" : "Create Assignment"}
        </ModalHeader>
        <ModalBody>
          {/* Step 1: Show type selection */}
          {showTypeSelection ? (
            <div className="flex flex-col space-y-4">
              <Button
                onClick={() => handleTypeSelection("HOMEWORK")}
                className="w-full"
              >
                {t("assetsComponent.homework")}
              </Button>
              <Button href={`/quiz-creatory/${classroomId}`} className="w-full">
                {t("assetsComponent.quiz")}
              </Button>
              <Button
                onClick={() => handleTypeSelection("DOCUMENT")}
                className="w-full"
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
                  className="block w-full mt-2 border rounded-md p-2"
                />
              </div>

              {/* File Upload */}
              <div className="mb-4">
                <label className="block text-sm font-medium">Upload File</label>
                <LewisTextInput
                  type="file"
                  onChange={handleFileChange}
                  className="block w-full mt-2"
                />
              </div>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          {showTypeSelection ? (
            <Button className="bg-green" onClick={() => setIsModalOpen(false)}>
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
          <p>{t("confirmStatement")}</p>
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
