import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock localStorage
const localStorageMock = (() => {
  let store = {}
  return {
    getItem:  (k)      => store[k] ?? null,
    setItem:  (k, v)   => { store[k] = String(v) },
    removeItem: (k)    => { delete store[k] },
    clear:    ()       => { store = {} },
  }
})()
Object.defineProperty(window, 'localStorage', { value: localStorageMock })

// Mock matchMedia (used by ThemeContext)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Silence react-hot-toast in tests
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error:   vi.fn(),
    loading: vi.fn(),
  },
  toast: {
    success: vi.fn(),
    error:   vi.fn(),
  },
  Toaster: () => null,
}))

// Suppress chart.js canvas errors in jsdom
vi.mock('react-chartjs-2', () => ({
  Doughnut: () => null,
  Bar:      () => null,
  Line:     () => null,
}))
