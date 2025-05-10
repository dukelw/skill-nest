/* eslint-disable @typescript-eslint/no-explicit-any */
import { AssignmentType } from "./AssignmentType";
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
  type: AssignmentType;
  comments: any[];
  submissions: Submission[];
  questions: any[];
}
