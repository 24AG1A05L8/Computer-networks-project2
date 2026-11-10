export type UrgencyLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type AlertStatus = 'PENDING' | 'DISPATCHED' | 'IN_PROGRESS' | 'RESOLVED';

export type UserRole = 'admin' | 'first_responder' | 'medic' | 'citizen';

export interface SosAlertRecord {
  id: number;
  alertId: string;
  senderName: string;
  senderPhone?: string | null;
  emergencyType: string;
  severity: UrgencyLevel;
  status: AlertStatus;
  victimCount: number;
  medicalNeeds: string | null;
  notes: string | null;
  latitude: number;
  longitude: number;
  originNodeId: string;
  hopCount: number;
  dispatchedResponder: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MeshNodeRecord {
  id: number;
  nodeId: string;
  role: string;
  bleAddress: string;
  wifiDirectAddress: string | null;
  batteryPercent: number;
  isGateway: boolean;
  lastSeenTimestamp: number;
  forwardedBundlesCount: number;
  updatedAt: string;
}

export interface SyncAuditRecord {
  id: number;
  gatewayNodeId: string;
  bundlesSynced: number;
  nodesObserved: number;
  clientIp: string | null;
  syncedAt: string;
}

export interface UserRecord {
  id: number;
  uid: string;
  name: string | null;
  email: string;
  phone: string | null;
  role: string | null;
  badgeNumber: string | null;
  status: string | null;
  createdAt: string | null;
}

export interface ActivityLogRecord {
  id: number;
  actorName: string;
  actorRole: string;
  actionType: string;
  details: string;
  severity: string | null;
  timestamp: string | null;
}

export interface AdminStats {
  totalRegisteredUsers: number;
  activeResponders: number;
  totalEmergencyRequests: number;
  pendingRequests: number;
  activeRescues: number;
  resolvedRequests: number;
  meshNodesCount: number;
}
