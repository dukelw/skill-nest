"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Breadcrumb, BreadcrumbItem } from "~/components/ui/primitives";
import { classroomService } from "~/services/classroomService";
import { useAuthStore } from "~/store/authStore";
import { useClassroomStore } from "~/store/classroomStore";
import Link from "next/link";
import { BookOpenCheck, GraduationCap, LockKeyhole, Users } from "lucide-react";
import { useTranslation } from "react-i18next";
import Loader from "~/components/Partial/Loader";
import EmptyState from "~/components/EmptyState";

const DEFAULT_CLASSROOM_THUMBNAIL = "/logo-bg.png";

export default function Classroom() {
  const { studentClassrooms, setStudentClassrooms } = useClassroomStore();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    const handleGetStudentClasses = async () => {
      if (!user?.id) return;
      const response = await classroomService.getStudentRole(user?.id);
      setStudentClassrooms(response);
      setLoading(false);
    };

    handleGetStudentClasses();
  }, [user?.id]);

  if (!user) {
    return (
      <EmptyState
        icon={LockKeyhole}
        eyebrow="Classrooms are private"
        title="Sign in to see your classrooms"
        description="Your joined classrooms, classmates, lessons, and assignments will appear here."
        actionLabel="Sign in"
        actionHref="/sign-in"
      />
    );
  }

  if (loading) {
    return <Loader />;
  }

  if (!studentClassrooms || studentClassrooms.length === 0) {
    return (
      <EmptyState
        icon={BookOpenCheck}
        eyebrow="No classrooms yet"
        title="Join a classroom to start learning"
        description="Once a teacher accepts your request, your classroom stream, people, assets, and grades will live here."
        actionLabel="Go home"
        actionHref="/"
        secondaryLabel="Explore courses"
        secondaryHref="/course"
      />
    );
  }

  return (
    <div className="space-y-5 p-6">
      <Breadcrumb aria-label="Breadcrumb" className="mb-4">
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem href="/classroom">Classroom</BreadcrumbItem>
      </Breadcrumb>

      <section className="rounded-2xl border border-emerald-100 bg-[#f2fbf4] p-6 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[13px] font-bold uppercase tracking-wider text-emerald-700">
              Learning spaces
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
              Your classrooms
            </h1>
            <p className="mt-2 max-w-3xl text-[15px] leading-7 text-slate-700">
              Keep every joined class, stream, people list, assignment, and
              gradebook within a calm learning dashboard.
            </p>
          </div>
          <div className="grid min-w-[280px] grid-cols-2 gap-3">
            <div className="rounded-xl border border-emerald-100 bg-[#eaf6ec] p-4">
              <GraduationCap className="h-5 w-5 text-emerald-700" />
              <p className="mt-3 text-2xl font-bold text-slate-950">
                {studentClassrooms.length}
              </p>
              <p className="text-[13px] font-semibold text-slate-600">Classes</p>
            </div>
            <div className="rounded-xl border border-emerald-100 bg-[#eaf6ec] p-4">
              <Users className="h-5 w-5 text-emerald-700" />
              <p className="mt-3 text-2xl font-bold text-slate-950">
                {studentClassrooms.reduce(
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
        {studentClassrooms?.map((classroom) => (
          <Link
            href={`/classroom/${classroom.id}`}
            key={classroom.id}
            className="group flex min-h-[390px] flex-col overflow-hidden rounded-[22px] border border-emerald-100 bg-white shadow-sm transition hover:-translate-y-1 hover:border-emerald-200 hover:shadow-lg"
          >
            <div className="relative m-3 aspect-[4/3] overflow-hidden rounded-2xl bg-slate-100">
              <Image
                src={classroom.thumbnail || DEFAULT_CLASSROOM_THUMBNAIL}
                alt={`${classroom.name} thumbnail`}
                fill
                className="object-cover transition duration-300 group-hover:scale-105"
              />
              <div className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-xs font-bold text-slate-700 shadow-sm">
                <Users className="h-3.5 w-3.5 text-emerald-700" />
                {classroom.members?.length || 0}
              </div>
            </div>
            <div className="flex flex-1 flex-col space-y-4 px-5 pb-5 pt-2">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-sky-700">
                  Learning notebook
                </p>
                <h5 className="mt-2 min-h-[62px] line-clamp-2 text-[20px] font-extrabold leading-8 text-slate-950">
                  {classroom.name}
                </h5>
                <p className="mt-2 inline-flex rounded-full border border-emerald-100 bg-[#eaf6ec] px-2.5 py-1 text-[13px] font-bold uppercase tracking-wide text-emerald-700">
                  {classroom.code}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[12px] font-bold text-slate-600">
                <span className="rounded-lg bg-[#eef7ef] px-2.5 py-2">
                  Stream ready
                </span>
                <span className="rounded-lg bg-[#eef7ef] px-2.5 py-2 text-right">
                  {classroom.members?.length || 0} members
                </span>
              </div>
              <div className="mt-auto flex items-center justify-between border-t border-emerald-100 pt-3 text-[13px] text-slate-600">
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
