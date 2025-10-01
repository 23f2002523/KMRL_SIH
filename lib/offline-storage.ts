// Offline storage utilities for mobile app

interface OfflineDocument {
  id: string
  title: string
  malayalam_title?: string
  imageData?: string
  metadata: any
  status: "pending_sync" | "synced" | "failed"
  created_at: string
  updated_at: string
}

interface SyncQueue {
  id: string
  action: "create" | "update" | "delete"
  documentId: string
  data: any
  timestamp: string
  retryCount: number
}

class OfflineStorageService {
  private dbName = "kmrl-documents"
  private dbVersion = 1
  private db: IDBDatabase | null = null

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // Documents store
        if (!db.objectStoreNames.contains("documents")) {
          const documentsStore = db.createObjectStore("documents", { keyPath: "id" })
          documentsStore.createIndex("status", "status", { unique: false })
          documentsStore.createIndex("created_at", "created_at", { unique: false })
        }

        // Sync queue store
        if (!db.objectStoreNames.contains("sync_queue")) {
          const syncStore = db.createObjectStore("sync_queue", { keyPath: "id" })
          syncStore.createIndex("timestamp", "timestamp", { unique: false })
        }
      }
    })
  }

  async saveDocument(document: OfflineDocument): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["documents"], "readwrite")
      const store = transaction.objectStore("documents")
      const request = store.put(document)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  async getDocuments(): Promise<OfflineDocument[]> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["documents"], "readonly")
      const store = transaction.objectStore("documents")
      const request = store.getAll()

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
    })
  }

  async getPendingSyncDocuments(): Promise<OfflineDocument[]> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["documents"], "readonly")
      const store = transaction.objectStore("documents")
      const index = store.index("status")
      const request = index.getAll("pending_sync")

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
    })
  }

  async addToSyncQueue(item: Omit<SyncQueue, "id">): Promise<void> {
    if (!this.db) await this.init()

    const syncItem: SyncQueue = {
      ...item,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["sync_queue"], "readwrite")
      const store = transaction.objectStore("sync_queue")
      const request = store.add(syncItem)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  async getSyncQueue(): Promise<SyncQueue[]> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["sync_queue"], "readonly")
      const store = transaction.objectStore("sync_queue")
      const request = store.getAll()

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
    })
  }

  async removeSyncQueueItem(id: string): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["sync_queue"], "readwrite")
      const store = transaction.objectStore("sync_queue")
      const request = store.delete(id)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  async syncWithServer(): Promise<void> {
    const syncQueue = await this.getSyncQueue()

    for (const item of syncQueue) {
      try {
        // TODO: Implement actual API calls
        console.log("Syncing item:", item)

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Remove from sync queue on success
        await this.removeSyncQueueItem(item.id)

        // Update document status
        if (item.action === "create") {
          const documents = await this.getDocuments()
          const document = documents.find((doc) => doc.id === item.documentId)
          if (document) {
            document.status = "synced"
            await this.saveDocument(document)
          }
        }
      } catch (error) {
        console.error("Sync failed for item:", item, error)
        // TODO: Implement retry logic
      }
    }
  }
}

export const offlineStorage = new OfflineStorageService()

// Service Worker registration for offline functionality
export const registerServiceWorker = async () => {
  if ("serviceWorker" in navigator) {
    try {
      const registration = await navigator.serviceWorker.register("/sw.js")
      console.log("Service Worker registered:", registration)

      // Listen for updates
      registration.addEventListener("updatefound", () => {
        const newWorker = registration.installing
        if (newWorker) {
          newWorker.addEventListener("statechange", () => {
            if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
              // New version available
              console.log("New version available")
            }
          })
        }
      })
    } catch (error) {
      console.error("Service Worker registration failed:", error)
    }
  }
}

// Push notification utilities
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!("Notification" in window)) {
    console.log("This browser does not support notifications")
    return false
  }

  if (Notification.permission === "granted") {
    return true
  }

  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission()
    return permission === "granted"
  }

  return false
}

export const showNotification = (title: string, options?: NotificationOptions) => {
  if (Notification.permission === "granted") {
    new Notification(title, {
      icon: "/kmrl-notification-icon.jpg",
      badge: "/kmrl-badge-icon.jpg",
      ...options,
    })
  }
}
