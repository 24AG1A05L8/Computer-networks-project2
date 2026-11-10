import React, { useState } from 'react';
import { AlertTriangle, X, Radio, MapPin, Users, HeartPulse } from 'lucide-react';
import { UrgencyLevel } from '../types/dashboard';

interface NewSosModalProps {
  isOpen: boolean;
  onClose: () => Unit;
  onSubmit: (data: {
    senderName: string;
    emergencyType: string;
    severity: UrgencyLevel;
    victimCount: number;
    medicalNeeds: string;
    notes: string;
    latitude: number;
    longitude: number;
    originNodeId: string;
  }) => Promise<void>;
}

type Unit = void;

export const NewSosModal: React.FC<NewSosModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [senderName, setSenderName] = useState('');
  const [emergencyType, setEmergencyType] = useState('FLOOD');
  const [severity, setSeverity] = useState<UrgencyLevel>('CRITICAL');
  const [victimCount, setVictimCount] = useState(2);
  const [medicalNeeds, setMedicalNeeds] = useState('');
  const [notes, setNotes] = useState('');
  const [latitude, setLatitude] = useState(17.385);
  const [longitude, setLongitude] = useState(78.4867);
  const [originNodeId, setOriginNodeId] = useState('NODE-FIELD-' + Math.floor(100 + Math.random() * 900));
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({
        senderName: senderName || 'Anonymous Citizen',
        emergencyType,
        severity,
        victimCount,
        medicalNeeds,
        notes,
        latitude,
        longitude,
        originNodeId,
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/20 text-red-400 rounded-lg">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Broadcast Emergency SOS Signal</h3>
              <p className="text-xs text-slate-400">Generates high-priority distress bundle for offline mesh propagation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Reporter / Victim Call Sign</label>
              <input
                type="text"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                placeholder="e.g. Anand Kumar (Local Volunteer)"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Originating Mesh Node ID</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={originNodeId}
                  onChange={(e) => setOriginNodeId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Disaster / Emergency Type</label>
              <select
                value={emergencyType}
                onChange={(e) => setEmergencyType(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
              >
                <option value="FLOOD">Flood / Water Surge</option>
                <option value="MEDICAL">Medical Emergency / Trauma</option>
                <option value="STRUCTURAL_COLLAPSE">Structural Collapse / Trap</option>
                <option value="FIRE">Wildfire / Structural Fire</option>
                <option value="SEARCH_AND_RESCUE">Search and Rescue</option>
                <option value="SUPPLIES">Emergency Life-Support Supplies</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Triage Severity</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as UrgencyLevel)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500 font-semibold"
              >
                <option value="CRITICAL" className="text-red-400">CRITICAL (Immediate Life Threat)</option>
                <option value="HIGH" className="text-orange-400">HIGH (Urgent Care Required)</option>
                <option value="MEDIUM" className="text-amber-400">MEDIUM (Stable / Trapped)</option>
                <option value="LOW" className="text-emerald-400">LOW (Supplies / Informational)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                Victims Count
              </label>
              <input
                type="number"
                min="1"
                value={victimCount}
                onChange={(e) => setVictimCount(parseInt(e.target.value) || 1)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                Latitude
              </label>
              <input
                type="number"
                step="0.0001"
                value={latitude}
                onChange={(e) => setLatitude(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                Longitude
              </label>
              <input
                type="number"
                step="0.0001"
                value={longitude}
                onChange={(e) => setLongitude(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1">
              <HeartPulse className="w-3.5 h-3.5 text-red-400" />
              Specific Medical or Equipment Needs
            </label>
            <input
              type="text"
              value={medicalNeeds}
              onChange={(e) => setMedicalNeeds(e.target.value)}
              placeholder="e.g. Tourniquet, saline drip, oxygen cylinder, portable stretcher"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Disaster Site Notes & Hazards</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Access road flooded. People stranded on 2nd floor balcony near water tower."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-500 rounded-lg shadow-lg shadow-red-900/40 flex items-center gap-2 transition-all disabled:opacity-50"
            >
              <Radio className="w-4 h-4 animate-pulse" />
              {loading ? 'Transmitting...' : 'Broadcast Distress Alert'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
