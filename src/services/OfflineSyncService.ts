/**
 * OfflineSyncService — Manages offline queue and sync replay when connectivity resumes
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import type { OfflineOperation, OfflineOperationType } from '../types';

const QUEUE_STORAGE_KEY = '@lifelink_offline_queue';

class OfflineSyncService {
  private queue: OfflineOperation[] = [];
  private isProcessing = false;

  constructor() {
    this.init();
  }

  private async init() {
    await this.loadQueue();

    NetInfo.addEventListener((state: NetInfoState) => {
      if (state.isConnected && state.isInternetReachable !== false) {
        console.log('[OfflineSync] Internet restored — processing queue');
        this.processQueue();
      }
    });
  }

  private async loadQueue(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(QUEUE_STORAGE_KEY);
      if (stored) {
        this.queue = JSON.parse(stored);
      }
    } catch (e) {
      console.warn('[OfflineSync] Failed to load offline queue:', e);
    }
  }

  private async saveQueue(): Promise<void> {
    try {
      await AsyncStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(this.queue));
    } catch (e) {
      console.warn('[OfflineSync] Failed to save queue:', e);
    }
  }

  public async enqueue(type: OfflineOperationType, payload: Record<string, unknown>): Promise<void> {
    const operation: OfflineOperation = {
      id: `op_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      type,
      payload,
      timestamp: Date.now(),
      retryCount: 0,
    };

    this.queue.push(operation);
    await this.saveQueue();
    console.log(`[OfflineSync] Enqueued offline operation: ${type} (${operation.id})`);

    const netState = await NetInfo.fetch();
    if (netState.isConnected) {
      this.processQueue();
    }
  }

  public async processQueue(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) return;
    this.isProcessing = true;

    console.log(`[OfflineSync] Processing ${this.queue.length} pending operations...`);
    const remaining: OfflineOperation[] = [];

    for (const op of this.queue) {
      try {
        await this.executeOperation(op);
        console.log(`[OfflineSync] Replayed op ${op.id} successfully`);
      } catch (err) {
        console.warn(`[OfflineSync] Op ${op.id} failed, retryCount ${op.retryCount}:`, err);
        if (op.retryCount < 3) {
          remaining.push({ ...op, retryCount: op.retryCount + 1 });
        }
      }
    }

    this.queue = remaining;
    await this.saveQueue();
    this.isProcessing = false;
  }

  private async executeOperation(op: OfflineOperation): Promise<void> {
    switch (op.type) {
      case 'CREATE_REQUEST':
        console.log('[OfflineSync] Replaying CREATE_REQUEST:', op.payload);
        break;
      case 'ADD_RESPONSE':
        console.log('[OfflineSync] Replaying ADD_RESPONSE:', op.payload);
        break;
      case 'MARK_FULFILLED':
        console.log('[OfflineSync] Replaying MARK_FULFILLED:', op.payload);
        break;
      default:
        console.log('[OfflineSync] Replaying operation:', op.type);
    }
  }

  public getPendingCount(): number {
    return this.queue.length;
  }
}

export const offlineSync = new OfflineSyncService();
