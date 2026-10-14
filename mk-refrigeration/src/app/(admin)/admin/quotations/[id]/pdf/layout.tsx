export default function PDFLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: '#f5f5f5', overflowY: 'auto' }}>
      {children}
    </div>
  )
}
