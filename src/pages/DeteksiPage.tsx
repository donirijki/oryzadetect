import { useState, useCallback, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload, Loader2, CheckCircle, AlertCircle,
  Target, Beaker, Leaf, Shield, Camera, Images,
  RotateCcw, Download, Sparkles, ArrowRight, X, Eye
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { detectDisease, type DetectionResult } from '@/lib/api'
import { getCategoryBadgeStyles, getSeverityBadgeStyles } from '@/lib/badge-styles'
import { useScanHistory } from '@/hooks/useScanHistory'
import { toast } from 'sonner'

import { BG, SURFACE, BORDER, PRIMARY, MUTED, FG } from '@/lib/theme'

type State = 'idle' | 'loading' | 'success' | 'error'

const LOADING_STEPS = ['Memproses gambar...', 'Mengekstrak fitur...', 'Menganalisis pola...', 'Membuat Grad-CAM...']

export default function DeteksiPage() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [state, setState] = useState<State>('idle')
  const [result, setResult] = useState<DetectionResult | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [loadingStep, setLoadingStep] = useState(0)
  const [errorMsg, setErrorMsg] = useState('')
  const [formatError, setFormatError] = useState(false)
  const [showGradcam, setShowGradcam] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)
  const previewUrlRef = useRef<string | null>(null)
  const { history, addScan, clearHistory, deleteItem } = useScanHistory()

  useEffect(() => {
    if (state !== 'loading') return
    const iv = setInterval(() => setLoadingStep((s) => (s + 1) % 3), 700)
    return () => clearInterval(iv)
  }, [state])

  const handleFile = useCallback((f: File | null) => {
    if (!f) return
    if (!f.type.startsWith('image/')) {
      setFormatError(true)
      return
    }
    setFormatError(false)
    // FIX: Revoke previous object URL to prevent memory leak
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current)
    }
    const url = URL.createObjectURL(f)
    previewUrlRef.current = url
    setFile(f)
    setPreview(url)
    setState('idle')
    setResult(null)
    setShowGradcam(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragOver(false)
    handleFile(e.dataTransfer.files[0])
  }, [handleFile])

  const handleAnalyze = async () => {
    if (!file) return
    setState('loading'); setLoadingStep(0); setErrorMsg('')
    try {
      const r = await detectDisease(file)
      setResult(r); setState('success')
      if (preview) {
        addScan({
          diseaseName: r.disease,
          diseaseNameIndo: r.nameIndo,
          confidence: r.confidence,
          imageDataUrl: preview,
          category: r.category,
        })
      }
    } catch {
      setState('error'); setErrorMsg('Gagal memproses gambar. Periksa koneksi dan coba lagi.')
      toast.error('Analisis Gagal', { description: 'Gagal memproses gambar. Periksa koneksi.' })
    }
  }

  const reset = () => {
    // FIX: Revoke object URL on reset
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current)
      previewUrlRef.current = null
    }
    // FIX: Reset input element value so same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = ''
    setFile(null); setPreview(null); setState('idle'); setResult(null); setShowGradcam(false); setFormatError(false)
  }

  const catStyle = result ? getCategoryBadgeStyles(result.category) : null
  const sevStyle = result?.severity ? getSeverityBadgeStyles(result.severity) : null

  const handleDownload = async () => {
    if (!result) return
    // Lazy load jsPDF — hanya diload saat tombol diklik, tidak menambah bundle awal
    const { jsPDF } = await import('jspdf')
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    const W = doc.internal.pageSize.getWidth()
    const margin = 20
    const contentW = W - margin * 2
    let y = 0

    // ── Header bar ──
    doc.setFillColor(2, 8, 4)       // #020804
    doc.rect(0, 0, W, 38, 'F')
    doc.setFillColor(34, 197, 94)   // #22c55e accent line
    doc.rect(0, 36, W, 2, 'F')

    doc.setTextColor(34, 197, 94)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(20)
    doc.text('OryzaDetect', margin, 18)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(107, 156, 122)
    doc.text('Platform Deteksi Penyakit Tanaman Padi — AI Report', margin, 26)

    // Tanggal
    const now = new Date()
    const dateStr = now.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })
    const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    doc.setTextColor(107, 156, 122)
    doc.setFontSize(8)
    doc.text(`${dateStr}, ${timeStr}`, W - margin, 26, { align: 'right' })

    y = 50

    // ── Section: Hasil Deteksi ──
    doc.setFillColor(10, 26, 14)    // SURFACE
    doc.roundedRect(margin, y, contentW, 52, 3, 3, 'F')
    doc.setDrawColor(26, 53, 32)
    doc.roundedRect(margin, y, contentW, 52, 3, 3, 'S')

    doc.setTextColor(107, 156, 122)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.text('HASIL DETEKSI AI', margin + 6, y + 9)

    doc.setTextColor(232, 245, 236)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(18)
    doc.text(result.disease, margin + 6, y + 22)

    doc.setFontSize(11)
    doc.setTextColor(107, 156, 122)
    doc.text(result.nameIndo, margin + 6, y + 31)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'italic')
    doc.text(result.nameLatin || '', margin + 6, y + 38)

    // Confidence bar
    const barX = margin + 6
    const barY = y + 44
    const barW = contentW - 12
    doc.setFillColor(26, 53, 32)
    doc.roundedRect(barX, barY, barW, 4, 2, 2, 'F')
    doc.setFillColor(34, 197, 94)
    doc.roundedRect(barX, barY, barW * (result.confidence / 100), 4, 2, 2, 'F')

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.setTextColor(34, 197, 94)
    doc.text(`Kepercayaan: ${result.confidence}%`, W - margin - 6, barY + 3, { align: 'right' })

    y += 62

    // ── Info badges row ──
    const badgeY = y
    const badges = [
      { label: 'Kategori', value: result.category },
      { label: 'Keparahan', value: result.severity || 'N/A' },
    ]
    badges.forEach((b, i) => {
      const bx = margin + i * 60
      doc.setFillColor(10, 26, 14)
      doc.setDrawColor(26, 53, 32)
      doc.roundedRect(bx, badgeY, 55, 14, 2, 2, 'FD')
      doc.setTextColor(107, 156, 122)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(7)
      doc.text(b.label.toUpperCase(), bx + 4, badgeY + 5)
      doc.setTextColor(232, 245, 236)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(9)
      doc.text(b.value, bx + 4, badgeY + 11)
    })

    y += 24

    // ── Grad-CAM Image ──
    if (result.gradcam_url) {
      try {
        doc.setFillColor(10, 26, 14)
        doc.setDrawColor(26, 53, 32)
        doc.roundedRect(margin, y, contentW, 75, 3, 3, 'FD')

        doc.setFillColor(34, 197, 94)
        doc.rect(margin, y, 3, 75, 'F')

        doc.setTextColor(34, 197, 94)
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(9)
        doc.text('Visualisasi Grad-CAM', margin + 9, y + 9)

        doc.setFont('helvetica', 'normal')
        doc.setFontSize(8)
        doc.setTextColor(107, 156, 122)
        doc.text('Area yang di-highlight merah menunjukkan fokus analisis AI.', margin + 9, y + 15)

        // Draw image (centered, height 50mm, auto-width usually handles via aspect ratio, 
        // but since jsPDF requires both w and h, we set fixed 50x50 to avoid stretching too badly
        // or we could let it be 50x50 which is safe for most portraits)
        doc.addImage(result.gradcam_url, 'PNG', margin + (contentW / 2) - 25, y + 20, 50, 50)
        
        y += 80
      } catch (e) {
        console.error("Failed to add Grad-CAM to PDF:", e)
      }
    }

    // ── Helper: section block ──
    const pageH = doc.internal.pageSize.getHeight()
    const footerStart = pageH - 22  // Reserve space for footer

    const addSection = (title: string, items: string[]) => {
      if (items.length === 0) return
      const blockH = 14 + items.length * 7 + 4

      // Skip section entirely if it would overflow into footer
      if (y + blockH > footerStart) return

      doc.setFillColor(10, 26, 14)
      doc.setDrawColor(26, 53, 32)
      doc.roundedRect(margin, y, contentW, blockH, 3, 3, 'FD')

      // Green left accent bar
      doc.setFillColor(34, 197, 94)
      doc.rect(margin, y, 3, blockH, 'F')

      doc.setTextColor(34, 197, 94)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(9)
      doc.text(title, margin + 9, y + 9)

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)
      doc.setTextColor(232, 245, 236)
      items.forEach((item, idx) => {
        const lineY = y + 16 + idx * 7
        // Guard: don't draw bullet/text below footer
        if (lineY > footerStart - 5) return
        doc.setFillColor(34, 197, 94)
        doc.circle(margin + 11, lineY - 1.5, 1, 'F')
        const lines = doc.splitTextToSize(item, contentW - 20)
        doc.text(lines, margin + 15, lineY)
      })
      y += blockH + 5
    }

    // ── Gejala ──
    addSection('Gejala Penyakit', result.symptoms)

    // ── Penanganan ──
    addSection('Penanganan Kimia', result.treatment.chemical)
    addSection('Penanganan Organik', result.treatment.organic)
    addSection('Langkah Pencegahan', result.treatment.prevention)

    // ── Footer ── (selalu di paling bawah)
    doc.setFillColor(2, 8, 4)
    doc.rect(0, pageH - 18, W, 18, 'F')
    doc.setFillColor(26, 53, 32)
    doc.rect(0, pageH - 19, W, 1, 'F')
    doc.setTextColor(107, 156, 122)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    doc.text('© OryzaDetect — Hasil bersifat referensi, konsultasikan ke penyuluh pertanian setempat.', margin, pageH - 10)
    doc.text(`donnyrizkyramadhan@gmail.com`, W - margin, pageH - 10, { align: 'right' })

    doc.save(`OryzaDetect_${result.disease.replace(/\s+/g, '_')}_${now.toISOString().slice(0,10)}.pdf`)
    toast.success('PDF Berhasil Diunduh', { description: 'Laporan disimpan sebagai PDF' })
  }

  return (
    <div style={{ backgroundColor: BG, minHeight: '100vh' }}>
      <Navbar />

      {/* Header */}
      <section className="relative pt-28 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(34,197,94,0.05), transparent)' }} />
        <div className="absolute inset-0 grid-dot-pattern opacity-50" />
        <motion.div className="absolute top-10 left-1/4 w-96 h-96 rounded-full blur-3xl" style={{ backgroundColor: 'rgba(34,197,94,0.06)' }} animate={{ scale: [1,1.2,1], opacity: [0.4,0.7,0.4] }} transition={{ duration: 8, repeat: Infinity }} />

        <div className="relative max-w-3xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-semibold tracking-widest uppercase mb-6 glass" style={{ color: PRIMARY }}>
              <motion.span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: PRIMARY }} animate={{ scale: [1,1.4,1], opacity: [1,0.4,1] }} transition={{ duration: 2, repeat: Infinity }} />
              AI-Powered Detection
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4" style={{ fontFamily: 'var(--font-display)', color: FG }}>
              Deteksi Penyakit <span style={{ color: PRIMARY }}>Tanaman Padi</span>
            </h1>
            <p className="text-base" style={{ color: MUTED }}>
              Unggah foto daun padi untuk mendapatkan diagnosa AI secara instan.
            </p>
          </motion.div>
        </div>

        {/* Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" className="w-full">
            <path d="M0 60V30C240 10 480 0 720 10C960 20 1200 40 1440 30V60H0Z" fill={SURFACE} />
          </svg>
        </div>
      </section>

      {/* Main */}
      <section className="px-4 sm:px-6 lg:px-8 pb-24" style={{ backgroundColor: SURFACE }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-[380px_1fr] gap-6">

            {/* ── Upload Panel ── */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
                className="rounded-2xl p-6 sticky top-24"
                style={{ backgroundColor: '#0f2014', border: `1px solid ${BORDER}` }}
              >
                {/* Zone */}
                <div
                  onDrop={handleDrop}
                  onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }}
                  onDragLeave={() => setIsDragOver(false)}
                  className="relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300"
                  style={{
                    borderColor: isDragOver ? PRIMARY : (preview ? 'rgba(34,197,94,0.3)' : BORDER),
                    backgroundColor: isDragOver ? 'rgba(34,197,94,0.08)' : '#050f08',
                    transform: isDragOver ? 'scale(1.02)' : 'scale(1)',
                  }}
                >
                  {preview ? (
                    <div className="relative">
                      <img src={preview} alt="Preview" width={200} height={200} className="object-contain rounded-xl mx-auto max-h-[200px] w-auto" />
                      <button
                        onClick={reset}
                        className="absolute -top-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
                        style={{ backgroundColor: '#ef4444' }}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                      {/* Scan overlay on loading */}
                      {state === 'loading' && (
                        <div className="absolute inset-0 rounded-xl overflow-hidden">
                          <motion.div
                            className="absolute left-0 right-0 h-1"
                            style={{ background: 'linear-gradient(90deg, transparent, rgba(34,197,94,0.6), transparent)' }}
                            animate={{ top: ['-5%', '105%'] }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                      <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }} className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'rgba(34,197,94,0.08)', border: `1px solid rgba(34,197,94,0.15)` }}>
                        <Upload className="w-7 h-7" style={{ color: PRIMARY }} />
                      </motion.div>
                      <p className="font-semibold text-sm mb-1" style={{ color: FG }}>Unggah Foto Daun</p>
                      <p className="text-xs mb-3" style={{ color: MUTED }}>Seret gambar ke sini, atau pilih opsi di bawah</p>
                      <span className="inline-block px-3 py-1 rounded-full text-[10px] font-mono-data mb-4" style={{ backgroundColor: 'rgba(34,197,94,0.06)', color: MUTED, border: `1px solid ${BORDER}` }}>
                        JPG · PNG · WEBP · Max 10MB
                      </span>

                      {/* Buttons: Responsive layout for mobile vs laptop */}
                      <div className="flex sm:hidden gap-2 w-full">
                        <button
                          type="button"
                          onClick={() => cameraInputRef.current?.click()}
                          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all hover:opacity-80"
                          style={{ backgroundColor: 'rgba(34,197,94,0.1)', color: PRIMARY, border: `1px solid rgba(34,197,94,0.25)` }}
                        >
                          <Camera className="w-4 h-4" />
                          Kamera
                        </button>
                        <button
                          type="button"
                          onClick={() => galleryInputRef.current?.click()}
                          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all hover:opacity-80"
                          style={{ backgroundColor: 'rgba(34,197,94,0.1)', color: PRIMARY, border: `1px solid rgba(34,197,94,0.25)` }}
                        >
                          <Images className="w-4 h-4" />
                          Galeri
                        </button>
                      </div>

                      {/* Desktop Button */}
                      <div className="hidden sm:flex w-full">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all hover:opacity-80"
                          style={{ backgroundColor: 'rgba(34,197,94,0.1)', color: PRIMARY, border: `1px solid rgba(34,197,94,0.25)` }}
                        >
                          <Upload className="w-4 h-4" />
                          Pilih File
                        </button>
                      </div>

                      {/* Hidden inputs — camera opens camera, gallery opens file picker */}
                      <input ref={fileInputRef} type="file" onChange={(e) => handleFile(e.target.files?.[0] || null)} className="hidden" />
                      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={(e) => handleFile(e.target.files?.[0] || null)} className="hidden" />
                      <input ref={galleryInputRef} type="file" onChange={(e) => handleFile(e.target.files?.[0] || null)} className="hidden" />
                    </>
                  )}
                </div>

                {/* Format error warning */}
                <AnimatePresence>
                  {formatError && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: 'auto' }}
                      exit={{ opacity: 0, y: -8, height: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden mt-3"
                    >
                      <div
                        className="flex items-start gap-3 px-4 py-3 rounded-xl"
                        style={{
                          backgroundColor: SURFACE,
                          border: `1px solid ${BORDER}`,
                        }}
                      >
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: PRIMARY }} />
                        <p className="text-xs leading-relaxed flex-1" style={{ color: MUTED }}>
                          <span className="font-semibold" style={{ color: FG }}>Format tidak didukung.</span>{' '}
                          Gunakan gambar dengan format{' '}
                          <span className="font-mono font-semibold" style={{ color: PRIMARY }}>.jpg</span>,{' '}
                          <span className="font-mono font-semibold" style={{ color: PRIMARY }}>.png</span>, atau{' '}
                          <span className="font-mono font-semibold" style={{ color: PRIMARY }}>.webp</span>.
                        </p>
                        <button
                          onClick={() => setFormatError(false)}
                          className="shrink-0 p-0.5 rounded hover:opacity-70 transition-opacity"
                          style={{ color: MUTED }}
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Loading steps */}
                <AnimatePresence>
                  {state === 'loading' && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-4 overflow-hidden">
                      <div className="space-y-2">
                        {LOADING_STEPS.map((step, i) => (
                          <div key={step} className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full transition-colors" style={{ backgroundColor: i === loadingStep ? PRIMARY : BORDER }} />
                            <span className="text-xs transition-colors" style={{ color: i === loadingStep ? PRIMARY : MUTED }}>{step}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Analyze button */}
                <motion.div whileHover={{ scale: file && state !== 'loading' ? 1.01 : 1 }} whileTap={{ scale: 0.98 }} className="mt-4">
                  <Button
                    onClick={handleAnalyze}
                    disabled={!file || state === 'loading'}
                    className="w-full h-12 rounded-xl font-semibold text-sm"
                    style={{
                      backgroundColor: file && state !== 'loading' ? PRIMARY : '#1f3d28',
                      color: file && state !== 'loading' ? BG : '#6b7280',
                    }}
                  >
                    {state === 'loading' ? (
                      <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Menganalisis...</span>
                    ) : (
                      <span className="flex items-center gap-2"><Sparkles className="w-4 h-4" /> Analisis Sekarang</span>
                    )}
                  </Button>
                </motion.div>

                <p className="text-center text-[10px] mt-3" style={{ color: 'rgba(107,156,122,0.5)' }}>
                  Diproses menggunakan CNN VGG16 · Data tidak disimpan
                </p>

                {/* History */}
                {history.length > 0 && (
                  <div className="mt-6 pt-6" style={{ borderTop: `1px solid ${BORDER}` }}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold" style={{ color: FG }}>Riwayat Scan</span>
                      <button onClick={clearHistory} className="text-[10px]" style={{ color: MUTED }}>Hapus Semua</button>
                    </div>
                    <div className="space-y-2">
                      {history.map((item) => (
                        <div key={item.id} className="flex items-center gap-3 p-2 rounded-xl" style={{ backgroundColor: BG }}>
                          <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0 bg-[#1a3520] flex items-center justify-center">
                            {item.imageDataUrl && !item.imageDataUrl.endsWith('...') ? (
                              <img src={item.imageDataUrl} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <Leaf className="w-4 h-4" style={{ color: MUTED }} />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate" style={{ color: FG }}>{item.diseaseName}</p>
                            <p className="text-[10px]" style={{ color: MUTED }}>
                              {new Date(item.timestamp).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                          <button onClick={() => deleteItem(item.id)} className="p-1" style={{ color: MUTED }}>
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            </div>

            {/* ── Result Panel ── */}
            <div className="min-h-[500px]">
              <AnimatePresence mode="wait">

                {/* Idle */}
                {state === 'idle' && (
                  <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full flex flex-col items-center justify-center text-center py-20 rounded-2xl" style={{ border: `1px dashed ${BORDER}` }}>
                    <svg className="w-20 h-20 mb-6" viewBox="0 0 80 80" fill="none">
                      <path d="M40 8C40 8 20 20 20 40C20 55 30 68 40 72C50 68 60 55 60 40C60 20 40 8 40 8Z" stroke="rgba(34,197,94,0.3)" strokeWidth="1.5" fill="none" />
                      <path d="M40 20C40 20 28 28 28 40C28 50 34 58 40 62" stroke="rgba(34,197,94,0.2)" strokeWidth="1" fill="none" />
                    </svg>
                    <h3 className="text-xl font-bold mb-2" style={{ fontFamily: 'var(--font-display)', color: FG }}>Unggah foto untuk memulai</h3>
                    <p className="text-sm mb-8" style={{ color: MUTED }}>Hasil diagnosa AI akan muncul di sini</p>
                    <div className="flex gap-6">
                      {[{ icon: Target, label: 'Akurat' }, { icon: Sparkles, label: 'Cepat' }, { icon: CheckCircle, label: 'Terperinci' }].map(({ icon: Icon, label }) => (
                        <div key={label} className="flex flex-col items-center gap-2">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(34,197,94,0.06)', border: `1px solid ${BORDER}` }}>
                            <Icon className="w-5 h-5" style={{ color: PRIMARY }} />
                          </div>
                          <span className="text-xs" style={{ color: MUTED }}>{label}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Loading skeleton */}
                {state === 'loading' && (
                  <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                    {[120, 200, 160, 100].map((h, i) => (
                      <div key={i} className="rounded-2xl shimmer" style={{ height: h, border: `1px solid ${BORDER}` }} />
                    ))}
                    <p className="text-center text-sm" style={{ color: MUTED }}>Perkiraan selesai &lt; 10 detik</p>
                  </motion.div>
                )}

                {/* Error */}
                {state === 'error' && (
                  <motion.div key="error" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center py-20 rounded-2xl text-center" style={{ border: `1px solid rgba(248,113,113,0.2)`, backgroundColor: 'rgba(248,113,113,0.04)' }}>
                    <AlertCircle className="w-12 h-12 mb-4" style={{ color: '#f87171' }} />
                    <h3 className="text-lg font-bold mb-2" style={{ color: FG }}>Gagal Memproses Gambar</h3>
                    <p className="text-sm mb-6 max-w-xs" style={{ color: MUTED }}>{errorMsg}</p>
                    <Button onClick={reset} className="rounded-xl" style={{ backgroundColor: PRIMARY, color: BG }}>Coba Lagi</Button>
                  </motion.div>
                )}

                {/* Success */}
                {state === 'success' && result && (
                  <motion.div key="success" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">

                    {/* Header */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl p-6" style={{ backgroundColor: BG, border: `1px solid ${BORDER}` }}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex flex-wrap gap-2 mb-3">
                            {catStyle && (
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}>
                                {result.category}
                              </span>
                            )}
                            {sevStyle && (
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${sevStyle.bg} ${sevStyle.text} ${sevStyle.border}`}>
                                {result.severity}
                              </span>
                            )}
                          </div>
                          <h2 className="text-2xl font-bold mb-1" style={{ fontFamily: 'var(--font-display)', color: FG }}>{result.disease}</h2>
                          <p className="text-sm italic mb-1" style={{ color: MUTED }}>{result.nameLatin}</p>
                          <p className="text-sm" style={{ color: MUTED }}>{result.nameIndo}</p>
                        </div>
                        {preview && (
                          <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0" style={{ border: `1px solid ${BORDER}` }}>
                            <img src={preview} alt="" className="w-full h-full object-cover" />
                          </div>
                        )}
                      </div>
                    </motion.div>

                    {/* Confidence */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-2xl p-6" style={{ backgroundColor: BG, border: `1px solid ${BORDER}` }}>
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-sm font-medium" style={{ color: FG }}>Tingkat Keyakinan AI</p>
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold mt-1 ${result.confidence >= 85 ? 'text-[#22c55e] bg-[#22c55e]/10' : result.confidence >= 60 ? 'text-amber-400 bg-amber-400/10' : 'text-red-400 bg-red-400/10'}`}>
                            {result.confidence >= 85 ? 'Sangat Yakin' : result.confidence >= 60 ? 'Cukup Yakin' : 'Kurang Yakin'}
                          </span>
                        </div>
                        <span className="text-5xl font-bold font-mono-data" style={{ color: result.confidence >= 85 ? PRIMARY : result.confidence >= 60 ? '#fbbf24' : '#f87171' }}>
                          {result.confidence}%
                        </span>
                      </div>
                      <div className="h-3 rounded-full overflow-hidden mb-5" style={{ backgroundColor: '#1a3520' }}>
                        <motion.div className="h-full rounded-full" style={{ backgroundColor: result.confidence >= 85 ? PRIMARY : result.confidence >= 60 ? '#fbbf24' : '#f87171' }} initial={{ width: 0 }} animate={{ width: `${result.confidence}%` }} transition={{ duration: 1.4, ease: 'easeOut' }} />
                      </div>
                      <div className="space-y-2">
                        {result.top3.map((p, i) => (
                          <div key={p.name} className="flex items-center gap-3">
                            <span className="text-xs w-36 truncate" style={{ color: MUTED }}>{p.name}</span>
                            <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: '#1a3520' }}>
                              <motion.div className="h-full rounded-full" style={{ backgroundColor: i === 0 ? PRIMARY : 'rgba(34,197,94,0.3)' }} initial={{ width: 0 }} animate={{ width: `${p.confidence}%` }} transition={{ duration: 1, delay: i * 0.1 }} />
                            </div>
                            <span className="text-xs font-mono-data w-10 text-right" style={{ color: i === 0 ? PRIMARY : MUTED }}>{p.confidence}%</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>

                    {/* Gejala chips */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-2xl p-6" style={{ backgroundColor: BG, border: `1px solid ${BORDER}` }}>
                      <p className="text-sm font-semibold mb-4" style={{ color: FG }}>Gejala yang Teridentifikasi</p>
                      <div className="flex flex-wrap gap-2">
                        {result.symptoms.map((s) => (
                          <span key={s} className="px-3 py-1 rounded-full text-xs" style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}`, color: MUTED }}>{s}</span>
                        ))}
                      </div>
                    </motion.div>

                    {/* Tabs */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="rounded-2xl p-6" style={{ backgroundColor: BG, border: `1px solid ${BORDER}` }}>
                      <Tabs defaultValue="chemical">
                        <TabsList className="mb-5 w-full" style={{ backgroundColor: SURFACE }}>
                          <TabsTrigger value="chemical" className="flex-1 gap-1.5"><Beaker className="w-3.5 h-3.5" />Kimia</TabsTrigger>
                          <TabsTrigger value="organic" className="flex-1 gap-1.5"><Leaf className="w-3.5 h-3.5" />Organik</TabsTrigger>
                          <TabsTrigger value="prevention" className="flex-1 gap-1.5"><Shield className="w-3.5 h-3.5" />Pencegahan</TabsTrigger>
                        </TabsList>
                        {(['chemical', 'organic', 'prevention'] as const).map((key) => (
                          <TabsContent key={key} value={key}>
                            <ul className="space-y-3">
                              {result.treatment[key].map((item) => (
                                <li key={item} className="flex gap-3 text-sm" style={{ color: MUTED }}>
                                  <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: PRIMARY }} />
                                  {item}
                                </li>
                              ))}
                              {result.treatment[key].length === 0 && (
                                <li className="text-sm" style={{ color: MUTED }}>Tanaman sehat — pertahankan perawatan rutin.</li>
                              )}
                            </ul>
                          </TabsContent>
                        ))}
                      </Tabs>
                    </motion.div>

                    {/* Grad-CAM Panel */}
                    {result.gradcam_url && (
                      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="rounded-2xl p-6" style={{ backgroundColor: BG, border: `1px solid ${BORDER}` }}>
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <p className="text-sm font-semibold flex items-center gap-2" style={{ color: FG }}>
                              <Eye className="w-4 h-4" style={{ color: PRIMARY }} />
                              Grad-CAM — Area yang Dianalisis AI
                            </p>
                            <p className="text-xs mt-1" style={{ color: MUTED }}>Area merah = fokus model saat mendeteksi penyakit</p>
                          </div>
                          <button
                            onClick={() => setShowGradcam(v => !v)}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                            style={{ backgroundColor: showGradcam ? PRIMARY : 'rgba(34,197,94,0.1)', color: showGradcam ? BG : PRIMARY, border: `1px solid rgba(34,197,94,0.3)` }}
                          >
                            {showGradcam ? 'Sembunyikan' : 'Tampilkan'}
                          </button>
                        </div>
                        <AnimatePresence>
                          {showGradcam && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                              <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                  <p className="text-[10px] text-center font-semibold" style={{ color: MUTED }}>GAMBAR ASLI</p>
                                  {preview && <img src={preview} alt="Original" className="w-full rounded-xl object-contain max-h-52" style={{ border: `1px solid ${BORDER}` }} />}
                                </div>
                                <div className="space-y-2">
                                  <p className="text-[10px] text-center font-semibold" style={{ color: PRIMARY }}>GRAD-CAM HEATMAP</p>
                                  <img src={result.gradcam_url} alt="Grad-CAM" className="w-full rounded-xl object-contain max-h-52" style={{ border: `1px solid rgba(34,197,94,0.3)` }} />
                                </div>
                              </div>
                              <div className="mt-3 flex items-center justify-center gap-3">
                                <div className="flex items-center gap-6 px-4 py-2 rounded-lg" style={{ backgroundColor: SURFACE }}>
                                  {[['#1e0a3c','Rendah'],['#b5305b','Sedang'],['#f07f2b','Tinggi'],['#fcffa4','Sangat Tinggi']].map(([color, label]) => (
                                    <div key={label} className="flex items-center gap-1">
                                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                                      <span className="text-[10px]" style={{ color: MUTED }}>{label}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    )}

                    {/* Actions */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="flex gap-3 flex-wrap">
                      <Button onClick={handleDownload} variant="outline" className="rounded-xl gap-2 flex-1" style={{ borderColor: BORDER, color: FG }}>
                        <Download className="w-4 h-4" /> Unduh Laporan PDF
                      </Button>
                      <Button onClick={reset} variant="outline" className="rounded-xl gap-2 flex-1" style={{ borderColor: BORDER, color: FG }}>
                        <RotateCcw className="w-4 h-4" /> Scan Ulang
                      </Button>
                    </motion.div>

                    <div className="text-center pt-2">
                      <Link to="/informasi" className="inline-flex items-center gap-1 text-sm hover:underline" style={{ color: PRIMARY }}>
                        Lihat info lengkap penyakit <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
