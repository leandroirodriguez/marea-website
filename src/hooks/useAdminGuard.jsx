import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export function useAdminGuard() {
  const navigate = useNavigate()
  const [verified, setVerified] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { navigate('/admin'); return }
      const { data } = await supabase.from('users').select('is_admin').eq('id', session.user.id).single()
      if (!data?.is_admin) { navigate('/admin'); return }
      setVerified(true)
    })
  }, [navigate])

  return verified
}
