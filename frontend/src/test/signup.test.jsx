import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { ThemeProvider } from '../context/ThemeContext'
import { AuthProvider } from '../context/AuthContext'
import { authAPI } from '../services/api'
import SignupPage from '../pages/SignupPage'

vi.mock('../services/api', () => ({
  authAPI: {
    signup: vi.fn(),
    getMe:  vi.fn().mockRejectedValue({}),
    login:  vi.fn(),
  },
}))

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal()
  return { ...actual, useNavigate: () => mockNavigate }
})

function renderSignup() {
  return render(
    <MemoryRouter initialEntries={['/signup']}>
      <ThemeProvider>
        <AuthProvider>
          <SignupPage />
        </AuthProvider>
      </ThemeProvider>
    </MemoryRouter>
  )
}

describe('SignupPage', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('renders the create account heading', () => {
    renderSignup()
    expect(screen.getByText('Create your account')).toBeInTheDocument()
  })

  it('renders full name, email and password fields', () => {
    renderSignup()
    expect(screen.getByPlaceholderText('Alex Johnson')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('you@company.com')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Create a strong password')).toBeInTheDocument()
  })

  it('shows validation errors on empty submit', async () => {
    const user = userEvent.setup()
    renderSignup()
    await user.click(screen.getByRole('button', { name: /create free account/i }))
    expect(screen.getByText(/full name must be at least 2/i)).toBeInTheDocument()
    expect(screen.getByText(/valid email is required/i)).toBeInTheDocument()
    expect(screen.getByText(/password must be at least 8/i)).toBeInTheDocument()
  })

  it('shows password strength checklist', async () => {
    const user = userEvent.setup()
    renderSignup()
    await user.type(screen.getByPlaceholderText('Create a strong password'), 'abc')
    expect(screen.getByText('At least 8 characters')).toBeInTheDocument()
    expect(screen.getByText('Contains a number')).toBeInTheDocument()
    expect(screen.getByText('Contains a letter')).toBeInTheDocument()
  })

  it('calls authAPI.signup with correct data', async () => {
    authAPI.signup.mockResolvedValue({
      data: { data: { accessToken: 'tok', user: { fullName: 'Priya Sharma', email: 'p@b.com' } } },
    })
    const user = userEvent.setup()
    renderSignup()
    await user.type(screen.getByPlaceholderText('Alex Johnson'), 'Priya Sharma')
    await user.type(screen.getByPlaceholderText('you@company.com'), 'priya@example.com')
    await user.type(screen.getByPlaceholderText('Create a strong password'), 'secure123')
    await user.click(screen.getByRole('button', { name: /create free account/i }))
    await waitFor(() =>
      expect(authAPI.signup).toHaveBeenCalledWith({
        fullName: 'Priya Sharma',
        email: 'priya@example.com',
        password: 'secure123',
      })
    )
  })

  it('navigates to dashboard after successful signup', async () => {
    authAPI.signup.mockResolvedValue({
      data: { data: { accessToken: 'tok', user: { fullName: 'Test', email: 't@b.com' } } },
    })
    const user = userEvent.setup()
    renderSignup()
    await user.type(screen.getByPlaceholderText('Alex Johnson'), 'Test User')
    await user.type(screen.getByPlaceholderText('you@company.com'), 'test@example.com')
    await user.type(screen.getByPlaceholderText('Create a strong password'), 'password1')
    await user.click(screen.getByRole('button', { name: /create free account/i }))
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/dashboard'))
  })

  it('shows server error on failed signup', async () => {
    authAPI.signup.mockRejectedValue({
      response: { data: { error: 'Email already exists' } },
    })
    const user = userEvent.setup()
    renderSignup()
    await user.type(screen.getByPlaceholderText('Alex Johnson'), 'Test User')
    await user.type(screen.getByPlaceholderText('you@company.com'), 'dup@example.com')
    await user.type(screen.getByPlaceholderText('Create a strong password'), 'password1')
    await user.click(screen.getByRole('button', { name: /create free account/i }))
    await waitFor(() =>
      expect(screen.getByText('Email already exists')).toBeInTheDocument()
    )
  })

  it('left panel has the unified gradient class (same as login)', () => {
    renderSignup()
    const panel = document.querySelector('.auth-left-panel')
    expect(panel).not.toBeNull()
  })
})
