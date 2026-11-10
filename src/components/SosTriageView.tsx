import React, { useState } from 'react';
import {
  AlertTriangle,
  Clock,
  MapPin,
  Users,
  ShieldCheck,
  Truck,
  CheckCircle2,
  Share2,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { SosAlertRecord, UrgencyLevel, AlertStatus } from '../types/dashboard';

interface SosTriageViewProps {
  alerts: SosAlertRecord[];
  onUpdateStatus: (alertId: string, status: AlertStatus, responder?: string) => Promise<void>;
  onOpenNewSosModal: () => void;
}

export const SosTriageView: React.FC<SosTriageViewProps> = ({
  alerts,
  onUpdateStatus,
  onOpenNewSosModal,
}) => {
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedAlert, setSelectedAlert] = useState<SosAlertRecord | null>(null);
  const [responderName, setResponderName] = useState('Taskforce Delta (Sahaaya Unit 1)');
  const [isUpdating, setIsUpdating] = useState(false);

  const filteredAlerts = alerts.filter((alert) => {
    if (severityFilter !== 'ALL' && alert.severity !== severityFilter) return false;
    if (statusFilter !== 'ALL' && alert.status !== statusFilter) return false;
    return true;
  });

  const criticalCount = alerts.filter((a) => a.severity === 'CRITICAL' && a.status !== 'RESOLVED').length;
  const pendingCount = alerts.filter((a) => a.status === 'PENDING').length;
  const totalVictims = alerts
    .filter((a) => a.status !== 'RESOLVED')
    .reduce((acc, curr) => acc + (curr.victimCount || 1), 0);

  const handleDispatch = async (alertId: string, status: AlertStatus) => {
    setIsUpdating(true);
    try {
      await onUpdateStatus(alertId, status, responderName);
      if (selectedAlert && selectedAlert.alertId === alertId) {
        setSelectedAlert((prev) => (prev ? { ...prev, status, dispatchedResponder: responderName } : null));
      }
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Triage Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-red-500/30 rounded-xl p-4 shadow-lg backdrop-blur-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-red-400">Critical Emergencies</span>
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">{criticalCount}</span>
            <span className="text-xs text-red-400 font-medium">Require Instant Triage</span>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-amber-500/30 rounded-xl p-4 shadow-lg backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">Pending Dispatch</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">{pendingCount}</span>
            <span className="text-xs text-amber-400 font-medium">Awaiting Field Assignment</span>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-sky-500/30 rounded-xl p-4 shadow-lg backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-sky-400">Victims Identified</span>
            <Users className="w-4 h-4 text-sky-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">{totalVictims}</span>
            <span className="text-xs text-sky-400 font-medium">Individuals Trapped / Injured</span>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-emerald-500/30 rounded-xl p-4 shadow-lg backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Resolved Incidents</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">
              {alerts.filter((a) => a.status === 'RESOLVED').length}
            </span>
            <span className="text-xs text-emerald-400 font-medium">Field Rescues Finalized</span>
          </div>
        </div>
      </div>

      {/* Filter and Action Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-xl p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            Urgency:
          </div>
          {(['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const).map((lvl) => (
            <button
              key={lvl}
              onClick={() => setSeverityFilter(lvl)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                severityFilter === lvl
                  ? lvl === 'CRITICAL'
                    ? 'bg-red-500 text-white'
                    : lvl === 'HIGH'
                    ? 'bg-orange-500 text-white'
                    : 'bg-sky-500 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              {lvl}
            </button>
          ))}

          <div className="h-4 w-px bg-slate-700 mx-1 hidden sm:block" />

          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Status:
          </div>
          {(['ALL', 'PENDING', 'DISPATCHED', 'RESOLVED'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                statusFilter === st
                  ? 'bg-slate-200 text-slate-900'
                  : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <button
          onClick={onOpenNewSosModal}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-semibold shadow-lg shadow-red-900/30 transition-colors"
        >
          <AlertTriangle className="w-4 h-4" />
          Broadcast Test SOS
        </button>
      </div>

      {/* Main List and Detail Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Incident Cards Queue */}
        <div className="lg:col-span-7 space-y-3">
          {filteredAlerts.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-400">
              <ShieldCheck className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
              <p className="text-base font-semibold text-white">No matching active emergency incidents</p>
              <p className="text-xs text-slate-500 mt-1">All distress beacons in this category have been triaged or resolved.</p>
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
                      ? 'bg-slate-800/90 border-sky-500 ring-1 ring-sky-500 shadow-xl'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                  }`}
                >
                  {/* Left severity indicator stripe */}
                  <div
                    className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                      alert.severity === 'CRITICAL'
                        ? 'bg-red-500'
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
                              ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                              : alert.severity === 'HIGH'
                              ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40'
                              : 'bg-sky-500/20 text-sky-400 border border-sky-500/40'
                          }`}
                        >
                          {alert.severity}
                        </span>

                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700 uppercase">
                          {alert.emergencyType}
                        </span>

                        <span className="text-xs font-bold text-white tracking-wide">
                          {alert.senderName}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            alert.status === 'PENDING'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : alert.status === 'DISPATCHED'
                              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                              : alert.status === 'IN_PROGRESS'
                              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          }`}
                        >
                          {alert.status}
                        </span>
                        <ChevronRight className="w-4 h-4 text-slate-500" />
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 line-clamp-2 mb-3">
                      {alert.notes || 'No description provided.'}
                    </p>

                    <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/80 pt-2 gap-2">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 text-slate-300 font-medium">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          {alert.victimCount} victims
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-red-400" />
                          {alert.latitude.toFixed(4)}, {alert.longitude.toFixed(4)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1 text-slate-400">
                          <Share2 className="w-3 h-3 text-sky-400" />
                          Mesh Hop: {alert.hopCount}
                        </span>
                        <span className="text-slate-500">|</span>
                        <span className="text-slate-400">
                          Origin: <code className="text-sky-300 font-mono text-[10px]">{alert.originNodeId}</code>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Selected Incident Command Panel */}
        <div className="lg:col-span-5">
          {selectedAlert ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 sticky top-20 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                <div>
                  <span className="text-[10px] font-mono text-sky-400 uppercase">{selectedAlert.alertId}</span>
                  <h3 className="text-lg font-bold text-white mt-0.5">{selectedAlert.senderName}</h3>
                </div>
                <span
                  className={`px-2.5 py-1 rounded text-xs font-black uppercase ${
                    selectedAlert.severity === 'CRITICAL'
                      ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                      : 'bg-orange-500/20 text-orange-400 border border-orange-500/40'
                  }`}
                >
                  {selectedAlert.severity} PRIORITY
                </span>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <span className="text-slate-400 font-medium block mb-1">Disaster Classification & Victims</span>
                  <div className="flex items-center gap-2">
                    <span className="bg-slate-800 text-white font-semibold px-2 py-1 rounded">
                      {selectedAlert.emergencyType}
                    </span>
                    <span className="bg-slate-800 text-white font-semibold px-2 py-1 rounded flex items-center gap-1">
                      <Users className="w-3 h-3 text-sky-400" />
                      {selectedAlert.victimCount} People Trapped
                    </span>
                  </div>
                </div>

                {selectedAlert.medicalNeeds && (
                  <div className="bg-red-950/30 border border-red-900/50 rounded-lg p-3">
                    <span className="text-red-300 font-semibold flex items-center gap-1.5 mb-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                      Critical Medical Requisition
                    </span>
                    <p className="text-red-200 text-xs font-mono">{selectedAlert.medicalNeeds}</p>
                  </div>
                )}

                <div>
                  <span className="text-slate-400 font-medium block mb-1">Incident Location Coordinates</span>
                  <div className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 flex items-center justify-between">
                    <div className="font-mono text-slate-200 text-xs">
                      LAT: {selectedAlert.latitude.toFixed(6)} | LNG: {selectedAlert.longitude.toFixed(6)}
                    </div>
                    <a
                      href={`https://maps.google.com/?q=${selectedAlert.latitude},${selectedAlert.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sky-400 hover:text-sky-300 font-medium flex items-center gap-1 text-[11px]"
                    >
                      <MapPin className="w-3 h-3" />
                      Map Pin
                    </a>
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 font-medium block mb-1">Store-Carry-Forward Mesh Telemetry</span>
                  <div className="grid grid-cols-2 gap-2 bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-300">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Originating Node</span>
                      <span className="font-mono text-sky-300">{selectedAlert.originNodeId}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Relay Hops</span>
                      <span className="font-semibold text-white">{selectedAlert.hopCount} Inter-Node Transfers</span>
                    </div>
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 font-medium block mb-1">Assigned Field Unit</span>
                  <input
                    type="text"
                    value={responderName}
                    onChange={(e) => setResponderName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                    placeholder="Enter Responder unit name"
                  />
                  {selectedAlert.dispatchedResponder && (
                    <span className="text-[11px] text-emerald-400 mt-1 block">
                      Currently dispatched: {selectedAlert.dispatchedResponder}
                    </span>
                  )}
                </div>

                {/* Dispatch actions */}
                <div className="pt-2 border-t border-slate-800 space-y-2">
                  <span className="text-[11px] text-slate-400 font-medium block">Triage Dispatch Actions:</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      disabled={isUpdating}
                      onClick={() => handleDispatch(selectedAlert.alertId, 'DISPATCHED')}
                      className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      Dispatch Team
                    </button>
                    <button
                      disabled={isUpdating}
                      onClick={() => handleDispatch(selectedAlert.alertId, 'RESOLVED')}
                      className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Mark Resolved
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-400">
              <AlertTriangle className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-300">Select an Incident Card</p>
              <p className="text-xs text-slate-500 mt-1">
                Click any distress alert in the queue to inspect DTN hop trail, patient vitals, and assign first responder taskforces.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
