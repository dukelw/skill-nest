/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  Breadcrumb,
  BreadcrumbItem,
} from "~/components/ui/primitives";
import LewisButton from "~/components/Partial/LewisButton";
import LewisTextInput from "~/components/Partial/LewisTextInput";
import LoadingButton from "~/components/Partial/LoadingButton";
import { assignmentService } from "~/services/assignmentService";
import { uploadService } from "~/services/uploadService";
import { useClassroomStore } from "~/store/classroomStore";
import {
  CheckCircle2,
  Eye,
  EyeOff,
  FileText,
  Plus,
  Trash2,
} from "lucide-react";

const ANSWER_LABELS = ["A", "B", "C", "D"];
const QUESTION_TYPES = [
  { value: "SINGLE_CHOICE", labelKey: "quizCreator.questionTypes.singleChoice" },
  { value: "MULTIPLE_CHOICE", labelKey: "quizCreator.questionTypes.multipleChoice" },
  { value: "TRUE_FALSE", labelKey: "quizCreator.questionTypes.trueFalse" },
  { value: "SHORT_ANSWER", labelKey: "quizCreator.questionTypes.shortAnswer" },
] as const;

type QuestionType = (typeof QUESTION_TYPES)[number]["value"];

type QuizQuestion = {
  questionText: string;
  options: string[];
  correctAnswer: string;
  questionType: QuestionType;
  showCorrectAnswer: boolean;
};

const createEmptyQuestion = (showCorrectAnswer: boolean): QuizQuestion => ({
  questionText: "",
  options: ["", "", "", ""],
  correctAnswer: "",
  questionType: "SINGLE_CHOICE",
  showCorrectAnswer,
});

