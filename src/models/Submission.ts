import Assignment from "./Assignment";
import User from "./User";

export default interface Submission {
  id: number;
  userId: number;
  assignmentId: number;
  submittedAt: string;
  user: User;
  assignment: Assignment;
  fileUrl: string;
  grade: string;
}
