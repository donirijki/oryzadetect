// lib/badge-styles.ts
// Utility untuk styling badge kategori dan severity penyakit

export type DiseaseCategory = 'Bakteri' | 'Jamur' | 'Virus' | 'Sehat' | 'Hama'
export type DiseaseSeverity = 'Tinggi' | 'Sedang' | 'Rendah' | null

export function getCategoryBadgeStyles(category: DiseaseCategory) {
  switch (category) {
    case 'Bakteri':
      return { bg: 'bg-blue-500/15', text: 'text-blue-400', border: 'border-blue-500/30' }
    case 'Jamur':
      return { bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/30' }
    case 'Virus':
      return { bg: 'bg-purple-500/15', text: 'text-purple-400', border: 'border-purple-500/30' }
    case 'Sehat':
      return { bg: 'bg-[#22c55e]/15', text: 'text-[#22c55e]', border: 'border-[#22c55e]/30' }
    case 'Hama':
      return { bg: 'bg-orange-500/15', text: 'text-orange-400', border: 'border-orange-500/30' }
  }
}

export function getSeverityBadgeStyles(severity: DiseaseSeverity) {
  switch (severity) {
    case 'Tinggi':
      return { bg: 'bg-red-500/15', text: 'text-red-400', border: 'border-red-500/30' }
    case 'Sedang':
      return { bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/30' }
    case 'Rendah':
      return { bg: 'bg-[#22c55e]/15', text: 'text-[#22c55e]', border: 'border-[#22c55e]/30' }
    default:
      return null
  }
}
