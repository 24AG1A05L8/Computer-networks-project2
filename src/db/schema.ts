import { boolean, doublePrecision, integer, pgTable, serial, text, timestamp, bigint } from 'drizzle-orm/pg-core';

// Users table (Command operators, first responders, field volunteers, citizens)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID or callsign ID
  email: text('email').notNull(),
  name: text('name'),
  phone: text('phone'),
  role: text('role').default('citizen'), // admin, first_responder, medic, citizen
  badgeNumber: text('badge_number'),
  status: text('status').default('ACTIVE'), // ACTIVE, INACTIVE, SUSPENDED
  createdAt: timestamp('created_at').defaultNow(),
});

// Emergency SOS Alerts table
export const sosAlerts = pgTable('sos_alerts', {
  id: serial('id').primaryKey(),
  alertId: text('alert_id').notNull().unique(),
  senderName: text('sender_name').notNull(),
  senderPhone: text('sender_phone'),
  emergencyType: text('emergency_type').notNull(),
  severity: text('severity').notNull(), // CRITICAL, HIGH, MEDIUM, LOW
  status: text('status').default('PENDING'), // PENDING, DISPATCHED, IN_PROGRESS, RESOLVED
  victimCount: integer('victim_count').default(1),
  medicalNeeds: text('medical_needs'),
  notes: text('notes'),
  latitude: doublePrecision('latitude').notNull(),
  longitude: doublePrecision('longitude').notNull(),
  originNodeId: text('origin_node_id').notNull(),
  hopCount: integer('hop_count').default(0),
  dispatchedResponder: text('dispatched_responder'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Mesh Node Fleet table
export const meshNodes = pgTable('mesh_nodes', {
  id: serial('id').primaryKey(),
  nodeId: text('node_id').notNull().unique(),
  role: text('role').notNull(),
  bleAddress: text('ble_address').notNull(),
  wifiDirectAddress: text('wifi_direct_address'),
  batteryPercent: integer('battery_percent').default(100),
  isGateway: boolean('is_gateway').default(false),
  lastSeenTimestamp: bigint('last_seen_timestamp', { mode: 'number' }).notNull(),
  forwardedBundlesCount: integer('forwarded_bundles_count').default(0),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Store-Carry-Forward Mesh Bundles table
export const meshBundles = pgTable('mesh_bundles', {
  id: serial('id').primaryKey(),
  bundleId: text('bundle_id').notNull().unique(),
  originNodeId: text('origin_node_id').notNull(),
  destinationNodeId: text('destination_node_id').notNull(),
  payloadType: text('payload_type').notNull(),
  priority: integer('priority').notNull(),
  hopCount: integer('hop_count').notNull(),
  maxHops: integer('max_hops').notNull(),
  timeToLiveSeconds: integer('time_to_live_seconds').notNull(),
  rawPayloadJson: text('raw_payload_json').notNull(),
  rawHopsJson: text('raw_hops_json').notNull(),
  syncedAt: timestamp('synced_at').defaultNow(),
});

// Cloud Sync Audit Logs
export const syncAuditLogs = pgTable('sync_audit_logs', {
  id: serial('id').primaryKey(),
  gatewayNodeId: text('gateway_node_id').notNull(),
  bundlesSynced: integer('bundles_synced').notNull(),
  nodesObserved: integer('nodes_observed').notNull(),
  clientIp: text('client_ip'),
  syncedAt: timestamp('synced_at').defaultNow(),
});

// Activity Audit Logs for Administrator Dashboard
export const activityLogs = pgTable('activity_logs', {
  id: serial('id').primaryKey(),
  actorName: text('actor_name').notNull(),
  actorRole: text('actor_role').notNull(),
  actionType: text('action_type').notNull(), // SOS_CREATED, DISPATCH_ASSIGNED, STATUS_UPDATED, USER_REGISTERED, GATEWAY_SYNCED
  details: text('details').notNull(),
  severity: text('severity').default('INFO'), // INFO, WARNING, CRITICAL
  timestamp: timestamp('timestamp').defaultNow(),
});
