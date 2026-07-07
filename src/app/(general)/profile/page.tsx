/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { Breadcrumb, BreadcrumbItem } from "~/components/ui/primitives";
import LewisTextInput from "~/components/Partial/LewisTextInput";
import { userService } from "~/services/userService";
import { useAuthStore } from "~/store/authStore";
import LewisButton from "~/components/Partial/LewisButton";
import { uploadService } from "~/services/uploadService";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { CalendarDays, Camera, Mail, Phone, ShieldCheck, UserRound } from "lucide-react";

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    avatar: user?.avatar || "",
    gender: user?.gender || "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>(user?.avatar || "");
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleSave = async () => {
    setLoading(true);
    let fileUrl = form.avatar;
    try {
      if (file) {
        fileUrl = await uploadService.uploadFile(file);
      }

      const updated = await userService.updateProfile({
        ...form,
        avatar: fileUrl,
      });

      setUser(updated);
      setEditing(false);
      toast.success("Profile updated");
    } catch (err: any) {
      toast.error(`${t("updateFailed")} ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        phone: user.phone || "",
        avatar: user.avatar || "",
        gender: user.gender || "",
      });
      setPreview(user.avatar || "");
    }
  }, [user]);

  const joinedAt = new Date(user?.createdAt || Date.now()).toLocaleDateString(
    "vi-VN",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }
  );
  const avatarLetter = (user?.name || user?.email || "U").charAt(0).toUpperCase();

  return (
    <main className="space-y-6">
      <Breadcrumb aria-label="Breadcrumb">
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem>{t("profile")}</BreadcrumbItem>
      </Breadcrumb>

      <section className="detail-panel overflow-hidden">
        <div className="border-b border-emerald-100 bg-[#eef7ef] px-6 py-6">
          <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">
            Account settings
          </p>
          <div className="mt-2 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-950">
                {t("updateProfile")}
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                Keep your Skill Nest identity tidy for classrooms, meetings and submissions.
              </p>
            </div>
            {!editing ? (
              <LewisButton onClick={() => setEditing(true)}>{t("editInfo")}</LewisButton>
            ) : (
              <div className="flex justify-end gap-2">
                <LewisButton color="red" variant="outlined" onClick={() => setEditing(false)}>
                  {t("cancel")}
                </LewisButton>
                <LewisButton onClick={handleSave} disabled={loading}>
                  {loading ? t("saving") : t("saveChanges")}
                </LewisButton>
              </div>
            )}
          </div>
        </div>

        <div className="grid gap-6 p-6 lg:grid-cols-[320px_1fr]">
          <aside className="rounded-xl border border-emerald-100 bg-[#f7fbf7] p-5">
            <div className="flex flex-col items-center text-center">
              <div className="relative">
                {preview ? (
                  <img
                    src={preview}
                    alt={user?.name || "Profile"}
                    className="h-28 w-28 rounded-full border-4 border-white object-cover shadow-md"
                  />
                ) : (
                  <div className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-white bg-emerald-700 text-4xl font-extrabold text-white shadow-md">
                    {avatarLetter}
                  </div>
                )}
                {editing && (
                  <label className="absolute bottom-1 right-1 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-emerald-200 bg-white text-emerald-800 shadow-sm transition hover:bg-emerald-50">
                    <Camera className="h-4 w-4" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="sr-only"
                    />
                  </label>
                )}
              </div>
              <h2 className="mt-4 text-xl font-extrabold text-slate-950">
                {user?.name || "Unnamed user"}
              </h2>
              <p className="mt-1 text-sm text-slate-500">{user?.email}</p>
            </div>

            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-3 rounded-xl border border-emerald-100 bg-[#eef7ef] p-3">
                <Mail className="h-4 w-4 text-emerald-700" />
                <span className="truncate text-sm font-semibold text-slate-700">
                  {user?.email}
                </span>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-emerald-100 bg-[#eef7ef] p-3">
                <CalendarDays className="h-4 w-4 text-emerald-700" />
                <span className="text-sm font-semibold text-slate-700">
                  Joined {joinedAt}
                </span>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-emerald-100 bg-[#eef7ef] p-3">
                <ShieldCheck className="h-4 w-4 text-emerald-700" />
                <span className="text-sm font-semibold text-slate-700">
                  Active account
                </span>
              </div>
            </div>
          </aside>

          <section className="rounded-xl border border-emerald-100 bg-[#f7fbf7] p-5">
            <div className="mb-5">
              <h2 className="text-xl font-extrabold text-slate-950">
                Personal information
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                These details are shown across your learning workspace.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="flex items-center gap-2 text-sm font-bold text-slate-700">
                  <UserRound className="h-4 w-4 text-emerald-700" />
                  {t("name")}
                </span>
                <LewisTextInput
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  disabled={!editing}
                  placeholder={t("name")}
                />
              </label>
              <label className="space-y-2">
                <span className="flex items-center gap-2 text-sm font-bold text-slate-700">
                  <Phone className="h-4 w-4 text-emerald-700" />
                  {t("phone")}
                </span>
                <LewisTextInput
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  disabled={!editing}
                  placeholder={t("phone")}
                />
              </label>
              <label className="space-y-2 md:col-span-2">
                <span className="text-sm font-bold text-slate-700">{t("gender")}</span>
                <LewisTextInput
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  disabled={!editing}
                  placeholder={t("gender")}
                />
              </label>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
