import { useCallback, useEffect, useRef, useState } from 'react'

// Generic data-fetch hook around a service call returning { data, error }.
// `deps` re-runs the query; `refetch` re-runs it manually after mutations.
export const useSupabaseQuery = (queryFn, deps = []) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const queryRef = useRef(queryFn)
  queryRef.current = queryFn

  const run = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data, error } = await queryRef.current()
    setData(error ? null : data)
    setError(error || null)
    setLoading(false)
  }, [])

  useEffect(() => {
    run()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return { data, loading, error, refetch: run }
}
