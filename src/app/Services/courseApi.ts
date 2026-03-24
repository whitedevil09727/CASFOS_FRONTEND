// src/services/courseApi.ts
import api from './api';
import { Course, CourseFormData, Status } from '@/app/types/course';

interface ApiResponse<T = any> {
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
        data: response.data.data || response.data,
        message: response.data.message
      };
    } catch (error: any) {
      console.error('Get all courses error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch courses',
        data: error.response?.data
      };
    }
  }

  async getCourse(id: string | number): Promise<ApiResponse<Course>> {
    try {
      const response = await api.get(`/courses/${id}`);
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message
      };
    } catch (error: any) {
      console.error('Get course error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch course',
        data: error.response?.data
      };
    }
  }

  async createCourse(courseData: CourseFormData): Promise<ApiResponse<Course>> {
    try {
      const response = await api.post('/courses', courseData);
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || 'Course created successfully'
      };
    } catch (error: any) {
      console.error('Create course error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create course',
        errors: error.response?.data?.errors,
        data: error.response?.data
      };
    }
  }

  async updateCourse(id: string | number, courseData: Partial<CourseFormData>): Promise<ApiResponse<Course>> {
    try {
      const response = await api.put(`/courses/${id}`, courseData);
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || 'Course updated successfully'
      };
    } catch (error: any) {
      console.error('Update course error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update course',
        errors: error.response?.data?.errors,
        data: error.response?.data
      };
    }
  }

  async updateCourseStatus(id: string | number, status: Status): Promise<ApiResponse<Course>> {
    try {
      const response = await api.patch(`/courses/${id}/status`, { status });
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || 'Course status updated successfully'
      };
    } catch (error: any) {
      console.error('Update course status error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update course status',
        data: error.response?.data
      };
    }
  }

  async deleteCourse(id: string | number): Promise<ApiResponse> {
    try {
      const response = await api.delete(`/courses/${id}`);
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || 'Course deleted successfully'
      };
    } catch (error: any) {
      console.error('Delete course error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete course',
        data: error.response?.data
      };
    }
  }

  async getCoursesByStatus(status: Status): Promise<ApiResponse<Course[]>> {
    try {
      const response = await api.get(`/courses/status/${status}`);
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message
      };
    } catch (error: any) {
      console.error('Get courses by status error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch courses',
        data: error.response?.data
      };
    }
  }
}

const courseApi = new CourseApiService();
export default courseApi;