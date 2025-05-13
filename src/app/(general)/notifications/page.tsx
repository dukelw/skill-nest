"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { Avatar, Button } from "flowbite-react";
import LewisPagination from "~/components/partial/LewisPagination";
import useUserAnnouncements from "~/hooks/useUserAnnouncements";

const PAGE_SIZE = 4;

export default function NotificationPage() {
  const { t } = useTranslation();
  const {
    announcements,
    markAsRead,
    deleteAnnouncement,
    markAllAsRead,
    deleteAll,
  } = useUserAnnouncements();
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();

  const paginatedAnnouncements = announcements
    .sort(
      (a, b) =>
        new Date(b.announcement.createdAt).getTime() -
        new Date(a.announcement.createdAt).getTime()
    )
    .slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div className="p-6 mx-auto">
      <h1 className="text-2xl uppercase font-bold mb-4 text-green-600">
        {t("notifications")}
      </h1>
      <div className="flex items-center justify-end">
        <div className="flex items-center justify-end gap-2 mb-4">
          <Button size="xs" color="blue" onClick={markAllAsRead}>
            {t("markAllAsRead")}
          </Button>
          <Button size="xs" color="red" onClick={deleteAll}>
            {t("deleteAll")}
          </Button>
        </div>
      </div>

      {paginatedAnnouncements.length > 0 ? (
        <ul className="space-y-4">
          {paginatedAnnouncements.map((a) => (
            <li
              key={a.id}
              className={`flex gap-4 p-4 rounded-md shadow-sm hover:bg-gray-100 transition ${
                a.isRead ? "opacity-60" : ""
              }`}
              onClick={() =>
                router.push(
                  `${process.env.NEXT_PUBLIC_CLIENT_URL}${a?.announcement?.href}` ||
                    ""
                )
              }
            >
              <Avatar
                img={
                  a.user?.avatar ||
                  "https://cdn-icons-png.freepik.com/512/3607/3607444.png"
                }
                alt="avatar"
                size="md"
                rounded
              />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-green">
                  {a.announcement.title}
                </h3>
                <p>{a.announcement.content}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(a.announcement.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                {!a.isRead && (
                  <Button
                    size="xs"
                    color="blue"
                    onClick={(e) => {
                      e.stopPropagation();
                      markAsRead(a.id);
                    }}
                  >
                    {t("markAsRead")}
                  </Button>
                )}
                <Button
                  size="xs"
                  color="red"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteAnnouncement(a.id);
                  }}
                >
                  {t("delete")}
                </Button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-center text-gray-600 mt-8">{t("noNotification")}</p>
      )}

      {announcements.length > PAGE_SIZE && (
        <div className="mt-6 flex justify-center">
          <LewisPagination
            currentPage={currentPage}
            totalPages={Math.ceil(announcements.length / PAGE_SIZE)}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>
      )}
    </div>
  );
}
