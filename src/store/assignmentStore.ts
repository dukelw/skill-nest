import { create } from "zustand";
import { persist } from "zustand/middleware";
import Assignment from "~/models/Assignment";

type AssignmentState = {
  assignment: Assignment | null;
  setAssignment: (assignment: Assignment) => void;
};

export const useAssignmentStore = create<AssignmentState>()(
  persist(
    (set) => ({
      assignment: null,
      setAssignment: (assignment) => set({ assignment: assignment }),
    }),
    { name: "assignment-storage" }
  )
);
