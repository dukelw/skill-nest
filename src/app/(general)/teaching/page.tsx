"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Spinner,
  Breadcrumb,
  BreadcrumbItem,
} from "~/components/ui/primitives";
import { classroomService } from "~/services/classroomService";
import { useAuthStore } from "~/store/authStore";
import { useClassroomStore } from "~/store/classroomStore";
import Link from "next/link";
import { BookOpen, LockKeyhole, Presentation, Users } from "lucide-react";
import { useTranslation } from "react-i18next";
import EmptyState from "~/components/EmptyState";

export default function Teaching() {
  const { teacherClassrooms, setTeacherClassrooms } = useClassroomStore();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    const handleGetTeacherClasses = async () => {
      if (!user?.id) return;
      const response = await classroomService.getTeacherRole(user?.id);
      setTeacherClassrooms(response);
      setLoading(false);
    };

    handleGetTeacherClasses();
  }, [user?.id]);

  if (!user) {
    return (
      <EmptyState
        icon={LockKeyhole}
        eyebrow="Teaching dashboard"
        title="Sign in to manage your classes"
        description="Your teaching classrooms, members, and shared learning activity will appear here."
        actionLabel="Sign in"
        actionHref="/sign-in"
      />
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <Spinner size="xl" aria-label="Loading classrooms..." />
      </div>
    );
  }

  if (!teacherClassrooms || teacherClassrooms.length === 0) {
    return (
      <EmptyState
        icon={Presentation}
        eyebrow="No teaching spaces"
        title="Create your first classroom"
        description="Start a teaching space to organize learners, announcements, assignments, and meetings."
        actionLabel="Create from home"
        actionHref="/"
        secondaryLabel="Browse courses"
        secondaryHref="/course"
      />
    );
  }

  return (
    <div className="space-y-5 p-6">
      <Breadcrumb aria-label="Breadcrumb" className="mb-4">
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem href="/teaching">Teaching</BreadcrumbItem>
      </Breadcrumb>

      <section className="rounded-2xl border border-emerald-100 bg-[#f2fbf4] p-6 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[13px] font-bold uppercase tracking-wider text-emerald-700">
              Teaching spaces
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
              Manage your classrooms
            </h1>
            <p className="mt-2 max-w-3xl text-[15px] leading-7 text-slate-700">
              Build class streams, assignments, members, and live learning flow
              from one polished workspace.
            </p>
          </div>
          <div className="grid min-w-[280px] grid-cols-2 gap-3">
            <div className="rounded-xl border border-emerald-100 bg-[#eaf6ec] p-4">
              <BookOpen className="h-5 w-5 text-emerald-700" />
              <p className="mt-3 text-2xl font-bold text-slate-950">
                {teacherClassrooms.length}
              </p>
              <p className="text-[13px] font-semibold text-slate-600">Classes</p>
            </div>
            <div className="rounded-xl border border-emerald-100 bg-[#eaf6ec] p-4">
              <Users className="h-5 w-5 text-emerald-700" />
              <p className="mt-3 text-2xl font-bold text-slate-950">
                {teacherClassrooms.reduce(
                  (total, classroom) => total + (classroom.members?.length || 0),
                  0
                )}
              </p>
              <p className="text-[13px] font-semibold text-slate-600">Members</p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {teacherClassrooms?.map((classroom) => (
          <Link
            href={`/teaching/${classroom.id}`}
            key={classroom.id}
            className="classroom-card group"
          >
            <div className="relative aspect-video overflow-hidden bg-slate-100">
              <Image
                src={
                  classroom.thumbnail ||
                  "https://res.cloudinary.com/dukelewis-workspace/image/upload/v1747039662/uploads/a541itrjuslvtbifaz1q.jpg"
                }
                alt={`${classroom.name} thumbnail`}
                fill
                className="object-cover transition duration-300 group-hover:scale-105"
              />
              <div className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-sm">
                <Users className="h-3.5 w-3.5 text-emerald-700" />
                {classroom.members?.length || 0}
              </div>
            </div>
            <div className="space-y-4 p-5">
              <div>
                <h5 className="line-clamp-2 text-[18px] font-bold text-slate-950">
                  {classroom.name}
                </h5>
                <p className="mt-2 inline-flex rounded-full border border-emerald-100 bg-[#eaf6ec] px-2.5 py-1 text-[13px] font-bold uppercase tracking-wide text-emerald-700">
                  {classroom.code}
                </p>
              </div>
              <div className="flex items-center justify-between border-t border-emerald-100 pt-3 text-[13px] text-slate-600">
                <span>{t("teachingPage.created")}</span>
                <span className="font-medium text-slate-700">
                  {new Date(classroom.createdAt).toLocaleDateString("en-GB")}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
