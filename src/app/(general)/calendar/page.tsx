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

dayjs.extend(isoWeek);
dayjs.extend(weekday);

function Calendar() {
  const { user } = useAuthStore();
  const [allAssignments, setAllAssignments] = useState<Assignment[]>([]);
  const [currentWeekStart, setCurrentWeekStart] = useState(
    dayjs().startOf("isoWeek")
  );

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

  const assignmentsByDay = (day: any) => {
    return allAssignments.filter((a) => dayjs(a.dueDate).isSame(day, "day"));
  };

  return (
    <div className="p-6 min-h-full bg-white/80 rounded-xl shadow-lg">
      <div className="mb-6 flex justify-between items-center">
        <button
          className="text-sm text-green-600 hover:underline"
          onClick={() =>
            setCurrentWeekStart(currentWeekStart.subtract(1, "week"))
          }
        >
          ⬅ Tuần trước
        </button>
        <h2 className="text-xl font-semibold text-green-700 tracking-wide drop-shadow-sm">
          Tuần {currentWeekStart.format("DD/MM/YYYY")} -{" "}
          {currentWeekStart.add(6, "day").format("DD/MM/YYYY")}
        </h2>

        <button
          className="text-sm text-green-600 hover:underline"
          onClick={() => setCurrentWeekStart(currentWeekStart.add(1, "week"))}
        >
          Tuần sau ➡
        </button>
      </div>

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
                <div className="font-medium text-gray-800">{a.title}</div>
                <div className="text-xs text-gray-500 mt-1">
                  🕒 {dayjs(a.dueDate).format("HH:mm")}
                </div>
                <div className="text-xs text-gray-500">
                  🏫 {a.classroomName}
                </div>
                <div className="text-xs text-gray-500">
                  🎓 {a.role === "teaching" ? "Giáo viên" : "Học sinh"}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Calendar;
