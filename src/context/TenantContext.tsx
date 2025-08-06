'use client'
import { createContext, useContext, useState } from 'react'

type TenantContextType = {
  tenantId: string
  setTenantId: (id: string) => void
}

const TenantContext = createContext<TenantContextType | undefined>(undefined)

export const TenantProvider = ({ children }: { children: React.ReactNode }) => {
  const [tenantId, setTenantId] = useState<string>('')

  return (
    <TenantContext.Provider value={{ tenantId, setTenantId }}>
      {children}
    </TenantContext.Provider>
  )
}

export const useTenant = () => {
  const context = useContext(TenantContext)
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider')
  }
  return context
}
