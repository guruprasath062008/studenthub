import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserCheck, 
  Building, 
  Award, 
  Plus, 
  Database, 
  Server, 
  ShieldCheck, 
  Layers, 
  ExternalLink,
  RefreshCw,
  Terminal
} from 'lucide-react';
import StatCard from '../components/StatCard';
import StudentTable from '../components/StudentTable';
import StudentModal from '../components/StudentModal';
import ViewStudentModal from '../components/ViewStudentModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import Toast from '../components/Toast';
import { useAuth, STUDENT_BASE } from '../context/AuthContext';

export default function Dashboard({ activeTab, setActiveTab, onOpenAuth }) {
  const { user, authFetch } = useAuth();

  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeStudents: 0,
    inactiveStudents: 0,
    graduatedStudents: 0,
    suspendedStudents: 0,
    averageGpa: '0.00',
    totalDepartments: 0,
    departmentDistribution: {}
  });
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('id');
  const [sortOrder, setSortOrder] = useState('DESC');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [viewingStudent, setViewingStudent] = useState(null);
  const [deletingStudent, setDeletingStudent] = useState(null);

  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const showToast = (message, type = 'success') => setToast({ show: true, message, type });

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (departmentFilter && departmentFilter !== 'All') params.append('department', departmentFilter);
      if (statusFilter && statusFilter !== 'All') params.append('status', statusFilter);
      if (sortBy) params.append('sortBy', sortBy);
      if (sortOrder) params.append('sortOrder', sortOrder);

      const res = await fetch(`${STUDENT_BASE}/api/students?${params.toString()}`);
      const data = await res.json();
      if (data.success) setStudents(data.data || []);
    } catch (err) {
      console.error('[Dashboard] Error fetching students:', err);
      showToast('Unable to connect to Student API Service.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      const res = await fetch(`${STUDENT_BASE}/api/students/stats`);
      const data = await res.json();
      if (data.success && data.stats) setStats(data.stats);
    } catch (err) {
      console.error('[Dashboard] Error fetching stats:', err);
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => { fetchStudents(); }, [search, departmentFilter, statusFilter, sortBy, sortOrder]);
  useEffect(() => { fetchStats(); }, []);

  const refreshAll = () => {
    fetchStudents();
    fetchStats();
    showToast('Dashboard data refreshed.');
  };

  const handleSaveStudent = async (formData, studentId) => {
    if (!user) {
      onOpenAuth();
      return { error: 'Please sign in to add or update student records.' };
    }
    try {
      const isEdit = !!studentId;
      const url = isEdit
        ? `${STUDENT_BASE}/api/students/${studentId}`
        : `${STUDENT_BASE}/api/students`;
      const method = isEdit ? 'PUT' : 'POST';

      const res = await authFetch(url, { method, body: JSON.stringify(formData) });
      const data = await res.json();
      if (!res.ok || !data.success) return { error: data.message || 'Operation failed' };

      showToast(isEdit ? 'Student record updated successfully!' : 'Student added successfully!');
      fetchStudents();
      fetchStats();
      return { success: true };
    } catch (err) {
      return { error: err.message || 'Network error connecting to student service.' };
    }
  };

  const handleDeleteConfirm = async (studentId) => {
    if (!user) { onOpenAuth(); showToast('Authentication required to delete records.', 'error'); return; }
    try {
      const res = await authFetch(`${STUDENT_BASE}/api/students/${studentId}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('Student record deleted successfully.');
        fetchStudents();
        fetchStats();
      } else {
        showToast(data.message || 'Failed to delete record.', 'error');
      }
    } catch (err) {
      showToast('Network error while deleting.', 'error');
    }
  };

  const tableProps = {
    students, loading, search, setSearch,
    departmentFilter, setDepartmentFilter,
    statusFilter, setStatusFilter,
    sortBy, setSortBy, sortOrder, setSortOrder,
    onRefresh: fetchStudents,
    onAddStudent: () => { if (!user) { onOpenAuth(); } else { setEditingStudent(null); setIsModalOpen(true); } },
    onViewStudent: (student) => setViewingStudent(student),
    onEditStudent: (student) => { if (!user) { onOpenAuth(); } else { setEditingStudent(student); setIsModalOpen(true); } },
    onDeleteStudent: (student) => { if (!user) { onOpenAuth(); } else { setDeletingStudent(student); } }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {toast.show && (
        <Toast type={toast.type} message={toast.message} onClose={() => setToast({ show: false, message: '', type: 'success' })} />
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {activeTab === 'dashboard' && 'Academic Overview'}
            {activeTab === 'students' && 'Student Records Directory'}
            {activeTab === 'analytics' && 'Department Analytics & CGPA'}
            {activeTab === 'architecture' && 'Multi-Service Deployment Architecture'}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            StudentHub Multi-Container Distributed System • College Assessment Project
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={refreshAll} className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm">
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sync Services</span>
          </button>
          <button onClick={() => { if (!user) { onOpenAuth(); } else { setEditingStudent(null); setIsModalOpen(true); } }} className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]">
            <Plus className="w-4 h-4" />
            <span>New Student</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard title="Total Enrollments" value={statsLoading ? '...' : stats.totalStudents} subtitle="Across all degree tracks" icon={Users} color="blue" />
        <StatCard title="Active Students" value={statsLoading ? '...' : stats.activeStudents} subtitle={`${stats.totalStudents > 0 ? Math.round((stats.activeStudents / stats.totalStudents) * 100) : 0}% of student body`} icon={UserCheck} color="emerald" />
        <StatCard title="Departments" value={statsLoading ? '...' : stats.totalDepartments} subtitle="Engineering & Computing" icon={Building} color="purple" />
        <StatCard title="Average GPA" value={statsLoading ? '...' : `${stats.averageGpa} / 4.0`} subtitle="Institutional standard" icon={Award} color="amber" />
      </div>

      {activeTab === 'dashboard' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Department Distribution</h3>
                <span className="text-xs font-medium text-slate-400">Live roster</span>
              </div>
              <div className="space-y-3.5">
                {Object.entries(stats.departmentDistribution).length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">No department statistics available</p>
                ) : (
                  Object.entries(stats.departmentDistribution).map(([dept, count]) => {
                    const pct = stats.totalStudents > 0 ? Math.round((count / stats.totalStudents) * 100) : 0;
                    return (
                      <div key={dept} className="space-y-1">
                        <div className="flex items-center justify-between text-xs font-semibold">
                          <span className="text-slate-700 dark:text-slate-300">{dept}</span>
                          <span className="text-slate-500 dark:text-slate-400 font-mono">{count} ({pct}%)</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                          <div className="h-full bg-blue-600 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Server className="w-5 h-5 text-blue-400" />
                  <h3 className="text-base font-bold">Deployment Mesh</h3>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Healthy</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">4 isolated services communicating through dedicated networking with health check constraints.</p>
              <div className="space-y-2 pt-2 border-t border-white/10 text-xs">
                <div className="flex items-center justify-between py-1 border-b border-white/5"><span className="text-slate-300">Frontend (Vite + Nginx)</span><span className="font-mono text-emerald-400">Vercel</span></div>
                <div className="flex items-center justify-between py-1 border-b border-white/5"><span className="text-slate-300">Auth Service (Express + JWT)</span><span className="font-mono text-emerald-400">Railway</span></div>
                <div className="flex items-center justify-between py-1 border-b border-white/5"><span className="text-slate-300">Student API (CRUD + Stats)</span><span className="font-mono text-emerald-400">Railway</span></div>
                <div className="flex items-center justify-between py-1"><span className="text-slate-300">MySQL Database</span><span className="font-mono text-emerald-400">Railway</span></div>
              </div>
              <button onClick={() => setActiveTab('architecture')} className="w-full mt-2 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center justify-center gap-1.5">
                <span>Inspect Architecture & Compose</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          <StudentTable {...tableProps} />
        </div>
      )}

      {activeTab === 'students' && (
        <div className="space-y-6">
          <StudentTable {...tableProps} />
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Academic Standing Breakdown</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50">
                  <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">Active Students</div>
                  <div className="text-2xl font-black text-emerald-900 dark:text-emerald-200 mt-1 font-mono">{stats.activeStudents}</div>
                </div>
                <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50">
                  <div className="text-xs font-semibold text-blue-700 dark:text-blue-400">Graduated</div>
                  <div className="text-2xl font-black text-blue-900 dark:text-blue-200 mt-1 font-mono">{stats.graduatedStudents}</div>
                </div>
                <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/50">
                  <div className="text-xs font-semibold text-amber-700 dark:text-amber-400">Inactive</div>
                  <div className="text-2xl font-black text-amber-900 dark:text-amber-200 mt-1 font-mono">{stats.inactiveStudents}</div>
                </div>
                <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/50">
                  <div className="text-xs font-semibold text-rose-700 dark:text-rose-400">Suspended</div>
                  <div className="text-2xl font-black text-rose-900 dark:text-rose-200 mt-1 font-mono">{stats.suspendedStudents}</div>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">GPA Performance Tier Breakdown</h3>
              <div className="space-y-3">
                {(() => {
                  const deansList = students.filter(s => parseFloat(s.gpa) >= 3.75).length;
                  const honors = students.filter(s => parseFloat(s.gpa) >= 3.25 && parseFloat(s.gpa) < 3.75).length;
                  const goodStanding = students.filter(s => parseFloat(s.gpa) >= 2.50 && parseFloat(s.gpa) < 3.25).length;
                  const probation = students.filter(s => parseFloat(s.gpa) < 2.50).length;
                  const total = students.length || 1;
                  return (
                    <>
                      <div>
                        <div className="flex justify-between text-xs font-medium mb-1"><span className="text-emerald-600 dark:text-emerald-400 font-bold">Dean's List (3.75 - 4.00)</span><span className="font-mono">{deansList} students ({Math.round((deansList/total)*100)}%)</span></div>
                        <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden"><div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(deansList/total)*100}%` }} /></div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs font-medium mb-1"><span className="text-blue-600 dark:text-blue-400 font-bold">Honors Standing (3.25 - 3.74)</span><span className="font-mono">{honors} students ({Math.round((honors/total)*100)}%)</span></div>
                        <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden"><div className="h-full bg-blue-500 rounded-full" style={{ width: `${(honors/total)*100}%` }} /></div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs font-medium mb-1"><span className="text-slate-600 dark:text-slate-300 font-bold">Good Standing (2.50 - 3.24)</span><span className="font-mono">{goodStanding} students ({Math.round((goodStanding/total)*100)}%)</span></div>
                        <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden"><div className="h-full bg-slate-400 rounded-full" style={{ width: `${(goodStanding/total)*100}%` }} /></div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs font-medium mb-1"><span className="text-rose-600 dark:text-rose-400 font-bold">Academic Review (&lt; 2.50)</span><span className="font-mono">{probation} students ({Math.round((probation/total)*100)}%)</span></div>
                        <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden"><div className="h-full bg-rose-500 rounded-full" style={{ width: `${(probation/total)*100}%` }} /></div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'architecture' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Multi-Service Container Topology</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Decoupled microservice architecture designed for Docker Compose and cloud deployment</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 space-y-2">
                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-sm"><Layers className="w-4 h-4" /><span>Frontend Service</span></div>
                <p className="text-xs text-slate-600 dark:text-slate-300">React 18 SPA + Vite + Tailwind CSS deployed on Vercel CDN.</p>
                <div className="pt-2 font-mono text-[11px] text-slate-500 space-y-1"><div>Host: <strong className="text-blue-600">Vercel</strong></div><div>Local Port: 3000</div></div>
              </div>
              <div className="p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/60 space-y-2">
                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm"><ShieldCheck className="w-4 h-4" /><span>Auth Service</span></div>
                <p className="text-xs text-slate-600 dark:text-slate-300">Node.js Express: bcrypt hashing, JWT signing & verification.</p>
                <div className="pt-2 font-mono text-[11px] text-slate-500 space-y-1"><div>Host: <strong className="text-indigo-600">Railway</strong></div><div>Local Port: 5001</div></div>
              </div>
              <div className="p-4 rounded-xl bg-purple-50/50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/60 space-y-2">
                <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-bold text-sm"><Users className="w-4 h-4" /><span>Student API Service</span></div>
                <p className="text-xs text-slate-600 dark:text-slate-300">RESTful CRUD microservice: student records, GPA analytics.</p>
                <div className="pt-2 font-mono text-[11px] text-slate-500 space-y-1"><div>Host: <strong className="text-purple-600">Railway</strong></div><div>Local Port: 5002</div></div>
              </div>
              <div className="p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 space-y-2">
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-sm"><Database className="w-4 h-4" /><span>Database Service</span></div>
                <p className="text-xs text-slate-600 dark:text-slate-300">MySQL 8.0 with persistent volume & auto-initialized schema.</p>
                <div className="pt-2 font-mono text-[11px] text-slate-500 space-y-1"><div>Host: <strong className="text-amber-600">Railway MySQL</strong></div><div>Local Port: 3306</div></div>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 text-slate-200 font-mono text-xs space-y-2 overflow-x-auto">
              <div className="text-slate-400 flex items-center gap-2"><Terminal className="w-4 h-4 text-emerald-400" /><span>Local single-command launch (Docker required):</span></div>
              <div className="text-emerald-400 font-bold">docker compose up --build</div>
              <div className="text-slate-400 mt-2">Or without Docker on Windows:</div>
              <div className="text-blue-400">run-local.bat</div>
            </div>
          </div>
        </div>
      )}

      <StudentModal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingStudent(null); }} onSave={handleSaveStudent} student={editingStudent} />
      <ViewStudentModal isOpen={!!viewingStudent} onClose={() => setViewingStudent(null)} student={viewingStudent} />
      <DeleteConfirmModal isOpen={!!deletingStudent} onClose={() => setDeletingStudent(null)} onConfirm={handleDeleteConfirm} student={deletingStudent} />
    </div>
  );
}