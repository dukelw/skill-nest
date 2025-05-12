import User from "./User";

export default interface Request {
  id: number;
  classroomId: number;
  userId: number;
  user: User;
}
