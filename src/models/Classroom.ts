import User from "./User"; // Import User Interface

export default interface Classroom {
  id: number;
  code: string;
  name: string;
  thumnail?: string;
  creatorId: number;
  createdAt: string; // Date in ISO string format
  updatedAt: string; // Date in ISO string format
  members: User[]; // Array of users (students, teachers) in this classroom
}
