/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { FaGithub } from "react-icons/fa";
import Link from "next/link";
import "../../../i18n/client";
import { i18n } from "next-i18next";
import { toast } from "react-toastify";
import { authService } from "~/services/authService";
import { useRouter } from "next/navigation";
// import { useAuth } from "~/context/AuthContext";
import { useAuthStore } from "~/store/authStore";
import { loginWithGithub, loginWithGoogle } from "~/lib/actions/auth";
import { HiArrowLeft } from "react-icons/hi";
import Cookies from "js-cookie";
import Image from "next/image";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { Checkbox } from "~/components/ui/checkbox";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

const GoogleMark = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06L5.84 9.9C6.71 7.3 9.14 5.38 12 5.38z"
    />
  </svg>
);

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

  const handleRememberChange = (checked: boolean | "indeterminate") => {
    setForm({ ...form, remember: checked === true });
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
      className="auth-stage w-full min-h-screen px-4 py-10"
    >
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] w-full max-w-6xl items-center gap-10 lg:grid-cols-[1fr_440px]">
        <section className="hidden text-[#10201d] lg:block">
          <Link
            href="/"
            className="inline-flex items-center gap-3 rounded-full border border-emerald-100 bg-white px-4 py-2 text-sm font-medium shadow-sm transition hover:bg-emerald-50"
          >
            <Image src="/logo.png" alt="Skill Nest" width={32} height={32} />
            Skill Nest
          </Link>
          <div className="mt-12 max-w-xl">
            <p className="text-sm font-semibold uppercase text-emerald-700">
              Modern learning workspace
            </p>
            <h1 className="mt-4 text-5xl font-semibold leading-tight">
              Teach, meet, assign, and learn in one calm place.
            </h1>
            <p className="mt-5 text-base leading-7 text-slate-600">
              A polished classroom hub for live sessions, course paths, quizzes,
              and student progress.
            </p>
          </div>
        </section>

        <Card className="w-full border-emerald-100 bg-white p-7 shadow-[0_18px_48px_rgba(15,58,47,0.1)]">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-emerald-800 transition hover:text-emerald-950"
        >
          <HiArrowLeft className="text-xl" />
          {t("back")}
        </Link>

          <CardHeader className="mt-7 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-100 bg-[#f5f7f2] shadow-sm">
              <Image src="/logo.png" alt="Skill Nest" width={44} height={44} />
            </div>
            <div>
              <p className="section-kicker">Welcome back</p>
              <h2 className="mt-2 text-3xl font-semibold text-[#10201d]">
                {t("signin")}
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Continue to your classrooms, courses, and live learning sessions.
              </p>
            </div>
          </CardHeader>

          <CardContent className="mt-6 space-y-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <Button
                variant="secondary"
                className="h-12 border-slate-200 bg-white"
                onClick={() => loginWithGoogle()}
              >
                <GoogleMark />
                Google
              </Button>
              <Button
                variant="dark"
                className="h-12"
                onClick={() => loginWithGithub()}
              >
                <FaGithub className="h-5 w-5" />
                GitHub
              </Button>
            </div>

            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-emerald-100" />
              <span className="text-xs font-medium text-slate-400">
                or sign in with email
              </span>
              <div className="h-px flex-1 bg-emerald-100" />
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="email">{t("email")}</Label>
                <Input
                  id="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@skillnest.app"
                  type="email"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">{t("password")}</Label>
                <Input
                  id="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  type="password"
                  required
                />
              </div>

              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="remember"
                    checked={form.remember}
                    onCheckedChange={handleRememberChange}
                  />
                  <Label className="text-slate-600" htmlFor="remember">
                    {t("rememberMe")}
                  </Label>
                </div>
                <Link
                  href="/reset-password"
                  className="text-sm font-medium text-emerald-700 hover:text-emerald-900 hover:underline"
                >
                  {t("forgotPassword")}
                </Link>
              </div>

              <Button className="h-12 w-full" type="submit">
                {t("signin")}
              </Button>
            </form>

            <p className="text-center text-sm text-slate-600">
              {t("dontHaveAccount")}{" "}
              <Link
                href="/sign-up"
                className="font-semibold text-emerald-700 hover:text-emerald-900 hover:underline"
              >
                {t("signup")}
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
