"use client";

import { useRef } from "react";
import { Avatar, Badge } from "flowbite-react";
import { BellIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { FiBell } from "react-icons/fi";

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
      className="relative mx-2 cursor-pointer flex items-center"
      onClick={() => {
        if (isMobile) {
          openModal();
        } else {
          setShowDropdown(!showDropdown);
        }
      }}
      ref={ref}
    >
      <FiBell className="text-white" size={24} />
      {unreadCount > 0 && (
        <Badge
          size="xs"
          className="absolute top-0 right-0 -mt-1 -mr-1 rounded-full px-[6px] py-[2px] text-[10px] font-semibold border-2 border-red z-10 bg-red-600 text-white"
        >
          {unreadCount}
        </Badge>
      )}

      {showDropdown && (
        <div className="absolute right-0 top-full mt-2 w-100 bg-white rounded shadow-lg z-50 text-black">
          <div className="flex items-center justify-between px-4 py-2 border-b font-semibold bg-green text-white">
            <div className="flex items-center">
              <BellIcon className="w-5 h-5 inline-block mr-2" />
              {t("notifications")}
            </div>
            <div className="flex items-center gap-1 ml-2">
              <button
                className="text-white-500 text-xs hover:underline"
                onClick={(e) => {
                  e.stopPropagation();
                  markAllAsRead();
                }}
              >
                {t("markAllAsRead")}
              </button>
              <button
                className="text-red-600 text-xs hover:underline ml-1"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteAll();
                }}
              >
                {t("deleteAll")}
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
                    className={`flex items-start px-4 py-2 gap-2 border-b text-sm cursor-pointer hover:bg-gray-100 ${
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
                      <p className="text-green font-bold">
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
              <p className="text-center text-sm p-6">No announcement</p>
            )}
          </ul>

          <div
            className="text-center text-green-600 text-sm py-2 hover:underline cursor-pointer"
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
