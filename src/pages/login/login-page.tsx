import { LanguageMenu } from '@/app/layouts/language-menu'

import { LoginBrandPanel } from './ui/login-brand-panel'
import { LoginForm } from './ui/login-form'

/**
 * Login page.
 *
 * Two columns: the brand panel on the left (desktop) and the form on the right.
 * Each section is its own component — the page only composes them.
 */
export function LoginPage() {
  return (
    <div className="grid min-h-dvh bg-canvas lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <LoginBrandPanel />

      <div className="relative flex items-center justify-center px-5 py-10 sm:px-8">
        {/* The language switcher is needed BEFORE sign-in, so nobody has to log
            in through a language they cannot read. */}
        <div className="absolute top-5 right-5">
          <LanguageMenu />
        </div>
        <LoginForm />
      </div>
    </div>
  )
}

export default LoginPage
