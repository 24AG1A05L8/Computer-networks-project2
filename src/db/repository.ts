import { db } from './index.ts';
import { sosAlerts, meshNodes, meshBundles, syncAuditLogs, users, activityLogs } from './schema.ts';
import { desc, eq } from 'drizzle-orm';
import { SosAlertPayload, MeshPeerNode, MeshBundle } from '../mesh-protocol/types.ts';

// In-memory fallback caches for disaster resilience or when SQL proxy is establishing connection
const fallbackAlerts = new Map<string, typeof sosAlerts.$inferSelect>();
const fallbackNodes = new Map<string, typeof meshNodes.$inferSelect>();
const fallbackBundles = new Map<string, typeof meshBundles.$inferSelect>();
const fallbackAuditLogs: Array<typeof syncAuditLogs.$inferSelect> = [];
const fallbackUsers = new Map<string, typeof users.$inferSelect>();
const fallbackActivities: Array<typeof activityLogs.$inferSelect> = [];

// Seed initial users for Administrator & Responder dashboard testing
const initialUsers: Array<typeof users.$inferInsert> = [
  {
    uid: 'USR-CMD-01',
    email: 'eoc.commander@sahaayanet.org',
    name: 'Major Vikram Sen (Retd.)',
    phone: '+91 98490 11223',
    role: 'admin',
    badgeNumber: 'EOC-CMD-01',
    status: 'ACTIVE',
  },
  {
    uid: 'USR-RESP-02',
    email: 'dr.anita.rao@sahaayanet.org',
    name: 'Dr. Anita Rao',
    phone: '+91 98490 44556',
    role: 'medic',
    badgeNumber: 'MEDIC-SURGE-04',
    status: 'ACTIVE',
  },
  {
    uid: 'USR-RESP-03',
    email: 'karthik.disasterunit@sahaayanet.org',
    name: 'Karthik Subramanian',
    phone: '+91 98490 77889',
    role: 'first_responder',
    badgeNumber: 'RESCUE-LEAD-09',
    status: 'ACTIVE',
  },
  {
    uid: 'USR-CIT-04',
    email: 'arjun.varma@gmail.com',
    name: 'Arjun Varma',
    phone: '+91 97000 12345',
    role: 'citizen',
    badgeNumber: undefined,
    status: 'ACTIVE',
  },
];

const initialActivities: Array<typeof activityLogs.$inferInsert> = [
  {
    actorName: 'System Bootloader',
    actorRole: 'SYSTEM',
    actionType: 'SYSTEM_STARTUP',
    details: 'SahaayaNet Command Node online. BLE & Wi-Fi Direct DTN buffer armed.',
    severity: 'INFO',
  },
  {
    actorName: 'NODE-CIV-042',
    actorRole: 'CITIZEN',
    actionType: 'SOS_CREATED',
    details: 'New SOS Alert SOS-2026-HYD-001 (Flash flood near Musi river) relayed over 3 hops.',
    severity: 'CRITICAL',
  },
  {
    actorName: 'GATEWAY-BASE-01',
    actorRole: 'GATEWAY',
    actionType: 'GATEWAY_SYNCED',
    details: 'Cellular uplink recovered. Synchronized 1 DTN bundle batch to PostgreSQL Cloud SQL.',
    severity: 'INFO',
  },
];

// Initialize users
initialUsers.forEach((u, i) => {
  fallbackUsers.set(u.uid, {
    id: i + 1,
    uid: u.uid,
    email: u.email,
    name: u.name || null,
    phone: u.phone || null,
    role: u.role || 'citizen',
    badgeNumber: u.badgeNumber || null,
    status: u.status || 'ACTIVE',
    createdAt: new Date(Date.now() - (10 - i) * 3600000),
  });
});

// Initialize activities
initialActivities.forEach((act, i) => {
  fallbackActivities.push({
    id: i + 1,
    actorName: act.actorName,
    actorRole: act.actorRole,
    actionType: act.actionType,
    details: act.details,
    severity: act.severity || 'INFO',
    timestamp: new Date(Date.now() - (5 - i) * 600000),
  });
});

