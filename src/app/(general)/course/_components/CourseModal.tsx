"use client";

import { useEffect, useState } from "react";
import {
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "~/components/ui/primitives";
import LewisTextInput from "~/components/Partial/LewisTextInput";
import LewisButton from "~/components/Partial/LewisButton";
import LoadingButton from "~/components/Partial/LoadingButton";
import { uploadService } from "~/services/uploadService";
import { courseService } from "~/services/courseService";
import { toast } from "sonner";
import { useAuthStore } from "~/store/authStore";
import { Course } from "~/models/Course";
import { ImagePlus, Plus, Trash2 } from "lucide-react";

type Props = {
  show: boolean;
  onClose: () => void;
  onCreated?: () => void | Promise<void>;
  onUpdated?: () => void | Promise<void>;
  course?: Course | null;
};

export default function CourseModal({
  show,
  onClose,
  onCreated,
  onUpdated,
  course,
}: Props) {
  const { user } = useAuthStore();
  const [file, setFile] = useState<File | null>(null);
  const [goalInput, setGoalInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    introVideoUrl: "",
    level: "",
    thumbnail: "",
    goals: [] as string[],
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
    }
  };

  const addGoal = () => {
    if (!goalInput.trim()) return;
    setForm({ ...form, goals: [...form.goals, goalInput.trim()] });
    setGoalInput("");
  };

  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      introVideoUrl: "",
      level: "",
      thumbnail: "",
      goals: [],
    });
    setFile(null);
    setGoalInput("");
    setIsSubmitting(false);
  };

  useEffect(() => {
    if (course) {
      setForm({
        title: course.title,
        description: course.description || "",
        introVideoUrl: course.introVideoUrl || "",
        level: course.level || "",
        thumbnail: course.thumbnail || "",
        goals: (course.goals || []).map((goal) =>
          typeof goal === "string" ? goal : goal.content
        ),
      });
    } else {
      resetForm();
    }
  }, [course]);

  const handleSubmit = async () => {
    if (!user || !form.title.trim()) {
      toast.error("Please enter a course title.");
      return;
    }

    setIsSubmitting(true);
    try {
      let thumbnailUrl = form.thumbnail;

      // Nếu có file mới, upload để lấy thumbnail mới
      if (file) {
        thumbnailUrl = await uploadService.uploadFile(file);
      }

      // Nếu đang cập nhật
      if (course) {
        // Gọi API cập nhật course
        await courseService.update(course.id, {
          title: form.title,
          description: form.description,
          introVideoUrl: form.introVideoUrl,
          level: form.level,
          thumbnail: thumbnailUrl,
          creatorId: user.id,
          isFree: course.isFree || true, // fallback nếu không có
        });

        // Cập nhật lại goals
        await courseService.updateGoals(course.id, form.goals);

        toast.success("Course updated successfully!");
        await onUpdated?.();
      } else {
        // Tạo mới
        const courseRes = await courseService.create({
          title: form.title,
          description: form.description,
          introVideoUrl: form.introVideoUrl,
          level: form.level,
          thumbnail: thumbnailUrl,
          creatorId: user.id,
        });

        if (courseRes?.id && form.goals.length) {
          await courseService.addGoals(courseRes.id, form.goals);
        }

        toast.success("Course created successfully!");
        await onCreated?.();
      }

      resetForm();
      onClose();
    } catch (error: any) {
      console.error("Course submission failed:", error);

      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Something went wrong.";

      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal size="5xl" show={show} onClose={() => !isSubmitting && onClose()}>
      <ModalHeader className="modal-titlebar">
        <div>
          <h2 className="text-base font-bold text-slate-950">
            {course ? "Edit course" : "Create new course"}
          </h2>
          <p className="mt-1 text-xs font-normal text-slate-500">
            Add a clear title, cover image, learning level and course goals.
          </p>
        </div>
      </ModalHeader>
      <ModalBody className="modal-body-pad">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-[1.15fr_0.85fr]">
          <div className="flex flex-col gap-1">
            <div>
              <Label
                htmlFor="title"
                className="block text-sm font-medium dark:text-gray-700 mb-1"
              >
                Title
              </Label>

              <LewisTextInput
                name="title"
                placeholder="Title"
                value={form.title}
                onChange={handleChange}
                className="mb-4"
                disabled={isSubmitting}
              />
            </div>
            <div>
              <Label
                htmlFor="description"
                className="block text-sm font-medium dark:text-gray-700 mb-1"
              >
                Description
              </Label>
              <LewisTextInput
                name="description"
                placeholder="Description"
                value={form.description}
                onChange={handleChange}
                className="mb-4"
                disabled={isSubmitting}
              />
            </div>
            <div>
              <Label
                htmlFor="introVideoUrl"
                className="block text-sm font-medium dark:text-gray-700 mb-1"
              >
                Intro URL
              </Label>
              <LewisTextInput
                name="introVideoUrl"
                placeholder="Intro Video URL"
                value={form.introVideoUrl}
                onChange={handleChange}
                className="mb-4"
                disabled={isSubmitting}
              />
            </div>
            <div>
              <Label
                htmlFor="level"
                className="block text-sm font-medium dark:text-gray-700 mb-1"
              >
                Level
              </Label>
              <LewisTextInput
                name="level"
                placeholder="Level (e.g. Beginner, Intermediate)"
                value={form.level}
                onChange={handleChange}
                className="mb-4"
                disabled={isSubmitting}
              />
            </div>
            <label className="mt-2 flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-dashed border-emerald-200 bg-[#eef7ef] px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-emerald-50">
              <span className="flex min-w-0 items-center gap-2">
                <ImagePlus className="h-4 w-4 shrink-0 text-emerald-700" />
                <span className="truncate">
                  {file?.name || "Choose course thumbnail"}
                </span>
              </span>
              <span className="rounded-lg bg-white px-3 py-1 text-xs text-emerald-800">
                Browse
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="sr-only"
                disabled={isSubmitting}
              />
            </label>
          </div>
          <div className="flex flex-col gap-4">
            <div className="overflow-hidden rounded-xl border border-emerald-100 bg-[#eef7ef]">
              {form.thumbnail || file ? (
                <img
                  src={file ? URL.createObjectURL(file) : form.thumbnail}
                  alt="Current thumbnail"
                  className="h-48 w-full object-cover"
                />
              ) : (
                <div className="flex h-48 flex-col items-center justify-center text-center text-slate-500">
                  <ImagePlus className="h-8 w-8 text-emerald-700" />
                  <p className="mt-2 text-sm font-bold">No thumbnail selected</p>
                </div>
              )}
            </div>

            <div className="rounded-xl border border-emerald-100 bg-[#f7fbf7] p-4">
              <div className="mb-3 flex items-center justify-between">
                <label className="text-sm font-bold text-slate-800">Goals</label>
                <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-bold text-emerald-800">
                  {form.goals.length}
                </span>
              </div>

              <div className="flex gap-2">
                <LewisTextInput
                  placeholder="Enter goal"
                  value={goalInput}
                  onChange={(e) => setGoalInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addGoal();
                    }
                  }}
                  className="flex-1"
                  disabled={isSubmitting}
                />
                <LewisButton onClick={addGoal} disabled={isSubmitting}>
                  <Plus className="h-4 w-4" />
                </LewisButton>
              </div>

              {form.goals.length > 0 ? (
                <ul className="mt-3 space-y-2">
                  {form.goals.map((goal, idx) => (
                    <li
                      key={`${goal}-${idx}`}
                      className="flex items-center justify-between gap-2 rounded-lg border border-emerald-100 bg-[#eef7ef] px-3 py-2 text-sm font-semibold text-slate-700"
                    >
                      <span className="line-clamp-2">{goal}</span>
                      <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={() =>
                          setForm({
                            ...form,
                            goals: form.goals.filter((_, index) => index !== idx),
                          })
                        }
                        className="cursor-pointer rounded-md p-1 text-red-500 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 rounded-lg border border-dashed border-emerald-200 bg-[#eef7ef] px-3 py-4 text-center text-sm font-semibold text-slate-500">
                  Add a few learning outcomes to make this course clearer.
                </p>
              )}
            </div>
          </div>
        </div>
      </ModalBody>
      <ModalFooter className="modal-footer-actions">
        <LewisButton
          variant="outlined"
          onClick={onClose}
          disabled={isSubmitting}
        >
          Cancel
        </LewisButton>
        <LoadingButton
          onClick={handleSubmit}
          loading={isSubmitting}
          loadingText={course ? "Saving..." : "Creating..."}
        >
          {course ? "Save changes" : "Create course"}
        </LoadingButton>
      </ModalFooter>
    </Modal>
  );
}
