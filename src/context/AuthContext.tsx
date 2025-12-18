import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import GlobalLoader from '../components/common/GlobalLoader'

type UserProfile = {
  id: string
  email: string
  role: 'school_admin' | 'parent' | 'teacher' | string
}

type AuthContextType = {
  loading: boolean
  profile: UserProfile | null
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  loading: true,
  profile: null,
  logout: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<UserProfile | null>(null)

  useEffect(() => {
    const loadSession = async () => {
      const { data } = await supabase.auth.getSession()
      const session = data.session

      if (!session) {
        setLoading(false)
        return
      }

      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/auth/me`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      )

      if (res.ok) {
        const profile = await res.json()
        setProfile(profile)
      }

      setLoading(false)
    }

    loadSession()
  }, [])

  const logout = async () => {
    await supabase.auth.signOut()
    setProfile(null)
    window.location.href = '/'
  }

if (loading) {
  return <GlobalLoader />
}



return (
  <AuthContext.Provider value={{ loading, profile, logout }}>
    {loading ? <GlobalLoader /> : children}
  </AuthContext.Provider>
)
)
}

export const useAuth = () => useContext(AuthContext)
