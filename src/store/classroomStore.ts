import { create } from "zustand";
import { persist } from "zustand/middleware";
import Classroom from "~/models/Classroom";

type ClassroomState = {
  classroom: Classroom | null;
  teacherClassrooms: Classroom[] | null;
  studentClassrooms: Classroom[] | null;
  createdClassroom: Classroom | null;
  setClassroom: (classroom: Classroom) => void;
  setTeacherClassrooms: (classrooms: Classroom[]) => void;
  setStudentClassrooms: (classrooms: Classroom[]) => void;
  setCreatedClassroom: (classroom: Classroom) => void;
};

export const useClassroomStore = create<ClassroomState>()(
  persist(
    (set) => ({
      classroom: null,
      teacherClassrooms: null,
      studentClassrooms: null,
      createdClassroom: null,
      setClassroom: (classroom) => set({ classroom: classroom }),
      setTeacherClassrooms: (classrooms) =>
        set({ teacherClassrooms: classrooms }),
      setStudentClassrooms: (classrooms) =>
        set({ studentClassrooms: classrooms }),
      setCreatedClassroom: (classroom) => set({ createdClassroom: classroom }),
    }),
    { name: "classroom-storage" }
  )
);
