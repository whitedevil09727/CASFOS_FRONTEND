// src/hooks/useCourses.ts
import { useState, useEffect, useCallback } from 'react';
import courseApi from '@/app/Services/courseApi';
import { Course, CourseFormData, Status } from '@/app/types/course';

interface Statistics {
  draft: number;
  underReview: number;
  approved: number;
  published: number;
  total: number;
}

export const useCourses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statistics, setStatistics] = useState<Statistics>({
    draft: 0,
    underReview: 0,
    approved: 0,
    published: 0,
    total: 0
  });

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    const result = await courseApi.getAllCourses();
    
    if (result.success && result.data) {
      setCourses(result.data);
      const stats: Statistics = {
        draft: result.data.filter(c => c.status === 'Draft').length,
        underReview: result.data.filter(c => c.status === 'Under Review').length,
        approved: result.data.filter(c => c.status === 'Approved').length,
        published: result.data.filter(c => c.status === 'Published').length,
        total: result.data.length
      };
      setStatistics(stats);
    } else {
      setError(result.error || 'Failed to fetch courses');
    }
    
    setLoading(false);
  }, []);

  const createCourse = useCallback(async (courseData: CourseFormData) => {
    const result = await courseApi.createCourse(courseData);
    
    if (result.success) {
      await fetchCourses();
      return { success: true, data: result.data };
    } else {
      return { success: false, errors: result.errors, error: result.error };
    }
  }, [fetchCourses]);

  const updateCourse = useCallback(async (id: string | number, courseData: Partial<CourseFormData>) => {
    const result = await courseApi.updateCourse(id, courseData);
    
    if (result.success) {
      await fetchCourses();
      return { success: true, data: result.data };
    } else {
      return { success: false, errors: result.errors, error: result.error };
    }
  }, [fetchCourses]);

  const updateStatus = useCallback(async (id: string | number, status: Status) => {
    const result = await courseApi.updateCourseStatus(id, status);
    
    if (result.success && result.data) {
      setCourses(prevCourses => 
        prevCourses.map(course => 
          course.id === id ? { ...course, status, updated_at: new Date().toISOString() } : course
        )
      );
      
      // Update statistics
      setStatistics(prev => {
        const oldCourse = courses.find(c => c.id === id);
        const newStats = { ...prev };
        
        if (oldCourse) {
          const oldStatus = oldCourse.status.toLowerCase();
          const newStatus = status.toLowerCase();
          
          if (oldStatus === 'draft') newStats.draft--;
          if (oldStatus === 'under review') newStats.underReview--;
          if (oldStatus === 'approved') newStats.approved--;
          if (oldStatus === 'published') newStats.published--;
          
          if (newStatus === 'draft') newStats.draft++;
          if (newStatus === 'under review') newStats.underReview++;
          if (newStatus === 'approved') newStats.approved++;
          if (newStatus === 'published') newStats.published++;
        }
        
        return newStats;
      });
      
      return { success: true, data: result.data };
    } else {
      setError(result.error || 'Failed to update status');
      return { success: false, error: result.error };
    }
  }, [courses]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  return {
    courses,
    loading,
    error,
    statistics,
    fetchCourses,
    createCourse,
    updateCourse,
    updateStatus
  };
};