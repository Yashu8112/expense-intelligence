import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authAPI } from '../services/api'
import { Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'

export default function OAuth2Redirect() {
  const [params]  = useSearchParams()
  const navigate  = useNavigate()
  const { login } = useAuth()

  useEffect(() => {
    const token = params.get('token')
    const error = params.get('error')

    if (error) {
      toast.error('OAuth login failed: ' + error)
      navigate('/login')
      return
    }

    if (!token) {
      toast.error('No token received from OAuth provider')
      navigate('/login')
      return
    }

    // Store token and fetch user
    localStorage.setItem('token', token)
    authAPI.getMe()
      .then(res => {
        const userData = res.data.data
        // Manually trigger auth context update
        window.location.href = '/dashboard'
      })
      .catch(() => {
        toast.error('Failed to authenticate. Please try again.')
        navigate('/login')
      })
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-14 h-14 rounded-2xl ai-gradient flex items-center justify-center shadow-lg">
          <Sparkles size={24} className="text-white" />
        </div>
        <div className="text-center">
          <h2 className="font-display font-bold text-surface-900 text-lg">Completing sign in...</h2>
          <p className="text-surface-500 text-sm mt-1">Please wait a moment</p>
        </div>
        <div className="flex gap-1.5 mt-2">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="w-2 h-2 bg-brand-500 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
