"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { classroomService } from "~/services/classroomService";
import { Breadcrumb, BreadcrumbItem, TabItem, Tabs } from "flowbite-react";
import { customFlowbiteTheme } from "~/lib/flowbite-theme";
import Grade from "~/components/Tabs/Grade";
import Stream from "~/components/Tabs/Stream";
import People from "~/components/Tabs/People";
import { useClassroomStore } from "~/store/classroomStore";
import Asset from "~/components/Tabs/Asset";
import Loader from "~/components/partial/Loader";
import { useTranslation } from "react-i18next";
import Head from "../head";

export default function ClientClassroomDetail() {
  const [activeTab, setActiveTab] = useState("stream");
  const { classroomId } = useParams();
  const { classroom, setClassroom } = useClassroomStore();
  const router = useRouter();
  const { t } = useTranslation();

  useEffect(() => {
    const fetchClassroom = async () => {
      try {
        const res = await classroomService.getDetail(Number(classroomId));
        if (!res) {
          router.replace("/not-found");
          return;
        }
        console.log("classroom data", res);
        setClassroom(res);
      } catch (error) {
        console.error("Error fetching classroom details:", error);
        router.replace("/not-found");
      }
    };

    if (classroomId) fetchClassroom();
  }, [classroomId, router]);

  if (!classroom) return <Loader />;

  const tabs = [
    { name: t("teachingDetailPage.stream"), key: "stream" },
    { name: t("teachingDetailPage.assignments"), key: "assignments" },
    { name: t("teachingDetailPage.people"), key: "people" },
    { name: t("teachingDetailPage.grades"), key: "grades" },
  ];

  return (
    <div className="p-6 space-y-3">
      <Head />
      <Breadcrumb aria-label="Breadcrumb" className="mb-4">
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem href="/teaching">Teaching</BreadcrumbItem>
        <BreadcrumbItem>{classroom.name}</BreadcrumbItem>
      </Breadcrumb>
      {/* Tabs */}
      <Tabs
        theme={customFlowbiteTheme.tabs}
        aria-label="Classroom tabs"
        onActiveTabChange={(tabIndex) => {
          setActiveTab(tabs[tabIndex].key);
        }}
      >
        {tabs?.map((tab) => (
          <TabItem
            active={activeTab === tab.key}
            key={tab.key}
            title={tab.name}
          >
            {activeTab === "stream" && <Stream />}
            {activeTab === "assignments" && <Asset />}
            {activeTab === "people" && <People />}
            {activeTab === "grades" && <Grade />}
          </TabItem>
        ))}
      </Tabs>
    </div>
  );
}
