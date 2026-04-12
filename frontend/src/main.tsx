import { StrictMode } from 'react'
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
  fetch('http://127.0.0.1:7643/ingest/b35ced89-ce75-44db-8592-58f1a1a3f325',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'bd572d'},body:JSON.stringify({sessionId:'bd572d',runId:'pre-fix',hypothesisId:'H2',location:'main.tsx',message:'app_import_fail',data:{errMsg:err instanceof Error?err.message:String(err)},timestamp:Date.now()})}).catch(()=>{});
  // #endregion
})
