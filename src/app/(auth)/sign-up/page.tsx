"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useTranslation } from "react-i18next";

export default function SignUp() {
  const { t } = useTranslation();

  const [form, setForm] = useState({
    fullname: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-sm w-full p-6 bg-white rounded shadow-md">
        <h1 className="text-2xl font-bold mb-4 text-center">{t("signup")}</h1>
        <form className="space-y-4">
          <input
            name="fullname"
            value={form.fullname}
            onChange={handleChange}
            placeholder={t("fullname")}
            className="w-full p-2 border rounded"
          />
          <input
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder={t("email")}
            className="w-full p-2 border rounded"
          />
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder={t("password")}
            className="w-full p-2 border rounded"
          />
          <input
            name="confirmPassword"
            type="password"
            value={form.confirmPassword}
            onChange={handleChange}
            placeholder={t("confirmPassword")}
            className="w-full p-2 border rounded"
          />
          <button
            type="submit"
            className="w-full py-2 bg-blue-500 text-white rounded"
          >
            {t("submit")}
          </button>
        </form>
      </div>
    </div>
  );
}
