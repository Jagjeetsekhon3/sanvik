'use client'

import React, { createContext, useContext } from 'react'
import { Tenant } from '@/types'

interface TenantContextValue {
  tenant: Tenant
}

const TenantContext = createContext<TenantContextValue | null>(null)

export function TenantProvider({
  tenant,
  children,
}: {
  tenant: Tenant
  children: React.ReactNode
}) {
  return (
    <TenantContext.Provider value={{ tenant }}>
      {children}
    </TenantContext.Provider>
  )
}

export function useTenant(): Tenant {
  const ctx = useContext(TenantContext)
  if (!ctx) throw new Error('useTenant must be used inside TenantProvider')
  return ctx.tenant
}
