/**
 * SahaayaNet Emergency Mesh Protocol & DTN Packet Definitions
 * Spec version: 1.0.0
 */

export type UrgencyLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type AlertStatus = 'PENDING' | 'DISPATCHED' | 'IN_PROGRESS' | 'RESOLVED';

export type NodeRole = 'CIVILIAN' | 'FIRST_RESPONDER' | 'MEDIC' | 'GATEWAY' | 'COMMAND_STATION';

export type PayloadType = 'SOS_ALERT' | 'STATUS_UPDATE' | 'DISPATCH_ORDER' | 'ACK' | 'HEARTBEAT';

export interface GeoLocation {
  latitude: number;
  longitude: number;
  accuracyMeters?: number;
  altitudeMeters?: number;
}

export interface SosAlertPayload {
  alertId: string;
  senderName: string;
  senderPhone?: string;
  emergencyType: 'MEDICAL' | 'FIRE' | 'FLOOD' | 'STRUCTURAL_COLLAPSE' | 'SEARCH_AND_RESCUE' | 'SUPPLIES';
  severity: UrgencyLevel;
  victimCount: number;
  medicalNeeds: string;
  notes: string;
  location: GeoLocation;
  timestamp: number;
}

export interface MeshPacketHeader {
  version: number;
  bundleId: string;
  originNodeId: string;
  destinationNodeId: string; // "BROADCAST" or specific node ID
  hopCount: number;
  maxHops: number;
  timeToLiveSeconds: number;
  createdTimestamp: number;
  priority: number; // 1 (Highest / SOS) to 10 (Lowest / Telemetry)
  payloadType: PayloadType;
  checksum: string;
}

export interface MeshBundle {
  header: MeshPacketHeader;
  payload: SosAlertPayload | Record<string, unknown>;
  hopsRecord: Array<{
    nodeId: string;
    transferredAt: number;
    rssi?: number;
    bearer: 'BLE' | 'WIFI_DIRECT';
  }>;
}

export interface MeshPeerNode {
  nodeId: string;
  role: NodeRole;
  bleMacAddress: string;
  wifiDirectAddress?: string;
  batteryPercent: number;
  isGateway: boolean;
  lastSeenTimestamp: number;
  rssi: number;
  directHop: boolean;
  forwardedBundlesCount: number;
}

export interface SyncBatchRequest {
  gatewayNodeId: string;
  syncTimestamp: number;
  bundles: MeshBundle[];
  observedPeers: MeshPeerNode[];
}

export interface SyncBatchResponse {
  success: boolean;
  processedBundles: number;
  persistedSosAlerts: number;
  newDispatchesForMesh: MeshBundle[];
  acknowledgedBundleIds: string[];
  serverTimestamp: number;
}
