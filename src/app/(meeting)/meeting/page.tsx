"use client";

import { Breadcrumb, BreadcrumbItem } from "~/components/ui/primitives";
import {
  CalendarCheck,
  CalendarPlus,
  Clock,
  LockKeyhole,
  PlayCircle,
  Plus,
  VideoIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import ActionCard from "~/components/Meeting/ActionCard";
import CallList from "~/components/Meeting/CallList";
import MeetingModal from "~/components/Meeting/MeetingModal";
import LewisButton from "~/components/Partial/LewisButton";
import { useGetCalls } from "~/hooks/useGetCalls";
import { useAuthStore } from "~/store/authStore";
import EmptyState from "~/components/EmptyState";

type ModalType = "new" | "join" | "schedule" | null;

export default function MeetingPage() {
  const { user } = useAuthStore();
  const [openModal, setOpenModal] = useState<ModalType>(null);
  const router = useRouter();
  const { nearestMeeting } = useGetCalls();

  if (!user) {
    return (
      <EmptyState
        icon={LockKeyhole}
        eyebrow="Meeting room"
        title="Sign in to manage meetings"
        description="Schedule lessons, join live rooms, and review recordings after you sign in."
        actionLabel="Sign in"
        actionHref="/sign-in"
      />
    );
  }

  return (
    <main className="space-y-6 p-4 sm:p-6">
      <Breadcrumb aria-label="Breadcrumb">
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem>Meeting</BreadcrumbItem>
      </Breadcrumb>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
              Live learning room
            </p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
              Meetings
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-500">
              Start, schedule, and join class meetings from one focused workspace.
            </p>
          </div>
          <div className="rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-emerald-700 shadow-sm">
                {nearestMeeting ? (
                  <Clock className="h-5 w-5" />
                ) : (
                  <CalendarCheck className="h-5 w-5" />
                )}
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                  {nearestMeeting ? "Next meeting" : "No meeting scheduled"}
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {nearestMeeting
                    ? new Date(nearestMeeting.state.startsAt!).toLocaleString(
                        "en-US",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                        }
                      )
                    : "Your calendar is quiet"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <ActionCard
          title="New Meeting"
          description="Setup a new recording"
          icon={<Plus className="h-5 w-5 text-emerald-800" />}
          bg="bg-emerald-50 text-emerald-800"
          onClick={() => setOpenModal("new")}
        />
        <ActionCard
          title="Join Meeting"
          description="via invitation link"
          icon={<VideoIcon className="h-5 w-5 text-sky-800" />}
          bg="bg-sky-50 text-sky-800"
          onClick={() => setOpenModal("join")}
        />
        <ActionCard
          title="Schedule Meeting"
          description="Plan your meeting"
          icon={<CalendarPlus className="h-5 w-5 text-violet-800" />}
          bg="bg-violet-50 text-violet-800"
          onClick={() => setOpenModal("schedule")}
        />
        <ActionCard
          title="View Recordings"
          description="Meeting recordings"
          icon={<PlayCircle className="h-5 w-5 text-amber-800" />}
          bg="bg-amber-50 text-amber-800"
          onClick={() => {
            router.push("/meeting-record");
          }}
        />
      </section>

      {/* Upcoming Meetings */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Today
            </p>
            <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-950">
              Upcoming meetings
            </h2>
          </div>
          <LewisButton href="/meeting-schedule" space={false} lewisSize="small">
            See all
          </LewisButton>
        </div>
        <CallList type="upcoming" />
      </section>

      <MeetingModal
        openModal={openModal}
        setOpenModal={setOpenModal}
      ></MeetingModal>
    </main>
  );
}
