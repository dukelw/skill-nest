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
        return "bg-blue-100 text-blue-700";
      case "QUIZ":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-purple-100 text-purple-700";
    }
  };

  const assignmentsByDay = (day: any) => {
    return allAssignments.filter((a) => dayjs(a.dueDate).isSame(day, "day"));
  };

  if (!user) {
    return (
      <p className="text-gray-500 p-4 text-center">
        {t("calendarPage.noUser")}
      </p>
    );
  }

  return (
    <div className="p-6 min-h-full bg-white/80 rounded-xl shadow-lg">
      <div className="mb-6 flex justify-between items-center">
        <button
          className="text-sm text-green-600 hover:underline"
          onClick={() =>
            isMobile
              ? setSelectedDate(selectedDate.subtract(1, "day"))
              : setCurrentWeekStart(currentWeekStart.subtract(1, "week"))
          }
        >
          {isMobile
            ? t("calendarPage.previousDay")
            : t("calendarPage.previousWeek")}
        </button>

        <h2 className="text-xl font-semibold text-green-700 tracking-wide drop-shadow-sm">
          {isMobile
            ? selectedDate.format("DD/MM/YYYY")
            : t("calendarPage.weekRange", {
                start: currentWeekStart.format("DD/MM/YYYY"),
                end: currentWeekStart.add(6, "day").format("DD/MM/YYYY"),
              })}
        </h2>

        <button
          className="text-sm text-green-600 hover:underline"
          onClick={() =>
            isMobile
              ? setSelectedDate(selectedDate.add(1, "day"))
              : setCurrentWeekStart(currentWeekStart.add(1, "week"))
          }
        >
          {isMobile ? t("calendarPage.nextDay") : t("calendarPage.nextWeek")}
        </button>
      </div>

      {isMobile ? (
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 shadow-sm">
          <div className="text-center mb-2">
            <h3 className="text-base font-semibold text-green-700">
              {selectedDate.format("dddd")}
            </h3>
            <p className="text-sm text-gray-500">
              {selectedDate.format("DD/MM/YYYY")}
            </p>
          </div>
          {assignmentsByDay(selectedDate).map((a) => (
            <div
              key={a.id}
              className="mb-2 p-3 rounded-lg bg-white border border-gray-300 shadow-sm"
            >
              <div className="font-medium text-gray-800 flex justify-between items-start">
                {a.title}
                <span
                  className={`ml-2 px-2 py-0.5 text-xs font-medium rounded-full ${getBadgeColor(
                    a.type
                  )}`}
                >
                  {a.type}
                </span>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {t("calendarPage.time", {
                  time: dayjs(a.dueDate).format("HH:mm"),
                })}
              </div>
              <div className="text-xs text-gray-500">
                {t("calendarPage.classroom", { name: a.classroomName })}
              </div>
              <div className="text-xs text-gray-500">
                {t("calendarPage.role", {
                  role:
                    a.role === "teaching"
                      ? t("calendarPage.teacher")
                      : t("calendarPage.student"),
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-4">
          {daysOfWeek.map((day) => (
            <div
              key={day.toString()}
              className="min-h-[540px] bg-gray-50 rounded-lg p-3 border border-gray-200 shadow-sm flex flex-col"
            >
              <div className="text-center mb-2">
                <h3 className="text-base font-semibold text-green-700">
                  {day.format("dddd")}
                </h3>
                <p className="text-sm text-gray-500">
                  {day.format("DD/MM/YYYY")}
                </p>
              </div>
              {assignmentsByDay(day).map((a) => (
                <div
                  key={a.id}
                  className="mb-2 p-3 rounded-lg bg-white border border-gray-300 shadow-sm"
                >
                  <span
                    className={`mx-auto px-2 py-1 mb-2 text-center text-xs font-medium rounded-full block w-full ${getBadgeColor(
                      a.type
                    )}`}
                  >
                    {a.type}
                  </span>
                  <div className="font-medium text-gray-800 flex justify-between items-start">
                    {a.title}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {t("calendarPage.time", {
                      time: dayjs(a.dueDate).format("HH:mm"),
                    })}
                  </div>
                  <div className="text-xs text-gray-500">
                    {t("calendarPage.classroom", { name: a.classroomName })}
                  </div>
                  <div className="text-xs text-gray-500">
                    {t("calendarPage.role", {
                      role:
                        a.role === "teaching"
                          ? t("calendarPage.teacher")
                          : t("calendarPage.student"),
                    })}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Calendar;
