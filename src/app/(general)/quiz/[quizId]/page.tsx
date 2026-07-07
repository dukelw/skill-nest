"use client";

import { Button } from "~/components/ui/primitives";
import { CheckCircle } from "lucide-react";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { assignmentService } from "~/services/assignmentService";
import { submissionService } from "~/services/submissionService";
import { useAssignmentStore } from "~/store/assignmentStore";
import { useAuthStore } from "~/store/authStore";

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

export default function Quiz() {
  const { assignment, setAssignment } = useAssignmentStore();
  const { quizId } = useParams();
  const [answers, setAnswers] = useState<{ [questionId: number]: string }>({});
  const [errors, setErrors] = useState<number[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [markedQuestions, setMarkedQuestions] = useState<number[]>([]);
  const { user } = useAuthStore();

  const handleAnswerChange = (questionId: number, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    setErrors((prev) => prev.filter((id) => id !== questionId));
  };

  const toggleMultipleAnswer = (questionId: number, label: string) => {
    const current = answers[questionId] ? answers[questionId].split(",") : [];
    const next = current.includes(label)
      ? current.filter((item) => item !== label)
      : [...current, label];
    handleAnswerChange(questionId, next.sort().join(","));
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
      assignment?.questions.filter((q) => !answers[q.id]?.trim()).map((q) => q.id) ||
      [];

    if (unanswered.length > 0) {
      setErrors(unanswered);
      return;
    }

    let correctCount = 0;
    assignment?.questions.forEach((q) => {
      if (isAnswerCorrect(q, answers[q.id])) correctCount++;
    });

    const totalQuestions = assignment?.questions?.length ?? 0;
    const grade = totalQuestions ? (correctCount * 10) / totalQuestions : 0;

    if (!assignment?.id || !user?.id) return;

    await submissionService.createSubmission({
      assignmentId: assignment.id,
      userId: user.id,
      fileUrl: JSON.stringify(answers),
      grade,
    });

    setScore(correctCount);
    setSubmitted(true);
  };

  const handleGetAssignment = async () => {
    const res = await assignmentService.getAssignmentById(Number(quizId));
    setAssignment(res);
  };

  useEffect(() => {
    handleGetAssignment();
  }, []);

  const renderQuestionInput = (question: any) => {
    if (question.questionType === "SHORT_ANSWER") {
      return (
        <input
          value={answers[question.id] || ""}
          disabled={submitted}
          onChange={(event) => handleAnswerChange(question.id, event.target.value)}
          placeholder="Type your answer"
          className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
        />
      );
    }

    const optionLabels =
      question.questionType === "TRUE_FALSE" ? ["A", "B"] : ANSWER_LABELS;

    return (
      <div className="grid gap-2 sm:grid-cols-2">
        {optionLabels.map((label, index) => {
          const checked =
            question.questionType === "MULTIPLE_CHOICE"
              ? (answers[question.id] || "").split(",").includes(label)
              : answers[question.id] === label;
          return (
            <label
              key={label}
              className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition ${
                checked
                  ? "border-emerald-300 bg-emerald-50"
                  : "border-slate-200 bg-white hover:bg-emerald-50"
              }`}
            >
              <input
                type={question.questionType === "MULTIPLE_CHOICE" ? "checkbox" : "radio"}
                name={`question-${question.id}`}
                disabled={submitted}
                checked={checked}
                onChange={() =>
                  question.questionType === "MULTIPLE_CHOICE"
                    ? toggleMultipleAnswer(question.id, label)
                    : handleAnswerChange(question.id, label)
                }
                className="h-4 w-4 cursor-pointer accent-emerald-700"
              />
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#eef7ef] text-sm font-extrabold text-emerald-800">
                {label}
              </span>
              <span className="text-sm font-semibold text-slate-700">
                {question.options?.[index]}
              </span>
            </label>
          );
        })}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 gap-4 p-6 lg:grid-cols-12">
      <div className="lg:col-span-9">
        <h2 className="mb-4 text-2xl font-extrabold text-slate-950">
          {assignment?.title || "Quiz"}
        </h2>

        {assignment?.questions?.map((q, index) => {
          const userAnswer = answers[q.id];
          const isCorrect = isAnswerCorrect(q, userAnswer);
          const showAnswer = submitted && q.showCorrectAnswer;

          return (
            <div
              key={q.id}
              id={`question-${q.id}`}
              className={`mb-6 scroll-mt-24 rounded-xl border p-4 shadow-sm ${
                submitted && userAnswer
                  ? isCorrect
                    ? "border-emerald-200 bg-emerald-50"
                    : "border-red-200 bg-red-50"
                  : "border-emerald-100 bg-[#f7fbf7]"
              }`}
            >
              <p className="mb-1 text-xs font-bold uppercase tracking-wide text-emerald-700">
                {q.questionType?.replaceAll("_", " ") || "SINGLE CHOICE"}
              </p>
              <p className="mb-3 font-bold text-slate-950">
                {index + 1}. {q.questionText}
              </p>

              {renderQuestionInput(q)}

              <div className="mt-3">
                <button
                  type="button"
                  onClick={() => toggleMark(q.id)}
                  className={`cursor-pointer rounded-lg border px-3 py-1 text-sm font-bold ${
                    markedQuestions.includes(q.id)
                      ? "border-amber-300 bg-amber-50 text-amber-700"
                      : "border-slate-200 bg-white text-slate-600"
                  }`}
                >
                  {markedQuestions.includes(q.id)
                    ? "Marked for review"
                    : "Mark for review"}
                </button>
              </div>

              {errors.includes(q.id) && (
                <p className="mt-2 text-sm font-semibold text-red-600">
                  Please answer this question.
                </p>
              )}

              {showAnswer && !isCorrect && (
                <p className="mt-2 text-sm font-semibold text-emerald-700">
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
            {assignment?.questions?.map((q, index) => {
              let color = "bg-slate-100 text-slate-700";

              if (submitted) {
                color = isAnswerCorrect(q, answers[q.id])
                  ? "bg-emerald-700 text-white"
                  : "bg-red-600 text-white";
              } else {
                if (answers[q.id]) color = "bg-sky-600 text-white";
                if (markedQuestions.includes(q.id)) color = "bg-amber-500 text-white";
              }

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
          {!submitted ? (
            <Button onClick={handleSubmit} className="mt-4 w-full">
              Submit quiz
            </Button>
          ) : (
            <div className="mt-4 text-lg font-bold text-emerald-700">
              <span className="flex items-center gap-1">
                <CheckCircle className="h-5 w-5 text-emerald-700" />
                {score}/{assignment?.questions.length} correct. Score{" "}
                {((score * 10) / (assignment?.questions?.length ?? 1)).toFixed(1)}
              </span>
              <Button className="mt-4 w-full" href={`/classroom/${assignment?.classroomId}`}>
                Classroom
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
