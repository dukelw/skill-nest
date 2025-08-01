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

      await axios.post("/api/login", {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
      });

      return response.data;
    } catch (error) {
      throw new Error("Invalid credentials");
    }
  },

  async signInOAuth(email: string, name: string, image?: string) {
    try {
      const response: AxiosResponse = await axios.post(`${API_URL}/oauth`, {
        email,
        name,
        image,
      });
      console.log(email, name, image, response);

      const { tokens } = response.data;

      // Lưu token vào localStorage và cookie
      setAccessToken(tokens.access_token);
      localStorage.setItem("refresh_token", tokens.refresh_token); // Lưu refresh token vào localStorage

      await axios.post("/api/login", {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
      });

      return response.data;
    } catch (error) {
      console.error("OAuth login failed:", error);
      throw new Error("OAuth login failed");
    }
  },

  async logout() {
    try {
      await axios.post("/api/logout");

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

  // Gửi yêu cầu gửi mã OTP qua email
  async requestResetPassword(email: string) {
    try {
      const res = await axios.post(`${API_URL}/request-reset-password`, {
        email,
      });
      return res.data;
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.message || "Failed to request OTP"
      );
    }
  },

  // Xác thực mã OTP và đổi mật khẩu mới
  async verifyResetPassword(email: string, token: string, newPassword: string) {
    try {
      const res = await axios.post(`${API_URL}/verify-reset-password`, {
        email,
        token,
        password: newPassword,
      });
      return res.data;
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.message || "Failed to reset password"
      );
    }
  },
};
