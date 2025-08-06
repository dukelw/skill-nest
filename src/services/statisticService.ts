/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import axios from "axios";

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/statistics`;

export const statisticService = {
  async getOverview(query?: { fromMonth?: string; toMonth?: string }) {
    try {
      const queryStr = query ? `?${new URLSearchParams(query).toString()}` : "";
      const response = await axios.get(`${API_URL}/overview${queryStr}`);
      return response.data;
    } catch (error: any) {
      console.error("Failed to fetch overview stats:", error);
      throw new Error(
        error?.response?.data?.message || "Failed to fetch overview stats"
      );
    }
  },

  async getTopCourses(query?: { fromMonth?: string; toMonth?: string }) {
    try {
      const queryStr = query ? `?${new URLSearchParams(query).toString()}` : "";
      const response = await axios.get(`${API_URL}/top-courses${queryStr}`);
      return response.data;
    } catch (error: any) {
      console.error("Failed to fetch top courses:", error);
      throw new Error(
        error?.response?.data?.message || "Failed to fetch top courses"
      );
    }
  },

  async getTopUsers(query?: { fromMonth?: string; toMonth?: string }) {
    try {
      const queryStr = query ? `?${new URLSearchParams(query).toString()}` : "";
      const response = await axios.get(`${API_URL}/top-users${queryStr}`);
      return response.data;
    } catch (error: any) {
      console.error("Failed to fetch top users:", error);
      throw new Error(
        error?.response?.data?.message || "Failed to fetch top users"
      );
    }
  },

  async getUserGrowth(year: number) {
    try {
      const response = await axios.get(`${API_URL}/growth?year=${year}`);
      return response.data;
    } catch (error: any) {
      console.error("Failed to fetch growth:", error);
      throw new Error(
        error?.response?.data?.message || "Failed to fetch growth"
      );
    }
  },
};
