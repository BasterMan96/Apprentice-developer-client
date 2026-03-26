import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Download, GraduationCap, Calendar, Hash } from 'lucide-react'
import { apiClient } from '../api/client'

// ─── Types ────────────────────────────────────────────────────────────────────

interface CertificateDto {
  id: number
  courseTitle: string
  issuedAt: string
  certificateNumber: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function CertificatesSkeleton() {
  return (
    <div className="animate-pulse flex flex-col gap-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl border-2 border-gray-100 p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="h-6 bg-gray-200 rounded-full w-8" />
            <div className="h-4 bg-gray-100 rounded-full w-24" />
          </div>
          <div className="h-5 bg-gray-200 rounded-full w-2/3" />
          <div className="h-4 bg-gray-100 rounded-full w-40" />
          <div className="h-4 bg-gray-100 rounded-full w-32" />
          <div className="h-10 bg-gray-100 rounded-xl mt-1" />
        </div>
      ))}
    </div>
  )
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ onNavigate }: { onNavigate: () => void }) {
  return (
    <div className="flex flex-col items-center gap-4 py-16 text-center">
      <span className="text-6xl select-none">🎓</span>
      <div>
        <p className="font-bold text-gray-900 text-lg">Пока нет сертификатов</p>
        <p className="text-sm text-gray-400 mt-1">
          Завершите курс, чтобы получить сертификат
        </p>
      </div>
      <button
        onClick={onNavigate}
        className="h-12 px-6 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-bold text-sm transition-colors shadow-sm"
      >
        Перейти к курсам
      </button>
    </div>
  )
}

// ─── Certificate Card ─────────────────────────────────────────────────────────

interface CertificateCardProps {
  cert: CertificateDto
  index: number
}

function CertificateCard({ cert, index }: CertificateCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.07 }}
      className="relative bg-white rounded-2xl border-2 border-primary-200 shadow-sm overflow-hidden"
    >
      {/* Top gradient accent */}
      <div className="h-1.5 bg-gradient-to-r from-primary-400 via-orange-400 to-amber-400" />

      <div className="p-5 flex flex-col gap-4">
        {/* Star + header row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl select-none">⭐</span>
            <span className="text-xs font-semibold text-primary-600 bg-primary-50 px-2.5 py-0.5 rounded-full">
              Сертификат
            </span>
          </div>
          <GraduationCap size={22} className="text-primary-400 flex-shrink-0 mt-0.5" />
        </div>

        {/* Course title */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1">
            Курс успешно завершён
          </p>
          <h3 className="font-extrabold text-gray-900 text-lg leading-snug">{cert.courseTitle}</h3>
        </div>

        {/* Meta info */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Hash size={12} className="text-gray-400 flex-shrink-0" />
            <span className="font-mono">{cert.certificateNumber}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Calendar size={12} className="text-gray-400 flex-shrink-0" />
            <span>Выдан {formatDate(cert.issuedAt)}</span>
          </div>
        </div>

        {/* Download button */}
        <button
          onClick={() => alert('Скоро!')}
          className="flex items-center justify-center gap-2 w-full h-11 rounded-xl border-2 border-primary-300 text-primary-600 font-bold text-sm hover:bg-primary-50 transition-colors active:scale-95"
        >
          <Download size={16} />
          Скачать
        </button>
      </div>

      {/* Decorative watermark */}
      <div className="absolute bottom-4 right-4 opacity-5 pointer-events-none select-none">
        <GraduationCap size={80} className="text-primary-600" />
      </div>
    </motion.div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function CertificatesPage() {
  const navigate = useNavigate()
  const [certs, setCerts] = useState<CertificateDto[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(true)
    apiClient
      .get<CertificateDto[]>('/users/certificates')
      .then(({ data }) => setCerts(data))
      .catch(() => setCerts([]))
      .finally(() => setIsLoading(false))
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-6 pb-10"
    >
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Сертификаты</h1>
        <p className="text-sm text-gray-400 mt-1">Подтверждение твоих достижений</p>
      </div>

      {/* Content */}
      {isLoading ? (
        <CertificatesSkeleton />
      ) : certs.length === 0 ? (
        <EmptyState onNavigate={() => navigate('/courses')} />
      ) : (
        <div className="flex flex-col gap-4">
          {certs.map((cert, index) => (
            <CertificateCard key={cert.id} cert={cert} index={index} />
          ))}
        </div>
      )}
    </motion.div>
  )
}
