import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { ThemeProvider } from '../context/ThemeContext'
import { AuthProvider } from '../context/AuthContext'
import { expenseAPI, authAPI } from '../services/api'
import ExpensesPage from '../pages/ExpensesPage'

vi.mock('../services/api', () => ({
  expenseAPI: {
    getAll:     vi.fn(),
    delete:     vi.fn(),
    categories: vi.fn(),
    create:     vi.fn(),
    update:     vi.fn(),
  },
  authAPI: {
    getMe: vi.fn().mockRejectedValue({}),
  },
}))

const MOCK_EXPENSES = [
  {
    id: '1', title: 'Grocery Shopping', merchant: 'BigBasket',
    amount: '1250.50', currency: 'INR', expenseDate: '2026-03-15',
    paymentMethod: 'UPI', aiProcessed: true,
    category: { id: 1, name: 'Food', color: '#10b981' },
  },
  {
    id: '2', title: 'Metro Card Recharge', merchant: null,
    amount: '500.00', currency: 'INR', expenseDate: '2026-03-10',
    paymentMethod: 'CARD', aiProcessed: false,
    category: { id: 2, name: 'Travel', color: '#3b82f6' },
  },
]

const MOCK_PAGE = {
  content: MOCK_EXPENSES, page: 0, size: 15,
  totalElements: 2, totalPages: 1,
}

function renderPage() {
  expenseAPI.getAll.mockResolvedValue({ data: { data: MOCK_PAGE } })
  expenseAPI.categories.mockResolvedValue({ data: { data: [] } })

  return render(
    <MemoryRouter>
      <ThemeProvider>
        <AuthProvider>
          <ExpensesPage />
        </AuthProvider>
      </ThemeProvider>
    </MemoryRouter>
  )
}

describe('ExpensesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('renders page title', async () => {
    renderPage()
    await waitFor(() => expect(screen.getByText('Expenses')).toBeInTheDocument())
  })

  it('displays expense titles in the table', async () => {
    renderPage()
    await waitFor(() =>
      expect(screen.getByText('Grocery Shopping')).toBeInTheDocument()
    )
    expect(screen.getByText('Metro Card Recharge')).toBeInTheDocument()
  })

  it('displays amounts in INR (₹) not USD ($)', async () => {
    renderPage()
    await waitFor(() =>
      expect(screen.getByText('Grocery Shopping')).toBeInTheDocument()
    )
    // Should find ₹ symbols
    const amounts = screen.getAllByText(/₹/)
    expect(amounts.length).toBeGreaterThan(0)
    // Must NOT contain $ symbol in any amount cell
    const dollarAmounts = document.querySelectorAll('td')
    const hasDollar = [...dollarAmounts].some(td => td.textContent.includes('$'))
    expect(hasDollar).toBe(false)
  })

  it('formats 1250.50 using en-IN locale (1,250.50)', async () => {
    renderPage()
    await waitFor(() => screen.getByText('Grocery Shopping'))
    expect(screen.getByText(/1,250\.50/)).toBeInTheDocument()
  })

  it('shows AI badge for AI-processed expenses', async () => {
    renderPage()
    await waitFor(() => screen.getByText('Grocery Shopping'))
    expect(screen.getByText('AI')).toBeInTheDocument()
  })

  it('renders payment method badges', async () => {
    renderPage()
    await waitFor(() => screen.getByText('UPI'))
    expect(screen.getByText('Card')).toBeInTheDocument()
  })

  it('renders search input', async () => {
    renderPage()
    await waitFor(() =>
      expect(screen.getByPlaceholderText('Search expenses...')).toBeInTheDocument()
    )
  })

  it('calls getAll with search param when user types', async () => {
    const user = userEvent.setup()
    renderPage()
    await waitFor(() => screen.getByPlaceholderText('Search expenses...'))
    await user.type(screen.getByPlaceholderText('Search expenses...'), 'Grocery')
    await waitFor(() =>
      expect(expenseAPI.getAll).toHaveBeenCalledWith(
        expect.objectContaining({ search: 'Grocery' })
      )
    )
  })

  it('shows empty state when no expenses returned', async () => {
    expenseAPI.getAll.mockResolvedValue({
      data: { data: { content: [], page: 0, size: 15, totalElements: 0, totalPages: 0 } },
    })
    expenseAPI.categories.mockResolvedValue({ data: { data: [] } })
    render(
      <MemoryRouter>
        <ThemeProvider>
          <AuthProvider><ExpensesPage /></AuthProvider>
        </ThemeProvider>
      </MemoryRouter>
    )
    await waitFor(() =>
      expect(screen.getByText('No expenses found')).toBeInTheDocument()
    )
  })

  it('shows filters panel when Filters button is clicked', async () => {
    const user = userEvent.setup()
    renderPage()
    await waitFor(() => screen.getByText('Filters'))
    await user.click(screen.getByText('Filters'))
    expect(screen.getByLabelText('Category')).toBeInTheDocument()
  })
})
