import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Target, Globe, Leaf, ScanLine, Info, Code, Server, Brain, Layers, Palette, Github, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { stagger, fadeUp, scaleIn } from '@/lib/animations'

const BG = '#020804'
const SURFACE = '#0a1a0e'
const BORDER = '#1a3520'
const PRIMARY = '#22c55e'
const MUTED = '#6b9c7a'
const FG = '#e8f5ec'

const values = [
  { icon: Target, title: 'Akurasi', desc: 'Menggunakan model CNN VGG16 terlatih untuk memberikan diagnosa penyakit yang tepat dan dapat diandalkan sebagai referensi awal.' },
  { icon: Globe, title: 'Aksesibilitas', desc: 'Dapat diakses oleh siapapun melalui browser tanpa instalasi, memastikan teknologi ini menjangkau petani di seluruh Indonesia.' },
  { icon: Leaf, title: 'Keberlanjutan', desc: 'Mendukung pertanian presisi yang efisien, mengurangi penggunaan pestisida berlebih, dan menjaga kelestarian ekosistem sawah.' },
]

const techStack = [
  { abbr: 'RV', name: 'React + Vite', role: 'Framework Web', icon: Code },
  { abbr: 'API', name: 'Python/FastAPI', role: 'Backend API', icon: Server },
  { abbr: 'TF', name: 'TensorFlow', role: 'Deep Learning', icon: Brain },
  { abbr: 'VGG', name: 'CNN VGG16', role: 'Model Arsitektur', icon: Layers },
  { abbr: 'CSS', name: 'Tailwind CSS', role: 'Styling', icon: Palette },
]

