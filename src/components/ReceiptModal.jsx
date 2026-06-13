import { Printer } from 'lucide-react'
import { Modal } from './Modal'
import { useAuth } from '../context/AuthContext'
import { paymentLabel } from '../services/salesService'
import { formatUGX, formatDate, formatTime } from '../lib/formatters'

export const ReceiptModal = ({ open, onClose, sale }) => {
  const { shopName } = useAuth()
  if (!sale) return null

  return (
    <Modal open={open} onClose={onClose} title={`Receipt ${sale.receipt_no}`}
      footer={
        <>
          <button className="btn-outline-on-light" onClick={onClose}>Close</button>
          <button className="btn-primary-pill flex items-center gap-[8px]" onClick={() => window.print()}>
            <Printer size={16} /> Print
          </button>
        </>
      }
    >
      <div id="printable-receipt" className="font-body">
        <div className="text-center mb-[20px]">
          <h3 className="text-heading-md font-medium text-ink">{shopName || 'ShopMaster'}</h3>
          <p className="text-caption text-shade-60 mt-[4px]">
            {formatDate(sale.created_at)} · {formatTime(sale.created_at)}
          </p>
          <p className="text-caption text-shade-60">Receipt {sale.receipt_no}</p>
        </div>

        <table className="w-full text-body-md mb-[16px]">
          <thead>
            <tr className="border-b border-hairline-light">
              <th className="text-left py-[6px] text-caption uppercase text-shade-50">Item</th>
              <th className="text-center py-[6px] text-caption uppercase text-shade-50">Qty</th>
              <th className="text-right py-[6px] text-caption uppercase text-shade-50">Price</th>
              <th className="text-right py-[6px] text-caption uppercase text-shade-50">Total</th>
            </tr>
          </thead>
          <tbody>
            {(sale.sale_items || []).map((item) => (
              <tr key={item.id} className="border-b border-hairline-light last:border-0">
                <td className="py-[8px] text-ink">{item.product_name}</td>
                <td className="py-[8px] text-center text-shade-60">{item.quantity}</td>
                <td className="py-[8px] text-right text-shade-60">{formatUGX(item.unit_price)}</td>
                <td className="py-[8px] text-right text-ink font-medium">{formatUGX(item.line_total)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-between items-center border-t-2 border-ink pt-[12px] mb-[16px]">
          <span className="text-body-strong text-ink">TOTAL</span>
          <span className="text-heading-md font-medium text-ink">{formatUGX(sale.total_amount)}</span>
        </div>

        <div className="space-y-[4px] text-caption text-shade-60">
          <p>Payment: <span className="text-ink font-medium">{paymentLabel(sale.payment_method)}</span></p>
          {sale.customer_name && <p>Customer: <span className="text-ink font-medium">{sale.customer_name}</span></p>}
          <p>Served by: <span className="text-ink font-medium">{sale.seller?.full_name || sale.seller?.email || '—'}</span></p>
        </div>

        <p className="text-center text-caption text-shade-60 mt-[20px]">Thank you for shopping with us!</p>
      </div>
    </Modal>
  )
}
