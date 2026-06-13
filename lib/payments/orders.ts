import { createServiceClient } from '@/lib/supabase/server'
import { CartItem, Address, PaymentMethod } from '@/types'

interface CreateOrderParams {
  tenantId: string
  customerId: string | null
  items: CartItem[]
  shippingAddress: Address
  paymentMethod: PaymentMethod
  discountCode?: string
  notes?: string
}

export async function createOrder(params: CreateOrderParams) {
  const supabase = createServiceClient()

  const subtotal = params.items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  let discount = 0

  // Apply discount code if provided
  if (params.discountCode) {
    const { data: code } = await supabase
      .from('discount_codes')
      .select('*')
      .eq('tenant_id', params.tenantId)
      .eq('code', params.discountCode.toUpperCase())
      .eq('is_active', true)
      .single()

    if (code) {
      const expired = code.expires_at && new Date(code.expires_at) < new Date()
      const maxed = code.max_uses && code.used_count >= code.max_uses
      const belowMin = code.min_order && subtotal < code.min_order

      if (!expired && !maxed && !belowMin) {
        discount = code.type === 'percentage'
          ? (subtotal * code.value) / 100
          : code.value

        // Increment usage
        await supabase
          .from('discount_codes')
          .update({ used_count: code.used_count + 1 })
          .eq('id', code.id)
      }
    }
  }

  const shipping = 0 // Free shipping for now — configurable later
  const total = Math.max(0, subtotal - discount + shipping)

  // Generate order number
  const { data: orderNumData } = await supabase
    .rpc('generate_order_number', { p_tenant_id: params.tenantId })

  const orderNumber = orderNumData || `ORD-${Date.now()}`

  const { data: order, error } = await supabase
    .from('orders')
    .insert({
      tenant_id: params.tenantId,
      customer_id: params.customerId,
      order_number: orderNumber,
      items: params.items,
      subtotal,
      discount,
      shipping,
      total,
      currency: 'INR', // will be dynamic in future
      payment_method: params.paymentMethod,
      payment_status: params.paymentMethod === 'cod' ? 'pending' : 'pending',
      order_status: params.paymentMethod === 'cod' ? 'confirmed' : 'pending',
      shipping_address: params.shippingAddress,
      discount_code: params.discountCode || null,
      notes: params.notes || null,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return order
}

export async function updateOrderPayment(
  orderId: string,
  paymentId: string,
  status: 'paid' | 'failed'
) {
  const supabase = createServiceClient()
  await supabase
    .from('orders')
    .update({
      payment_id: paymentId,
      payment_status: status,
      order_status: status === 'paid' ? 'confirmed' : 'pending',
    })
    .eq('id', orderId)
}
