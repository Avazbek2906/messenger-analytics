import { BarChart3, MessageSquareText, ShieldCheck } from 'lucide-react'

import { useTranslation, type MessageKey } from '@/shared/i18n'
import { LogoMark } from '@/shared/ui/brand/logo'

const HIGHLIGHTS = [
  {
    icon: MessageSquareText,
    titleKey: 'auth.brand.channels.title',
    textKey: 'auth.brand.channels.text',
  },
  {
    icon: BarChart3,
    titleKey: 'auth.brand.scoring.title',
    textKey: 'auth.brand.scoring.text',
  },
  {
    icon: ShieldCheck,
    titleKey: 'auth.brand.control.title',
    textKey: 'auth.brand.control.text',
  },
] as const satisfies readonly {
  icon: typeof BarChart3
  titleKey: MessageKey
  textKey: MessageKey
}[]

/** The login page's brand panel. Rendered from the `lg` breakpoint up. */
export function LoginBrandPanel() {
  const { t } = useTranslation()

  // The gradient span sits in a different position in every language, so its
  // slot is marked with {accent}. The text is split on an invisible separator —
  // splitting on whitespace would break the translations.
  const SPLIT = '\u0000'
  const [before = '', after = ''] = t('auth.brand.headline', {
    accent: SPLIT,
  }).split(SPLIT)

  return (
    <aside className="relative hidden overflow-hidden bg-slate-950 px-12 py-14 lg:flex lg:flex-col">
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(120%_90%_at_15%_0%,#4F46E5_0%,#312E81_38%,#020617_78%)]"
      />
      <div
        aria-hidden
        className="absolute -right-24 -bottom-32 size-96 rounded-full bg-cyan-500/25 blur-3xl"
      />

      <div className="relative flex items-center gap-3">
        <LogoMark className="size-9" gradient={false} />
        <span className="text-[15px] font-bold tracking-tight text-white">
          Messenger Analytics
        </span>
      </div>

      <div className="relative mt-auto space-y-10">
        <h1 className="max-w-md text-3xl leading-tight font-semibold text-white">
          {before}
          <span className="bg-gradient-to-r from-indigo-300 to-cyan-300 bg-clip-text text-transparent">
            {t('auth.brand.headlineAccent')}
          </span>
          {after}
        </h1>

        <ul className="max-w-md space-y-5">
          {HIGHLIGHTS.map(({ icon: Icon, titleKey, textKey }) => (
            <li key={titleKey} className="flex gap-3.5">
              <span
                aria-hidden
                className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/15"
              >
                <Icon className="size-[18px] text-cyan-200" />
              </span>
              <div className="space-y-0.5">
                <p className="text-sm font-medium text-white">{t(titleKey)}</p>
                <p className="text-[13px] leading-5 text-slate-300">
                  {t(textKey)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  )
}
