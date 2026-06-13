import { useEffect } from 'react'
import { X } from 'lucide-react'

export const Modal = ({ open, onClose, title, subtitle, children, footer, wide = false }) => {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-0 sm:p-[24px]">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div
        className={`relative bg-canvas-light rounded-t-lg sm:rounded-lg shadow-elevation-1 w-full ${
          wide ? 'sm:max-w-3xl' : 'sm:max-w-lg'
        } max-h-[92vh] flex flex-col`}
      >
        <div className="flex items-start justify-between px-[24px] py-[18px] border-b border-hairline-light shrink-0">
          <div>
            <h3 className="text-heading-md font-medium text-ink">{title}</h3>
            {subtitle && <p className="text-caption text-shade-60 mt-[2px]">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="btn-ghost -mr-[4px]">
            <X size={18} />
          </button>
        </div>
        <div className="px-[24px] py-[20px] overflow-y-auto flex-1">{children}</div>
        {footer && (
          <div className="px-[24px] py-[16px] border-t border-hairline-light flex justify-end gap-[12px] shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
