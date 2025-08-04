/* eslint-disable @typescript-eslint/no-explicit-any */
import { AssignmentType } from "./AssignmentType";
import Classroom from "./Classroom";
import Comment from "./Comment";
import Submission from "./Submission";

export default interface Assignment {
  id: number;
  description: string;
  classroomId: number;
  comment: string;
  createdAt: string; // Date in ISO string format
  dueDate: string; // Date in ISO string format
  fileUrl: string;
  title: string;
  role: string;
  classroomName: string;
  type: AssignmentType;
  comments: Comment[];
  submissions: Submission[];
  classroom: Classroom;
  questions: any[];
}
