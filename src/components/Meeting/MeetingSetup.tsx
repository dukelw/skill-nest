/* eslint-disable @next/next/no-img-element */
"use client";
import { useEffect, useState } from "react";
import {
  DeviceSettings,
  VideoPreview,
  useCall,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";
import { toast } from "sonner";
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
    <div className="flex min-h-screen w-full items-center justify-center bg-slate-50 p-4 text-slate-900 sm:p-6">
      <section className="w-full max-w-4xl rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
              Meeting setup
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
              Check your camera and microphone
            </h1>
          </div>
          <p className="text-sm text-slate-500">
            You can adjust devices before joining the room.
          </p>
        </div>

        <div className="relative aspect-video overflow-hidden rounded-lg border border-slate-200 bg-slate-950">
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

        <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-700">
          <input
            type="checkbox"
            checked={isMicCamToggled}
            onChange={(e) => setIsMicCamToggled(e.target.checked)}
              className="h-4 w-4 cursor-pointer rounded border-slate-300 text-emerald-700 focus:ring-emerald-200"
          />
          Join with mic and camera off
        </label>
          <div className="flex flex-wrap items-center justify-end gap-3">
            <DeviceSettings />
            <LewisButton
              onClick={() => {
                call.join();
                setIsSetupComplete(true);
              }}
            >
              Join meeting
            </LewisButton>
          </div>
        </div>
      </section>
    </div>
  );
};

export default MeetingSetup;