// Initial alerts
const initialSosAlerts: Array<typeof sosAlerts.$inferInsert> = [
  {
    alertId: 'SOS-2026-HYD-001',
    senderName: 'Arjun Varma',
    senderPhone: '+91 97000 12345',
    emergencyType: 'FLOOD',
    severity: 'CRITICAL',
    status: 'PENDING',
    victimCount: 6,
    medicalNeeds: 'Diabetic patient requiring cold storage insulin, 1 infant',
    notes: 'Ground floor submerged by flash flood near Musi river. Cut off from main road.',
    latitude: 17.3616,
    longitude: 78.4747,
    originNodeId: 'NODE-CIV-042',
    hopCount: 3,
    dispatchedResponder: null,
  },
  {
    alertId: 'SOS-2026-HYD-002',
    senderName: 'Sister Teresa Clinic',
    senderPhone: '+91 98490 22334',
    emergencyType: 'MEDICAL',
    severity: 'HIGH',
    status: 'DISPATCHED',
    victimCount: 14,
    medicalNeeds: 'Trauma kits, clean bandages, portable generator fuel',
    notes: 'Power grid collapsed. Backup generator failing in 4 hours.',
    latitude: 17.385,
    longitude: 78.4867,
    originNodeId: 'NODE-MEDIC-009',
    hopCount: 2,
    dispatchedResponder: 'Rapid Response Team Alpha (Dr. Rao)',
  },
  {
    alertId: 'SOS-2026-HYD-003',
    senderName: 'Kavita Menon',
    senderPhone: '+91 98490 33445',
    emergencyType: 'STRUCTURAL_COLLAPSE',
    severity: 'CRITICAL',
    status: 'IN_PROGRESS',
    victimCount: 3,
    medicalNeeds: 'Hydraulic spreader required. 1 person pinned by concrete slab.',
    notes: 'Old commercial complex eastern wing collapse. Hearing faint responses.',
    latitude: 17.44,
    longitude: 78.3489,
    originNodeId: 'NODE-CIV-088',
    hopCount: 4,
    dispatchedResponder: 'Disaster Taskforce Unit 4',
  },
  {
    alertId: 'SOS-2026-HYD-004',
    senderName: 'Priya Sharma',
    senderPhone: '+91 98490 44556',
    emergencyType: 'SEARCH_AND_RESCUE',
    severity: 'MEDIUM',
    status: 'RESOLVED',
    victimCount: 2,
    medicalNeeds: 'Mild hypothermia, dehydration',
    notes: 'Stranded hikers located near lake reservoir ridge.',
    latitude: 17.412,
    longitude: 78.423,
    originNodeId: 'NODE-VOLUNTEER-017',
    hopCount: 1,
    dispatchedResponder: 'Community Volunteer Brigade 2',
  },
];

initialSosAlerts.forEach((a, i) => {
  fallbackAlerts.set(a.alertId, {
    id: i + 1,
    alertId: a.alertId,
    senderName: a.senderName,
    senderPhone: a.senderPhone || null,
    emergencyType: a.emergencyType,
    severity: a.severity,
    status: a.status || 'PENDING',
    victimCount: a.victimCount || 1,
    medicalNeeds: a.medicalNeeds || null,
    notes: a.notes || null,
    latitude: a.latitude,
    longitude: a.longitude,
    originNodeId: a.originNodeId,
    hopCount: a.hopCount || 0,
    dispatchedResponder: a.dispatchedResponder || null,
    createdAt: new Date(Date.now() - (4 - i) * 1800000),
    updatedAt: new Date(Date.now() - (4 - i) * 1800000),
  });
});

