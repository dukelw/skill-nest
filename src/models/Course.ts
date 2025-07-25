import { Chapter } from "./Chapter";
import { Goal } from "./Goal";
import { Lesson } from "./Lesson";
import User from "./User";

export type Course = {
  id: number;
  title: string;
  description?: string | null;
  thumbnail?: string | null;
  introVideoUrl?: string | null;
  createdAt: string;
  lessons: Lesson[];
  members: User[];
  creatorId: number;
  totalLessons: number;
  totalDuration: number;
  totalMembers: number;
  isFree: boolean;
  level: string;
  creator: User;
  goals?: Goal[];
  chapters?: Chapter[];
};
