import { CalendarDays } from "lucide-react";
import LewisButton from "../partial/LewisButton";

export default function MeetingCard({
  title,
  date,
}: {
  title: string;
  date: string;
}) {
  return (
    <div className="bg-card border p-4 rounded-xl space-y-2">
      <div className="flex items-center gap-2 text-muted-foreground text-sm">
        <CalendarDays size={16} />
        <span>{date}</span>
      </div>
      <h3 className="text-lg font-medium">{title}</h3>
      <div className="flex gap-2">
        <LewisButton space={false} lewisSize="small">
          Start
        </LewisButton>
        <LewisButton space={false} lewisSize="small">
          Copy Code
        </LewisButton>
      </div>
    </div>
  );
}
