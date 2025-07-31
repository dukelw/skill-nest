/* eslint-disable @typescript-eslint/no-explicit-any */
import { Avatar, Dropdown } from "flowbite-react";
import LewisButton from "~/components/partial/LewisButton";
import Assignment from "~/models/Assignment";
import Submission from "~/models/Submission";
import { AssignmentType } from "~/models/AssignmentType";
import { useTranslation } from "react-i18next";

interface Props {
  assignment: Assignment;
  submission?: Submission;
  user: any;
  classroom: any;
  isSubmitted: boolean;
  visibleCommentBox: number | null;
  toggleCommentBox: (id: number) => void;
  findRootCommentId: (comments: any[], c: any) => number;
  replyInfo: { id?: number; email?: string | null; userId: number };
  setReplyInfo: (info: any) => void;
  newComment: string;
  setNewComment: (val: string) => void;
  handleCreateComment: (assignmentId: number) => void;
  handleEditComment: (comment: any) => void;
  deleteComment: (payload: {
    id: number;
    userId: number;
    classroomId: number;
  }) => void;
  setSelectedAssignmentId: (id: number) => void;
  setIsSubmitModalOpen: (val: boolean) => void;
  setIsConfirmAttempOpen: (val: boolean) => void;
  edit: boolean;
  isEdit: (val: boolean) => void;
  classroomId: string | number;
  key: number;
}

export default function AssignmentCard({
  assignment,
  submission,
  user,
  classroom,
  isSubmitted,
  visibleCommentBox,
  toggleCommentBox,
  findRootCommentId,
  replyInfo,
  setReplyInfo,
  newComment,
  setNewComment,
  handleCreateComment,
  handleEditComment,
  deleteComment,
  setSelectedAssignmentId,
  setIsSubmitModalOpen,
  setIsConfirmAttempOpen,
  edit,
  isEdit,
  classroomId,
  key,
}: Props) {
  const { t } = useTranslation();
  const isStudent = classroom.creatorId !== user?.id;

  return (
    <div key={key} className="grid grid-cols-12 rounded-lg shadow-md">
      {/* LEFT COLUMN */}
      <div className="col-span-8 mr-4 p-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">{assignment.title}</h3>
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
            💬 {assignment.comments.length} {t("assignmentComponent.comments")}
          </button>
        </div>

        {/* COMMENTS */}
        {visibleCommentBox === assignment.id && (
          <div className="mt-2">
            <div className="mt-4 space-y-3">
              {assignment.comments
                .filter((c) => !c.parentId)
                .map((comment) => {
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
                          {new Date(comment.createdAt).toLocaleString()}
                        </div>

                        <button
                          onClick={() =>
                            setReplyInfo({
                              id: comment.id,
                              email: comment.user.email,
                              userId: comment.user?.id,
                            })
                          }
                          className="cursor-pointer text-blue-500 text-xs hover:underline mt-1"
                        >
                          {t("reply")}
                        </button>
                        {comment.user?.id === user?.id && (
                          <>
                            <button
                              onClick={() => handleEditComment(comment)}
                              className="cursor-pointer ml-4 text-yellow-500 text-xs hover:underline mt-1"
                            >
                              {t("edit")}
                            </button>
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
                          </>
                        )}

                        {/* Replies */}
                        {replies.map((reply) => {
                          const parent = assignment.comments.find(
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
                                    {t("reply")} @{parent?.user.email}
                                  </span>
                                  {reply.content}
                                </div>
                                <div className="text-[10px] text-gray-400">
                                  {new Date(reply.createdAt).toLocaleString()}
                                </div>
                                <button
                                  onClick={() =>
                                    setReplyInfo({
                                      id: comment.id,
                                      email: comment.user.email,
                                      userId: comment.user?.id,
                                    })
                                  }
                                  className="text-blue-500 text-xs hover:underline mt-1"
                                >
                                  {t("reply")}
                                </button>
                                {reply.user?.id === user?.id && (
                                  <>
                                    <button
                                      onClick={() => handleEditComment(reply)}
                                      className="cursor-pointer ml-4 text-yellow-500 text-xs hover:underline mt-1"
                                    >
                                      {t("edit")}
                                    </button>
                                    <button
                                      onClick={() =>
                                        deleteComment({
                                          id: reply.id,
                                          userId: user?.id,
                                          classroomId: Number(classroomId),
                                        })
                                      }
                                      className="cursor-pointer ml-4 text-red-500 text-xs hover:underline mt-1"
                                    >
                                      {t("delete")}
                                    </button>
                                  </>
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

            {/* Comment input */}
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
                      setReplyInfo({ id: undefined, email: null, userId: -1 });
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

        {/* SUBMISSION INFO */}
        {isSubmitted && submission && (
          <div className="mt-2 text-sm text-green-700">
            ✅ {t("submitted")}
            {submission.fileUrl && (
              <a
                href={
                  assignment.type === AssignmentType.QUIZ
                    ? `/result/${submission.id}`
                    : submission.fileUrl
                }
                target="_blank"
                rel="noopener noreferrer"
                className="ml-4 underline text-blue-600"
              >
                {t("viewFile")}
              </a>
            )}
            <span className="ml-4 font-bold">
              {t("assignmentComponent.score")}:{" "}
              {submission.grade === null
                ? t("assignmentComponent.noScore")
                : submission.grade}
            </span>
          </div>
        )}
      </div>

      {/* RIGHT COLUMN: Actions */}
      <div className="col-span-4 px-6 bg-white border-l-2 border-l-green-500">
        <h4 className="text-center font-bold text-green m-6">{t("actions")}</h4>

        {/* Desktop */}
        <div className="hidden md:flex justify-end items-center">
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
            isStudent &&
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

          {assignment.type === AssignmentType.QUIZ &&
            isStudent &&
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
}
