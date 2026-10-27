'use client'

import { useEffect, useState, type Dispatch, type SetStateAction } from 'react'

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  isValid: (value: unknown) => value is T,
): [T, Dispatch<SetStateAction<T>>, boolean, boolean] {
  const [value, setValue] = useState<T>(initialValue)
  const [isReady, setIsReady] = useState(false)
  const [isAvailable, setIsAvailable] = useState(true)

  useEffect(() => {
    try {
      const storedValue = window.localStorage.getItem(key)
      if (storedValue !== null) {
        let parsedValue: unknown
        try {
          parsedValue = JSON.parse(storedValue)
        } catch {
          window.localStorage.removeItem(key)
          return
        }
        if (isValid(parsedValue)) {
          setValue(parsedValue)
        } else {
          window.localStorage.removeItem(key)
        }
      }
    } catch {
      setIsAvailable(false)
    } finally {
      setIsReady(true)
    }
  }, [isValid, key])

  useEffect(() => {
    if (!isReady || !isAvailable) return
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
      setIsAvailable(false)
    }
  }, [isAvailable, isReady, key, value])

  return [value, setValue, isReady, isAvailable]
}
