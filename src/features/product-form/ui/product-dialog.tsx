import { useEffect, useState } from 'react'

import {
  useCreateProduct,
  useUpdateProduct,
  type Product,
} from '@/entities/catalog'
import { ApiError } from '@/shared/api'
import { useTranslation, type TranslateFn } from '@/shared/i18n'
import { Button } from '@/shared/ui/primitives/button'
import { Dialog } from '@/shared/ui/primitives/dialog'
import { Field, Input, Textarea } from '@/shared/ui/primitives/input'

interface ProductDialogProps {
  product: Product | null
  /** Existing names, used to catch a duplicate before the round-trip. */
  existingNames: string[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * Create or edit a catalog product.
 *
 * `(company, name)` is unique and the comparison is case- and
 * whitespace-sensitive, so "iPhone 15" and "iphone 15 " would become two rows
 * and split the product's feedback statistics. The name is therefore trimmed
 * and checked case-insensitively here, before the request (docs/04).
 */
export function ProductDialog({
  product,
  existingNames,
  open,
  onOpenChange,
}: ProductDialogProps) {
  const { t } = useTranslation()
  const create = useCreateProduct()
  const update = useUpdateProduct()
  const mutation = product ? update : create

  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [currency, setCurrency] = useState('UZS')

  useEffect(() => {
    if (!open) {
      mutation.reset()
      return
    }
    setName(product?.name ?? '')
    setCategory(product?.category ?? '')
    setDescription(product?.description ?? '')
    setPrice(product?.price ?? '')
    setCurrency(product?.currency || 'UZS')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, product])

  const trimmedName = name.trim()
  const duplicate =
    trimmedName !== '' &&
    trimmedName.toLowerCase() !== (product?.name ?? '').toLowerCase() &&
    existingNames.some(
      (existing) => existing.toLowerCase() === trimmedName.toLowerCase(),
    )

  const priceError = validatePrice(price, t)
  const error = mutation.error instanceof ApiError ? mutation.error : null

  const submit = () => {
    const input = {
      name: trimmedName,
      category: category.trim(),
      description: description.trim(),
      // An empty field means "no price", which the API expresses as `null`.
      price: price.trim() === '' ? null : price.trim(),
      currency: currency.trim().toUpperCase() || 'UZS',
    }

    const options = { onSuccess: () => onOpenChange(false) }
    if (product) update.mutate({ id: product.id, input }, options)
    else create.mutate(input, options)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={t(product ? 'productForm.editTitle' : 'productForm.createTitle')}
      description={t('productForm.description')}
      footer={
        <>
          <Button onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          <Button
            variant="primary"
            loading={mutation.isPending}
            disabled={!trimmedName || duplicate || Boolean(priceError)}
            onClick={submit}
          >
            {t('settings.save')}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field
          label={t('productForm.name')}
          required
          error={
            duplicate
              ? t('productForm.duplicate')
              : (error?.byField.name?.detail ?? null)
          }
        >
          {(field) => (
            <Input
              {...field}
              value={name}
              maxLength={255}
              onChange={(event) => setName(event.target.value)}
            />
          )}
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t('productForm.category')}>
            {(field) => (
              <Input
                {...field}
                value={category}
                maxLength={128}
                onChange={(event) => setCategory(event.target.value)}
              />
            )}
          </Field>

          <Field
            label={t('productForm.price')}
            hint={t('productForm.priceHint')}
            error={priceError ?? error?.byField.price?.detail ?? null}
          >
            {(field) => (
              <div className="flex gap-2">
                <Input
                  {...field}
                  inputMode="decimal"
                  value={price}
                  placeholder={t('productForm.noPrice')}
                  onChange={(event) => setPrice(event.target.value)}
                />
                <Input
                  aria-label={t('productForm.currency')}
                  className="w-20"
                  maxLength={3}
                  value={currency}
                  onChange={(event) => setCurrency(event.target.value)}
                />
              </div>
            )}
          </Field>
        </div>

        <Field label={t('productForm.descriptionField')}>
          {(field) => (
            <Textarea
              {...field}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          )}
        </Field>

        {error && Object.keys(error.byField).length === 0 ? (
          <p role="alert" className="text-[13px] text-danger-fg">
            {error.isRoleDenied
              ? t('error.roleRequired')
              : (error.errors[0]?.detail ?? t('error.unknown.detail'))}
          </p>
        ) : null}
      </div>
    </Dialog>
  )
}

/** Reject a negative price locally so `price_negative` never round-trips. */
function validatePrice(value: string, t: TranslateFn): string | null {
  if (value.trim() === '') return null

  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return t('productForm.priceInvalid')
  if (parsed < 0) return t('productForm.priceNegative')
  return null
}
