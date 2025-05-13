import { Announcement } from "./Announcement";
import User from "./User";

export interface AnnouncementReceiver {
  id: number;
  announcementId: number;
  userId: number;
  isRead: boolean;
  createdAt: string;
  announcement: Announcement;
  user: User;
}
