// Lightweight client-side pub/sub for global loading state
type LoadingListener = (activeCount: number) => void

class LoadingStore {
  private activeCount = 0
  private listeners = new Set<LoadingListener>()

  start() {
    this.activeCount++
    this.notify()
  }

  stop() {
    this.activeCount = Math.max(0, this.activeCount - 1)
    this.notify()
  }

  reset() {
    this.activeCount = 0
    this.notify()
  }

  getCount() {
    return this.activeCount
  }

  subscribe(listener: LoadingListener) {
    this.listeners.add(listener)
    listener(this.activeCount)
    return () => {
      this.listeners.delete(listener)
    }
  }

  private notify() {
    for (const listener of this.listeners) {
      try {
        listener(this.activeCount)
      } catch (err) {
        console.error("Error in loading listener:", err)
      }
    }
  }
}

export const globalLoadingStore = new LoadingStore()
