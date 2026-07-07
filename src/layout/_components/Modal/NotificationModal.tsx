"use client";

import { Modal, ModalBody, ModalHeader, Avatar } from "~/components/ui/primitives";
import { BellIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import EmptyState from "~/components/EmptyState";

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
    <Modal show={show} onClose={onClose} size="lg">
      <ModalHeader className="modal-titlebar">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
            <BellIcon className="h-4 w-4" />
          </span>
          <div>
            <h2 className="text-base font-semibold text-slate-950">
              {t("notifications")}
            </h2>
            <p className="mt-1 text-xs font-normal text-slate-500">
              Classroom announcements and updates.
            </p>
          </div>
        </div>
      </ModalHeader>
      <ModalBody className="max-h-[70vh] overflow-y-auto p-0">
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
                className={`flex cursor-pointer items-start gap-3 border-b border-slate-100 px-5 py-3 text-sm transition hover:bg-slate-50 ${
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
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-emerald-800">
                    {a?.announcement?.title}
                  </p>
                  <p className="mt-1 text-slate-700">
                    {a?.announcement?.content}
                  </p>
                  <div className="mt-2 text-xs text-slate-500">
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
          <div className="p-4">
            <EmptyState
              compact
              icon={BellIcon}
              eyebrow="All caught up"
              title="No notifications"
              description="New announcements and classroom reminders will show up here."
            />
          </div>
        )}
      </ModalBody>
    </Modal>
  );
}
