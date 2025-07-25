import { Lesson } from "./Lesson";
import { Course } from "./Course";

export type Chapter = {
  id: number;
  title: string;
  order: number;
  courseId: number;
  course?: Course;
  lessons: Lesson[];
};
