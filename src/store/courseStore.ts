import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Course } from "~/models/Course";
import { CourseEnrollment } from "~/models/CourseEnrollment";
import { Lesson } from "~/models/Lesson";

type CourseState = {
  courses: Course[] | null;
  course: Course | null;
  lesson: Lesson | null;
  courseEnrollments: CourseEnrollment[] | null;
  createdCourse: Course | null;
  selectedCourse: Course | null;
  setCourses: (courses: Course[]) => void;
  setCourseEnrollments: (courseEnrollments: CourseEnrollment[]) => void;
  setCourse: (course: Course) => void;
  setLesson: (lesson: Lesson) => void;
  setCreatedCourse: (course: Course) => void;
  setSelectedCourse: (course: Course) => void;
};

export const useCourseStore = create<CourseState>()(
  persist(
    (set) => ({
      course: null,
      lesson: null,
      courses: null,
      courseEnrollments: null,
      createdCourse: null,
      selectedCourse: null,
      setCourses: (courses) => set({ courses }),
      setCourseEnrollments: (courseEnrollments) => set({ courseEnrollments }),
      setCourse: (course) => set({ course }),
      setLesson: (lesson) => set({ lesson }),
      setCreatedCourse: (course) => set({ createdCourse: course }),
      setSelectedCourse: (course) => set({ selectedCourse: course }),
    }),
    {
      name: "course-storage",
    }
  )
);
