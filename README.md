## 📋 Deskripsi

**OryzaDetect** adalah aplikasi web full-stack yang memungkinkan petani dan peneliti mendeteksi penyakit tanaman padi secara otomatis melalui foto daun. Sistem ini menggunakan model **Convolutional Neural Network (CNN)** dengan arsitektur **VGG16** yang dilatih pada dataset citra penyakit padi.

Aplikasi ini dikembangkan sebagai **proyek skripsi** Program Studi Sistem Informasi.

### ✨ Fitur Utama

| Fitur | Deskripsi |
|-------|-----------|
| 🔍 **Deteksi Penyakit** | Upload foto daun padi → diagnosa AI instan dalam <3 detik |
| 🎯 **Grad-CAM Heatmap** | Visualisasi area daun yang dianalisis AI (True Grad-CAM pada block5_conv3) |
| 📊 **Top-3 Prediksi** | Confidence score untuk 3 kemungkinan penyakit teratas |
| 💊 **Rekomendasi Penanganan** | Penanganan kimia, organik, dan pencegahan per penyakit |
| 📚 **Ensiklopedia Penyakit** | Database lengkap 8 kelas penyakit dengan gambar referensi |
| 📱 **Responsive Design** | Optimized untuk desktop dan mobile |
| 🚀 **Unified Deployment** | Frontend + Backend dalam satu server |

### 🦠 Kelas Penyakit yang Dideteksi

| No | Penyakit (EN) | Penyakit (ID) | Kategori |
|----|---------------|---------------|----------|
| 0 | Bacterial Leaf Blight | Hawar Daun Bakteri | Bakteri |
| 1 | Brown Spot | Bercak Coklat | Jamur |
| 2 | Healthy Rice Leaf | Daun Padi Sehat | Sehat |
| 3 | Leaf Blast | Blas Daun | Jamur |
| 4 | Leaf Scald | Lepuh Daun | Jamur |
| 5 | Narrow Brown Leaf Spot | Bercak Coklat Sempit | Jamur |
| 6 | Rice Hispa | Penggerek Daun | Hama |
| 7 | Sheath Blight | Hawar Pelepah | Jamur |

---

## 🛠️ Tech Stack

### Frontend
- **React 19** — UI library
- **Vite 6** — Build tool & dev server (super fast HMR)
- **Tailwind CSS 4** — Utility-first CSS framework
- **Framer Motion** — Animasi & transisi premium
- **React Router DOM** — Client-side routing (SPA)
- **Sonner** — Toast notifications
- **Lucide React** — Icon library

### Backend
- **Python 3.10–3.12** — Runtime
- **FastAPI** — Async web framework
- **TensorFlow 2.17 + Keras 3.3** — Deep learning inference
- **Pillow** — Image processing
- **NumPy** — Numerical computing

### Model AI
- **Arsitektur**: CNN VGG16 (transfer learning)
- **Input**: Gambar daun 224×224 px (RGB)
- **Output**: Probabilitas 8 kelas
- **Visualisasi**: Grad-CAM (Gradient-weighted Class Activation Mapping)

---

## 🚀 Cara Menjalankan

### Prasyarat
- **Node.js** ≥ 18
- **Python** 3.10 – 3.12
- File model di `backend/models/`: `model_final_padi.keras` ✅ (sudah ada)

> `requirements.txt` sudah mencakup semua dependency Python: `fastapi`, `uvicorn`, `tensorflow==2.17.0`, `keras==3.3.3`, `pillow`, `numpy`, `slowapi`, dll.

### Mode 1: Unified Deployment (Produksi) ⭐

Satu server untuk frontend + backend:

```bash
# 1. Install frontend dependencies
npm install

# 2. Build frontend & copy ke backend
.\build.ps1

# 3. Install backend dependencies
cd backend
pip install -r requirements.txt

# 4. Jalankan server
python main.py
```

Buka **http://localhost:8000** — selesai!

### Mode 2: Development (Frontend + Backend Terpisah)

