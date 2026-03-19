import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider, useTheme } from '../context/ThemeContext'

// Small consumer component to expose theme state
function ThemeConsumer() {
  const { dark, toggle } = useTheme()
  return (
    <div>
      <span data-testid="mode">{dark ? 'dark' : 'light'}</span>
      <button onClick={toggle} data-testid="toggle">Toggle</button>
    </div>
  )
}

function renderTheme(initialTheme) {
  if (initialTheme) localStorage.setItem('theme', initialTheme)
  return render(
    <ThemeProvider>
      <ThemeConsumer />
    </ThemeProvider>
  )
}

describe('ThemeContext', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.classList.remove('dark')
  })

  it('defaults to light mode when nothing is stored', () => {
    renderTheme()
    expect(screen.getByTestId('mode').textContent).toBe('light')
  })

  it('restores dark mode from localStorage', () => {
    renderTheme('dark')
    expect(screen.getByTestId('mode').textContent).toBe('dark')
  })

  it('restores light mode from localStorage', () => {
    renderTheme('light')
    expect(screen.getByTestId('mode').textContent).toBe('light')
  })

  it('adds .dark class to <html> when dark mode is on', () => {
    renderTheme('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('removes .dark class from <html> when light mode is on', () => {
    renderTheme('light')
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('toggles from light to dark on button click', async () => {
    const user = userEvent.setup()
    renderTheme('light')
    expect(screen.getByTestId('mode').textContent).toBe('light')
    await user.click(screen.getByTestId('toggle'))
    expect(screen.getByTestId('mode').textContent).toBe('dark')
  })

  it('toggles from dark to light on button click', async () => {
    const user = userEvent.setup()
    renderTheme('dark')
    expect(screen.getByTestId('mode').textContent).toBe('dark')
    await user.click(screen.getByTestId('toggle'))
    expect(screen.getByTestId('mode').textContent).toBe('light')
  })

  it('persists theme choice to localStorage after toggle', async () => {
    const user = userEvent.setup()
    renderTheme('light')
    await user.click(screen.getByTestId('toggle'))
    expect(localStorage.getItem('theme')).toBe('dark')
  })

  it('throws when useTheme is used outside ThemeProvider', () => {
    // Silence the expected console.error from React
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<ThemeConsumer />)).toThrow()
    spy.mockRestore()
  })
})
