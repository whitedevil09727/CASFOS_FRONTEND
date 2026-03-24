// src/services/courseApi.ts
import api from './api';
import { Course, CourseFormData, Status } from '@/app/types/course';

interface ApiResponse<T = void> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
}

class CourseApiService {
  async getAllCourses(): Promise<ApiResponse<Course[]>> {
    try {
      const response = await api.get('/courses');
      return {
        success: true,
        data: response.data.data ?? response.data,
        message: response.data.message
      };
    } catch (error: unknown) {
      console.error('Get all courses error:', error);
      const axiosError = error as { response?: { data?: { message?: string } } };
      return {
        success: false,
        error: axiosError.response?.data?.message || 'Failed to fetch courses'
      };
    }
  }

  async getCourse(id: string | number): Promise<ApiResponse<Course>> {
    try {
      const response = await api.get(`/courses/${id}`);
      return {
        success: true,
        data: response.data.data ?? response.data,
        message: response.data.message
      };
    } catch (error: unknown) {
      console.error('Get course error:', error);
      const axiosError = error as { response?: { data?: { message?: string } } };
      return {
        success: false,
        error: axiosError.response?.data?.message || 'Failed to fetch course'
      };
    }
  }

  async createCourse(courseData: CourseFormData): Promise<ApiResponse<Course>> {
    try {
      const response = await api.post('/courses', courseData);
      return {
        success: true,
        data: response.data.data ?? response.data,
        message: response.data.message || 'Course created successfully'
      };
    } catch (error: unknown) {
      console.error('Create course error:', error);
      const axiosError = error as { 
        response?: { 
          data?: { 
            message?: string;
            errors?: Record<string, string[]>;
          } 
        } 
      };
      return {
        success: false,
        error: axiosError.response?.data?.message || 'Failed to create course',
        errors: axiosError.response?.data?.errors
      };
    }
  }

  async updateCourse(id: string | number, courseData: Partial<CourseFormData>): Promise<ApiResponse<Course>> {
    try {
      const response = await api.put(`/courses/${id}`, courseData);
      return {
        success: true,
        data: response.data.data ?? response.data,
        message: response.data.message || 'Course updated successfully'
      };
    } catch (error: unknown) {
      console.error('Update course error:', error);
      const axiosError = error as { 
        response?: { 
          data?: { 
            message?: string;
            errors?: Record<string, string[]>;
          } 
        } 
      };
      return {
        success: false,
        error: axiosError.response?.data?.message || 'Failed to update course',
        errors: axiosError.response?.data?.errors
      };
    }
  }

  async updateCourseStatus(id: string | number, status: Status): Promise<ApiResponse<Course>> {
    try {
      const response = await api.patch(`/courses/${id}/status`, { status });
      return {
        success: true,
        data: response.data.data ?? response.data,
        message: response.data.message || 'Course status updated successfully'
      };
    } catch (error: unknown) {
      console.error('Update course status error:', error);
      const axiosError = error as { response?: { data?: { message?: string } } };
      return {
        success: false,
        error: axiosError.response?.data?.message || 'Failed to update course status'
      };
    }
  }

  async deleteCourse(id: string | number): Promise<ApiResponse<void>> {
    try {
      const response = await api.delete(`/courses/${id}`);
      return {
        success: true,
        message: response.data.message || 'Course deleted successfully'
      };
    } catch (error: unknown) {
      console.error('Delete course error:', error);
      const axiosError = error as { response?: { data?: { message?: string } } };
      return {
        success: false,
        error: axiosError.response?.data?.message || 'Failed to delete course'
      };
    }
  }

  async getCoursesByStatus(status: Status): Promise<ApiResponse<Course[]>> {
    try {
      const response = await api.get(`/courses/status/${status}`);
      return {
        success: true,
        data: response.data.data ?? response.data,
        message: response.data.message
      };
    } catch (error: unknown) {
      console.error('Get courses by status error:', error);
      const axiosError = error as { response?: { data?: { message?: string } } };
      return {
        success: false,
        error: axiosError.response?.data?.message || 'Failed to fetch courses'
      };
    }
  }
}

const courseApi = new CourseApiService();
export default courseApi;