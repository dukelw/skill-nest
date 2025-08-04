"use client";

import { useEffect, useState } from "react";
import { Card, Badge, Breadcrumb, BreadcrumbItem } from "flowbite-react";
import { classroomService } from "~/services/classroomService";
import { useAuthStore } from "~/store/authStore";
import { useClassroomStore } from "~/store/classroomStore";
import Link from "next/link";
import { Users } from "lucide-react";
import { useTranslation } from "react-i18next";
import Loader from "~/components/Partial/Loader";

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
      <p className="text-gray-500 p-4 text-center">
        Please sign in to see your classroom.
      </p>
    );
  }

  if (loading) {
    return <Loader />;
  }

  if (!studentClassrooms || studentClassrooms.length === 0) {
    return (
      <p className="text-gray-500 p-4 text-center">
        You have no student classrooms yet.
      </p>
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
          <Link href={`/classroom/${classroom.id}`} key={classroom.id}>
            <Card
              className="w-full hover:cursor-pointer transition-transform hover:scale-[1.02]"
              imgAlt={`${classroom.name} thumbnail`}
              imgSrc={
                classroom.thumbnail ||
                "https://res.cloudinary.com/dukelewis-workspace/image/upload/v1747039662/uploads/a541itrjuslvtbifaz1q.jpg"
              }
            >
              <div className="flex items-center justify-between">
                <h5 className="text-xl font-semibold text-green-600 dark:text-green-600 truncate">
                  {classroom.name}
                </h5>
                <Badge
                  color="info"
                  className="ml-2 inline-flex items-center gap-1"
                >
                  <Users size={14} className="inline-block" />
                  <span className="inline-block ml-1">
                    {classroom.members?.length || 0}
                  </span>
                </Badge>
              </div>

              <div className="flex items-center gap-3 mt-3">
                <div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <strong>{t("teachingPage.code")}:</strong> {classroom.code}
                  </p>
                  <p className="text-xs text-gray-500">
                    {t("teachingPage.created")}:{" "}
                    {new Date(classroom.createdAt).toLocaleDateString("en-GB")}
                  </p>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
