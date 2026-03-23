"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  MapPin, UserCheck,
  Wallet,
  ClipboardCheck,
  BarChart2, MessageSquare,
  Heart, FileText,
  Settings, LogOut, ChevronDown,
  TreePine, LucideIcon, Crown, Award
} from "lucide-react";

// ─── Types matching Laravel backend roles ────────────────────────────────────
// These match exactly with your Laravel User model roles
type UserRole = "admin" | "faculty" | "trainee";

type NavChild = { label: string; href: string; allowedRoles?: UserRole[] };
type NavLeaf = { label: string; icon: LucideIcon; href: string; allowedRoles?: UserRole[] };
type NavGroup = { label: string; icon: LucideIcon; children: NavChild[]; allowedRoles?: UserRole[] };
type NavItem = NavLeaf | NavGroup;
type NavSection = { section: string; items: NavItem[] };
type BottomNavItem = { label: string; icon: LucideIcon; href: string; danger?: boolean; allowedRoles?: UserRole[] };

function hasChildren(item: NavItem): item is NavGroup {
  return "children" in item;
}

// ─── Role-Based Navigation - Matches Laravel Backend ─────────────────────────
// Base path for each role: /dashboard/[role]/
const NAV:NavSection[] = [
  {
    section: "Main",
    items: [
      { 
        label: "Dashboard", 
        icon: LayoutDashboard, 
        href: "/dashboard/admin", 
        allowedRoles: ["admin"] 
      },
      { 
        label: "Dashboard", 
        icon: LayoutDashboard, 
        href: "/dashboard/faculty", 
        allowedRoles: ["faculty"] 
      },
      { 
        label: "Dashboard", 
        icon: LayoutDashboard, 
        href: "/dashboard/trainee", 
        allowedRoles: ["trainee"] 
      },
    ],
  },
  {
    section: "Course Administration",
    items: [
      {
        label: "Course Administration",
        icon: BookOpen,
        allowedRoles: ["admin", "faculty"],
        children: [
          { 
            label: "Course Management",  
            href: "/dashboard/admin/courses", 
            allowedRoles: ["admin"] 
          },
          { 
            label: "Course Management",  
            href: "/dashboard/faculty/courses", 
            allowedRoles: ["faculty"] 
          },
          { 
            label: "Batch Management",   
            href: "/dashboard/admin/batch-management", 
            allowedRoles: ["admin"] 
          },
          { 
            label: "Academic Planning",  
            href: "/dashboard/admin/academic-planning", 
            allowedRoles: ["admin"] 
          },
          { 
            label: "Academic Planning",  
            href: "/dashboard/faculty/academic-planning", 
            allowedRoles: ["faculty"] 
          },
        ],
      },
    ],
  },
  {
    section: "Tours & Field Exercises",
    items: [
      {
        label: "Tours & Field Exercises",
        icon: MapPin,
        allowedRoles: ["admin", "faculty", "trainee"],
        children: [
          { 
            label: "Tour Planning",                
            href: "/dashboard/admin/tour-planning", 
            allowedRoles: ["admin"] 
          },
          { 
            label: "Tour Planning",                
            href: "/dashboard/faculty/tour-planning", 
            allowedRoles: ["faculty"] 
          },
          { 
            label: "My Tours",                
            href: "/dashboard/trainee/my-tours", 
            allowedRoles: ["trainee"] 
          },
          { 
            label: "Faculty & Leadership Assign.",  
            href: "/dashboard/admin/tour-leadership", 
            allowedRoles: ["admin"] 
          },
          { 
            label: "Faculty & Leadership Assign.",  
            href: "/dashboard/faculty/tour-leadership", 
            allowedRoles: ["faculty"] 
          },
          { 
            label: "Tour Monitoring",              
            href: "/dashboard/admin/tour-monitoring", 
            allowedRoles: ["admin"] 
          },
          { 
            label: "Tour Monitoring",              
            href: "/dashboard/faculty/tour-monitoring", 
            allowedRoles: ["faculty"] 
          },
        ],
      },
    ],
  },
  {
    section: "Academic Monitoring",
    items: [
      {
        label: "Academic Monitoring",
        icon: ClipboardCheck,
        allowedRoles: ["admin", "faculty", "trainee"],
        children: [
          { 
            label: "Attendance Monitoring",  
            href: "/dashboard/admin/attendance", 
            allowedRoles: ["admin"] 
          },
          { 
            label: "Attendance Monitoring",  
            href: "/dashboard/faculty/attendance", 
            allowedRoles: ["faculty"] 
          },
          { 
            label: "My Attendance",  
            href: "/dashboard/trainee/my-attendance", 
            allowedRoles: ["trainee"] 
          },
          { 
            label: "Trainee Performance",    
            href: "/dashboard/admin/trainee-performance", 
            allowedRoles: ["admin"] 
          },
          { 
            label: "Trainee Performance",    
            href: "/dashboard/faculty/trainee-performance", 
            allowedRoles: ["faculty"] 
          },
          { 
            label: "My Progress",    
            href: "/dashboard/trainee/my-progress", 
            allowedRoles: ["trainee"] 
          },
        ],
      },
    ],
  },
  {
    section: "Trainee Support",
    items: [
      {
        label: "Trainee Support",
        icon: Heart,
        allowedRoles: ["admin", "faculty", "trainee"],
        children: [
          { 
            label: "Counsellor & Mentor Mgmt", 
            href: "/dashboard/admin/counsellor-mentor", 
            allowedRoles: ["admin"] 
          },
          { 
            label: "Counsellor & Mentor Mgmt", 
            href: "/dashboard/faculty/counsellor-mentor", 
            allowedRoles: ["faculty"] 
          },
          { 
            label: "My Mentor", 
            href: "/dashboard/trainee/my-mentor", 
            allowedRoles: ["trainee"] 
          },
          { 
            label: "Memo Management",          
            href: "/dashboard/admin/memos", 
            allowedRoles: ["admin"] 
          },
          { 
            label: "Memo Management",          
            href: "/dashboard/faculty/memos", 
            allowedRoles: ["faculty"] 
          },
          { 
            label: "My Memos",          
            href: "/dashboard/trainee/my-memos", 
            allowedRoles: ["trainee"] 
          },
        ],
      },
    ],
  },
  {
    section: "Assignments",
    items: [
      {
        label: "Assignments",
        icon: FileText,
        allowedRoles: ["admin", "faculty", "trainee"],
        children: [
          { 
            label: "Create Assignments", 
            href: "/dashboard/admin/create-assignments", 
            allowedRoles: ["admin"] 
          },
          { 
            label: "Create Assignments", 
            href: "/dashboard/faculty/create-assignments", 
            allowedRoles: ["faculty"] 
          },
          { 
            label: "My Assignments", 
            href: "/dashboard/trainee/my-assignments", 
            allowedRoles: ["trainee"] 
          },
          { 
            label: "Grade Submissions", 
            href: "/dashboard/admin/grade-submissions", 
            allowedRoles: ["admin"] 
          },
          { 
            label: "Grade Submissions", 
            href: "/dashboard/faculty/grade-submissions", 
            allowedRoles: ["faculty"] 
          },
        ],
      },
    ],
  },
  {
    section: "Training Fund Management",
    items: [
      {
        label: "Training Fund Management",
        icon: Wallet,
        allowedRoles: ["admin"],
        children: [
          { label: "Fund Overview",      href: "/dashboard/admin/fund-overview" },
          { label: "Fund Transactions",  href: "/dashboard/admin/fund-transactions" },
          { label: "Expense Monitoring", href: "/dashboard/admin/expense-monitoring" },
          { label: "Financial Insights", href: "/dashboard/admin/financial-insights" },
        ],
      },
    ],
  },
  {
    section: "Faculty Management",
    items: [
      {
        label: "Faculty Management",
        icon: UserCheck,
        allowedRoles: ["admin"],
        children: [
          { label: "Assignment Tracking",    href: "/dashboard/admin/faculty-assignment" },
          { label: "Expense Tracking",       href: "/dashboard/admin/faculty-expenses" },
          { label: "Performance Review",     href: "/dashboard/admin/faculty-performance" },
        ],
      },
    ],
  },
  {
    section: "Feedback & Evaluation",
    items: [
      {
        label: "Feedback",
        icon: MessageSquare,
        allowedRoles: ["admin", "faculty", "trainee"],
        children: [
          { 
            label: "Submit Feedback",    
            href: "/dashboard/trainee/submit-feedback", 
            allowedRoles: ["trainee"] 
          },
          { 
            label: "Feedback Review",    
            href: "/dashboard/admin/feedback-review", 
            allowedRoles: ["admin"] 
          },
          { 
            label: "Feedback Review",    
            href: "/dashboard/faculty/feedback-review", 
            allowedRoles: ["faculty"] 
          },
          { 
            label: "Analytics & Reports", 
            href: "/dashboard/admin/analytics", 
            allowedRoles: ["admin"] 
          },
        ],
      },
    ],
  },
  {
    section: "Certificates",
    items: [
      {
        label: "Certificates",
        icon: Award,
        allowedRoles: ["trainee"],
        children: [
          { label: "My Certificates", href: "/dashboard/trainee/my-certificates" },
        ],
      },
    ],
  },
  {
    section: "Reports",
    items: [
      {
        label: "Reports",
        icon: BarChart2,
        allowedRoles: ["admin"],
        children: [
          { label: "Course Completion Reports", href: "/dashboard/admin/completion-reports" },
          { label: "Attendance Reports", href: "/dashboard/admin/attendance-reports" },
          { label: "Financial Reports", href: "/dashboard/admin/financial-reports" },
        ],
      },
    ],
  },
];

