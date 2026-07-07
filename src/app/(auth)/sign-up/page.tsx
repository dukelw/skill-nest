/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Label, Checkbox } from "~/components/ui/primitives";
import { FaGoogle, FaGithub } from "react-icons/fa";
import Link from "next/link";
import LewisButton from "~/components/Partial/LewisButton";
import "../../../i18n/client";
import { i18n } from "next-i18next";
import LewisTextInput from "~/components/Partial/LewisTextInput";
import { toast } from "sonner";
import { authService } from "~/services/authService";
import { useRouter } from "next/navigation";
import { loginWithGithub, loginWithGoogle } from "~/lib/actions/auth";
import { HiArrowLeft } from "react-icons/hi";
import Cookies from "js-cookie";

export default function SignUp() {
  const { t } = useTranslation();
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    remember: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (form.password !== form.confirmPassword) {
        toast.error(t("passwordMismatch"));
        return;
      }

      const res = await authService.signUp(
        form.name,
        form.email,
        form.password
      );

      if (res) {
        if (form.remember) {
          Cookies.set("rememberEmail", form.email, { expires: 7 });
          Cookies.set("rememberPassword", form.password, { expires: 7 });
        } else {
          Cookies.remove("rememberEmail");
          Cookies.remove("rememberPassword");
        }

        toast.success(t("signupSuccess"));
        setForm({
          name: "",
          email: "",
          password: "",
          confirmPassword: "",
          remember: false,
        });
        router.push("/sign-in");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t("signupFailed"));
    }
  };

  return (
    <div
      suppressHydrationWarning={false}
      lang={i18n?.language}
      className="auth-stage w-full min-h-screen flex items-center justify-center px-4 py-10"
    >
      <div className="max-w-md w-full rounded-2xl border border-emerald-100 bg-white p-7 shadow-[0_18px_48px_rgba(15,58,47,0.1)] space-y-5">
        <Link
          href="/"
          className="flex items-center gap-1 text-emerald-800 hover:text-emerald-950"
        >
          <HiArrowLeft className="text-xl" />
          <span className="text-sm">{t("back")}</span>
        </Link>
        <div className="text-center">
          <p className="section-kicker">Start learning</p>
          <h1 className="mt-2 text-3xl font-semibold text-[#10201d]">
            {t("signup")}
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Create your Skill Nest account and build your first learning space.
          </p>
        </div>

        <div className="flex justify-center gap-3">
          <LewisButton
            lewisSize="full"
            space={false}
            className="flex items-center justify-center gap-2"
            onClick={() => {
              loginWithGoogle();
            }}
          >
            <FaGoogle className="text-white" />
            {t("signupWithGoogle")}
          </LewisButton>
          <LewisButton
            lewisSize="full"
            color="black"
            space={false}
            className="flex items-center justify-center gap-2"
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
            <Label htmlFor="name" />
            <LewisTextInput
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder={t("fullname")}
              required
            />
          </div>
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
          <div>
            <Label htmlFor="confirmPassword" />
            <LewisTextInput
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
          </div>

          <LewisButton onClick={handleSubmit} lewisSize="full" type="submit">
            {t("submit")}
          </LewisButton>
        </form>

        <p className="text-sm text-center">
          {t("alreadyHaveAccount")}{" "}
          <Link href="/sign-in" className="text-emerald-700 hover:text-emerald-900 hover:underline">
            {t("signin")}
          </Link>
        </p>
      </div>
    </div>
  );
}
