import { Router, Request, Response } from 'express';
import {
  getSosAlerts,
  upsertSosAlert,
  updateSosStatus,
  deleteSosAlert,
  getMeshNodes,
  recordPeerNode,
  recordBundleAndAudit,
  getSyncAuditLogs,
  getAllUsers,
  registerUser,
  updateUserRole,
  updateUserStatus,
  getActivityLogs,
  getAdminStats,
  getDownstreamDispatches,
  recordDownstreamDispatch,
  recordActivity,
} from '../db/repository.ts';
import { SyncBatchRequest, SyncBatchResponse, SosAlertPayload, MeshBundle } from '../mesh-protocol/types.ts';
import { verifyBundleIntegrity, signOutgoingBundle } from '../mesh-protocol/crypto.ts';
import { optionalAuth } from '../middleware/auth.ts';

export const apiRouter = Router();

// 1. Health check & capabilities
apiRouter.get('/system/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ONLINE',
    system: 'SahaayaNet Command Gateway',
    timestamp: Date.now(),
    version: '2.0.0-phase2',
    capabilities: [
      'BLE_NEARBY_DISCOVERY',
      'WIFI_DIRECT_P2P',
      'DTN_STORE_CARRY_FORWARD',
      'ROOM_OFFLINE_PERSISTENCE',
      'POSTGRESQL_CLOUD_SQL_SYNC',
      'RESPONDER_DISPATCH_TRIAGE',
      'ADMIN_INCIDENT_MANAGEMENT',
    ],
  });
});

// 2. Fetch all SOS emergency alerts
apiRouter.get('/sos/alerts', async (req: Request, res: Response) => {
  try {
    const alerts = await getSosAlerts();
    const severityFilter = req.query.severity as string | undefined;
    const statusFilter = req.query.status as string | undefined;

    let filtered = alerts;
    if (severityFilter && severityFilter !== 'ALL') {
      filtered = filtered.filter((a) => a.severity === severityFilter);
    }
    if (statusFilter && statusFilter !== 'ALL') {
      filtered = filtered.filter((a) => a.status === statusFilter);
    }

    res.json({
      success: true,
      count: filtered.length,
      alerts: filtered,
    });
  } catch (error: any) {
    console.error('Error fetching SOS alerts:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch SOS alerts' });
  }
});

// 3. Post a new emergency alert (from field gateway, phone app, or operator)
apiRouter.post('/sos/alerts', optionalAuth, async (req: Request, res: Response) => {
  try {
    const payload: SosAlertPayload = req.body;
    if (!payload.alertId || !payload.emergencyType || !payload.location) {
      return res.status(400).json({ error: 'Missing required SOS alert fields' });
    }

    const saved = await upsertSosAlert(payload, req.body.originNodeId || 'GATEWAY-MANUAL', 0);
    res.status(201).json({ success: true, alert: saved });
  } catch (error: any) {
    console.error('Error creating SOS alert:', error);
    res.status(500).json({ error: error.message || 'Failed to record SOS alert' });
  }
});

// 4. Update status and dispatch responders
apiRouter.patch('/sos/alerts/:alertId/status', async (req: Request, res: Response) => {
  try {
    const { alertId } = req.params;
    const { status, dispatchedResponder, actor } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const updated = await updateSosStatus(alertId, status, dispatchedResponder, actor || 'Responder EOC');
    if (!updated) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    res.json({ success: true, alert: updated });
  } catch (error: any) {
    console.error('Error updating SOS status:', error);
    res.status(500).json({ error: error.message || 'Failed to update SOS alert status' });
  }
});

// 5. Delete or archive emergency alert
apiRouter.delete('/sos/alerts/:alertId', async (req: Request, res: Response) => {
  try {
    const { alertId } = req.params;
    await deleteSosAlert(alertId);
    res.json({ success: true, message: `Alert ${alertId} archived` });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to delete alert' });
  }
});

// 6. Mesh topology & nodes
apiRouter.get('/mesh/nodes', async (_req: Request, res: Response) => {
  try {
    const nodes = await getMeshNodes();
    res.json({
      success: true,
      count: nodes.length,
      nodes,
    });
  } catch (error: any) {
    console.error('Error fetching mesh nodes:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch mesh nodes' });
  }
});

// 7. Online Synchronization Endpoint
apiRouter.post('/sync/mesh-bundle', optionalAuth, async (req: Request, res: Response) => {
  try {
    const syncReq: SyncBatchRequest = req.body;
    if (!syncReq.gatewayNodeId || !Array.isArray(syncReq.bundles)) {
      return res.status(400).json({ error: 'Invalid sync batch payload' });
    }

    let persistedSosCount = 0;
    const ackedBundleIds: string[] = [];

    for (const bundle of syncReq.bundles) {
      ackedBundleIds.push(bundle.header.bundleId);

      // Verify cryptographic packet integrity if checksum is provided
      if (bundle.header.checksum) {
        const isTamperFree = verifyBundleIntegrity(bundle);
        if (!isTamperFree) {
          console.warn(`[SECURITY] Bundle ${bundle.header.bundleId} checksum mismatch. Potential tamper or packet corruption.`);
        }
      }

      if (bundle.header.payloadType === 'SOS_ALERT') {
        const alertPayload = bundle.payload as SosAlertPayload;
        await upsertSosAlert(
          alertPayload,
          bundle.header.originNodeId,
          bundle.header.hopCount
        );
        persistedSosCount++;
      }
    }

    if (Array.isArray(syncReq.observedPeers)) {
      for (const peer of syncReq.observedPeers) {
        await recordPeerNode(peer);
      }
    }

    await recordBundleAndAudit(syncReq.bundles, syncReq.gatewayNodeId, req.ip);

    // Fetch any downstream dispatches / emergency directives for the field node to carry into the offline mesh
    const downstreamBundles = getDownstreamDispatches();

    const syncResponse: SyncBatchResponse = {
      success: true,
      processedBundles: syncReq.bundles.length,
      persistedSosAlerts: persistedSosCount,
      newDispatchesForMesh: downstreamBundles,
      acknowledgedBundleIds: ackedBundleIds,
      serverTimestamp: Date.now(),
    };

    res.status(200).json(syncResponse);
  } catch (error: any) {
    console.error('Sync batch error:', error);
    res.status(500).json({ error: error.message || 'Synchronization failed' });
  }
});

