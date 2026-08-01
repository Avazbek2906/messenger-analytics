import { AlertTriangle } from 'lucide-react'

import type { Product } from '@/entities/catalog'
import type { UUID } from '@/shared/api'
import { useTranslation } from '@/shared/i18n'
import { Button } from '@/shared/ui/primitives/button'
import { Dialog } from '@/shared/ui/primitives/dialog'

interface DeleteProductDialogProps {
  product: Product | null
  isPending: boolean
  onCancel: () => void
  onConfirm: (id: UUID) => void
  onDeactivate: (id: UUID) => void
}

/**
 * Confirmation before deleting a product.
 *
 * Deletion cascades the links to past `AnalysisResult` rows, so historical
 * product-feedback numbers shrink retroactively. Deactivation is offered as the
 * primary action and deletion is the secondary one (docs/04).
 */
export function DeleteProductDialog({
  product,
  isPending,
  onCancel,
  onConfirm,
  onDeactivate,
}: DeleteProductDialogProps) {
  const { t } = useTranslation()

  return (
    <Dialog
      open={product !== null}
      onOpenChange={(open) => {
        if (!open) onCancel()
      }}
      title={t('productsTable.deleteTitle')}
      description={product?.name}
      footer={
        <>
          <Button onClick={onCancel}>{t('common.cancel')}</Button>
          <Button
            variant="primary"
            disabled={isPending}
            onClick={() => product && onDeactivate(product.id)}
          >
            {t('productsTable.deactivate')}
          </Button>
          <Button
            variant="danger"
            loading={isPending}
            onClick={() => product && onConfirm(product.id)}
          >
            {t('productsTable.delete')}
          </Button>
        </>
      }
    >
      <div className="flex gap-3 rounded-lg bg-danger-soft px-4 py-3.5">
        <AlertTriangle
          className="mt-0.5 size-4 shrink-0 text-danger"
          aria-hidden
        />
        <p className="text-[13px] leading-6 text-danger-fg">
          {t('productsTable.deleteWarning')}
        </p>
      </div>
    </Dialog>
  )
}
