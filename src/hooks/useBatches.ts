// src/hooks/useBatches.ts
import { useState, useEffect, useCallback } from 'react';
import batchApi from '@/app/Services/BatchApi';
import { Batch, Trainee } from '@/app/types/Batch';

export const useBatches = () => {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [trainees, setTrainees] = useState<Trainee[]>([]);
  const [availableCourses, setAvailableCourses] = useState<any[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [assignedTrainees, setAssignedTrainees] = useState<Trainee[]>([]);
  const [availableTrainees, setAvailableTrainees] = useState<Trainee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all batches
  const fetchBatches = useCallback(async () => {
    setLoading(true);
    const result = await batchApi.getAllBatches();
    if (result.success && result.data) {
      setBatches(result.data);
    } else {
      setError(result.error || 'Failed to fetch batches');
    }
    setLoading(false);
  }, []);

  // Fetch available courses
  const fetchAvailableCourses = useCallback(async () => {
    const result = await batchApi.getAvailableCourses();
    if (result.success && result.data) {
      setAvailableCourses(result.data);
    }
  }, []);

  // Fetch all trainees
  const fetchTrainees = useCallback(async () => {
    const result = await batchApi.getTrainees();
    if (result.success && result.data) {
      setTrainees(result.data);
    }
  }, []);

  // Fetch batch details with trainees
  const fetchBatchDetails = useCallback(async (batchId: string | number) => {
    setLoading(true);
    const result = await batchApi.getBatchWithTrainees(batchId);
    if (result.success && result.data) {
      setSelectedBatch(result.data.batch);
      setAssignedTrainees(result.data.assigned_trainees || []);
      setAvailableTrainees(result.data.available_trainees || []);
    } else {
      setError(result.error || 'Failed to fetch batch details');
    }
    setLoading(false);
  }, []);

  // Create batch
  const createBatch = useCallback(async (batchData: any) => {
    const result = await batchApi.createBatch(batchData);
    if (result.success) {
      await fetchBatches();
      return { success: true, data: result.data };
    }
    return { success: false, errors: result.errors, error: result.error };
  }, [fetchBatches]);

  // Update batch
  const updateBatch = useCallback(async (id: string | number, batchData: any) => {
    const result = await batchApi.updateBatch(id, batchData);
    if (result.success) {
      await fetchBatches();
      if (selectedBatch?.id === id) {
        await fetchBatchDetails(id);
      }
      return { success: true, data: result.data };
    }
    return { success: false, errors: result.errors, error: result.error };
  }, [fetchBatches, fetchBatchDetails, selectedBatch]);

  // Update batch status
  const updateBatchStatus = useCallback(async (id: string | number, status: string) => {
    const result = await batchApi.updateBatchStatus(id, status);
    if (result.success) {
      await fetchBatches();
      if (selectedBatch?.id === id) {
        setSelectedBatch(prev => prev ? { ...prev, status: status as any } : null);
      }
      return { success: true };
    }
    return { success: false, error: result.error };
  }, [fetchBatches, selectedBatch]);

  // Assign trainees
  const assignTrainees = useCallback(async (batchId: string | number, traineeIds: string[]) => {
    const result = await batchApi.assignTrainees(batchId, traineeIds);
    if (result.success && result.data) {
      await fetchBatchDetails(batchId);
      return { success: true, warning: result.warning, data: result.data };
    }
    return { success: false, error: result.error };
  }, [fetchBatchDetails]);

  // Remove trainees
  const removeTrainees = useCallback(async (batchId: string | number, traineeIds: string[]) => {
    const result = await batchApi.removeTrainees(batchId, traineeIds);
    if (result.success) {
      await fetchBatchDetails(batchId);
      return { success: true };
    }
    return { success: false, error: result.error };
  }, [fetchBatchDetails]);

  // Delete batch
  const deleteBatch = useCallback(async (id: string | number) => {
    const result = await batchApi.deleteBatch(id);
    if (result.success) {
      await fetchBatches();
      if (selectedBatch?.id === id) {
        setSelectedBatch(null);
        setAssignedTrainees([]);
        setAvailableTrainees([]);
      }
      return { success: true };
    }
    return { success: false, error: result.error };
  }, [fetchBatches, selectedBatch]);

  // Initial load
  useEffect(() => {
    fetchBatches();
    fetchAvailableCourses();
    fetchTrainees();
  }, [fetchBatches, fetchAvailableCourses, fetchTrainees]);

  return {
    batches,
    trainees,
    availableCourses,
    selectedBatch,
    assignedTrainees,
    availableTrainees,
    loading,
    error,
    fetchBatches,
    fetchBatchDetails,
    createBatch,
    updateBatch,
    updateBatchStatus,
    assignTrainees,
    removeTrainees,
    deleteBatch,
    setSelectedBatch,
  };
};