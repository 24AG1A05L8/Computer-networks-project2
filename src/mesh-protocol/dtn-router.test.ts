import test from 'node:test';
import assert from 'node:assert/strict';
import { StoreCarryForwardRouter, createSosBundle } from './dtn-router.ts';
import { SosAlertPayload } from './types.ts';

test('StoreCarryForwardRouter: accepts valid SOS bundle and records hop', () => {
  const router = new StoreCarryForwardRouter(50);
  const dummyAlert: SosAlertPayload = {
    alertId: 'ALT-001',
    senderName: 'Ramesh Patel',
    emergencyType: 'FLOOD',
    severity: 'CRITICAL',
    victimCount: 4,
    medicalNeeds: 'Insulin required',
    notes: 'Trapped on terrace, water level 6ft',
    location: { latitude: 17.385, longitude: 78.4867 },
    timestamp: Date.now(),
  };

  const bundle = createSosBundle('NODE_ALPHA', dummyAlert, 5, 3600);
  const result = router.ingestBundle(bundle, 'NODE_BETA', 'BLE');

  assert.equal(result.accepted, true);
  assert.equal(result.reason, 'ACCEPTED_FOR_FORWARDING');
  assert.equal(router.getBufferSize(), 1);

  const stored = router.getBundle(bundle.header.bundleId);
  assert.ok(stored);
  assert.equal(stored.header.hopCount, 1);
  assert.equal(stored.hopsRecord.length, 2);
  assert.equal(stored.hopsRecord[1].nodeId, 'NODE_BETA');
});

test('StoreCarryForwardRouter: rejects duplicate bundles', () => {
  const router = new StoreCarryForwardRouter(50);
  const dummyAlert: SosAlertPayload = {
    alertId: 'ALT-002',
    senderName: 'Sunita Rao',
    emergencyType: 'MEDICAL',
    severity: 'HIGH',
    victimCount: 1,
    medicalNeeds: 'Fracture splint',
    notes: 'Need stretcher',
    location: { latitude: 17.39, longitude: 78.49 },
    timestamp: Date.now(),
  };

  const bundle = createSosBundle('NODE_A', dummyAlert);
  const firstIngest = router.ingestBundle(bundle, 'NODE_B', 'WIFI_DIRECT');
  assert.equal(firstIngest.accepted, true);

  const duplicateIngest = router.ingestBundle(bundle, 'NODE_C', 'BLE');
  assert.equal(duplicateIngest.accepted, false);
  assert.equal(duplicateIngest.reason, 'DUPLICATE_ALREADY_SEEN');
  assert.equal(router.getBufferSize(), 1);
});

test('StoreCarryForwardRouter: enforces max hops limit', () => {
  const router = new StoreCarryForwardRouter(50);
  const dummyAlert: SosAlertPayload = {
    alertId: 'ALT-003',
    senderName: 'Vikram Singh',
    emergencyType: 'FIRE',
    severity: 'CRITICAL',
    victimCount: 2,
    medicalNeeds: 'Burn dressing',
    notes: 'Warehouse periphery',
    location: { latitude: 17.4, longitude: 78.48 },
    timestamp: Date.now(),
  };

  const bundle = createSosBundle('NODE_X', dummyAlert, 3, 3600);
  bundle.header.hopCount = 3; // Already reached max hops

  const result = router.ingestBundle(bundle, 'NODE_Y', 'BLE');
  assert.equal(result.accepted, false);
  assert.equal(result.reason, 'MAX_HOPS_EXCEEDED');
  assert.equal(router.getBufferSize(), 0);
});

