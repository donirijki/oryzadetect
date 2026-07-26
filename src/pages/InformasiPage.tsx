import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, ChevronDown, ArrowRight, CheckCircle, X, Filter } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { stagger, scaleIn, fadeUp } from '@/lib/animations'

import { BG, SURFACE, BORDER, PRIMARY, MUTED, FG } from '@/lib/theme'

type Category = 'Semua' | 'Bakteri' | 'Jamur' | 'Sehat' | 'Hama'

interface Disease {
  id: string; name: string; nameLatin: string; nameIndo: string
  category: 'Bakteri' | 'Jamur' | 'Sehat' | 'Hama'
  severity: 'Tinggi' | 'Sedang' | 'Rendah' | null
  image: string; description: string
  symptoms: string[]; causes: string[]
  treatment: { chemical: string[]; organic: string[]; prevention: string[] }
}

const diseases: Disease[] = [
  {
    id: 'bacterial-leaf-blight', name: 'Bacterial Leaf Blight', nameLatin: 'Xanthomonas oryzae pv. oryzae', nameIndo: 'Hawar Daun Bakteri',
    category: 'Bakteri', severity: 'Tinggi', image: '/images/Bacterial_Leaf_Blight.png',
    description: 'Penyakit bakteri serius yang menyerang sistem pembuluh daun padi menyebabkan daun layu dan mengering dari ujung.',
    symptoms: ['Tepi daun menguning dari ujung', 'Lesi coklat bergelombang', 'Daun seperti terkena air panas', 'Eksudat krem saat basah'],
    causes: ['Bakteri Xanthomonas oryzae', 'Cuaca lembab dan suhu tinggi', 'Luka pada tanaman', 'Air irigasi tercemar'],
    treatment: {
      chemical: ['Bakterisida tembaga hidroksida 2 g/L', 'Streptomisin sulfat 20 WP (1 g/L)', 'Kasugamisin pada stadium awal'],
      organic: ['Ekstrak bawang putih 50 g/L tiap 7 hari', 'Bacillus subtilis sebagai agen hayati', 'Ekstrak tanaman bertanin'],
      prevention: ['Varietas tahan: IR64, Ciherang', 'Hindari nitrogen berlebih', 'Drainase sawah yang baik', 'Bersihkan sisa tanaman'],
    },
  },
  {
    id: 'brown-spot', name: 'Brown Spot', nameLatin: 'Bipolaris oryzae', nameIndo: 'Bercak Coklat',
    category: 'Jamur', severity: 'Sedang', image: '/images/Brown_Spot.png',
    description: 'Penyakit jamur yang menghasilkan bercak oval coklat pada daun. Umumnya terjadi pada lahan dengan kesuburan rendah.',
    symptoms: ['Bercak oval coklat dengan halo kuning', 'Bercak 1–2 cm dengan pusat abu-abu', 'Daun menguning pada infeksi berat', 'Bercak pada gabah'],
    causes: ['Jamur Bipolaris oryzae', 'Defisiensi hara terutama kalium', 'Cuaca kering diselingi hujan', 'Tanah masam dan miskin hara'],
    treatment: {
      chemical: ['Propikonazol 25 EC (0.5 ml/L)', 'Mancozeb 80 WP preventif (2 g/L)', 'Tiram untuk perlakuan benih'],
      organic: ['Ekstrak nimba 3% tiap 10 hari', 'Mikoriza untuk ketahanan tanaman', 'Pupuk silika memperkuat sel'],
      prevention: ['Pemupukan berimbang', 'Pengairan teratur', 'Gunakan benih sehat', 'Rotasi tanaman'],
    },
  },
  {
    id: 'leaf-scald', name: 'Leaf scald', nameLatin: 'Microdochium oryzae', nameIndo: 'Hangus Daun',
    category: 'Jamur', severity: 'Sedang', image: '/images/Leaf_Scald.png',
    description: 'Penyakit jamur yang menyebabkan daun tampak seperti terbakar mulai dari ujung pada kondisi kelembaban tinggi.',
    symptoms: ['Lesi memanjang dari ujung daun', 'Zona pucat kekuningan', 'Daun tampak terbakar', 'Daun menggulung saat parah'],
    causes: ['Jamur Microdochium oryzae', 'Kelembaban kanopi tinggi', 'Nitrogen berlebihan', 'Cuaca lembab berkepanjangan'],
    treatment: {
      chemical: ['Iprodion 50 WP (2 g/L)', 'Trifloksistrobin + tebukonazol', 'Kasugamisin saat cuaca lembab'],
      organic: ['Ekstrak jahe merah 50 g/L', 'Trichoderma harzianum', 'Kompos pupuk kandang'],
      prevention: ['Jarak tanam ideal', 'Kurangi nitrogen berlebih', 'Sanitasi sisa panen', 'Varietas berdaun tegak'],
    },
  },
  {
    id: 'narrow-brown-leaf-spot', name: 'Narrow Brown Leaf Spot', nameLatin: 'Cercospora janseana', nameIndo: 'Bercak Coklat Sempit',
    category: 'Jamur', severity: 'Rendah', image: '/images/Narrow_Brown_Leaf_Spot.png',
    description: 'Penyakit jamur yang membentuk garis-garis sempit coklat sejajar tulang daun. Dampak umumnya ringan.',
    symptoms: ['Garis sempit coklat sejajar tulang daun', 'Lesi 1–10 mm, lebar < 2 mm', 'Coklat tua tanpa halo kuning', 'Daun menguning bila berat'],
    causes: ['Jamur Cercospora janseana', 'Cuaca lembab', 'Benih terinfeksi', 'Tanah dengan pH tidak optimal'],
    treatment: {
      chemical: ['Azoksistrobin 25 SC (0.5 ml/L)', 'Benomil 50 WP sistemik', 'Mankozeb + metalaksil preventif'],
      organic: ['Larutan kunyit 5%', 'Pupuk kalium tinggi', 'Pseudomonas fluorescens'],
      prevention: ['Benih bersertifikat', 'pH tanah 6.0–7.0', 'Pengairan bergilir', 'Pemupukan NPK berimbang'],
    },
  },
  {
    id: 'leaf-blast', name: 'Leaf Blast', nameLatin: 'Pyricularia oryzae', nameIndo: 'Blas Daun',
    category: 'Jamur', severity: 'Tinggi', image: '/images/Leaf_Blast.png',
    description: 'Penyakit blas adalah ancaman paling serius bagi tanaman padi. Lesi berbentuk belah ketupat khas dapat mematikan daun dalam 3–5 hari.',
    symptoms: ['Lesi diamond/belah ketupat', 'Pusat abu-abu, tepi coklat, halo kuning', 'Seluruh daun mengering 3–5 hari', 'Leher malai terinfeksi'],
    causes: ['Jamur Magnaporthe oryzae', 'Cuaca lembab, angin kencang', 'Nitrogen berlebihan fase vegetatif', 'Varietas peka blast'],
    treatment: {
      chemical: ['Trisiklazol 75 WP (0.6 g/L)', 'Isoprothiolane 40 EC (1 ml/L)', 'Propikonazol 25 EC alternatif'],
      organic: ['Silika cair memperkuat epidermis', 'Bacillus amyloliquefaciens', 'Ekstrak biji kipas angin 10%'],
      prevention: ['Varietas tahan: Cimelati, Conde', 'Kurangi N sebelum bunting', 'Pantau cuaca', 'Pertahankan air sawah'],
    },
  },
  {
    id: 'sheath-blight', name: 'Sheath Blight', nameLatin: 'Rhizoctonia solani', nameIndo: 'Busuk Pelepah',
    category: 'Jamur', severity: 'Tinggi', image: '/images/Sheath_Blight.png',
    description: 'Penyakit jamur yang menyerang pelepah daun dan dapat menyebar ke daun bagian atas pada kondisi genangan tinggi.',
    symptoms: ['Lesi oval pada pelepah dekat air', 'Pusat abu-abu, batas coklat gelap', 'Sklerotia coklat/hitam pada lesi', 'Daun atas ikut terinfeksi'],
    causes: ['Jamur Rhizoctonia solani', 'Penanaman terlalu rapat', 'Genangan air tinggi', 'Nitrogen berlebihan'],
    treatment: {
      chemical: ['Validamisin A 3 L (2 ml/L)', 'Tebukonazol 25 EW (0.5 ml/L)', 'Azoksistrobin + difenokosanol'],
      organic: ['Trichoderma virens/asperellum', 'Kalium tinggi memperkuat pelepah', 'Ekstrak bawang putih + cabai'],
      prevention: ['Jarak tanam lebih lebar', 'Kurangi bibit per rumpun', 'Hindari genangan > 5 cm', 'Pengairan intermittent'],
    },
  },
  {
    id: 'rice-hispa', name: 'Rice Hispa', nameLatin: 'Dicladispa armigera', nameIndo: 'Hispa Padi',
    category: 'Hama', severity: 'Sedang', image: '/images/Rice_Hispa.png',
    description: 'Hama kumbang kecil berduri yang larvanya menggerek daun padi, menyebabkan garis-garis putih memanjang sejajar tulang daun.',
    symptoms: ['Garis-garis putih memanjang pada daun', 'Daun tampak berwarna putih keperakan', 'Ujung daun mengering dan berwarna coklat', 'Larva menggerek jaringan daun dari dalam'],
    causes: ['Ledakan populasi kumbang Hispa', 'Kelembaban tinggi', 'Gulma inang di sekitar sawah', 'Kurangnya musuh alami'],
    treatment: {
      chemical: ['Insektisida Klorpirifos 20 EC dosis 2 ml/L', 'Imidakloprid 200 SL dosis 0.5 ml/L', 'Deltametrin untuk populasi tinggi'],
      organic: ['Ekstrak mimba 5% sebagai repelen alami', 'Pelepasan parasitoid Eulophid', 'Perangkap cahaya (light trap)'],
      prevention: ['Monitor rutin awal musim', 'Tanam serempak', 'Sanitasi gulma', 'Pupuk berimbang'],
    },
  },
  {
    id: 'healthy', name: 'Healthy Rice Leaf', nameLatin: 'Oryza sativa (Sehat)', nameIndo: 'Daun Padi Sehat',
    category: 'Sehat', severity: null, image: '/images/healty.png',
    description: 'Daun padi dalam kondisi sehat tanpa gejala penyakit. Pertahankan kondisi ini dengan perawatan rutin.',
    symptoms: ['Daun hijau segar merata', 'Tidak ada bercak atau lesi', 'Pertumbuhan normal dan tegak', 'Tidak ada gejala serangan'],
    causes: ['Kondisi pertumbuhan optimal', 'Pemupukan sesuai kebutuhan', 'Pengairan terkontrol', 'Pengendalian hama preventif'],
    treatment: {
      chemical: [],
      organic: ['Pemupukan berimbang sesuai jadwal', 'Pertahankan pengairan intermittent'],
      prevention: ['Monitor rutin setiap 7 hari', 'Pertahankan musuh alami di sawah', 'Jaga kebersihan saluran irigasi', 'Catat perkembangan berkala'],
    },
  },
]

