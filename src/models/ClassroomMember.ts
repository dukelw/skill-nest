import User from "./User";
import { UserRole } from "./UserRole";

export default interface ClassroomMember {
  id: number;
  userId: number;
  classroomId: number;
  role: UserRole;
  user: User;
}
