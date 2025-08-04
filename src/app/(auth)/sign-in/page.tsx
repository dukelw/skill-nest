/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Checkbox, Label } from "flowbite-react";
import { FaGoogle, FaGithub } from "react-icons/fa";
import Link from "next/link";
import LewisButton from "~/components/Partial/LewisButton";
import "../../../i18n/client";
import { i18n } from "next-i18next";
import LewisTextInput from "~/components/Partial/LewisTextInput";
import { toast } from "react-toastify";
import { authService } from "~/services/authService";
import { useRouter } from "next/navigation";
// import { useAuth } from "~/context/AuthContext";
import { useAuthStore } from "~/store/authStore";
import { loginWithGithub, loginWithGoogle } from "~/lib/actions/auth";
import { HiArrowLeft } from "react-icons/hi";
import Cookies from "js-cookie";

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
        if (form.remember) {
          Cookies.set("rememberEmail", form.email, { expires: 7 });
          Cookies.set("rememberPassword", form.password, { expires: 7 });
        } else {
          Cookies.remove("rememberEmail");
          Cookies.remove("rememberPassword");
        }

        toast.success(t("signinSuccess"));
        setForm({
          email: "",
          password: "",
          remember: false,
        });

        if (user.role === "ADMIN") {
          router.push("/admin");
        } else {
          router.push("/");
        }
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t("signinFailed"));
    }
  };

  useEffect(() => {
    const rememberedEmail = Cookies.get("rememberEmail") || "";
    const rememberedPassword = Cookies.get("rememberPassword") || "";

    if (rememberedEmail && rememberedPassword) {
      setForm((prev) => ({
        ...prev,
        email: rememberedEmail,
        password: rememberedPassword,
        remember: true,
      }));
    }
  }, []);

  return (
    <div
      lang={i18n?.language}
      className="w-full min-h-screen flex items-center justify-center bg-gray-100 px-4"
    >
      <div className="max-w-md w-full p-6 bg-white rounded shadow-md space-y-5">
        <Link
          href="/"
          className="flex items-center gap-1 text-gray-600 hover:text-gray-900"
        >
          <HiArrowLeft className="text-xl" />
          <span className="text-sm">{t("back")}</span>
        </Link>
        <h1 className="text-2xl font-bold text-center">{t("signin")}</h1>

        <div className="flex justify-center gap-3">
          <LewisButton
            lewisSize="full"
            space={false}
            className="flex items-center gap-2"
            onClick={() => {
              loginWithGoogle();
            }}
          >
            <FaGoogle className="text-white" />
            {t("signinWithGoogle")}
          </LewisButton>
          <LewisButton
            lewisSize="full"
            color="black"
            space={false}
            className="flex items-center gap-2"
            onClick={() => {
              loginWithGithub();
            }}
          >
            <FaGithub className="text-white" />
            {t("signinWithGithub")}
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
              href="/reset-password"
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
