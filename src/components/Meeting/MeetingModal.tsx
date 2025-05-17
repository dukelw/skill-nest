import { useEffect, useState } from "react";
import { Modal, ModalHeader, ModalBody, Label } from "flowbite-react";
import LewisButton from "~/components/partial/LewisButton";
import LewisTextInput from "../partial/LewisTextInput";
import { useAuthStore } from "~/store/authStore";
import { Call, useStreamVideoClient } from "@stream-io/video-react-sdk";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

interface MeetingModalProps {
  openModal: "new" | "join" | "schedule" | null;
  setOpenModal: (modal: "new" | "join" | "schedule" | null) => void;
}

const initialValues = {
  dateTime: new Date(),
  description: "",
  link: "",
};

export default function MeetingModal({
  openModal,
  setOpenModal,
}: MeetingModalProps) {
  const [createType, setCreateType] = useState<"now" | "custom" | null>(null);
  const [customCode, setCustomCode] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [scheduleCode, setScheduleCode] = useState("");
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const { user } = useAuthStore();
  const client = useStreamVideoClient();
  const [values, setValues] = useState(initialValues);
  const [callDetail, setCallDetail] = useState<Call>();
  const [showScheduleResult, setShowScheduleResult] = useState<null | string>(
    null
  );

  const router = useRouter();

  const handleStartMeeting = async () => {
    if (!client || !user) return;
    try {
      if (!values.dateTime) {
        toast.warning("Please select a date and time");
        return;
      }
      const finalCode =
        customCode.trim() !== ""
          ? customCode
          : crypto.randomUUID().slice(0, 12);
      const call = client.call("default", finalCode);
      if (!call) throw new Error("Failed to create meeting");
      const startsAt =
        values.dateTime.toISOString() || new Date(Date.now()).toISOString();
      const description = values.description || "Instant Meeting";
      await call.getOrCreate({
        data: {
          starts_at: startsAt,
          custom: {
            description,
          },
        },
      });
      setOpenModal(null);
      setCallDetail(call);
      if (!values.description) {
        router.push(`/meeting/${call.id}`);
      }
      toast.success("Meeting Created");
    } catch (error) {
      console.error(error);
      toast.error("Failed to create Meeting");
    }
  };

  const handleJoinMeeting = async () => {
    const callType = "default";

    client?.call(callType, joinCode);
    setOpenModal(null);
    setJoinCode("");
    setOpenModal(null);
    router.push(`/meeting/${joinCode}`);
  };

  const handleScheduleMeeting = async () => {
    if (!client || !user) return;

    try {
      if (!scheduleDate || !scheduleTime) {
        toast.warning("Please select date and time");
        return;
      }

      const startsAt = new Date(`${scheduleDate}T${scheduleTime}`);
      const finalCode =
        scheduleCode.trim() !== ""
          ? scheduleCode
          : crypto.randomUUID().slice(0, 12);

      const call = client.call("default", finalCode);
      if (!call) throw new Error("Failed to create meeting");

      await call.getOrCreate({
        data: {
          starts_at: startsAt.toISOString(),
          custom: {
            description: "Scheduled Meeting",
          },
        },
      });

      toast.success("Meeting Scheduled");
      setOpenModal(null);
      setScheduleCode("");
      setScheduleDate("");
      setScheduleTime("");
      setShowScheduleResult(finalCode);
    } catch (err) {
      console.error(err);
      toast.error("Failed to schedule meeting");
    }
  };

  const formatCode = (input: string) => {
    const raw = input.replace(/[^A-Z0-9]/gi, "").toUpperCase();
    return (
      raw
        .match(/.{1,4}/g)
        ?.join("-")
        .slice(0, 14) || ""
    );
  };

  useEffect(() => {
    if (scheduleDate && scheduleTime) {
      const combined = new Date(`${scheduleDate}T${scheduleTime}`);
      setValues((prev) => ({ ...prev, dateTime: combined }));
    }
  }, [scheduleDate, scheduleTime]);

  return (
    <>
      {/* Modal: Bắt đầu cuộc họp */}
      <Modal
        show={openModal === "new"}
        onClose={() => {
          setOpenModal(null);
          setCreateType(null);
          setCustomCode("");
        }}
      >
        <ModalHeader className="bg-green-500 text-white">
          Start a New Meeting
        </ModalHeader>
        <ModalBody className="space-y-4 text-black">
          {" "}
          {/* text màu đen */}
          {!createType && (
            <div className="flex flex-col gap-2">
              <LewisButton
                lewisSize="full"
                onClick={() => {
                  setCreateType("now");
                  handleStartMeeting();
                }}
              >
                Start Now
              </LewisButton>
              <LewisButton
                lewisSize="full"
                onClick={() => setCreateType("custom")}
                className="bg-gray-200 text-black hover:bg-gray-300"
              >
                Generate My Own Code
              </LewisButton>
            </div>
          )}
          {createType === "custom" && (
            <div className="space-y-2">
              <Label className="text-green" htmlFor="custom-code">
                Enter 12-character code (e.g. ABC1-DE2F-3GH4)
              </Label>
              <LewisTextInput
                className="mt-1"
                id="custom-code"
                value={customCode}
                onChange={(e) => setCustomCode(formatCode(e.target.value))}
                placeholder="ABC1-DE2F-3GH4"
              />
              <LewisButton lewisSize="full" onClick={handleStartMeeting}>
                Create Meeting
              </LewisButton>
            </div>
          )}
        </ModalBody>
      </Modal>

      {/* Modal: Tham gia cuộc họp */}
      <Modal
        show={openModal === "join"}
        onClose={() => {
          setOpenModal(null);
          setJoinCode("");
        }}
      >
        <ModalHeader className="bg-green-500 text-white">
          Join Meeting
        </ModalHeader>
        <ModalBody className="space-y-4">
          <Label className="text-green" htmlFor="join-code">
            Invitation Code or Link
          </Label>
          <LewisTextInput
            className="mt-1"
            id="join-code"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
            placeholder="Paste your code or link here"
          />
          <LewisButton
            space={false}
            lewisSize="full"
            onClick={handleJoinMeeting}
          >
            Join Now
          </LewisButton>
        </ModalBody>
      </Modal>

      {/* Modal: Đặt lịch cuộc họp */}
      <Modal show={openModal === "schedule"} onClose={() => setOpenModal(null)}>
        <ModalHeader className="bg-green-500 text-white">
          Schedule a Meeting
        </ModalHeader>
        <ModalBody className="space-y-4 text-black">
          <div>
            <Label className="text-green" htmlFor="schedule-code">
              Enter Meeting Code
            </Label>
            <LewisTextInput
              className="mt-1"
              id="schedule-code"
              value={scheduleCode}
              onChange={(e) => setScheduleCode(formatCode(e.target.value))}
              placeholder="ABC1-DE2F-3GH4"
            />
          </div>

          <div>
            <Label className="text-green" htmlFor="schedule-date">
              Select Date
            </Label>
            <LewisTextInput
              className="mt-1"
              id="schedule-date"
              type="date"
              value={scheduleDate}
              onChange={(e) => setScheduleDate(e.target.value)}
            />
          </div>

          <div>
            <Label className="text-green" htmlFor="schedule-time">
              Select Time
            </Label>
            <LewisTextInput
              className="mt-1"
              id="schedule-time"
              type="time"
              value={scheduleTime}
              onChange={(e) => setScheduleTime(e.target.value)}
            />
          </div>

          <LewisButton
            space={false}
            lewisSize="full"
            onClick={handleScheduleMeeting}
          >
            Schedule
          </LewisButton>
        </ModalBody>
      </Modal>

      <Modal
        show={showScheduleResult !== null}
        onClose={() => setShowScheduleResult(null)}
      >
        <ModalHeader className="bg-green-500 text-white">
          Meeting Scheduled Successfully
        </ModalHeader>
        <ModalBody className="space-y-4">
          <div className="text-center">
            <p className="mb-2">Your meeting code:</p>
            <div className="font-bold text-lg">{showScheduleResult}</div>
          </div>
          <LewisButton
            space={false}
            lewisSize="full"
            onClick={() => {
              navigator.clipboard.writeText(showScheduleResult!);
              toast.success("Code copied to clipboard");
            }}
          >
            Copy Code
          </LewisButton>
        </ModalBody>
      </Modal>
    </>
  );
}
