'use client'
import { X } from 'lucide-react'
import { useEffect } from 'react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  width?: string
}

export default function Modal({ open, onClose, title, children, width = 'max-w-lg' }: ModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#0a0c10]/80 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative card w-full ${width} animate-slide-up shadow-2xl`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1a1d24]">
          <h2 className="font-display font-700 text-[16px] text-white">{title}</h2>
          <button onClick={onClose} className="text-[#8890a0] hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  )
}
