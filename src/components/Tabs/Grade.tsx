import { useState } from "react";
import {
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "flowbite-react";
import { useRouter } from "next/navigation";
import { useClassroomStore } from "~/store/classroomStore";
import { AssignmentType } from "~/models/AssignmentType";
import LewisButton from "../partial/LewisButton";
import { useAuthStore } from "~/store/authStore";
import { submissionService } from "~/services/submissionService";
import { useSubmissionStore } from "~/store/submissionStore";
import Submission from "~/models/Submission";

export default function Grade() {
  const { classroom } = useClassroomStore();
  const { user } = useAuthStore();
  const router = useRouter();
  const [isViewSubmissionOpen, setIsViewSubmissionOpen] = useState(false);
  const { submissions, setSubmissions, setSubmission } = useSubmissionStore();

  const handleViewSubmissions = async (assignmentId: number) => {
    const res = await submissionService.getSubmissionOfAssignment(assignmentId);
    setSubmissions(res);
    setIsViewSubmissionOpen(true);
  };

  return (
    <div>
      <div className="flex flex-col items-start">
        <div className="flex justify-between items-center w-full">
          <h2 className="text-xl font-semibold">Grade</h2>
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
          .map((assignment) => (
            <div
              key={assignment.id}
              className="grid grid-cols-12 p-4 border border-green-500 rounded-lg shadow-md"
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
              <div className="col-span-8">
                <div>
                  <p className="mt-2">{assignment.description}</p>
                  <p className="mt-2 text-sm text-gray-500">
                    Due Date: {new Date(assignment.dueDate).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="col-span-4 mt-4">
                <div className="flex justify-end items-center">
                  {assignment.fileUrl && (
                    <a
                      href={assignment.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm inline-block bg-blue-600 hover:bg-blue-500 text-white py-2.5 px-4 rounded-md"
                    >
                      Attached
                    </a>
                  )}
                  {assignment.type === AssignmentType.QUIZ &&
                    classroom.creatorId === user.id && (
                      <LewisButton
                        className="ml-2"
                        space={false}
                        lewisSize="small"
                        color="pink"
                      >
                        Review
                      </LewisButton>
                    )}
                  {classroom.creatorId === user.id && (
                    <LewisButton
                      className="ml-2 text-sm"
                      space={false}
                      onClick={() => handleViewSubmissions(assignment.id)}
                    >
                      Submission
                    </LewisButton>
                  )}
                </div>
              </div>
            </div>
          ))}
      </div>

      <Modal
        show={isViewSubmissionOpen}
        onClose={() => setIsViewSubmissionOpen(false)}
      >
        <ModalHeader className="bg-green">Bài làm đã nộp</ModalHeader>
        <ModalBody>
          {submissions?.length === 0 ? (
            <p>Chưa có bài nộp nào.</p>
          ) : (
            <ul className="space-y-2">
              {submissions?.map((s: Submission) => (
                <li key={s.id} className="flex justify-between items-center">
                  <span>
                    {s.user?.name + " (" + s.user.email + ")" ||
                      `Sinh viên ${s.userId}`}
                  </span>
                  <button
                    onClick={() => {
                      if (s.assignment.type === AssignmentType.HOMEWORK) {
                        router.push(s.fileUrl);
                      } else {
                        setSubmission(s);
                        router.push(`/result/${s.id}`);
                      }
                    }}
                    className="cursor-pointer text-sm text-blue-600 hover:underline"
                  >
                    View
                  </button>
                </li>
              ))}
            </ul>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="gray" onClick={() => setIsViewSubmissionOpen(false)}>
            Đóng
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
