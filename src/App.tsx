import { Routes, Route, Navigate } from 'react-router-dom'
import BerandaPage from './pages/BerandaPage'
import DeteksiPage from './pages/DeteksiPage'
import InformasiPage from './pages/InformasiPage'
import CaraKerjaPage from './pages/CaraKerjaPage'
import TentangPage from './pages/TentangPage'
import KontakPage from './pages/KontakPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<BerandaPage />} />
      <Route path="/deteksi" element={<DeteksiPage />} />
      <Route path="/informasi" element={<InformasiPage />} />
      <Route path="/cara-kerja" element={<CaraKerjaPage />} />
      <Route path="/tentang" element={<TentangPage />} />
      <Route path="/kontak" element={<KontakPage />} />
      {/* Redirect /penyakit → /informasi */}
      <Route path="/penyakit" element={<Navigate to="/informasi" replace />} />
    </Routes>
  )
}
