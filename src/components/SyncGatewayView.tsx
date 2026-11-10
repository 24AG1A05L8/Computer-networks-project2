import React, { useState, useEffect } from 'react';
import {
  CloudUpload,
  CheckCircle,
  Database,
  History,
  Send,
  Lock,
  Layers,
  Sparkles,
  Radio,
  ShieldCheck,
  AlertTriangle,
  ArrowDownCircle,
  FileText,
} from 'lucide-react';
import { SyncAuditRecord } from '../types/dashboard';

interface SyncGatewayViewProps {
  auditLogs: SyncAuditRecord[];
  onTriggerSyncBatch: (customPayload?: any) => Promise<any>;
  onSendBroadcast?: (broadcastData: { title: string; message: string; category?: string; priority?: number }) => Promise<any>;
}

export const SyncGatewayView: React.FC<SyncGatewayViewProps> = ({
  auditLogs,
  onTriggerSyncBatch,
  onSendBroadcast,
}) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<any | null>(null);
  const [testVictimName, setTestVictimName] = useState('Deepak Chawla');
  const [testEmergencyType, setTestEmergencyType] = useState('STRUCTURAL_COLLAPSE');
  const [testVictims, setTestVictims] = useState(4);
  const [testMedicalNeeds, setTestMedicalNeeds] = useState('Heavy lifting jacks, emergency trauma bandages');

  // Emergency Broadcast Form State
  const [broadcastTitle, setBroadcastTitle] = useState('Severe Flash Flood Warning - Evacuate Low Ground');
  const [broadcastMessage, setBroadcastMessage] = useState('All residents near riverbank move to Government High School relief camp immediately.');
  const [broadcastCategory, setBroadcastCategory] = useState('EVACUATION_DIRECTIVE');
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastStatus, setBroadcastStatus] = useState<string | null>(null);

  // Downstream bundles list
  const [downstreamBundles, setDownstreamBundles] = useState<any[]>([]);

  const fetchDownstreamBundles = async () => {
    try {
      const res = await fetch('/api/sync/downstream-bundles');
      if (res.ok) {
        const data = await res.json();
        setDownstreamBundles(data.bundles || []);
      }
    } catch (err) {
      console.error('Failed to fetch downstream bundles:', err);
    }
  };

  useEffect(() => {
    fetchDownstreamBundles();
  }, []);

  const handleRunSyncSimulation = async () => {
    setIsSyncing(true);
    setSyncResult(null);

    const syntheticBundle = {
      header: {
        version: 1,
        bundleId: `BND-SIM-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
        originNodeId: 'NODE-CIV-MOBILE-09',
        destinationNodeId: 'BROADCAST_COMMAND',
        hopCount: 3,
        maxHops: 7,
        timeToLiveSeconds: 86400,
        createdTimestamp: Date.now() - 3600000,
        priority: 1,
        payloadType: 'SOS_ALERT',
        checksum: 'sha256-verified-hmac-authenticated',
      },
      payload: {
        alertId: `SOS-SYNC-${Date.now()}`,
        senderName: testVictimName,
        emergencyType: testEmergencyType,
        severity: 'CRITICAL',
        victimCount: testVictims,
        medicalNeeds: testMedicalNeeds,
        notes: 'Carried 3 hops through offline peer mesh and uploaded upon gateway cellular handshake.',
        location: {
          latitude: 17.391,
          longitude: 78.472,
        },
        timestamp: Date.now() - 3600000,
      },
      hopsRecord: [
        { nodeId: 'NODE-CIV-MOBILE-09', transferredAt: Date.now() - 3600000, bearer: 'BLE' },
        { nodeId: 'NODE-VOLUNTEER-017', transferredAt: Date.now() - 2400000, bearer: 'WIFI_DIRECT' },
        { nodeId: 'GATEWAY-BASE-01', transferredAt: Date.now() - 60000, bearer: 'BLE' },
      ],
    };

    const payload = {
      gatewayNodeId: 'GATEWAY-BASE-01',
      syncTimestamp: Date.now(),
      bundles: [syntheticBundle],
      observedPeers: [
        {
          nodeId: 'NODE-CIV-MOBILE-09',
          role: 'CIVILIAN',
          bleMacAddress: 'DC:A6:32:91:EE:11',
          wifiDirectAddress: null,
          batteryPercent: 78,
          isGateway: false,
          lastSeenTimestamp: Date.now() - 60000,
          rssi: -62,
          directHop: true,
          forwardedBundlesCount: 14,
        },
      ],
    };

    try {
      const response = await onTriggerSyncBatch(payload);
      setSyncResult(response);
      await fetchDownstreamBundles();
    } catch (err: any) {
      setSyncResult({ error: err.message || 'Sync failed' });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleIssueBroadcast = async () => {
    if (!broadcastTitle || !broadcastMessage) return;
    setIsBroadcasting(true);
    setBroadcastStatus(null);
    try {
      if (onSendBroadcast) {
        await onSendBroadcast({
          title: broadcastTitle,
          message: broadcastMessage,
          category: broadcastCategory,
          priority: 1,
        });
        setBroadcastStatus('Broadcast successfully signed with SHA-256 and queued for downstream mesh distribution!');
        setBroadcastTitle('');
        setBroadcastMessage('');
        await fetchDownstreamBundles();
      } else {
        const res = await fetch('/api/sync/emergency-broadcast', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: broadcastTitle,
            message: broadcastMessage,
            category: broadcastCategory,
            priority: 1,
          }),
        });
        if (res.ok) {
          setBroadcastStatus('Broadcast successfully signed with SHA-256 and queued for downstream mesh distribution!');
          setBroadcastTitle('');
          setBroadcastMessage('');
          await fetchDownstreamBundles();
        }
      }
    } catch (err: any) {
      setBroadcastStatus(`Broadcast failed: ${err.message}`);
    } finally {
      setIsBroadcasting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Gateway Overview */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg">
                <CloudUpload className="w-4 h-4" />
              </span>
              <h3 className="text-base font-bold text-white">Online Synchronization & Return Channel Gateway</h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Bi-directional store-carry-forward bridge: Ingests distress packets into Cloud SQL and transmits EOC directives back into the offline mesh.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-slate-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>SHA-256 Cryptographic Digest</span>
            </div>
            <div className="flex items-center gap-2 text-xs bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-slate-300">
              <Database className="w-3.5 h-3.5 text-sky-400" />
              <span>PostgreSQL Cloud SQL</span>
            </div>
          </div>
        </div>

        {/* Live sync interactive simulator */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
          {/* UPLINK TRANSMITTER */}
          <div className="lg:col-span-6 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Send className="w-3.5 h-3.5 text-sky-400" />
              Field Gateway Sync Transmitter (Simulate Gateway Handshake)
            </h4>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Victim Name in DTN Bundle</label>
                <input
                  type="text"
                  value={testVictimName}
                  onChange={(e) => setTestVictimName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Emergency Category</label>
                  <select
                    value={testEmergencyType}
                    onChange={(e) => setTestEmergencyType(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-sky-500"
                  >
                    <option value="STRUCTURAL_COLLAPSE">Structural Collapse</option>
                    <option value="FLOOD">Flood Surge</option>
                    <option value="FIRE">Wildfire</option>
                    <option value="MEDICAL">Medical Emergency</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Victim Count</label>
                  <input
                    type="number"
                    min="1"
                    value={testVictims}
                    onChange={(e) => setTestVictims(parseInt(e.target.value) || 1)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Medical Needs Requisition</label>
                <input
                  type="text"
                  value={testMedicalNeeds}
                  onChange={(e) => setTestMedicalNeeds(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <button
                onClick={handleRunSyncSimulation}
                disabled={isSyncing}
                className="w-full py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-lg shadow-lg shadow-sky-900/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-2"
              >
                <Sparkles className="w-4 h-4" />
                {isSyncing ? 'Transmitting Batch to /api/sync/mesh-bundle...' : 'Execute Gateway Sync Batch'}
              </button>
            </div>
          </div>

          {/* Sync Response / Telemetry console */}
          <div className="lg:col-span-6 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              Cloud SQL Ingestion Terminal
            </h4>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-[11px] h-64 overflow-y-auto text-slate-300">
              <p className="text-slate-500">// SahaayaNet Gateway Uplink Socket Terminal</p>
              <p className="text-emerald-400 mt-1">[POST] /api/sync/mesh-bundle initialized</p>
              <p className="text-slate-400">Endpoint: /api/sync/mesh-bundle</p>
              <p className="text-slate-400">Routing algorithm: Delay-Tolerant Epidemic DTN</p>
              <p className="text-slate-400">Database dialect: Cloud SQL PostgreSQL</p>
              <p className="text-slate-400">Integrity: SHA-256 HMAC timing-safe validation</p>

              {syncResult && (
                <div className="mt-3 pt-3 border-t border-slate-800">
                  <p className="text-sky-400 font-bold">» Batch Processed Successfully:</p>
                  <pre className="text-slate-300 mt-1 whitespace-pre-wrap">
                    {JSON.stringify(syncResult, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* DOWNSTREAM DIRECTIVE INJECTION (RETURN CHANNEL) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
        <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-3">
          <Radio className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            EOC Downstream Mesh Broadcast (Return Channel Injector)
          </h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 space-y-3 text-xs">
            <p className="text-slate-400">
              Broadcasts emergency evacuation notices, medical supply drops, or safe zone coordinates.
              Connected field nodes automatically carry these signed directives back into the offline mesh!
            </p>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Directive Title</label>
              <input
                type="text"
                value={broadcastTitle}
                onChange={(e) => setBroadcastTitle(e.target.value)}
                placeholder="e.g. Helicopter Airdrop Scheduled at Sector 4"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Directive Category</label>
                <select
                  value={broadcastCategory}
                  onChange={(e) => setBroadcastCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="EVACUATION_DIRECTIVE">Evacuation Order</option>
                  <option value="RELIEF_CAMP">Relief Camp Active</option>
                  <option value="MEDICAL_DROP">Medical Airdrop Point</option>
                  <option value="WATER_DISTRIBUTION">Water Relief Center</option>
                  <option value="GENERAL_ADVISORY">General Public Advisory</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Priority Level</label>
                <div className="px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-amber-400 font-bold">
                  CRITICAL (Priority 1)
                </div>
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Full Message Body</label>
              <textarea
                rows={3}
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                placeholder="Detailed instructions for offline citizens and first responders..."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            {broadcastStatus && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-300 text-xs">
                {broadcastStatus}
              </div>
            )}

            <button
              onClick={handleIssueBroadcast}
              disabled={isBroadcasting || !broadcastTitle || !broadcastMessage}
              className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-lg shadow-lg shadow-amber-900/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              <Radio className="w-4 h-4" />
              {isBroadcasting ? 'Signing & Injecting Directive...' : 'Sign & Broadcast Downstream into Mesh'}
            </button>
          </div>

          {/* ACTIVE DOWNSTREAM DIRECTIVES LIST */}
          <div className="lg:col-span-6 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <ArrowDownCircle className="w-3.5 h-3.5 text-amber-400" />
              Active Directives Propagating in Mesh ({downstreamBundles.length})
            </h4>

            <div className="bg-slate-950 rounded-xl border border-slate-800 p-3 max-h-64 overflow-y-auto space-y-2 text-xs">
              {downstreamBundles.length === 0 ? (
                <p className="text-slate-500 text-center py-6">No downstream directives currently propagating.</p>
              ) : (
                downstreamBundles.map((b, idx) => (
                  <div key={idx} className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-amber-400 text-[10px] font-bold">
                        {b.header?.bundleId || `BUNDLE-${idx}`}
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300">
                        {b.header?.payloadType}
                      </span>
                    </div>
                    <p className="text-slate-200 font-medium">
                      {b.payload?.title || b.payload?.directive || `Alert ${b.payload?.alertId} update`}
                    </p>
                    {b.payload?.message && (
                      <p className="text-slate-400 text-[11px] line-clamp-2">{b.payload.message}</p>
                    )}
                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                      <span>Origin: {b.header?.originNodeId}</span>
                      <span className="font-mono">TTL: {b.header?.timeToLiveSeconds}s</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sync Audit History */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
        <div className="flex items-center gap-2 mb-4">
          <History className="w-4 h-4 text-purple-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Gateway Synchronization Audit Trail</h3>
        </div>

        {auditLogs.length === 0 ? (
          <p className="text-slate-500 text-xs py-4 text-center">No synchronization sessions recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Session ID</th>
                  <th className="px-4 py-3">Gateway Node ID</th>
                  <th className="px-4 py-3">Bundles Ingested</th>
                  <th className="px-4 py-3">Client IP Address</th>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-850">
                    <td className="px-4 py-3 font-mono text-slate-400">#{log.id}</td>
                    <td className="px-4 py-3 font-mono font-semibold text-sky-400">{log.gatewayNodeId}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 font-bold">
                        {log.bundlesSynced} packets
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-400">{log.clientIp || '127.0.0.1'}</td>
                    <td className="px-4 py-3 text-slate-400">
                      {new Date(log.syncedAt).toLocaleTimeString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1 text-emerald-400 text-[11px] font-semibold">
                        <CheckCircle className="w-3 h-3" />
                        COMMITTED_TO_SQL
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
