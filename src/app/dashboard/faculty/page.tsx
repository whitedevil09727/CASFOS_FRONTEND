// app/dashboard/faculty/page.tsx
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BookOpen, Users, CalendarDays, FileText, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/app/Services/api";

const card = "bg-white rounded-2xl border border-gray-100 shadow-[0_2px_20px_rgba(0,0,0,0.04)] overflow-hidden";

export default function FacultyDashboard() {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    const fetchData = async () => {
      try {
        const response = await api.get('/dashboard');
        if (response.data.success) {
          setDashboardData(response.data.dashboard_data);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#163e27]"></div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 pb-16 flex flex-col gap-6 max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-bold text-gray-900 serif-font tracking-tight">
            Faculty Dashboard
          </h1>
          <p className="text-[12px] text-gray-400 font-medium mt-0.5">
            Welcome back, {user?.name || "Faculty"} · Academic Year 2024–25
          </p>
        </div>
        <span className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-bold px-3.5 py-1.5 rounded-full shadow-sm">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
          Faculty Portal
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={cn(card, "p-6")}>
          <h3 className="font-bold text-gray-900 mb-2">My Courses</h3>
          <p className="text-2xl font-bold text-[#163e27]">4</p>
          <p className="text-xs text-gray-500 mt-1">Active courses this semester</p>
        </div>
        <div className={cn(card, "p-6")}>
          <h3 className="font-bold text-gray-900 mb-2">Total Students</h3>
          <p className="text-2xl font-bold text-[#163e27]">148</p>
          <p className="text-xs text-gray-500 mt-1">Across all courses</p>
        </div>
        <div className={cn(card, "p-6")}>
          <h3 className="font-bold text-gray-900 mb-2">Pending Grading</h3>
          <p className="text-2xl font-bold text-amber-600">23</p>
          <p className="text-xs text-gray-500 mt-1">Assignments to review</p>
        </div>
      </div>

      <div className={cn(card, "p-6")}>
        <h3 className="font-bold text-gray-900 mb-4">Today's Schedule</h3>
        <div className="space-y-3">
          {[
            { time: "09:00-11:00", course: "Forest Ecology", room: "Hall A", students: 38 },
            { time: "11:00-13:00", course: "Wildlife Management", room: "Hall B", students: 36 },
            { time: "14:00-16:00", course: "GIS & Remote Sensing", room: "Lab 2", students: 32 },
          ].map((class_, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div>
                <p className="font-semibold text-gray-900">{class_.course}</p>
                <p className="text-xs text-gray-500">{class_.time} · {class_.room}</p>
              </div>
              <span className="text-xs text-gray-500">{class_.students} students</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}