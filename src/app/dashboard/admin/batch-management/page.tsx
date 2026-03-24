"use client";

import { useBatches } from '@/hooks/useBatches';
import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Edit2, Archive, Filter, ArrowRight, ArrowLeft,
  Users, AlertTriangle, ShieldCheck, CheckCircle2, ChevronRight,
  BookOpen, Plus, X, Loader2
} from "lucide-react";
import { cn } from "../../../../lib/utils";

// Types
type BatchStatus = "Draft" | "Active" | "Full" | "Archived";
type Gender = "Male" | "Female" | "Other" | "All";
type ServiceType = "IFS" | "SFS" | "Other" | "All";
type EnrollmentStatus = "Enrolled" | "Pending" | "Withdrawn" | "All";

interface BatchType {
  id: string | number;
  code: string;
  name: string;
  course_id?: number;
  course?: {
    id: number;
    name: string;
    code: string;
  };
  capacity: number;
  status: BatchStatus;
  trainee_ids: string[];
  current_count: number;
  fill_percentage: number;
  is_full: boolean;
  start_date?: string;
  end_date?: string;
  lead_instructor?: string;
  description?: string;
}

interface TraineeType {
  id: string | number;
  roll_number: string;
  name: string;
  gender: Gender;
  service_type: ServiceType;
  enrollment_status: EnrollmentStatus;
  email?: string;
  phone?: string;
}

// Badge styling helper
const badgeStyles: Record<BatchStatus, string> = {
  "Draft": "bg-gray-100 text-gray-700 border-gray-200",
  "Active": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Full": "bg-amber-50 text-amber-700 border-amber-200",
  "Archived": "bg-slate-100 text-slate-500 border-slate-200"
};

const serviceStyles: Record<string, string> = {
  "IFS": "bg-blue-50 text-blue-700",
  "SFS": "bg-indigo-50 text-indigo-700",
  "Other": "bg-gray-100 text-gray-700"
};

type TransferDirection = "assign" | "remove";

interface ConfirmModalState {
  open: boolean;
  direction: TransferDirection;
  traineeIds: string[];
  warning?: string;
}