```bash
# Terminal 1 — Backend
cd backend
pip install -r requirements.txt
python main.py
# → API berjalan di http://localhost:8000

# Terminal 2 — Frontend
npm install
npm run dev
# → Frontend berjalan di http://localhost:5173
```

> **Note**: Dalam mode development, frontend menggunakan `VITE_API_URL=http://localhost:8000` dari `.env.local` untuk menghubungi backend.

---

## 📁 Struktur Project

```
v0-padiscan-web-app/
│
├── src/                          # ── Frontend (React + Vite) ──
│   ├── main.tsx                  # Entry point + BrowserRouter
│   ├── App.tsx                   # Route definitions
│   ├── index.css                 # Design system (Tailwind)
│   │
│   ├── pages/                    # Halaman
│   │   ├── BerandaPage.tsx       # /           — Homepage
│   │   ├── DeteksiPage.tsx       # /deteksi    — Upload & deteksi AI
│   │   ├── InformasiPage.tsx     # /informasi  — Ensiklopedia penyakit
│   │   ├── CaraKerjaPage.tsx     # /cara-kerja — Penjelasan cara kerja
│   │   ├── TentangPage.tsx       # /tentang    — About page
│   │   └── KontakPage.tsx        # /kontak     — Contact form
│   │
│   ├── components/               # Komponen reusable
│   │   ├── navbar.tsx            # Smart navbar (scroll-aware, glassmorphism)
│   │   ├── footer.tsx            # Footer dengan navigasi
│   │   ├── custom-cursor.tsx     # Custom cursor interaktif
│   │   ├── scroll-to-top.tsx     # Tombol scroll-to-top
│   │   └── ui/                   # Komponen UI dasar (Button, Tabs, dll.)
│   │
│   ├── lib/                      # Utility modules
│   │   ├── api.ts                # HTTP client → FastAPI /predict
│   │   ├── animations.ts         # Framer Motion variants
│   │   ├── badge-styles.ts       # Styling badge kategori/severitas
│   │   └── utils.ts              # cn() utility (tailwind-merge)
│   │
│   └── hooks/                    # Custom React hooks
│       └── useScanHistory.ts     # Riwayat scan (localStorage)
│
├── backend/                      # ── Backend (FastAPI + TensorFlow) ──
│   ├── main.py                   # FastAPI app + static file serving
│   ├── predictor.py              # Model loading, inference, Grad-CAM
│   ├── requirements.txt          # Python dependencies
│   ├── models/                   # Model weights (tidak di-commit)
│   │   ├── model_final_padi.keras
│   │   └── model.weights.h5
│   └── static/                   # Frontend build output (auto-generated)
│
├── public/                       # Static assets
│   ├── images/                   # Gambar referensi penyakit
│   ├── icon.svg                  # Favicon SVG
│   ├── apple-icon.png            # Apple touch icon (180×180)
│   └── icon-*.png                # Favicon PNG variants
│
├── build.ps1                     # Build script (frontend → backend/static)
├── index.html                    # Vite entry HTML
├── vite.config.ts                # Vite configuration
├── tsconfig.json                 # TypeScript configuration
├── package.json                  # Node.js dependencies
└── .env.local                    # Environment variables (dev mode)
```

---

## ⚙️ Arsitektur Sistem

```
┌─────────────────────────────────────────────────────┐
│                    Browser (Client)                  │
│                                                     │
│  React SPA ←→ React Router ←→ Framer Motion         │
│       ↓                                             │
│  fetch("/predict") + FormData(image)                │
└────────────────────┬────────────────────────────────┘
                     │ HTTP POST
                     ▼
┌─────────────────────────────────────────────────────┐
│              FastAPI Server (:8000)                  │
│                                                     │
│  ┌──────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │ Static   │  │ POST /predict│  │ GET /api/     │  │
│  │ Files    │  │              │  │   health      │  │
│  │ (React   │  │  ↓           │  └───────────────┘  │
│  │  build)  │  │ predictor.py │                     │
│  └──────────┘  │  ↓           │                     │
│                │ VGG16 Model  │                     │
│                │  ↓           │                     │
│                │ Grad-CAM     │                     │
│                │  ↓           │                     │
│                │ JSON Response│                     │
│                └──────────────┘                     │
└─────────────────────────────────────────────────────┘
```

