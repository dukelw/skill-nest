import Assignment from "./Assignment";
import ClassroomMember from "./ClassroomMember";
import Notification from "./Notification";
import Submission from "./Submission";
import User from "./User";

export default interface Classroom {
  id: number;
  code: string;
  name: string;
  thumbnail?: string;
  creatorId: number;
  creator: User;
  createdAt: string;
  updatedAt: string;
  members: ClassroomMember[];
  notifications: Notification[];
  assignments: Assignment[];
  submissions: Submission[];
}
