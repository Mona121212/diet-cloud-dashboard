import { StrictMode } from 'react'
import { createElement } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

void import('./App.tsx').then(({ default: App }) => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}).catch((err: unknown) => {
  const rootEl = document.getElementById('root')
  if (rootEl) {
    const msg = err instanceof Error ? err.message : String(err)
    createRoot(rootEl).render(
      createElement(
        'div',
        {
          style: {
            minHeight: '100vh',
            padding: '2rem',
            fontFamily: 'system-ui, sans-serif',
            background: '#e9ecef',
            color: '#212529',
            maxWidth: '36rem',
            margin: '0 auto',
          },
        },
        createElement('h1', { style: { fontSize: '1.25rem' } }, 'App failed to start'),
        createElement('p', { style: { marginTop: '0.75rem' } }, msg),
        createElement('p', { style: { marginTop: '1rem', fontSize: '0.9rem', color: '#495057' } },
          'Ensure frontend/.env defines VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY, then restart the dev server from the frontend folder (npm run dev).'),
      ),
    )
  }
})
