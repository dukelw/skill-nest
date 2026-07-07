"use client";

import { useRef } from "react";
import { Avatar, Badge } from "~/components/ui/primitives";
import { BellIcon, CheckCheck, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { FiBell } from "react-icons/fi";
import EmptyState from "~/components/EmptyState";

type AnnouncementReceiver = {
  id: number;
  isRead?: boolean;
  user?: { avatar?: string };
  announcement?: {
    title?: string;
    content?: string;
    href?: string;
    createdAt?: string;
  };
};

interface Props {
  announcements: AnnouncementReceiver[];
  isMobile: boolean;
  showDropdown: boolean;
  setShowDropdown: (value: boolean) => void;
  openModal: () => void;
  markAsRead: (id: number) => void;
  deleteAnnouncement: (id: number) => void;
  markAllAsRead: () => void;
  deleteAll: () => void;
}

export default function NotificationDropdown({
  announcements,
  isMobile,
  showDropdown,
  setShowDropdown,
  openModal,
  markAsRead,
  deleteAnnouncement,
  markAllAsRead,
  deleteAll,
}: Props) {
  const { t } = useTranslation();
  const router = useRouter();
  const ref = useRef(null);

  const unreadCount = announcements?.filter((a) => !a.isRead)?.length || 0;

  return (
    <div
      className="relative mx-1 flex cursor-pointer items-center"
      onClick={() => {
        if (isMobile) {
          openModal();
        } else {
          setShowDropdown(!showDropdown);
        }
      }}
      ref={ref}
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-full border border-emerald-100 bg-[#eef7ef] text-slate-700 transition hover:bg-[#dcf5e2] hover:text-emerald-700">
        <FiBell size={18} />
      </span>
      {unreadCount > 0 && (
        <Badge
          size="xs"
          className="absolute top-0 right-0 -mt-1 -mr-1 rounded-full px-[6px] py-[2px] text-[10px] font-semibold border-2 border-red z-10 bg-red-600 text-white"
        >
          {unreadCount}
        </Badge>
      )}

      {showDropdown && (
        <div className="absolute right-0 top-full z-50 mt-3 w-100 overflow-hidden rounded-lg border border-emerald-100 bg-[#f7fbf7] text-slate-900 shadow-xl shadow-slate-900/10">
          <div className="flex items-center justify-between border-b border-emerald-100 bg-[#eef7ef] px-4 py-3 font-semibold text-slate-950">
            <div className="flex items-center">
              <BellIcon className="w-5 h-5 inline-block mr-2" />
              {t("notifications")}
            </div>
            <div className="flex items-center gap-1 ml-2">
              <button
                title={t("markAllAsRead")}
                aria-label={t("markAllAsRead")}
                className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-emerald-100 bg-[#f7fbf7] text-emerald-700 transition hover:bg-[#dcf5e2]"
                onClick={(e) => {
                  e.stopPropagation();
                  markAllAsRead();
                }}
              >
                <CheckCheck className="h-4 w-4" />
              </button>
              <button
                title={t("deleteAll")}
                aria-label={t("deleteAll")}
                className="ml-1 inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-red-100 bg-red-50 text-red-600 transition hover:bg-red-100"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteAll();
                }}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          <ul className="max-h-60 overflow-y-auto">
            {announcements?.length > 0 ? (
              announcements
                ?.sort(
                  (a, b) =>
                    new Date(b?.announcement?.createdAt || "").getTime() -
                    new Date(a?.announcement?.createdAt || "").getTime()
                )
                .map((a) => (
                  <li
                    key={a.id}
                    className={`flex items-start px-4 py-3 gap-3 border-b border-emerald-50 text-sm cursor-pointer hover:bg-emerald-50/70 ${
                      a?.isRead ? "opacity-60" : ""
                    }`}
                    onClick={() => {
                      router.push(
                        `${process.env.NEXT_PUBLIC_CLIENT_URL}${
                          a?.announcement?.href || ""
                        }`
                      );
                      setShowDropdown(false);
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
                      <p className="font-bold text-emerald-800">
                        {a?.announcement?.title}
                      </p>
                      <p className="text-gray-800">
                        {a?.announcement?.content}
                      </p>
                      <div className="text-xs text-gray-500 mt-1">
                        {(() => {
                          const createdAt = a?.announcement?.createdAt;
                          return createdAt && !isNaN(Date.parse(createdAt))
                            ? new Date(createdAt).toLocaleString()
                            : "Không rõ thời gian";
                        })()}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1 ml-2">
                      {!a?.isRead && (
                        <button
                          className="text-blue-500 text-xs hover:underline"
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(a?.id);
                          }}
                        >
                          {t("markAsRead")}
                        </button>
                      )}
                      <button
                        className="text-red-500 text-xs hover:underline"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteAnnouncement(a?.id);
                        }}
                      >
                        {t("delete")}
                      </button>
                    </div>
                  </li>
                ))
            ) : (
              <li className="p-3">
                <EmptyState
                  compact
                  icon={BellIcon}
                  eyebrow="All caught up"
                  title="No notifications"
                  description="Classroom updates, announcements, and reminders will appear here."
                />
              </li>
            )}
          </ul>

          <div
            className="cursor-pointer bg-emerald-50 py-3 text-center text-sm font-medium text-emerald-700 hover:bg-emerald-100"
            onClick={() => {
              router.push("/notifications");
              setShowDropdown(false);
            }}
          >
            {t("viewAll")}
          </div>
        </div>
      )}
    </div>
  );
}
