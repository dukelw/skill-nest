import Assignment from "./Assignment";
import ClassroomMember from "./ClassroomMember";
import Notification from "./Notification";

export default interface Classroom {
  id: number;
  code: string;
  name: string;
  thumnail?: string;
  creatorId: number;
  createdAt: string;
  updatedAt: string;
  members: ClassroomMember[];
  notifications: Notification[];
  assignments: Assignment[];
}
