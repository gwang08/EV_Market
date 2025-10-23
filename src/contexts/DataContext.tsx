"use client"
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { getAllVehicles, getAllBatteries, type Vehicle, type Battery } from '../services'

interface DataContextType {
  vehicles: Vehicle[] | null
  batteries: Battery[] | null
  isLoadingVehicles: boolean
  isLoadingBatteries: boolean
  error: string | null
  fetchVehicles: (force?: boolean) => Promise<void>
  fetchBatteries: (force?: boolean) => Promise<void>
  clearCache: () => void
  refreshVehicles: () => Promise<void>
  refreshBatteries: () => Promise<void>
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [vehicles, setVehicles] = useState<Vehicle[] | null>(null)
  const [batteries, setBatteries] = useState<Battery[] | null>(null)
  const [isLoadingVehicles, setIsLoadingVehicles] = useState(false)
  const [isLoadingBatteries, setIsLoadingBatteries] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch vehicles - with cache support
  const fetchVehicles = useCallback(async (force = false) => {
    // If already have data and not forcing refresh, skip
    if (vehicles !== null && !force) {
      return
    }
    
    setIsLoadingVehicles(true)
    setError(null)
    
    try {
      const response = await getAllVehicles()
      if (response.success && response.data?.vehicles) {
        // Filter out SOLD vehicles globally
        const availableVehicles = response.data.vehicles.filter(
          (vehicle: Vehicle) => vehicle.status !== 'SOLD'
        )
        setVehicles(availableVehicles)
      } else {
        setError(response.message || 'Failed to fetch vehicles')
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch vehicles'
      setError(errorMsg)
    } finally {
      setIsLoadingVehicles(false)
    }
  }, [vehicles])

  // Fetch batteries - with cache support
  const fetchBatteries = useCallback(async (force = false) => {
    // If already have data and not forcing refresh, skip
    if (batteries !== null && !force) {
      return
    }
    
    setIsLoadingBatteries(true)
    setError(null)
    
    try {
      const response = await getAllBatteries()
      if (response.success && response.data?.batteries) {
        // Filter out SOLD batteries globally
        const availableBatteries = response.data.batteries.filter(
          (battery: Battery) => battery.status !== 'SOLD'
        )
        setBatteries(availableBatteries)
      } else {
        setError(response.message || 'Failed to fetch batteries')
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch batteries'
      setError(errorMsg)
    } finally {
      setIsLoadingBatteries(false)
    }
  }, [batteries])

  // Refresh vehicles (force fetch)
  const refreshVehicles = useCallback(async () => {
    await fetchVehicles(true)
  }, [fetchVehicles])

  // Refresh batteries (force fetch)
  const refreshBatteries = useCallback(async () => {
    await fetchBatteries(true)
  }, [fetchBatteries])

  // Clear all cache
  const clearCache = useCallback(() => {
    setVehicles(null)
    setBatteries(null)
    setError(null)
  }, [])

  return (
    <DataContext.Provider value={{
      vehicles,
      batteries,
      isLoadingVehicles,
      isLoadingBatteries,
      error,
      fetchVehicles,
      fetchBatteries,
      clearCache,
      refreshVehicles,
      refreshBatteries
    }}>
      {children}
    </DataContext.Provider>
  )
}

export function useDataContext() {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error('useDataContext must be used within DataProvider')
  }
  return context
}
