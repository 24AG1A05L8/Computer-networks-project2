import React, { useState } from 'react';
import {
  Smartphone,
  ShieldAlert,
  Radio,
  Wifi,
  Bluetooth,
  Users,
  BookOpen,
  Inbox,
  AlertTriangle,
  MapPin,
  Settings,
  ChevronRight,
  ArrowLeft,
  CheckCircle2,
  Send,
  HeartPulse,
} from 'lucide-react';
import { SosAlertRecord } from '../types/dashboard';

interface CitizenMobileViewProps {
  onBroadcastSos: (data: any) => Promise<void>;
  alerts: SosAlertRecord[];
  isDarkTheme: boolean;
}

export const CitizenMobileView: React.FC<CitizenMobileViewProps> = ({
  onBroadcastSos,
  alerts,
  isDarkTheme,
}) => {
  const [mobileScreen, setMobileScreen] = useState<
    'dashboard' | 'sos' | 'radar' | 'messages' | 'emergency_info' | 'profile' | 'network'
  >('dashboard');

  // SOS Form state & validation
  const [sosCategory, setSosCategory] = useState('MEDICAL');
  const [sosDescription, setSosDescription] = useState('');
  const [sosPeople, setSosPeople] = useState('1');
  const [sosInjuries, setSosInjuries] = useState('');
  const [sosLocationShare, setSosLocationShare] = useState(true);
  const [sosAdditional, setSosAdditional] = useState('');

  const [sosDescError, setSosDescError] = useState(false);
  const [sosPeopleError, setSosPeopleError] = useState(false);
  const [sosFeedback, setSosFeedback] = useState(false);

  // Profile state
  const [userName, setUserName] = useState('Arjun Varma');
  const [userPhone, setUserPhone] = useState('+91 97000 12345');
  const [userBlood, setUserBlood] = useState('O+');
  const [profileSaved, setProfileSaved] = useState(false);

  // Messaging state
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{ sender: string; text: string; time: string; hop: number }>>([
    { sender: 'EOC Command', text: 'Taskforce deployed near Musi bridge. Maintain position.', time: '10:02', hop: 1 },
    { sender: 'Volunteer-017', text: 'Boats arriving on northern canal bank.', time: '10:05', hop: 2 },
  ]);

  const handleSosSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const hasDescErr = !sosDescription.trim();
    const count = parseInt(sosPeople);
    const hasPeopleErr = isNaN(count) || count < 1;

    setSosDescError(hasDescErr);
    setSosPeopleError(hasPeopleErr);

    if (hasDescErr || hasPeopleErr) return;

    await onBroadcastSos({
      senderName: userName,
      emergencyType: sosCategory,
      severity: 'CRITICAL',
      victimCount: count,
      medicalNeeds: sosInjuries,
      notes: `${sosDescription} • ${sosAdditional}`,
      latitude: sosLocationShare ? 17.3616 : 0,
      longitude: sosLocationShare ? 78.4747 : 0,
      originNodeId: 'NODE-CIV-MOBILE-APP',
    });

    setSosFeedback(true);
    setTimeout(() => {
      setSosFeedback(false);
      setSosDescription('');
      setSosInjuries('');
      setSosAdditional('');
      setMobileScreen('dashboard');
    }, 2000);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setChatMessages((prev) => [
      ...prev,
      {
        sender: 'You (Citizen)',
        text: chatInput.trim(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        hop: 0,
      },
    ]);
    setChatInput('');
  };

  return (
    <div className="flex flex-col items-center justify-center py-4">
      {/* Phone Hardware Mockup Shell */}
      <div className="w-full max-w-[400px] bg-slate-950 border-[10px] border-slate-800 rounded-[44px] shadow-2xl overflow-hidden flex flex-col h-[740px] relative ring-1 ring-slate-700">
        {/* Dynamic Island / Speaker Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-5 w-28 bg-slate-800 rounded-b-xl z-30 flex items-center justify-center">
          <div className="w-3 h-3 rounded-full bg-slate-950/80 mr-2" />
          <div className="w-8 h-1 rounded-full bg-slate-900" />
        </div>

        {/* Screen Content Container */}
        <div className="flex-1 bg-slate-900 text-slate-100 flex flex-col overflow-y-auto pt-6 text-xs selection:bg-red-500 selection:text-white">
          {/* ================= SCREEN: CITIZEN DASHBOARD ================= */}
          {mobileScreen === 'dashboard' && (
            <div className="p-4 space-y-4">
              {/* User profile row */}
              <div className="flex items-center justify-between">
                <div
                  className="flex items-center gap-2 cursor-pointer"
                  onClick={() => setMobileScreen('profile')}
                >
                  <div className="w-9 h-9 rounded-full bg-sky-600 flex items-center justify-center font-bold text-white text-sm">
                    {userName.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-xs">{userName}</h4>
                    <span className="text-[10px] text-slate-400">Node: NODE-CIV-MOBILE</span>
                  </div>
                </div>

                <button
                  onClick={() => setMobileScreen('network')}
                  className="p-1.5 bg-slate-800 rounded-lg hover:bg-slate-700 text-slate-300"
                  title="Network Status"
                >
                  <Settings className="w-4 h-4" />
                </button>
              </div>

              {/* Hardware Radio Status Bar */}
              <div
                className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between cursor-pointer"
                onClick={() => setMobileScreen('network')}
              >
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Offline Mesh Armed
                  </span>
                </div>
                <div className="flex items-center gap-2 text-slate-400 text-[10px]">
                  <Bluetooth className="w-3.5 h-3.5 text-sky-400" />
                  <Wifi className="w-3.5 h-3.5 text-purple-400" />
                </div>
              </div>

              {/* Nearby Discovery Status */}
              <div
                className="bg-sky-950/40 border border-sky-800/40 p-3 rounded-xl flex items-center justify-between cursor-pointer"
                onClick={() => setMobileScreen('radar')}
              >
                <div className="flex items-center gap-2">
                  <Radio className="w-4 h-4 text-sky-400 animate-pulse" />
                  <div>
                    <span className="font-bold text-white text-[11px]">4 Nearby Mesh Peers</span>
                    <p className="text-[10px] text-slate-400">Relaying via BLE & Wi-Fi Direct</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>

              {/* Giant Red SOS Trigger Button */}
              <button
                onClick={() => setMobileScreen('sos')}
                className="w-full bg-gradient-to-b from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 p-6 rounded-2xl shadow-xl shadow-red-950/60 flex flex-col items-center justify-center gap-2 transition-transform active:scale-95 text-white"
              >
                <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
                  <AlertTriangle className="w-8 h-8 text-white" />
                </div>
                <span className="text-xl font-black tracking-wider">EMERGENCY SOS</span>
                <span className="text-[11px] text-red-100 text-center">
                  Instant distress beacon broadcast to all nearby nodes
                </span>
              </button>

              {/* Quick Actions Grid */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setMobileScreen('messages')}
                  className="bg-slate-950 border border-slate-800 p-3 rounded-xl text-left hover:bg-slate-850"
                >
                  <Inbox className="w-4 h-4 text-emerald-400 mb-1" />
                  <span className="font-bold text-white text-xs block">Messages</span>
                  <span className="text-[10px] text-slate-400">{chatMessages.length} P2P packets</span>
                </button>

                <button
                  onClick={() => setMobileScreen('emergency_info')}
                  className="bg-slate-950 border border-slate-800 p-3 rounded-xl text-left hover:bg-slate-850"
                >
                  <BookOpen className="w-4 h-4 text-amber-400 mb-1" />
                  <span className="font-bold text-white text-xs block">Survival Guides</span>
                  <span className="text-[10px] text-slate-400">First aid & manuals</span>
                </button>
              </div>

              {/* Recent Mesh Feed */}
              <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl space-y-2">
                <span className="font-bold text-white text-[11px] block">Recent Mesh Broadcasts</span>
                {alerts.slice(0, 2).map((a) => (
                  <div key={a.alertId} className="border-t border-slate-800 pt-2 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-slate-200 block text-[11px]">
                        {a.emergencyType} • {a.senderName}
                      </span>
                      <span className="text-[10px] text-slate-500">{a.status} • {a.hopCount} hops</span>
                    </div>
                    <span className="text-[10px] font-bold text-red-400">{a.severity}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= SCREEN: EMERGENCY SOS FORM ================= */}
          {mobileScreen === 'sos' && (
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <button onClick={() => setMobileScreen('dashboard')} className="p-1 text-slate-400 hover:text-white">
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <h4 className="font-black text-white text-sm">Broadcast Emergency SOS</h4>
              </div>

              {sosFeedback && (
                <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-400 font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>SOS queued in Room DB & broadcasting!</span>
                </div>
              )}

              <form onSubmit={handleSosSubmit} className="space-y-3">
                <div>
                  <label className="block text-slate-400 text-[11px] font-bold mb-1">Emergency Category *</label>
                  <select
                    value={sosCategory}
                    onChange={(e) => setSosCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white text-xs"
                  >
                    <option value="MEDICAL">Medical Emergency</option>
                    <option value="FLOOD">Flood Surge</option>
                    <option value="FIRE">Wildfire</option>
                    <option value="STRUCTURAL_COLLAPSE">Building Collapse</option>
                    <option value="SEARCH_AND_RESCUE">Search & Rescue</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 text-[11px] font-bold mb-1">Situation Description *</label>
                  <textarea
                    rows={2}
                    value={sosDescription}
                    onChange={(e) => {
                      setSosDescription(e.target.value);
                      if (e.target.value.trim()) setSosDescError(false);
                    }}
                    placeholder="Describe emergency, danger, landmarks..."
                    className={`w-full bg-slate-950 border rounded-lg px-2.5 py-1.5 text-white text-xs ${
                      sosDescError ? 'border-red-500' : 'border-slate-800'
                    }`}
                  />
                  {sosDescError && <p className="text-red-500 text-[10px] mt-0.5">Description is required.</p>}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-400 text-[11px] font-bold mb-1">People Trapped *</label>
                    <input
                      type="number"
                      min="1"
                      value={sosPeople}
                      onChange={(e) => {
                        setSosPeople(e.target.value);
                        if (parseInt(e.target.value) > 0) setSosPeopleError(false);
                      }}
                      className={`w-full bg-slate-950 border rounded-lg px-2.5 py-1.5 text-white text-xs ${
                        sosPeopleError ? 'border-red-500' : 'border-slate-800'
                      }`}
                    />
                    {sosPeopleError && <p className="text-red-500 text-[10px] mt-0.5">Min 1 person.</p>}
                  </div>

                  <div>
                    <label className="block text-slate-400 text-[11px] font-bold mb-1">GPS Sharing</label>
                    <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 p-1.5 rounded-lg">
                      <input
                        type="checkbox"
                        checked={sosLocationShare}
                        onChange={(e) => setSosLocationShare(e.target.checked)}
                      />
                      <span className="text-[10px] text-slate-300">Share GPS</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 text-[11px] font-bold mb-1">Injury / Medical Requisitions</label>
                  <input
                    type="text"
                    value={sosInjuries}
                    onChange={(e) => setSosInjuries(e.target.value)}
                    placeholder="e.g. Burns, fracture, oxygen cylinder"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 text-[11px] font-bold mb-1">Additional Hazards</label>
                  <input
                    type="text"
                    value={sosAdditional}
                    onChange={(e) => setSosAdditional(e.target.value)}
                    placeholder="e.g. Broken glass, gas leak"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white text-xs"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-black rounded-xl shadow-lg shadow-red-900/40 text-xs mt-2"
                >
                  BROADCAST SOS OVER MESH
                </button>
              </form>
            </div>
          )}

          {/* ================= SCREEN: MESSAGING ================= */}
          {mobileScreen === 'messages' && (
            <div className="p-4 flex flex-col h-full">
              <div className="flex items-center gap-2 mb-3">
                <button onClick={() => setMobileScreen('dashboard')} className="p-1 text-slate-400 hover:text-white">
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <h4 className="font-bold text-white text-sm">Offline Mesh Chat</h4>
              </div>

              <div className="flex-1 space-y-2 overflow-y-auto mb-3">
                {chatMessages.map((m, i) => (
                  <div key={i} className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                      <span className="font-bold text-sky-400">{m.sender}</span>
                      <span>{m.time} • Hop {m.hop}</span>
                    </div>
                    <p className="text-white text-xs">{m.text}</p>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Type message to relay..."
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-white text-xs focus:outline-none"
                />
                <button type="submit" className="px-3 bg-sky-600 text-white rounded-lg font-bold">
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          )}

          {/* ================= SCREEN: NEARBY RADAR ================= */}
          {mobileScreen === 'radar' && (
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <button onClick={() => setMobileScreen('dashboard')} className="p-1 text-slate-400 hover:text-white">
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <h4 className="font-bold text-white text-sm">Nearby Mesh Radar</h4>
              </div>

              <div className="space-y-2">
                {[
                  { id: 'GATEWAY-BASE-01', role: 'GATEWAY', rssi: -58, bat: 98 },
                  { id: 'NODE-MEDIC-009', role: 'MEDIC', rssi: -65, bat: 82 },
                  { id: 'NODE-RESP-003', role: 'FIRST_RESPONDER', rssi: -71, bat: 91 },
                  { id: 'NODE-CIV-042', role: 'CIVILIAN', rssi: -79, bat: 44 },
                ].map((node) => (
                  <div key={node.id} className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-white block text-xs">{node.id}</span>
                      <span className="text-[10px] text-slate-400">{node.role} • {node.rssi} dBm</span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-400">{node.bat}% power</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= SCREEN: EMERGENCY INFO ================= */}
          {mobileScreen === 'emergency_info' && (
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <button onClick={() => setMobileScreen('dashboard')} className="p-1 text-slate-400 hover:text-white">
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <h4 className="font-bold text-white text-sm">Offline Survival Guides</h4>
              </div>

              <div className="space-y-2">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="font-bold text-red-400 block text-xs">Hands-Only CPR</span>
                  <p className="text-[11px] text-slate-300 mt-1">
                    Push hard and fast in center of chest at 100-120 beats per minute until help arrives.
                  </p>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="font-bold text-orange-400 block text-xs">Severe Bleeding</span>
                  <p className="text-[11px] text-slate-300 mt-1">
                    Apply firm direct pressure. If limb arterial spurting persists, place tourniquet 2 inches above wound.
                  </p>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="font-bold text-sky-400 block text-xs">Flash Flood Safety</span>
                  <p className="text-[11px] text-slate-300 mt-1">
                    Never walk through moving water. Retreat to upper floors; do not trap yourself in closed attics.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ================= SCREEN: USER PROFILE ================= */}
          {mobileScreen === 'profile' && (
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <button onClick={() => setMobileScreen('dashboard')} className="p-1 text-slate-400 hover:text-white">
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <h4 className="font-bold text-white text-sm">Edit Emergency Profile</h4>
              </div>

              {profileSaved && (
                <div className="p-2 bg-emerald-500/20 border border-emerald-500/40 rounded-lg text-emerald-400 text-[11px] font-bold">
                  Saved to Room Database!
                </div>
              )}

              <div className="space-y-2 text-xs">
                <div>
                  <label className="block text-slate-400 text-[10px] mb-1">Full Name</label>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 text-[10px] mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={userPhone}
                    onChange={(e) => setUserPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 text-[10px] mb-1">Blood Group</label>
                  <input
                    type="text"
                    value={userBlood}
                    onChange={(e) => setUserBlood(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white"
                  />
                </div>

                <button
                  onClick={() => {
                    setProfileSaved(true);
                    setTimeout(() => setProfileSaved(false), 2000);
                  }}
                  className="w-full py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-lg text-xs mt-2"
                >
                  Save Profile Changes
                </button>
              </div>
            </div>
          )}

          {/* ================= SCREEN: NETWORK STATUS ================= */}
          {mobileScreen === 'network' && (
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <button onClick={() => setMobileScreen('dashboard')} className="p-1 text-slate-400 hover:text-white">
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <h4 className="font-bold text-white text-sm">Hardware Network Status</h4>
              </div>

              <div className="space-y-2">
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <span className="font-bold text-white block text-xs">Cellular Uplink</span>
                  <span className="text-[10px] text-amber-400">OFFLINE (Delay-Tolerant Mesh Mode)</span>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <span className="font-bold text-white block text-xs">Bluetooth Low Energy</span>
                  <span className="text-[10px] text-emerald-400">ACTIVE • UUID 0000FEAA</span>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <span className="font-bold text-white block text-xs">Wi-Fi Direct Socket</span>
                  <span className="text-[10px] text-purple-400">LISTENING • Port 8888</span>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <span className="font-bold text-white block text-xs">Room DTN Queue</span>
                  <span className="text-[10px] text-sky-400">4 Bundles Buffered</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Hardware Home Indicator Bar */}
        <div className="py-2 bg-slate-950 flex justify-center">
          <div className="w-28 h-1 bg-slate-700 rounded-full cursor-pointer" onClick={() => setMobileScreen('dashboard')} />
        </div>
      </div>
    </div>
  );
};
