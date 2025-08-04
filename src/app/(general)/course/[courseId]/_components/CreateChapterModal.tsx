"use client";

import { useState } from "react";
import {
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Spinner,
} from "flowbite-react";
import LewisTextInput from "~/components/Partial/LewisTextInput";
import LewisButton from "~/components/Partial/LewisButton";
import { toast } from "react-toastify";
import { courseService } from "~/services/courseService";

type Props = {
  show: boolean;
  onClose: () => void;
  courseId: number;
  existingChapters: { id: number; title: string; order: number }[];
  onCreated?: () => void;
};

export default function CreateChapterModal({
  show,
  onClose,
  courseId,
  existingChapters,
  onCreated,
}: Props) {
  const [form, setForm] = useState({
    title: "",
    order: existingChapters.length + 1,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "order" ? Number(value) : value,
    }));
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      toast.error("Vui lòng nhập tên chương.");
      return;
    }

    setIsSubmitting(true);
    try {
      await courseService.createChapter(courseId, {
        title: form.title.trim(),
        order: form.order,
      });
      toast.success("Tạo chương thành công!");
      onCreated?.();
      onClose();
      setForm({ title: "", order: existingChapters.length + 1 });
    } catch (err: any) {
      console.error(err);
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Không thể tạo chương. Thử lại.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal show={show} onClose={onClose}>
      <ModalHeader className="bg-green text-white">Tạo chương mới</ModalHeader>
      <ModalBody>
        <LewisTextInput
          name="title"
          placeholder="Tên chương"
          value={form.title}
          onChange={handleChange}
          className="mb-4"
          disabled={isSubmitting}
        />
        <LewisTextInput
          name="order"
          placeholder="Thứ tự chương"
          type="number"
          min={1}
          value={form.order}
          onChange={handleChange}
          className="mb-4"
          disabled={isSubmitting}
        />

        {/* Hiển thị danh sách chương hiện tại */}
        <p className="text-sm font-medium mb-2 text-gray-600">
          Chương hiện có:
        </p>
        {existingChapters.length > 0 ? (
          <div className="mt-6">
            <ul className="list-disc ml-6 text-sm text-gray-700 space-y-1">
              {existingChapters
                .sort((a, b) => a.order - b.order)
                .map((c) => (
                  <li key={c.id}>
                    {c.order}. {c.title}
                  </li>
                ))}
            </ul>
          </div>
        ) : (
          <p className="text-sm">Chưa có chương nào.</p>
        )}
      </ModalBody>
      <ModalFooter>
        <LewisButton onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Spinner size="sm" className="mr-2" /> Đang tạo...
            </>
          ) : (
            "Tạo"
          )}
        </LewisButton>
        <LewisButton
          variant="outlined"
          onClick={onClose}
          disabled={isSubmitting}
        >
          Hủy
        </LewisButton>
      </ModalFooter>
    </Modal>
  );
}