test('StoreCarryForwardRouter: prioritizes CRITICAL SOS in forwarding queue', () => {
  const router = new StoreCarryForwardRouter(50);

  const alertLow: SosAlertPayload = {
    alertId: 'ALT-LOW',
    senderName: 'Node Sensor',
    emergencyType: 'SUPPLIES',
    severity: 'LOW',
    victimCount: 0,
    medicalNeeds: 'None',
    notes: 'Water bottle request',
    location: { latitude: 17.41, longitude: 78.48 },
    timestamp: Date.now() - 5000,
  };

  const alertCritical: SosAlertPayload = {
    alertId: 'ALT-CRITICAL',
    senderName: 'Dr. Anita',
    emergencyType: 'STRUCTURAL_COLLAPSE',
    severity: 'CRITICAL',
    victimCount: 8,
    medicalNeeds: 'Oxygen cylinder and blood units',
    notes: 'Basement collapse',
    location: { latitude: 17.42, longitude: 78.48 },
    timestamp: Date.now(),
  };

  const bundleLow = createSosBundle('NODE_1', alertLow);
  const bundleCritical = createSosBundle('NODE_2', alertCritical);

  router.ingestBundle(bundleLow, 'NODE_FWD', 'BLE');
  router.ingestBundle(bundleCritical, 'NODE_FWD', 'WIFI_DIRECT');

  const queue = router.getForwardingQueue();
  assert.equal(queue.length, 2);
  assert.equal((queue[0].payload as SosAlertPayload).severity, 'CRITICAL');
  assert.equal((queue[1].payload as SosAlertPayload).severity, 'LOW');
});

test('StoreCarryForwardRouter: acknowledges and clears delivered bundles', () => {
  const router = new StoreCarryForwardRouter(50);
  const dummyAlert: SosAlertPayload = {
    alertId: 'ALT-ACK',
    senderName: 'Officer Roy',
    emergencyType: 'SEARCH_AND_RESCUE',
    severity: 'HIGH',
    victimCount: 3,
    medicalNeeds: 'First aid',
    notes: 'Riverbank rescue',
    location: { latitude: 17.38, longitude: 78.47 },
    timestamp: Date.now(),
  };

  const bundle = createSosBundle('NODE_G', dummyAlert);
  router.ingestBundle(bundle, 'GATEWAY', 'WIFI_DIRECT');
  assert.equal(router.getBufferSize(), 1);

  router.acknowledgeBundles([bundle.header.bundleId]);
  assert.equal(router.getBufferSize(), 0);
});

test('Cryptographic Integrity: validates authentic bundles and detects tamper', async () => {
  const { computeBundleChecksum, verifyBundleIntegrity, signOutgoingBundle } = await import('./crypto.ts');

  const alertPayload: SosAlertPayload = {
    alertId: 'ALT-CRYPTO-01',
    senderName: 'Command Station Alpha',
    emergencyType: 'FLOOD',
    severity: 'CRITICAL',
    victimCount: 5,
    medicalNeeds: 'Sterile dressings',
    notes: 'Secure transmission',
    location: { latitude: 17.385, longitude: 78.4867 },
    timestamp: Date.now(),
  };

  const signedBundle = signOutgoingBundle(
    {
      version: 1,
      bundleId: 'BND-SIGNED-001',
      originNodeId: 'NODE-AUTHENTIC',
      destinationNodeId: 'BROADCAST',
      hopCount: 0,
      maxHops: 7,
      timeToLiveSeconds: 86400,
      createdTimestamp: Date.now(),
      priority: 1,
      payloadType: 'SOS_ALERT',
    },
    alertPayload
  );

  assert.ok(signedBundle.header.checksum);
  assert.equal(signedBundle.header.checksum.length, 64); // 256-bit hex

  // Verify authentic bundle passes
  const isValid = verifyBundleIntegrity(signedBundle);
  assert.equal(isValid, true);

  // Tamper with payload (e.g., adversary alters victim count from 5 to 50)
  const tamperedPayload = { ...alertPayload, victimCount: 50 };
  const tamperedBundle = { ...signedBundle, payload: tamperedPayload };
  const isTamperedValid = verifyBundleIntegrity(tamperedBundle);
  assert.equal(isTamperedValid, false);
});

