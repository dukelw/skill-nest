import { CalendarDays } from "lucide-react";
import LewisButton from "../Partial/LewisButton";

interface MeetingCardProps {
  title: string;
  date: string;
  buttonText?: string;
  handleClick: () => void;
  link: string;
  isRecording?: boolean;
}

export default function MeetingCard({
  title,
  date,
  handleClick,
  link,
  buttonText,
  isRecording,
}: MeetingCardProps) {
  const formattedDate = isRecording
    ? new Date(date).toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : date;
  return (
    <div className="bg-card border p-4 rounded-xl space-y-2">
      <div className="flex items-center gap-2 text-muted-foreground text-sm">
        <CalendarDays size={16} />
        <span>{formattedDate}</span>
      </div>
      <h3 className="text-lg font-medium">{title}</h3>
      <div className="flex gap-2">
        <LewisButton
          lewisSize={isRecording ? "full" : "small"}
          href={link}
          space={false}
        >
          {buttonText}
        </LewisButton>
        {!isRecording && (
          <LewisButton onClick={handleClick} space={false} lewisSize="small">
            Copy Code
          </LewisButton>
        )}
      </div>
    </div>
  );
}
