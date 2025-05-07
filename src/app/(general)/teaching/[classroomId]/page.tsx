"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { classroomService } from "~/services/classroomService";
import { Breadcrumb, BreadcrumbItem, TabItem, Tabs } from "flowbite-react";
import { customFlowbiteTheme } from "~/lib/flowbite-theme";
import Grade from "~/components/Tabs/Grade";
import Stream from "~/components/Tabs/Stream";
import People from "~/components/Tabs/People";
import Assignment from "~/components/Tabs/Assignment";
import { useClassroomStore } from "~/store/classroomStore";

export default function ClientClassroomDetail() {
  const [activeTab, setActiveTab] = useState("stream");
  const { classroomId } = useParams();
  const { classroom, setClassroom } = useClassroomStore();
  const router = useRouter();

  useEffect(() => {
    const fetchClassroom = async () => {
      try {
        const res = await classroomService.getDetail(Number(classroomId));
        if (!res) {
          router.replace("/not-found");
          return;
        }
        setClassroom(res);
      } catch (error) {
        console.error("Error fetching classroom details:", error);
        router.replace("/not-found");
      }
    };

    if (classroomId) fetchClassroom();
  }, [classroomId, router]);

  if (!classroom) return <p className="p-4">Loading...</p>;

  const tabs = [
    { name: "Bảng tin", key: "stream" },
    { name: "Bài tập", key: "assignments" },
    { name: "Mọi người", key: "people" },
    { name: "Điểm", key: "grades" },
  ];

  return (
    <div className="p-6 space-y-3">
      <Breadcrumb aria-label="Breadcrumb" className="mb-4">
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem href="/teaching">Teaching</BreadcrumbItem>
        <BreadcrumbItem>{classroom.name}</BreadcrumbItem>
      </Breadcrumb>
      {/* <h1 className="text-3xl font-bold text-green-700">{classroom.name}</h1>
      <p className="text-gray-600">
        <strong>Class Code:</strong> {classroom.code}
      </p>
      <p className="text-gray-600">
        <strong>Created at:</strong>{" "}
        {new Date(classroom.createdAt).toLocaleDateString("en-GB")}
      </p>
      <Image
        src={
          classroom.thumnail ||
          "https://cdn-media.sforum.vn/storage/app/media/Bookgrinder2/wuthering-waves-build-zani-9.jpg"
        }
        alt="Class Thumbnail"
        width={600}
        height={400}
        className="w-full max-w-md rounded shadow"
      /> */}
      {/* Tabs */}
      <Tabs
        theme={customFlowbiteTheme.tabs}
        aria-label="Classroom tabs"
        onActiveTabChange={(tabIndex) => {
          setActiveTab(tabs[tabIndex].key);
        }}
      >
        {tabs.map((tab) => (
          <TabItem
            active={activeTab === tab.key}
            key={tab.key}
            title={tab.name}
          >
            {activeTab === "stream" && <Stream />}
            {activeTab === "assignments" && <Assignment />}
            {activeTab === "people" && <People />}
            {activeTab === "grades" && <Grade />}
          </TabItem>
        ))}
      </Tabs>
    </div>
  );
}
