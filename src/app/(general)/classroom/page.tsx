"use client";

import { useEffect, useState } from "react";
import {
  Card,
  Badge,
  Spinner,
  Breadcrumb,
  BreadcrumbItem,
} from "flowbite-react";
import { classroomService } from "~/services/classroomService";
import { useAuthStore } from "~/store/authStore";
import { useClassroomStore } from "~/store/classroomStore";
import Link from "next/link";

export default function Classroom() {
  const { studentClassrooms, setStudentClassrooms } = useClassroomStore();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleGetStudentClasses = async () => {
      if (!user?.id) return;
      const response = await classroomService.getStudentRole(user.id);
      setStudentClassrooms(response);
      setLoading(false);
    };

    handleGetStudentClasses();
  }, [user?.id]);

  if (!user) {
    return (
      <p className="text-gray-500 p-4">Please sign in to see your classroom.</p>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <Spinner size="xl" aria-label="Loading classrooms..." />
      </div>
    );
  }

  if (!studentClassrooms || studentClassrooms.length === 0) {
    return (
      <p className="text-gray-500 p-4">You have no student classrooms yet.</p>
    );
  }

  return (
    <div className="p-6 gap-4">
      <Breadcrumb aria-label="Breadcrumb" className="mb-4">
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem href="/classroom">Classroom</BreadcrumbItem>
      </Breadcrumb>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {studentClassrooms.map((classroom) => (
          <Link href={`/classroom/${classroom.id}`} key={classroom.id}>
            <Card
              className="w-full hover:cursor-pointer transition-transform hover:scale-[1.02]"
              imgAlt={`${classroom.name} thumbnail`}
              imgSrc={
                classroom.thumnail ||
                "https://cdn-media.sforum.vn/storage/app/media/Bookgrinder2/wuthering-waves-build-zani-9.jpg"
              }
            >
              <div className="flex items-center justify-between">
                <h5 className="text-xl font-semibold text-green-600 dark:text-green-600 truncate">
                  {classroom.name}
                </h5>
                <Badge color="info" className="ml-2">
                  {classroom.members?.length || 0} members
                </Badge>
              </div>

              <div className="flex items-center gap-3 mt-3">
                <div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <strong>Code:</strong> {classroom.code}
                  </p>
                  <p className="text-xs text-gray-500">
                    Created:{" "}
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
