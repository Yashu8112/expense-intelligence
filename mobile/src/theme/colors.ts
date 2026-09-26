// ─────────────────────────────────────────────────────────────────────────────
// Color Palette
// ─────────────────────────────────────────────────────────────────────────────

export const COLORS = {
  primary: '#2563EB',       // blue-600
  primaryLight: '#3B82F6',  // blue-500
  primaryDark: '#1D4ED8',   // blue-700
  secondary: '#7C3AED',     // violet-600
  secondaryLight: '#8B5CF6',// violet-500
  success: '#10B981',       // emerald-500
  successLight: '#34D399',  // emerald-400
  warning: '#F59E0B',       // amber-500
  warningLight: '#FCD34D',  // amber-300
  danger: '#EF4444',        // red-500
  dangerLight: '#F87171',   // red-400

  // Gradients
  gradientBlue: ['#2563EB', '#7C3AED'] as const,
  gradientGreen: ['#10B981', '#059669'] as const,
  gradientAmber: ['#F59E0B', '#D97706'] as const,

  // Light theme
  light: {
    background: '#F8FAFC',
    surface: '#FFFFFF',
    surfaceElevated: '#FFFFFF',
    border: '#E2E8F0',
    borderLight: '#F1F5F9',
    text: '#0F172A',
    textSecondary: '#64748B',
    textMuted: '#94A3B8',
    card: '#FFFFFF',
    tabBar: '#FFFFFF',
    header: '#FFFFFF',
    input: '#F8FAFC',
    inputBorder: '#CBD5E1',
    placeholder: '#94A3B8',
    shadow: 'rgba(0,0,0,0.08)',
    overlay: 'rgba(0,0,0,0.4)',
    shimmer: '#E2E8F0',
  },

  // Dark theme
  dark: {
    background: '#0B1120',
    surface: '#111827',
    surfaceElevated: '#1E293B',
    border: '#1E293B',
    borderLight: '#0F172A',
    text: '#F1F5F9',
    textSecondary: '#94A3B8',
    textMuted: '#475569',
    card: '#1E293B',
    tabBar: '#111827',
    header: '#111827',
    input: '#1E293B',
    inputBorder: '#334155',
    placeholder: '#475569',
    shadow: 'rgba(0,0,0,0.4)',
    overlay: 'rgba(0,0,0,0.7)',
    shimmer: '#1E293B',
  },
} as const;

// Same shape as the palettes above, but with widened string values so either
// palette can be assigned (the `as const` literals otherwise conflict).
export type ThemeColors = { [K in keyof typeof COLORS.light]: string };
