/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import LewisTextInput from "~/components/partial/LewisTextInput";
import LewisButton from "~/components/partial/LewisButton";
import { userService } from "~/services/userService";
import { toast } from "react-toastify";
import { Breadcrumb, BreadcrumbItem } from "flowbite-react";
import { Eye, EyeOff } from "lucide-react";

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
    <div className="mx-auto p-6 min-h-screen bg-white rounded-xl shadow space-y-6">
      <Breadcrumb aria-label="Breadcrumb" className="mb-4">
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem>Password</BreadcrumbItem>
      </Breadcrumb>

      <h1 className="text-center text-green font-bold uppercase text-3xl">
        {t("changePassword")}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl mx-auto">
        {/* CURRENT PASSWORD */}
        <div className="relative">
          <LewisTextInput
            type={showCurrent ? "text" : "password"}
            placeholder={t("currentPassword")}
            value={currentPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            required
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
            onClick={() => setShowCurrent(!showCurrent)}
          >
            {showCurrent ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        {/* NEW PASSWORD */}
        <div className="relative">
          <LewisTextInput
            type={showNew ? "text" : "password"}
            placeholder={t("newPassword")}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
            onClick={() => setShowNew(!showNew)}
          >
            {showNew ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        {/* CONFIRM NEW PASSWORD */}
        <div className="relative">
          <LewisTextInput
            type={showConfirm ? "text" : "password"}
            placeholder={t("confirmNewPassword")}
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            required
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
            onClick={() => setShowConfirm(!showConfirm)}
          >
            {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        <LewisButton type="submit" disabled={loading}>
          {loading ? t("changingPassword") : t("changePassword")}
        </LewisButton>
      </form>
    </div>
  );
}
