/* eslint-disable @typescript-eslint/no-explicit-any */
import { api } from "../lib/axios";
import { AxiosResponse } from "axios";

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/notifications`;

export const notificationService = {
  async createNotification(data: {
    title: string;
    content?: string;
    classroomId: number;
    recipientIds?: number[];
  }) {
    const res: AxiosResponse = await api.post(`${API_URL}`, data);
    return res.data;
  },

  async deleteNotifications(ids: number[]) {
    const res: AxiosResponse = await api.delete(`${API_URL}`, {
      data: { ids },
    });
    return res.data;
  },
};
