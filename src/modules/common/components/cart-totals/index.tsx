"use client"

import { convertToLocale } from "@lib/util/money"
import React from "react"

type CartTotalsProps = {
  totals: {
    total?: number | null
    subtotal?: number | null
    tax_total?: number | null
    currency_code: string
    item_subtotal?: number | null
    shipping_subtotal?: number | null
    discount_subtotal?: number | null
  }
  customAdjustments?: Array<{ label: string; amount: number }>
  shippingFee?: number
  freeShippingThreshold?: number
}

const CartTotals: React.FC<CartTotalsProps> = ({
  totals,
  customAdjustments = [],
  shippingFee = 150,
  freeShippingThreshold = 3000,
}) => {
  const {
    currency_code,
    total,
    tax_total,
    item_subtotal,
    shipping_subtotal,
    discount_subtotal,
  } = totals

  // Medusa kuruş standardı: 150 TL = 15000, 3000 TL = 300000
  const thresholdMinor = (freeShippingThreshold || 3000) * 100
  const standardFeeMinor = (shippingFee || 150) * 100
  const subtotalMinor = item_subtotal ?? 0

  const hasExplicitShipping = shipping_subtotal !== null && shipping_subtotal !== undefined && shipping_subtotal > 0
  const isFreeByThreshold = subtotalMinor >= thresholdMinor
  const estimatedShippingMinor = hasExplicitShipping ? shipping_subtotal : (isFreeByThreshold ? 0 : standardFeeMinor)

  // Toplam hesaplama: Eğer sepette kargo henüz seçilmemişse tahmini kargo tutarını toplama ekle
  const adjustmentsTotal = customAdjustments.reduce((acc, curr) => acc + (curr.amount || 0), 0)
  const baseTotal = total ?? (subtotalMinor + (tax_total ?? 0) - (discount_subtotal ?? 0))
  const displayedTotal = baseTotal + (hasExplicitShipping ? 0 : estimatedShippingMinor) + adjustmentsTotal

  return (
    <div>
      <div className="flex flex-col gap-y-2 txt-medium text-ui-fg-subtle ">
        <div className="flex items-center justify-between">
          <span>Ara Toplam</span>
          <span data-testid="cart-subtotal" data-value={item_subtotal || 0}>
            {convertToLocale({ amount: item_subtotal ?? 0, currency_code })}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span>Kargo</span>
          <span data-testid="cart-shipping" data-value={hasExplicitShipping ? shipping_subtotal : estimatedShippingMinor}>
            {hasExplicitShipping
              ? convertToLocale({ amount: shipping_subtotal ?? 0, currency_code })
              : isFreeByThreshold
              ? <span className="text-emerald-700 font-semibold">Ücretsiz Kargo</span>
              : convertToLocale({ amount: estimatedShippingMinor, currency_code })}
          </span>
        </div>
        {!!discount_subtotal && (
          <div className="flex items-center justify-between">
            <span>İndirim</span>
            <span
              className="text-ui-fg-interactive"
              data-testid="cart-discount"
              data-value={discount_subtotal || 0}
            >
              -{" "}
              {convertToLocale({
                amount: discount_subtotal ?? 0,
                currency_code,
              })}
            </span>
          </div>
        )}

        {customAdjustments && customAdjustments.map((adj, index) => (
          <div key={index} className="flex items-center justify-between">
            <span>{adj.label}</span>
            <span className="text-ui-fg-base font-medium">
              +{convertToLocale({ amount: adj.amount, currency_code })}
            </span>
          </div>
        ))}
      </div>
      <div className="h-px w-full border-b border-gray-200 my-4" />
      <div className="flex items-center justify-between text-ui-fg-base mb-2 txt-medium ">
        <span>Toplam</span>
        <span
          className="txt-xlarge-plus"
          data-testid="cart-total"
          data-value={displayedTotal}
        >
          {convertToLocale({ amount: displayedTotal, currency_code })}
        </span>
      </div>
      <div className="h-px w-full border-b border-gray-200 mt-4" />
    </div>
  )
}

export default CartTotals
