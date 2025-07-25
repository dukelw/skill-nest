"use client";

import {
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Spinner,
} from "flowbite-react";
import { useState } from "react";
import { Chapter } from "~/models/Chapter";
import { courseService } from "~/services/courseService";
import { toast } from "react-toastify";
import LewisTextInput from "~/components/partial/LewisTextInput";
import LewisButton from "~/components/partial/LewisButton";
import LewisSelect from "~/components/partial/LewisSelect";

type Props = {
  open: boolean;
  onClose: () => void;
  chapters: Chapter[];
  courseId: number;
  onSuccess?: () => void;
};

const convertTimeToSeconds = (timeStr: string) => {
  const [hh = "0", mm = "0", ss = "0"] = timeStr.split(":");
  return Number(hh) * 3600 + Number(mm) * 60 + Number(ss);
};

export default function CreateLessonModal({
  open,
  onClose,
  chapters,
  courseId,
  onSuccess,
}: Props) {
  const [form, setForm] = useState({
    name: "",
    contentUrl: "",
    duration: "00:00:00",
    chapterId: chapters[0]?.id ?? 0,
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.chapterId || !form.duration) {
      toast.error("Vui lòng nhập đầy đủ thông tin.");
      return;
    }

    const durationInSeconds = convertTimeToSeconds(form.duration);

    setLoading(true);
    try {
      await courseService.createLesson(courseId, {
        name: form.name.trim(),
        contentUrl: form.contentUrl,
        duration: durationInSeconds,
        chapterId: form.chapterId,
      });

      toast.success("Tạo bài học thành công!");
      onSuccess?.();
      onClose();

      setForm({
        name: "",
        contentUrl: "",
        duration: "",
        chapterId: chapters[0]?.id ?? 0,
      });
    } catch (err: any) {
      console.error(err);
      toast.error("Tạo bài học thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={open} onClose={onClose}>
      <ModalHeader className="bg-green text-white">Thêm bài học</ModalHeader>
      <ModalBody>
        <div className="space-y-4">
          <LewisTextInput
            name="name"
            placeholder="Tên bài học"
            value={form.name}
            onChange={handleChange}
            disabled={loading}
          />
          <LewisTextInput
            name="contentUrl"
            placeholder="Content URL"
            value={form.contentUrl}
            onChange={handleChange}
            disabled={loading}
          />
          <LewisTextInput
            name="duration"
            placeholder="Thời lượng (HH:mm:ss)"
            value={form.duration}
            onChange={handleChange}
            disabled={loading}
          />
          <LewisSelect
            name="chapterId"
            value={form.chapterId}
            onChange={handleChange}
            disabled={loading}
          >
            {chapters?.map((chapter) => (
              <option key={chapter.id} value={chapter.id}>
                {chapter.title}
              </option>
            ))}
          </LewisSelect>
        </div>
      </ModalBody>
      <ModalFooter>
        <LewisButton onClick={handleSubmit} disabled={loading}>
          {loading ? (
            <>
              <Spinner size="sm" className="mr-2" /> Đang tạo...
            </>
          ) : (
            "Tạo bài học"
          )}
        </LewisButton>
        <LewisButton variant="outlined" onClick={onClose} disabled={loading}>
          Hủy
        </LewisButton>
      </ModalFooter>
    </Modal>
  );
}
