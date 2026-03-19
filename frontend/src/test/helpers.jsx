import { render } from '@testing-library/react'
import { BrowserRouter, MemoryRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '../context/AuthContext'
import { ThemeProvider } from '../context/ThemeContext'

/**
 * Render with all app providers + BrowserRouter.
 */
export function renderWithProviders(ui, { route = '/' } = {}) {
  window.history.pushState({}, '', route)
  return render(
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          {ui}
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}

/**
 * Render inside a MemoryRouter at a specific path, useful for page-level tests.
 */
export function renderAtRoute(ui, initialPath = '/') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <ThemeProvider>
        <AuthProvider>
          {ui}
        </AuthProvider>
      </ThemeProvider>
    </MemoryRouter>
  )
}