const initialMeshNodes: Array<typeof meshNodes.$inferInsert> = [
  {
    nodeId: 'GATEWAY-BASE-01',
    role: 'GATEWAY',
    bleAddress: 'C4:4E:AC:01:88:FF',
    wifiDirectAddress: '192.168.49.1',
    batteryPercent: 98,
    isGateway: true,
    lastSeenTimestamp: Date.now(),
    forwardedBundlesCount: 142,
  },
  {
    nodeId: 'NODE-MEDIC-009',
    role: 'MEDIC',
    bleAddress: 'E2:15:3A:4C:90:12',
    wifiDirectAddress: '192.168.49.4',
    batteryPercent: 82,
    isGateway: false,
    lastSeenTimestamp: Date.now() - 45000,
    forwardedBundlesCount: 68,
  },
  {
    nodeId: 'NODE-CIV-042',
    role: 'CIVILIAN',
    bleAddress: 'F0:11:88:7B:33:02',
    wifiDirectAddress: undefined,
    batteryPercent: 44,
    isGateway: false,
    lastSeenTimestamp: Date.now() - 120000,
    forwardedBundlesCount: 19,
  },
  {
    nodeId: 'NODE-RESP-003',
    role: 'FIRST_RESPONDER',
    bleAddress: 'A8:9C:ED:22:51:7E',
    wifiDirectAddress: '192.168.49.9',
    batteryPercent: 91,
    isGateway: false,
    lastSeenTimestamp: Date.now() - 15000,
    forwardedBundlesCount: 89,
  },
  {
    nodeId: 'NODE-VOLUNTEER-017',
    role: 'CIVILIAN',
    bleAddress: 'B2:44:66:88:AA:CC',
    wifiDirectAddress: undefined,
    batteryPercent: 67,
    isGateway: false,
    lastSeenTimestamp: Date.now() - 180000,
    forwardedBundlesCount: 31,
  },
];

initialMeshNodes.forEach((n, i) => {
  fallbackNodes.set(n.nodeId, {
    id: i + 1,
    nodeId: n.nodeId,
    role: n.role,
    bleAddress: n.bleAddress,
    wifiDirectAddress: n.wifiDirectAddress || null,
    batteryPercent: n.batteryPercent || 100,
    isGateway: n.isGateway || false,
    lastSeenTimestamp: n.lastSeenTimestamp,
    forwardedBundlesCount: n.forwardedBundlesCount || 0,
    updatedAt: new Date(),
  });
});

// SOS Alerts repository methods
export async function getSosAlerts() {
  try {
    const records = await db.select().from(sosAlerts).orderBy(desc(sosAlerts.createdAt));
    if (records.length > 0) return records;
    return Array.from(fallbackAlerts.values());
  } catch (err) {
    console.warn('Falling back to memory store for getSosAlerts:', (err as Error).message);
    return Array.from(fallbackAlerts.values());
  }
}

