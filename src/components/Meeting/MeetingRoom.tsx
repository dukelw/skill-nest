"use client";
import "@stream-io/video-react-sdk/dist/css/styles.css";
import { useState } from "react";
import {
  CallControls,
  CallParticipantsList,
  CallingState,
  PaginatedGridLayout,
  SpeakerLayout,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";
import { useSearchParams } from "next/navigation";
import { Users } from "lucide-react";
import { Copy } from "lucide-react";

import EndCallButton from "./EndCallButton";
import Loader from "../partial/Loader";

type CallLayoutType = "grid" | "speaker-left" | "speaker-right";

const MeetingCodeBox = ({ meetingId }: { meetingId: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(meetingId);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex items-center gap-3 rounded-lg bg-[#2a2b2d] px-4 py-2 text-sm text-white shadow-md border border-[#3c4043] w-fit">
      <span className="font-medium">Code</span>
      <button
        onClick={handleCopy}
        className="hover:text-emerald-400 transition duration-200"
        title="Copy code"
      >
        <Copy size={16} />
      </button>
      {copied && <span className="text-emerald-400 text-xs ml-2">Copied!</span>}
    </div>
  );
};

interface CallLayoutProps {
  layout: CallLayoutType;
}

const CallLayout = ({ layout }: CallLayoutProps) => {
  switch (layout) {
    case "grid":
      return <PaginatedGridLayout />;
    case "speaker-right":
      return <SpeakerLayout participantsBarPosition="left" />;
    case "speaker-left":
    default:
      return <SpeakerLayout participantsBarPosition="right" />;
  }
};

const LayoutToggleButton = ({
  layout,
  setLayout,
}: {
  layout: CallLayoutType;
  setLayout: (layout: CallLayoutType) => void;
}) => {
  const handleClick = () => {
    const layouts: CallLayoutType[] = ["speaker-left", "speaker-right", "grid"];
    const nextIndex = (layouts.indexOf(layout) + 1) % layouts.length;
    setLayout(layouts[nextIndex]);
  };

  return (
    <button
      onClick={handleClick}
      title="Toggle Layout"
      className="cursor-pointer rounded-full px-4 py-1 hover:text-emerald-400 transition duration-200"
    >
      🧩
    </button>
  );
};

interface MeetingRoomProps {
  meetingId: string;
}

const MeetingRoom = ({ meetingId }: MeetingRoomProps) => {
  const searchParams = useSearchParams();
  const isPersonalRoom = !!searchParams.get("personal");
  const [layout, setLayout] = useState<CallLayoutType>("speaker-left");
  const [showParticipants, setShowParticipants] = useState(false);

  const { useCallCallingState } = useCallStateHooks();

  const callingState = useCallCallingState();

  if (callingState !== CallingState.JOINED) return <Loader />;

  return (
    <section
      className="px-6 py-8 relative w-full overflow-hidden bg-[#202124] text-white"
      style={{ marginTop: "-4px", height: "calc(100vh + 4px)" }}
    >
      <div className="relative max-h-[540px] flex w-full items-center justify-center">
        <div className="flex w-full max-w-[1000px] items-center">
          <CallLayout layout={layout} />
        </div>
        <div
          className={
            "h-[calc(100vh-160px)] ml-4 " +
            (showParticipants ? "block" : "hidden")
          }
        >
          <CallParticipantsList onClose={() => setShowParticipants(false)} />
        </div>
      </div>

      {/* Bottom controls */}
      <div
        className="fixed bottom-0 flex w-full  items-center justify-center gap-5 p-1.5 px-5 rounded-t-3xl shadow-lg"
        style={{ left: "50%", transform: "translateX(-50%)", height: "48px" }}
      >
        <MeetingCodeBox meetingId={meetingId} />
        <CallControls />
        {/* <LayoutToggleButton layout={layout} setLayout={setLayout} /> */}
        <button
          onClick={() => setShowParticipants((prev) => !prev)}
          className="cursor-pointer rounded-full px-4 py-1 "
          aria-label="Toggle Participants List"
        >
          <Users size={20} className="text-white" />
        </button>
        {!isPersonalRoom && <EndCallButton />}
      </div>
    </section>
  );
};

export default MeetingRoom;
