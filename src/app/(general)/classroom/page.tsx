"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Breadcrumb, BreadcrumbItem } from "~/components/ui/primitives";
import { classroomService } from "~/services/classroomService";
import { useAuthStore } from "~/store/authStore";
import { useClassroomStore } from "~/store/classroomStore";
import Link from "next/link";
import { BookOpenCheck, LockKeyhole, Users } from "lucide-react";
import { useTranslation } from "react-i18next";
import Loader from "~/components/Partial/Loader";
import EmptyState from "~/components/EmptyState";

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
    <div className="p-6 gap-4">
      <Breadcrumb aria-label="Breadcrumb" className="mb-4">
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem href="/classroom">Classroom</BreadcrumbItem>
      </Breadcrumb>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {studentClassrooms?.map((classroom) => (
          <Link
            href={`/classroom/${classroom.id}`}
            key={classroom.id}
            className="classroom-card group"
          >
            <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
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
            <div className="space-y-3 p-4">
              <div>
                <h5 className="truncate text-base font-semibold text-slate-950">
                  {classroom.name}
                </h5>
                <p className="mt-1 text-xs font-medium uppercase tracking-wide text-emerald-700">
                  {classroom.code}
                </p>
              </div>
              <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
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
