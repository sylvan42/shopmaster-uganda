import { Modal } from './Modal'

export const ConfirmDialog = ({ open, onClose, onConfirm, title, message, confirmLabel = 'Confirm', danger = false, loading = false }) => (
  <Modal
    open={open}
    onClose={onClose}
    title={title}
    footer={
      <>
        <button className="btn-outline-on-light" onClick={onClose} disabled={loading}>
          Cancel
        </button>
        <button
          className={danger ? 'inline-flex items-center justify-center bg-[#dc2626] text-white text-body-md rounded-pill px-[24px] py-[12px] transition-colors hover:bg-[#b91c1c] disabled:opacity-50' : 'btn-primary-pill'}
          onClick={onConfirm}
          disabled={loading}
        >
          {loading ? 'Working…' : confirmLabel}
        </button>
      </>
    }
  >
    <p className="text-body-md text-shade-60">{message}</p>
  </Modal>
)
