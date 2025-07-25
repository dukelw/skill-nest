import Classroom from "./Classroom";
import { Course } from "./Course";

export type Lesson = {
  id: number;
  name: string;
  thumbnail?: string | null;
  contentUrl?: string | null;
  duration: number;
  classroomId?: number | null;
  courseId?: number | null;
  classroom?: Classroom | null;
  course?: Course | null;
  createdAt: string;
};
