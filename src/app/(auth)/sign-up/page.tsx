"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { TextInput, Label, Checkbox } from "flowbite-react";
import { FaGoogle, FaFacebook } from "react-icons/fa";
import Link from "next/link";
import LewisButton from "~/components/partial/LewisButton";
import "../../../i18n/client";
import { i18n } from "next-i18next";

export default function SignUp() {
  const { t } = useTranslation();

  const [form, setForm] = useState({
    fullname: "",
    email: "",
    password: "",
    confirmPassword: "",
    remember: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  return (
    <div
      lang={i18n?.language}
      className="w-full min-h-screen flex items-center justify-center bg-gray-100 px-4"
    >
      <div className="max-w-md w-full p-6 bg-white rounded shadow-md space-y-5">
        <h1 className="text-2xl font-bold text-center">{t("signup")}</h1>

        <div className="flex justify-center gap-3">
          <LewisButton
            lewisSize="full"
            space={false}
            className="flex items-center gap-2"
          >
            <FaGoogle className="text-white" />
            {t("signupWithGoogle")}
          </LewisButton>
          <LewisButton
            lewisSize="full"
            color="blue"
            space={false}
            className="flex items-center gap-2"
          >
            <FaFacebook className="text-white" />
            {t("signupWithFacebook")}
          </LewisButton>
        </div>

        <form className="space-y-4">
          <div>
            <Label htmlFor="fullname" />
            <TextInput
              id="fullname"
              name="fullname"
              value={form.fullname}
              onChange={handleChange}
              placeholder={t("fullname")}
              required
            />
          </div>
          <div>
            <Label htmlFor="email" />
            <TextInput
              id="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder={t("email")}
              type="email"
              required
            />
          </div>
          <div>
            <Label htmlFor="password" />
            <TextInput
              id="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder={t("password")}
              type="password"
              required
            />
          </div>
          <div>
            <Label htmlFor="confirmPassword" />
            <TextInput
              id="confirmPassword"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder={t("confirmPassword")}
              type="password"
              required
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Checkbox
                id="remember"
                name="remember"
                checked={form.remember}
                onChange={handleChange}
              />
              <Label className="text-color" htmlFor="remember">
                {t("rememberMe")}
              </Label>
            </div>
            <Link
              href="/forgot-password"
              className="text-sm text-blue-600 hover:underline"
            >
              {t("forgotPassword")}
            </Link>
          </div>

          <LewisButton lewisSize="full" type="submit">
            {t("submit")}
          </LewisButton>
        </form>

        <p className="text-sm text-center">
          {t("alreadyHaveAccount")}{" "}
          <Link href="/sign-in" className="text-blue-600 hover:underline">
            {t("signin")}
          </Link>
        </p>
      </div>
    </div>
  );
}
