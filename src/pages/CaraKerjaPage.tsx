import { motion } from 'framer-motion'
import { Upload, Cpu, FileCheck, Lightbulb, Camera, Crosshair, Clock, CheckCircle, Shield, ArrowRight } from 'lucide-react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { stagger, fadeUp, scaleIn } from '@/lib/animations'

const BG = '#020804'
const SURFACE = '#0a1a0e'
const BORDER = '#1a3520'
const PRIMARY = '#22c55e'
const MUTED = '#6b9c7a'
const FG = '#e8f5ec'

const steps = [
  {
    num: '01', icon: Upload, title: 'Unggah Foto Daun',
    desc: 'Ambil foto daun padi yang dicurigai terinfeksi menggunakan kamera smartphone atau komputer.',
    tips: ['Gunakan cahaya alami, hindari flash', 'Jarak 15–30 cm dari daun', 'Fokus pada area bergejala', 'Resolusi minimal 720p'],
  },
  {
    num: '02', icon: Cpu, title: 'Analisis AI',
    desc: 'Model CNN VGG16 mengekstrak fitur visual dan menganalisis pola penyakit pada citra daun.',
    tips: ['Transfer Learning dari ImageNet', 'Lapisan konvolusi 16 layer', 'Pooling + Fully Connected', 'Softmax output 8 kelas'],
  },
  {
    num: '03', icon: FileCheck, title: 'Terima Hasil',
    desc: 'Dapatkan diagnosa lengkap beserta tingkat keyakinan, gejala, dan rekomendasi penanganan.',
    tips: ['Confidence score 0–100%', 'Top 3 prediksi teratas', 'Rekomendasi 3 kategori', 'Bisa diunduh & dibagikan'],
  },
]

const techCards = [
  { title: 'Model CNN VGG16', desc: 'Arsitektur deep learning 16 layer dengan filter konvolusi 3×3 yang terbukti efektif untuk klasifikasi citra.' },
  { title: 'Transfer Learning', desc: 'Model pra-latih ImageNet di-fine-tune dengan dataset Rice Leaf dari Mendeley Data untuk akurasi optimal.' },
  { title: 'Dataset Mendeley', desc: 'Menggunakan 1.701 citra asli dari Mendeley Data (Khwaja Yunus Ali University) yang terbagi ke dalam 8 kelas penyakit padi dan daun sehat.' },
  { title: 'Real-time Inference', desc: 'Proses inferensi berjalan di server dengan waktu respons rata-rata kurang dari 10 detik.' },
]

const tips = [
  { icon: Lightbulb, title: 'Pencahayaan', desc: 'Gunakan cahaya alami siang hari. Hindari bayangan dan pantulan cahaya berlebihan.' },
  { icon: Camera, title: 'Fokus & Resolusi', desc: 'Pastikan foto tajam tidak blur. Resolusi minimal 720p untuk hasil deteksi terbaik.' },
  { icon: Crosshair, title: 'Area yang Tepat', desc: 'Fokuskan pada area daun yang menunjukkan gejala paling jelas dan representatif.' },
  { icon: Clock, title: 'Waktu Pengambilan', desc: 'Ambil foto di pagi atau sore hari. Hindari pengambilan foto saat hujan atau sangat panas.' },
]

const faqs = [
  { q: 'Seberapa akurat deteksi OryzaDetect?', a: 'Model CNN VGG16 kami dilatih dengan dataset tervalidasi dan mencapai akurasi kompetitif pada data uji. Namun akurasi di lapangan dapat bervariasi tergantung kualitas foto dan kondisi penyakit.' },
  { q: 'Penyakit apa saja yang dapat dideteksi?', a: '7 penyakit utama: Bacterial Leaf Blight, Brown Spot, Leaf Scald, Narrow Brown Leaf Spot, Leaf Blast, Sheath Blight, dan Rice Hispa. Plus kelas Healthy (Sehat).' },
  { q: 'Apakah foto harus resolusi tinggi?', a: 'Foto dengan resolusi minimal 720p sudah cukup. Yang lebih penting adalah foto fokus, pencahayaan cukup, dan area yang difoto tepat menunjukkan gejala.' },
  { q: 'Berapa lama proses deteksi?', a: 'Proses analisis biasanya selesai dalam 5–10 detik setelah foto diunggah. Waktu dapat lebih lama tergantung spesifikasi komputer server.' },
  { q: 'Apakah foto saya disimpan?', a: 'Tidak. Foto yang diunggah hanya digunakan untuk proses analisis dan tidak disimpan di server kami. Privasi pengguna adalah prioritas.' },
  { q: 'Bisa digunakan di smartphone?', a: 'Ya, OryzaDetect sepenuhnya responsif dan dapat diakses dari browser smartphone. Anda bahkan bisa langsung menggunakan kamera untuk mengambil foto.' },
  { q: 'Apakah hasilnya selalu benar?', a: 'Tidak ada sistem AI yang 100% akurat. Hasil OryzaDetect bersifat referensi awal. Untuk keputusan penting, konsultasikan dengan penyuluh pertanian lapangan (PPL) setempat.' },
]

