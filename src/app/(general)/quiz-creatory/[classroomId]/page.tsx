/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import LewisTextInput from "~/components/Partial/LewisTextInput";
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Breadcrumb,
  BreadcrumbItem,
} from "flowbite-react";
import { assignmentService } from "~/services/assignmentService";
import { uploadService } from "~/services/uploadService";
import { toast } from "react-toastify";
import { useClassroomStore } from "~/store/classroomStore";

export default function QuizCreatoryPage() {
  const { classroomId } = useParams();
  const { classroom } = useClassroomStore();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [questions, setQuestions] = useState([
    {
      questionText: "",
      options: ["", "", "", ""],
      correctAnswer: "",
      showCorrectAnswer: false,
    },
  ]);
  const [showResult, setShowResult] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null); // State to hold file

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        questionText: "",
        options: ["", "", "", ""],
        correctAnswer: "",
        showCorrectAnswer: showResult,
      },
    ]);
  };

  const handleQuestionChange = (
    index: number,
    key: "questionText" | "correctAnswer" | "options",
    value: any
  ) => {
    setQuestions((prev) =>
      prev?.map((q, i) =>
        i === index
          ? {
              ...q,
              [key]: key === "options" ? [...value] : value,
            }
          : q
      )
    );
  };

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]); // Set the selected file
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) return toast.error("Title is required.");
    if (!dueDate) return toast.error("Due date is required.");
    if (!questions.length)
      return toast.error("At least one question is required.");

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.questionText.trim())
        return toast.error(`Question ${i + 1} is missing.`);
      if (q.options.some((opt) => !opt.trim())) {
        return toast.error(`All options for Question ${i + 1} are required.`);
      }
      if (!["A", "B", "C", "D"].includes(q.correctAnswer)) {
        return toast.error(
          `Question ${i + 1} must have a correct answer selected.`
        );
      }
    }
    let fileUrl = "";

    if (file) {
      fileUrl = await uploadService.uploadFile(file);
    }
    const latestQuestions = [...questions];
    try {
      await assignmentService.createAssignment({
        classroomId: Number(classroomId),
        title,
        description,
        dueDate: new Date(dueDate),
        type: "QUIZ",
        questions: latestQuestions,
        fileUrl,
      });

      router.push(`/teaching/${classroomId}`);
    } catch (error) {
      alert("Failed to create quiz");
      console.error(error);
    }
  };

  return (
    <div className="w-full mx-auto p-6 space-y-6">
      <Breadcrumb aria-label="Breadcrumb" className="mb-4">
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem href="/teaching">Teaching</BreadcrumbItem>
        <BreadcrumbItem>{classroom?.name}</BreadcrumbItem>
      </Breadcrumb>
      {/* MODAL ADD ASSIGNMENT */}
      <Modal show={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <ModalHeader className="bg-green">{"Create Assignment"}</ModalHeader>
        <ModalBody>
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
        </ModalBody>
        <ModalFooter>
          <>
            <Button className="bg-green" onClick={handleSubmit}>
              Create Assignment
            </Button>
            <Button color="gray" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
          </>
        </ModalFooter>
      </Modal>
      <h1 className="text-2xl font-bold">Create Quiz</h1>
      <Button
        color={showResult ? "success" : "gray"}
        onClick={() => setShowResult(!showResult)}
      >
        {showResult ? "Show answer" : "Hide answer"}
      </Button>

      <div className="space-y-6">
        {questions?.map((q, i) => (
          <div
            key={i}
            className="p-4 border border-green-500 rounded space-y-2"
          >
            <LewisTextInput
              placeholder={`Question ${i + 1}`}
              value={q.questionText}
              onChange={(e) =>
                handleQuestionChange(i, "questionText", e.target.value)
              }
            />
            {["A", "B", "C", "D"]?.map((label, j) => (
              <div key={j} className="flex items-center gap-2">
                <input
                  type="radio"
                  name={`correct-${i}`}
                  aria-label={label}
                  value={label}
                  checked={q.correctAnswer === label}
                  onChange={() =>
                    handleQuestionChange(i, "correctAnswer", label)
                  }
                />
                <LewisTextInput
                  placeholder={`Option ${label}`}
                  value={q.options[j]}
                  onChange={(e) => {
                    const newOptions = [...q.options];
                    newOptions[j] = e.target.value;
                    handleQuestionChange(i, "options", newOptions);
                  }}
                />
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <Button onClick={handleAddQuestion}>Add Question</Button>
        <Button
          className="bg-green text-white"
          onClick={() => setIsModalOpen(true)}
        >
          Create
        </Button>
      </div>
    </div>
  );
}
