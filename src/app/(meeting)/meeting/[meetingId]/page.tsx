"use client";

import { useState } from "react";
import { StreamCall, StreamTheme } from "@stream-io/video-react-sdk";
import { useParams } from "next/navigation";

import { useAuthStore } from "~/store/authStore";
import { toast } from "sonner";
import MeetingSetup from "~/components/Meeting/MeetingSetup";
import MeetingRoom from "~/components/Meeting/MeetingRoom";
import { useGetCallById } from "~/hooks/useGetCallById";
import Loader from "~/components/Partial/Loader";

const MeetingPage = () => {
  const { meetingId } = useParams();
  const id = meetingId ? meetingId.toString() : "";
  const { user } = useAuthStore();
  const { call, isCallLoading } = useGetCallById(id);
  const [isSetupComplete, setIsSetupComplete] = useState(false);

  if (isCallLoading) return <Loader />;

  if (!call)
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <div className="rounded-lg border border-slate-200 bg-white px-8 py-6 text-center shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
            Meeting
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-950">
            Call not found
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            The meeting may have ended or the link is no longer available.
          </p>
        </div>
      </main>
    );

  const notAllowed =
    call.type === "invited" &&
    (!user ||
      !call.state.members.find((m) => m.user?.id === user?.id.toString()));

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
              <MeetingRoom meetingId={id} />
            </div>
          )}
        </StreamTheme>
      </StreamCall>
    </main>
  );
};

export default MeetingPage;
