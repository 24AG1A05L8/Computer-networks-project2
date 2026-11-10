import React, { useState } from 'react';
import {
  Users,
  ShieldAlert,
  Radio,
  Clock,
  CheckCircle2,
  UserPlus,
  Trash2,
  Edit2,
  FileText,
  Search,
  Filter,
  Check,
  X,
  AlertCircle,
  Shield,
  Activity,
  Layers,
} from 'lucide-react';
import {
  SosAlertRecord,
  UserRecord,
  ActivityLogRecord,
  AdminStats,
  AlertStatus,
  UserRole,
} from '../types/dashboard';

interface AdministratorDashboardProps {
  stats: AdminStats | null;
  alerts: SosAlertRecord[];
  usersList: UserRecord[];
  activityLogs: ActivityLogRecord[];
  onUpdateAlertStatus: (alertId: string, status: AlertStatus, responder?: string) => Promise<void>;
  onDeleteAlert: (alertId: string) => Promise<void>;
  onCreateUser: (userData: { name: string; email: string; phone?: string; role: string; badgeNumber?: string }) => Promise<void>;
  onUpdateUserRole: (uid: string, role: string, badgeNumber?: string) => Promise<void>;
  onUpdateUserStatus: (uid: string, status: string) => Promise<void>;
  isDarkTheme: boolean;
}

