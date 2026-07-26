import { useState, useEffect, useRef, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import {
  ScanLine, ArrowRight, Zap, Shield, Clock,
  FlaskConical, Wifi, FileText, Code, ChevronDown,
  Upload, Brain, FileCheck, Sparkles, Leaf
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { fadeUp, stagger, scaleIn } from '@/lib/animations'

const BG = '#020804'
const SURFACE = '#0a1a0e'
const BORDER = '#1a3520'
const PRIMARY = '#22c55e'
const MUTED = '#6b9c7a'
const FG = '#e8f5ec'

export default function BerandaPage() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [mounted, setMounted] = useState(false)
  const heroRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  useEffect(() => {
    setMounted(true)
    const handleMouse = (e: MouseEvent) => setMousePos({ x: e.clientX, y: e.clientY })
    window.addEventListener('mousemove', handleMouse, { passive: true })
    return () => window.removeEventListener('mousemove', handleMouse)
  }, [])

  const particles = useMemo(
    () =>
      mounted
        ? Array.from({ length: 12 }).map((_, i) => ({
            id: i,
            x: `${10 + (i * 7.3) % 80}%`,  // Deterministik, bukan random
            delay: (i * 0.41) % 5,
            duration: 4 + (i * 0.33) % 4,
          }))
        : [],
    [mounted]
  )

  return (
    <div style={{ backgroundColor: BG, minHeight: '100vh' }}>
      <Navbar />

      {/* ── HERO ── */}
      <motion.section
        ref={heroRef}
        style={{ opacity: heroOpacity, position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center' }}
        className="overflow-hidden px-4 sm:px-6 lg:px-8 pt-8 pb-24"
      >
        {/* Layer 1: solid bg */}
        <div className="absolute inset-0" style={{ backgroundColor: BG }} />

        {/* Layer 2: dot grid */}
        <div className="absolute inset-0 grid-dot-pattern" />

        {/* Layer 3: mouse-follow gradient */}
        <div
          className="absolute inset-0 pointer-events-none transition-all duration-300"
          style={{
            background: `radial-gradient(800px circle at ${mousePos.x}px ${mousePos.y}px, rgba(34,197,94,0.07), transparent 70%)`,
          }}
        />

        {/* Layer 4: vertical accent lines */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 bottom-0 left-1/4 w-px" style={{ background: 'linear-gradient(to bottom, transparent, rgba(34,197,94,0.08), transparent)' }} />
          <div className="absolute top-0 bottom-0 right-1/4 w-px" style={{ background: 'linear-gradient(to bottom, transparent, rgba(34,197,94,0.08), transparent)' }} />
        </div>

        {/* Layer 5: floating particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {particles.map((p) => (
            <motion.div
              key={p.id}
              className="absolute w-1 h-1 rounded-full"
              style={{ left: p.x, bottom: '20%', backgroundColor: PRIMARY }}
              animate={{ y: [-20, -120], opacity: [0, 0.5, 0] }}
              transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'easeOut' }}
            />
          ))}
        </div>

        {/* Content */}
        <div className="relative max-w-7xl mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">

            {/* Left */}
            <motion.div initial="hidden" animate="visible" variants={stagger}>
              {/* Badge */}
              <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8">
                <motion.span
                  animate={{ scale: [1, 1.4, 1], opacity: [1, 0.4, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: PRIMARY }}
                />
                <span className="text-[10px] font-semibold tracking-[0.2em] uppercase" style={{ color: PRIMARY }}>
                  Teknologi AI untuk Pertanian
                </span>
              </motion.div>

              {/* Heading */}
              <motion.h1
                variants={fadeUp}
                className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight mb-6"
                style={{ fontFamily: 'var(--font-display)', color: FG }}
              >
                Deteksi Penyakit
                <br />
                <span style={{ color: PRIMARY }} className="relative inline-block">
                  Tanaman Padi
                  <motion.svg
                    className="absolute -bottom-2 left-0 w-full"
                    height="6" viewBox="0 0 200 6" fill="none"
                  >
                    <motion.path
                      d="M2 4 Q50 1 100 4 Q150 7 198 4"
                      stroke={PRIMARY} strokeWidth="2" strokeLinecap="round"
                      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                      transition={{ delay: 1, duration: 1, ease: 'easeOut' }}
                    />
                  </motion.svg>
                </span>
              </motion.h1>

              {/* Sub */}
              <motion.p variants={fadeUp} className="text-lg leading-relaxed mb-8 max-w-xl" style={{ color: MUTED }}>
                Unggah foto daun padi dan dapatkan diagnosa penyakit beserta rekomendasi penanganan dalam hitungan detik menggunakan teknologi AI.
              </motion.p>

              {/* CTAs */}
              <motion.div variants={fadeUp} className="flex flex-col sm:flex-row w-full sm:w-auto gap-3 sm:gap-4 mb-8 lg:mb-10">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-auto">
                  <Button
                    asChild
                    className="w-full rounded-full px-8 h-14 text-base font-bold glow"
                    style={{ backgroundColor: PRIMARY, color: BG }}
                  >
                    <Link to="/deteksi" className="flex items-center justify-center gap-3 w-full">
                      <ScanLine className="w-5 h-5" />
                      Mulai Deteksi
                      <motion.span
                        animate={{ x: [0, 4, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <ArrowRight className="w-4 h-4" />
                      </motion.span>
                    </Link>
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-auto">
                  <Button
                    asChild
                    variant="outline"
                    className="w-full rounded-full px-8 h-14 text-base font-medium"
                    style={{ borderColor: 'rgba(34,197,94,0.4)', color: PRIMARY, backgroundColor: 'transparent' }}
                  >
                    <Link to="/cara-kerja" className="flex justify-center w-full">Pelajari Cara Kerja</Link>
                  </Button>
                </motion.div>
              </motion.div>

              {/* Trust badges */}
              <motion.div variants={fadeUp} className="flex flex-wrap gap-6">
                {[
                  { icon: Zap, label: 'Gratis Digunakan' },
                  { icon: Shield, label: 'Tanpa Registrasi' },
                  { icon: Clock, label: 'Hasil Instan' },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-2">
                    <Icon className="w-4 h-4" style={{ color: PRIMARY }} />
                    <span className="text-sm font-medium" style={{ color: 'rgba(232,245,236,0.6)' }}>{label}</span>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right — image */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="relative mt-2 lg:mt-0"
            >
              {/* Glow behind */}
              <div className="absolute -inset-4 rounded-3xl blur-3xl" style={{ backgroundColor: 'rgba(34,197,94,0.12)' }} />

              <motion.div
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                className="relative"
              >
                <div className="relative aspect-[4/3] lg:aspect-[4/3] rounded-3xl overflow-hidden" style={{ border: `1px solid rgba(34,197,94,0.2)` }}>
                  <img
                    src="/images/rice-leaf-close.jpg"
                    alt="Daun padi close-up"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(2,8,4,0.7) 0%, transparent 50%)' }} />
                  <div className="scan-line" />
                </div>

                {/* Floating card left */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.9 }}
                  className="absolute -left-2 sm:-left-8 top-1/4 glass rounded-2xl p-3 sm:p-4 max-w-[140px] sm:max-w-[180px] z-10"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(34,197,94,0.15)' }}>
                      <ScanLine className="w-4 h-4" style={{ color: PRIMARY }} />
                    </div>
                    <motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 2, repeat: Infinity }} className="w-2 h-2 rounded-full" style={{ backgroundColor: PRIMARY }} />
                  </div>
                  <p className="text-xs font-semibold" style={{ color: FG }}>AI Detection</p>
                  <p className="text-[10px] mt-0.5" style={{ color: MUTED }}>Powered by CNN VGG16</p>
                </motion.div>

                {/* Floating card right */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.1 }}
                  className="absolute -right-2 sm:-right-8 bottom-1/4 glass rounded-2xl p-3 sm:p-4 max-w-[140px] sm:max-w-[180px] z-10"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(34,197,94,0.15)' }}>
                      <Sparkles className="w-4 h-4" style={{ color: PRIMARY }} />
                    </div>
                    <motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 2, repeat: Infinity, delay: 0.5 }} className="w-2 h-2 rounded-full" style={{ backgroundColor: PRIMARY }} />
                  </div>
                  <p className="text-xs font-semibold" style={{ color: FG }}>Akurasi Tinggi</p>
                  <p className="text-[10px] mt-0.5" style={{ color: MUTED }}>Deep Learning Model</p>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-[10px] tracking-[0.2em] uppercase" style={{ color: MUTED }}>Scroll</span>
          <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
            <ChevronDown className="w-4 h-4" style={{ color: MUTED }} />
          </motion.div>
        </motion.div>
      </motion.section>

      {/* ── KEUNGGULAN ── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE }}>
        <div className="max-w-7xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={stagger} className="text-center mb-16">
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase mb-4" style={{ backgroundColor: 'rgba(34,197,94,0.08)', color: PRIMARY, border: `1px solid rgba(34,197,94,0.2)` }}>
              Keunggulan
            </motion.div>
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-bold mb-4" style={{ fontFamily: 'var(--font-display)', color: FG }}>
              Mengapa Memilih OryzaDetect?
            </motion.h2>
            <motion.p variants={fadeUp} className="text-base max-w-xl mx-auto" style={{ color: MUTED }}>
              Teknologi AI terdepan yang mudah diakses oleh siapapun, kapanpun, dan dimanapun.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}
            variants={stagger}
            className="grid md:grid-cols-3 gap-5"
          >
            {/* Card A — Dataset (col-span-2) */}
            <motion.div
              variants={scaleIn}
              whileHover={{ y: -4 }}
              className="md:col-span-2 relative rounded-2xl p-8 overflow-hidden"
              style={{ backgroundColor: BG, border: `1px solid ${BORDER}` }}
            >
              <div className="corner-accent corner-tl" />
              <div className="corner-accent corner-tr" />
              <div className="corner-accent corner-bl" />
              <div className="corner-accent corner-br" />
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6" style={{ backgroundColor: 'rgba(34,197,94,0.1)', border: `1px solid rgba(34,197,94,0.2)` }}>
                <FlaskConical className="w-6 h-6" style={{ color: PRIMARY }} />
              </div>
              <h3 className="text-xl font-bold mb-3" style={{ fontFamily: 'var(--font-display)', color: FG }}>Dataset Tervalidasi</h3>
              <p className="text-sm leading-relaxed mb-6" style={{ color: MUTED }}>
                Model dilatih menggunakan Rice Leaf Disease Dataset dari Mendeley Data (Khwaja Yunus Ali University), mencakup 8 kelas penyakit padi dan daun sehat yang relevan dengan kondisi lahan pertanian.
              </p>
              <div className="flex gap-8 pt-6" style={{ borderTop: `1px solid ${BORDER}` }}>
                <div>
                  <div className="text-2xl font-bold font-mono-data" style={{ color: PRIMARY }}>8</div>
                  <div className="text-xs mt-0.5" style={{ color: MUTED }}>Kelas Deteksi</div>
                </div>
                <div>
                  <div className="text-2xl font-bold font-mono-data" style={{ color: PRIMARY }}>24/7</div>
                  <div className="text-xs mt-0.5" style={{ color: MUTED }}>Tersedia</div>
                </div>
                <div>
                  <div className="text-2xl font-bold font-mono-data" style={{ color: PRIMARY }}>&lt;10s</div>
                  <div className="text-xs mt-0.5" style={{ color: MUTED }}>Waktu Analisis</div>
                </div>
              </div>
            </motion.div>

            {/* Card B — Akses */}
            <motion.div
              variants={scaleIn}
              whileHover={{ y: -4, borderColor: 'rgba(34,197,94,0.4)' }}
              className="relative rounded-2xl p-8 overflow-hidden group transition-all duration-300"
              style={{ backgroundColor: BG, border: `1px solid rgba(34,197,94,0.2)` }}
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" style={{ background: 'linear-gradient(135deg, rgba(34,197,94,0.06), transparent)' }} />
              <div className="relative">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6" style={{ backgroundColor: 'rgba(34,197,94,0.08)', border: `1px solid rgba(34,197,94,0.15)` }}>
                  <Wifi className="w-6 h-6" style={{ color: PRIMARY }} />
                </div>
                <h3 className="text-xl font-bold mb-3" style={{ fontFamily: 'var(--font-display)', color: FG }}>Akses Mudah</h3>
                <p className="text-sm leading-relaxed" style={{ color: MUTED }}>
                  Berjalan langsung di browser tanpa perlu instalasi aplikasi. Cukup foto, unggah, dan dapatkan hasilnya.
                </p>
              </div>
            </motion.div>

            {/* Card C — Laporan */}
            <motion.div
              variants={scaleIn}
              whileHover={{ y: -4 }}
              className="relative rounded-2xl p-8 overflow-hidden"
              style={{ backgroundColor: BG, border: `1px solid ${BORDER}` }}
            >
              <div className="corner-accent corner-tl" />
              <div className="corner-accent corner-tr" />
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6" style={{ backgroundColor: 'rgba(34,197,94,0.08)', border: `1px solid rgba(34,197,94,0.15)` }}>
                <FileText className="w-6 h-6" style={{ color: PRIMARY }} />
              </div>
              <h3 className="text-xl font-bold mb-3" style={{ fontFamily: 'var(--font-display)', color: FG }}>Laporan Terperinci</h3>
              <p className="text-sm leading-relaxed" style={{ color: MUTED }}>
                Hasil deteksi mencakup penanganan kimiawi, organik, dan panduan pencegahan jangka panjang.
              </p>
            </motion.div>

            {/* Card D — 7 penyakit (col-span-2) */}
            <motion.div
              variants={scaleIn}
              whileHover={{ y: -4 }}
              className="md:col-span-2 relative rounded-2xl p-8 overflow-hidden group"
              style={{ background: 'linear-gradient(135deg, #064e3b, #052e16)', border: `1px solid rgba(34,197,94,0.25)` }}
            >
              <div className="absolute right-0 bottom-0 opacity-10 group-hover:scale-110 transition-transform duration-700 pointer-events-none">
                <Code className="w-48 h-48" style={{ color: PRIMARY }} />
              </div>
              <h3 className="text-2xl font-bold mb-3 relative" style={{ fontFamily: 'var(--font-display)', color: PRIMARY }}>
                7 Penyakit + Daun Sehat
              </h3>
              <p className="text-sm leading-relaxed mb-6 relative max-w-md" style={{ color: 'rgba(232,245,236,0.8)' }}>
                Bacterial Leaf Blight · Brown Spot · Leaf Scald · Narrow Brown Leaf Spot · Leaf Blast · Sheath Blight · Rice Hispa · Healthy
              </p>
              <Button
                asChild
                variant="outline"
                className="relative rounded-xl font-semibold"
                style={{ borderColor: 'rgba(34,197,94,0.4)', color: PRIMARY, backgroundColor: 'rgba(34,197,94,0.08)' }}
              >
                <Link to="/informasi" className="flex items-center gap-2">
                  Lihat Info Penyakit
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── CARA KERJA ── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: BG }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left — Steps */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={stagger}>
              <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase mb-4" style={{ backgroundColor: 'rgba(34,197,94,0.08)', color: PRIMARY, border: `1px solid rgba(34,197,94,0.2)` }}>
                Cara Kerja
              </motion.div>
              <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-bold mb-12" style={{ fontFamily: 'var(--font-display)', color: FG }}>
                Proses Deteksi yang Efisien
              </motion.h2>

              <div className="space-y-0">
                {[
                  { num: '01', icon: Upload, title: 'Unggah Foto Daun', desc: 'Ambil foto daun padi yang dicurigai terinfeksi. Pastikan foto jelas, fokus, dan menggunakan pencahayaan alami.' },
                  { num: '02', icon: Brain, title: 'Analisis AI', desc: 'Model CNN VGG16 menganalisis citra daun dan mengidentifikasi pola penyakit dalam waktu kurang dari 10 detik.' },
                  { num: '03', icon: FileCheck, title: 'Terima Hasil', desc: 'Dapatkan diagnosa lengkap dengan tingkat keyakinan, gejala, dan rekomendasi penanganan yang tepat.' },
                ].map(({ num, icon: Icon, title, desc }, i) => (
                  <motion.div key={num} variants={fadeUp} whileHover={{ x: 8 }} transition={{ duration: 0.2 }} className="flex gap-5 relative group cursor-pointer">
                    {/* Connector line */}
                    {i < 2 && (
                      <div className="absolute left-5 top-14 w-px h-12 z-0 transition-colors group-hover:bg-[#22c55e]" style={{ background: `linear-gradient(to bottom, ${PRIMARY}, rgba(34,197,94,0.2))` }} />
                    )}
                    <div className="relative z-10 flex-shrink-0 w-10 h-10 rounded-full font-bold text-sm flex items-center justify-center transition-transform group-hover:scale-110" style={{ backgroundColor: PRIMARY, color: BG, fontFamily: 'var(--font-mono)' }}>
                      {num.slice(-1)}
                    </div>
                    <div className="pb-10 pt-1">
                      <h3 className="font-bold text-base mb-2 group-hover:text-[#22c55e] transition-colors" style={{ fontFamily: 'var(--font-display)', color: FG }}>{title}</h3>
                      <p className="text-sm leading-relaxed" style={{ color: MUTED }}>{desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Right — image */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.7 }}
              className="relative"
            >
              <div className="absolute -inset-4 rounded-3xl blur-2xl" style={{ backgroundColor: 'rgba(34,197,94,0.06)' }} />
              <div className="relative rounded-3xl overflow-hidden aspect-[4/3]" style={{ border: `1px solid rgba(34,197,94,0.15)` }}>
                <img
                  src="/images/farmer-smartphone.jpg"
                  alt="Petani menggunakan smartphone di sawah"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(2,8,4,0.5), transparent 60%)' }} />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a, #15803d)' }} />
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(rgba(2,8,4,0.15) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        <div className="relative max-w-3xl mx-auto text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={stagger}>
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-5xl font-bold mb-5" style={{ fontFamily: 'var(--font-display)', color: '#020804' }}>
              Siap Melindungi Tanaman Padi Anda?
            </motion.h2>
            <motion.p variants={fadeUp} className="text-lg mb-10" style={{ color: 'rgba(2,8,4,0.7)' }}>
              Mulai deteksi penyakit padi sekarang dan dapatkan rekomendasi penanganan yang tepat.
            </motion.p>
            <motion.div variants={fadeUp} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                asChild
                size="lg"
                className="rounded-full px-12 h-14 text-base font-bold shadow-2xl"
                style={{ backgroundColor: '#020804', color: PRIMARY }}
              >
                <Link to="/deteksi" className="flex items-center gap-3">
                  <ScanLine className="w-5 h-5" />
                  Mulai Deteksi Sekarang
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
