export default interface SubmissionComment {
  id: number;
  userId: number;
  submissionId: number;
  comment: string;
  createdAt: string; // Date in ISO string format
}
