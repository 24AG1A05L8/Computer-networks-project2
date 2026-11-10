/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { DashboardLayout, DashboardTab } from './components/DashboardLayout.tsx';
import { ResponderDashboard } from './components/ResponderDashboard.tsx';
import { AdministratorDashboard } from './components/AdministratorDashboard.tsx';
import { CitizenMobileView } from './components/CitizenMobileView.tsx';
import { MeshTopologyView } from './components/MeshTopologyView.tsx';
import { SyncGatewayView } from './components/SyncGatewayView.tsx';
import { AndroidArchitectureHub } from './components/AndroidArchitectureHub.tsx';
import { NewSosModal } from './components/NewSosModal.tsx';
import {
  SosAlertRecord,
  MeshNodeRecord,
  SyncAuditRecord,
  UserRecord,
  ActivityLogRecord,
  AdminStats,
  AlertStatus,
} from './types/dashboard.ts';

export default function App() {
  const [currentTab, setCurrentTab] = useState<DashboardTab>('responder');
  const [isDarkTheme, setIsDarkTheme] = useState(true);

  const [alerts, setAlerts] = useState<SosAlertRecord[]>([]);
  const [nodes, setNodes] = useState<MeshNodeRecord[]>([]);
  const [usersList, setUsersList] = useState<UserRecord[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLogRecord[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [auditLogs, setAuditLogs] = useState<SyncAuditRecord[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch all real data from Node.js and PostgreSQL backend APIs
  const fetchDashboardData = useCallback(async () => {
    try {
      const [alertsRes, nodesRes, usersRes, actRes, statsRes, auditRes] = await Promise.all([
        fetch('/api/sos/alerts'),
        fetch('/api/mesh/nodes'),
        fetch('/api/admin/users'),
        fetch('/api/admin/activity-logs'),
        fetch('/api/admin/stats'),
        fetch('/api/sync/audit-logs'),
      ]);

      if (alertsRes.ok) {
        const data = await alertsRes.json();
        if (data.alerts) setAlerts(data.alerts);
      }
      if (nodesRes.ok) {
        const data = await nodesRes.json();
        if (data.nodes) setNodes(data.nodes);
      }
      if (usersRes.ok) {
        const data = await usersRes.json();
        if (data.users) setUsersList(data.users);
      }
      if (actRes.ok) {
        const data = await actRes.json();
        if (data.activities) setActivityLogs(data.activities);
      }
      if (statsRes.ok) {
        const data = await statsRes.json();
        if (data.stats) setStats(data.stats);
      }
      if (auditRes.ok) {
        const data = await auditRes.json();
        if (data.logs) setAuditLogs(data.logs);
      }
    } catch (err) {
      console.warn('Dashboard fetch warning:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 6000);
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  // Update alert status & assign responders
  const handleUpdateAlertStatus = async (alertId: string, status: AlertStatus, responder?: string) => {
    try {
      const res = await fetch(`/api/sos/alerts/${alertId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, dispatchedResponder: responder, actor: 'Operations Command' }),
      });
      if (res.ok) {
        await fetchDashboardData();
      }
    } catch (err) {
      console.error('Failed to update alert status:', err);
    }
  };

  // Archive / delete alert
  const handleDeleteAlert = async (alertId: string) => {
    try {
      const res = await fetch(`/api/sos/alerts/${alertId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        await fetchDashboardData();
      }
    } catch (err) {
      console.error('Failed to delete alert:', err);
    }
  };

  // Create new SOS distress broadcast
  const handleCreateSos = async (data: any) => {
    const alertId = `SOS-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
    const payload = {
      alertId,
      senderName: data.senderName,
      emergencyType: data.emergencyType,
      severity: data.severity,
      victimCount: data.victimCount,
      medicalNeeds: data.medicalNeeds,
      notes: data.notes,
      location: {
        latitude: data.latitude,
        longitude: data.longitude,
      },
      originNodeId: data.originNodeId,
      timestamp: Date.now(),
    };

    const res = await fetch('/api/sos/alerts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      await fetchDashboardData();
    }
  };

  // Register personnel (Admin)
  const handleCreateUser = async (userData: any) => {
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    if (res.ok) {
      await fetchDashboardData();
    }
  };

  // Update user role
  const handleUpdateUserRole = async (uid: string, role: string, badgeNumber?: string) => {
    const res = await fetch(`/api/admin/users/${uid}/role`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role, badgeNumber }),
    });
    if (res.ok) {
      await fetchDashboardData();
    }
  };

  // Update user status
  const handleUpdateUserStatus = async (uid: string, status: string) => {
    const res = await fetch(`/api/admin/users/${uid}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      await fetchDashboardData();
    }
  };

  // Trigger online sync batch upload
  const handleTriggerSyncBatch = async (batchPayload: any) => {
    const res = await fetch('/api/sync/mesh-bundle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(batchPayload),
    });
    const result = await res.json();
    await fetchDashboardData();
    return result;
  };

  // Send downstream broadcast directive into mesh
  const handleSendBroadcast = async (broadcastData: { title: string; message: string; category?: string; priority?: number }) => {
    const res = await fetch('/api/sync/emergency-broadcast', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...broadcastData, issuedBy: 'EOC Operations Commander' }),
    });
    const result = await res.json();
    await fetchDashboardData();
    return result;
  };

  const criticalAlertsCount = alerts.filter(
    (a) => a.severity === 'CRITICAL' && a.status !== 'RESOLVED'
  ).length;

  return (
    <DashboardLayout
      currentTab={currentTab}
      onSelectTab={setCurrentTab}
      criticalAlertsCount={criticalAlertsCount}
      totalNodesCount={nodes.length}
      totalUsersCount={usersList.length}
      isDarkTheme={isDarkTheme}
      onToggleTheme={() => setIsDarkTheme(!isDarkTheme)}
    >
      {currentTab === 'responder' && (
        <ResponderDashboard
          alerts={alerts}
          onUpdateStatus={handleUpdateAlertStatus}
          onOpenNewSosModal={() => setIsModalOpen(true)}
          isDarkTheme={isDarkTheme}
        />
      )}

      {currentTab === 'admin' && (
        <AdministratorDashboard
          stats={stats}
          alerts={alerts}
          usersList={usersList}
          activityLogs={activityLogs}
          onUpdateAlertStatus={handleUpdateAlertStatus}
          onDeleteAlert={handleDeleteAlert}
          onCreateUser={handleCreateUser}
          onUpdateUserRole={handleUpdateUserRole}
          onUpdateUserStatus={handleUpdateUserStatus}
          isDarkTheme={isDarkTheme}
        />
      )}

      {currentTab === 'citizen' && (
        <CitizenMobileView
          onBroadcastSos={handleCreateSos}
          alerts={alerts}
          isDarkTheme={isDarkTheme}
        />
      )}

      {currentTab === 'topology' && <MeshTopologyView nodes={nodes} />}

      {currentTab === 'sync' && (
        <SyncGatewayView
          auditLogs={auditLogs}
          onTriggerSyncBatch={handleTriggerSyncBatch}
          onSendBroadcast={handleSendBroadcast}
        />
      )}

      {currentTab === 'android' && <AndroidArchitectureHub />}

      <NewSosModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateSos}
      />
    </DashboardLayout>
  );
}