function getCatStyle(cat: string) {
  if (cat === 'Bakteri') return { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/25' }
  if (cat === 'Jamur') return { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/25' }

  if (cat === 'Hama') return { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/25' }
  return { bg: 'bg-[#22c55e]/10', text: 'text-[#22c55e]', border: 'border-[#22c55e]/25' }
}

function getSevStyle(sev: string | null) {
  if (sev === 'Tinggi') return { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/25' }
  if (sev === 'Sedang') return { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/25' }
  if (sev === 'Rendah') return { bg: 'bg-[#22c55e]/10', text: 'text-[#22c55e]', border: 'border-[#22c55e]/25' }
  return null
}

export default function InformasiPage() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<Category>('Semua')
  const [selected, setSelected] = useState<Disease | null>(null)

  const filtered = useMemo(() => diseases.filter(d => {
    const q = search.toLowerCase()
    const matchSearch = !q || d.name.toLowerCase().includes(q) || d.nameIndo.toLowerCase().includes(q)
    const matchCat = category === 'Semua' || d.category === category
    return matchSearch && matchCat
  }), [search, category])

  const categories: Category[] = ['Semua', 'Bakteri', 'Jamur', 'Sehat', 'Hama']

  return (
    <div style={{ backgroundColor: BG, minHeight: '100vh' }}>
      <Navbar />

      {/* ── Hero with centered search ── */}
      <section className="relative pt-28 pb-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 grid-dot-pattern" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(34,197,94,0.05), transparent 70%)' }} />

        <motion.div initial="hidden" animate="visible" variants={stagger} className="relative max-w-3xl mx-auto text-center">
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase mb-5"
            style={{ backgroundColor: 'rgba(34,197,94,0.08)', color: PRIMARY, border: `1px solid rgba(34,197,94,0.2)` }}>
            Ensiklopedia
          </motion.div>

          <motion.h1 variants={fadeUp} className="text-4xl sm:text-5xl font-bold mb-4"
            style={{ fontFamily: 'var(--font-display)', color: FG }}>
            Informasi Penyakit Padi
          </motion.h1>

          <motion.p variants={fadeUp} className="text-base mb-12" style={{ color: MUTED }}>
            Database lengkap 8 kelas penyakit daun padi yang dapat dideteksi oleh sistem AI OryzaDetect.
          </motion.p>

          {/* ── Inline Search & Filter Bar ── */}
          <motion.div variants={fadeUp} className="relative max-w-3xl mx-auto">
            <div className="flex flex-col sm:flex-row items-center gap-2 p-1.5 rounded-2xl shadow-2xl transition-colors"
              style={{ backgroundColor: SURFACE, border: `1px solid rgba(34,197,94,0.25)` }}>
              
              <div className="relative flex-1 w-full flex items-center">
                <Search className="absolute left-4 w-5 h-5 shrink-0" style={{ color: MUTED }} />
                <input
                  type="text"
                  placeholder="Cari nama penyakit (misal: Blas Padi)..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-12 pr-10 py-3 text-sm sm:text-base outline-none bg-transparent"
                  style={{ color: FG }}
                />
                {search && (
                  <button onClick={() => setSearch('')} className="absolute right-3 p-1 rounded-full hover:bg-white/5 transition-colors"
                    style={{ color: MUTED }}>
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto px-2 pb-2 sm:px-0 sm:pb-0">
                <div className="w-px h-8 hidden sm:block" style={{ backgroundColor: BORDER }} />
                
                {/* Native Dropdown */}
                <div className="relative flex items-center">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Category)}
                    className="appearance-none bg-transparent text-sm font-medium outline-none cursor-pointer px-4 py-2.5 rounded-xl hover:bg-white/5 transition-colors pl-4 pr-10"
                    style={{ color: category !== 'Semua' ? PRIMARY : FG }}
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat} style={{ backgroundColor: BG, color: FG }}>
                        {cat === 'Semua' ? 'Semua Kategori' : cat}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 w-4 h-4 pointer-events-none" style={{ color: MUTED }} />
                </div>

                {/* Filter Button */}
                <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:bg-white/5"
                  style={{ backgroundColor: 'transparent', color: FG, border: `1px solid ${BORDER}` }}>
                  <Filter className="w-4 h-4" />
                  Filter
                </button>
              </div>
            </div>

            <p className="text-xs mt-4 text-left pl-4" style={{ color: 'rgba(107,156,122,0.7)' }}>
              Menampilkan {filtered.length} penyakit
            </p>
          </motion.div>
        </motion.div>
      </section>

      {/* ── Grid ── */}
      <section className="pt-12 px-4 sm:px-6 lg:px-8 pb-20" style={{ backgroundColor: SURFACE }}>
        <div className="max-w-7xl mx-auto">
          <motion.div layout className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence mode="popLayout">
              {filtered.map((disease) => {
                const cs = getCatStyle(disease.category)
                const ss = getSevStyle(disease.severity)
                return (
                  <motion.div
                    key={disease.id}
                    layout
                    variants={scaleIn}
                    initial="hidden" animate="visible" exit={{ opacity: 0, scale: 0.92 }}
                    whileHover={{ y: -4, transition: { duration: 0.2 } }}
                    onClick={() => setSelected(disease)}
                    className="rounded-2xl overflow-hidden cursor-pointer group transition-all duration-300"
                    style={{ backgroundColor: BG, border: `1px solid ${BORDER}` }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(34,197,94,0.35)')}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = BORDER)}
                  >
                    <div className="relative h-44 overflow-hidden">
                      <img src={disease.image} alt={disease.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(2,8,4,0.6), transparent 70%)' }} />
                    </div>
                    <div className="p-6">
                      <div className="flex gap-1.5 mb-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${cs.bg} ${cs.text} ${cs.border}`}>{disease.category}</span>
                        {ss && <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${ss.bg} ${ss.text} ${ss.border}`}>{disease.severity}</span>}
                      </div>
                      <h3 className="font-bold text-base mb-0.5 group-hover:text-[#22c55e] transition-colors" style={{ fontFamily: 'var(--font-display)', color: FG }}>{disease.name}</h3>
                      <p className="text-xs italic mb-0.5" style={{ color: MUTED }}>{disease.nameLatin}</p>
                      <p className="text-xs mb-3" style={{ color: MUTED }}>{disease.nameIndo}</p>
                      <p className="text-xs leading-relaxed mb-5" style={{ color: 'rgba(107,156,122,0.8)' }}>{disease.description}</p>
                      <Button variant="outline" size="sm" className="w-full rounded-xl text-xs gap-1.5 transition-all group-hover:border-[#22c55e]/35" style={{ borderColor: BORDER, color: MUTED }}>
                        Lihat Detail <ArrowRight className="w-3 h-3" />
                      </Button>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </motion.div>

          {filtered.length === 0 && (
            <div className="text-center py-20">
              <p className="text-base font-medium mb-2" style={{ color: FG }}>Tidak ditemukan</p>
              <p className="text-sm" style={{ color: MUTED }}>Coba kata kunci lain atau ubah filter kategori.</p>
            </div>
          )}
        </div>
      </section>

      {/* Modal Detail */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" style={{ backgroundColor: BG, border: `1px solid ${BORDER}` }}>
          {selected && (() => {
            const cs = getCatStyle(selected.category)
            const ss = getSevStyle(selected.severity)
            return (
              <>
                <div className="relative h-56 rounded-xl overflow-hidden mb-4">
                  <img src={selected.image} alt={selected.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(2,8,4,0.7), transparent 50%)' }} />
                </div>
                <DialogTitle className="sr-only">{selected.name}</DialogTitle>
                <Tabs defaultValue="gejala">
                  <TabsList className="w-full mb-4 grid grid-cols-5" style={{ backgroundColor: SURFACE }}>
                    <TabsTrigger value="gejala">Gejala</TabsTrigger>
                    <TabsTrigger value="penyebab">Penyebab</TabsTrigger>
                    <TabsTrigger value="chemical">Kimia</TabsTrigger>
                    <TabsTrigger value="organic">Organik</TabsTrigger>
                    <TabsTrigger value="prevention">Cegah</TabsTrigger>
                  </TabsList>
                  {(['gejala', 'penyebab', 'chemical', 'organic', 'prevention'] as const).map((tab) => {
                    const items = tab === 'gejala' ? selected.symptoms : tab === 'penyebab' ? selected.causes : selected.treatment[tab as 'chemical' | 'organic' | 'prevention']
                    return (
                      <TabsContent key={tab} value={tab}>
                        <ul className="space-y-2.5">
                          {(items || []).map((item) => (
                            <li key={item} className="flex gap-3 text-sm" style={{ color: MUTED }}>
                              <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: PRIMARY }} />
                              {item}
                            </li>
                          ))}
                          {(!items || items.length === 0) && <li className="text-sm" style={{ color: MUTED }}>Tidak diperlukan untuk tanaman sehat.</li>}
                        </ul>
                      </TabsContent>
                    )
                  })}
                </Tabs>
                <div className="pt-4 mt-4" style={{ borderTop: `1px solid ${BORDER}` }}>
                  <Button asChild className="rounded-xl w-full gap-2" style={{ backgroundColor: PRIMARY, color: BG }}>
                    <Link to="/deteksi">Deteksi Sekarang</Link>
                  </Button>
                </div>
              </>
            )
          })()}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  )
}
