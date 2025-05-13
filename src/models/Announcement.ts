import { AnnouncementReceiver } from "./AnnouncementReceiver";
import User from "./User";

export interface Announcement {
  id: number;
  title: string;
  content?: string;
  href?: string;
  senderId: number;
  sender: User;
  createdAt: string;
  receivers: AnnouncementReceiver[];
}
