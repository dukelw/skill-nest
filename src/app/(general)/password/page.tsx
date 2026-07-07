/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import LewisTextInput from "~/components/Partial/LewisTextInput";
import LewisButton from "~/components/Partial/LewisButton";
import { userService } from "~/services/userService";
import { toast } from "sonner";
import { Breadcrumb, BreadcrumbItem } from "~/components/ui/primitives";
import { CheckCircle2, Eye, EyeOff, KeyRound, LockKeyhole, ShieldCheck } from "lucide-react";

function PasswordField({
  label,
  value,
  onChange,
  visible,
  onToggle,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  visible: boolean;
  onToggle: () => void;
  placeholder: string;
}) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-bold text-slate-700">{label}</span>
      <div className="relative">
        <LewisTextInput
          type={visible ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required
          className="pr-11"
        />
        <button
          type="button"
          className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-lg text-slate-500 transition hover:bg-emerald-50 hover:text-emerald-800"
          onClick={onToggle}
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </label>
  );
}

export default function ChangePasswordPage() {
  const { t } = useTranslation();

  const [currentPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmNewPassword) {
      toast.error(t("passwordNotMatch"));
      return;
    }

    setLoading(true);
    try {
      await userService.changePassword({ currentPassword, newPassword });
      toast.success(t("changePasswordSuccess"));
      setOldPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (err: any) {
      toast.error(err.message || t("changePasswordFailed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="space-y-6">
      <Breadcrumb aria-label="Breadcrumb">
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem>Password</BreadcrumbItem>
      </Breadcrumb>

      <section className="detail-panel overflow-hidden">
        <div className="border-b border-emerald-100 bg-[#eef7ef] px-6 py-6">
          <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">
            Security settings
          </p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950">
            {t("changePassword")}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Update your password regularly to keep classroom data and meeting access protected.
          </p>
        </div>

        <div className="grid gap-6 p-6 lg:grid-cols-[320px_1fr]">
          <aside className="rounded-xl border border-emerald-100 bg-[#f7fbf7] p-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h2 className="mt-4 text-xl font-extrabold text-slate-950">
              Password checklist
            </h2>
            <div className="mt-4 space-y-3 text-sm font-semibold text-slate-700">
              {[
                "Use at least 8 characters.",
                "Mix letters, numbers and symbols.",
                "Avoid reusing old passwords.",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-3 rounded-xl border border-emerald-100 bg-[#eef7ef] p-3"
                >
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </aside>

          <form
            onSubmit={handleSubmit}
            className="rounded-xl border border-emerald-100 bg-[#f7fbf7] p-5"
          >
            <div className="mb-5 flex items-start gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
                <KeyRound className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-slate-950">
                  Credentials
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Enter your current password before creating a new one.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <PasswordField
                label={t("currentPassword")}
                placeholder={t("currentPassword")}
                value={currentPassword}
                onChange={setOldPassword}
                visible={showCurrent}
                onToggle={() => setShowCurrent(!showCurrent)}
              />
              <PasswordField
                label={t("newPassword")}
                placeholder={t("newPassword")}
                value={newPassword}
                onChange={setNewPassword}
                visible={showNew}
                onToggle={() => setShowNew(!showNew)}
              />
              <PasswordField
                label={t("confirmNewPassword")}
                placeholder={t("confirmNewPassword")}
                value={confirmNewPassword}
                onChange={setConfirmNewPassword}
                visible={showConfirm}
                onToggle={() => setShowConfirm(!showConfirm)}
              />
            </div>

            <div className="mt-6 flex justify-end">
              <LewisButton type="submit" disabled={loading}>
                <LockKeyhole className="h-4 w-4" />
                {loading ? t("changingPassword") : t("changePassword")}
              </LewisButton>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
