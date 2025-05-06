export default interface AssignmentComment {
  id: number;
  userId: number;
  assignmentId: number;
  comment: string;
  createdAt: string; // Date in ISO string format
}
