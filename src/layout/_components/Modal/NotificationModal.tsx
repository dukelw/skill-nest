"use client";

import { Modal, ModalBody, ModalHeader, Avatar } from "flowbite-react";
import { BellIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

type AnnouncementItem = {
  user?: { avatar?: string };
  isRead?: boolean;
  announcement?: {
    title?: string;
    content?: string;
    createdAt?: string;
    href?: string;
  };
};

type Props = {
  show: boolean;
  onClose: () => void;
  announcements?: AnnouncementItem[];
};

export default function NotificationModal({
  show,
  onClose,
  announcements = [],
}: Props) {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <Modal show={show} onClose={onClose}>
      <ModalHeader className="bg-green-500 text-white">
        <BellIcon className="w-5 h-5 inline-block mr-2" />
        {t("notifications")}
      </ModalHeader>
      <ModalBody className="p-0 max-h-[70vh] overflow-y-auto">
        {announcements.length > 0 ? (
          announcements
            .sort(
              (a, b) =>
                new Date(b?.announcement?.createdAt || "").getTime() -
                new Date(a?.announcement?.createdAt || "").getTime()
            )
            .map((a, index) => (
              <div
                key={index}
                className={`flex items-start px-4 py-2 gap-2 border-b text-sm cursor-pointer hover:bg-gray-100 ${
                  a?.isRead ? "opacity-60" : ""
                }`}
                onClick={() => {
                  router.push(
                    `${process.env.NEXT_PUBLIC_CLIENT_URL}${
                      a?.announcement?.href || ""
                    }`
                  );
                  onClose();
                }}
              >
                <Avatar
                  img={
                    a?.user?.avatar ||
                    "https://cdn-icons-png.freepik.com/512/3607/3607444.png"
                  }
                  rounded
                  size="sm"
                  alt="avatar"
                />
                <div className="flex-1">
                  <p className="text-green font-bold">
                    {a?.announcement?.title}
                  </p>
                  <p className="text-gray-800">{a?.announcement?.content}</p>
                  <div className="text-xs text-gray-500 mt-1">
                    {(() => {
                      const createdAt = a?.announcement?.createdAt;
                      return createdAt && !isNaN(Date.parse(createdAt))
                        ? new Date(createdAt).toLocaleString()
                        : "Không rõ thời gian";
                    })()}
                  </div>
                </div>
              </div>
            ))
        ) : (
          <p className="text-center text-sm p-6">No announcement</p>
        )}
      </ModalBody>
    </Modal>
  );
}
