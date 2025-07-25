import { Course } from "./Course";

export type Goal = {
  id: number;
  content: string;
  courseId: number;
  course?: Course;
};
