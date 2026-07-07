import { useEffect, useState } from "react";
import {
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "~/components/ui/primitives";
import LewisButton from "~/components/Partial/LewisButton";
import LewisTextInput from "../Partial/LewisTextInput";
import { useAuthStore } from "~/store/authStore";
import { Call, useStreamVideoClient } from "@stream-io/video-react-sdk";
import { toast } from "sonner";
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

const labelClass =
  "text-xs font-semibold uppercase tracking-wide text-slate-600";

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
  const [, setCallDetail] = useState<Call>();
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
        customCode.trim() !== "" ? customCode : crypto.randomUUID().slice(0, 12);
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
      toast.success("Meeting created");
    } catch (error) {
      console.error(error);
      toast.error("Failed to create meeting");
    }
  };

  const handleJoinMeeting = async () => {
    if (!joinCode.trim()) {
      toast.warning("Please enter a meeting code");
      return;
    }

    client?.call("default", joinCode);
    setOpenModal(null);
    setJoinCode("");
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

      toast.success("Meeting scheduled");
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
    return raw.match(/.{1,4}/g)?.join("-").slice(0, 14) || "";
  };

  useEffect(() => {
    if (scheduleDate && scheduleTime) {
      const combined = new Date(`${scheduleDate}T${scheduleTime}`);
      setValues((prev) => ({ ...prev, dateTime: combined }));
    }
  }, [scheduleDate, scheduleTime]);

  return (
    <>
      <Modal
        show={openModal === "new"}
        onClose={() => {
          setOpenModal(null);
          setCreateType(null);
          setCustomCode("");
        }}
      >
        <ModalHeader>
          <div>
            <h2>Start a new meeting</h2>
            <p className="mt-1 text-xs font-medium text-slate-500">
              Open a room now or create a custom invitation code.
            </p>
          </div>
        </ModalHeader>
        <ModalBody className="space-y-4">
          {!createType && (
            <div className="grid gap-2">
              <LewisButton lewisSize="full" onClick={handleStartMeeting}>
                Start Now
              </LewisButton>
              <LewisButton
                lewisSize="full"
                variant="outlined"
                onClick={() => setCreateType("custom")}
              >
                Generate My Own Code
              </LewisButton>
            </div>
          )}
          {createType === "custom" && (
            <div className="space-y-2">
              <Label className={labelClass} htmlFor="custom-code">
                Meeting code
              </Label>
              <LewisTextInput
                id="custom-code"
                value={customCode}
                onChange={(e) => setCustomCode(formatCode(e.target.value))}
                placeholder="ABC1-DE2F-3GH4"
              />
              <p className="text-xs text-slate-500">
                Use 12 letters or numbers. We will format it for readability.
              </p>
            </div>
          )}
        </ModalBody>
        {createType === "custom" && (
          <ModalFooter>
            <LewisButton variant="outlined" onClick={() => setCreateType(null)}>
              Back
            </LewisButton>
            <LewisButton onClick={handleStartMeeting}>Create Meeting</LewisButton>
          </ModalFooter>
        )}
      </Modal>

      <Modal
        show={openModal === "join"}
        onClose={() => {
          setOpenModal(null);
          setJoinCode("");
        }}
      >
        <ModalHeader>
          <div>
            <h2>Join meeting</h2>
            <p className="mt-1 text-xs font-medium text-slate-500">
              Paste a meeting code from your teacher or classmate.
            </p>
          </div>
        </ModalHeader>
        <ModalBody className="space-y-2">
          <Label className={labelClass} htmlFor="join-code">
            Invitation code or link
          </Label>
          <LewisTextInput
            id="join-code"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
            placeholder="Paste your code or link here"
          />
        </ModalBody>
        <ModalFooter>
          <LewisButton variant="outlined" onClick={() => setOpenModal(null)}>
            Cancel
          </LewisButton>
          <LewisButton onClick={handleJoinMeeting}>Join Now</LewisButton>
        </ModalFooter>
      </Modal>

      <Modal show={openModal === "schedule"} onClose={() => setOpenModal(null)}>
        <ModalHeader>
          <div>
            <h2>Schedule a meeting</h2>
            <p className="mt-1 text-xs font-medium text-slate-500">
              Pick a code and time for your upcoming session.
            </p>
          </div>
        </ModalHeader>
        <ModalBody className="space-y-4">
          <div className="space-y-2">
            <Label className={labelClass} htmlFor="schedule-code">
              Meeting code
            </Label>
            <LewisTextInput
              id="schedule-code"
              value={scheduleCode}
              onChange={(e) => setScheduleCode(formatCode(e.target.value))}
              placeholder="ABC1-DE2F-3GH4"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className={labelClass} htmlFor="schedule-date">
                Date
              </Label>
              <LewisTextInput
                id="schedule-date"
                type="date"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label className={labelClass} htmlFor="schedule-time">
                Time
              </Label>
              <LewisTextInput
                id="schedule-time"
                type="time"
                value={scheduleTime}
                onChange={(e) => setScheduleTime(e.target.value)}
              />
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <LewisButton variant="outlined" onClick={() => setOpenModal(null)}>
            Cancel
          </LewisButton>
          <LewisButton onClick={handleScheduleMeeting}>Schedule</LewisButton>
        </ModalFooter>
      </Modal>

      <Modal
        show={showScheduleResult !== null}
        onClose={() => setShowScheduleResult(null)}
      >
        <ModalHeader>
          <div>
            <h2>Meeting scheduled successfully</h2>
            <p className="mt-1 text-xs font-medium text-slate-500">
              Share this code with invited students.
            </p>
          </div>
        </ModalHeader>
        <ModalBody>
          <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-4 text-center">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
              Meeting code
            </p>
            <div className="mt-2 text-lg font-bold text-slate-950">
              {showScheduleResult}
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <LewisButton
            onClick={() => {
              navigator.clipboard.writeText(showScheduleResult!);
              toast.success("Code copied to clipboard");
            }}
          >
            Copy Code
          </LewisButton>
        </ModalFooter>
      </Modal>
    </>
  );
}
