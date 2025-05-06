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
};
