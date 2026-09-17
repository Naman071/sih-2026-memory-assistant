// Noklai Design System Theme Tokens
// Inspired by the Noklai Caregiver Journey & Northeast Cultural Heritage

export const noklaiTheme = {
  colors: {
    // Primary brand colors
    primary: '#5B409E',         // Royal purple for caregiver buttons & accents
    primaryLight: '#7A62B8',
    primaryDark: '#432C79',
    primarySoft: '#F0ECF9',

    // Patient & Nature accents
    patientGreen: '#237B4B',     // Organic forest green for patient UI
    patientGreenLight: '#E8F5EE',
    patientGreenDark: '#175433',

    // Backgrounds
    background: '#F8F9F5',       // Soft organic warm cream
    backgroundDark: '#14171E',   // Dark mode background
    cardBackground: '#FFFFFF',   // Pure white card
    cardBackgroundDark: '#1E232E',
    surfaceSubtle: '#F1F3EE',    // Slightly darker cream for input / pills
    surfaceSubtleDark: '#262D3B',

    // Borders
    border: '#E8EAE3',
    borderDark: '#2D3545',
    borderFocus: '#5B409E',

    // Typography
    textPrimary: '#1E242B',
    textPrimaryDark: '#F3F4F6',
    textSecondary: '#656F7D',
    textSecondaryDark: '#9CA3AF',
    textMuted: '#94A0B0',

    // Status & Badges
    activeGreen: '#16A34A',
    activeGreenSoft: '#DCFCE7',
    amber: '#D97706',
    amberSoft: '#FEF3C7',
    orange: '#EA580C',
    orangeSoft: '#FFEDD5',
    rose: '#E11D48',
    roseSoft: '#FFE4E6',
    blue: '#2563EB',
    blueSoft: '#EFF6FF',

    // Insight card special tints (from reference design)
    insightGreenBg: '#EAF7EE',
    insightGreenBorder: '#C2E8CC',
    insightGreenText: '#1B6B38',

    insightBlueBg: '#EDF5FD',
    insightBlueBorder: '#C8E1FA',
    insightBlueText: '#1E5894',

    insightRoseBg: '#FDF2F1',
    insightRoseBorder: '#F9D1CD',
    insightRoseText: '#9A2B24',

    // Tab bar
    tabBarBg: '#FFFFFF',
    tabBarBgDark: '#1A1E27',
    tabBarActive: '#5B409E',
    tabBarInactive: '#8A95A5',

    white: '#FFFFFF',
    black: '#000000',
  },

  typography: {
    fontFamily: undefined, // System font for high performance & universal compatibility
    sizes: {
      xs: 11,
      sm: 13,
      base: 15,
      md: 17,
      lg: 20,
      xl: 24,
      xxl: 30,
      hero: 36,
    },
    weights: {
      normal: '400',
      medium: '500',
      semiBold: '600',
      bold: '700',
      heavy: '800',
    },
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    base: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
  },

  radii: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 26,
    full: 9999,
  },

  shadows: {
    card: {
      shadowColor: '#1A202C',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 2,
    },
    button: {
      shadowColor: '#5B409E',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.22,
      shadowRadius: 8,
      elevation: 3,
    },
    floating: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.14,
      shadowRadius: 12,
      elevation: 6,
    },
  },

  quotes: [
    { text: 'Small steps make a big difference.', author: 'Noklai Care' },
    { text: 'Care is a journey we walk together.', author: 'Family Support' },
    { text: 'Culture connects. Care continues.', author: 'Noklai Wisdom' },
    { text: 'Every smile remembers love.', author: 'Memory Care' },
  ],
};

export default noklaiTheme;

