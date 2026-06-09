export const PageHeader = ({ title, subtitle, action }) => (
  <div className="page-header">
    <div>
      <h1 className="text-heading-xl font-medium text-ink">{title}</h1>
      {subtitle && <p className="text-body-md text-shade-60 mt-[4px]">{subtitle}</p>}
    </div>
    {action && <div>{action}</div>}
  </div>
)
