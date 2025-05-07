/* eslint-disable @typescript-eslint/no-explicit-any */
import { api } from "../lib/axios";
import { AxiosResponse } from "axios";

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/classrooms`;

export const classroomService = {
  async getDetail(classroomId: number) {
    const res: AxiosResponse = await api.get(
      `${API_URL}/detail/${classroomId}`
    );
    return res.data;
  },

  async getAll(userId: number) {
    const res: AxiosResponse = await api.get(`${API_URL}/${userId}`);
    return res.data;
  },

  async getTeacherRole(userId: number) {
    const res: AxiosResponse = await api.get(
      `${API_URL}/teacher-role/${userId}`
    );
    return res.data;
  },

  async getStudentRole(userId: number) {
    const res: AxiosResponse = await api.get(
      `${API_URL}/student-role/${userId}`
    );
    return res.data;
  },

  async create(data: {
    name: string;
    code: string;
    thumbnail: string;
    creatorId: number;
    members?: number[];
  }) {
    const res: AxiosResponse = await api.post(`${API_URL}`, data);
    return res.data;
  },
};