export async function upsertSosAlert(payload: SosAlertPayload, originNodeId: string, hopCount: number) {
  try {
    const existing = await db.select().from(sosAlerts).where(eq(sosAlerts.alertId, payload.alertId));
    if (existing.length > 0) {
      const updated = await db
        .update(sosAlerts)
        .set({
          victimCount: payload.victimCount,
          medicalNeeds: payload.medicalNeeds,
          notes: payload.notes,
          hopCount: Math.min(existing[0].hopCount ?? 999, hopCount),
          updatedAt: new Date(),
        })
        .where(eq(sosAlerts.alertId, payload.alertId))
        .returning();
      recordActivity(payload.senderName, 'CITIZEN', 'SOS_UPDATED', `Updated details for ${payload.alertId}`, 'INFO');
      return updated[0];
    } else {
      const created = await db
        .insert(sosAlerts)
        .values({
          alertId: payload.alertId,
          senderName: payload.senderName,
          senderPhone: payload.senderPhone,
          emergencyType: payload.emergencyType,
          severity: payload.severity,
          status: 'PENDING',
          victimCount: payload.victimCount,
          medicalNeeds: payload.medicalNeeds,
          notes: payload.notes,
          latitude: payload.location.latitude,
          longitude: payload.location.longitude,
          originNodeId,
          hopCount,
        })
        .returning();
      recordActivity(payload.senderName, 'CITIZEN', 'SOS_CREATED', `Broadcast new ${payload.severity} SOS: ${payload.emergencyType}`, 'CRITICAL');
      return created[0];
    }
  } catch (err) {
    console.warn('Falling back to memory store for upsertSosAlert:', (err as Error).message);
    const existing = fallbackAlerts.get(payload.alertId);
    if (existing) {
      existing.victimCount = payload.victimCount;
      existing.medicalNeeds = payload.medicalNeeds;
      existing.notes = payload.notes;
      existing.updatedAt = new Date();
      return existing;
    }
    const newRecord: typeof sosAlerts.$inferSelect = {
      id: fallbackAlerts.size + 1,
      alertId: payload.alertId,
      senderName: payload.senderName,
      senderPhone: payload.senderPhone || null,
      emergencyType: payload.emergencyType,
      severity: payload.severity,
      status: 'PENDING',
      victimCount: payload.victimCount,
      medicalNeeds: payload.medicalNeeds,
      notes: payload.notes,
      latitude: payload.location.latitude,
      longitude: payload.location.longitude,
      originNodeId,
      hopCount,
      dispatchedResponder: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    fallbackAlerts.set(payload.alertId, newRecord);
    recordActivity(payload.senderName, 'CITIZEN', 'SOS_CREATED', `Broadcast new ${payload.severity} SOS: ${payload.emergencyType}`, 'CRITICAL');
    return newRecord;
  }
}

export async function updateSosStatus(alertId: string, status: string, dispatchedResponder?: string, actor: string = 'Responder Operations') {
  try {
    const updated = await db
      .update(sosAlerts)
      .set({
        status,
        ...(dispatchedResponder ? { dispatchedResponder } : {}),
        updatedAt: new Date(),
      })
      .where(eq(sosAlerts.alertId, alertId))
      .returning();
    if (updated.length > 0) {
      recordActivity(actor, 'RESPONDER', 'STATUS_UPDATED', `Alert ${alertId} updated to ${status}${dispatchedResponder ? ` (Assigned to: ${dispatchedResponder})` : ''}`, 'INFO');
      return updated[0];
    }
  } catch (err) {
    console.warn('Falling back to memory store for updateSosStatus:', (err as Error).message);
  }

  const downstreamBundle: MeshBundle = {
    header: {
      version: 1,
      bundleId: `BND-DISP-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      originNodeId: 'COMMAND_EOC',
      destinationNodeId: 'BROADCAST',
      hopCount: 0,
      maxHops: 7,
      timeToLiveSeconds: 86400,
      createdTimestamp: Date.now(),
      priority: 1,
      payloadType: 'STATUS_UPDATE',
      checksum: `eoc-sig-${Date.now()}`,
    },
    payload: {
      alertId,
      status,
      dispatchedResponder,
      updatedAt: Date.now(),
    },
    hopsRecord: [{ nodeId: 'COMMAND_EOC', transferredAt: Date.now(), bearer: 'BLE' }],
  };
  recordDownstreamDispatch(downstreamBundle);

  const inMem = fallbackAlerts.get(alertId);
  if (inMem) {
    inMem.status = status;
    if (dispatchedResponder) inMem.dispatchedResponder = dispatchedResponder;
    inMem.updatedAt = new Date();
    recordActivity(actor, 'RESPONDER', 'STATUS_UPDATED', `Alert ${alertId} updated to ${status}${dispatchedResponder ? ` (Assigned to: ${dispatchedResponder})` : ''}`, 'INFO');
    return inMem;
  }
  return null;
}

export async function deleteSosAlert(alertId: string) {
  try {
    await db.delete(sosAlerts).where(eq(sosAlerts.alertId, alertId));
  } catch (err) {
    console.warn('Memory delete for deleteSosAlert:', (err as Error).message);
  }
  fallbackAlerts.delete(alertId);
  recordActivity('Administrator', 'ADMIN', 'ALERT_ARCHIVED', `Archived alert ${alertId}`, 'WARNING');
  return true;
}

// User management repository methods
export async function getAllUsers() {
  try {
    const records = await db.select().from(users).orderBy(desc(users.createdAt));
    if (records.length > 0) return records;
    return Array.from(fallbackUsers.values());
  } catch (err) {
    return Array.from(fallbackUsers.values());
  }
}

export async function registerUser(userData: {
  uid: string;
  name: string;
  email: string;
  phone?: string;
  role?: string;
  badgeNumber?: string;
}) {
  try {
    const created = await db
      .insert(users)
      .values({
        uid: userData.uid,
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        role: userData.role || 'citizen',
        badgeNumber: userData.badgeNumber,
        status: 'ACTIVE',
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          name: userData.name,
          phone: userData.phone,
          ...(userData.role ? { role: userData.role } : {}),
          ...(userData.badgeNumber ? { badgeNumber: userData.badgeNumber } : {}),
        },
      })
      .returning();
    recordActivity(userData.name, userData.role?.toUpperCase() || 'CITIZEN', 'USER_REGISTERED', `User registered with callsign/ID ${userData.uid}`, 'INFO');
    return created[0];
  } catch (err) {
    console.warn('Fallback memory for registerUser:', (err as Error).message);
    const existing = fallbackUsers.get(userData.uid);
    if (existing) {
      existing.name = userData.name;
      if (userData.phone) existing.phone = userData.phone;
      if (userData.role) existing.role = userData.role;
      if (userData.badgeNumber) existing.badgeNumber = userData.badgeNumber;
      return existing;
    }
    const newRecord: typeof users.$inferSelect = {
      id: fallbackUsers.size + 1,
      uid: userData.uid,
      name: userData.name,
      email: userData.email,
      phone: userData.phone || null,
      role: userData.role || 'citizen',
      badgeNumber: userData.badgeNumber || null,
      status: 'ACTIVE',
      createdAt: new Date(),
    };
    fallbackUsers.set(userData.uid, newRecord);
    recordActivity(userData.name, userData.role?.toUpperCase() || 'CITIZEN', 'USER_REGISTERED', `User registered with callsign/ID ${userData.uid}`, 'INFO');
    return newRecord;
  }
}

export async function updateUserRole(uid: string, role: string, badgeNumber?: string) {
  try {
    const updated = await db
      .update(users)
      .set({
        role,
        ...(badgeNumber ? { badgeNumber } : {}),
      })
      .where(eq(users.uid, uid))
      .returning();
    if (updated.length > 0) {
      recordActivity('Administrator', 'ADMIN', 'USER_ROLE_CHANGED', `Changed role of user ${uid} to ${role}`, 'INFO');
      return updated[0];
    }
  } catch (err) {
    console.warn('Fallback memory for updateUserRole:', (err as Error).message);
  }
  const u = fallbackUsers.get(uid);
  if (u) {
    u.role = role;
    if (badgeNumber) u.badgeNumber = badgeNumber;
    recordActivity('Administrator', 'ADMIN', 'USER_ROLE_CHANGED', `Changed role of user ${uid} to ${role}`, 'INFO');
    return u;
  }
  return null;
}

export async function updateUserStatus(uid: string, status: string) {
  try {
    const updated = await db
      .update(users)
      .set({ status })
      .where(eq(users.uid, uid))
      .returning();
    if (updated.length > 0) {
      recordActivity('Administrator', 'ADMIN', 'USER_STATUS_CHANGED', `Changed status of user ${uid} to ${status}`, 'WARNING');
      return updated[0];
    }
  } catch (err) {
    console.warn('Fallback memory for updateUserStatus:', (err as Error).message);
  }
  const u = fallbackUsers.get(uid);
  if (u) {
    u.status = status;
    recordActivity('Administrator', 'ADMIN', 'USER_STATUS_CHANGED', `Changed status of user ${uid} to ${status}`, 'WARNING');
    return u;
  }
  return null;
}

// Activity logs repository methods
export async function getActivityLogs() {
  try {
    const records = await db.select().from(activityLogs).orderBy(desc(activityLogs.timestamp)).limit(50);
    if (records.length > 0) return records;
    return fallbackActivities.slice(-50).reverse();
  } catch (err) {
    return fallbackActivities.slice(-50).reverse();
  }
}

export async function recordActivity(actorName: string, actorRole: string, actionType: string, details: string, severity: string = 'INFO') {
  try {
    await db.insert(activityLogs).values({
      actorName,
      actorRole,
      actionType,
      details,
      severity,
    });
  } catch (err) {
    fallbackActivities.push({
      id: fallbackActivities.length + 1,
      actorName,
      actorRole,
      actionType,
      details,
      severity,
      timestamp: new Date(),
    });
  }
}

// Real statistics calculation for Administrator Dashboard
export async function getAdminStats() {
  const allAlerts = await getSosAlerts();
  const allUsersList = await getAllUsers();
  const allNodesList = await getMeshNodes();

  const totalRegisteredUsers = allUsersList.length;
  const activeResponders = allUsersList.filter(
    (u) => (u.role === 'first_responder' || u.role === 'medic') && u.status === 'ACTIVE'
  ).length;
  const totalEmergencyRequests = allAlerts.length;
  const pendingRequests = allAlerts.filter((a) => a.status === 'PENDING').length;
  const activeRescues = allAlerts.filter((a) => a.status === 'DISPATCHED' || a.status === 'IN_PROGRESS').length;
  const resolvedRequests = allAlerts.filter((a) => a.status === 'RESOLVED').length;
  const meshNodesCount = allNodesList.length;

  return {
    totalRegisteredUsers,
    activeResponders,
    totalEmergencyRequests,
    pendingRequests,
    activeRescues,
    resolvedRequests,
    meshNodesCount,
  };
}

// Mesh nodes repository methods
export async function getMeshNodes() {
  try {
    const records = await db.select().from(meshNodes).orderBy(desc(meshNodes.lastSeenTimestamp));
    if (records.length > 0) return records;
    return Array.from(fallbackNodes.values());
  } catch (err) {
    console.warn('Falling back to memory store for getMeshNodes:', (err as Error).message);
    return Array.from(fallbackNodes.values());
  }
}

export async function recordPeerNode(peer: MeshPeerNode) {
  try {
    const existing = await db.select().from(meshNodes).where(eq(meshNodes.nodeId, peer.nodeId));
    if (existing.length > 0) {
      await db
        .update(meshNodes)
        .set({
          batteryPercent: peer.batteryPercent,
          lastSeenTimestamp: peer.lastSeenTimestamp,
          forwardedBundlesCount: peer.forwardedBundlesCount,
          updatedAt: new Date(),
        })
        .where(eq(meshNodes.nodeId, peer.nodeId));
    } else {
      await db.insert(meshNodes).values({
        nodeId: peer.nodeId,
        role: peer.role,
        bleAddress: peer.bleMacAddress,
        wifiDirectAddress: peer.wifiDirectAddress,
        batteryPercent: peer.batteryPercent,
        isGateway: peer.isGateway,
        lastSeenTimestamp: peer.lastSeenTimestamp,
        forwardedBundlesCount: peer.forwardedBundlesCount,
      });
    }
  } catch (err) {
    fallbackNodes.set(peer.nodeId, {
      id: fallbackNodes.size + 1,
      nodeId: peer.nodeId,
      role: peer.role,
      bleAddress: peer.bleMacAddress,
      wifiDirectAddress: peer.wifiDirectAddress || null,
      batteryPercent: peer.batteryPercent,
      isGateway: peer.isGateway,
      lastSeenTimestamp: peer.lastSeenTimestamp,
      forwardedBundlesCount: peer.forwardedBundlesCount,
      updatedAt: new Date(),
    });
  }
}

export async function recordBundleAndAudit(
  bundles: MeshBundle[],
  gatewayNodeId: string,
  clientIp?: string
) {
  try {
    for (const b of bundles) {
      await db
        .insert(meshBundles)
        .values({
          bundleId: b.header.bundleId,
          originNodeId: b.header.originNodeId,
          destinationNodeId: b.header.destinationNodeId,
          payloadType: b.header.payloadType,
          priority: b.header.priority,
          hopCount: b.header.hopCount,
          maxHops: b.header.maxHops,
          timeToLiveSeconds: b.header.timeToLiveSeconds,
          rawPayloadJson: JSON.stringify(b.payload),
          rawHopsJson: JSON.stringify(b.hopsRecord),
        })
        .onConflictDoNothing();
    }

    await db.insert(syncAuditLogs).values({
      gatewayNodeId,
      bundlesSynced: bundles.length,
      nodesObserved: 0,
      clientIp: clientIp || '127.0.0.1',
    });
  } catch (err) {
    bundles.forEach((b) => {
      fallbackBundles.set(b.header.bundleId, {
        id: fallbackBundles.size + 1,
        bundleId: b.header.bundleId,
        originNodeId: b.header.originNodeId,
        destinationNodeId: b.header.destinationNodeId,
        payloadType: b.header.payloadType,
        priority: b.header.priority,
        hopCount: b.header.hopCount,
        maxHops: b.header.maxHops,
        timeToLiveSeconds: b.header.timeToLiveSeconds,
        rawPayloadJson: JSON.stringify(b.payload),
        rawHopsJson: JSON.stringify(b.hopsRecord),
        syncedAt: new Date(),
      });
    });
    fallbackAuditLogs.push({
      id: fallbackAuditLogs.length + 1,
      gatewayNodeId,
      bundlesSynced: bundles.length,
      nodesObserved: 0,
      clientIp: clientIp || '127.0.0.1',
      syncedAt: new Date(),
    });
  }
}

export async function getSyncAuditLogs() {
  try {
    const logs = await db.select().from(syncAuditLogs).orderBy(desc(syncAuditLogs.syncedAt)).limit(20);
    if (logs.length > 0) return logs;
    return fallbackAuditLogs.slice(-20).reverse();
  } catch (err) {
    return fallbackAuditLogs.slice(-20).reverse();
  }
}

// Downstream DTN Return Channel (EOC Dispatches and Instructions carried into mesh)
const downstreamDispatches: MeshBundle[] = [
  {
    header: {
      version: 1,
      bundleId: 'BND-CMD-BROADCAST-01',
      originNodeId: 'COMMAND_EOC',
      destinationNodeId: 'BROADCAST',
      hopCount: 0,
      maxHops: 7,
      timeToLiveSeconds: 86400,
      createdTimestamp: Date.now() - 3600000,
      priority: 1,
      payloadType: 'STATUS_UPDATE',
      checksum: 'eoc-signed-digest-001',
    },
    payload: {
      alertId: 'SOS-2026-HYD-002',
      status: 'DISPATCHED',
      dispatchedResponder: 'Rapid Response Team Alpha (Dr. Rao)',
      directive: 'Medical team en route with trauma kits and fuel',
    },
    hopsRecord: [{ nodeId: 'COMMAND_EOC', transferredAt: Date.now() - 3600000, bearer: 'BLE' }],
  },
];

export function getDownstreamDispatches(sinceTimestamp?: number): MeshBundle[] {
  if (!sinceTimestamp) return [...downstreamDispatches];
  return downstreamDispatches.filter((b) => b.header.createdTimestamp >= sinceTimestamp);
}

export function recordDownstreamDispatch(bundle: MeshBundle) {
  downstreamDispatches.push(bundle);
}

