/* eslint-disable @typescript-eslint/no-explicit-any */
import { api } from "../lib/axios";
import { AxiosResponse } from "axios";

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/courses`;

export const courseService = {
  // Lấy tất cả khóa học
  async getAll(): Promise<any> {
    const res: AxiosResponse = await api.get(`${API_URL}`);
    return res.data;
  },

  // Tạo mới khóa học
  async create(data: {
    title: string;
    description?: string;
    thumbnail?: string;
    introVideoUrl?: string;
    isFree?: boolean;
    level?: string;
    creatorId: number;
  }): Promise<any> {
    const res: AxiosResponse = await api.post(`${API_URL}`, data);
    return res.data;
  },

  async update(
    courseId: number,
    data: {
      title: string;
      description?: string;
      thumbnail?: string;
      introVideoUrl?: string;
      isFree?: boolean;
      level?: string;
      creatorId: number;
    }
  ): Promise<any> {
    const res: AxiosResponse = await api.post(
      `${API_URL}/${courseId}/update`,
      data
    );
    return res.data;
  },

  async getDetail(courseId: number): Promise<any> {
    const res: AxiosResponse = await api.get(`${API_URL}/${courseId}`);
    return res.data;
  },

  async getCoursesOfUser(courseId: number): Promise<any> {
    const res: AxiosResponse = await api.get(`${API_URL}/${courseId}/user`);
    return res.data;
  },

  async getLessonDetail(lessonId: number): Promise<any> {
    const res: AxiosResponse = await api.get(`${API_URL}/${lessonId}/lesson`);
    return res.data;
  },

  async getMembers(courseId: number): Promise<any> {
    const res: AxiosResponse = await api.get(`${API_URL}/${courseId}/members`);
    return res.data;
  },

  async addGoals(courseId: number, goals: string[]): Promise<any> {
    const res: AxiosResponse = await api.post(`${API_URL}/${courseId}/goals`, {
      goals,
    });
    return res.data;
  },

  async updateGoals(courseId: number, goals: string[]): Promise<any> {
    const res: AxiosResponse = await api.patch(`${API_URL}/${courseId}/goals`, {
      goals,
    });
    return res.data;
  },

  async updateChapter(
    chapterId: number,
    title: string,
    order: number
  ): Promise<any> {
    const res: AxiosResponse = await api.patch(
      `${API_URL}/${chapterId}/chapter`,
      {
        title,
        order,
      }
    );
    return res.data;
  },

  async deleteChapters(chapterIds: number[]): Promise<any> {
    const res: AxiosResponse = await api.delete(`${API_URL}/chapter`, {
      data: {
        chapterIds,
      },
    });
    return res.data;
  },

  async deleteCourse(courseId: number): Promise<any> {
    const res: AxiosResponse = await api.delete(`${API_URL}/course`, {
      data: {
        courseId,
      },
    });
    return res.data;
  },

  async createChapter(
    courseId: number,
    data: {
      title: string;
      order: number;
    }
  ): Promise<any> {
    const res: AxiosResponse = await api.post(
      `${API_URL}/${courseId}/chapters`,
      data
    );
    return res.data;
  },

  async createLesson(
    courseId: number,
    data: {
      name: string;
      contentUrl?: string;
      thumbnail?: string;
      duration?: number;
      chapterId: number;
    }
  ): Promise<any> {
    const res: AxiosResponse = await api.post(
      `${API_URL}/${courseId}/lessons`,
      data
    );
    return res.data;
  },

  async enroll(courseId: number, userId: number): Promise<any> {
    const res: AxiosResponse = await api.post(`${API_URL}/${courseId}/enroll`, {
      userId,
    });
    return res.data;
  },

  async review(
    courseId: number,
    data: {
      userId: number;
      rating: number;
      content?: string;
    }
  ): Promise<any> {
    const res: AxiosResponse = await api.post(
      `${API_URL}/${courseId}/review`,
      data
    );
    return res.data;
  },

  async updateStats(courseId: number): Promise<any> {
    const res: AxiosResponse = await api.post(
      `${API_URL}/${courseId}/stats/update`
    );
    return res.data;
  },
};
