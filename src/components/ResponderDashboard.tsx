import React, { useState } from 'react';
import {
  AlertTriangle,
  MapPin,
  Users,
  Clock,
  Truck,
  CheckCircle2,
  ChevronRight,
  Filter,
  Search,
  ExternalLink,
  Shield,
  Activity,
  HeartPulse,
} from 'lucide-react';
import { SosAlertRecord, AlertStatus, UrgencyLevel } from '../types/dashboard';

interface ResponderDashboardProps {
  alerts: SosAlertRecord[];
  onUpdateStatus: (alertId: string, status: AlertStatus, responder?: string) => Promise<void>;
  onOpenNewSosModal: () => void;
  isDarkTheme: boolean;
}

export const ResponderDashboard: React.FC<ResponderDashboardProps> = ({
  alerts,
  onUpdateStatus,
  onOpenNewSosModal,
  isDarkTheme,
}) => {
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAlert, setSelectedAlert] = useState<SosAlertRecord | null>(alerts[0] || null);

  const [assignedUnit, setAssignedUnit] = useState('Rapid Medical Taskforce Unit 1');
  const [assignedUnitError, setAssignedUnitError] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  const filteredAlerts = alerts.filter((alert) => {
    if (severityFilter !== 'ALL' && alert.severity !== severityFilter) return false;
    if (statusFilter !== 'ALL' && alert.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = alert.senderName?.toLowerCase().includes(q);
      const matchType = alert.emergencyType?.toLowerCase().includes(q);
      const matchNotes = alert.notes?.toLowerCase().includes(q);
      const matchId = alert.alertId?.toLowerCase().includes(q);
      if (!matchName && !matchType && !matchNotes && !matchId) return false;
    }
    return true;
  });

  const criticalCount = alerts.filter((a) => a.severity === 'CRITICAL' && a.status !== 'RESOLVED').length;
  const pendingCount = alerts.filter((a) => a.status === 'PENDING').length;
  const activeCount = alerts.filter((a) => a.status === 'DISPATCHED' || a.status === 'IN_PROGRESS').length;
  const resolvedCount = alerts.filter((a) => a.status === 'RESOLVED').length;

  const handleAssignAndDispatch = async (targetStatus: AlertStatus) => {
    if (!selectedAlert) return;
    if (!assignedUnit.trim()) {
      setAssignedUnitError(true);
      return;
    }
    setAssignedUnitError(false);
    setIsUpdating(true);
    setActionSuccessMsg(null);

    try {
      await onUpdateStatus(selectedAlert.alertId, targetStatus, assignedUnit.trim());
      setSelectedAlert((prev) =>
        prev
          ? {
              ...prev,
              status: targetStatus,
              dispatchedResponder: assignedUnit.trim(),
            }
          : null
      );
      setActionSuccessMsg(`Successfully updated ${selectedAlert.alertId} to ${targetStatus}`);
      setTimeout(() => setActionSuccessMsg(null), 3500);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  const cardBg = isDarkTheme ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm';
  const subCardBg = isDarkTheme ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200';
  const textPrimary = isDarkTheme ? 'text-white' : 'text-slate-900';
  const textSecondary = isDarkTheme ? 'text-slate-400' : 'text-slate-600';

  return (
    <div className="space-y-6">
      {/* Responder KPI Status Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`p-4 rounded-xl border ${cardBg}`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-red-500 uppercase tracking-wider">Critical Immediate</span>
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-3xl font-extrabold ${textPrimary}`}>{criticalCount}</span>
            <span className="text-xs text-red-500 font-medium">Life-Safety Priority</span>
          </div>
        </div>

        <div className={`p-4 rounded-xl border ${cardBg}`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-500 uppercase tracking-wider">Awaiting Responder</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-3xl font-extrabold ${textPrimary}`}>{pendingCount}</span>
            <span className="text-xs text-amber-500 font-medium">Pending Assignment</span>
          </div>
        </div>

        <div className={`p-4 rounded-xl border ${cardBg}`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-sky-500 uppercase tracking-wider">Active Operations</span>
            <Truck className="w-4 h-4 text-sky-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-3xl font-extrabold ${textPrimary}`}>{activeCount}</span>
            <span className="text-xs text-sky-500 font-medium">Units Dispatched/In-Field</span>
          </div>
        </div>

        <div className={`p-4 rounded-xl border ${cardBg}`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider">Rescues Finalized</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-3xl font-extrabold ${textPrimary}`}>{resolvedCount}</span>
            <span className="text-xs text-emerald-500 font-medium">Marked Safe</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${cardBg}`}>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <Filter className="w-3.5 h-3.5" />
            Priority:
          </div>
          {(['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const).map((lvl) => (
            <button
              key={lvl}
              onClick={() => setSeverityFilter(lvl)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                severityFilter === lvl
                  ? lvl === 'CRITICAL'
                    ? 'bg-red-600 text-white'
                    : lvl === 'HIGH'
                    ? 'bg-orange-500 text-white'
                    : 'bg-sky-600 text-white'
                  : isDarkTheme
                  ? 'bg-slate-800 text-slate-400 hover:text-white'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              {lvl}
            </button>
          ))}

          <div className="h-4 w-px bg-slate-700/40 mx-1 hidden sm:block" />

          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Status:
          </div>
          {(['ALL', 'PENDING', 'DISPATCHED', 'IN_PROGRESS', 'RESOLVED'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                statusFilter === st
                  ? isDarkTheme
                    ? 'bg-white text-slate-900'
                    : 'bg-slate-900 text-white'
                  : isDarkTheme
                  ? 'bg-slate-800 text-slate-400 hover:text-white'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search victim, type, ID..."
              className={`w-full pl-9 pr-3 py-1.5 rounded-lg text-xs border focus:outline-none focus:border-sky-500 ${
                isDarkTheme
                  ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500'
                  : 'bg-slate-100 border-slate-300 text-slate-900 placeholder-slate-400'
              }`}
            />
          </div>

          <button
            onClick={onOpenNewSosModal}
            className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold shadow-md shadow-red-900/30 whitespace-nowrap transition-colors"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Broadcast SOS
          </button>
        </div>
      </div>

      {/* Main Grid: Incoming Emergency List vs Request Details Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Emergency Requests Queue */}
        <div className="lg:col-span-7 space-y-3">
          {filteredAlerts.length === 0 ? (
            <div className={`p-10 rounded-xl border text-center ${cardBg}`}>
              <Shield className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <p className={`text-sm font-bold ${textPrimary}`}>No emergency requests matching criteria</p>
              <p className={`text-xs ${textSecondary} mt-1`}>All incoming distress packets have been triaged or filtered.</p>
            </div>
          ) : (
            filteredAlerts.map((alert) => {
              const isSelected = selectedAlert?.alertId === alert.alertId;
              return (
                <div
                  key={alert.alertId}
                  onClick={() => setSelectedAlert(alert)}
                  className={`cursor-pointer rounded-xl border p-4 transition-all relative overflow-hidden ${
                    isSelected
                      ? isDarkTheme
                        ? 'bg-slate-800 border-sky-500 ring-1 ring-sky-500 shadow-xl'
                        : 'bg-sky-50/70 border-sky-500 ring-1 ring-sky-500 shadow-md'
                      : cardBg
                  }`}
                >
                  {/* Left severity indicator stripe */}
                  <div
                    className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                      alert.severity === 'CRITICAL'
                        ? 'bg-red-600'
                        : alert.severity === 'HIGH'
                        ? 'bg-orange-500'
                        : alert.severity === 'MEDIUM'
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                  />

                  <div className="pl-2">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                            alert.severity === 'CRITICAL'
                              ? 'bg-red-500/20 text-red-500 border border-red-500/40'
                              : alert.severity === 'HIGH'
                              ? 'bg-orange-500/20 text-orange-500 border border-orange-500/40'
                              : 'bg-sky-500/20 text-sky-500 border border-sky-500/40'
                          }`}
                        >
                          {alert.severity}
                        </span>

                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${
                            isDarkTheme ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-slate-100 text-slate-700 border-slate-300'
                          }`}
                        >
                          {alert.emergencyType}
                        </span>

                        <span className={`text-xs font-bold ${textPrimary}`}>{alert.senderName}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            alert.status === 'PENDING'
                              ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30'
                              : alert.status === 'DISPATCHED'
                              ? 'bg-blue-500/20 text-blue-500 border border-blue-500/30'
                              : alert.status === 'IN_PROGRESS'
                              ? 'bg-purple-500/20 text-purple-500 border border-purple-500/30'
                              : 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30'
                          }`}
                        >
                          {alert.status}
                        </span>
                        <ChevronRight className={`w-4 h-4 ${textSecondary}`} />
                      </div>
                    </div>

                    <p className={`text-xs line-clamp-2 mb-3 ${isDarkTheme ? 'text-slate-300' : 'text-slate-700'}`}>
                      {alert.notes || 'No description provided.'}
                    </p>

                    <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 border-t border-slate-700/30 pt-2 gap-2">
                      <div className="flex items-center gap-3">
                        <span className={`flex items-center gap-1 font-semibold ${textPrimary}`}>
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          {alert.victimCount} victims
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-red-500" />
                          {alert.latitude.toFixed(4)}, {alert.longitude.toFixed(4)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span>Hop: {alert.hopCount}</span>
                        <span>•</span>
                        <code className="text-sky-500 font-mono text-[10px]">{alert.originNodeId}</code>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Selected Request Details Inspector & Action Terminal */}
        <div className="lg:col-span-5">
          {selectedAlert ? (
            <div className={`p-5 rounded-xl border sticky top-20 shadow-xl ${cardBg}`}>
              <div className="flex items-center justify-between border-b border-slate-700/40 pb-3 mb-4">
                <div>
                  <span className="text-[10px] font-mono text-sky-500 uppercase">{selectedAlert.alertId}</span>
                  <h3 className={`text-lg font-bold mt-0.5 ${textPrimary}`}>{selectedAlert.senderName}</h3>
                  {selectedAlert.senderPhone && (
                    <p className="text-[11px] text-slate-500">Contact: {selectedAlert.senderPhone}</p>
                  )}
                </div>
                <span
                  className={`px-2.5 py-1 rounded text-xs font-black uppercase ${
                    selectedAlert.severity === 'CRITICAL'
                      ? 'bg-red-500/20 text-red-500 border border-red-500/40'
                      : 'bg-orange-500/20 text-orange-500 border border-orange-500/40'
                  }`}
                >
                  {selectedAlert.severity} PRIORITY
                </span>
              </div>

              {actionSuccessMsg && (
                <div className="mb-4 p-2.5 bg-emerald-500/20 border border-emerald-500/40 rounded-lg text-emerald-500 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{actionSuccessMsg}</span>
                </div>
              )}

              <div className="space-y-4 text-xs">
                {/* Disaster category & victims */}
                <div>
                  <span className={`font-semibold block mb-1 ${textSecondary}`}>Emergency Classification</span>
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded font-bold border ${subCardBg} ${textPrimary}`}>
                      {selectedAlert.emergencyType}
                    </span>
                    <span className={`px-2.5 py-1 rounded font-bold border flex items-center gap-1.5 ${subCardBg} ${textPrimary}`}>
                      <Users className="w-3.5 h-3.5 text-sky-500" />
                      {selectedAlert.victimCount} People Trapped / Affected
                    </span>
                  </div>
                </div>

                {/* Medical needs */}
                {selectedAlert.medicalNeeds && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <span className="text-red-500 font-bold flex items-center gap-1.5 mb-1">
                      <HeartPulse className="w-4 h-4" />
                      Medical Requisitions & Injuries
                    </span>
                    <p className={`font-mono text-xs ${isDarkTheme ? 'text-red-200' : 'text-red-900'}`}>
                      {selectedAlert.medicalNeeds}
                    </p>
                  </div>
                )}

                {/* Geolocation */}
                <div>
                  <span className={`font-semibold block mb-1 ${textSecondary}`}>Location Information</span>
                  <div className={`p-3 rounded-lg border flex items-center justify-between ${subCardBg}`}>
                    <div className={`font-mono text-xs ${textPrimary}`}>
                      LAT: {selectedAlert.latitude.toFixed(6)} | LNG: {selectedAlert.longitude.toFixed(6)}
                    </div>
                    <a
                      href={`https://maps.google.com/?q=${selectedAlert.latitude},${selectedAlert.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sky-500 hover:text-sky-400 font-semibold flex items-center gap-1 text-[11px]"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      View Map
                    </a>
                  </div>
                </div>

                {/* Store-Carry-Forward details */}
                <div>
                  <span className={`font-semibold block mb-1 ${textSecondary}`}>Store-Carry-Forward DTN Telemetry</span>
                  <div className={`p-3 rounded-lg border grid grid-cols-2 gap-2 ${subCardBg}`}>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Originating Node</span>
                      <span className="font-mono text-sky-500 font-semibold">{selectedAlert.originNodeId}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Relay Propagation</span>
                      <span className={`font-semibold ${textPrimary}`}>{selectedAlert.hopCount} Hops</span>
                    </div>
                  </div>
                </div>

                {/* Accept and Assign Actions */}
                <div className="pt-2 border-t border-slate-700/40 space-y-3">
                  <div>
                    <label className={`block font-semibold mb-1 ${textSecondary}`}>
                      Assign Field Responder Unit / Taskforce *
                    </label>
                    <input
                      type="text"
                      value={assignedUnit}
                      onChange={(e) => {
                        setAssignedUnit(e.target.value);
                        if (e.target.value.trim()) setAssignedUnitError(false);
                      }}
                      className={`w-full px-3 py-2 rounded-lg text-xs border focus:outline-none focus:border-sky-500 ${
                        assignedUnitError ? 'border-red-500' : isDarkTheme ? 'border-slate-700 bg-slate-800 text-white' : 'border-slate-300 bg-white text-slate-900'
                      }`}
                      placeholder="e.g. Rapid Medical Team Beta"
                    />
                    {assignedUnitError && (
                      <p className="text-red-500 text-[11px] mt-1">Please enter a responder unit name before assigning.</p>
                    )}
                    {selectedAlert.dispatchedResponder && (
                      <p className="text-emerald-500 text-[11px] mt-1 font-medium">
                        Currently assigned: {selectedAlert.dispatchedResponder}
                      </p>
                    )}
                  </div>

                  <span className={`font-semibold block ${textSecondary}`}>Update Request Status:</span>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      disabled={isUpdating}
                      onClick={() => handleAssignAndDispatch('DISPATCHED')}
                      className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1 transition-all disabled:opacity-50"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      Dispatch
                    </button>
                    <button
                      disabled={isUpdating}
                      onClick={() => handleAssignAndDispatch('IN_PROGRESS')}
                      className="px-3 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1 transition-all disabled:opacity-50"
                    >
                      <Activity className="w-3.5 h-3.5" />
                      In-Progress
                    </button>
                    <button
                      disabled={isUpdating}
                      onClick={() => handleAssignAndDispatch('RESOLVED')}
                      className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1 transition-all disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Resolved
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className={`p-8 rounded-xl border text-center ${cardBg}`}>
              <AlertTriangle className="w-8 h-8 text-slate-500 mx-auto mb-2" />
              <p className={`text-sm font-semibold ${textPrimary}`}>No Request Selected</p>
              <p className={`text-xs ${textSecondary} mt-1`}>Click any incident card from the queue to inspect details and assign responders.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
