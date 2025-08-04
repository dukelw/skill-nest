/* eslint-disable @next/next/no-img-element */
"use client";
import { useEffect, useState } from "react";
import {
  DeviceSettings,
  VideoPreview,
  useCall,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";
import { toast } from "react-toastify";
import LewisButton from "../Partial/LewisButton";

const OFF_IMAGE_URL =
  "https://res.cloudinary.com/dukelewis-workspace/image/upload/v1747039662/uploads/a541itrjuslvtbifaz1q.jpg";

const MeetingSetup = ({
  setIsSetupComplete,
}: {
  setIsSetupComplete: (value: boolean) => void;
}) => {
  const { useCallEndedAt, useCallStartsAt } = useCallStateHooks();
  const callStartsAt = useCallStartsAt();
  const callEndedAt = useCallEndedAt();
  const callTimeNotArrived =
    callStartsAt && new Date(callStartsAt) > new Date();
  const callHasEnded = !!callEndedAt;

  const call = useCall();

  if (!call) {
    throw new Error(
      "useStreamCall must be used within a StreamCall component."
    );
  }

  const [isMicCamToggled, setIsMicCamToggled] = useState(false);

  useEffect(() => {
    if (isMicCamToggled) {
      call.camera.disable();
      call.microphone.disable();
    } else {
      call.camera.enable();
      call.microphone.enable();
    }
  }, [isMicCamToggled, call.camera, call.microphone]);

  useEffect(() => {
    if (callTimeNotArrived) {
      toast.error(
        `Your Meeting has not started yet. It is scheduled for ${callStartsAt?.toLocaleString()}`
      );
    }
    if (callHasEnded) {
      toast.error("Meeting has ended");
    }
  }, [callTimeNotArrived, callHasEnded, callStartsAt]);

  if (callTimeNotArrived || callHasEnded) {
    return null;
  }

  return (
    <div className="flex h-screen w-full p-6 flex-col items-center justify-center gap-3 text-green-600">
      <h1 className="text-center text-3xl font-bold text-green-600">Setup</h1>
      <div className="rounded-lg overflow-hidden relative bg-black">
        {!isMicCamToggled ? (
          <VideoPreview className="w-full h-full object-cover" />
        ) : (
          <img
            src={OFF_IMAGE_URL}
            alt="Camera off"
            className="w-full h-full object-cover"
          />
        )}
      </div>
      <div className="flex h-10 items-center justify-center gap-1">
        <label className="flex items-center justify-center gap-2 font-medium text-green-600">
          <input
            type="checkbox"
            checked={isMicCamToggled}
            onChange={(e) => setIsMicCamToggled(e.target.checked)}
          />
          Join with mic and camera off
        </label>
        <DeviceSettings />
      </div>
      <LewisButton
        lewisSize="large"
        className="rounded-md bg-green-500 px-4 py-1"
        onClick={() => {
          call.join();
          setIsSetupComplete(true);
        }}
      >
        Join meeting
      </LewisButton>
    </div>
  );
};

export default MeetingSetup;
