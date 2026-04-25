'use client'
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react'
import { useState, useEffect, createContext, useContext, useCallback } from 'react'

type ToastType = 'success' | 'error' | 'warning' | 'info'

interface Toast {
  id: number
  type: ToastType
  message: string
}

interface ToastCtx {
  toast: (type: ToastType, message: string) => void
}

const ToastContext = createContext<ToastCtx>({ toast: () => {} })

export function useToast() { return useContext(ToastContext) }

const icons = {
  success: <CheckCircle size={16} className="text-[#00d4aa]" />,
  error: <XCircle size={16} className="text-[#f05050]" />,
  warning: <AlertTriangle size={16} className="text-[#f0c040]" />,
  info: <Info size={16} className="text-[#4090f0]" />,
}

const borders = {
  success: 'border-[#00d4aa]',
  error: 'border-[#f05050]',
  warning: 'border-[#f0c040]',
  info: 'border-[#4090f0]',
}

let _id = 0

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback((type: ToastType, message: string) => {
    const id = ++_id
    setToasts(prev => [...prev, { id, type, message }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500)
  }, [])

  const remove = (id: number) => setToasts(prev => prev.filter(t => t.id !== id))

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] space-y-2">
        {toasts.map(t => (
          <div key={t.id} className={`flex items-start gap-3 card border-l-2 ${borders[t.type]} p-4 min-w-[300px] animate-slide-up shadow-xl`}>
            {icons[t.type]}
            <p className="text-[13px] text-[#e8eaf0] flex-1">{t.message}</p>
            <button onClick={() => remove(t.id)} className="text-[#8890a0] hover:text-white">
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
