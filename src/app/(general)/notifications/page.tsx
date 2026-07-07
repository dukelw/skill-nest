"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar } from "~/components/ui/primitives";
import LewisPagination from "~/components/Partial/LewisPagination";
import useUserAnnouncements from "~/hooks/useUserAnnouncements";
import EmptyState from "~/components/EmptyState";
import {
  Bell,
  BellDot,
  Check,
  CheckCheck,
  Inbox,
  Trash2,
} from "lucide-react";

const PAGE_SIZE = 6;

export default function NotificationPage() {
  const {
    announcements,
    markAsRead,
    deleteAnnouncement,
    markAllAsRead,
    deleteAll,
  } = useUserAnnouncements();
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();

  const sortedAnnouncements = [...announcements].sort(
    (a, b) =>
      new Date(b.announcement.createdAt).getTime() -
      new Date(a.announcement.createdAt).getTime()
  );
  const unreadCount = announcements.filter((item) => !item.isRead).length;
  const paginatedAnnouncements = sortedAnnouncements.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const openAnnouncement = (href?: string | null) => {
    if (!href) return;
    router.push(href);
  };

  return (
    <div className="space-y-6 p-6">
      <section className="rounded-2xl border border-emerald-100 bg-[#f2fbf4] p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">
              Notification center
            </p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950">
              Updates that need your attention
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Classroom announcements, assignment reminders and system updates
              are collected here in one place.
            </p>
          </div>

          <div className="flex flex-wrap justify-end gap-2">
            <button
              type="button"
              onClick={markAllAsRead}
              disabled={!unreadCount}
              className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-emerald-200 bg-white px-3 text-sm font-bold text-emerald-800 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
              title="Mark all as read"
              aria-label="Mark all as read"
            >
              <CheckCheck className="h-4 w-4" />
              Mark all
            </button>
            <button
              type="button"
              onClick={deleteAll}
              disabled={!announcements.length}
              className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 text-sm font-bold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
              title="Delete all"
              aria-label="Delete all"
            >
              <Trash2 className="h-4 w-4" />
              Clear
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-emerald-100 bg-white p-4">
            <Bell className="h-5 w-5 text-emerald-700" />
            <p className="mt-2 text-2xl font-extrabold text-slate-950">
              {announcements.length}
            </p>
            <p className="text-sm font-semibold text-slate-500">Total</p>
          </div>
          <div className="rounded-xl border border-amber-100 bg-amber-50 p-4">
            <BellDot className="h-5 w-5 text-amber-700" />
            <p className="mt-2 text-2xl font-extrabold text-slate-950">
              {unreadCount}
            </p>
            <p className="text-sm font-semibold text-slate-500">Unread</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <Inbox className="h-5 w-5 text-slate-600" />
            <p className="mt-2 text-2xl font-extrabold text-slate-950">
              {Math.ceil(announcements.length / PAGE_SIZE) || 1}
            </p>
            <p className="text-sm font-semibold text-slate-500">Pages</p>
          </div>
        </div>
      </section>

      {paginatedAnnouncements.length > 0 ? (
        <ul className="grid gap-4">
          {paginatedAnnouncements.map((item) => (
            <li
              key={item.id}
              onClick={() => openAnnouncement(item.announcement?.href)}
              className={`group grid cursor-pointer gap-4 rounded-xl border bg-white p-4 shadow-sm transition hover:border-emerald-200 hover:shadow-md md:grid-cols-[auto_1fr_auto] ${
                item.isRead
                  ? "border-slate-200"
                  : "border-emerald-200 bg-[#f7fbf7]"
              }`}
            >
              <Avatar
                img={
                  item.user?.avatar ||
                  "/logo-small.png"
                }
                alt="avatar"
                size="lg"
                rounded
              />

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  {!item.isRead && (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800">
                      New
                    </span>
                  )}
                  <h3 className="truncate text-lg font-extrabold text-slate-950">
                    {item.announcement.title || "Untitled notification"}
                  </h3>
                </div>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
                  {item.announcement.content || "No details were provided."}
                </p>
                <p className="mt-3 text-xs font-semibold text-slate-400">
                  {new Date(item.announcement.createdAt).toLocaleString()}
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 md:flex-col">
                {!item.isRead && (
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      markAsRead(item.id);
                    }}
                    className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800 transition hover:bg-emerald-100"
                    title="Mark as read"
                    aria-label="Mark as read"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    deleteAnnouncement(item.id);
                  }}
                  className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-700 transition hover:bg-red-100"
                  title="Delete notification"
                  aria-label="Delete notification"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          icon={Bell}
          eyebrow="All caught up"
          title="No notifications"
          description="Announcements, class updates, and reminders will appear here when they arrive."
        />
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