export const AdministratorDashboard: React.FC<AdministratorDashboardProps> = ({
  stats,
  alerts,
  usersList,
  activityLogs,
  onUpdateAlertStatus,
  onDeleteAlert,
  onCreateUser,
  onUpdateUserRole,
  onUpdateUserStatus,
  isDarkTheme,
}) => {
  const [activeAdminTab, setActiveAdminTab] = useState<'requests' | 'users' | 'activity'>('requests');

  // Request Management states
  const [requestSearch, setRequestSearch] = useState('');
  const [requestStatusFilter, setRequestStatusFilter] = useState('ALL');

  // User Management states
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('ALL');
  const [isNewUserModalOpen, setIsNewUserModalOpen] = useState(false);

  // New User Form fields
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserRole, setNewUserRole] = useState('first_responder');
  const [newUserBadge, setNewUserBadge] = useState('');
  const [newUserErrors, setNewUserErrors] = useState<{ name?: string; email?: string }>({});
  const [isSubmittingUser, setIsSubmittingUser] = useState(false);

  // Theme classes
  const cardBg = isDarkTheme ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm';
  const subCardBg = isDarkTheme ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200';
  const textPrimary = isDarkTheme ? 'text-white' : 'text-slate-900';
  const textSecondary = isDarkTheme ? 'text-slate-400' : 'text-slate-600';

  // Request Filtering
  const filteredAlerts = alerts.filter((a) => {
    if (requestStatusFilter !== 'ALL' && a.status !== requestStatusFilter) return false;
    if (requestSearch.trim()) {
      const q = requestSearch.toLowerCase();
      const matchName = a.senderName?.toLowerCase().includes(q);
      const matchType = a.emergencyType?.toLowerCase().includes(q);
      const matchId = a.alertId?.toLowerCase().includes(q);
      if (!matchName && !matchType && !matchId) return false;
    }
    return true;
  });

  // User Filtering
  const filteredUsers = usersList.filter((u) => {
    if (userRoleFilter !== 'ALL' && u.role !== userRoleFilter) return false;
    if (userSearch.trim()) {
      const q = userSearch.toLowerCase();
      const matchName = u.name?.toLowerCase().includes(q);
      const matchEmail = u.email?.toLowerCase().includes(q);
      const matchUid = u.uid?.toLowerCase().includes(q);
      const matchBadge = u.badgeNumber?.toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchUid && !matchBadge) return false;
    }
    return true;
  });

  // Handle Create User with validation
  const handleCreateUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { name?: string; email?: string } = {};
    if (!newUserName.trim()) errors.name = 'Full name is required';
    if (!newUserEmail.trim() || !newUserEmail.includes('@')) errors.email = 'Valid email is required';

    if (Object.keys(errors).length > 0) {
      setNewUserErrors(errors);
      return;
    }

    setNewUserErrors({});
    setIsSubmittingUser(true);
    try {
      await onCreateUser({
        name: newUserName.trim(),
        email: newUserEmail.trim(),
        phone: newUserPhone.trim() || undefined,
        role: newUserRole,
        badgeNumber: newUserBadge.trim() || undefined,
      });
      setIsNewUserModalOpen(false);
      setNewUserName('');
      setNewUserEmail('');
      setNewUserPhone('');
      setNewUserBadge('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingUser(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Real Administrator KPI Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className={`p-4 rounded-xl border ${cardBg}`}>
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
            <span>Registered Users</span>
            <Users className="w-4 h-4 text-sky-500" />
          </div>
          <div className={`mt-2 text-2xl font-black ${textPrimary}`}>
            {stats ? stats.totalRegisteredUsers : usersList.length}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Citizens & Field Responders</p>
        </div>

        <div className={`p-4 rounded-xl border ${cardBg}`}>
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
            <span>Emergency Requests</span>
            <ShieldAlert className="w-4 h-4 text-red-500" />
          </div>
          <div className={`mt-2 text-2xl font-black ${textPrimary}`}>
            {stats ? stats.totalEmergencyRequests : alerts.length}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Total Distress Beacons</p>
        </div>

        <div className={`p-4 rounded-xl border ${cardBg}`}>
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
            <span>Active Responders</span>
            <Shield className="w-4 h-4 text-emerald-500" />
          </div>
          <div className={`mt-2 text-2xl font-black ${textPrimary}`}>
            {stats ? stats.activeResponders : usersList.filter((u) => u.role === 'first_responder' || u.role === 'medic').length}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Medics & Rescue Teams</p>
        </div>

        <div className={`p-4 rounded-xl border ${cardBg}`}>
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
            <span>Pending Requests</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className={`mt-2 text-2xl font-black text-amber-500`}>
            {stats ? stats.pendingRequests : alerts.filter((a) => a.status === 'PENDING').length}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Awaiting Dispatch</p>
        </div>

        <div className={`p-4 rounded-xl border ${cardBg}`}>
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
            <span>Active Rescues</span>
            <Activity className="w-4 h-4 text-purple-500" />
          </div>
          <div className={`mt-2 text-2xl font-black text-purple-500`}>
            {stats ? stats.activeRescues : alerts.filter((a) => a.status === 'DISPATCHED' || a.status === 'IN_PROGRESS').length}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Operations In-Progress</p>
        </div>
      </div>

      {/* 2. Admin Sub-Navigation Tabs */}
      <div className={`p-2 rounded-xl border flex items-center gap-2 ${cardBg}`}>
        <button
          onClick={() => setActiveAdminTab('requests')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeAdminTab === 'requests'
              ? 'bg-red-600 text-white shadow-md shadow-red-900/30'
              : isDarkTheme
              ? 'text-slate-400 hover:text-white hover:bg-slate-800'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Emergency Request Management ({alerts.length})</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('users')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeAdminTab === 'users'
              ? 'bg-sky-600 text-white shadow-md shadow-sky-900/30'
              : isDarkTheme
              ? 'text-slate-400 hover:text-white hover:bg-slate-800'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User & Personnel Management ({usersList.length})</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('activity')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeAdminTab === 'activity'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-900/30'
              : isDarkTheme
              ? 'text-slate-400 hover:text-white hover:bg-slate-800'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>System Activity Audit Trail ({activityLogs.length})</span>
        </button>
      </div>

      {/* ================= SECTION A: REQUEST MANAGEMENT ================= */}
      {activeAdminTab === 'requests' && (
        <div className={`p-5 rounded-xl border space-y-4 ${cardBg}`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={requestSearch}
                  onChange={(e) => setRequestSearch(e.target.value)}
                  placeholder="Filter alert ID, victim, type..."
                  className={`w-full pl-9 pr-3 py-1.5 rounded-lg text-xs border focus:outline-none focus:border-red-500 ${
                    isDarkTheme ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-100 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <select
                value={requestStatusFilter}
                onChange={(e) => setRequestStatusFilter(e.target.value)}
                className={`px-3 py-1.5 rounded-lg text-xs border focus:outline-none ${
                  isDarkTheme ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-100 border-slate-300 text-slate-900'
                }`}
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="DISPATCHED">Dispatched</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
              </select>
            </div>

            <span className="text-xs text-slate-500 font-semibold">
              Showing {filteredAlerts.length} of {alerts.length} requests
            </span>
          </div>

          {filteredAlerts.length === 0 ? (
            <div className={`p-8 rounded-xl border text-center ${subCardBg}`}>
              <ShieldAlert className="w-8 h-8 text-slate-500 mx-auto mb-2" />
              <p className={`text-sm font-semibold ${textPrimary}`}>No emergency requests found</p>
              <p className={`text-xs ${textSecondary} mt-1`}>No requests matching your search query.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className={`uppercase text-[10px] tracking-wider border-b ${subCardBg} ${textSecondary}`}>
                  <tr>
                    <th className="px-4 py-3">Alert ID</th>
                    <th className="px-4 py-3">Reporter</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Priority</th>
                    <th className="px-4 py-3">Victims</th>
                    <th className="px-4 py-3">Assigned Unit</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/30">
                  {filteredAlerts.map((alert) => (
                    <tr key={alert.alertId} className={isDarkTheme ? 'hover:bg-slate-850' : 'hover:bg-slate-50'}>
                      <td className="px-4 py-3 font-mono font-semibold text-sky-500">{alert.alertId}</td>
                      <td className={`px-4 py-3 font-semibold ${textPrimary}`}>{alert.senderName}</td>
                      <td className="px-4 py-3 uppercase text-[11px] font-bold">{alert.emergencyType}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                            alert.severity === 'CRITICAL'
                              ? 'bg-red-500/20 text-red-500'
                              : alert.severity === 'HIGH'
                              ? 'bg-orange-500/20 text-orange-500'
                              : 'bg-sky-500/20 text-sky-500'
                          }`}
                        >
                          {alert.severity}
                        </span>
                      </td>
                      <td className={`px-4 py-3 font-bold ${textPrimary}`}>{alert.victimCount}</td>
                      <td className="px-4 py-3 text-slate-400">
                        {alert.dispatchedResponder || <span className="text-slate-500 italic">Unassigned</span>}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            alert.status === 'PENDING'
                              ? 'bg-amber-500/20 text-amber-500'
                              : alert.status === 'RESOLVED'
                              ? 'bg-emerald-500/20 text-emerald-500'
                              : 'bg-blue-500/20 text-blue-500'
                          }`}
                        >
                          {alert.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {alert.status !== 'RESOLVED' && (
                            <button
                              onClick={() => onUpdateAlertStatus(alert.alertId, 'RESOLVED')}
                              title="Resolve"
                              className="p-1 text-emerald-500 hover:bg-emerald-500/20 rounded"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => onDeleteAlert(alert.alertId)}
                            title="Archive / Delete"
                            className="p-1 text-red-500 hover:bg-red-500/20 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ================= SECTION B: USER MANAGEMENT ================= */}
      {activeAdminTab === 'users' && (
        <div className={`p-5 rounded-xl border space-y-4 ${cardBg}`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Search user name, email, badge..."
                  className={`w-full pl-9 pr-3 py-1.5 rounded-lg text-xs border focus:outline-none focus:border-sky-500 ${
                    isDarkTheme ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-100 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                className={`px-3 py-1.5 rounded-lg text-xs border focus:outline-none ${
                  isDarkTheme ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-100 border-slate-300 text-slate-900'
                }`}
              >
                <option value="ALL">All Roles</option>
                <option value="first_responder">First Responder</option>
                <option value="medic">Field Medic</option>
                <option value="admin">Administrator</option>
                <option value="citizen">Citizen</option>
              </select>
            </div>

            <button
              onClick={() => setIsNewUserModalOpen(true)}
              className="flex items-center gap-2 px-3.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-lg shadow-md transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5" />
              Register Personnel
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className={`uppercase text-[10px] tracking-wider border-b ${subCardBg} ${textSecondary}`}>
                <tr>
                  <th className="px-4 py-3">Callsign / UID</th>
                  <th className="px-4 py-3">Full Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Badge / Taskforce</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/30">
                {filteredUsers.map((user) => (
                  <tr key={user.uid} className={isDarkTheme ? 'hover:bg-slate-850' : 'hover:bg-slate-50'}>
                    <td className="px-4 py-3 font-mono text-sky-500 font-semibold">{user.uid}</td>
                    <td className={`px-4 py-3 font-bold ${textPrimary}`}>{user.name || 'Unnamed'}</td>
                    <td className="px-4 py-3 text-slate-400">{user.email}</td>
                    <td className="px-4 py-3">
                      <select
                        value={user.role || 'citizen'}
                        onChange={(e) => onUpdateUserRole(user.uid, e.target.value)}
                        className={`px-2 py-1 rounded text-xs border font-medium focus:outline-none ${
                          isDarkTheme ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-100 border-slate-300 text-slate-900'
                        }`}
                      >
                        <option value="first_responder">First Responder</option>
                        <option value="medic">Field Medic</option>
                        <option value="admin">Administrator</option>
                        <option value="citizen">Citizen</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-400">{user.badgeNumber || '—'}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          user.status === 'ACTIVE'
                            ? 'bg-emerald-500/20 text-emerald-500'
                            : 'bg-red-500/20 text-red-500'
                        }`}
                      >
                        {user.status || 'ACTIVE'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() =>
                          onUpdateUserStatus(
                            user.uid,
                            user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE'
                          )
                        }
                        className={`px-2 py-1 rounded text-[11px] font-bold ${
                          user.status === 'ACTIVE'
                            ? 'text-red-500 hover:bg-red-500/10'
                            : 'text-emerald-500 hover:bg-emerald-500/10'
                        }`}
                      >
                        {user.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= SECTION C: ACTIVITY LOGS ================= */}
      {activeAdminTab === 'activity' && (
        <div className={`p-5 rounded-xl border space-y-4 ${cardBg}`}>
          <div className="flex items-center justify-between border-b border-slate-700/40 pb-3">
            <div>
              <h4 className={`text-sm font-bold ${textPrimary}`}>System Activity & Audit Logs</h4>
              <p className={`text-xs ${textSecondary}`}>Real chronological audit trail stored in PostgreSQL</p>
            </div>
            <span className="text-xs text-slate-500 font-semibold">{activityLogs.length} events logged</span>
          </div>

          {activityLogs.length === 0 ? (
            <div className={`p-8 rounded-xl border text-center ${subCardBg}`}>
              <FileText className="w-8 h-8 text-slate-500 mx-auto mb-2" />
              <p className={`text-sm font-semibold ${textPrimary}`}>No activity logged yet</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {activityLogs.map((log) => (
                <div
                  key={log.id}
                  className={`p-3 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${subCardBg}`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`p-1.5 rounded-md ${
                        log.severity === 'CRITICAL'
                          ? 'bg-red-500/20 text-red-500'
                          : log.severity === 'WARNING'
                          ? 'bg-amber-500/20 text-amber-500'
                          : 'bg-sky-500/20 text-sky-500'
                      }`}
                    >
                      <Activity className="w-3.5 h-3.5" />
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold ${textPrimary}`}>{log.actorName}</span>
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-slate-700 text-slate-300">
                          {log.actorRole}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">[{log.actionType}]</span>
                      </div>
                      <p className={`text-xs mt-0.5 ${textSecondary}`}>{log.details}</p>
                    </div>
                  </div>

                  <span className="text-[10px] text-slate-500 font-mono whitespace-nowrap self-end sm:self-center">
                    {log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : 'Just now'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Register New Personnel Modal */}
      {isNewUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className={`w-full max-w-md rounded-2xl border p-6 space-y-4 ${cardBg}`}>
            <div className="flex items-center justify-between border-b border-slate-700/40 pb-3">
              <h3 className={`text-base font-bold ${textPrimary}`}>Register Emergency Personnel</h3>
              <button
                onClick={() => setIsNewUserModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUserSubmit} className="space-y-3 text-xs">
              <div>
                <label className={`block font-semibold mb-1 ${textSecondary}`}>Full Name *</label>
                <input
                  type="text"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="e.g. Captain Meera Sharma"
                  className={`w-full px-3 py-2 rounded-lg border text-xs focus:outline-none ${
                    newUserErrors.name ? 'border-red-500' : isDarkTheme ? 'border-slate-700 bg-slate-800 text-white' : 'border-slate-300 bg-white text-slate-900'
                  }`}
                />
                {newUserErrors.name && <p className="text-red-500 text-[10px] mt-1">{newUserErrors.name}</p>}
              </div>

              <div>
                <label className={`block font-semibold mb-1 ${textSecondary}`}>Official Email *</label>
                <input
                  type="email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="e.g. meera.sharma@sahaayanet.org"
                  className={`w-full px-3 py-2 rounded-lg border text-xs focus:outline-none ${
                    newUserErrors.email ? 'border-red-500' : isDarkTheme ? 'border-slate-700 bg-slate-800 text-white' : 'border-slate-300 bg-white text-slate-900'
                  }`}
                />
                {newUserErrors.email && <p className="text-red-500 text-[10px] mt-1">{newUserErrors.email}</p>}
              </div>

              <div>
                <label className={`block font-semibold mb-1 ${textSecondary}`}>Phone / Radio Contact</label>
                <input
                  type="text"
                  value={newUserPhone}
                  onChange={(e) => setNewUserPhone(e.target.value)}
                  placeholder="+91 98490 XXXXX"
                  className={`w-full px-3 py-2 rounded-lg border text-xs focus:outline-none ${
                    isDarkTheme ? 'border-slate-700 bg-slate-800 text-white' : 'border-slate-300 bg-white text-slate-900'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block font-semibold mb-1 ${textSecondary}`}>Role</label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border text-xs focus:outline-none ${
                      isDarkTheme ? 'border-slate-700 bg-slate-800 text-white' : 'border-slate-300 bg-white text-slate-900'
                    }`}
                  >
                    <option value="first_responder">First Responder</option>
                    <option value="medic">Field Medic</option>
                    <option value="admin">Administrator</option>
                    <option value="citizen">Citizen Volunteer</option>
                  </select>
                </div>
                <div>
                  <label className={`block font-semibold mb-1 ${textSecondary}`}>Badge / Call Sign</label>
                  <input
                    type="text"
                    value={newUserBadge}
                    onChange={(e) => setNewUserBadge(e.target.value)}
                    placeholder="e.g. TASKFORCE-07"
                    className={`w-full px-3 py-2 rounded-lg border text-xs focus:outline-none ${
                      isDarkTheme ? 'border-slate-700 bg-slate-800 text-white' : 'border-slate-300 bg-white text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-700/40">
                <button
                  type="button"
                  onClick={() => setIsNewUserModalOpen(false)}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold ${
                    isDarkTheme ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingUser}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-lg shadow-md transition-colors disabled:opacity-50"
                >
                  {isSubmittingUser ? 'Enrolling...' : 'Enroll Personnel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
