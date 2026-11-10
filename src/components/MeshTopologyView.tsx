import React, { useState } from 'react';
import {
  Radio,
  Wifi,
  Bluetooth,
  Battery,
  Shield,
  Activity,
  Layers,
  ArrowRightLeft,
  Server,
  Zap,
} from 'lucide-react';
import { MeshNodeRecord } from '../types/dashboard';

interface MeshTopologyViewProps {
  nodes: MeshNodeRecord[];
}

export const MeshTopologyView: React.FC<MeshTopologyViewProps> = ({ nodes }) => {
  const [selectedNode, setSelectedNode] = useState<MeshNodeRecord | null>(nodes[0] || null);

  // Layout positions for nodes on SVG canvas
  const nodePositions: Record<string, { x: number; y: number }> = {
    'GATEWAY-BASE-01': { x: 400, y: 120 },
    'NODE-MEDIC-009': { x: 220, y: 220 },
    'NODE-CIV-042': { x: 140, y: 380 },
    'NODE-RESP-003': { x: 580, y: 240 },
    'NODE-VOLUNTEER-017': { x: 420, y: 400 },
  };

  // Static fallback position generator for dynamically added nodes
  const getNodePos = (nodeId: string, index: number) => {
    if (nodePositions[nodeId]) return nodePositions[nodeId];
    const angle = (index / Math.max(nodes.length, 1)) * 2 * Math.PI;
    return {
      x: 380 + Math.cos(angle) * 200,
      y: 280 + Math.sin(angle) * 160,
    };
  };

  const gatewayNodes = nodes.filter((n) => n.isGateway);
  const totalBundlesRelayed = nodes.reduce((acc, curr) => acc + (curr.forwardedBundlesCount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Topology summary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
            <span>Fleet Mesh Nodes</span>
            <Layers className="w-4 h-4 text-sky-400" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-white">{nodes.length} Active Nodes</div>
          <p className="text-[11px] text-slate-400 mt-1">BLE Beacons & Wi-Fi Direct Swarm</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
            <span>Online Gateways</span>
            <Server className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-white">{gatewayNodes.length} Up-links</div>
          <p className="text-[11px] text-emerald-400 mt-1">Ready for Cloud Sync</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
            <span>Store-Carry Deliveries</span>
            <ArrowRightLeft className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-white">{totalBundlesRelayed} Packets</div>
          <p className="text-[11px] text-slate-400 mt-1">Total DTN Relay Exchanges</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
            <span>Mesh Health</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-white">100% Operational</div>
          <p className="text-[11px] text-cyan-400 mt-1">Zero internet required</p>
        </div>
      </div>

      {/* Interactive Topology Graph & Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* SVG Mesh Visualizer */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-2">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Radio className="w-4 h-4 text-sky-400" />
                Live Peer Topology & Ad-Hoc Mesh Canvas
              </h3>
              <p className="text-xs text-slate-400">
                Visualizing Bluetooth Low Energy discovery circles and Wi-Fi Direct P2P sockets
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
                Gateway
              </span>
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-400 inline-block" />
                Medic / Responder
              </span>
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400 inline-block" />
                Civilian
              </span>
            </div>
          </div>

          <div className="w-full h-[450px] bg-slate-950/70 rounded-xl relative overflow-hidden border border-slate-800/60">
            {/* Background Grid Pattern */}
            <div
              className="absolute inset-0 opacity-15"
              style={{
                backgroundImage:
                  'radial-gradient(circle at 1px 1px, #38bdf8 1px, transparent 0)',
                backgroundSize: '24px 24px',
              }}
            />

            <svg className="w-full h-full" viewBox="0 0 800 500">
              {/* Mesh link lines */}
              <defs>
                <linearGradient id="linkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#a855f7" stopOpacity="0.6" />
                </linearGradient>
              </defs>

              {/* Draw connections between nodes */}
              {nodes.map((source, i) => {
                const sPos = getNodePos(source.nodeId, i);
                return nodes.slice(i + 1).map((target, j) => {
                  const tPos = getNodePos(target.nodeId, i + 1 + j);
                  const isConnected =
                    source.isGateway ||
                    target.isGateway ||
                    source.wifiDirectAddress !== null ||
                    Math.abs(sPos.x - tPos.x) < 260;

                  if (!isConnected) return null;

                  return (
                    <g key={`link-${source.nodeId}-${target.nodeId}`}>
                      <line
                        x1={sPos.x}
                        y1={sPos.y}
                        x2={tPos.x}
                        y2={tPos.y}
                        stroke="url(#linkGrad)"
                        strokeWidth="1.5"
                        strokeDasharray={source.wifiDirectAddress ? 'none' : '4,4'}
                        opacity="0.4"
                      />
                    </g>
                  );
                });
              })}

              {/* Draw Nodes */}
              {nodes.map((node, i) => {
                const pos = getNodePos(node.nodeId, i);
                const isSelected = selectedNode?.nodeId === node.nodeId;
                const isGateway = node.isGateway;
                const isMedicOrResp = node.role === 'MEDIC' || node.role === 'FIRST_RESPONDER';

                return (
                  <g
                    key={node.nodeId}
                    className="cursor-pointer transition-transform duration-200"
                    onClick={() => setSelectedNode(node)}
                  >
                    {/* Pulsing ring for gateway or selected node */}
                    {(isGateway || isSelected) && (
                      <circle
                        cx={pos.x}
                        cy={pos.y}
                        r="28"
                        fill="none"
                        stroke={isGateway ? '#34d399' : '#38bdf8'}
                        strokeWidth="1.5"
                        opacity="0.4"
                        className="animate-ping"
                      />
                    )}

                    {/* Radio Range Ring */}
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r="40"
                      fill={isGateway ? '#059669' : '#0284c7'}
                      fillOpacity="0.08"
                      stroke={isGateway ? '#10b981' : '#38bdf8'}
                      strokeWidth="0.75"
                      strokeDasharray="2,3"
                    />

                    {/* Node Core Circle */}
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={isGateway ? 20 : 16}
                      fill={isGateway ? '#059669' : isMedicOrResp ? '#0284c7' : '#334155'}
                      stroke={isSelected ? '#f8fafc' : isGateway ? '#34d399' : '#38bdf8'}
                      strokeWidth={isSelected ? 3 : 1.5}
                    />

                    {/* Node Icon or Letter */}
                    <text
                      x={pos.x}
                      y={pos.y + 4}
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize="10"
                      fontWeight="bold"
                    >
                      {isGateway ? 'GW' : node.role === 'MEDIC' ? 'MD' : node.role === 'FIRST_RESPONDER' ? 'FR' : 'CV'}
                    </text>

                    {/* Label below node */}
                    <text
                      x={pos.x}
                      y={pos.y + 32}
                      textAnchor="middle"
                      fill="#e2e8f0"
                      fontSize="10"
                      fontWeight="600"
                    >
                      {node.nodeId}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Selected Node Inspector */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
          <div className="border-b border-slate-800 pb-3 mb-4">
            <span className="text-[10px] uppercase font-mono text-sky-400">Mesh Telemetry & Heartbeat</span>
            <h3 className="text-lg font-bold text-white mt-0.5">
              {selectedNode ? selectedNode.nodeId : 'Select a Node'}
            </h3>
          </div>

          {selectedNode ? (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block mb-1">Network Role</span>
                  <span className="font-bold text-white">{selectedNode.role}</span>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block mb-1">Battery Power</span>
                  <span
                    className={`font-bold flex items-center gap-1 ${
                      selectedNode.batteryPercent > 20 ? 'text-emerald-400' : 'text-red-400'
                    }`}
                  >
                    <Battery className="w-3.5 h-3.5" />
                    {selectedNode.batteryPercent}%
                  </span>
                </div>
              </div>

              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Bluetooth className="w-3.5 h-3.5 text-blue-400" />
                    BLE Hardware MAC:
                  </span>
                  <code className="text-sky-300 font-mono text-[11px]">{selectedNode.bleAddress}</code>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Wifi className="w-3.5 h-3.5 text-purple-400" />
                    Wi-Fi Direct P2P:
                  </span>
                  <code className="text-slate-300 font-mono text-[11px]">
                    {selectedNode.wifiDirectAddress || 'Scanning / Standby'}
                  </code>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    Bundles Relayed:
                  </span>
                  <span className="text-white font-bold">{selectedNode.forwardedBundlesCount} hops</span>
                </div>
              </div>

              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400 block mb-1">Gateway Capability</span>
                {selectedNode.isGateway ? (
                  <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                    <Shield className="w-4 h-4" />
                    Internet Gateway Node (Cloud Uplink Enabled)
                  </div>
                ) : (
                  <p className="text-slate-400 text-[11px]">
                    Transit Node: Relays packets via Store-Carry-Forward epidemic protocol.
                  </p>
                )}
              </div>

              <div className="pt-2">
                <span className="text-slate-400 block mb-2 font-medium">All Discovered Mesh Peers:</span>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {nodes.map((n) => (
                    <button
                      key={n.nodeId}
                      onClick={() => setSelectedNode(n)}
                      className={`w-full text-left p-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                        selectedNode.nodeId === n.nodeId
                          ? 'bg-slate-800 text-sky-400 font-semibold border border-sky-500/50'
                          : 'bg-slate-950 text-slate-300 hover:bg-slate-850 border border-slate-800/80'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            n.isGateway ? 'bg-emerald-400' : 'bg-sky-400'
                          }`}
                        />
                        <span>{n.nodeId}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">{n.role}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-slate-500 text-xs">No node selected.</p>
          )}
        </div>
      </div>
    </div>
  );
};
