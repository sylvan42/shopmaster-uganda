export const StatTile = ({ label, value, subValue }) => (
  <div className="bg-canvas-cream border border-hairline-light rounded-lg px-[24px] py-[16px]">
    <p className="text-eyebrow-cap uppercase text-shade-50 mb-[4px]">{label}</p>
    <p className="text-heading-md font-medium text-ink">{value}</p>
    {subValue && <p className="text-caption text-shade-60 mt-[2px]">{subValue}</p>}
  </div>
)