const BOTTOM_NAV: BottomNavItem[] = [
  { 
    label: "Settings", 
    icon: Settings, 
    href: "#", 
    allowedRoles: ["admin", "faculty", "trainee"] 
  },
  { 
    label: "Log out",  
    icon: LogOut,   
    href: "/login", 
    danger: true, 
    allowedRoles: ["admin", "faculty", "trainee"] 
  },
];

// ─── Helper to filter items by role ──────────────────────────────────────────
function filterNavItemsByRole<T extends { allowedRoles?: UserRole[] }>(
  items: T[],
  userRole: UserRole | null
): T[] {
  if (!userRole) return [];
  return items.filter(item => {
    if (!item.allowedRoles) return true;
    return item.allowedRoles.includes(userRole);
  });
}

// ─── Helper to get role display name ──────────────────────────────────────────
function getRoleDisplayName(role: UserRole): string {
  switch(role) {
    case "admin":
      return "Admin";
    case "faculty":
      return "Faculty";
    case "trainee":
      return "Trainee";
    default:
      return role;
  }
}

// ─── Component ──────────────────────────────────────────────────────────────
export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; email: string; role: UserRole } | null>(null);
  const [open, setOpen] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const toggle = (label: string) =>
    setOpen(prev => ({ ...prev, [label]: !prev[label] }));

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      await fetch("http://127.0.0.1:8000/api/logout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      router.push("/login");
    }
  };

  if (!user) {
    return (
      <aside className="w-[240px] h-full bg-[#163e27] flex flex-col shrink-0 overflow-y-auto">
        <div className="h-[60px] px-5 flex items-center gap-3 shrink-0 border-b border-[#1d4d31]">
          <div className="w-7 h-7 flex items-center justify-center bg-[#215738] rounded-md shadow-sm text-[#7fd6a3]">
            <TreePine className="w-4 h-4" />
          </div>
          <h1 className="text-lg font-bold tracking-wider text-white serif-font mt-0.5">CASFOS</h1>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      </aside>
    );
  }

  // Filter navigation based on user role
  const filteredNav = NAV.map(section => ({
    ...section,
    items: filterNavItemsByRole(section.items, user.role),
  })).filter(section => section.items.length > 0);

  const filteredBottomNav = filterNavItemsByRole(BOTTOM_NAV, user.role);
  const isAdmin = user.role === "admin";

  return (
    <aside className="w-[240px] h-full bg-[#163e27] flex flex-col shrink-0 overflow-y-auto sidebar-scrollbar border-r border-[#10301d] z-20 shadow-xl">

      {/* Logo */}
      <div className="h-[60px] px-5 flex items-center gap-3 shrink-0 border-b border-[#1d4d31]">
        <div className="w-7 h-7 flex items-center justify-center bg-[#215738] rounded-md shadow-sm text-[#7fd6a3]">
          <TreePine className="w-4 h-4" />
        </div>
        <h1 className="text-lg font-bold tracking-wider text-white serif-font mt-0.5">CASFOS</h1>
        {isAdmin && (
          <span className="ml-auto text-[10px] font-bold text-amber-300 bg-[#1d4d31] px-1.5 py-0.5 rounded-full uppercase flex items-center gap-0.5">
            <Crown className="w-3 h-3" />
            Admin
          </span>
        )}
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-[#1d4d31]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#276641] flex items-center justify-center text-white font-bold text-sm shrink-0">
            {user.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{user.name}</p>
            <p className="text-xs text-[#8aa393] truncate">{user.email}</p>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-[9px] font-bold text-[#83e0ab] bg-[#1d4d31] px-1.5 py-0.5 rounded-full uppercase">
                {getRoleDisplayName(user.role)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 py-4 px-3 flex flex-col gap-1 overflow-y-auto sidebar-scrollbar">

        {filteredNav.map(group => (
          <div key={group.section} className="mb-1">
            {group.items.map((item: NavItem) => {
              // ── Flat link (no children) ──
              if (!hasChildren(item)) {
                const href = (item as NavLeaf).href;
                const active = pathname === href;
                // Only show if href matches user's role path
                if (!href.includes(user.role)) return null;
                return (
                  <Link key={item.label} href={href}
                    className={`relative flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all duration-150 group
                      ${active
                        ? "bg-[#225838] text-white"
                        : "text-[#a2b7a9] hover:bg-[#1d4d31] hover:text-white"}`}>
                    {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-[#83e0ab] rounded-r-md" />}
                    <item.icon className="w-4 h-4 shrink-0" />
                    <span className="text-[13px] font-semibold">{item.label}</span>
                  </Link>
                );
              }

              // ── Collapsible group ──
              const isOpen = open[item.label] ?? false;
              const anyChildActive = item.children.some((c: NavChild) => pathname === c.href);

              // Filter children by role and ensure they match user's role path
              const filteredChildren = filterNavItemsByRole(item.children, user.role)
                .filter(child => child.href.includes(user.role));
              
              if (filteredChildren.length === 0) return null;

              return (
                <div key={item.label}>
                  <button
                    onClick={() => toggle(item.label)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all duration-150 group
                      ${anyChildActive || isOpen
                        ? "bg-[#1d4d31] text-white"
                        : "text-[#a2b7a9] hover:bg-[#1d4d31] hover:text-white"}`}>
                    <item.icon className="w-4 h-4 shrink-0" />
                    <span className="text-[13px] font-semibold flex-1 text-left leading-tight">{item.label}</span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {isOpen && (
                    <div className="mt-0.5 ml-3 pl-3 border-l border-[#2a6042] flex flex-col gap-0.5 py-1">
                      {filteredChildren.map((child: NavChild) => {
                        const childActive = pathname === child.href;
                        return (
                          <Link key={child.label} href={child.href}
                            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[12px] font-medium transition-all duration-150
                              ${childActive
                                ? "bg-[#225838] text-white"
                                : "text-[#8fb8a0] hover:bg-[#1d4d31] hover:text-white"}`}>
                            <span className="w-1 h-1 rounded-full bg-current opacity-50 shrink-0" />
                            {child.label}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}

        {/* Bottom Navigation */}
        {filteredBottomNav.length > 0 && (
          <div className="mt-4 pt-4 border-t border-[#1d4d31] flex flex-col gap-0.5">
            {filteredBottomNav.map((item: BottomNavItem) => (
              item.label === "Log out" ? (
                <button
                  key={item.label}
                  onClick={handleLogout}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all duration-150 w-full text-left
                    ${item.danger
                      ? "text-red-400 hover:bg-red-500/10 hover:text-red-300"
                      : "text-[#a2b7a9] hover:bg-[#1d4d31] hover:text-white"}`}>
                  <item.icon className="w-4 h-4 shrink-0" />
                  <span className="text-[13px] font-semibold">{item.label}</span>
                </button>
              ) : (
                <Link key={item.label} href={item.href}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all duration-150
                    ${item.danger
                      ? "text-red-400 hover:bg-red-500/10 hover:text-red-300"
                      : "text-[#a2b7a9] hover:bg-[#1d4d31] hover:text-white"}`}>
                  <item.icon className="w-4 h-4 shrink-0" />
                  <span className="text-[13px] font-semibold">{item.label}</span>
                </Link>
              )
            ))}
          </div>
        )}

      </div>
    </aside>
  );
}
