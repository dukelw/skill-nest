/* eslint-disable @typescript-eslint/no-explicit-any */
import { api } from "../lib/axios";
import { AxiosResponse } from "axios";

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/announcements`;

export const announcementService = {
  async createAnnouncement(data: {
    title: string;
    content: string;
    href: string;
    senderId: number;
    userIds: number[];
  }) {
    const res: AxiosResponse = await api.post(`${API_URL}`, data);
    return res.data;
  },

  async markAsRead(announcementId: number) {
    const res: AxiosResponse = await api.put(
      `${API_URL}/${announcementId}/read`
    );
    return res.data;
  },

  async markAllAsRead(userId: number) {
    const res: AxiosResponse = await api.put(`${API_URL}/read-all/${userId}`);
    return res.data;
  },

  async deleteAnnouncement(announcementId: number) {
    const res: AxiosResponse = await api.delete(`${API_URL}/${announcementId}`);
    return res.data;
  },

  async deleteAllUserAnnouncements(userId: number) {
    const res: AxiosResponse = await api.delete(`${API_URL}/all/${userId}`);
    return res.data;
  },
};
