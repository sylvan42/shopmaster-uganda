export const EmptyState = ({ icon: Icon, title, subtitle, action }) => (
  <div className="empty-state">
    {Icon && <Icon size={48} className="text-shade-40 mb-[16px]" />}
    <h3 className="text-heading-md font-medium text-ink mb-[8px]">{title}</h3>
    {subtitle && <p className="text-body-md text-shade-60 mb-[24px] max-w-xs">{subtitle}</p>}
    {action && <div>{action}</div>}
  </div>
)
