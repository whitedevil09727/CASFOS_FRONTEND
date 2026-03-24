// src/types/course.ts
export type Status = "Draft" | "Under Review" | "Approved" | "Published" | "Archived";
export type Category = "Induction" | "In-Service" | "Special";
export type CourseType = "Residential" | "Non-Residential" | "Hybrid";

export interface Course {
  id: string | number;
  code: string;
  name: string;
  category: Category;
  type: CourseType;
  start_date: string;
  end_date: string;
  duration_days: number;
  status: Status;
  updated_at: string;
  description: string;
  capacity?: number;
  notes?: string;
  created_at?: string;
}

export interface CourseFormData {
  code: string;
  name: string;
  category: Category;
  type: CourseType;
  startDate: string;
  endDate: string;
  durationDays: number;
  status: Status;
  description: string;
  capacity?: number;
  notes?: string;
}