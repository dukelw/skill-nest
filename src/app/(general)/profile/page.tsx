/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { Avatar, Breadcrumb, BreadcrumbItem } from "flowbite-react";
import LewisTextInput from "~/components/partial/LewisTextInput";
import { userService } from "~/services/userService";
import { useAuthStore } from "~/store/authStore";
import LewisButton from "~/components/partial/LewisButton";
import { uploadService } from "~/services/uploadService";
import { authService } from "~/services/authService";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

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

      const res = await authService.getProfile();
      setUser(res);
      setUser(updated);
      setEditing(false);
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

  return (
    <div className="p-6 bg-white rounded-xl shadow space-y-6 min-h-screen">
      <Breadcrumb aria-label="Breadcrumb" className="mb-4">
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem>{t("profile")}</BreadcrumbItem>
      </Breadcrumb>
      <h1 className="text-center text-green font-bold uppercase text-3xl">
        {t("updateProfile")}
      </h1>

      <div className="flex items-center space-x-4 max-w-2xl mx-auto">
        <div className="relative w-fit group">
          <Avatar
            img={
              preview ||
              "https://cdn-icons-png.freepik.com/512/3607/3607444.png"
            }
            rounded
            size="lg"
          />

          {editing && (
            <div className="absolute -bottom-1 -right-1">
              <label className="bg-green text-white rounded-full p-1 text-xs cursor-pointer shadow hover:bg-green-600 transition">
                ✏️
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>
          )}
        </div>

        <div>
          <h2 className="text-xl font-semibold">
            {user?.name || "Chưa có tên"}
          </h2>
          <p className="text-sm text-gray-500">{user?.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
        <LewisTextInput
          name="name"
          value={form.name}
          onChange={handleChange}
          disabled={!editing}
          placeholder={t("name")}
        />
        <LewisTextInput
          name="phone"
          value={form.phone}
          onChange={handleChange}
          disabled={!editing}
          placeholder={t("phone")}
        />
        <LewisTextInput
          name="gender"
          value={form.gender}
          onChange={handleChange}
          disabled={!editing}
          placeholder={t("gender")}
        />

        <div className="md:col-span-2 mt-2 text-sm text-gray-500">
          {t("createdAt")}:{" "}
          <span className="font-medium text-green-600">
            {new Date(user?.createdAt || Date.now()).toLocaleDateString(
              "vi-VN",
              {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              }
            )}
          </span>
        </div>
      </div>

      <div className="text-right max-w-2xl mx-auto">
        {!editing ? (
          <LewisButton onClick={() => setEditing(true)}>
            {t("editInfo")}
          </LewisButton>
        ) : (
          <div className="flex justify-end space-x-2 max-w-2xl mx-auto">
            <LewisButton color="red" onClick={() => setEditing(false)}>
              {t("cancel")}
            </LewisButton>
            <LewisButton onClick={handleSave} disabled={loading}>
              {loading ? (
                <svg
                  className="animate-spin h-5 w-5 text-white inline-block mr-2"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  ></path>
                </svg>
              ) : null}
              {loading ? t("saving") : t("saveChanges")}
            </LewisButton>
          </div>
        )}
      </div>
    </div>
  );
}
