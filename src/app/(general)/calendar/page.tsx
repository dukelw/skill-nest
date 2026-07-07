/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { classroomService } from "~/services/classroomService";
import { useAuthStore } from "~/store/authStore";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import weekday from "dayjs/plugin/weekday";
import Assignment from "~/models/Assignment";
import Classroom from "~/models/Classroom";
import { useTranslation } from "react-i18next";
import useIsMobile from "~/hooks/useIsMobile";
import {
  CalendarCheck2,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  School,
  User,
} from "lucide-react";
import EmptyState from "~/components/EmptyState";

dayjs.extend(isoWeek);
dayjs.extend(weekday);

function Calendar() {
  const { user } = useAuthStore();
  const [allAssignments, setAllAssignments] = useState<Assignment[]>([]);
  const [currentWeekStart, setCurrentWeekStart] = useState(
    dayjs().startOf("isoWeek")
  );
  const { t } = useTranslation();
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!user?.id) return;

    const fetchClasses = async () => {
      try {
        const [studentRes, teacherRes] = await Promise.all([
          classroomService.getStudentRole(user?.id),
          classroomService.getTeacherRole(user?.id),
        ]);

        const formatAssignments = (classes: Classroom[], role: string) =>
          classes.flatMap((cls) =>
            cls.assignments.map((a) => ({
              ...a,
              classroomName: cls.name,
              role,
              classroomId: cls.id,
              dueDate: a.dueDate,
            }))
          );

        const studentAssignments = formatAssignments(studentRes, "studying");
        const teacherAssignments = formatAssignments(teacherRes, "teaching");

        setAllAssignments([...studentAssignments, ...teacherAssignments]);
      } catch (err) {
        console.error("Error loading classes", err);
      }
    };

    fetchClasses();
  }, [user?.id]);

  const daysOfWeek = Array.from({ length: 7 }, (_, i) =>
    currentWeekStart.add(i, "day")
  );

  const getBadgeColor = (type: string) => {
    switch (type) {
      case "DOCUMENT":
        return "border-sky-200 bg-sky-50 text-sky-700";
      case "QUIZ":
        return "border-amber-200 bg-amber-50 text-amber-700";
      default:
        return "border-emerald-200 bg-emerald-50 text-emerald-700";
    }
  };

  const assignmentsByDay = (day: any) => {
    return allAssignments.filter((a) => dayjs(a.dueDate).isSame(day, "day"));
  };

  const visibleDays = isMobile ? [selectedDate] : daysOfWeek;
  const weekAssignments = daysOfWeek.flatMap((day) => assignmentsByDay(day));
  const todayAssignments = assignmentsByDay(dayjs());

  if (!user) {
    return (
      <EmptyState
        compact
        icon={CalendarDays}
        eyebrow="Calendar"
        title={t("calendarPage.noUser")}
        description="Sign in to view classroom deadlines and teaching activity."
      />
    );
  }

  return (
    <main className="space-y-6">
      <section className="detail-panel overflow-hidden">
        <div className="border-b border-emerald-100 bg-[#eef7ef] px-6 py-6">
          <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">
            Study calendar
          </p>
          <div className="mt-2 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-950">
                Calendar
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                Follow upcoming homework, quizzes and shared materials across every classroom.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-emerald-100 bg-[#f7fbf7] px-4 py-3">
                <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">
                  Today
                </p>
                <p className="mt-1 text-2xl font-extrabold text-slate-950">
                  {todayAssignments.length}
                </p>
              </div>
              <div className="rounded-xl border border-emerald-100 bg-[#f7fbf7] px-4 py-3">
                <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">
                  This week
                </p>
                <p className="mt-1 text-2xl font-extrabold text-slate-950">
                  {weekAssignments.length}
                </p>
              </div>
              <div className="hidden rounded-xl border border-emerald-100 bg-[#f7fbf7] px-4 py-3 sm:block">
                <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">
                  Total
                </p>
                <p className="mt-1 text-2xl font-extrabold text-slate-950">
                  {allAssignments.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-5 flex flex-col gap-3 rounded-xl border border-emerald-100 bg-[#f7fbf7] p-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-[#eef7ef] px-4 text-sm font-bold text-emerald-800 transition hover:bg-emerald-50"
              onClick={() =>
                isMobile
                  ? setSelectedDate(selectedDate.subtract(1, "day"))
                  : setCurrentWeekStart(currentWeekStart.subtract(1, "week"))
              }
            >
              <ChevronLeft className="h-4 w-4" />
              {isMobile
                ? t("calendarPage.previousDay")
                : t("calendarPage.previousWeek")}
            </button>

            <div className="text-center">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                {isMobile ? "Selected day" : "Current week"}
              </p>
              <h2 className="mt-1 text-lg font-extrabold text-slate-950">
                {isMobile
                  ? selectedDate.format("DD/MM/YYYY")
                  : t("calendarPage.weekRange", {
                      start: currentWeekStart.format("DD/MM/YYYY"),
                      end: currentWeekStart.add(6, "day").format("DD/MM/YYYY"),
                    })}
              </h2>
            </div>

            <button
              className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-[#eef7ef] px-4 text-sm font-bold text-emerald-800 transition hover:bg-emerald-50"
              onClick={() =>
                isMobile
                  ? setSelectedDate(selectedDate.add(1, "day"))
                  : setCurrentWeekStart(currentWeekStart.add(1, "week"))
              }
            >
              {isMobile ? t("calendarPage.nextDay") : t("calendarPage.nextWeek")}
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className={isMobile ? "grid gap-4" : "grid grid-cols-7 gap-3"}>
            {visibleDays.map((day) => {
              const items = assignmentsByDay(day);
              const isToday = dayjs().isSame(day, "day");

              return (
                <section
                  key={day.toString()}
                  className={`flex min-h-[480px] flex-col rounded-xl border p-3 shadow-sm ${
                    isToday
                      ? "border-emerald-300 bg-emerald-50"
                      : "border-emerald-100 bg-[#f7fbf7]"
                  }`}
                >
                  <header className="mb-3 rounded-lg bg-white/70 p-3 text-center">
                    <p className="text-sm font-extrabold text-slate-950">
                      {day.format("dddd")}
                    </p>
                    <p className="mt-1 text-xs font-bold text-slate-500">
                      {day.format("DD/MM/YYYY")}
                    </p>
                  </header>

                  <div className="flex-1 space-y-3">
                    {items.length === 0 ? (
                      <div className="flex h-full min-h-40 flex-col items-center justify-center rounded-xl border border-dashed border-emerald-200 bg-[#eef7ef] px-3 text-center">
                        <CalendarCheck2 className="h-5 w-5 text-emerald-700" />
                        <p className="mt-2 text-xs font-bold text-slate-500">
                          No deadlines
                        </p>
                      </div>
                    ) : (
                      items.map((a) => (
                        <article
                          key={a.id}
                          className="rounded-xl border border-emerald-100 bg-white p-3 shadow-sm"
                        >
                          <span
                            className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-extrabold ${getBadgeColor(
                              a.type
                            )}`}
                          >
                            {a.type}
                          </span>
                          <h3 className="mt-3 line-clamp-2 text-sm font-extrabold leading-5 text-slate-950">
                            {a.title}
                          </h3>
                          <div className="mt-3 space-y-2 text-xs font-semibold text-slate-500">
                            <p className="flex items-center gap-2">
                              <Clock className="h-3.5 w-3.5 text-emerald-700" />
                              {t("calendarPage.time", {
                                time: dayjs(a.dueDate).format("HH:mm"),
                              })}
                            </p>
                            <p className="flex items-center gap-2">
                              <School className="h-3.5 w-3.5 text-emerald-700" />
                              {t("calendarPage.classroom", {
                                name: a.classroomName,
                              })}
                            </p>
                            <p className="flex items-center gap-2">
                              <User className="h-3.5 w-3.5 text-emerald-700" />
                              {t("calendarPage.role", {
                                role:
                                  a.role === "teaching"
                                    ? t("calendarPage.teacher")
                                    : t("calendarPage.student"),
                              })}
                            </p>
                          </div>
                        </article>
                      ))
                    )}
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}

export default Calendar;
