export const Modal = ({ open, title, children }) => {
  if (!open) return null
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50
    }}>
      <div style={{ background: 'white', borderRadius: 12, width: '90%', maxWidth: 480, padding: 24 }}>
        {title && <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 12 }}>{title}</div>}
        <div>{children}</div>
      </div>
    </div>
  )
}

