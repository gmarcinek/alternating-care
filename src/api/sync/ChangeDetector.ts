import { AlternatingCareDBSchema } from '@api/db/schema';
import { CalendarEvent } from '@api/db/types';
import { IDBPDatabase } from 'idb';

interface EventSnapshot {
  id: string;
  hash: string;
  timestamp: number;
}

const STORAGE_KEY = 'event_snapshots_v1';

/**
 * Detects changes in local events by comparing hashes
 * Enables efficient change detection for smart sync
 */
export class ChangeDetector {
  private snapshots: Map<string, EventSnapshot> = new Map();
  private lastCheckTime: number = 0;

  constructor() {
    this.loadSnapshots();
  }

  /**
   * Create hash of event for change detection
   */
  private hashEvent(event: CalendarEvent): string {
    // Include all relevant fields for change detection
    const content = JSON.stringify({
      date: event.date,
      type: event.type,
      name: event.name,
      description: event.description,
      style: event.style,
      startTime: event.startTime,
      endTime: event.endTime,
      duration: event.duration,
      deleted: event.deleted,
    });

    // Simple hash function - can be replaced with more robust one if needed
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }

  /**
   * Take snapshot of all events
   */
  async takeSnapshot(db: IDBPDatabase<AlternatingCareDBSchema>): Promise<void> {
    const events = await db.getAll('events');

    this.snapshots.clear();

    for (const event of events) {
      const snapshot: EventSnapshot = {
        id: event.id,
        hash: this.hashEvent(event),
        timestamp: Date.now(),
      };
      this.snapshots.set(event.id, snapshot);
    }

    this.lastCheckTime = Date.now();
    this.saveSnapshots();
  }

  /**
   * Detect changes since last snapshot
   * Returns: { created, updated, deleted }
   */
  async detectChanges(db: IDBPDatabase<AlternatingCareDBSchema>): Promise<{
    created: CalendarEvent[];
    updated: CalendarEvent[];
    deleted: string[];
  }> {
    const currentEvents = await db.getAll('events');
    const currentIds = new Set(currentEvents.map((e) => e.id));
    const snapshotIds = new Set(this.snapshots.keys());

    const created: CalendarEvent[] = [];
    const updated: CalendarEvent[] = [];
    const deleted: string[] = [];

    // Find created and updated events
    for (const event of currentEvents) {
      // Skip already deleted events (tombstones)
      if (event.deleted && event.deletedAt) {
        continue;
      }

      const snapshot = this.snapshots.get(event.id);

      // Check unsynced flag first (most reliable for user changes)
      if (event.unsynced) {
        if (!snapshot) {
          created.push(event);
          console.log(`📝 Detected NEW unsynced event: ${event.name}`);
        } else {
          updated.push(event);
          console.log(`✏️ Detected UPDATED unsynced event: ${event.name}`);
        }
        continue;
      }

      // Fallback to hash comparison
      if (!snapshot) {
        // New event
        created.push(event);
      } else {
        const currentHash = this.hashEvent(event);
        if (currentHash !== snapshot.hash) {
          // Event changed
          updated.push(event);
        }
      }
    }

    // Find deleted events
    Array.from(snapshotIds).forEach((snapshotId) => {
      if (!currentIds.has(snapshotId)) {
        deleted.push(snapshotId);
      }
    });

    return { created, updated, deleted };
  }

  /**
   * Check if any changes exist since last snapshot
   */
  async hasChanges(
    db: IDBPDatabase<AlternatingCareDBSchema>
  ): Promise<boolean> {
    const currentEvents = await db.getAll('events');

    // Quick check: any unsynced events?
    const hasUnsyncedEvents = currentEvents.some(
      (e) => e.unsynced && !e.deleted
    );
    if (hasUnsyncedEvents) {
      return true;
    }

    const currentIds = new Set(currentEvents.map((e) => e.id));
    const snapshotIds = new Set(this.snapshots.keys());

    // Quick check: different count
    if (currentIds.size !== snapshotIds.size) {
      return true;
    }

    // Check for hash mismatches
    for (const event of currentEvents) {
      const snapshot = this.snapshots.get(event.id);
      if (!snapshot || this.hashEvent(event) !== snapshot.hash) {
        return true;
      }
    }

    return false;
  }

  /**
   * Get events that changed since specific timestamp
   */
  async getChangedSince(
    db: IDBPDatabase<AlternatingCareDBSchema>,
    timestamp: number
  ): Promise<CalendarEvent[]> {
    const events = await db.getAll('events');

    return events.filter((event) => {
      // Check if event was modified after timestamp
      const lastEditTime = event.lastEditTime || event.creationTime;
      return lastEditTime > timestamp;
    });
  }

  /**
   * Mark events as synced by updating snapshots
   * Note: This only updates the snapshot - caller must also clear 'unsynced' flag in DB
   */
  markAsSynced(events: CalendarEvent[]): void {
    for (const event of events) {
      const snapshot: EventSnapshot = {
        id: event.id,
        hash: this.hashEvent(event),
        timestamp: Date.now(),
      };
      this.snapshots.set(event.id, snapshot);
    }

    this.saveSnapshots();
  }

  /**
   * Remove snapshot for deleted event
   */
  removeSnapshot(eventId: string): void {
    this.snapshots.delete(eventId);
    this.saveSnapshots();
  }

  /**
   * Get last check time
   */
  getLastCheckTime(): number {
    return this.lastCheckTime;
  }

  /**
   * Get snapshot count
   */
  getSnapshotCount(): number {
    return this.snapshots.size;
  }

  /**
   * Clear all snapshots
   */
  clear(): void {
    this.snapshots.clear();
    this.lastCheckTime = 0;
    this.saveSnapshots();
  }

  /**
   * Persist snapshots to localStorage
   */
  private saveSnapshots(): void {
    try {
      const data = {
        snapshots: Array.from(this.snapshots.entries()),
        lastCheckTime: this.lastCheckTime,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save snapshots:', error);
    }
  }

  /**
   * Load snapshots from localStorage
   */
  private loadSnapshots(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        this.snapshots = new Map(data.snapshots || []);
        this.lastCheckTime = data.lastCheckTime || 0;
        console.log(`Loaded ${this.snapshots.size} event snapshots`);
      }
    } catch (error) {
      console.error('Failed to load snapshots:', error);
      this.snapshots = new Map();
    }
  }
}
