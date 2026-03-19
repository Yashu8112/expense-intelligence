import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider } from '../context/ThemeContext'
import { expenseAPI } from '../services/api'
import ExpenseForm from '../components/ExpenseForm'

vi.mock('../services/api', () => ({
  expenseAPI: {
    create: vi.fn(),
    update: vi.fn(),
  },
}))

const mockCategories = [
  { id: 1, name: 'Food', color: '#10b981' },
  { id: 2, name: 'Travel', color: '#3b82f6' },
]

function renderForm(expense = null) {
  const onSuccess = vi.fn()
  const onClose   = vi.fn()
  const { rerender } = render(
    <ThemeProvider>
      <ExpenseForm
        expense={expense}
        categories={mockCategories}
        onSuccess={onSuccess}
        onClose={onClose}
      />
    </ThemeProvider>
  )
  return { onSuccess, onClose, rerender }
}

describe('ExpenseForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('renders the Add Expense title when no expense prop', () => {
    renderForm()
    expect(screen.getByText('Add Expense')).toBeInTheDocument()
  })

  it('renders Edit Expense title when expense prop is provided', () => {
    renderForm({
      id: '1', title: 'Lunch', amount: '250', currency: 'INR',
      expenseDate: '2026-03-01', paymentMethod: 'CASH',
      category: { id: 1, name: 'Food', color: '#10b981' },
    })
    expect(screen.getByText('Edit Expense')).toBeInTheDocument()
  })

  it('defaults currency to INR', () => {
    renderForm()
    const currencySelect = screen.getByDisplayValue('INR')
    expect(currencySelect).toBeInTheDocument()
  })

  it('pre-fills fields when editing', () => {
    renderForm({
      id: '1', title: 'Coffee', amount: '120', currency: 'INR',
      expenseDate: '2026-03-10', paymentMethod: 'UPI',
    })
    expect(screen.getByDisplayValue('Coffee')).toBeInTheDocument()
    expect(screen.getByDisplayValue('120')).toBeInTheDocument()
  })

  it('shows error when title is empty on submit', async () => {
    const user = userEvent.setup()
    renderForm()
    await user.click(screen.getByRole('button', { name: /add expense/i }))
    expect(screen.getByText('Title is required')).toBeInTheDocument()
  })

  it('shows error when amount is empty on submit', async () => {
    const user = userEvent.setup()
    renderForm()
    await user.type(screen.getByPlaceholderText(/coffee/i), 'Dinner')
    await user.click(screen.getByRole('button', { name: /add expense/i }))
    expect(screen.getByText(/amount/i)).toBeInTheDocument()
  })

  it('calls expenseAPI.create with correct data on valid submit', async () => {
    expenseAPI.create.mockResolvedValue({ data: { data: {} } })
    const user = userEvent.setup()
    const { onSuccess } = renderForm()

    await user.type(screen.getByPlaceholderText(/coffee/i), 'Dinner at Saravana')
    await user.type(screen.getByPlaceholderText(/0.00/), '850')
    await user.click(screen.getByRole('button', { name: /add expense/i }))

    await waitFor(() =>
      expect(expenseAPI.create).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Dinner at Saravana', amount: '850', currency: 'INR' })
      )
    )
    expect(onSuccess).toHaveBeenCalled()
  })

  it('calls expenseAPI.update when editing', async () => {
    expenseAPI.update.mockResolvedValue({ data: { data: {} } })
    const user = userEvent.setup()
    const { onSuccess } = renderForm({
      id: 'abc-123', title: 'Old title', amount: '200', currency: 'INR',
      expenseDate: '2026-03-01', paymentMethod: 'CARD',
    })

    const titleInput = screen.getByDisplayValue('Old title')
    await user.clear(titleInput)
    await user.type(titleInput, 'New title')
    await user.click(screen.getByRole('button', { name: /save changes/i }))

    await waitFor(() =>
      expect(expenseAPI.update).toHaveBeenCalledWith(
        'abc-123',
        expect.objectContaining({ title: 'New title' })
      )
    )
    expect(onSuccess).toHaveBeenCalled()
  })

  it('calls onClose when cancel button is clicked', async () => {
    const user = userEvent.setup()
    const { onClose } = renderForm()
    await user.click(screen.getByRole('button', { name: /cancel/i }))
    expect(onClose).toHaveBeenCalled()
  })
})
