// src/services/batchApi.ts
import api from './api';
import { Batch, BatchFormData, Trainee } from '@/app/types/Batch';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
  warning?: string;
}

class BatchApiService {
  // Get all batches
  async getAllBatches(): Promise<ApiResponse<Batch[]>> {
    try {
      const response = await api.get('/batches');
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error: any) {
      console.error('Get all batches error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch batches'
      };
    }
  }

  // Get available courses (published only)
  async getAvailableCourses(): Promise<ApiResponse<any[]>> {
    try {
      const response = await api.get('/batches/available-courses');
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error: any) {
      console.error('Get available courses error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch courses'
      };
    }
  }

  // Get all trainees
  async getTrainees(): Promise<ApiResponse<Trainee[]>> {
    try {
      const response = await api.get('/batches/trainees');
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error: any) {
      console.error('Get trainees error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch trainees'
      };
    }
  }

  // Get batch with assigned and available trainees
  async getBatchWithTrainees(batchId: string | number): Promise<ApiResponse<any>> {
    try {
      const response = await api.get(`/batches/${batchId}/with-trainees`);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error: any) {
      console.error('Get batch with trainees error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch batch details'
      };
    }
  }

  // Create batch
  async createBatch(batchData: BatchFormData): Promise<ApiResponse<Batch>> {
    try {
      const response = await api.post('/batches', batchData);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error: any) {
      console.error('Create batch error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create batch',
        errors: error.response?.data?.errors
      };
    }
  }

  // Update batch
  async updateBatch(id: string | number, batchData: Partial<BatchFormData>): Promise<ApiResponse<Batch>> {
    try {
      const response = await api.put(`/batches/${id}`, batchData);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error: any) {
      console.error('Update batch error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update batch',
        errors: error.response?.data?.errors
      };
    }
  }

  // Update batch status
  async updateBatchStatus(id: string | number, status: string): Promise<ApiResponse<Batch>> {
    try {
      const response = await api.patch(`/batches/${id}/status`, { status });
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error: any) {
      console.error('Update batch status error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update status'
      };
    }
  }

  // Assign trainees to batch
  async assignTrainees(batchId: string | number, traineeIds: string[]): Promise<ApiResponse<any>> {
    try {
      const response = await api.post(`/batches/${batchId}/assign`, { trainee_ids: traineeIds });
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
        warning: response.data.warning
      };
    } catch (error: any) {
      console.error('Assign trainees error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to assign trainees'
      };
    }
  }

  // Remove trainees from batch
  async removeTrainees(batchId: string | number, traineeIds: string[]): Promise<ApiResponse<any>> {
    try {
      const response = await api.post(`/batches/${batchId}/remove`, { trainee_ids: traineeIds });
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error: any) {
      console.error('Remove trainees error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to remove trainees'
      };
    }
  }

  // Delete batch
  async deleteBatch(id: string | number): Promise<ApiResponse> {
    try {
      const response = await api.delete(`/batches/${id}`);
      return {
        success: true,
        message: response.data.message
      };
    } catch (error: any) {
      console.error('Delete batch error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete batch'
      };
    }
  }
}

const batchApi = new BatchApiService();
export default batchApi;