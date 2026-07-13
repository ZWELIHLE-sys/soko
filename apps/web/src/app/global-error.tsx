'use client'

// Last-resort boundary: catches errors in the root layout itself. It replaces
// the whole document, so it must render its own <html>/<body> and can't rely
// on app styles — inline styles are the documented exception here.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'Georgia, serif', background: '#FFFBF5' }}>
        <div style={{
          minHeight: '100vh', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 24,
        }}>
          <div style={{
            width: 52, height: 52, borderRadius: 12, background: '#7C2D12', color: '#FEF3C7',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 26, fontWeight: 900, marginBottom: 20,
          }}>V</div>
          <h1 style={{ fontSize: 24, color: '#1a1a1a', marginBottom: 8 }}>Something went wrong</h1>
          <p style={{ fontSize: 15, color: '#6b7280', maxWidth: 380, lineHeight: 1.6, marginBottom: 22 }}>
            Vuna hit an unexpected error. Please try again.
          </p>
          <button
            onClick={reset}
            style={{
              padding: '11px 24px', background: '#7C2D12', color: '#FEF3C7', border: 'none',
              borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer',
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}
