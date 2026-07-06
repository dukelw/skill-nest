"use client";

import { Call, CallRecording } from "@stream-io/video-react-sdk";

import MeetingCard from "./MeetingCard";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useGetCalls } from "~/hooks/useGetCalls";
import Loader from "../Partial/Loader";
import { useAuthStore } from "~/store/authStore";
import EmptyState from "../EmptyState";
import { CalendarClock, LockKeyhole, Video } from "lucide-react";

const CallList = ({ type }: { type: "ended" | "upcoming" | "recordings" }) => {
  const { user } = useAuthStore();
  const router = useRouter();
  const { upcomingCalls, callRecordings, isLoading } = useGetCalls();
  const [recordings, setRecordings] = useState<CallRecording[]>([]);

  const getCalls = () => {
    switch (type) {
      case "recordings":
        return recordings;
      case "upcoming":
        return upcomingCalls;
      default:
        return [];
    }
  };

  const getNoCallsMessage = () => {
    switch (type) {
      case "upcoming":
        return (
          <EmptyState
            compact
            icon={CalendarClock}
            eyebrow="No meetings scheduled"
            title="Your calendar is quiet"
            description="Schedule a meeting or start a room when you are ready to teach or collaborate."
          />
        );
      case "recordings":
        return (
          <EmptyState
            compact
            icon={Video}
            eyebrow="No recordings"
            title="Recordings will appear here"
            description="After a meeting is recorded, the replay will be collected in this space."
          />
        );
      default:
        return "";
    }
  };

  useEffect(() => {
    const fetchRecordings = async () => {
      const callData = await Promise.all(
        callRecordings?.map((meeting) => meeting.queryRecordings()) ?? []
      );

      const recordings = callData
        .filter((call) => call.recordings.length > 0)
        .flatMap((call) => call.recordings);

      setRecordings(recordings);
    };

    if (type === "recordings") {
      fetchRecordings();
    }
  }, [type, callRecordings]);
  if (!user) {
    return (
      <EmptyState
        compact
        icon={LockKeyhole}
        eyebrow="Private meetings"
        title="Sign in to see your meeting list"
        description="Upcoming calls and recordings are tied to your account."
      />
    );
  }

  if (isLoading) return <Loader />;

  const calls = getCalls();
  const noCallsMessage = getNoCallsMessage();

  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
      {calls && calls.length > 0 ? (
        calls?.map((meeting: Call | CallRecording, index: number) => (
          <MeetingCard
            key={index.toString()}
            title={
              (meeting as Call).state?.custom?.description ||
              (meeting as CallRecording).filename?.substring(0, 20) ||
              "No Description"
            }
            date={
              (meeting as Call).state?.startsAt?.toLocaleString() ||
              (meeting as CallRecording).start_time?.toLocaleString()
            }
            link={
              type === "recordings"
                ? (meeting as CallRecording).url
                : `/meeting/${(meeting as Call).id}`
            }
            isRecording={type === "recordings" ? true : false}
            buttonText={type === "recordings" ? "Play" : "Start"}
            handleClick={
              type === "recordings"
                ? () => router.push(`${(meeting as CallRecording).url}`)
                : () => router.push(`/meeting/${(meeting as Call).id}`)
            }
          />
        ))
      ) : (
        noCallsMessage
      )}
    </div>
  );
};

export default CallList;
