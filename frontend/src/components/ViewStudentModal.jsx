import React from 'react';
import { X, Mail, Phone, Calendar, Award, Building, UserCheck } from 'lucide-react';

export default function ViewStudentModal({ isOpen, onClose, student }) {
  if (!isOpen || !student) return null;

  const gpa = parseFloat(student.gpa) || 0;
  const gpaPercent = Math.min(100, Math.round((gpa / 4.0) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full overflow-hidden transition-all">
        
        {/* Banner */}
        <div className="h-28 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-black/20 text-white hover:bg-black/40 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Profile Card Body */}
        <div className="px-6 pb-6 pt-0 relative">
          
          {/* Avatar */}
          <div className="-mt-12 mb-4 flex items-end justify-between">
            <div className="w-20 h-20 rounded-2xl bg-white dark:bg-slate-900 border-4 border-white dark:border-slate-900 shadow-md flex items-center justify-center text-2xl font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-slate-800">
              {student.first_name?.[0]}{student.last_name?.[0]}
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              {student.status}
            </span>
          </div>

          {/* Name & Roll */}
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              {student.first_name} {student.last_name}
            </h3>
            <p className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-0.5">
              Roll No: {student.roll_number}
            </p>
          </div>

          {/* Academic Performance Meter */}
          <div className="mt-5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-blue-500" /> Cumulative GPA
              </span>
              <span className="font-bold text-base text-slate-900 dark:text-white font-mono">
                {gpa.toFixed(2)} <span className="text-xs text-slate-400 font-normal">/ 4.00</span>
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500"
                style={{ width: `${gpaPercent}%` }}
              />
            </div>
          </div>

          {/* Details Grid */}
          <div className="mt-4 space-y-2.5 text-xs">
            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300">
              <Building className="w-4 h-4 text-slate-400 shrink-0" />
              <div className="flex-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Department</span>
                <span className="font-medium">{student.department}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300">
              <Mail className="w-4 h-4 text-slate-400 shrink-0" />
              <div className="flex-1 truncate">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Email</span>
                <span className="font-medium font-mono">{student.email}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300">
              <Phone className="w-4 h-4 text-slate-400 shrink-0" />
              <div className="flex-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Phone</span>
                <span className="font-medium">{student.phone || 'Not provided'}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300">
              <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
              <div className="flex-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Enrolled On</span>
                <span className="font-medium">
                  {student.enrollment_date 
                    ? (student.enrollment_date.includes('T') ? student.enrollment_date.split('T')[0] : student.enrollment_date)
                    : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Close CTA */}
          <div className="mt-6">
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              Close Profile
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