export default function QuizCreatoryPage() {
  const { classroomId } = useParams();
  const { classroom } = useClassroomStore();
  const router = useRouter();
  const { t } = useTranslation();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [questions, setQuestions] = useState<QuizQuestion[]>([
    createEmptyQuestion(false),
  ]);
  const [showResult, setShowResult] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddQuestion = () => {
    setQuestions((prev) => [...prev, createEmptyQuestion(showResult)]);
  };

  const handleRemoveQuestion = (index: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleQuestionChange = (
    index: number,
    key: "questionText" | "correctAnswer" | "options" | "questionType",
    value: any
  ) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === index
          ? {
              ...q,
              [key]: key === "options" ? [...value] : value,
            }
          : q
      )
    );
  };

  const handleShowResultToggle = () => {
    const nextValue = !showResult;
    setShowResult(nextValue);
    setQuestions((prev) =>
      prev.map((question) => ({
        ...question,
        showCorrectAnswer: nextValue,
      }))
    );
  };

  const validateQuiz = () => {
    if (!title.trim()) {
      toast.error(t("quizCreator.validationTitleRequired"));
      return false;
    }
    if (!dueDate) {
      toast.error(t("quizCreator.validationDueDateRequired"));
      return false;
    }
    if (!questions.length) {
      toast.error(t("quizCreator.validationQuestionRequired"));
      return false;
    }

    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      const needsOptions = question.questionType !== "SHORT_ANSWER";
      if (!question.questionText.trim()) {
        toast.error(t("quizCreator.validationQuestionMissing", { number: i + 1 }));
        return false;
      }
      if (needsOptions && question.options.some((option) => !option.trim())) {
        toast.error(t("quizCreator.validationOptionsRequired", { number: i + 1 }));
        return false;
      }
      if (!question.correctAnswer.trim()) {
        toast.error(t("quizCreator.validationCorrectAnswerRequired", { number: i + 1 }));
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateQuiz()) return;

    setIsSubmitting(true);
    try {
      const fileUrl = file ? await uploadService.uploadFile(file) : "";

      await assignmentService.createAssignment({
        classroomId: Number(classroomId),
        title: title.trim(),
        description: description.trim(),
        dueDate: new Date(dueDate),
        type: "QUIZ",
        questions,
        fileUrl,
      });

      toast.success(t("quizCreator.created"));
      router.push(`/teaching/${classroomId}`);
    } catch (error: any) {
      console.error(error);
      toast.error(
        error?.response?.data?.message || error?.message || t("quizCreator.createFailed")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const completedQuestions = questions.filter(
    (question) =>
      question.questionText.trim() &&
      question.correctAnswer &&
      (question.questionType === "SHORT_ANSWER" ||
        question.options.every((option) => option.trim()))
  ).length;

  const setQuestionType = (questionIndex: number, questionType: QuestionType) => {
    setQuestions((prev) =>
      prev.map((question, index) => {
        if (index !== questionIndex) return question;
        if (questionType === "TRUE_FALSE") {
          return {
            ...question,
            questionType,
            options: [
              t("quizCreator.trueOption"),
              t("quizCreator.falseOption"),
            ],
            correctAnswer: "",
          };
        }
        if (questionType === "SHORT_ANSWER") {
          return {
            ...question,
            questionType,
            options: [],
            correctAnswer: "",
          };
        }
        return {
          ...question,
          questionType,
          options:
            question.options.length >= 4
              ? question.options.slice(0, 4)
              : ["", "", "", ""],
          correctAnswer: "",
        };
      })
    );
  };

  const toggleMultipleAnswer = (questionIndex: number, label: string) => {
    const current = questions[questionIndex].correctAnswer
      ? questions[questionIndex].correctAnswer.split(",")
      : [];
    const next = current.includes(label)
      ? current.filter((item) => item !== label)
      : [...current, label];
    handleQuestionChange(questionIndex, "correctAnswer", next.sort().join(","));
  };

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <Breadcrumb aria-label="Breadcrumb" className="mb-4">
        <BreadcrumbItem href="/">{t("teachingPage.home")}</BreadcrumbItem>
        <BreadcrumbItem href="/teaching">{t("teachingPage.teachingPage")}</BreadcrumbItem>
        <BreadcrumbItem>{classroom?.name || t("quizCreator.breadcrumb")}</BreadcrumbItem>
      </Breadcrumb>

      <section className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">
          {t("quizCreator.eyebrow")}
        </p>
        <div className="mt-2 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-950">
              {t("quizCreator.title")}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              {t("quizCreator.subtitle")}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 rounded-xl border border-emerald-100 bg-[#eef7ef] p-3 text-sm font-bold text-slate-700">
            <span>{t("quizCreator.questionsCount", { count: questions.length })}</span>
            <span>{t("quizCreator.readyCount", { count: completedQuestions })}</span>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <main className="space-y-4">
          {questions.map((question, questionIndex) => (
            <section
              key={questionIndex}
              className="overflow-hidden rounded-xl border border-emerald-100 bg-white shadow-sm"
            >
              <div className="flex flex-col gap-3 border-b border-emerald-100 bg-[#f7fbf7] p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">
                    {t("quizCreator.question", { number: questionIndex + 1 })}
                  </p>
                  <h2 className="mt-1 text-lg font-extrabold text-slate-950">
                    {t(
                      QUESTION_TYPES.find(
                        (type) => type.value === question.questionType
                      )?.labelKey ?? "quizCreator.questionTypes.singleChoice"
                    )}
                  </h2>
                </div>
                {questions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveQuestion(questionIndex)}
                    className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 text-sm font-bold text-red-700 transition hover:bg-red-100"
                  >
                    <Trash2 className="h-4 w-4" />
                    {t("quizCreator.remove")}
                  </button>
                )}
              </div>

              <div className="space-y-4 p-4">
                <div className="flex flex-wrap gap-2">
                  {QUESTION_TYPES.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setQuestionType(questionIndex, type.value)}
                      className={`h-9 cursor-pointer rounded-lg border px-3 text-sm font-bold transition ${
                        question.questionType === type.value
                          ? "border-emerald-300 bg-emerald-700 text-white"
                          : "border-emerald-100 bg-[#f7fbf7] text-slate-700 hover:bg-emerald-50"
                      }`}
                    >
                      {t(type.labelKey)}
                    </button>
                  ))}
                </div>

                <LewisTextInput
                  placeholder={t("quizCreator.questionPlaceholder", {
                    number: questionIndex + 1,
                  })}
                  value={question.questionText}
                  onChange={(event) =>
                    handleQuestionChange(
                      questionIndex,
                      "questionText",
                      event.target.value
                    )
                  }
                />

                {question.questionType === "SHORT_ANSWER" ? (
                  <div>
                    <label className="mb-1 block text-sm font-bold text-slate-700">
                      {t("quizCreator.acceptedAnswer")}
                    </label>
                    <LewisTextInput
                      placeholder={t("quizCreator.shortAnswerPlaceholder")}
                      value={question.correctAnswer}
                      onChange={(event) =>
                        handleQuestionChange(
                          questionIndex,
                          "correctAnswer",
                          event.target.value
                        )
                      }
                      className="mb-0"
                    />
                  </div>
                ) : (
                <div className="grid gap-3 md:grid-cols-2">
                  {(question.questionType === "TRUE_FALSE"
                    ? ["A", "B"]
                    : ANSWER_LABELS
                  ).map((label, optionIndex) => {
                    const isCorrect =
                      question.questionType === "MULTIPLE_CHOICE"
                        ? question.correctAnswer.split(",").includes(label)
                        : question.correctAnswer === label;
                    const nextOptions = [...question.options];
                    const optionText =
                      question.questionType === "TRUE_FALSE"
                        ? optionIndex === 0
                          ? t("quizCreator.trueOption")
                          : t("quizCreator.falseOption")
                        : question.options[optionIndex];

                    return (
                      <label
                        key={label}
                        className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition ${
                          isCorrect
                            ? "border-emerald-300 bg-emerald-50"
                            : "border-slate-200 bg-[#f7fbf7] hover:border-emerald-200"
                        }`}
                      >
                        <input
                          type={
                            question.questionType === "MULTIPLE_CHOICE"
                              ? "checkbox"
                              : "radio"
                          }
                          name={`correct-${questionIndex}`}
                          aria-label={label}
                          value={label}
                          checked={isCorrect}
                          onChange={() =>
                            question.questionType === "MULTIPLE_CHOICE"
                              ? toggleMultipleAnswer(questionIndex, label)
                              : handleQuestionChange(
                                  questionIndex,
                                  "correctAnswer",
                                  label
                                )
                          }
                          className="h-4 w-4 cursor-pointer accent-emerald-700"
                        />
                        <span
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-extrabold ${
                            isCorrect
                              ? "bg-emerald-700 text-white"
                              : "bg-white text-emerald-800"
                          }`}
                        >
                          {label}
                        </span>
                        <LewisTextInput
                          placeholder={t("quizCreator.optionPlaceholder", { label })}
                          value={optionText}
                          onChange={(event) => {
                            if (question.questionType === "TRUE_FALSE") return;
                            nextOptions[optionIndex] = event.target.value;
                            handleQuestionChange(
                              questionIndex,
                              "options",
                              nextOptions
                            );
                          }}
                          className="mb-0"
                          disabled={question.questionType === "TRUE_FALSE"}
                        />
                      </label>
                    );
                  })}
                </div>
                )}
              </div>
            </section>
          ))}

          <button
            type="button"
            onClick={handleAddQuestion}
            className="flex min-h-16 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-emerald-300 bg-[#eef7ef] text-sm font-extrabold text-emerald-800 transition hover:bg-emerald-50"
          >
            <Plus className="h-4 w-4" />
            {t("quizCreator.addQuestion")}
          </button>
        </main>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <section className="rounded-xl border border-emerald-100 bg-white p-4 shadow-sm">
            <h2 className="text-lg font-extrabold text-slate-950">
              {t("quizCreator.settingsTitle")}
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              {t("quizCreator.settingsDescription")}
            </p>

            <div className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-bold text-slate-700">
                  {t("quizCreator.titleLabel")}
                </label>
                <LewisTextInput
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder={t("quizCreator.titlePlaceholder")}
                  className="mb-0"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-bold text-slate-700">
                  {t("quizCreator.descriptionLabel")}
                </label>
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder={t("quizCreator.descriptionPlaceholder")}
                  rows={4}
                  className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-bold text-slate-700">
                  {t("quizCreator.dueDateLabel")}
                </label>
                <input
                  type="datetime-local"
                  value={dueDate}
                  onChange={(event) => setDueDate(event.target.value)}
                  className="block h-11 w-full cursor-pointer rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-dashed border-emerald-200 bg-[#eef7ef] px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-emerald-50">
                <span className="flex min-w-0 items-center gap-2">
                  <FileText className="h-4 w-4 shrink-0 text-emerald-700" />
                  <span className="truncate">
                    {file?.name || t("quizCreator.optionalAttachment")}
                  </span>
                </span>
                <span className="rounded-lg bg-white px-3 py-1 text-xs text-emerald-800">
                  {t("quizCreator.browse")}
                </span>
                <input
                  type="file"
                  onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                  className="sr-only"
                />
              </label>
            </div>
          </section>

          <section className="rounded-xl border border-emerald-100 bg-[#f7fbf7] p-4 shadow-sm">
            <button
              type="button"
              onClick={handleShowResultToggle}
              className="flex w-full cursor-pointer items-center justify-between rounded-xl border border-emerald-100 bg-white p-3 text-left transition hover:bg-emerald-50"
            >
              <span>
                <span className="block text-sm font-extrabold text-slate-950">
                  {t("quizCreator.revealAnswers")}
                </span>
                <span className="mt-1 block text-xs font-semibold text-slate-500">
                  {showResult
                    ? t("quizCreator.studentsCanReview")
                    : t("quizCreator.answersStayHidden")}
                </span>
              </span>
              {showResult ? (
                <Eye className="h-5 w-5 text-emerald-700" />
              ) : (
                <EyeOff className="h-5 w-5 text-slate-400" />
              )}
            </button>

            <div className="mt-4 space-y-2 text-sm font-semibold text-slate-600">
              <p className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-700" />
                {t("quizCreator.ruleAnswer")}
              </p>
              <p className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-700" />
                {t("quizCreator.ruleOptions")}
              </p>
            </div>
          </section>

          <div className="flex justify-end gap-2">
            <LewisButton
              variant="outlined"
              onClick={() => router.push(`/teaching/${classroomId}`)}
              disabled={isSubmitting}
            >
              {t("quizCreator.cancel")}
            </LewisButton>
            <LoadingButton
              onClick={handleSubmit}
              loading={isSubmitting}
              loadingText={t("quizCreator.publishing")}
            >
              {t("quizCreator.publish")}
            </LoadingButton>
          </div>
        </aside>
      </div>
    </div>
  );
}
