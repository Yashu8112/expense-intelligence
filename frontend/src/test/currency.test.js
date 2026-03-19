import { describe, it, expect } from 'vitest'

// ── inline copy of the formatCurrency helper from DashboardPage ──
function formatCurrency(val) {
  if (!val && val !== 0) return '₹0.00'
  return '₹' + parseFloat(val).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

describe('formatCurrency', () => {
  it('returns ₹0.00 for null', () => {
    expect(formatCurrency(null)).toBe('₹0.00')
  })

  it('returns ₹0.00 for undefined', () => {
    expect(formatCurrency(undefined)).toBe('₹0.00')
  })

  it('formats zero correctly', () => {
    expect(formatCurrency(0)).toBe('₹0.00')
  })

  it('formats a small integer', () => {
    const result = formatCurrency(500)
    expect(result).toMatch(/^₹/)
    expect(result).toContain('500')
  })

  it('formats a large value with Indian grouping (lakhs)', () => {
    const result = formatCurrency(150000)
    expect(result).toMatch(/^₹/)
    // en-IN uses 1,50,000 grouping
    expect(result).toContain('50,000')
  })

  it('formats decimal values to 2dp', () => {
    const result = formatCurrency(1234.5)
    expect(result).toMatch(/\.50$/)
  })

  it('formats a string number', () => {
    const result = formatCurrency('9999.99')
    expect(result).toMatch(/^₹/)
    expect(result).toContain('9,999.99')
  })

  it('always starts with ₹ symbol, never $', () => {
    expect(formatCurrency(100)).not.toContain('$')
    expect(formatCurrency(0)).not.toContain('$')
    expect(formatCurrency(null)).not.toContain('$')
  })
})
