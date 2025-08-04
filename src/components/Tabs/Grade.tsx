import { useState } from "react";
import {
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "flowbite-react";
import { useParams, useRouter } from "next/navigation";
import { useClassroomStore } from "~/store/classroomStore";
import { AssignmentType } from "~/models/AssignmentType";
import LewisButton from "../Partial/LewisButton";
import { useAuthStore } from "~/store/authStore";
import { submissionService } from "~/services/submissionService";
import { useSubmissionStore } from "~/store/submissionStore";
import Submission from "~/models/Submission";
import { classroomService } from "~/services/classroomService";
import LewisTextInput from "../Partial/LewisTextInput";
import { useTranslation } from "react-i18next";

export default function Grade() {
  const { classroom } = useClassroomStore();
  const { user } = useAuthStore();
  const router = useRouter();
  const [isViewSubmissionOpen, setIsViewSubmissionOpen] = useState(false);
  const { submissions, setSubmissions } = useSubmissionStore();
  const { setClassroom } = useClassroomStore();
  const [grade, setGrade] = useState(0);
  const [gradingSubmission, setGradingSubmission] = useState<Submission | null>(
    null
  );
  const [isGradingModalOpen, setIsGradingModalOpen] = useState(false);
  const { classroomId } = useParams();
  const { t } = useTranslation();

  const handleViewSubmissions = async (assignmentId: number) => {
    const res = await submissionService.getSubmissionOfAssignment(assignmentId);
    setSubmissions(res);
    setIsViewSubmissionOpen(true);
  };

  const handleGrading = async (submission: Submission) => {
    await submissionService.gradeSubmission({
      id: submission?.id,
      grade,
    });

    const updatedSubmissions = submissions?.map((s) =>
      s?.id === submission?.id ? { ...s, grade: grade.toString() } : s
    );
    setSubmissions(updatedSubmissions);

    fetchClassroom();
  };

  const fetchClassroom = async () => {
    try {
      const res = await classroomService.getDetail(Number(classroomId));
      if (!res) {
        router.replace("/not-found");
        return;
      }
      setClassroom(res);
    } catch (error) {
      console.error("Error fetching classroom details:", error);
      router.replace("/not-found");
    }
  };

  return (
    <div>
      <div className="flex flex-col items-start">
        <div className="flex justify-between items-center w-full">
          <h2 className="text-xl font-semibold">{t("grade")}</h2>
        </div>
        <div className="w-full h-px bg-gray-700 my-4" />
      </div>

      {/* Display assignments */}
      <div className="space-y-4">
        {classroom?.assignments
          .filter((assignment) => assignment.type !== AssignmentType.DOCUMENT)
          .sort(
            (a, b) =>
              new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
          ) // Sorting by createdAt
          ?.map((assignment) => {
            const submissionCount = assignment?.submissions?.filter(
              (s: Submission) => s.assignmentId === assignment?.id
            ).length;

            const studentCount = classroom?.members?.filter(
              (m) => m.role === "STUDENT"
            ).length;

            return (
              <div
                key={assignment?.id}
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
                  <div className="mt-2 flex-col justify-between items-center">
                    <p className="text-sm text-gray-500">
                      {t("dueDate")}:{" "}
                      {new Date(assignment.dueDate).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500">
                      {t("gradeComponent.submit")}: {submissionCount} /{" "}
                      {studentCount}
                    </p>
                  </div>
                </div>

                <div className="col-span-12 md:col-span-4 px-6 mb-2 bg-white md:border-l-2 border-l-green-500">
                  <h4 className="text-center font-bold text-green m-6 hidden md:block">
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
                        {t("attached")}
                      </a>
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
                      <LewisButton
                        className="ml-2 text-sm"
                        space={false}
                        onClick={() => handleViewSubmissions(assignment?.id)}
                      >
                        {t("submission")}
                      </LewisButton>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
      </div>

      {/* Viewing modal */}
      <Modal
        show={isViewSubmissionOpen}
        onClose={() => setIsViewSubmissionOpen(false)}
      >
        <ModalHeader className="bg-green">
          {t("gradeComponent.submitted")} ({submissions.length} /{" "}
          {classroom?.members.filter((m) => m.role === "STUDENT").length})
        </ModalHeader>

        <ModalBody>
          <h2 className="font-semibold mb-2">Đã nộp ({submissions.length})</h2>
          {submissions.length === 0 ? (
            <p>{t("gradeComponent.nosubmitted")}</p>
          ) : (
            <ul className="space-y-2 mb-4">
              {submissions?.map((s: Submission) => {
                const submittedTime = new Date(s.submittedAt);
                const deadline = new Date(s.assignment.dueDate);
                const isLate = submittedTime > deadline;
                const grade = s.grade ?? t("gradeComponent.noscore");

                return (
                  <li key={s?.id} className="flex justify-between items-start">
                    <div>
                      <p>
                        {s.user?.name + " (" + s.user.email + ")" ||
                          `${t("student")} ${s.userId}`}
                      </p>
                      <p className="text-sm text-gray-500">
                        {t("gradeComponent.submittedAt")}:{" "}
                        {submittedTime.toLocaleString()}{" "}
                        <span
                          className={isLate ? "text-red-500" : "text-green-600"}
                        >
                          (
                          {isLate
                            ? t("gradeComponent.overdue")
                            : t("gradeComponent.ontime")}
                          )
                        </span>
                      </p>
                      <p className="text-sm text-gray-500">
                        {t("gradeComponent.score")}: {grade}
                      </p>
                    </div>
                    <div className="flex flex-col space-y-2">
                      {" "}
                      <a
                        target="_blank"
                        href={
                          s.assignment.type === AssignmentType.QUIZ
                            ? `/result/${s?.id}`
                            : `${s.fileUrl}`
                        }
                        rel="noopener noreferrer"
                        className="cursor-pointer text-sm text-blue-600 hover:underline"
                      >
                        {t("view")}
                      </a>
                      {s.grade === null && (
                        <button
                          onClick={() => {
                            setGradingSubmission(s);
                            setIsGradingModalOpen(true);
                            setGrade(0);
                          }}
                          className="cursor-pointer text-sm text-blue-600 hover:underline"
                        >
                          {t("mark")}
                        </button>
                      )}
                      {s.grade !== null &&
                        s.assignment.type !== AssignmentType.QUIZ && (
                          <button
                            onClick={() => {
                              setGradingSubmission(s);
                              setIsGradingModalOpen(true);
                              setGrade(Number(s.grade));
                            }}
                            className="cursor-pointer text-sm text-blue-600 hover:underline"
                          >
                            {t("remark")}
                          </button>
                        )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          {/* Divider */}
          <div className="flex items-center my-4">
            <div className="flex-grow h-px bg-gray-300" />
            <span className="px-4 text-sm text-gray-500 uppercase">
              {t("gradeComponent.havenotsubmitted")}
            </span>
            <div className="flex-grow h-px bg-gray-300" />
          </div>

          <h2 className="font-semibold mb-2">
            {t("gradeComponent.havenotsubmitted")} (
            {
              classroom?.members.filter(
                (m) =>
                  m.role === "STUDENT" &&
                  !submissions.some((s: Submission) => s.userId === m.userId)
              ).length
            }
            )
          </h2>
          <ul className="space-y-2">
            {classroom?.members
              .filter(
                (m) =>
                  m.role === "STUDENT" &&
                  !submissions.some((s: Submission) => s.userId === m.userId)
              )
              ?.map((m) => (
                <li key={m.userId} className="text-gray-600">
                  {m.user?.name + " (" + m.user.email + ")" ||
                    `${t("student")} ${m.userId}`}
                </li>
              ))}
          </ul>
        </ModalBody>

        <ModalFooter>
          <Button color="gray" onClick={() => setIsViewSubmissionOpen(false)}>
            {t("close")}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Grading modal */}
      <Modal
        show={isGradingModalOpen}
        onClose={() => setIsGradingModalOpen(false)}
      >
        <ModalHeader className="bg-green">{t("mark")}</ModalHeader>
        <ModalBody>
          <p>
            {t("student")}:{" "}
            <strong>
              {gradingSubmission?.user?.name} ({gradingSubmission?.user?.email})
            </strong>
          </p>
          <LewisTextInput
            type="number"
            value={grade}
            onChange={(e) => setGrade(Number(e.target.value))}
            min={0}
            max={10}
            placeholder={t("gradeComponent.enterMark")}
          />
        </ModalBody>
        <ModalFooter>
          <Button color="gray" onClick={() => setIsGradingModalOpen(false)}>
            {t("cancel")}
          </Button>
          <Button
            onClick={async () => {
              if (!gradingSubmission) return;
              await handleGrading(gradingSubmission);
              setIsGradingModalOpen(false);
              setIsViewSubmissionOpen(true);
            }}
          >
            {t("confirm")}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
