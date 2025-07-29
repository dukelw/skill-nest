"use client";

import { useEffect, useState } from "react";
import {
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Spinner,
} from "flowbite-react";
import LewisTextInput from "~/components/partial/LewisTextInput";
import LewisButton from "~/components/partial/LewisButton";
import { uploadService } from "~/services/uploadService";
import { courseService } from "~/services/courseService";
import { toast } from "react-toastify";
import { useAuthStore } from "~/store/authStore";
import { Course } from "~/models/Course";
import Image from "next/image";

type Props = {
  show: boolean;
  onClose: () => void;
  onCreated?: () => void;
  onUpdated?: () => void;
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
        onUpdated?.();
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
        onCreated?.();
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
    <Modal size="5xl" show={show} onClose={onClose}>
      <ModalHeader className="bg-green-500 text-white">
        {course ? "Edit Course" : "Create New Course"}
      </ModalHeader>
      <ModalBody>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            <input
              type="file"
              onChange={handleFileChange}
              className="block w-full mt-4 text-sm file:bg-green-700 text-gray-500 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:text-white hover:file:bg-green-600"
              disabled={isSubmitting}
            />
          </div>
          <div className="flex flex-col gap-4">
            {form.thumbnail && (
              <div className="flex justify-center">
                <Image
                  src={form.thumbnail}
                  alt="Current thumbnail"
                  height={200}
                  width={200}
                  className="w-50 object-cover border rounded"
                />
              </div>
            )}

            {/* Add Goal Section */}
            <label className="text-sm font-semibold mb-1 block">Goals</label>
            <div className="flex gap-2">
              <LewisTextInput
                placeholder="Enter goal"
                value={goalInput}
                onChange={(e) => setGoalInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addGoal()}
                className="flex-1"
                disabled={isSubmitting}
              />
              <LewisButton onClick={addGoal} disabled={isSubmitting}>
                Add
              </LewisButton>
            </div>

            <ul className="list-disc mt-3 ml-6 text-sm text-gray-600">
              {form.goals.map((goal, idx) => (
                <li key={idx}>{goal}</li>
              ))}
            </ul>
          </div>
        </div>
      </ModalBody>
      <ModalFooter>
        <LewisButton onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Spinner size="sm" className="mr-2" />{" "}
              {course ? "Saving..." : "Creating..."}
            </>
          ) : course ? (
            "Save Changes"
          ) : (
            "Create"
          )}
        </LewisButton>
        <LewisButton
          variant="outlined"
          onClick={onClose}
          disabled={isSubmitting}
        >
          Cancel
        </LewisButton>
      </ModalFooter>
    </Modal>
  );
}
