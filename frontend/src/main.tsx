import { StrictMode } from 'react'
import { createElement } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

// #region agent log
fetch('http://127.0.0.1:7643/ingest/b35ced89-ce75-44db-8592-58f1a1a3f325',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'bd572d'},body:JSON.stringify({sessionId:'bd572d',runId:'pre-fix',hypothesisId:'H3',location:'main.tsx',message:'main_entry',data:{hasRoot:typeof document!=='undefined'&&!!document.getElementById('root')},timestamp:Date.now()})}).catch(()=>{});
// #endregion

void import('./App.tsx').then(({ default: App }) => {
  // #region agent log
  fetch('http://127.0.0.1:7643/ingest/b35ced89-ce75-44db-8592-58f1a1a3f325',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'bd572d'},body:JSON.stringify({sessionId:'bd572d',runId:'pre-fix',hypothesisId:'H2',location:'main.tsx',message:'app_import_ok',data:{},timestamp:Date.now()})}).catch(()=>{});
  // #endregion
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}).catch((err: unknown) => {
  // #region agent log
  fetch('http://127.0.0.1:7643/ingest/b35ced89-ce75-44db-8592-58f1a1a3f325',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'bd572d'},body:JSON.stringify({sessionId:'bd572d',runId:'post-fix',hypothesisId:'H2',location:'main.tsx',message:'app_import_fail',data:{errMsg:err instanceof Error?err.message:String(err)},timestamp:Date.now()})}).catch(()=>{});
  // #endregion
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
