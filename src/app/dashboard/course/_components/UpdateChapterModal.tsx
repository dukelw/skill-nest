"use client";

import { useEffect, useState } from "react";
import {
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Spinner,
} from "flowbite-react";
import LewisTextInput from "~/components/partial/LewisTextInput";
import LewisButton from "~/components/partial/LewisButton";
import { toast } from "react-toastify";
import { courseService } from "~/services/courseService";

type Props = {
  show: boolean;
  onClose: () => void;
  chapterId: number;
  initialTitle: string;
  order: number;
  onUpdated?: () => void;
};

export default function UpdateChapterModal({
  show,
  onClose,
  chapterId,
  initialTitle,
  order,
  onUpdated,
}: Props) {
  const [title, setTitle] = useState(initialTitle);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (show) {
      setTitle(initialTitle);
    }
  }, [initialTitle, show]);

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error("Vui lòng nhập tên chương.");
      return;
    }

    setIsSubmitting(true);
    try {
      await courseService.updateChapter(chapterId, title.trim(), order);
      toast.success("Cập nhật chương thành công!");
      onUpdated?.();
      onClose();
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Không thể cập nhật chương. Thử lại.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal show={show} onClose={onClose}>
      <ModalHeader className="bg-green text-white">Cập nhật chương</ModalHeader>
      <ModalBody>
        <LewisTextInput
          name="title"
          placeholder="Tên chương"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isSubmitting}
        />
      </ModalBody>
      <ModalFooter>
        <LewisButton onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Spinner size="sm" className="mr-2" /> Đang cập nhật...
            </>
          ) : (
            "Cập nhật"
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
