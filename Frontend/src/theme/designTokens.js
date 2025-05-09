/**
 * Design Tokens
 * Core design variables that define our visual language
 */

export const colors = {
    // Base neutrals
    neutral: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
      950: '#0d1117'
    },
    
    // Brand colors
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a'
    },
    
    // Semantic colors
    success: {
      50: '#ecfdf5',
      500: '#10b981',
      700: '#047857'
    },
    warning: {
      50: '#fffbeb',
      500: '#f59e0b',
      700: '#b45309'
    },
    error: {
      50: '#fef2f2',
      500: '#ef4444',
      700: '#b91c1c'
    },
    info: {
      50: '#f0f9ff',
      500: '#0ea5e9',
      700: '#0369a1'
    }
  };
  
  export const typography = {
    fontFamily: {
      // Using system fonts to match platform
      base: 'SF Pro Text, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      display: 'SF Pro Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      mono: 'SF Mono, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace'
    },
    fontWeight: {
      light: 300,
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    },
    fontSize: {
      xs: '0.75rem',      // 12px
      sm: '0.875rem',     // 14px
      base: '1rem',       // 16px
      lg: '1.125rem',     // 18px
      xl: '1.25rem',      // 20px
      '2xl': '1.5rem',    // 24px
      '3xl': '1.875rem',  // 30px
      '4xl': '2.25rem',   // 36px
      '5xl': '3rem',      // 48px
    },
    lineHeight: {
      none: 1,
      tight: 1.25,
      snug: 1.375,
      normal: 1.5,
      relaxed: 1.625,
      loose: 2
    },
    letterSpacing: {
      tighter: '-0.05em',
      tight: '-0.025em',
      normal: '0em',
      wide: '0.025em',
      wider: '0.05em',
      widest: '0.1em'
    }
  };
  
  export const spacing = {
    0: '0px',
    0.5: '0.125rem', // 2px
    1: '0.25rem',    // 4px
    1.5: '0.375rem', // 6px
    2: '0.5rem',     // 8px
    2.5: '0.625rem', // 10px
    3: '0.75rem',    // 12px
    3.5: '0.875rem', // 14px
    4: '1rem',       // 16px
    5: '1.25rem',    // 20px
    6: '1.5rem',     // 24px
    7: '1.75rem',    // 28px
    8: '2rem',       // 32px
    9: '2.25rem',    // 36px
    10: '2.5rem',    // 40px
    11: '2.75rem',   // 44px
    12: '3rem',      // 48px
    14: '3.5rem',    // 56px
    16: '4rem',      // 64px
    20: '5rem',      // 80px
    24: '6rem',      // 96px
    28: '7rem',      // 112px
    32: '8rem',      // 128px
    36: '9rem',      // 144px
    40: '10rem',     // 160px
    44: '11rem',     // 176px
    48: '12rem',     // 192px
    52: '13rem',     // 208px
    56: '14rem',     // 224px
    60: '15rem',     // 240px
    64: '16rem',     // 256px
    72: '18rem',     // 288px
    80: '20rem',     // 320px
    96: '24rem',     // 384px
  };
  
  export const breakpoints = {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  };
  
  export const borderRadius = {
    none: '0',
    sm: '0.125rem',    // 2px
    base: '0.25rem',   // 4px
    md: '0.375rem',    // 6px
    lg: '0.5rem',      // 8px
    xl: '0.75rem',     // 12px
    '2xl': '1rem',     // 16px
    '3xl': '1.5rem',   // 24px
    full: '9999px',
  };
  
  export const shadows = {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    none: 'none'
  };
  
  export const transitions = {
    duration: {
      75: '75ms',
      100: '100ms',
      150: '150ms',
      200: '200ms',
      300: '300ms',
      500: '500ms',
      700: '700ms',
      1000: '1000ms',
    },
    easing: {
      // Professional cubic bezier functions
      default: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)', // Soft ease-in-out
      emphasize: 'cubic-bezier(0.19, 1.0, 0.22, 1.0)', // Dramatic ease-out
      standard: 'cubic-bezier(0.4, 0.0, 0.2, 1.0)',    // Material standard
      decelerate: 'cubic-bezier(0.0, 0.0, 0.2, 1.0)',  // Material deceleration
      accelerate: 'cubic-bezier(0.4, 0.0, 1.0, 1.0)',  // Material acceleration
      spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)' // Spring effect
    }
  };
  
  export const blur = {
    none: '0',
    sm: '4px',
    base: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    '2xl': '40px',
    '3xl': '64px',
  };
  
  // Export everything as a default export
  export default {
    colors,
    typography,
    spacing,
    breakpoints,
    borderRadius,
    shadows,
    transitions,
    blur
  };