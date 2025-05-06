/* eslint-disable @typescript-eslint/no-unused-vars */
// services/authService.ts
import { api } from "../lib/axios";
import {
  getAccessToken,
  setAccessToken,
  removeAccessToken,
} from "~/utils/token";
import axios, { AxiosResponse } from "axios";

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/auth`;

export const authService = {
  async signUp(name: string, email: string, password: string) {
    try {
      const response: AxiosResponse = await axios.post(`${API_URL}/signup`, {
        name,
        email,
        password,
      });
      const { access_token, refresh_token } = response.data;

      // Lưu token vào localStorage và cookie
      setAccessToken(access_token);
      localStorage.setItem("refresh_token", refresh_token); // Lưu refresh token vào localStorage

      return response;
    } catch (error) {
      throw new Error("Failed to sign up");
    }
  },

  // Đăng nhập
  async signIn(email: string, password: string) {
    try {
      const response: AxiosResponse = await axios.post(`${API_URL}/signin`, {
        email,
        password,
      });
      const { tokens } = response.data;

      // Lưu token vào localStorage và cookie
      setAccessToken(tokens.access_token);
      localStorage.setItem("refresh_token", tokens.refresh_token); // Lưu refresh token vào localStorage

      return response.data;
    } catch (error) {
      throw new Error("Invalid credentials");
    }
  },

  // Đăng xuất
  async logout() {
    try {
      await axios.post(`${API_URL}/logout`);
      removeAccessToken();
      localStorage.removeItem("refresh_token");
    } catch (error) {
      throw new Error("Failed to log out");
    }
  },

  async getProfile() {
    const res = await api.get("/users/profile");
    return res.data; // user info
  },

  // Làm mới token (sử dụng refresh_token)
  async refreshTokens(refreshToken: string) {
    try {
      const response: AxiosResponse = await axios.post(`${API_URL}/refresh`, {
        refresh_token: refreshToken,
      });
      const { access_token, refresh_token } = response.data;

      // Lưu token mới vào localStorage và cookie
      setAccessToken(access_token);
      localStorage.setItem("refresh_token", refresh_token); // Lưu refresh token vào localStorage

      return response.data;
    } catch (error) {
      throw new Error("Failed to refresh tokens");
    }
  },
};
