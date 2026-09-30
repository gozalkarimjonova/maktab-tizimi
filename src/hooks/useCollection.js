import { useCallback, useEffect, useState } from 'react'
import { api } from '../api'

export function useCollection(collection) {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const result = await api.getCollection(collection)
      if (!Array.isArray(result)) throw new Error(result?.error || 'Ma’lumotlarni yuklab bo‘lmadi')
      setRows(result)
      setError('')
    } catch (err) {
      setError(err.message || 'Serverga ulanib bo‘lmadi')
    } finally {
      setLoading(false)
    }
  }, [collection])

  useEffect(() => { refresh() }, [refresh])
  return { rows, loading, error, refresh }
}
