import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { ThemeProvider } from '../context/ThemeContext'
import { AuthProvider } from '../context/AuthContext'
import { authAPI } from '../services/api'
import LoginPage from '../pages/LoginPage'

vi.mock('../services/api', () => ({
  authAPI: {
    login:  vi.fn(),
    getMe:  vi.fn().mockRejectedValue({}),
    signup: vi.fn(),
  },
}))

// navigate mock
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal()
  return { ...actual, useNavigate: () => mockNavigate }
})

function renderLogin() {
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <ThemeProvider>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </ThemeProvider>
    </MemoryRouter>
  )
}

describe('LoginPage', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('renders the sign-in heading', () => {
    renderLogin()
    expect(screen.getByText('Welcome back')).toBeInTheDocument()
  })

  it('renders email and password inputs', () => {
    renderLogin()
    expect(screen.getByPlaceholderText('you@company.com')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument()
  })

  it('shows error when submitting empty form', async () => {
    const user = userEvent.setup()
    renderLogin()
    await user.click(screen.getByRole('button', { name: /sign in/i }))
    expect(screen.getByText('Email is required')).toBeInTheDocument()
    expect(screen.getByText('Password is required')).toBeInTheDocument()
  })

  it('shows invalid email error for bad email', async () => {
    const user = userEvent.setup()
    renderLogin()
    await user.type(screen.getByPlaceholderText('you@company.com'), 'notanemail')
    await user.click(screen.getByRole('button', { name: /sign in/i }))
    expect(screen.getByText('Invalid email')).toBeInTheDocument()
  })

  it('calls authAPI.login with correct credentials', async () => {
    authAPI.login.mockResolvedValue({
      data: { data: { accessToken: 'tok', user: { fullName: 'Test', email: 't@b.com' } } },
    })
    const user = userEvent.setup()
    renderLogin()
    await user.type(screen.getByPlaceholderText('you@company.com'), 'test@example.com')
    await user.type(screen.getByPlaceholderText('••••••••'), 'password123')
    await user.click(screen.getByRole('button', { name: /sign in/i }))
    await waitFor(() =>
      expect(authAPI.login).toHaveBeenCalledWith({
        email: 'test@example.com', password: 'password123',
      })
    )
  })

  it('navigates to dashboard on successful login', async () => {
    authAPI.login.mockResolvedValue({
      data: { data: { accessToken: 'tok', user: { fullName: 'Test', email: 't@b.com' } } },
    })
    const user = userEvent.setup()
    renderLogin()
    await user.type(screen.getByPlaceholderText('you@company.com'), 'test@example.com')
    await user.type(screen.getByPlaceholderText('••••••••'), 'password123')
    await user.click(screen.getByRole('button', { name: /sign in/i }))
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/dashboard', expect.any(Object)))
  })

  it('shows server error on failed login', async () => {
    authAPI.login.mockRejectedValue({
      response: { data: { error: 'Invalid credentials' } },
    })
    const user = userEvent.setup()
    renderLogin()
    await user.type(screen.getByPlaceholderText('you@company.com'), 'bad@example.com')
    await user.type(screen.getByPlaceholderText('••••••••'), 'wrongpass')
    await user.click(screen.getByRole('button', { name: /sign in/i }))
    await waitFor(() =>
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
    )
  })

  it('does NOT render a Bell/notification icon', () => {
    renderLogin()
    // Bell icon would have aria-label or be a lucide SVG — check no notification dot
    const bells = document.querySelectorAll('[data-testid="bell"]')
    expect(bells.length).toBe(0)
  })

  it('left panel has the unified gradient class', () => {
    renderLogin()
    const panel = document.querySelector('.auth-left-panel')
    expect(panel).not.toBeNull()
  })
})
