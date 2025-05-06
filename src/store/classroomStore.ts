/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";
import { persist } from "zustand/middleware";

type ClassroomState = {
  classrooms: any;
  createdClassroom: any;
  setClassrooms: (classrooms: any) => void;
  setCreatedClassroom: (classroom: any) => void;
};

export const useClassroomStore = create<ClassroomState>()(
  persist(
    (set) => ({
      classrooms: null,
      createdClassroom: null,
      setClassrooms: (classrooms) => set({ classrooms }),
      setCreatedClassroom: (classroom) => set({ createdClassroom: classroom }),
    }),
    { name: "classroom-storage" }
  )
);
