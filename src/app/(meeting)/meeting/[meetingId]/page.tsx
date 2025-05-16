"use client";

import { useState } from "react";
import { StreamCall, StreamTheme } from "@stream-io/video-react-sdk";
import { useParams } from "next/navigation";

import { useAuthStore } from "~/store/authStore";
import { toast } from "react-toastify";
import MeetingSetup from "~/components/Meeting/MeetingSetup";
import MeetingRoom from "~/components/Meeting/MeetingRoom";
import { useGetCallById } from "~/hooks/useGetCallById";

const MeetingPage = () => {
  const { meetingId } = useParams();
  const id = meetingId ? meetingId.toString() : "";
  const { user } = useAuthStore();
  const { call, isCallLoading } = useGetCallById(id);
  const [isSetupComplete, setIsSetupComplete] = useState(false);

  if (isCallLoading) return "Loading...";

  if (!call)
    return (
      <p className="text-center text-3xl font-bold text-white">
        Call Not Found
      </p>
    );

  const notAllowed =
    call.type === "invited" &&
    (!user ||
      !call.state.members.find((m) => m.user.id === user.id.toString()));

  if (notAllowed) {
    toast.error("Your are not allow to attend this meeting");
    return;
  }

  return (
    <main className={`h-screen w-full`}>
      <StreamCall call={call}>
        <StreamTheme>
          {!isSetupComplete ? (
            <MeetingSetup setIsSetupComplete={setIsSetupComplete} />
          ) : (
            <div>
              <MeetingRoom meetingId={meetingId?.toString()} />
            </div>
          )}
        </StreamTheme>
      </StreamCall>
    </main>
  );
};

export default MeetingPage;
