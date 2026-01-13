import { useAuth } from '../../context/AuthContext'

export default function VerifyContext() {
  const { user, profile } = useAuth()

  return (
    <div style={{ padding: 24 }}>
      <h1>DEBUG – Auth Context</h1>

      <pre style={{ background: '#f3f4f6', padding: 16, marginTop: 12 }}>
        USER:
        {JSON.stringify(user, null, 2)}
      </pre>

      <pre style={{ background: '#e5e7eb', padding: 16, marginTop: 12 }}>
        PROFILE:
        {JSON.stringify(profile, null, 2)}
      </pre>
    </div>
  )
}
