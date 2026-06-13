import { CheckCircle2, AlertCircle, X } from 'lucide-react'

export const Toast = ({ toasts, onDismiss }) => {
  if (!toasts.length) return null
  return (
    <div className="fixed bottom-[24px] right-[24px] z-[100] flex flex-col gap-[10px] max-w-sm w-[calc(100%-48px)] sm:w-auto">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="flex items-start gap-[10px] bg-canvas-night text-on-primary rounded-lg px-[16px] py-[12px] shadow-elevation-1 min-w-[280px]"
        >
          {t.type === 'success' ? (
            <CheckCircle2 size={18} className="text-aloe-10 shrink-0 mt-[1px]" />
          ) : (
            <AlertCircle size={18} className="text-[#fca5a5] shrink-0 mt-[1px]" />
          )}
          <p className="text-body-md flex-1">{t.message}</p>
          <button onClick={() => onDismiss(t.id)} className="text-shade-40 hover:text-on-primary transition-colors shrink-0">
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  )
}
