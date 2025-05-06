import { UserRole } from "./UserRole"; // Import Enum UserRole
import Classroom from "./Classroom";
import ClassroomMember from "./ClassroomMember";
import Submission from "./Submission";
import AssignmentComment from "./AssignmentComment";
import SubmissionComment from "./SubmissionComment";

export default interface User {
  id: number;
  email: string;
  name?: string;
  avatar?: string;
  gender?: string;
  password: string;
  phone?: string;
  createdAt: string; // Date in ISO string format
  updatedAt: string; // Date in ISO string format
  role: UserRole;

  // Relations
  createdClassrooms: Classroom[]; // Array of classrooms where the user is the creator
  classroomMembers: ClassroomMember[]; // Array of classroom memberships
  submissions: Submission[]; // Array of submissions made by the user
  assignmentComments: AssignmentComment[]; // Array of comments on assignments
  submissionComments: SubmissionComment[]; // Array of comments on submissions
}
