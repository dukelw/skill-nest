import { Course } from "./Course";
import User from "./User";

export type CourseEnrollment = {
  id: number;
  user: User;
  courseId: number;
  userId: number;
  course: Course;
};
