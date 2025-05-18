"use client";

import { Button } from "flowbite-react";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { assignmentService } from "~/services/assignmentService";
import { submissionService } from "~/services/submissionService";
import { useAssignmentStore } from "~/store/assignmentStore";
import { useAuthStore } from "~/store/authStore";

export default function Quiz() {
  const { assignment, setAssignment } = useAssignmentStore();
  const { quizId } = useParams();
  const [answers, setAnswers] = useState<{ [questionId: number]: string }>({});
  const [errors, setErrors] = useState<number[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [markedQuestions, setMarkedQuestions] = useState<number[]>([]);
  const { user } = useAuthStore();

  const alphaAnswers = ["A", "B", "C", "D"];

  const handleOptionSelect = (questionId: number, option: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
    setErrors((prev) => prev.filter((id) => id !== questionId));
  };

  const toggleMark = (questionId: number) => {
    setMarkedQuestions((prev) =>
      prev.includes(questionId)
        ? prev.filter((id) => id !== questionId)
        : [...prev, questionId]
    );
  };

  const handleSubmit = async () => {
    const unanswered =
      assignment?.questions.filter((q) => !answers[q.id])?.map((q) => q.id) ||
      [];

    if (unanswered.length > 0) {
      setErrors(unanswered);
      return;
    }

    let correctCount = 0;
    assignment?.questions.forEach((q) => {
      const selected = answers[q.id];
      if (selected === q.correctAnswer) correctCount++;
    });

    const totalQuestions = assignment?.questions?.length ?? 0;
    const grade = totalQuestions ? (correctCount * 10) / totalQuestions : 0;

    if (!assignment?.id) return;

    const answerString = Object.entries(answers)
      ?.map(([qid, ans]) => `${qid}:${ans}`)
      .join(";");

    await submissionService.createSubmission({
      assignmentId: assignment.id,
      userId: user.id,
      fileUrl: answerString,
      grade,
    });

    setScore(correctCount);
    setSubmitted(true);
  };

  const handleGetAssignment = async () => {
    const res = await assignmentService.getAssignmentById(Number(quizId));
    console.log("assi", res);
    setAssignment(res);
  };

  useEffect(() => {
    handleGetAssignment();
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 p-6 gap-4">
      {/* LEFT: Questions */}
      <div className="lg:col-span-9">
        <h2 className="text-2xl font-semibold mb-4">
          {assignment?.title || "Bài kiểm tra"}
        </h2>

        {assignment?.questions?.map((q, index) => {
          const userAnswer = answers[q.id];
          const isCorrect = userAnswer === q.correctAnswer;
          const isSubmitted = submitted;
          const showAnswer = submitted && q.showCorrectAnswer;

          let questionBg = "";
          if (isSubmitted && userAnswer) {
            questionBg = isCorrect
              ? "bg-green-200 border border-green-600"
              : "bg-red-200 border border-red-600";
          }

          return (
            <div
              key={q.id}
              id={`question-${q.id}`}
              className={`mb-6 p-4 rounded scroll-mt-24 ${questionBg}`}
            >
              <p className="font-medium mb-2">
                {index + 1}. {q.questionText}
              </p>

              <div className="space-y-2">
                {q.options?.map((opt: string, i: number) => (
                  <label key={i} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name={`question-${q.id}`}
                      value={opt}
                      disabled={submitted}
                      checked={answers[q.id] === alphaAnswers[i]}
                      onChange={() => handleOptionSelect(q.id, alphaAnswers[i])}
                      className="accent-blue-500"
                    />
                    {opt}
                  </label>
                ))}
              </div>

              <div className="mt-2">
                <button
                  onClick={() => toggleMark(q.id)}
                  className={`text-sm px-3 py-1 rounded border ${
                    markedQuestions.includes(q.id)
                      ? "bg-yellow-100 text-yellow-600 border-yellow-400"
                      : "bg-gray-100 text-gray-700 border-gray-300"
                  }`}
                >
                  {markedQuestions.includes(q.id)
                    ? "★ Đã đánh dấu"
                    : "☆ Đánh dấu xem lại"}
                </button>
              </div>

              {errors.includes(q.id) && (
                <p className="text-red-500 text-sm mt-1">
                  ❗ Vui lòng chọn một đáp án cho câu hỏi này.
                </p>
              )}

              {showAnswer && !isCorrect && (
                <p className="text-sm mt-2 text-green-700">
                  Đáp án đúng: <strong>{q.correctAnswer}</strong>
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* RIGHT: Quick navigation */}
      <div className="lg:col-span-3 sticky top-6 h-fit">
        <h3 className="font-semibold mb-2">Danh sách câu hỏi</h3>
        <div className="grid grid-cols-5 gap-2">
          {assignment?.questions?.map((q, index) => {
            let color = "bg-gray-300"; // default

            if (submitted) {
              const isCorrect = answers[q.id] === q.correctAnswer;
              color = isCorrect
                ? "bg-green-600 text-white"
                : "bg-red-600 text-white";
            } else {
              if (answers[q.id]) color = "bg-blue-500 text-white";
              if (markedQuestions.includes(q.id))
                color = "bg-orange-500 text-white";
            }

            return (
              <button
                key={q.id}
                onClick={() =>
                  document
                    .getElementById(`question-${q.id}`)
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className={`w-10 h-10 rounded-full text-sm font-medium ${color}`}
              >
                {index + 1}
              </button>
            );
          })}
        </div>
        {!submitted ? (
          <Button onClick={handleSubmit} className="mt-4 w-full">
            Nộp bài
          </Button>
        ) : (
          <div className="mt-4 text-lg font-semibold text-green-600">
            <span>
              ✅ Bạn đúng {score}/{assignment?.questions.length} câu. Được{" "}
              {(score * 10) / (assignment?.questions?.length ?? 1)} điểm
            </span>
            <Button
              className="mt-4"
              href={`/classroom/${assignment?.classroomId}`}
            >
              Classroom
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
