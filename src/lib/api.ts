// lib/api.ts
export interface DetectionResult {
  success: boolean
  disease: string
  nameIndo: string
  nameLatin: string
  category: "Bakteri" | "Jamur" | "Virus" | "Sehat" | "Hama"
  severity: "Tinggi" | "Sedang" | "Rendah" | null
  confidence: number
  top3: { name: string; confidence: number }[]
  symptoms: string[]
  treatment: {
    chemical: string[]
    organic: string[]
    prevention: string[]
  }
  gradcam_url?: string  // Base64 encoded Grad-CAM heatmap overlay PNG
}

const API_URL = import.meta.env.VITE_API_URL || "https://oryzadetect.ste.gripe"

export async function detectDisease(file: File): Promise<DetectionResult> {
  const formData = new FormData()
  formData.append("file", file)

  const controller = new AbortController()
  // FIX: Tambah timeout 60 detik agar tidak hang selamanya
  const timeoutId = setTimeout(() => controller.abort(), 60_000)

  try {
    const response = await fetch(`${API_URL}/predict`, {
      method: "POST",
      body: formData,
      signal: controller.signal,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.detail || "Gagal menghubungi server analisis")
    }

    return response.json()
  } catch (err: unknown) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error("Waktu analisis habis (timeout 60 detik). Coba lagi.")
    }
    throw err
  } finally {
    clearTimeout(timeoutId)
  }
}
