/* eslint-disable @typescript-eslint/no-explicit-any */
import { api } from "../lib/axios";
import { AxiosResponse } from "axios";

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/assignments`;

export const assignmentService = {
  async getAssignmentById(quizId: number) {
    const res: AxiosResponse = await api.get(`${API_URL}/${quizId}`);
    return res.data;
  },

  async createAssignment(data: {
    title: string;
    description?: string;
    dueDate: Date;
    classroomId: number;
    fileUrl?: string;
    type?: "HOMEWORK" | "QUIZ" | "DOCUMENT";
    questions?: {
      questionText: string;
      options: string[];
      correctAnswer: string;
    }[];
  }) {
    const res: AxiosResponse = await api.post(`${API_URL}`, data);
    return res.data;
  },

  async deleteAssignments(ids: number[]) {
    const res: AxiosResponse = await api.delete(`${API_URL}`, {
      data: { ids },
    });
    return res.data;
  },

  async deleteAssignment(assignmentId: number) {
    const res: AxiosResponse = await api.delete(`${API_URL}`, {
      data: { assignmentId },
    });
    return res.data;
  },
};
