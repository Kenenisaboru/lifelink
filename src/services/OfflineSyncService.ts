/**
 * OfflineSyncService — Persistent offline queue with automatic replay on reconnect
 * Stores operations in AsyncStorage, replays against live Firestore when online.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo, { type NetInfoState } from '@react-native-community/netinfo';
import type { OfflineOperation, OfflineOperationType } from '../types';
import type { CreateRequestParams } from '../stores/useRequestStore';

const QUEUE_STORAGE_KEY = '@lifelink_offline_queue';
const NETWORK_STATUS_KEY = '@lifelink_network_online';

// Listeners that will be called when sync completes
type SyncCompleteListener = (replayed: number) => void;
const syncListeners: SyncCompleteListener[] = [];

class OfflineSyncService {
  private queue: OfflineOperation[] = [];
  private isProcessing = false;
  private _isOnline = true;

  constructor() {
    this.init();
  }

  get isOnline(): boolean {
    return this._isOnline;
  }

  private async init(): Promise<void> {
    await this.loadQueue();

    // Subscribe to connectivity changes
    NetInfo.addEventListener((state: NetInfoState) => {
      const online = !!(state.isConnected && state.isInternetReachable !== false);
      const wasOffline = !this._isOnline;
      this._isOnline = online;

      AsyncStorage.setItem(NETWORK_STATUS_KEY, online ? 'true' : 'false').catch(() => null);

      if (online && wasOffline && this.queue.length > 0) {
        console.log('[OfflineSync] Connection restored — replaying queue');
        this.processQueue().catch(console.error);
      }
    });

    // Initial network state
    const state = await NetInfo.fetch();
    this._isOnline = !!(state.isConnected && state.isInternetReachable !== false);
  }

  private async loadQueue(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(QUEUE_STORAGE_KEY);
      if (stored) {
        this.queue = JSON.parse(stored) as OfflineOperation[];
        console.log(`[OfflineSync] Loaded ${this.queue.length} pending ops from storage`);
      }
    } catch (e) {
      console.warn('[OfflineSync] Failed to load queue:', e);
      this.queue = [];
    }
  }

  private async saveQueue(): Promise<void> {
    try {
      await AsyncStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(this.queue));
    } catch (e) {
      console.warn('[OfflineSync] Failed to persist queue:', e);
    }
  }

  /**
   * Add an operation to the offline queue.
   * If currently online, attempts immediate processing.
   */
  public async enqueue(
    type: OfflineOperationType,
    payload: Record<string, unknown>
  ): Promise<string> {
    const operation: OfflineOperation = {
      id: `op_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      type,
      payload,
      timestamp: Date.now(),
      retryCount: 0,
    };

    this.queue.push(operation);
    await this.saveQueue();
    console.log(`[OfflineSync] Enqueued: ${type} (${operation.id})`);

    if (this._isOnline) {
      this.processQueue().catch(console.error);
    }

    return operation.id;
  }

  /**
   * Process all queued operations in order, retry failed ones up to 3 times.
   */
  public async processQueue(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) return;
    this.isProcessing = true;

    const total = this.queue.length;
    console.log(`[OfflineSync] Processing ${total} pending operations...`);

    const remaining: OfflineOperation[] = [];
    let replayed = 0;

    for (const op of this.queue) {
      try {
        await this.executeOperation(op);
        replayed++;
        console.log(`[OfflineSync] ✅ Replayed op ${op.id} (${op.type})`);
      } catch (err) {
        console.warn(`[OfflineSync] ❌ Op ${op.id} failed (retry ${op.retryCount}):`, err);
        if (op.retryCount < 3) {
          remaining.push({ ...op, retryCount: op.retryCount + 1 });
        } else {
          console.error(`[OfflineSync] Discarding op ${op.id} after 3 retries`);
        }
      }
    }

    this.queue = remaining;
    await this.saveQueue();
    this.isProcessing = false;

    // Notify listeners
    if (replayed > 0) {
      syncListeners.forEach((fn) => fn(replayed));
    }

    console.log(
      `[OfflineSync] Done. Replayed: ${replayed}, Remaining: ${remaining.length}`
    );
  }

  private async executeOperation(op: OfflineOperation): Promise<void> {
    // Lazy-import stores to avoid circular dependency at module init time
    switch (op.type) {
      case 'CREATE_REQUEST': {
        const { useRequestStore } = await import('../stores/useRequestStore');
        await useRequestStore.getState().createRequest(op.payload as CreateRequestParams);
        break;
      }
      case 'ADD_RESPONSE': {
        const { useRequestStore } = await import('../stores/useRequestStore');
        const { requestId, responseObj } = op.payload as {
          requestId: string;
          responseObj: import('../types').DonorResponse;
        };
        await useRequestStore.getState().addDonorResponse(requestId, responseObj);
        break;
      }
      case 'MARK_FULFILLED': {
        const { useRequestStore } = await import('../stores/useRequestStore');
        const { requestId } = op.payload as { requestId: string };
        await useRequestStore.getState().markFulfilled(requestId);
        break;
      }
      case 'UPDATE_STOCK': {
        const { useInventoryStore } = await import('../stores/useInventoryStore');
        const { bloodType, delta } = op.payload as {
          bloodType: import('../types').BloodType;
          delta: number;
        };
        useInventoryStore.getState().updateStock(bloodType, delta);
        break;
      }
      default:
        console.log('[OfflineSync] Unknown op type — skipping:', op.type);
    }
  }

  public getPendingCount(): number {
    return this.queue.length;
  }

  public clearQueue(): Promise<void> {
    this.queue = [];
    return this.saveQueue();
  }

  /** Subscribe to sync completion events */
  public onSyncComplete(listener: SyncCompleteListener): () => void {
    syncListeners.push(listener);
    return () => {
      const idx = syncListeners.indexOf(listener);
      if (idx > -1) syncListeners.splice(idx, 1);
    };
  }
}

export const offlineSync = new OfflineSyncService();
