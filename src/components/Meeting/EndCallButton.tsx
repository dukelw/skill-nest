"use client";

import { useCall, useCallStateHooks } from "@stream-io/video-react-sdk";

import { useRouter } from "next/navigation";
import LewisButton from "../Partial/LewisButton";

const EndCallButton = () => {
  const call = useCall();
  const router = useRouter();

  if (!call)
    throw new Error(
      "useStreamCall must be used within a StreamCall component."
    );

  const { useLocalParticipant } = useCallStateHooks();
  const localParticipant = useLocalParticipant();

  const isMeetingOwner =
    localParticipant &&
    call.state.createdBy &&
    localParticipant.userId === call.state.createdBy.id;

  if (!isMeetingOwner) return null;

  const endCall = async () => {
    await call.endCall();
    router.push("/");
  };

  return (
    <button
      onClick={endCall}
      className="rounded-full bg-red px-3 py-1 hover:bg-red-700 text-white"
      aria-label="Toggle Camera"
    >
      End call
    </button>
  );
};

export default EndCallButton;
