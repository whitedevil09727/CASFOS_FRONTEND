// services/dashboard.ts
import api from './api';

export interface DashboardStats {
  total_users: number;
  users_by_role: {
    admin: number;
    course_director: number;
    faculty: number;
    trainee: number;
  };
}

export interface CourseDirector {
  id: number;
  name: string;
  email: string;
  username: string;
  appointed_at: string;
  appointed_by: string | null;
  term_start: string;
  term_end: string | null;
}

export interface DashboardData {
  stats: DashboardStats;
  user: {
    name: string;
    role: string;
    role_display: string;
  };
  current_course_director: CourseDirector | null;
  recent_users: any[];
  message: string;
}

export const dashboardService = {
  // Get dashboard data
  getDashboard: async (): Promise<DashboardData> => {
    const response = await api.get('/dashboard');
    return response.data.dashboard_data;
  },

  // Get eligible faculty for appointment
  getEligibleFaculty: async () => {
    const response = await api.get('/admin/faculty/eligible');
    return response.data.data;
  },

  // Get current course director
  getCurrentDirector: async () => {
    const response = await api.get('/admin/current-director');
    return response.data.data;
  },

  // Get appointment history
  getAppointmentHistory: async () => {
    const response = await api.get('/admin/appointment-history');
    return response.data.data;
  },

  // Get appointment statistics
  getAppointmentStats: async () => {
    const response = await api.get('/admin/appointment-stats');
    return response.data.data;
  },

  // Appoint new course director
  appointDirector: async (userId: number, termStart?: string, termEnd?: string) => {
    const response = await api.post('/admin/appoint', {
      user_id: userId,
      term_start: termStart,
      term_end: termEnd,
    });
    return response.data;
  },

  // Extend current director's term
  extendTerm: async (termEnd: string) => {
    const response = await api.post('/admin/extend-term', { term_end: termEnd });
    return response.data;
  },
};