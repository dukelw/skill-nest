/* eslint-disable @typescript-eslint/no-unused-vars */
import { api } from "../lib/axios";
import axios, { AxiosResponse } from "axios";

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/users`;

export const userService = {
  async getAll() {
    try {
      const response: AxiosResponse = await api.get(`${API_URL}`);

      return response.data;
    } catch (error) {
      throw new Error("Failed to fetch users");
    }
  },

  async updateProfile(data: {
    name?: string;
    phone?: string;
    avatar?: string;
    gender?: string;
  }) {
    try {
      const response: AxiosResponse = await api.put(
        `${API_URL}/update-profile`,
        data
      );
      return response.data;
    } catch (error) {
      throw new Error("Failed to update profile");
    }
  },

  async changePassword(data: { currentPassword: string; newPassword: string }) {
    try {
      const response: AxiosResponse = await api.put(
        `${API_URL}/change-password`,
        data
      );
      return response.data;
    } catch (error) {
      throw new Error("Failed to change password");
    }
  },
};
