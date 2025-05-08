import NotificationRecipient from "./NotificationRecipient";

export default interface Notification {
  id: number;
  title: string;
  content: string;
  classroomId: number;
  createdAt: string;
  recipients: NotificationRecipient[];
}
