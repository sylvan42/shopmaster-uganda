import { AlertTriangle } from 'lucide-react'

export const ErrorState = ({ message, onRetry }) => (
  <div className="empty-state">
    <AlertTriangle size={48} className="text-shade-40 mb-[16px]" />
    <h3 className="text-heading-md font-medium text-ink mb-[8px]">Something went wrong</h3>
    <p className="text-body-md text-shade-60 mb-[24px] max-w-sm">{message || 'Could not load data. Check your connection and try again.'}</p>
    {onRetry && (
      <button className="btn-outline-on-light" onClick={onRetry}>
        Try again
      </button>
    )}
  </div>
)
