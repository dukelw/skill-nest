import Assignment from "./Assignment";
import User from "./User";

export default interface Comment {
  id: number;
  content: string;
  userId: number;
  parentId?: number;
  assignmentId: number;
  createdAt: string;
  updatedAt: string;
  user: User;
  parent: Comment;
  assignment: Assignment;
  replies: Comment[];
}
