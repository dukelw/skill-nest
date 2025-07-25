"use client";

import { useState } from "react";
import {
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

type Props = {
  show: boolean;
  onClose: () => void;
  onCreated?: () => void;
};

export default function CourseCreateModal({ show, onClose, onCreated }: Props) {
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

  const handleSubmit = async () => {
    if (!user || !form.title.trim()) {
      toast.error("Please enter a course title.");
      return;
    }

    setIsSubmitting(true);
    try {
      let thumbnailUrl = "";
      if (file) {
        thumbnailUrl = await uploadService.uploadFile(file);
      }

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
      resetForm();
      onClose();
    } catch (error: any) {
      console.error("Course creation failed:", error);

      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to create course. Please try again.";

      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal show={show} onClose={onClose}>
      <ModalHeader className="bg-green-500 text-white">
        Create New Course
      </ModalHeader>
      <ModalBody>
        <LewisTextInput
          name="title"
          placeholder="Title"
          value={form.title}
          onChange={handleChange}
          className="mb-4"
          disabled={isSubmitting}
        />
        <LewisTextInput
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
          className="mb-4"
          disabled={isSubmitting}
        />
        <LewisTextInput
          name="introVideoUrl"
          placeholder="Intro Video URL"
          value={form.introVideoUrl}
          onChange={handleChange}
          className="mb-4"
          disabled={isSubmitting}
        />
        <LewisTextInput
          name="level"
          placeholder="Level (e.g. Beginner, Intermediate)"
          value={form.level}
          onChange={handleChange}
          className="mb-4"
          disabled={isSubmitting}
        />
        <input
          type="file"
          onChange={handleFileChange}
          className="block w-full mt-4 text-sm file:bg-green-700 text-gray-500 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:text-white hover:file:bg-green-600"
          disabled={isSubmitting}
        />

        {/* Add Goal Section */}
        <div className="mt-6">
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
      </ModalBody>
      <ModalFooter>
        <LewisButton onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Spinner size="sm" className="mr-2" /> Creating...
            </>
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
