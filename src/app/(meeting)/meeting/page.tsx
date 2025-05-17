"use client";

import { Breadcrumb, BreadcrumbItem } from "flowbite-react";
import { CalendarPlus, PlayCircle, Plus, VideoIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import ActionCard from "~/components/Meeting/ActionCard";
import CallList from "~/components/Meeting/CallList";
import MeetingModal from "~/components/Meeting/MeetingModal";
import LewisButton from "~/components/partial/LewisButton";
import { useGetCalls } from "~/hooks/useGetCalls";

type ModalType = "new" | "join" | "schedule" | null;

export default function MeetingPage() {
  const [openModal, setOpenModal] = useState<ModalType>(null);
  const router = useRouter();
  const { nearestMeeting } = useGetCalls();

  return (
    <main className="p-6 space-y-6">
      <Breadcrumb aria-label="Breadcrumb" className="mb-4">
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem>Meeting</BreadcrumbItem>
      </Breadcrumb>

      {/* Header */}
      {nearestMeeting && (
        <section
          className="bg-muted rounded-xl p-6 flex flex-col md:flex-row justify-between items-center gap-4 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://res.cloudinary.com/dukelewis-workspace/image/upload/v1747039662/uploads/a541itrjuslvtbifaz1q.jpg')`,
          }}
        >
          <div className="bg-black/30 p-4 rounded-xl text-white">
            <p className="text-sm">
              Upcoming Meeting at{" "}
              {new Date(nearestMeeting.state.startsAt!).toLocaleTimeString(
                "en-US",
                {
                  hour: "2-digit",
                  minute: "2-digit",
                }
              )}
            </p>
            <h1 className="text-4xl font-bold">
              {new Date(nearestMeeting.state.startsAt!).toLocaleTimeString(
                "en-US",
                {
                  hour: "2-digit",
                  minute: "2-digit",
                }
              )}
            </h1>
            <p className="text-sm">
              {new Date(nearestMeeting.state.startsAt!).toLocaleDateString(
                "en-US",
                {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                }
              )}
            </p>
          </div>
        </section>
      )}

      {/* Quick Actions */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <ActionCard
          title="New Meeting"
          description="Setup a new recording"
          icon={<Plus className="text-white" size={24} />}
          bg="bg-orange-500"
          onClick={() => setOpenModal("new")}
        />
        <ActionCard
          title="Join Meeting"
          description="via invitation link"
          icon={<VideoIcon className="text-white" size={24} />}
          bg="bg-blue-500"
          onClick={() => setOpenModal("join")}
        />
        <ActionCard
          title="Schedule Meeting"
          description="Plan your meeting"
          icon={<CalendarPlus className="text-white" size={24} />}
          bg="bg-purple-500"
          onClick={() => setOpenModal("schedule")}
        />
        <ActionCard
          title="View Recordings"
          description="Meeting recordings"
          icon={<PlayCircle className="text-white" size={24} />}
          bg="bg-yellow-500"
          onClick={() => {
            router.push("/meeting-record");
          }}
        />
      </section>

      {/* Upcoming Meetings */}
      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Todays Upcoming Meetings</h2>
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
