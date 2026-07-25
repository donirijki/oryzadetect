import { useState } from "react"
import { motion, Variants } from "framer-motion"
import { AtSign, Phone, Mail, CheckCircle, Loader2, MessageCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
}

interface FormErrors {
  name?: string
  email?: string
  subject?: string
  message?: string
}

export default function KontakPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = "Nama lengkap wajib diisi"
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email wajib diisi"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Format email tidak valid"
    }

    if (!formData.subject) {
      newErrors.subject = "Subjek pesan wajib dipilih"
    }

    if (!formData.message.trim()) {
      newErrors.message = "Pesan wajib diisi"
    } else if (formData.message.trim().length < 20) {
      newErrors.message = "Pesan minimal 20 karakter"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)

    // Simulate API call
    await new Promise((r) => setTimeout(r, 1500))

    setIsSubmitting(false)
    setIsSuccess(true)

    // Reset form after success
    setTimeout(() => {
      setFormData({ name: "", email: "", subject: "", message: "" })
      setIsSuccess(false)
    }, 3000)
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  return (
    <div className="min-h-screen bg-[#050f08]">
      <Navbar />

      {/* Header with gradient background */}
      <section className="relative pt-28 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#22c55e]/10 via-[#0a1a0f] to-[#050f08]" />
        
        {/* Decorative blur circles */}
        <div className="absolute top-20 right-10 w-80 h-80 bg-[#22c55e]/10 rounded-full blur-3xl" />
        <div className="absolute top-10 left-1/4 w-72 h-72 bg-[#4ade80]/8 rounded-full blur-3xl" />
        
        {/* Grid pattern */}
        <div className="absolute inset-0 grid-pattern opacity-[0.05]" />


        <div className="relative max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-[#0f2014]/80 backdrop-blur-sm border border-[#22c55e]/30 text-[#22c55e] text-xs font-semibold rounded-full">
              <MessageCircle className="w-3 h-3" />
              Hubungi Saya
            </span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-6 text-3xl sm:text-[44px] font-extrabold text-white text-balance"
          >
            Ada Pertanyaan atau Feedback?
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-4 text-base text-[#9ca3af] max-w-xl mx-auto"
          >
            Saya senang mendengar dari Anda. Kirim pesan dan saya akan merespons secepatnya.
          </motion.p>
        </div>

        {/* Wave decoration */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 60V30C240 10 480 0 720 10C960 20 1200 40 1440 30V60H0Z" fill="#0a1a0f"/>
          </svg>
        </div>
      </section>

      {/* Main Content */}
      <section className="pb-16 px-4 sm:px-6 lg:px-8 bg-[#0a1a0f]">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-[320px_1fr] gap-6">
            {/* Contact Info Panel */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-[#0f2014] border border-[#1f3d28] rounded-2xl p-8"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#22c55e]/20 to-[#4ade80]/10 flex items-center justify-center mb-4">
                <AtSign className="w-6 h-6 text-[#22c55e]" />
              </div>
              <h4 className="text-lg font-bold text-white">Kontak Langsung</h4>

              <div className="mt-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#050f08] border border-[#1f3d28] flex items-center justify-center">
                    <Mail className="w-5 h-5 text-[#9ca3af]" />
                  </div>
                  <div>
                    <p className="text-xs text-[#6b7280] uppercase tracking-wide">Email</p>
                    <a
                      href="mailto:hello@oryzadetect.id"
                      className="text-sm text-[#22c55e] hover:underline font-medium"
                    >
                      hello@oryzadetect.id
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#050f08] border border-[#1f3d28] flex items-center justify-center">
                    <Phone className="w-5 h-5 text-[#9ca3af]" />
                  </div>
                  <div>
                    <p className="text-xs text-[#6b7280] uppercase tracking-wide">WhatsApp</p>
                    <span className="text-sm text-[#9ca3af] font-medium">+62 812-3456-7890</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 relative bg-gradient-to-br from-[#22c55e] to-[#16a34a] rounded-xl p-5 text-[#050f08] overflow-hidden">
                {/* Decorative */}
                <div className="absolute -top-6 -right-6 w-20 h-20 bg-white/10 rounded-full blur-xl" />
                
                <p className="relative text-sm leading-relaxed font-medium">
                  Saya biasanya merespons dalam 1-2 hari kerja. Terima kasih atas kesabaran Anda!
                </p>
              </div>
            </motion.div>

            {/* Contact Form Panel */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-[#0f2014] border border-[#1f3d28] rounded-2xl p-8 sm:p-10"
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  {/* Name */}
                  <div>
                    <label className="block text-xs font-semibold text-[#9ca3af] uppercase tracking-wide mb-2">
                      Nama Lengkap
                    </label>
                    <Input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Masukkan nama lengkap"
                      className={`h-11 bg-[#050f08] border-[#1f3d28] text-white placeholder:text-[#6b7280] ${
                        errors.name
                          ? "border-[#ef4444] focus-visible:ring-[#ef4444]"
                          : "focus-visible:ring-[#22c55e]"
                      }`}
                    />
                    {errors.name && (
                      <p className="mt-1 text-xs text-[#ef4444]">{errors.name}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-semibold text-[#9ca3af] uppercase tracking-wide mb-2">
                      Alamat Email
                    </label>
                    <Input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="email@contoh.com"
                      className={`h-11 bg-[#050f08] border-[#1f3d28] text-white placeholder:text-[#6b7280] ${
                        errors.email
                          ? "border-[#ef4444] focus-visible:ring-[#ef4444]"
                          : "focus-visible:ring-[#22c55e]"
                      }`}
                    />
                    {errors.email && (
                      <p className="mt-1 text-xs text-[#ef4444]">{errors.email}</p>
                    )}
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-xs font-semibold text-[#9ca3af] uppercase tracking-wide mb-2">
                    Subjek Pesan
                  </label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className={`w-full h-11 px-3 rounded-md border bg-[#050f08] text-white text-sm ${
                      errors.subject
                        ? "border-[#ef4444] focus:ring-[#ef4444]"
                        : "border-[#1f3d28] focus:ring-[#22c55e]"
                    } focus:outline-none focus:ring-2`}
                  >
                    <option value="" className="text-[#6b7280]">Pilih subjek pesan</option>
                    <option value="general">Pertanyaan Umum</option>
                    <option value="feedback">Feedback & Saran</option>
                    <option value="bug">Laporan Bug</option>
                    <option value="other">Lainnya</option>
                  </select>
                  {errors.subject && (
                    <p className="mt-1 text-xs text-[#ef4444]">{errors.subject}</p>
                  )}
                </div>

                {/* Message */}
                <div>
                  <label className="block text-xs font-semibold text-[#9ca3af] uppercase tracking-wide mb-2">
                    Pesan Anda
                  </label>
                  <Textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tuliskan pesan Anda di sini..."
                    rows={6}
                    className={`resize-none bg-[#050f08] border-[#1f3d28] text-white placeholder:text-[#6b7280] ${
                      errors.message
                        ? "border-[#ef4444] focus-visible:ring-[#ef4444]"
                        : "focus-visible:ring-[#22c55e]"
                    }`}
                  />
                  {errors.message && (
                    <p className="mt-1 text-xs text-[#ef4444]">{errors.message}</p>
                  )}
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isSubmitting || isSuccess}
                  className={`w-full py-4 h-auto rounded-full font-bold text-base transition-all ${
                    isSuccess
                      ? "bg-[#22c55e] text-[#050f08]"
                      : "bg-[#22c55e] hover:bg-[#4ade80] text-[#050f08] btn-glow"
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Mengirim...
                    </>
                  ) : isSuccess ? (
                    <>
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Pesan Terkirim!
                    </>
                  ) : (
                    "Kirim Pesan"
                  )}
                </Button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