export default function CaraKerjaPage() {
  return (
    <div style={{ backgroundColor: BG, minHeight: '100vh' }}>
      <Navbar />

      {/* Header */}
      <section className="relative pt-28 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 grid-dot-pattern" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(34,197,94,0.04), transparent)' }} />
        <motion.div initial="hidden" animate="visible" variants={stagger} className="relative max-w-3xl mx-auto text-center">
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase mb-4" style={{ backgroundColor: 'rgba(34,197,94,0.08)', color: PRIMARY, border: `1px solid rgba(34,197,94,0.2)` }}>Cara Kerja</motion.div>
          <motion.h1 variants={fadeUp} className="text-4xl sm:text-5xl font-bold mb-4" style={{ fontFamily: 'var(--font-display)', color: FG }}>Bagaimana OryzaDetect Bekerja?</motion.h1>
          <motion.p variants={fadeUp} className="text-base" style={{ color: MUTED }}>Teknologi AI canggih yang mudah digunakan oleh siapapun, kapanpun, dan dimanapun.</motion.p>
        </motion.div>
      </section>

      {/* Bento Grid Steps — 3×2 layout matching reference */}
      <section className="py-20 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE }}>
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}
            variants={stagger}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {/* Row 1 Col 1 — Step 01 */}
            <motion.div variants={scaleIn} whileHover={{ y: -3 }} className="rounded-2xl p-8" style={{ backgroundColor: BG, border: `1px solid ${BORDER}` }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'rgba(34,197,94,0.1)', border: `1px solid rgba(34,197,94,0.2)` }}>
                  <Upload className="w-6 h-6" style={{ color: PRIMARY }} />
                </div>
                <span className="text-xs font-mono-data font-bold px-2 py-0.5 rounded" style={{ color: PRIMARY, backgroundColor: 'rgba(34,197,94,0.08)' }}>01</span>
              </div>
              <h3 className="text-xl font-bold mb-3" style={{ fontFamily: 'var(--font-display)', color: FG }}>Unggah Foto Daun</h3>
              <p className="text-sm leading-relaxed mb-5" style={{ color: MUTED }}>Ambil foto daun padi yang dicurigai terinfeksi menggunakan kamera smartphone atau komputer.</p>
              <ul className="space-y-2">
                {['Gunakan cahaya alami, hindari flash', 'Jarak 15–30 cm dari daun', 'Fokus pada area bergejala', 'Resolusi minimal 720p'].map((tip) => (
                  <li key={tip} className="flex items-start gap-2 text-xs" style={{ color: MUTED }}>
                    <CheckCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: PRIMARY }} />
                    {tip}
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Row 1 Col 2 — Step 02 */}
            <motion.div variants={scaleIn} whileHover={{ y: -3 }} className="rounded-2xl p-8" style={{ backgroundColor: BG, border: `1px solid ${BORDER}` }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'rgba(34,197,94,0.1)', border: `1px solid rgba(34,197,94,0.2)` }}>
                  <Cpu className="w-6 h-6" style={{ color: PRIMARY }} />
                </div>
                <span className="text-xs font-mono-data font-bold px-2 py-0.5 rounded" style={{ color: PRIMARY, backgroundColor: 'rgba(34,197,94,0.08)' }}>02</span>
              </div>
              <h3 className="text-xl font-bold mb-3" style={{ fontFamily: 'var(--font-display)', color: FG }}>Analisis AI Presisi</h3>
              <p className="text-sm leading-relaxed mb-5" style={{ color: MUTED }}>Model deep learning CNN VGG16 mengekstrak fitur visual dan mencocokkannya dengan ribuan citra penyakit padi.</p>
              <ul className="space-y-2">
                {['Transfer Learning dari ImageNet', 'Lapisan konvolusi 16 layer', 'Pooling + Fully Connected', 'Softmax output 8 kelas'].map((tip) => (
                  <li key={tip} className="flex items-start gap-2 text-xs" style={{ color: MUTED }}>
                    <CheckCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: PRIMARY }} />
                    {tip}
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Row 1 Col 3 — Photo sawah */}
            <motion.div variants={scaleIn} className="rounded-2xl overflow-hidden relative" style={{ minHeight: 280 }}>
              <img
                src="/images/rice-paddy-field.jpg"
                alt="Sawah padi"
                className="w-full h-full object-cover"
                style={{ minHeight: 280 }}
              />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(2,8,4,0.6) 0%, transparent 60%)' }} />
              <div className="absolute bottom-5 left-5">
                <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ backgroundColor: 'rgba(34,197,94,0.15)', color: PRIMARY, border: '1px solid rgba(34,197,94,0.3)' }}>
                  Deteksi di lapangan
                </span>
              </div>
            </motion.div>

            {/* Row 2 Col 1 — Photo daun */}
            <motion.div variants={scaleIn} className="rounded-2xl overflow-hidden relative" style={{ minHeight: 280 }}>
              <img
                src="/images/rice-leaf-close.jpg"
                alt="Foto daun padi close-up"
                className="w-full h-full object-cover"
                style={{ minHeight: 280 }}
              />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(2,8,4,0.7) 0%, rgba(2,8,4,0.2) 60%)' }} />
              <div className="absolute bottom-5 left-5 right-5">
                <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'rgba(34,197,94,0.8)' }}>Status Analisis</p>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full animate-pulse-dot" style={{ backgroundColor: PRIMARY }} />
                  <span className="text-sm font-semibold" style={{ color: FG }}>Berhasil</span>
                </div>
              </div>
            </motion.div>

            {/* Row 2 Col 2 — Step 03 */}
            <motion.div variants={scaleIn} whileHover={{ y: -3 }} className="rounded-2xl p-8" style={{ backgroundColor: BG, border: `1px solid ${BORDER}` }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'rgba(34,197,94,0.1)', border: `1px solid rgba(34,197,94,0.2)` }}>
                  <FileCheck className="w-6 h-6" style={{ color: PRIMARY }} />
                </div>
                <span className="text-xs font-mono-data font-bold px-2 py-0.5 rounded" style={{ color: PRIMARY, backgroundColor: 'rgba(34,197,94,0.08)' }}>03</span>
              </div>
              <h3 className="text-xl font-bold mb-3" style={{ fontFamily: 'var(--font-display)', color: FG }}>Hasil &amp; Rekomendasi</h3>
              <p className="text-sm leading-relaxed mb-5" style={{ color: MUTED }}>Diagnosa lengkap dengan rekomendasi penanganan kimiawi, organik, dan pencegahan yang tepat sasaran.</p>
              <ul className="space-y-2">
                {['Confidence score 0–100%', 'Top 3 prediksi teratas', 'Rekomendasi 3 kategori', 'Bisa diunduh & dibagikan'].map((tip) => (
                  <li key={tip} className="flex items-start gap-2 text-xs" style={{ color: MUTED }}>
                    <CheckCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: PRIMARY }} />
                    {tip}
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Row 2 Col 3 — CTA card */}
            <motion.div variants={scaleIn} whileHover={{ y: -3 }} className="rounded-2xl p-8 flex flex-col justify-between" style={{ background: 'linear-gradient(135deg, #064e3b, #022d1a)', border: '1px solid rgba(34,197,94,0.3)' }}>
              <div>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-5" style={{ backgroundColor: 'rgba(34,197,94,0.15)' }}>
                  <Shield className="w-5 h-5" style={{ color: PRIMARY }} />
                </div>
                <h3 className="text-2xl font-bold mb-3 leading-tight" style={{ fontFamily: 'var(--font-display)', color: FG }}>Siap Mengamankan Panen?</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(232,245,236,0.7)' }}>Teknologi kami telah membantu petani di seluruh Indonesia mendeteksi masalah lebih dini.</p>
              </div>
              <a
                href="/deteksi"
                className="mt-6 inline-flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all hover:bg-[#22c55e]/90"
                style={{ backgroundColor: PRIMARY, color: '#020804' }}
              >
                Mulai Sekarang <ArrowRight className="w-4 h-4" />
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>



      {/* Teknologi */}
      <section className="py-20 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE }}>
        <div className="max-w-7xl mx-auto">
          <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-3xl font-bold text-center mb-10" style={{ fontFamily: 'var(--font-display)', color: FG }}>
            Teknologi yang Digunakan
          </motion.h2>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {techCards.map((card) => (
              <motion.div key={card.title} variants={scaleIn} whileHover={{ y: -4 }} className="rounded-2xl p-6" style={{ backgroundColor: BG, border: `1px solid ${BORDER}` }}>
                <h3 className="font-bold text-sm mb-3" style={{ fontFamily: 'var(--font-display)', color: PRIMARY }}>{card.title}</h3>
                <p className="text-xs leading-relaxed" style={{ color: MUTED }}>{card.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Tips */}
      <section className="py-20 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: BG }}>
        <div className="max-w-7xl mx-auto">
          <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-3xl font-bold text-center mb-10" style={{ fontFamily: 'var(--font-display)', color: FG }}>
            Tips Foto Optimal
          </motion.h2>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {tips.map((tip) => (
              <motion.div key={tip.title} variants={scaleIn} className="rounded-2xl p-6" style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}` }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: 'rgba(34,197,94,0.08)', border: `1px solid rgba(34,197,94,0.15)` }}>
                  <tip.icon className="w-5 h-5" style={{ color: PRIMARY }} />
                </div>
                <h3 className="font-bold text-sm mb-2" style={{ color: FG }}>{tip.title}</h3>
                <p className="text-xs leading-relaxed" style={{ color: MUTED }}>{tip.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE }}>
        <div className="max-w-3xl mx-auto">
          <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-3xl font-bold text-center mb-10" style={{ fontFamily: 'var(--font-display)', color: FG }}>
            Pertanyaan Umum
          </motion.h2>
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="rounded-2xl px-5" style={{ backgroundColor: BG, border: `1px solid ${BORDER}` }}>
                <AccordionTrigger className="text-sm font-medium text-left py-5 hover:no-underline" style={{ color: FG }}>
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm pb-5 leading-relaxed" style={{ color: MUTED }}>
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <Footer />
    </div>
  )
}