export default function BatchManagementPage() {
  const {
    batches: apiBatches,
    trainees: apiTrainees,
    availableCourses,
    selectedBatch: apiSelectedBatch,
    assignedTrainees: apiAssignedTrainees,
    availableTrainees: apiAvailableTrainees,
    loading,
    error,
    fetchBatchDetails,
    createBatch,
    updateBatchStatus,
    assignTrainees,
    removeTrainees,
    setSelectedBatch,
  } = useBatches();

  // Local state for UI
  const [selectedBatchId, setSelectedBatchId] = useState<string | number | null>(null);
  const [search, setSearch] = useState("");
  const [genderFilter, setGenderFilter] = useState<Gender>("All");
  const [serviceFilter, setServiceFilter] = useState<ServiceType>("All");
  const [statusFilter, setStatusFilter] = useState<EnrollmentStatus>("All");
  const [selectedAvailable, setSelectedAvailable] = useState<Set<string>>(new Set());
  const [selectedAssigned, setSelectedAssigned] = useState<Set<string>>(new Set());
  const [confirmModal, setConfirmModal] = useState<ConfirmModalState | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newBatch, setNewBatch] = useState({
    code: "",
    course_id: "",
    startDate: "",
    endDate: "",
    capacity: 30,
    lead_instructor: "",
    description: ""
  });

  // Update selected batch when API data changes
  useEffect(() => {
    if (selectedBatchId) {
      fetchBatchDetails(selectedBatchId);
    }
  }, [selectedBatchId, fetchBatchDetails]);

  // Reset selections when batch changes
  useEffect(() => {
    setSelectedAvailable(new Set());
    setSelectedAssigned(new Set());
  }, [selectedBatchId]);

  // Get current batch from API
  const currentBatch = apiSelectedBatch as BatchType | null;
  
  // Use the API's assigned and available trainees directly
  const assignedTrainees = apiAssignedTrainees as TraineeType[];
  const allAvailableTrainees = apiAvailableTrainees as TraineeType[];

  // Apply filters to available trainees
  const availableTrainees = useMemo(() => {
    if (!allAvailableTrainees) return [];
    return allAvailableTrainees.filter((t) => {
      if (search && !t.name.toLowerCase().includes(search.toLowerCase()) && 
          !t.roll_number.toLowerCase().includes(search.toLowerCase())) return false;
      if (genderFilter !== "All" && t.gender !== genderFilter) return false;
      if (serviceFilter !== "All" && t.service_type !== serviceFilter) return false;
      if (statusFilter !== "All" && t.enrollment_status !== statusFilter) return false;
      return true;
    });
  }, [allAvailableTrainees, search, genderFilter, serviceFilter, statusFilter]);

  const toggleAvailable = (id: string | number) => {
    const idStr = String(id);
    const next = new Set(selectedAvailable);
    if (next.has(idStr)) next.delete(idStr);
    else next.add(idStr);
    setSelectedAvailable(next);
  };

  const toggleAssigned = (id: string | number) => {
    const idStr = String(id);
    const next = new Set(selectedAssigned);
    if (next.has(idStr)) next.delete(idStr);
    else next.add(idStr);
    setSelectedAssigned(next);
  };

  const selectAllAvailable = () => {
    if (selectedAvailable.size === availableTrainees.length && availableTrainees.length > 0) {
      setSelectedAvailable(new Set());
    } else {
      setSelectedAvailable(new Set(availableTrainees.map((t: TraineeType) => String(t.id))));
    }
  };

  const selectAllAssigned = () => {
    if (selectedAssigned.size === assignedTrainees.length && assignedTrainees.length > 0) {
      setSelectedAssigned(new Set());
    } else {
      setSelectedAssigned(new Set(assignedTrainees.map((t: TraineeType) => String(t.id))));
    }
  };

  const initiateTransfer = (direction: TransferDirection) => {
    if (!currentBatch) return;

    if (direction === "assign") {
      const ids = Array.from(selectedAvailable);
      if (ids.length === 0) return;

      const newTotal = currentBatch.current_count + ids.length;
      let warning;
      if (newTotal > currentBatch.capacity) {
        warning = `Adding ${ids.length} trainees will exceed the batch capacity by ${newTotal - currentBatch.capacity}. Proceed anyway?`;
      }
      setConfirmModal({ open: true, direction, traineeIds: ids, warning });
    } else {
      const ids = Array.from(selectedAssigned);
      if (ids.length === 0) return;
      setConfirmModal({ open: true, direction, traineeIds: ids });
    }
  };

  const executeTransfer = async () => {
    if (!currentBatch || !confirmModal) return;

    const { direction, traineeIds } = confirmModal;
    let result: { success: boolean; warning?: string; error?: string; data?: any };

    if (direction === "assign") {
      result = await assignTrainees(currentBatch.id, traineeIds);
    } else {
      result = await removeTrainees(currentBatch.id, traineeIds);
    }

    if (result.success) {
      setConfirmModal(null);
      setSelectedAvailable(new Set());
      setSelectedAssigned(new Set());
      if (result.warning) {
        alert(result.warning);
      }
    } else {
      alert(result.error || "Transfer failed");
    }
  };

  const handleUpdateStatus = async (id: string | number, newStatus: BatchStatus) => {
    const result = await updateBatchStatus(id, newStatus);
    if (!result.success) {
      alert(result.error || "Failed to update status");
    }
  };

  const handleCreateBatch = async () => {
    if (!newBatch.code || !newBatch.course_id || !newBatch.startDate || !newBatch.endDate) {
      alert("Please fill all required fields");
      return;
    }

    setSaving(true);
    const result = await createBatch({
      code: newBatch.code,
      name: `Batch ${newBatch.code}`,
      course_id: parseInt(newBatch.course_id),
      capacity: newBatch.capacity,
      status: "Draft" as BatchStatus,
      startDate: newBatch.startDate,
      endDate: newBatch.endDate,
      lead_instructor: newBatch.lead_instructor,
      description: newBatch.description,
    });

    if (result.success) {
      setCreateModalOpen(false);
      setNewBatch({
        code: "",
        course_id: "",
        startDate: "",
        endDate: "",
        capacity: 30,
        lead_instructor: "",
        description: ""
      });
    } else if (result.errors) {
      const errorMessages = Object.values(result.errors).flat().join("\n");
      alert(`Validation errors:\n${errorMessages}`);
    } else {
      alert(result.error || "Failed to create batch");
    }
    setSaving(false);
  };

  const handleSelectBatch = (batch: BatchType) => {
    console.log('Selecting batch:', batch);
    setSelectedBatchId(batch.id);
  };

  if (loading && apiBatches.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#163e27] mx-auto mb-4" />
          <p className="text-gray-600">Loading batches...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center max-w-md">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-[#163e27] text-white rounded-lg hover:bg-[#1d4d31]"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-60px)] bg-gray-50 overflow-hidden relative border-t border-gray-200">
      
      {/* LEFT PANEL: Batch List */}
      <div className="w-[320px] shrink-0 bg-white border-r border-gray-200 flex flex-col z-10 shadow-[2px_0_10px_rgba(0,0,0,0.02)]">
        <div className="p-5 border-b border-gray-100 flex flex-col gap-4">
          <div>
            <h2 className="text-[18px] font-extrabold text-[#111827] serif-font tracking-tight">Batches</h2>
            <p className="text-[12px] text-gray-500 font-medium mt-1">Select a batch to manage allocation</p>
          </div>
          <button onClick={() => setCreateModalOpen(true)} className="w-full flex items-center justify-center gap-2 bg-[#163e27] text-white px-4 py-2.5 rounded-xl font-bold text-[13px] hover:bg-[#1d4d31] transition-all shadow-[0_4px_12px_rgba(22,62,39,0.2)] hover:shadow-[0_6px_16px_rgba(22,62,39,0.3)] hover:-translate-y-0.5">
            <Plus className="w-4 h-4" /> Create New Batch
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3 nav-scrollbar bg-gray-50/50">
          {(apiBatches as BatchType[]).map((batch) => {
            const isSelected = selectedBatchId === batch.id;
            const fillPct = batch.fill_percentage || Math.min(100, Math.round((batch.current_count / batch.capacity) * 100));
            const isOver = batch.current_count > batch.capacity;

            return (
              <div
                key={batch.id}
                onClick={() => handleSelectBatch(batch)}
                className={cn(
                  "p-4 rounded-2xl border transition-all cursor-pointer relative group",
                  isSelected 
                    ? "bg-[#163e27] border-[#163e27] shadow-md shadow-[#163e27]/20" 
                    : "bg-white border-gray-200 hover:border-[#163e27]/30 hover:shadow-sm"
                )}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className={cn("text-[14px] font-bold leading-tight", isSelected ? "text-white" : "text-gray-900")}>
                      {batch.name}
                    </h3>
                    <p className={cn("text-[11px] font-mono mt-0.5", isSelected ? "text-[#83e0ab]" : "text-gray-500")}>
                      {batch.code} • {batch.course?.name || "No Course"}
                    </p>
                  </div>
                  <span className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-bold rounded-full border", 
                    isSelected ? "bg-white/10 text-white border-white/20" : badgeStyles[batch.status]
                  )}>
                    {!isSelected && <span className="w-1 h-1 rounded-full currentColor opacity-75 bg-current" />}
                    {batch.status}
                  </span>
                </div>

                <div className="mt-4">
                  <div className="flex justify-between items-center text-[11px] mb-1.5 font-bold">
                    <span className={isSelected ? "text-white/80" : "text-gray-500"}>Capacity</span>
                    <span className={cn(isSelected ? "text-white" : isOver ? "text-red-600" : "text-gray-700")}>
                      {batch.current_count} / {batch.capacity}
                    </span>
                  </div>
                  <div className={cn("h-1.5 rounded-full overflow-hidden", isSelected ? "bg-white/20" : "bg-gray-100")}>
                    <div 
                      className={cn("h-full rounded-full transition-all duration-500", 
                        isSelected ? "bg-[#83e0ab]" : isOver ? "bg-red-500" : "bg-[#163e27]"
                      )}
                      style={{ width: `${fillPct}%` }}
                    />
                  </div>
                </div>

                <div className={cn("absolute right-4 bottom-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity", 
                  isSelected ? "hidden" : "block"
                )}>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleUpdateStatus(batch.id, "Archived"); }} 
                    className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" 
                    title="Archive"
                  >
                    <Archive className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    className="p-1.5 text-gray-400 hover:text-[#163e27] hover:bg-[#f0f8f3] rounded-lg transition-colors" 
                    title="Edit"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT PANEL: Allocation Workspace */}
      <div className="flex-1 flex flex-col bg-white min-w-0">
        {currentBatch ? (
          <>
            {/* Top Bar Workspace Info */}
            <div className="px-6 py-5 border-b border-gray-100 bg-white flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-[20px] font-extrabold text-gray-900 serif-font">Trainee Allocation: {currentBatch.name}</h2>
                <p className="text-[13px] text-gray-500 font-medium mt-1">
                  Manage participants for this batch. Select trainees and move them between available and assigned lists.
                </p>
              </div>
              {currentBatch.current_count >= currentBatch.capacity && currentBatch.status !== "Archived" && (
                <div className="flex items-center gap-2 bg-amber-50 text-amber-800 px-3 py-1.5 rounded-lg border border-amber-200">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-[12px] font-bold">Capacity Full</span>
                </div>
              )}
            </div>

            {/* Filters */}
            <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between shrink-0 gap-4">
              <div className="flex items-center gap-3">
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search available trainees..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-[12px] font-medium focus:outline-none focus:border-[#163e27] focus:ring-1 focus:ring-[#163e27] transition-all shadow-sm"
                  />
                </div>
                <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
                  <Filter className="w-3.5 h-3.5 text-gray-400 ml-2" />
                  <select 
                    value={genderFilter} onChange={e => setGenderFilter(e.target.value as Gender)}
                    className="text-[12px] font-medium bg-transparent border-none focus:ring-0 cursor-pointer pr-6 py-1"
                  >
                    <option value="All">All Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                  <div className="w-px h-4 bg-gray-200" />
                  <select 
                    value={serviceFilter} onChange={e => setServiceFilter(e.target.value as ServiceType)}
                    className="text-[12px] font-medium bg-transparent border-none focus:ring-0 cursor-pointer pr-6 py-1"
                  >
                    <option value="All">All Services</option>
                    <option value="IFS">IFS</option>
                    <option value="SFS">SFS</option>
                    <option value="Other">Other</option>
                  </select>
                  <div className="w-px h-4 bg-gray-200" />
                  <select 
                    value={statusFilter} onChange={e => setStatusFilter(e.target.value as EnrollmentStatus)}
                    className="text-[12px] font-medium bg-transparent border-none focus:ring-0 cursor-pointer pr-6 py-1"
                  >
                    <option value="All">All Status</option>
                    <option value="Enrolled">Enrolled</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Dual List Box Area */}
            <div className="flex-1 flex p-6 gap-6 overflow-hidden min-h-0 bg-[#fbfcfb]">
              
              {/* Left Column: Available */}
              <div className="flex-1 flex flex-col bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden min-w-0">
                <div className="px-5 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="text-[13px] font-bold text-gray-800">Available Trainees</h3>
                    <span className="bg-gray-200 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded-full">{availableTrainees.length}</span>
                  </div>
                  <button 
                    onClick={selectAllAvailable}
                    className="text-[11px] font-bold text-[#163e27] hover:underline"
                  >
                    {selectedAvailable.size === availableTrainees.length && availableTrainees.length > 0 ? "Deselect All" : "Select All"}
                  </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-2">
                  {availableTrainees.map((t: TraineeType) => (
                    <div 
                      key={t.id}
                      onClick={() => toggleAvailable(t.id)}
                      className={cn("flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors border",
                        selectedAvailable.has(String(t.id)) ? "bg-[#f0f8f3] border-[#83e0ab]" : "border-transparent"
                      )}
                    >
                      <input 
                        type="checkbox" 
                        checked={selectedAvailable.has(String(t.id))} 
                        onChange={() => {}}
                        className="w-4 h-4 rounded text-[#163e27] focus:ring-[#163e27] border-gray-300" 
                      />
                      <div className="flex-1 min-w-0 flex items-center justify-between">
                        <div>
                          <p className="text-[13px] font-bold text-gray-900 truncate">{t.name}</p>
                          <p className="text-[11px] text-gray-500 font-mono mt-0.5">{t.roll_number}</p>
                        </div>
                        <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-md", serviceStyles[t.service_type])}>
                          {t.service_type}
                        </span>
                      </div>
                    </div>
                  ))}
                  {availableTrainees.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 p-6 text-center">
                      <Users className="w-8 h-8 mb-2 opacity-50" />
                      <p className="text-[13px] font-medium">No trainees match the current filters.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Center Controls */}
              <div className="flex flex-col items-center justify-center gap-4 shrink-0 px-2">
                <button
                  onClick={() => initiateTransfer("assign")}
                  disabled={selectedAvailable.size === 0}
                  className={cn("flex items-center justify-center w-12 h-12 rounded-full transition-all shadow-sm",
                    selectedAvailable.size > 0 
                      ? "bg-[#163e27] text-white hover:bg-[#1d4d31] hover:shadow-md hover:scale-105" 
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  )}
                  title="Assign to Batch"
                >
                  <ArrowRight className="w-5 h-5" />
                </button>
                <div className="text-[11px] font-bold text-gray-400">
                  {selectedAvailable.size > 0 && `${selectedAvailable.size} sel` }
                </div>
                <button
                  onClick={() => initiateTransfer("remove")}
                  disabled={selectedAssigned.size === 0}
                  className={cn("flex items-center justify-center w-12 h-12 rounded-full transition-all shadow-sm",
                    selectedAssigned.size > 0 
                      ? "bg-white border-2 border-rose-200 text-rose-500 hover:bg-rose-50 hover:border-rose-300 hover:scale-105" 
                      : "bg-gray-100 text-gray-400 border-2 border-transparent cursor-not-allowed"
                  )}
                  title="Remove from Batch"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              </div>

              {/* Right Column: Assigned */}
              <div className="flex-1 flex flex-col bg-white border border-[#83e0ab] rounded-2xl shadow-sm overflow-hidden min-w-0 ring-1 ring-[#163e27]/5">
                <div className="px-5 py-4 border-b border-[#e2efe8] bg-[#f0f8f3] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="text-[13px] font-bold text-[#163e27]">Assigned to Batch</h3>
                    <span className="bg-[#163e27] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{assignedTrainees.length}</span>
                  </div>
                  <button 
                    onClick={selectAllAssigned}
                    className="text-[11px] font-bold text-[#163e27] hover:underline"
                  >
                    {selectedAssigned.size === assignedTrainees.length && assignedTrainees.length > 0 ? "Deselect All" : "Select All"}
                  </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-2">
                  {assignedTrainees.map((t: TraineeType) => (
                    <div 
                      key={t.id}
                      onClick={() => toggleAssigned(t.id)}
                      className={cn("flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-rose-50/50 transition-colors border",
                        selectedAssigned.has(String(t.id)) ? "bg-rose-50 border-rose-200" : "border-transparent"
                      )}
                    >
                      <input 
                        type="checkbox" 
                        checked={selectedAssigned.has(String(t.id))} 
                        onChange={() => {}}
                        className="w-4 h-4 rounded text-rose-500 focus:ring-rose-500 border-gray-300" 
                      />
                      <div className="flex-1 min-w-0 flex items-center justify-between">
                        <div>
                          <p className="text-[13px] font-bold text-gray-900 truncate">{t.name}</p>
                          <p className="text-[11px] text-gray-500 font-mono mt-0.5">{t.roll_number}</p>
                        </div>
                        <ShieldCheck className="w-4 h-4 text-[#83e0ab]" />
                      </div>
                    </div>
                  ))}
                  {assignedTrainees.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 p-6 text-center">
                      <BookOpen className="w-8 h-8 mb-2 opacity-30 text-[#163e27]" />
                      <p className="text-[13px] font-medium">No trainees assigned yet.<br/>Select from the left to assign.</p>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
            <Users className="w-16 h-16 text-gray-200 mb-4" />
            <h3 className="text-lg font-bold text-gray-600">No Batch Selected</h3>
            <p className="text-[14px]">Choose a batch from the left panel to manage its trainees.</p>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {confirmModal && (
          <div className="fixed inset-0 z-[200] grid place-items-center p-4">
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
              className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" 
              onClick={() => setConfirmModal(null)} 
            />
            <motion.div initial={{scale:0.95, y:15, opacity:0}} animate={{scale:1, y:0, opacity:1}} exit={{scale:0.95, y:15, opacity:0}}
              className="bg-white rounded-2xl shadow-2xl z-10 w-full max-w-sm overflow-hidden"
            >
              <div className={cn("px-6 py-4 flex items-center gap-3", confirmModal.direction === "assign" ? (confirmModal.warning ? "bg-amber-50" : "bg-[#f0f8f3]") : "bg-rose-50")}>
                {confirmModal.warning ? <AlertTriangle className="w-5 h-5 text-amber-600" /> : confirmModal.direction === "assign" ? <CheckCircle2 className="w-5 h-5 text-[#163e27]" /> : <AlertTriangle className="w-5 h-5 text-rose-600" />}
                <h3 className={cn("text-[15px] font-bold", confirmModal.direction === "assign" ? (confirmModal.warning ? "text-amber-900" : "text-[#163e27]") : "text-rose-900")}>
                  {confirmModal.direction === "assign" ? "Confirm Assignment" : "Confirm Removal"}
                </h3>
              </div>
              <div className="p-6">
                <p className="text-[13px] text-gray-600 leading-relaxed mb-4">
                  Are you sure you want to {confirmModal.direction === "assign" ? "assign" : "remove"} <strong className="text-gray-900">{confirmModal.traineeIds.length}</strong> selected trainees {confirmModal.direction === "assign" ? "to" : "from"} <strong className="text-gray-900">{currentBatch?.name}</strong>?
                </p>
                {confirmModal.warning && (
                  <div className="bg-amber-100/50 border border-amber-200 rounded-lg p-3 text-[12px] text-amber-800 font-medium leading-relaxed">
                    <strong>Warning:</strong> {confirmModal.warning}
                  </div>
                )}
                <div className="mt-6 flex items-center justify-end gap-3">
                  <button onClick={() => setConfirmModal(null)} className="px-4 py-2 rounded-lg text-gray-600 text-[13px] font-bold hover:bg-gray-100 transition-colors">
                    Cancel
                  </button>
                  <button 
                    onClick={executeTransfer} 
                    className={cn("px-5 py-2 rounded-lg text-[13px] font-bold text-white transition-colors shadow-sm",
                      confirmModal.direction === "assign" ? "bg-[#163e27] hover:bg-[#1d4d31]" : "bg-rose-600 hover:bg-rose-700"
                    )}
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Create Batch Modal */}
      <AnimatePresence>
        {createModalOpen && (
          <div className="fixed inset-0 z-[200] grid place-items-center p-4">
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
              className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" 
              onClick={() => setCreateModalOpen(false)} 
            />
            <motion.div initial={{scale:0.96, y:15, opacity:0}} animate={{scale:1, y:0, opacity:1}} exit={{scale:0.96, y:15, opacity:0}}
              className="bg-white rounded-2xl shadow-2xl z-10 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between shrink-0 bg-white">
                <div>
                  <h2 className="text-[20px] font-bold text-[#1f2937] serif-font tracking-tight">Create New Batch</h2>
                  <p className="text-[13px] text-[#6b7280] font-medium mt-1">Define batch parameters for the selected training course.</p>
                </div>
                <button onClick={() => setCreateModalOpen(false)} className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-8 overflow-y-auto min-h-0 bg-[#fbfcfb] flex-1">
                <div className="grid grid-cols-2 gap-x-6 gap-y-7">
                  <div>
                    <label className="text-[13px] font-bold text-gray-800 mb-2 block">Batch Code <span className="text-rose-500">*</span></label>
                    <input type="text" placeholder="e.g., IFS-2026-A" value={newBatch.code} onChange={e => setNewBatch(prev => ({ ...prev, code: e.target.value }))} className="w-full px-4 py-3 bg-[#f8fafc] border-2 border-[#163e27]/20 rounded-xl text-[14px] font-medium text-gray-900 focus:outline-none focus:border-[#163e27] focus:ring-1 focus:ring-[#163e27] transition-all" />
                  </div>

                  <div>
                    <label className="text-[13px] font-bold text-gray-800 mb-2 block">Course <span className="text-rose-500">*</span></label>
                    <div className="relative">
                      <select value={newBatch.course_id} onChange={e => setNewBatch(prev => ({ ...prev, course_id: e.target.value }))} className="w-full appearance-none px-4 py-3 bg-white border border-gray-200 rounded-xl text-[14px] font-medium text-gray-700 focus:outline-none focus:border-[#163e27] focus:ring-1 focus:ring-[#163e27] transition-all pr-10">
                        <option value="">Select course</option>
                        {availableCourses.map((course: any) => (
                          <option key={course.id} value={course.id}>{course.name} ({course.code})</option>
                        ))}
                      </select>
                      <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none rotate-90" />
                    </div>
                  </div>

                  <div>
                    <label className="text-[13px] font-bold text-gray-800 mb-2 block">Start Date <span className="text-rose-500">*</span></label>
                    <input type="date" value={newBatch.startDate} onChange={e => setNewBatch(prev => ({ ...prev, startDate: e.target.value }))} className="w-full px-4 py-3 bg-[#f8fafc] border border-gray-200 rounded-xl text-[14px] font-medium text-gray-700 focus:outline-none focus:border-[#163e27] transition-all" />
                  </div>

                  <div>
                    <label className="text-[13px] font-bold text-gray-800 mb-2 block">End Date <span className="text-rose-500">*</span></label>
                    <input type="date" value={newBatch.endDate} onChange={e => setNewBatch(prev => ({ ...prev, endDate: e.target.value }))} className="w-full px-4 py-3 bg-[#f8fafc] border border-gray-200 rounded-xl text-[14px] font-medium text-gray-700 focus:outline-none focus:border-[#163e27] transition-all" />
                  </div>

                  <div>
                    <label className="text-[13px] font-bold text-gray-800 mb-2 block">Max Capacity <span className="text-rose-500">*</span></label>
                    <input type="number" placeholder="e.g., 30" value={newBatch.capacity} onChange={e => setNewBatch(prev => ({ ...prev, capacity: parseInt(e.target.value) }))} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-[14px] font-medium text-gray-700 focus:outline-none focus:border-[#163e27] transition-all" />
                  </div>

                  <div>
                    <label className="text-[13px] font-bold text-gray-800 mb-2 block">Lead Instructor</label>
                    <input type="text" placeholder="e.g., Col. A. Sharma" value={newBatch.lead_instructor} onChange={e => setNewBatch(prev => ({ ...prev, lead_instructor: e.target.value }))} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-[14px] font-medium text-gray-700 focus:outline-none focus:border-[#163e27] transition-all" />
                  </div>

                  <div className="col-span-2">
                    <label className="text-[13px] font-bold text-gray-800 mb-2 block">Description</label>
                    <textarea rows={3} placeholder="Additional details about this batch..." value={newBatch.description} onChange={e => setNewBatch(prev => ({ ...prev, description: e.target.value }))} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-[14px] font-medium text-gray-700 focus:outline-none focus:border-[#163e27] transition-all resize-none" />
                  </div>
                </div>
              </div>

              <div className="shrink-0 bg-white border-t border-gray-100 px-8 py-5 flex items-center justify-end gap-4">
                <button onClick={() => setCreateModalOpen(false)} className="px-6 py-2.5 rounded-xl border border-gray-200 text-[#4b5563] font-bold text-[14px] hover:bg-gray-50 transition-colors">Cancel</button>
                <button onClick={handleCreateBatch} disabled={saving} className="px-6 py-2.5 rounded-xl text-[14px] font-bold text-white transition-all shadow-sm bg-[#163e27] hover:bg-[#1d4d31] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {saving ? "Creating..." : "Create Batch"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}