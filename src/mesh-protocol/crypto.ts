import crypto from 'node:crypto';
import { MeshBundle, MeshPacketHeader, SosAlertPayload } from './types.ts';

/**
 * SahaayaNet Cryptographic Bundle Authentication & Anti-Tamper Module
 * Provides deterministic SHA-256 canonical hashing and HMAC signatures
 * to prevent packet injection and spoofing in offline disaster mesh networks.
 */

const DEFAULT_NETWORK_HMAC_SECRET = 'sahaayanet-emergency-mesh-root-key-2026';

/**
 * Produces a canonical string representation of the bundle payload and header
 * for deterministic cryptographic digest generation.
 */
export function canonicalizeBundle(
  header: Omit<MeshPacketHeader, 'checksum'>,
  payload: SosAlertPayload | Record<string, unknown>
): string {
  const normalized = {
    v: header.version,
    bId: header.bundleId,
    orig: header.originNodeId,
    dest: header.destinationNodeId,
    type: header.payloadType,
    prio: header.priority,
    ttl: header.timeToLiveSeconds,
    created: header.createdTimestamp,
    payload: JSON.stringify(payload, Object.keys(payload).sort()),
  };
  return JSON.stringify(normalized);
}

/**
 * Computes a SHA-256 checksum/digest for a mesh packet.
 */
export function computeBundleChecksum(
  header: Omit<MeshPacketHeader, 'checksum'>,
  payload: SosAlertPayload | Record<string, unknown>,
  secretKey: string = DEFAULT_NETWORK_HMAC_SECRET
): string {
  const canonicalData = canonicalizeBundle(header, payload);
  return crypto.createHmac('sha256', secretKey).update(canonicalData).digest('hex');
}

/**
 * Validates the cryptographic checksum of a received mesh bundle.
 * Returns true if the payload has not been modified or corrupted in transit.
 */
export function verifyBundleIntegrity(
  bundle: MeshBundle,
  secretKey: string = DEFAULT_NETWORK_HMAC_SECRET
): boolean {
  if (!bundle.header.checksum) {
    return false;
  }
  const expectedChecksum = computeBundleChecksum(bundle.header, bundle.payload, secretKey);
  try {
    const expectedBuf = Buffer.from(expectedChecksum, 'hex');
    const actualBuf = Buffer.from(bundle.header.checksum, 'hex');
    if (expectedBuf.length !== actualBuf.length) return false;
    return crypto.timingSafeEqual(expectedBuf, actualBuf);
  } catch {
    return false;
  }
}

/**
 * Signs an outgoing bundle, attaching the calculated checksum to the header.
 */
export function signOutgoingBundle(
  header: Omit<MeshPacketHeader, 'checksum'>,
  payload: SosAlertPayload | Record<string, unknown>,
  secretKey: string = DEFAULT_NETWORK_HMAC_SECRET
): MeshBundle {
  const checksum = computeBundleChecksum(header, payload, secretKey);
  const fullHeader: MeshPacketHeader = {
    ...header,
    checksum,
  };
  return {
    header: fullHeader,
    payload,
    hopsRecord: [
      {
        nodeId: header.originNodeId,
        transferredAt: header.createdTimestamp,
        bearer: 'BLE',
      },
    ],
  };
}
