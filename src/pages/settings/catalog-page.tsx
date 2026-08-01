import { useState } from 'react'

import { useTranslation, type MessageKey } from '@/shared/i18n'
import { Segmented } from '@/shared/ui/primitives/segmented'
import { ProductsTable } from '@/widgets/products-table'
import { ReasonsTable } from '@/widgets/reasons-table'
import { RulebooksPanel } from '@/widgets/rulebooks-panel'

type Tab = 'products' | 'reasons' | 'rulebook'

const TABS = [
  { value: 'products', labelKey: 'settings.products' },
  { value: 'reasons', labelKey: 'settings.reasons' },
  { value: 'rulebook', labelKey: 'settings.rulebook' },
] as const satisfies readonly { value: Tab; labelKey: MessageKey }[]

/**
 * The AI configuration surface.
 *
 * All three tabs feed the same nightly batch prompt: products are the picklist
 * the model may match, reasons are the "why didn't they buy" taxonomy, and the
 * rulebook becomes the company's own scoring prompt (docs/04).
 */
export function CatalogSettingsPage() {
  const { t } = useTranslation()
  const [tab, setTab] = useState<Tab>('products')

  return (
    <div className="space-y-5">
      <Segmented
        aria-label={t('settings.catalog')}
        value={tab}
        onChange={setTab}
        options={TABS.map((item) => ({
          value: item.value,
          label: t(item.labelKey),
        }))}
      />

      {tab === 'products' ? <ProductsTable /> : null}
      {tab === 'reasons' ? <ReasonsTable /> : null}
      {tab === 'rulebook' ? <RulebooksPanel /> : null}
    </div>
  )
}

export default CatalogSettingsPage
