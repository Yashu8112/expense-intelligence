import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider, useAuth } from '../context/AuthContext'
import { authAPI } from '../services/api'

vi.mock('../services/api', () => ({
  authAPI: {
    login:  vi.fn(),
    signup: vi.fn(),
    getMe:  vi.fn(),
  },
}))

function AuthConsumer() {
  const { user, token, isAuthenticated, login, logout, signup } = useAuth()
  return (
    <div>
      <span data-testid="authed">{isAuthenticated ? 'yes' : 'no'}</span>
      <span data-testid="user">{user?.fullName ?? 'none'}</span>
      <span data-testid="token">{token ?? 'none'}</span>
      <button data-testid="login"
        onClick={() => login({ email: 'a@b.com', password: 'pass' })} />
      <button data-testid="signup"
        onClick={() => signup({ fullName: 'New User', email: 'n@b.com', password: 'pass123' })} />
      <button data-testid="logout" onClick={logout} />
    </div>
  )
}

function renderAuth() {
  return render(
    <BrowserRouter>
      <AuthProvider><AuthConsumer /></AuthProvider>
    </BrowserRouter>
  )
}

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('starts unauthenticated when no token in storage', async () => {
    authAPI.getMe.mockRejectedValue(new Error('no token'))
    renderAuth()
    await waitFor(() =>
      expect(screen.getByTestId('authed').textContent).toBe('no')
    )
  })

  it('rehydrates user from stored token on mount', async () => {
    localStorage.setItem('token', 'stored-jwt')
    authAPI.getMe.mockResolvedValue({
      data: { data: { user: { fullName: 'Stored User', email: 's@b.com' } } },
    })
    renderAuth()
    await waitFor(() =>
      expect(screen.getByTestId('user').textContent).toBe('Stored User')
    )
    expect(screen.getByTestId('authed').textContent).toBe('yes')
  })

  it('clears token when getMe fails on rehydration', async () => {
    localStorage.setItem('token', 'bad-jwt')
    authAPI.getMe.mockRejectedValue({ response: { status: 401 } })
    renderAuth()
    await waitFor(() =>
      expect(screen.getByTestId('authed').textContent).toBe('no')
    )
    expect(localStorage.getItem('token')).toBeNull()
  })

  it('logs in and sets user + token', async () => {
    authAPI.getMe.mockRejectedValue({})
    authAPI.login.mockResolvedValue({
      data: {
        data: {
          accessToken: 'jwt-abc',
          user: { fullName: 'Test User', email: 't@b.com' },
        },
      },
    })
    const user = userEvent.setup()
    renderAuth()
    await waitFor(() => expect(screen.getByTestId('authed').textContent).toBe('no'))
    await user.click(screen.getByTestId('login'))
    await waitFor(() =>
      expect(screen.getByTestId('authed').textContent).toBe('yes')
    )
    expect(screen.getByTestId('user').textContent).toBe('Test User')
    expect(screen.getByTestId('token').textContent).toBe('jwt-abc')
    expect(localStorage.getItem('token')).toBe('jwt-abc')
  })

  it('signs up and sets user + token', async () => {
    authAPI.getMe.mockRejectedValue({})
    authAPI.signup.mockResolvedValue({
      data: {
        data: {
          accessToken: 'jwt-new',
          user: { fullName: 'New User', email: 'n@b.com' },
        },
      },
    })
    const user = userEvent.setup()
    renderAuth()
    await waitFor(() => expect(screen.getByTestId('authed').textContent).toBe('no'))
    await user.click(screen.getByTestId('signup'))
    await waitFor(() =>
      expect(screen.getByTestId('authed').textContent).toBe('yes')
    )
    expect(screen.getByTestId('user').textContent).toBe('New User')
    expect(localStorage.getItem('token')).toBe('jwt-new')
  })

  it('logs out and clears user + token', async () => {
    localStorage.setItem('token', 'jwt-active')
    authAPI.getMe.mockResolvedValue({
      data: { data: { user: { fullName: 'Active User', email: 'a@b.com' } } },
    })
    const user = userEvent.setup()
    renderAuth()
    await waitFor(() =>
      expect(screen.getByTestId('authed').textContent).toBe('yes')
    )
    await user.click(screen.getByTestId('logout'))
    expect(screen.getByTestId('authed').textContent).toBe('no')
    expect(screen.getByTestId('user').textContent).toBe('none')
    expect(localStorage.getItem('token')).toBeNull()
  })

  it('throws when useAuth is used outside AuthProvider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<AuthConsumer />)).toThrow()
    spy.mockRestore()
  })
})
