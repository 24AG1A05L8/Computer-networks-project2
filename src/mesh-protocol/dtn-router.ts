/**
 * SahaayaNet Delay-Tolerant Networking (DTN) Store-Carry-Forward Routing Engine
 * Implements epidemic routing with priority-based storage queues and anti-flooding constraints.
 */

import { MeshBundle, MeshPacketHeader, SosAlertPayload } from './types.ts';

export class StoreCarryForwardRouter {
  private storageBuffer: Map<string, MeshBundle> = new Map();
  private deliveredOrSeenBundles: Set<string> = new Set();
  private maxBufferSize: number;

  constructor(maxBufferSize: number = 250) {
    this.maxBufferSize = maxBufferSize;
  }

  /**
   * Ingest a new packet received over BLE or Wi-Fi Direct.
   * Returns true if packet was accepted into local store, false if discarded (duplicate, expired, or buffer full).
   */
  public ingestBundle(
    bundle: MeshBundle,
    currentNodeId: string,
    bearer: 'BLE' | 'WIFI_DIRECT',
    currentTimestampMs: number = Date.now()
  ): { accepted: boolean; reason: string } {
    const { header } = bundle;

    // 1. Check if already seen or processed
    if (this.deliveredOrSeenBundles.has(header.bundleId)) {
      return { accepted: false, reason: 'DUPLICATE_ALREADY_SEEN' };
    }

    // 2. Check Hop Count limit
    if (header.hopCount >= header.maxHops) {
      this.deliveredOrSeenBundles.add(header.bundleId);
      return { accepted: false, reason: 'MAX_HOPS_EXCEEDED' };
    }

    // 3. Check Time-To-Live (TTL)
    const ageSeconds = (currentTimestampMs - header.createdTimestamp) / 1000;
    if (ageSeconds > header.timeToLiveSeconds) {
      this.deliveredOrSeenBundles.add(header.bundleId);
      return { accepted: false, reason: 'TTL_EXPIRED' };
    }

    // 4. Mark seen
    this.deliveredOrSeenBundles.add(header.bundleId);

    // 5. If buffer is full, evict lowest priority or oldest item
    if (this.storageBuffer.size >= this.maxBufferSize) {
      this.evictLowestPriorityBundle(header.priority);
    }

    // 6. Record forward hop
    const updatedBundle: MeshBundle = {
      ...bundle,
      header: {
        ...bundle.header,
        hopCount: bundle.header.hopCount + 1,
      },
      hopsRecord: [
        ...bundle.hopsRecord,
        {
          nodeId: currentNodeId,
          transferredAt: currentTimestampMs,
          bearer,
        },
      ],
    };

    this.storageBuffer.set(header.bundleId, updatedBundle);
    return { accepted: true, reason: 'ACCEPTED_FOR_FORWARDING' };
  }

  /**
   * Get all bundles ready to be exchanged with a newly discovered peer.
   * Ordered by priority (1 is highest: SOS alerts go first) and then oldest first.
   */
  public getForwardingQueue(): MeshBundle[] {
    const list = Array.from(this.storageBuffer.values());
    return list.sort((a, b) => {
      // Ascending priority number: 1 (Critical SOS) comes before 5 (Telemetry)
      if (a.header.priority !== b.header.priority) {
        return a.header.priority - b.header.priority;
      }
      return a.header.createdTimestamp - b.header.createdTimestamp;
    });
  }

  /**
   * Evict lowest priority bundle when buffer capacity is reached.
   */
  private evictLowestPriorityBundle(incomingPriority: number): boolean {
    let candidateKey: string | null = null;
    let worstPriority = -1;
    let oldestTime = Infinity;

    for (const [key, item] of this.storageBuffer.entries()) {
      if (item.header.priority > worstPriority) {
        worstPriority = item.header.priority;
        oldestTime = item.header.createdTimestamp;
        candidateKey = key;
      } else if (item.header.priority === worstPriority && item.header.createdTimestamp < oldestTime) {
        oldestTime = item.header.createdTimestamp;
        candidateKey = key;
      }
    }

    // Only evict if the incoming packet has strictly higher priority (lower number)
    if (candidateKey && worstPriority > incomingPriority) {
      this.storageBuffer.delete(candidateKey);
      return true;
    }

    return false;
  }

  /**
   * Mark bundles as delivered or synced to the central command server.
   */
  public acknowledgeBundles(bundleIds: string[]): void {
    for (const id of bundleIds) {
      this.storageBuffer.delete(id);
      this.deliveredOrSeenBundles.add(id);
    }
  }

  /**
   * Purge expired packets from the buffer.
   */
  public purgeExpired(currentTimestampMs: number = Date.now()): number {
    let purgedCount = 0;
    for (const [key, item] of this.storageBuffer.entries()) {
      const ageSeconds = (currentTimestampMs - item.header.createdTimestamp) / 1000;
      if (ageSeconds > item.header.timeToLiveSeconds) {
        this.storageBuffer.delete(key);
        purgedCount++;
      }
    }
    return purgedCount;
  }

  public getBufferSize(): number {
    return this.storageBuffer.size;
  }

  public getBundle(bundleId: string): MeshBundle | undefined {
    return this.storageBuffer.get(bundleId);
  }

  public clear(): void {
    this.storageBuffer.clear();
    this.deliveredOrSeenBundles.clear();
  }
}

/**
 * Utility to construct a valid SahaayaNet SOS Mesh Bundle
 */
export function createSosBundle(
  originNodeId: string,
  alert: SosAlertPayload,
  maxHops: number = 7,
  ttlSeconds: number = 86400
): MeshBundle {
  const bundleId = `BND-${originNodeId}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const header: MeshPacketHeader = {
    version: 1,
    bundleId,
    originNodeId,
    destinationNodeId: 'BROADCAST_COMMAND',
    hopCount: 0,
    maxHops,
    timeToLiveSeconds: ttlSeconds,
    createdTimestamp: Date.now(),
    priority: alert.severity === 'CRITICAL' ? 1 : alert.severity === 'HIGH' ? 2 : 3,
    payloadType: 'SOS_ALERT',
    checksum: `sha256-mock-${bundleId}`,
  };

  return {
    header,
    payload: alert,
    hopsRecord: [
      {
        nodeId: originNodeId,
        transferredAt: Date.now(),
        bearer: 'BLE',
      },
    ],
  };
}
