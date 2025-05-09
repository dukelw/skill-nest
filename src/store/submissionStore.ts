import { create } from "zustand";
import { persist } from "zustand/middleware";
import Submission from "~/models/Submission";

type SubmissionState = {
  submission: Submission | null;
  submissions: Submission[];
  setSubmission: (submission: Submission) => void;
  setSubmissions: (submissions: Submission[]) => void;
};

export const useSubmissionStore = create<SubmissionState>()(
  persist(
    (set) => ({
      submission: null,
      submissions: [],
      setSubmission: (submission) => set({ submission }),
      setSubmissions: (submissions) => set({ submissions }),
    }),
    { name: "submission-storage" }
  )
);
