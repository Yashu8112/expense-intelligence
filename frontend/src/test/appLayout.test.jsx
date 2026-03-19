import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route, Outlet } from 'react-router-dom'
import { ThemeProvider } from '../context/ThemeContext'
import { AuthProvider } from '../context/AuthContext'
import { authAPI } from '../services/api'
import AppLayout from '../layouts/AppLayout'

vi.mock('../services/api', () => ({
  authAPI: {
    getMe: vi.fn(),
    login: vi.fn(),
  },
}))

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal()
  return { ...actual, useNavigate: () => mockNavigate }
})

function renderLayout(user = { fullName: 'Ravi Kumar', email: 'r@b.com' }) {
  authAPI.getMe.mockResolvedValue({ data: { data: { user } } })
  localStorage.setItem('token', 'valid-jwt')

  return render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<div>Dashboard content</div>} />
            </Route>
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </MemoryRouter>
  )
}

describe('AppLayout', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
    document.documentElement.classList.remove('dark')
  })

  it('renders nav links for Dashboard, Expenses and Reports', async () => {
    renderLayout()
    await waitFor(() => expect(screen.getByText('Dashboard')).toBeInTheDocument())
    expect(screen.getByText('Expenses')).toBeInTheDocument()
    expect(screen.getByText('Reports')).toBeInTheDocument()
  })

  it('renders the user display name in the header', async () => {
    renderLayout()
    await waitFor(() => expect(screen.getByText('Ravi')).toBeInTheDocument())
  })

  it('renders the dark/light theme toggle button', async () => {
    renderLayout()
    await waitFor(() =>
      expect(screen.getByTitle(/switch to dark mode/i)).toBeInTheDocument()
    )
  })

  it('does NOT render a Bell notification button', async () => {
    renderLayout()
    await waitFor(() => expect(screen.getByText('Dashboard')).toBeInTheDocument())
    // Bell button had a notification dot span with specific classes
    const notifDots = document.querySelectorAll('.bg-brand-500.rounded-full.border-2')
    expect(notifDots.length).toBe(0)
  })

  it('toggles to dark mode when theme button is clicked', async () => {
    const user = userEvent.setup()
    renderLayout()
    await waitFor(() =>
      expect(screen.getByTitle(/switch to dark mode/i)).toBeInTheDocument()
    )
    await user.click(screen.getByTitle(/switch to dark mode/i))
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(screen.getByTitle(/switch to light mode/i)).toBeInTheDocument()
  })

  it('logs out and navigates to / when sign out is clicked', async () => {
    const user = userEvent.setup()
    renderLayout()
    await waitFor(() => expect(screen.getByText('Ravi')).toBeInTheDocument())
    // Open dropdown
    await user.click(screen.getByText('Ravi'))
    await user.click(screen.getByText('Sign out'))
    expect(localStorage.getItem('token')).toBeNull()
    expect(mockNavigate).toHaveBeenCalledWith('/')
  })

  it('renders the Expense Intel logo', async () => {
    renderLayout()
    await waitFor(() => expect(screen.getByText('Intel')).toBeInTheDocument())
    expect(screen.getByText('Expense')).toBeInTheDocument()
  })
})
