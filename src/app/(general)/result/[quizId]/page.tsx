"use client";

import { Button } from "~/components/ui/primitives";
import { CheckCircle } from "lucide-react";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { submissionService } from "~/services/submissionService";
import { useSubmissionStore } from "~/store/submissionStore";

const ANSWER_LABELS = ["A", "B", "C", "D"];

const normalizeText = (value: string) => value.trim().toLowerCase();
const normalizeSet = (value: string) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .sort()
    .join(",");
const isAnswerCorrect = (question: any, answer?: string) => {
  if (!answer) return false;
  if (question.questionType === "SHORT_ANSWER") {
    return normalizeText(answer) === normalizeText(question.correctAnswer);
  }
  if (question.questionType === "MULTIPLE_CHOICE") {
    return normalizeSet(answer) === normalizeSet(question.correctAnswer);
  }
  return answer === question.correctAnswer;
};

const parseAnswers = (value?: string) => {
  if (!value) return {};
  try {
    return JSON.parse(value);
  } catch {
    const parsed: { [questionId: number]: string } = {};
    value.split(";").forEach((chunk) => {
      const [questionId, option] = chunk.split(":");
      parsed[Number(questionId)] = option;
    });
    return parsed;
  }
};

export default function QuizResult() {
  const [answers, setAnswers] = useState<{ [questionId: number]: string }>({});
  const { submission, setSubmission } = useSubmissionStore();
  const [score, setScore] = useState(0);

  const { quizId } = useParams();
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
    setAnswers(parseAnswers(submission.fileUrl));
  }, [submission]);

  useEffect(() => {
    if (!submission) return;

    let correctCount = 0;
    submission.assignment.questions.forEach((q) => {
      if (isAnswerCorrect(q, answers[q.id])) correctCount++;
    });
    setScore(correctCount);
  }, [answers, submission]);

  const renderAnswer = (question: any) => {
    const answer = answers[question.id] || "";
    if (question.questionType === "SHORT_ANSWER") {
      return (
        <div className="rounded-lg border border-slate-200 bg-white p-3 text-sm font-semibold text-slate-700">
          {answer || "No answer"}
        </div>
      );
    }

    const labels =
      question.questionType === "TRUE_FALSE" ? ["A", "B"] : ANSWER_LABELS;
    return (
      <div className="grid gap-2 sm:grid-cols-2">
        {labels.map((label, index) => {
          const checked =
            question.questionType === "MULTIPLE_CHOICE"
              ? answer.split(",").includes(label)
              : answer === label;
          return (
            <div
              key={label}
              className={`flex items-center gap-3 rounded-xl border p-3 ${
                checked
                  ? "border-emerald-300 bg-emerald-50"
                  : "border-slate-200 bg-white"
              }`}
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#eef7ef] text-sm font-extrabold text-emerald-800">
                {label}
              </span>
              <span className="text-sm font-semibold text-slate-700">
                {question.options?.[index]}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 gap-4 p-6 lg:grid-cols-12">
      <div className="lg:col-span-9">
        <h2 className="mb-4 text-2xl font-extrabold text-slate-950">
          {submission?.assignment?.title || "Quiz result"}
        </h2>

        <div className="mb-4 rounded-xl border border-emerald-100 bg-[#f7fbf7] p-4 text-sm text-slate-700">
          <p>
            <strong>Name:</strong> {user?.name || "N/A"}
          </p>
          <p>
            <strong>Email:</strong> {user?.email || "N/A"}
          </p>
          <p>
            <strong>Submitted at:</strong>{" "}
            {submission?.submittedAt
              ? new Date(submission.submittedAt).toLocaleString("vi-VN")
              : "Unknown"}
          </p>
        </div>

        {submission?.assignment?.questions?.map((q, index) => {
          const userAnswer = answers[q.id];
          const isCorrect = isAnswerCorrect(q, userAnswer);

          return (
            <div
              key={q.id}
              id={`question-${q.id}`}
              className={`mb-6 scroll-mt-24 rounded-xl border p-4 shadow-sm ${
                isCorrect
                  ? "border-emerald-200 bg-emerald-50"
                  : "border-red-200 bg-red-50"
              }`}
            >
              <p className="mb-1 text-xs font-bold uppercase tracking-wide text-emerald-700">
                {q.questionType?.replaceAll("_", " ") || "SINGLE CHOICE"}
              </p>
              <p className="mb-3 font-bold text-slate-950">
                {index + 1}. {q.questionText}
              </p>

              {renderAnswer(q)}

              {!isCorrect && (
                <p className="mt-3 text-sm font-semibold text-emerald-700">
                  Correct answer: <strong>{q.correctAnswer}</strong>
                </p>
              )}
            </div>
          );
        })}
      </div>

      <div className="h-fit lg:sticky lg:top-6 lg:col-span-3">
        <div className="rounded-xl border border-emerald-100 bg-white p-4 shadow-sm">
          <h3 className="mb-3 font-extrabold text-slate-950">Questions</h3>
          <div className="grid grid-cols-5 gap-2">
            {submission?.assignment?.questions?.map((q, index) => {
              const color = isAnswerCorrect(q, answers[q.id])
                ? "bg-emerald-700 text-white"
                : "bg-red-600 text-white";

              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() =>
                    document
                      .getElementById(`question-${q.id}`)
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  className={`h-10 w-10 cursor-pointer rounded-full text-sm font-bold ${color}`}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>
          <div className="mt-4 text-lg font-bold text-emerald-700">
            <span className="flex items-center gap-1">
              <CheckCircle className="h-5 w-5 text-emerald-700" />
              {score}/{submission?.assignment?.questions.length} correct. Score{" "}
              {((score * 10) / (submission?.assignment?.questions?.length ?? 1)).toFixed(1)}
            </span>
            <Button
              className="mt-4 w-full"
              href={`/teaching/${submission?.assignment?.classroomId}`}
            >
              Teaching
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
