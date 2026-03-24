// src/types/batch.ts
export type BatchStatus = "Draft" | "Active" | "Full" | "Archived";
export type BatchType = "Induction" | "In-Service" | "Special";
export type Gender = "Male" | "Female" | "Other" | "All";
export type ServiceType = "IFS" | "SFS" | "Other" | "All";
export type EnrollmentStatus = "Enrolled" | "Pending" | "Withdrawn" | "All";

export interface Batch {
  id: string | number;
  code: string;
  name: string;
  course_id: number;
  course?: {
    id: number;
    code: string;
    name: string;
    start_date: string;
    end_date: string;
  };
  capacity: number;
  status: BatchStatus;
  start_date: string;
  end_date: string;
  lead_instructor?: string;
  description?: string;
  trainee_ids: string[];
  current_count: number;
  fill_percentage: number;
  is_full: boolean;
  created_at: string;
  updated_at: string;
}

export interface BatchFormData {
  code: string;
  name: string;
  course_id: number;
  capacity: number;
  status: BatchStatus;
  startDate: string;
  endDate: string;
  lead_instructor?: string;
  description?: string;
}

export interface Trainee {
  id: string;
  roll_number: string;
  name: string;
  gender: Gender;
  service_type: ServiceType;
  enrollment_status: EnrollmentStatus;
  email?: string;
  phone?: string;
}