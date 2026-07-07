"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { classroomService } from "~/services/classroomService";
import { Breadcrumb, BreadcrumbItem, TabItem, Tabs } from "~/components/ui/primitives";
import Grade from "~/components/Tabs/Grade";
import Stream from "~/components/Tabs/Stream";
import People from "~/components/Tabs/People";
import { useClassroomStore } from "~/store/classroomStore";
import Asset from "~/components/Tabs/Asset";
import Loader from "~/components/Partial/Loader";
import { useTranslation } from "react-i18next";
import { BookOpen, ClipboardCheck, Users } from "lucide-react";

export default function ClientClassroomDetail() {
  const [activeTab, setActiveTab] = useState("stream");
  const [pendingRequestCount, setPendingRequestCount] = useState(0);
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

  useEffect(() => {
    const fetchPendingRequests = async () => {
      try {
        const res = await classroomService.getRequest(Number(classroomId));
        setPendingRequestCount(res?.length ?? 0);
      } catch (error) {
        console.error("Error fetching classroom requests:", error);
      }
    };

    if (classroomId) fetchPendingRequests();

    const syncPendingRequests = (event: Event) => {
      const detail = (event as CustomEvent<{ count?: number }>).detail;
      setPendingRequestCount(detail?.count ?? 0);
    };

    window.addEventListener("classroom:requests-updated", syncPendingRequests);
    return () =>
      window.removeEventListener(
        "classroom:requests-updated",
        syncPendingRequests
      );
  }, [classroomId]);

  if (!classroom) return <Loader />;

  const studentCount =
    classroom.members?.filter((member) => member.role === "STUDENT").length ?? 0;
  const assignmentCount = classroom.assignments?.length ?? 0;
  const submissionCount = classroom.submissions?.length ?? 0;
  const activeAssignmentCount =
    classroom.assignments?.filter((assignment) => {
      const isGradable = assignment.type !== "DOCUMENT";
      return isGradable && new Date(assignment.dueDate).getTime() >= Date.now();
    }).length ?? 0;
  const ungradedSubmissionCount =
    classroom.assignments?.reduce((total, assignment) => {
      if (assignment.type === "DOCUMENT") return total;
      return (
        total +
        (assignment.submissions?.filter((submission) => submission.grade === null)
          .length ?? 0)
      );
    }, 0) ?? 0;

  const tabTitle = (label: string, count?: number) => (
    <span className="inline-flex items-center gap-2">
      <span>{label}</span>
      {!!count && (
        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800">
          {count}
        </span>
      )}
    </span>
  );

  const tabs = [
    { name: tabTitle(t("teachingDetailPage.stream")), key: "stream" },
    {
      name: tabTitle(t("teachingDetailPage.assignments"), activeAssignmentCount),
      key: "assignments",
    },
    { name: tabTitle(t("teachingDetailPage.people"), pendingRequestCount), key: "people" },
    { name: tabTitle(t("teachingDetailPage.grades"), ungradedSubmissionCount), key: "grades" },
  ];

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <Breadcrumb aria-label="Breadcrumb">
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem href="/teaching">Teaching</BreadcrumbItem>
        <BreadcrumbItem>{classroom.name}</BreadcrumbItem>
      </Breadcrumb>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
              Teaching workspace
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
              {classroom.name}
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Manage posts, learning materials, people, and grades with a
              cleaner view of classroom activity.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-xs font-medium text-slate-500">Class code</p>
              <p className="mt-1 text-sm font-semibold text-slate-950">
                {classroom.code}
              </p>
            </div>
            <div className="rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3">
              <p className="flex items-center gap-2 text-xs font-medium text-emerald-800">
                <Users className="h-4 w-4" />
                Students
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-950">
                {studentCount}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <BookOpen className="h-5 w-5 text-emerald-700" />
            <p className="mt-3 text-sm font-semibold text-slate-950">
              Stream
            </p>
            <p className="text-xs text-slate-500">
              Announcements and class discussion
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <ClipboardCheck className="h-5 w-5 text-amber-700" />
            <p className="mt-3 text-sm font-semibold text-slate-950">
              {assignmentCount} assignments
            </p>
            <p className="text-xs text-slate-500">Created for learners</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <Users className="h-5 w-5 text-sky-700" />
            <p className="mt-3 text-sm font-semibold text-slate-950">
              {submissionCount} submissions
            </p>
            <p className="text-xs text-slate-500">Ready for review</p>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="w-full overflow-x-auto">
          <Tabs
            aria-label="Classroom tabs"
          onActiveTabChange={(tabIndex) => {
            setActiveTab(tabs[tabIndex].key);
          }}
          style={{ minWidth: "max-content" }} // Đảm bảo tab không bị co lại
          >
            {tabs.map((tab) => (
              <TabItem
                active={activeTab === tab.key}
                key={tab.key}
                title={tab.name}
              >
                {activeTab === "stream" && <Stream />}
                {activeTab === "assignments" && <Asset />}
                {activeTab === "people" && <People canManageRequests />}
                {activeTab === "grades" && <Grade />}
              </TabItem>
            ))}
          </Tabs>
        </div>
      </section>
    </div>
  );
}
