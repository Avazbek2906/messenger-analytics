import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { AppProviders } from '@/app/providers/app-providers'
import { AppRouter } from '@/app/router/app-router'
import '@/shared/ui/styles/index.css'

const container = document.getElementById('root')
if (!container) throw new Error('#root elementi topilmadi')

createRoot(container).render(
  <StrictMode>
    <AppProviders>
      <AppRouter />
    </AppProviders>
  </StrictMode>,
)
