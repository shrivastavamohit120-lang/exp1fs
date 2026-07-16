import { useState, useCallback } from 'react'

// Generic reusable controlled-input hook (Section 2, React Hooks & Custom Hooks).
export function useForm(initialValue = '') {
  const [value, setValue] = useState(initialValue)

  const handleChange = useCallback((e) => {
    setValue(e.target.value)
  }, [])

  const reset = useCallback(() => setValue(initialValue), [initialValue])

  return { value, setValue, handleChange, reset }
}
