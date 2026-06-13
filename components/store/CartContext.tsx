'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { CartItem } from '@/types'

interface CartContextValue {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (productId: string, variantId: string) => void
  updateQty: (productId: string, variantId: string, qty: number) => void
  clearCart: () => void
  total: number
  count: number
  isOpen: boolean
  openCart: () => void
  closeCart: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isOpen, setIsOpen] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('fashn_cart')
      if (saved) setItems(JSON.parse(saved))
    } catch {}
  }, [])

  // Persist to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem('fashn_cart', JSON.stringify(items))
    } catch {}
  }, [items])

  const addItem = (item: CartItem) => {
    setItems(prev => {
      const existing = prev.find(
        i => i.product_id === item.product_id && i.variant_id === item.variant_id
      )
      if (existing) {
        return prev.map(i =>
          i.product_id === item.product_id && i.variant_id === item.variant_id
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        )
      }
      return [...prev, item]
    })
    setIsOpen(true)
  }

  const removeItem = (productId: string, variantId: string) => {
    setItems(prev =>
      prev.filter(i => !(i.product_id === productId && i.variant_id === variantId))
    )
  }

  const updateQty = (productId: string, variantId: string, qty: number) => {
    if (qty <= 0) {
      removeItem(productId, variantId)
      return
    }
    setItems(prev =>
      prev.map(i =>
        i.product_id === productId && i.variant_id === variantId
          ? { ...i, quantity: qty }
          : i
      )
    )
  }

  const clearCart = () => setItems([])
  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const count = items.reduce((sum, i) => sum + i.quantity, 0)

  return (
    <CartContext.Provider value={{
      items, addItem, removeItem, updateQty, clearCart,
      total, count, isOpen,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside CartProvider')
  return ctx
}
