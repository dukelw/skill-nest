"use client";

import { useState, useEffect } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Label,
  Spinner,
} from "flowbite-react";
import { toast } from "react-toastify";
import { courseService } from "~/services/courseService";
import LewisTextInput from "~/components/partial/LewisTextInput";

interface LessonModalProps {
  open: boolean;
  onClose: () => void;
  chapterId: number;
  chapterName: string;
  courseId: number;
  initialData?: {
    id?: number;
    name: string;
    contentUrl: string;
    thumbnail: string;
    duration: number;
  } | null;
  isEdit?: boolean;
  onSuccess?: () => void;
}

const formatSecondsToTime = (seconds: number) => {
  const hrs = Math.floor(seconds / 3600)
    .toString()
    .padStart(2, "0");
  const mins = Math.floor((seconds % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const secs = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${hrs}:${mins}:${secs}`;
};

export default function LessonModal({
  open,
  onClose,
  chapterId,
  chapterName,
  courseId,
  initialData,
  isEdit = false,
  onSuccess,
}: LessonModalProps) {
  const [name, setName] = useState("");
  const [contentUrl, setContentUrl] = useState("");
  const [duration, setDuration] = useState("00:00:00");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || "");
      setContentUrl(initialData.contentUrl || "");
      setDuration(formatSecondsToTime(initialData.duration || 0));
    } else {
      setName("");
      setContentUrl("");
      setDuration("00:00:00");
    }
  }, [initialData]);

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("Tên bài học không được để trống");
      return;
    }

    setLoading(true);
    try {
      if (isEdit && initialData?.id) {
        // Update lesson
        await courseService.updateLesson(courseId, initialData.id, {
          name,
          contentUrl,
          duration: convertTimeToSeconds(duration),
        });

        toast.success("Cập nhật bài học thành công!");
      } else {
        // Create new lesson
        await courseService.createLesson(courseId, {
          name,
          contentUrl,
          duration: convertTimeToSeconds(duration),
          chapterId,
        });

        toast.success("Tạo bài học thành công!");
      }

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const convertTimeToSeconds = (timeStr: string) => {
    const [hh = "0", mm = "0", ss = "0"] = timeStr.split(":");
    return Number(hh) * 3600 + Number(mm) * 60 + Number(ss);
  };

  return (
    <Modal show={open} onClose={onClose}>
      <ModalHeader className="bg-green text-white">
        {isEdit ? "Chỉnh sửa bài học" : "Tạo bài học mới"}
      </ModalHeader>
      <ModalBody>
        <div className="space-y-3">
          <div>
            <Label className="text-black">Tên bài học</Label>
            <LewisTextInput
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
            />
          </div>
          <div>
            <Label className="text-black">Link nội dung</Label>
            <LewisTextInput
              value={contentUrl}
              onChange={(e) => setContentUrl(e.target.value)}
              disabled={loading}
            />
          </div>
          <div>
            <Label className="text-black">Thời lượng</Label>
            <LewisTextInput
              placeholder="Thời lượng (HH:mm:ss)"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              disabled={loading}
            />
          </div>
          <div>
            <Label className="text-black">Chapter</Label>
            <LewisTextInput value={chapterName} disabled={true} />
          </div>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? (
            <>
              <Spinner size="sm" className="mr-2" />
              Đang lưu...
            </>
          ) : isEdit ? (
            "Lưu thay đổi"
          ) : (
            "Tạo mới"
          )}
        </Button>
        <Button color="gray" onClick={onClose} disabled={loading}>
          Hủy
        </Button>
      </ModalFooter>
    </Modal>
  );
}
