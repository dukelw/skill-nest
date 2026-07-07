import { useState } from "react";
import {
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "~/components/ui/primitives";
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
import EmptyState from "../EmptyState";
import { ClipboardCheck, FileCheck2 } from "lucide-react";

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

  const gradableAssignments =
    classroom?.assignments
      .filter((assignment) => assignment.type !== AssignmentType.DOCUMENT)
      .sort(
        (a, b) =>
          new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      ) ?? [];

  return (
    <div className="space-y-5">
      <section className="detail-panel p-5">
        <div className="flex justify-between items-center w-full">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">
              Review center
            </p>
            <h2 className="mt-1 text-xl font-bold text-slate-950">{t("grade")}</h2>
            <p className="mt-1 text-sm text-slate-600">
              Track submissions, late work and grading progress.
            </p>
          </div>
        </div>
      </section>

      {/* Display assignments */}
      <div className="space-y-4">
        {gradableAssignments.length === 0 && (
          <EmptyState
            compact
            icon={ClipboardCheck}
            eyebrow="No gradebook items"
            title="Nothing to grade yet"
            description="Assignments and quizzes will appear here once they are created for this class."
          />
        )}
        {gradableAssignments.map((assignment) => {
            const submissionCount = assignment?.submissions?.filter(
              (s: Submission) => s.assignmentId === assignment?.id
            ).length;

            const studentCount = classroom?.members?.filter(
              (m) => m.role === "STUDENT"
            ).length;

            return (
              <div
                key={assignment?.id}
                className="grid grid-cols-1 overflow-hidden rounded-xl border border-emerald-100 bg-white shadow-sm transition hover:border-emerald-200 hover:shadow-md md:grid-cols-12"
              >
                <div className="col-span-12 p-5 md:col-span-8">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <h3 className="text-xl font-bold text-slate-950">
                      {assignment.title}
                    </h3>
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
                  <p className="mt-2">{assignment.description}</p>
                  <div className="mt-4 grid gap-2 rounded-xl border border-slate-100 bg-[#f7fbf7] p-3 sm:grid-cols-2">
                    <p className="text-sm font-medium text-slate-500">
                      {t("dueDate")}:{" "}
                      {new Date(assignment.dueDate).toLocaleString()}
                    </p>
                    <p className="text-sm font-medium text-slate-500">
                      {t("gradeComponent.submit")}: {submissionCount} /{" "}
                      {studentCount}
                    </p>
                  </div>
                </div>

                <div className="col-span-12 border-t border-emerald-100 bg-[#eef7ef] p-5 md:col-span-4 md:border-l md:border-t-0">
                  <h4 className="mb-3 text-xs font-bold uppercase tracking-wide text-emerald-700">
                    {t("actions")}
                  </h4>
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
                    {assignment.type === AssignmentType.QUIZ &&
                      classroom?.creatorId === user?.id && (
                        <LewisButton
                          className=""
                          space={false}
                          lewisSize="small"
                          color="pink"
                        >
                          {t("review")}
                        </LewisButton>
                      )}
                    {classroom?.creatorId === user?.id && (
                      <LewisButton
                        className="text-sm"
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
        <ModalHeader className="modal-titlebar">
          <div>
            <h2 className="text-base font-bold text-slate-950">
              {t("gradeComponent.submitted")} ({submissions.length} /{" "}
              {classroom?.members.filter((m) => m.role === "STUDENT").length})
            </h2>
            <p className="mt-1 text-xs font-normal text-slate-500">
              Review uploads, scores and missing submissions.
            </p>
          </div>
        </ModalHeader>

        <ModalBody className="modal-body-pad">
          <h2 className="font-semibold mb-2">Đã nộp ({submissions.length})</h2>
          {submissions.length === 0 ? (
            <EmptyState
              compact
              icon={FileCheck2}
              eyebrow="No submissions"
              title={t("gradeComponent.nosubmitted")}
              description="Student submissions and grading actions will appear here after the first upload."
            />
          ) : (
            <ul className="space-y-2 mb-4">
              {submissions?.map((s: Submission) => {
                const submittedTime = new Date(s.submittedAt);
                const deadline = new Date(s.assignment.dueDate);
                const isLate = submittedTime > deadline;
                const grade = s.grade ?? t("gradeComponent.noscore");

                return (
              <li key={s?.id} className="flex justify-between items-start rounded-xl border border-slate-200 bg-[#f7fbf7] p-3">
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

        <ModalFooter className="modal-footer-actions">
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
        <ModalHeader className="modal-titlebar">
          <h2 className="text-base font-bold text-slate-950">{t("mark")}</h2>
        </ModalHeader>
        <ModalBody className="modal-body-pad">
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
        <ModalFooter className="modal-footer-actions">
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
