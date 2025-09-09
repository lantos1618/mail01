"use client"

import { 
  ThreadListRuntime, 
  ThreadRuntimeWithCache,
  LocalStorageAdapter,
  CloudAdapter,
  ThreadPersistence
} from "@assistant-ui/react"
import { create } from "zustand"
import { persist } from "zustand/middleware"

// Cloud-backed thread persistence for email conversations
export class EmailThreadPersistence implements ThreadPersistence {
  private cloudAdapter: CloudAdapter
  private localCache: LocalStorageAdapter
  
  constructor() {
    this.cloudAdapter = new CloudAdapter({
      endpoint: "/api/threads",
      auth: () => localStorage.getItem("auth-token") || ""
    })
    this.localCache = new LocalStorageAdapter()
  }
  
  async saveThread(threadId: string, data: any) {
    // Save to local cache first for instant updates
    await this.localCache.save(threadId, data)
    
    // Then sync to cloud
    try {
      await this.cloudAdapter.save(threadId, {
        ...data,
        metadata: {
          ...data.metadata,
          lastSyncedAt: new Date().toISOString(),
          emailContext: data.emailContext || []
        }
      })
    } catch (error) {
      console.error("Failed to sync thread to cloud:", error)
      // Local cache remains as fallback
    }
  }
  
  async loadThread(threadId: string) {
    try {
      // Try cloud first
      const cloudData = await this.cloudAdapter.load(threadId)
      if (cloudData) {
        // Update local cache with cloud data
        await this.localCache.save(threadId, cloudData)
        return cloudData
      }
    } catch (error) {
      console.error("Failed to load from cloud:", error)
    }
    
    // Fallback to local cache
    return this.localCache.load(threadId)
  }
  
  async listThreads() {
    try {
      const cloudThreads = await this.cloudAdapter.list()
      const localThreads = await this.localCache.list()
      
      // Merge and deduplicate
      const threadMap = new Map()
      localThreads.forEach(t => threadMap.set(t.id, t))
      cloudThreads.forEach(t => threadMap.set(t.id, { ...t, synced: true }))
      
      return Array.from(threadMap.values()).sort((a, b) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )
    } catch (error) {
      console.error("Failed to list threads:", error)
      return this.localCache.list()
    }
  }
  
  async deleteThread(threadId: string) {
    await Promise.all([
      this.localCache.delete(threadId),
      this.cloudAdapter.delete(threadId).catch(console.error)
    ])
  }
}

// Email-specific thread list with cloud sync
export function useEmailThreadList() {
  const persistence = new EmailThreadPersistence()
  
  return new ThreadListRuntime({
    persistence,
    autoSave: true,
    autoSaveInterval: 5000,
    maxThreads: 100,
    onThreadCreate: (thread) => {
      // Attach email metadata to new threads
      thread.metadata = {
        ...thread.metadata,
        type: "email",
        createdAt: new Date().toISOString(),
        tags: []
      }
    }
  })
}

// Thread state with caching and optimistic updates
export function useThreadWithCache(threadId: string) {
  return new ThreadRuntimeWithCache({
    threadId,
    persistence: new EmailThreadPersistence(),
    cacheSize: 50,
    optimisticUpdates: true,
    retryPolicy: {
      maxRetries: 3,
      backoff: "exponential"
    }
  })
}

// Global thread sync status
interface SyncState {
  syncing: boolean
  lastSyncTime: Date | null
  pendingChanges: number
  syncError: string | null
  syncNow: () => Promise<void>
}

export const useSyncStatus = create<SyncState>()(
  persist(
    (set, get) => ({
      syncing: false,
      lastSyncTime: null,
      pendingChanges: 0,
      syncError: null,
      
      syncNow: async () => {
        set({ syncing: true, syncError: null })
        
        try {
          const persistence = new EmailThreadPersistence()
          const threads = await persistence.listThreads()
          
          // Sync all unsynced threads
          const unsynced = threads.filter(t => !t.synced)
          for (const thread of unsynced) {
            const data = await persistence.loadThread(thread.id)
            await persistence.saveThread(thread.id, data)
          }
          
          set({ 
            syncing: false, 
            lastSyncTime: new Date(),
            pendingChanges: 0 
          })
        } catch (error: any) {
          set({ 
            syncing: false, 
            syncError: error.message 
          })
        }
      }
    }),
    {
      name: "email-sync-status"
    }
  )
)