"use client";

import { Button } from "flowbite-react";
import { CheckCircle } from "lucide-react";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { submissionService } from "~/services/submissionService";
import { useSubmissionStore } from "~/store/submissionStore";

export default function Quiz() {
  const [answers, setAnswers] = useState<{ [questionId: number]: string }>({});
  const { submission, setSubmission } = useSubmissionStore();
  const [score, setScore] = useState(0);

  const { quizId } = useParams();
  const alphaAnswers = ["A", "B", "C", "D"];
  const user = submission?.user;

  useEffect(() => {
    const handleGetSubmission = async () => {
      const res = await submissionService.getSubmissionById(Number(quizId));
      setSubmission(res);
    };
    handleGetSubmission();
  }, []);

  useEffect(() => {
    if (!submission) return;
    console.log(submission);

    const currentAnswers = submission.fileUrl;
    const currentAnswersArray = currentAnswers?.split(";");
    const parsedAnswers: { [questionId: number]: string } = {};

    currentAnswersArray?.forEach((c: string) => {
      const questionId = Number(c.split(":")[0]);
      const option = c.split(":")[1];
      parsedAnswers[questionId] = option;
    });

    setAnswers(parsedAnswers);
  }, [submission]);

  useEffect(() => {
    if (!submission) return;

    let correctCount = 0;
    submission.assignment.questions.forEach((q) => {
      if (answers[q.id] === q.correctAnswer) correctCount++;
    });
    setScore(correctCount);
  }, [answers, submission]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 p-6 gap-4">
      {/* LEFT: Questions */}

      <div className="lg:col-span-9">
        <h2 className="text-2xl font-semibold mb-4">
          {submission?.assignment?.title || "Bài kiểm tra"}
        </h2>

        <div className="mb-4 text-sm text-gray-700">
          <p>
            <strong>Họ tên:</strong> {user?.name || "N/A"}
          </p>
          <p>
            <strong>Email:</strong> {user?.email || "N/A"}
          </p>
          <p>
            <strong>Ngày nộp:</strong>{" "}
            {submission?.submittedAt
              ? new Date(submission.submittedAt).toLocaleString("vi-VN")
              : "Chưa rõ"}
          </p>
        </div>

        {submission?.assignment?.questions?.map((q, index) => {
          const userAnswer = answers[q.id];
          const isCorrect = userAnswer === q.correctAnswer;

          let questionBg = "";
          if (userAnswer) {
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
                      disabled={true}
                      checked={answers[q.id] === alphaAnswers[i]}
                      className="accent-blue-500"
                    />
                    {opt}
                  </label>
                ))}
              </div>

              {!isCorrect && (
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
          {submission?.assignment?.questions?.map((q, index) => {
            let color = "bg-gray-300"; // default

            const isCorrect = answers[q.id] === q.correctAnswer;
            color = isCorrect
              ? "bg-green-600 text-white"
              : "bg-red-600 text-white";

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
        <div className="mt-4 text-lg font-semibold text-green-600">
          <span className="flex items-center gap-1">
            <CheckCircle className="text-green-600 w-5 h-5" />
            Đúng {score}/{submission?.assignment?.questions.length} câu. Được{" "}
            {(score * 10) / (submission?.assignment?.questions?.length ?? 1)}{" "}
            điểm
          </span>
          <Button
            className="mt-4"
            href={`/teaching/${submission?.assignment?.classroomId}`}
          >
            Teaching
          </Button>
        </div>
      </div>
    </div>
  );
}
