export const Modal = ({ open, title, children }) => {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-[90%] max-w-md rounded-xl border border-border bg-card p-6 shadow-lg">
        {title && <div className="text-lg font-semibold text-foreground mb-3">{title}</div>}
        <div className="text-foreground">{children}</div>
      </div>
    </div>
  )
}