---

## 🔬 Grad-CAM (Gradient-weighted Class Activation Mapping)

OryzaDetect menggunakan **True Grad-CAM** yang menargetkan layer konvolusi terakhir (`block5_conv3`) pada VGG16:

1. **Forward pass** — Dapatkan feature maps dari layer konv terakhir (14×14×512)
2. **Backward pass** — Hitung gradien skor kelas terhadap feature maps
3. **Global Average Pooling** — Dapatkan bobot pentingnya per channel
4. **Weighted Sum** — Gabungkan feature maps × bobot → heatmap
5. **ReLU** — Filter area kontribusi negatif
6. **Overlay** — Blend heatmap (Inferno colormap) dengan gambar asli

Hasilnya: area daun yang paling mempengaruhi keputusan AI tersorot dengan warna panas (ungu → merah → kuning).

> **Fallback**: Jika layer konv tidak ditemukan (nested model), sistem otomatis fallback ke Gradient Saliency Map.

---

## 🛠️ Troubleshooting

### ❌ `ModuleNotFoundError: iterator_model_ops`
**Penyebab**: TensorFlow 2.16.x punya bug internal di Windows.
```bash
pip install tensorflow==2.17.0
```

### ❌ `'MessageFactory' object has no attribute 'GetPrototype'`
**Penyebab**: `protobuf ≥ 5.x` tidak kompatibel dengan TensorFlow.
```bash
pip install "protobuf>=3.20,<5.0"
```

### ❌ `ml-dtypes` version conflict
```bash
pip install "ml-dtypes~=0.3.1"
```

### ❌ `FileNotFoundError: Model tidak ditemukan`
Pastikan file model ada di `backend/models/`:
- `model_final_padi.keras` (primary) atau
- `model.weights.h5` (fallback — akan rebuild arsitektur otomatis)

### ❌ Port 8000 sudah dipakai
```bash
# Windows: cari dan kill proses di port 8000
netstat -ano | findstr :8000
taskkill /F /PID <PID>
```

---

## 📦 Deployment Checklist

- [ ] File model (`model_final_padi.keras` / `model.weights.h5`) ada di `backend/models/`
- [ ] Python 3.10–3.12 terinstall
- [ ] `pip install -r backend/requirements.txt` berhasil
- [ ] `npm install && .\build.ps1` berhasil (build frontend)
- [ ] `cd backend && python main.py` → server berjalan
- [ ] Buka `http://localhost:8000` → homepage tampil
- [ ] Upload foto daun → deteksi berhasil
- [ ] Grad-CAM heatmap muncul

---

## 📝 API Reference

### `POST /predict`

Deteksi penyakit dari gambar daun padi.

**Request:**
```
Content-Type: multipart/form-data
Body: file=<image file> (JPG/PNG/WEBP, max 10MB)
```

**Response:**
```json
{
  "success": true,
  "disease": "Bacterial Leaf Blight",
  "nameIndo": "Hawar Daun Bakteri",
  "nameLatin": "Xanthomonas oryzae pv. oryzae",
  "category": "Bakteri",
  "severity": "Tinggi",
  "confidence": 95.3,
  "top3": [
    { "name": "Bacterial Leaf Blight", "confidence": 95.3 },
    { "name": "Leaf Scald", "confidence": 2.1 },
    { "name": "Brown Spot", "confidence": 1.5 }
  ],
  "symptoms": ["Tepi daun menguning...", "..."],
  "treatment": {
    "chemical": ["..."],
    "organic": ["..."],
    "prevention": ["..."]
  },
  "gradcam_url": "data:image/png;base64,..."
}
```

### `GET /api/health`

Health check endpoint.

**Response:** `{"status": "ok"}`

---

## 🔗 Links

- [FastAPI Documentation](https://fastapi.tiangolo.com)
- [React Documentation](https://react.dev)
- [Vite Documentation](https://vite.dev)
- [TensorFlow Documentation](https://www.tensorflow.org)
- [Grad-CAM Paper](https://arxiv.org/abs/1610.02391)

