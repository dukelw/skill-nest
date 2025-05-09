/* eslint-disable @typescript-eslint/no-explicit-any */
import { api } from "../lib/axios";
import { AxiosResponse } from "axios";

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/submissions`;

export const submissionService = {
  async getSubmissionById(submissionId: number) {
    const res: AxiosResponse = await api.get(`${API_URL}/${submissionId}`);
    return res.data;
  },

  async getSubmissionOfAssignment(assignmentId: number) {
    const res: AxiosResponse = await api.get(
      `${API_URL}/assignment/${assignmentId}`
    );
    return res.data;
  },

  async createSubmission(data: {
    assignmentId: number;
    userId: number;
    fileUrl: string;
    grade?: number;
  }) {
    const res: AxiosResponse = await api.post(`${API_URL}`, data);
    return res.data;
  },
};
