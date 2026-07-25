import { useState, useEffect, useCallback } from 'react'

export interface ScanHistoryItem {
  id: string
  timestamp: number
  diseaseName: string
  diseaseNameIndo: string
  confidence: number
  imageDataUrl: string
  category: string
}

const STORAGE_KEY = 'oryzadetect_history'
const MAX_ITEMS = 5

function compress(dataUrl: string): string {
  // Simpan hanya jika ukuran kecil (< 50KB agar tidak memenuhi localStorage)
  // Jika besar, simpan string kosong — thumbnail tidak tampil tapi data tetap aman
  if (dataUrl.length < 50_000) return dataUrl
  return ''
}

export function useScanHistory() {
  const [history, setHistory] = useState<ScanHistoryItem[]>([])

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) setHistory(JSON.parse(stored))
    } catch {
      setHistory([])
    }
  }, [])

  const save = useCallback((items: ScanHistoryItem[]) => {
    setHistory(items)
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
      } catch {
        // Storage full — clear and retry
        localStorage.removeItem(STORAGE_KEY)
      }
    }
  }, [])

  const addScan = useCallback(
    (item: Omit<ScanHistoryItem, 'id' | 'timestamp'> & { imageDataUrl: string }) => {
      const newItem: ScanHistoryItem = {
        ...item,
        id: Date.now().toString(),
        timestamp: Date.now(),
        imageDataUrl: compress(item.imageDataUrl),
      }
      setHistory((prev) => {
        const updated = [newItem, ...prev].slice(0, MAX_ITEMS)
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
          } catch {
            localStorage.removeItem(STORAGE_KEY)
          }
        }
        return updated
      })
    },
    []
  )

  const clearHistory = useCallback(() => {
    save([])
  }, [save])

  const deleteItem = useCallback(
    (id: string) => {
      setHistory((prev) => {
        const updated = prev.filter((item) => item.id !== id)
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
          } catch {
            // ignore
          }
        }
        return updated
      })
    },
    []
  )

  return { history, addScan, clearHistory, deleteItem }
}
