"use client";

import { Modal, ModalBody, ModalFooter, ModalHeader } from "flowbite-react";
import LewisButton from "~/components/partial/LewisButton";

type ConfirmModalProps = {
  show: boolean;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
};

export default function ConfirmModal({
  show,
  title = "Xác nhận hành động",
  description = "Bạn có chắc chắn muốn thực hiện hành động này?",
  confirmText = "Xác nhận",
  cancelText = "Hủy",
  onClose,
  onConfirm,
  isLoading = false,
}: ConfirmModalProps) {
  return (
    <Modal show={show} onClose={onClose}>
      <ModalHeader className="bg-red-600 text-white">{title}</ModalHeader>
      <ModalBody>
        <p className="text-sm text-gray-700">{description}</p>
      </ModalBody>
      <ModalFooter>
        <LewisButton color="red" onClick={onConfirm} disabled={isLoading}>
          {isLoading ? "Đang xử lý..." : confirmText}
        </LewisButton>
        <LewisButton variant="outlined" onClick={onClose} disabled={isLoading}>
          {cancelText}
        </LewisButton>
      </ModalFooter>
    </Modal>
  );
}
