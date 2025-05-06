/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Checkbox, Label } from "flowbite-react";
import { FaGoogle, FaFacebook } from "react-icons/fa";
import Link from "next/link";
import LewisButton from "~/components/partial/LewisButton";
import "../../../i18n/client";
import { i18n } from "next-i18next";
import LewisTextInput from "~/components/partial/LewisTextInput";
import { toast } from "react-toastify";
import { authService } from "~/services/authService";
import { useRouter } from "next/navigation";
// import { useAuth } from "~/context/AuthContext";
import { useAuthStore } from "~/store/authStore";

export default function SignIn() {
  const { t } = useTranslation();
  const router = useRouter();
  // const { setUser, setTokens } = useAuth();
  const { setUser, setTokens } = useAuthStore();

  const [form, setForm] = useState({
    email: "",
    password: "",
    remember: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await authService.signIn(form.email, form.password);

      if (res) {
        const { user, tokens } = res;

        setUser(user);
        setTokens(tokens);

        toast.success(t("signinSuccess"));
        setForm({
          email: "",
          password: "",
          remember: false,
        });
        router.push("/");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t("signinFailed"));
    }
  };

  return (
    <div
      lang={i18n?.language}
      className="w-full min-h-screen flex items-center justify-center bg-gray-100 px-4"
    >
      <div className="max-w-md w-full p-6 bg-white rounded shadow-md space-y-5">
        <h1 className="text-2xl font-bold text-center">{t("signin")}</h1>

        <div className="flex justify-center gap-3">
          <LewisButton
            lewisSize="full"
            space={false}
            className="flex items-center gap-2"
          >
            <FaGoogle className="text-white" />
            {t("signinWithGoogle")}
          </LewisButton>
          <LewisButton
            lewisSize="full"
            color="blue"
            space={false}
            className="flex items-center gap-2"
          >
            <FaFacebook className="text-white" />
            {t("signinWithFacebook")}
          </LewisButton>
        </div>

        <form className="space-y-4">
          <div>
            <Label htmlFor="email" />
            <LewisTextInput
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
            <LewisTextInput
              id="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder={t("password")}
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

          <LewisButton onClick={handleSubmit} lewisSize="full" type="submit">
            {t("signin")}
          </LewisButton>
        </form>

        <p className="text-sm text-center">
          {t("dontHaveAccount")}{" "}
          <Link href="/sign-up" className="text-blue-600 hover:underline">
            {t("signup")}
          </Link>
        </p>
      </div>
    </div>
  );
}
