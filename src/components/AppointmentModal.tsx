// components/AppointmentModal.tsx
"use client";

import { useState, useEffect } from "react";
import { X, Crown, Calendar, User, Mail, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Faculty {
  id: number;
  name: string;
  email: string;
  username: string;
}

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAppoint: (userId: number, termStart: string, termEnd: string) => void;
  facultyList: Faculty[];
  currentDirector: any;
  loading: boolean;
}

export default function AppointmentModal({
  isOpen,
  onClose,
  onAppoint,
  facultyList,
  currentDirector,
  loading,
}: AppointmentModalProps) {
  const [selectedFaculty, setSelectedFaculty] = useState<string>("");
  const [termStart, setTermStart] = useState("");
  const [termEnd, setTermEnd] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setSelectedFaculty("");
      setTermStart("");
      setTermEnd("");
      setError("");
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFaculty) {
      setError("Please select a faculty member");
      return;
    }
    
    if (!termStart) {
      setError("Please select term start date");
      return;
    }
    
    if (!termEnd) {
      setError("Please select term end date");
      return;
    }
    
    if (new Date(termEnd) <= new Date(termStart)) {
      setError("Term end date must be after start date");
      return;
    }
    
    onAppoint(parseInt(selectedFaculty), termStart, termEnd);
  };

  if (!isOpen) return null;

  const selectedFacultyData = facultyList.find(f => f.id.toString() === selectedFaculty);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-amber-50 to-emerald-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
              <Crown className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Appoint Course Director</h2>
              <p className="text-xs text-gray-500">Select a faculty member for the position</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Current Director Info */}
          {currentDirector && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
              <p className="text-xs font-semibold text-blue-600 mb-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Current Course Director
              </p>
              <p className="text-sm font-bold text-gray-900">{currentDirector.name}</p>
              <p className="text-xs text-gray-500">{currentDirector.email}</p>
              <p className="text-xs text-gray-500 mt-1">
                Appointed: {new Date(currentDirector.appointed_at).toLocaleDateString()}
              </p>
            </div>
          )}

          {/* Faculty Selection */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">
              Select Faculty Member
            </label>
            <select
              value={selectedFaculty}
              onChange={(e) => setSelectedFaculty(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#163e27]/20 focus:border-[#163e27]"
            >
              <option value="">Choose a faculty member...</option>
              {facultyList.map((faculty) => (
                <option key={faculty.id} value={faculty.id}>
                  {faculty.name} ({faculty.email})
                </option>
              ))}
            </select>
          </div>

          {/* Selected Faculty Info */}
          {selectedFacultyData && (
            <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">{selectedFacultyData.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-500" />
                <span className="text-xs text-gray-500">{selectedFacultyData.email}</span>
              </div>
            </div>
          )}

          {/* Term Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">
                Term Start
              </label>
              <input
                type="date"
                value={termStart}
                onChange={(e) => setTermStart(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#163e27]/20 focus:border-[#163e27]"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">
                Term End
              </label>
              <input
                type="date"
                value={termEnd}
                onChange={(e) => setTermEnd(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#163e27]/20 focus:border-[#163e27]"
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3">
              <p className="text-xs text-red-600">{error}</p>
            </div>
          )}

          {/* Warning about current director */}
          {currentDirector && selectedFaculty && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
              <p className="text-xs text-amber-700 flex items-start gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>
                  Appointing a new Course Director will automatically demote the current one.
                  This action cannot be undone.
                </span>
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={cn(
                "flex-1 px-4 py-2.5 rounded-xl bg-[#163e27] text-white font-bold text-sm hover:bg-[#1d4d31] transition-all shadow-md",
                loading && "opacity-50 cursor-not-allowed"
              )}
            >
              {loading ? "Appointing..." : "Appoint as Course Director"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}