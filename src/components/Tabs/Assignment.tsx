import { useState } from "react";
import { FaPlus } from "react-icons/fa";
import {
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
import { submissionService } from "~/services/submissionService";
import Assignment from "~/models/Assignment";

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

  const handleSubmitHomework = async () => {
    if (!file || selectedAssignmentId === null || !user) return;
    try {
      setUploading(true);
      const fileUrl = await uploadService.uploadFile(file);
      await submissionService.createSubmission({
        assignmentId: selectedAssignmentId,
        fileUrl,
        userId: user.id,
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

  return (
    <div>
      <div className="flex flex-col items-start">
        <div className="flex justify-between items-center w-full">
          <h2 className="text-xl font-semibold">Assignment</h2>
          {classroom?.creatorId === user.id && (
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
          .filter((c: Assignment) => c.type !== AssignmentType.DOCUMENT)
          .sort(
            (a, b) =>
              new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
          )
          .map((assignment) => {
            const submission = assignment.submissions.find(
              (s) => s.userId === user?.id
            );
            const isSubmitted = !!submission;

            return (
              <div
                key={assignment.id}
                className="grid grid-cols-12 rounded-lg shadow-md"
              >
                <div className="col-span-8 mr-4 p-6">
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
                    Due Date: {new Date(assignment.dueDate).toLocaleString()}
                  </p>
                  {isSubmitted && (
                    <div className="mt-2 text-sm text-green-700">
                      ✅ Submitted
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
                          View File
                        </a>
                      )}
                      <span className="ml-4 font-bold">
                        Score:{" "}
                        {submission.grade === null
                          ? "Chưa có điểm"
                          : submission.grade}
                      </span>
                    </div>
                  )}
                </div>

                <div className="col-span-4 px-6 bg-white border-l-2 border-l-green-500">
                  <h4 className="text-center font-bold text-green m-6">
                    Actions
                  </h4>
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
                          {!isSubmitted ? "Upload" : "Re-Submit"}
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
                          Attempt
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
                Homework
              </Button>
              <Button href={`/quiz-creatory/${classroomId}`} className="w-full">
                Quiz
              </Button>
              <Button
                onClick={() => handleTypeSelection("DOCUMENT")}
                className="w-full"
              >
                Document
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
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="block w-full mt-4 text-sm file:bg-green-700 text-gray-500 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:bg-green file:text-white hover:file:bg-green-600"
                />
              </div>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          {showTypeSelection ? (
            <Button className="bg-green" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
          ) : (
            <>
              <Button className="bg-green" onClick={handleCreateAssignment}>
                Create Assignment
              </Button>
              <Button color="gray" onClick={() => setShowTypeSelection(true)}>
                Cancel
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
          Confirm Delete
        </ModalHeader>
        <ModalBody>
          <p>Are you sure you want to delete this assignment?</p>
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
            Yes, Delete
          </Button>
          <Button color="gray" onClick={() => setIsConfirmDeleteOpen(false)}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>

      {/* MODAL ATTEMP */}
      <Modal
        show={isConfirmAttempOpen}
        onClose={() => setIsConfirmAttempOpen(false)}
      >
        <ModalHeader className="bg-blue-500 text-white">
          Confirm Attemp
        </ModalHeader>
        <ModalBody>
          <p>Are you sure you want to attemp this assignment?</p>
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
            Yes
          </Button>
          <Button color="gray" onClick={() => setIsConfirmAttempOpen(false)}>
            Cancel
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
          Submit Homework
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
            {uploading ? "Uploading..." : "Submit"}
          </Button>
          <Button color="gray" onClick={() => setIsSubmitModalOpen(false)}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