export default function TentangPage() {
  return (
    <div style={{ backgroundColor: BG, minHeight: '100vh' }}>
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-28 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="/images/rice-paddy-field.jpg"
            alt="Pemandangan Sawah Padi"
            className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-luminosity"
          />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, #020804 0%, transparent 40%, #020804 100%)' }} />
        </div>
        <div className="absolute inset-0 grid-dot-pattern z-0 opacity-50" />
        
        <motion.div initial="hidden" animate="visible" variants={stagger} className="relative z-10 max-w-3xl mx-auto text-center">
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase mb-4" style={{ backgroundColor: 'rgba(34,197,94,0.1)', color: PRIMARY, border: `1px solid rgba(34,197,94,0.3)`, backdropFilter: 'blur(8px)' }}>
            Teknologi Pertanian · Artificial Intelligence
          </motion.div>
          <motion.h1 variants={fadeUp} className="text-4xl sm:text-5xl font-bold mb-6" style={{ fontFamily: 'var(--font-display)', color: FG }}>
            Tentang OryzaDetect
          </motion.h1>
          <motion.p variants={fadeUp} className="text-lg leading-relaxed" style={{ color: 'rgba(232, 245, 236, 0.8)' }}>
            Platform berbasis AI yang hadir untuk membantu petani Indonesia mendeteksi penyakit tanaman padi secara cepat, mudah, dan terjangkau.
          </motion.p>
        </motion.div>
      </section>

      {/* Misi */}
      <section className="py-20 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE }}>
        <div className="max-w-7xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={stagger}>
            <motion.div variants={fadeUp} className="max-w-3xl mx-auto mb-16">
              <blockquote className="text-2xl sm:text-3xl font-bold leading-snug pl-6 mb-6" style={{ fontFamily: 'var(--font-display)', color: FG, borderLeft: `3px solid ${PRIMARY}` }}>
                "OryzaDetect hadir untuk menjembatani teknologi kecerdasan buatan dengan kebutuhan nyata petani Indonesia."
              </blockquote>
              <p className="text-base leading-relaxed" style={{ color: MUTED }}>
                Padi adalah komoditas strategis Indonesia. Setiap tahun, jutaan hektar sawah terancam berbagai penyakit yang dapat menurunkan hasil panen secara drastis. OryzaDetect hadir sebagai solusi berbasis AI yang mudah diakses untuk deteksi dini penyakit padi.
              </p>
            </motion.div>

            <motion.div variants={stagger} className="grid sm:grid-cols-3 gap-6">
              {values.map((v) => (
                <motion.div key={v.title} variants={scaleIn} whileHover={{ y: -4 }} className="rounded-2xl p-8" style={{ backgroundColor: BG, border: `1px solid ${BORDER}` }}>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5" style={{ backgroundColor: 'rgba(34,197,94,0.08)', border: `1px solid rgba(34,197,94,0.15)` }}>
                    <v.icon className="w-6 h-6" style={{ color: PRIMARY }} />
                  </div>
                  <h3 className="text-xl font-bold mb-3" style={{ fontFamily: 'var(--font-display)', color: FG }}>{v.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: MUTED }}>{v.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Latar Belakang */}
      <section className="py-20 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: BG }}>
        <div className="max-w-3xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.h2 variants={fadeUp} className="text-3xl font-bold mb-8" style={{ fontFamily: 'var(--font-display)', color: FG }}>Latar Belakang</motion.h2>
            <motion.div variants={fadeUp} className="space-y-5 text-base leading-relaxed" style={{ color: MUTED }}>
              <p>
                Indonesia adalah salah satu produsen padi terbesar di dunia, namun penyakit tanaman padi menjadi ancaman serius yang dapat menurunkan produksi hingga 30–70% pada serangan berat. Tantangan utama adalah keterlambatan identifikasi penyakit karena keterbatasan akses petani terhadap ahli pertanian.
              </p>
              <p>
                Dengan perkembangan teknologi Convolutional Neural Network (CNN), khususnya arsitektur VGG16, kini dimungkinkan untuk membangun sistem klasifikasi penyakit tanaman secara otomatis dari citra foto dengan tingkat akurasi yang tinggi.
              </p>
              <p>
                OryzaDetect dikembangkan sebagai proyek skripsi yang mencoba menjawab tantangan ini — membangun alat deteksi penyakit padi berbasis web yang mudah diakses oleh petani di lapangan menggunakan smartphone mereka.
              </p>
            </motion.div>

            <motion.div variants={fadeUp} className="grid grid-cols-3 gap-4 mt-12 p-6 rounded-2xl" style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}` }}>
              {[{ val: '30–70%', label: 'Potensi penurunan hasil akibat penyakit' }, { val: '7+', label: 'Penyakit utama yang dapat dideteksi' }, { val: '<10s', label: 'Waktu analisis rata-rata' }].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-2xl font-bold font-mono-data" style={{ color: PRIMARY }}>{stat.val}</div>
                  <div className="text-xs mt-1" style={{ color: MUTED }}>{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-20 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE }}>
        <div className="max-w-7xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.h2 variants={fadeUp} className="text-3xl font-bold text-center mb-10" style={{ fontFamily: 'var(--font-display)', color: FG }}>
              Dibangun dengan Teknologi Modern
            </motion.h2>
            <motion.div variants={stagger} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {techStack.map((tech) => (
                <motion.div key={tech.name} variants={scaleIn} whileHover={{ y: -4 }} className="rounded-2xl p-5 text-center" style={{ backgroundColor: BG, border: `1px solid ${BORDER}` }}>
                  <div className="text-2xl font-bold font-mono-data mb-2" style={{ color: PRIMARY }}>{tech.abbr}</div>
                  <p className="text-xs font-semibold mb-1" style={{ color: FG }}>{tech.name}</p>
                  <p className="text-[10px]" style={{ color: MUTED }}>{tech.role}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="py-12 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: BG }}>
        <div className="max-w-3xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="flex gap-4 p-6 rounded-2xl" style={{ backgroundColor: SURFACE, border: `1px solid rgba(251,191,36,0.2)` }}>
            <Info className="w-5 h-5 shrink-0 mt-0.5" style={{ color: '#fbbf24' }} />
            <p className="text-sm leading-relaxed" style={{ color: MUTED }}>
              <strong style={{ color: '#fbbf24' }}>Disclaimer:</strong> Hasil deteksi OryzaDetect bersifat sebagai referensi awal dan tidak menggantikan konsultasi dengan ahli pertanian atau penyuluh pertanian lapangan (PPL). Selalu verifikasi hasil dengan ahli sebelum mengambil keputusan penanganan.
            </p>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #064e3b, #052e16)' }} />
        <div className="absolute inset-0 grid-dot-pattern opacity-30" />
        <div className="relative max-w-2xl mx-auto text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.h2 variants={fadeUp} className="text-3xl font-bold mb-4" style={{ fontFamily: 'var(--font-display)', color: FG }}>
              Coba OryzaDetect Sekarang
            </motion.h2>
            <motion.p variants={fadeUp} className="text-base mb-8" style={{ color: MUTED }}>
              Deteksi penyakit padi Anda secara gratis, tanpa registrasi.
            </motion.p>
            <motion.div variants={fadeUp} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button asChild className="rounded-full px-10 h-12 font-bold glow" style={{ backgroundColor: PRIMARY, color: BG }}>
                <Link to="/deteksi" className="flex items-center gap-2">
                  <ScanIcon className="w-4 h-4" /> Mulai Deteksi Gratis
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

const ScanIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><line x1="7" x2="17" y1="12" y2="12"/>
  </svg>
)