// 7b. Downstream DTN direct endpoint for mesh nodes checking for responder updates
apiRouter.get('/sync/downstream-bundles', async (req: Request, res: Response) => {
  try {
    const since = req.query.since ? parseInt(req.query.since as string, 10) : undefined;
    const bundles = getDownstreamDispatches(since);
    res.json({
      success: true,
      count: bundles.length,
      bundles,
      serverTimestamp: Date.now(),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch downstream bundles' });
  }
});

// 7c. Post an Emergency Broadcast Directive from EOC to spread across the mesh
apiRouter.post('/sync/emergency-broadcast', async (req: Request, res: Response) => {
  try {
    const { title, message, category, priority } = req.body;
    if (!title || !message) {
      return res.status(400).json({ error: 'Title and message are required' });
    }

    const bundleId = `BND-EOC-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
    const createdTimestamp = Date.now();
    const signedBundle = signOutgoingBundle(
      {
        version: 1,
        bundleId,
        originNodeId: 'COMMAND_EOC',
        destinationNodeId: 'BROADCAST',
        hopCount: 0,
        maxHops: 7,
        timeToLiveSeconds: 86400,
        createdTimestamp,
        priority: priority || 1,
        payloadType: 'STATUS_UPDATE',
      },
      {
        title,
        message,
        category: category || 'GENERAL_ADVISORY',
        issuedBy: req.body.issuedBy || 'Emergency Operations Command',
        timestamp: createdTimestamp,
      }
    );

    recordDownstreamDispatch(signedBundle);
    recordActivity(
      req.body.issuedBy || 'EOC Commander',
      'ADMIN',
      'BROADCAST_ISSUED',
      `Issued downstream mesh broadcast: "${title}"`,
      'CRITICAL'
    );

    res.status(201).json({
      success: true,
      bundle: signedBundle,
      message: 'Emergency directive signed and queued for downstream mesh distribution',
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to queue emergency broadcast' });
  }
});

// 8. Sync Audit Logs
apiRouter.get('/sync/audit-logs', async (_req: Request, res: Response) => {
  try {
    const logs = await getSyncAuditLogs();
    res.json({ success: true, logs });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch sync audit logs' });
  }
});

// =================== Administrator Dashboard Endpoints ===================

// 9. Real Statistics Summary
apiRouter.get('/admin/stats', async (_req: Request, res: Response) => {
  try {
    const stats = await getAdminStats();
    res.json({ success: true, stats });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to compute admin statistics' });
  }
});

// 10. User Management: List Users
apiRouter.get('/admin/users', async (req: Request, res: Response) => {
  try {
    const roleFilter = req.query.role as string | undefined;
    const all = await getAllUsers();
    const filtered = roleFilter && roleFilter !== 'ALL' ? all.filter((u) => u.role === roleFilter) : all;
    res.json({ success: true, count: filtered.length, users: filtered });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch users' });
  }
});

// 11. User Management: Register / Create User
apiRouter.post('/admin/users', async (req: Request, res: Response) => {
  try {
    const { name, email, phone, role, badgeNumber } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    const uid = req.body.uid || `USR-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
    const user = await registerUser({ uid, name, email, phone, role, badgeNumber });
    res.status(201).json({ success: true, user });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to register user' });
  }
});

// 12. User Management: Update Role & Badge
apiRouter.patch('/admin/users/:uid/role', async (req: Request, res: Response) => {
  try {
    const { uid } = req.params;
    const { role, badgeNumber } = req.body;
    if (!role) {
      return res.status(400).json({ error: 'Role is required' });
    }
    const updated = await updateUserRole(uid, role, badgeNumber);
    if (!updated) return res.status(404).json({ error: 'User not found' });
    res.json({ success: true, user: updated });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to update user role' });
  }
});

// 13. User Management: Update Status (Active / Suspended)
apiRouter.patch('/admin/users/:uid/status', async (req: Request, res: Response) => {
  try {
    const { uid } = req.params;
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }
    const updated = await updateUserStatus(uid, status);
    if (!updated) return res.status(404).json({ error: 'User not found' });
    res.json({ success: true, user: updated });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to update user status' });
  }
});

// 14. Activity Audit Logs
apiRouter.get('/admin/activity-logs', async (_req: Request, res: Response) => {
  try {
    const activities = await getActivityLogs();
    res.json({ success: true, count: activities.length, activities });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch activity logs' });
  }
});
