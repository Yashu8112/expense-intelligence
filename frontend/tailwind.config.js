/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html','./src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans:    ['DM Sans','system-ui','sans-serif'],
        display: ['Syne','sans-serif'],
        mono:    ['JetBrains Mono','monospace'],
      },
      colors: {
        brand: {
          50:'#eff6ff',100:'#dbeafe',200:'#bfdbfe',300:'#93c5fd',
          400:'#60a5fa',500:'#3b82f6',600:'#2563eb',700:'#1d4ed8',
          800:'#1e40af',900:'#1e3a8a',950:'#172554',
        },
        surface: {
          0:'#ffffff',50:'#f8fafc',100:'#f1f5f9',200:'#e2e8f0',
          300:'#cbd5e1',400:'#94a3b8',500:'#64748b',600:'#475569',
          700:'#334155',800:'#1e293b',900:'#0f172a',950:'#020617',
        },
        success:{ 50:'#f0fdf4',500:'#22c55e',700:'#15803d' },
        warning:{ 50:'#fffbeb',500:'#f59e0b',700:'#b45309' },
        danger: { 50:'#fff1f2',200:'#fecdd3',400:'#fb7185',500:'#ef4444',700:'#b91c1c' },
      },
      boxShadow: {
        card:    '0 1px 3px 0 rgb(0 0 0/0.08),0 1px 2px -1px rgb(0 0 0/0.04)',
        'card-md':'0 4px 6px -1px rgb(0 0 0/0.08),0 2px 4px -2px rgb(0 0 0/0.04)',
        'card-lg':'0 10px 15px -3px rgb(0 0 0/0.08),0 4px 6px -4px rgb(0 0 0/0.04)',
      },
      backgroundImage: {
        'grid-pattern':"url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23e2e8f0' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [],
}
