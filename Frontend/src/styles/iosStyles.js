/**
 * iOS/Dynamic Island Inspired UI Styles
 *
 * This file contains style definitions for UI components
 * to maintain a consistent iOS-like appearance throughout the app.
 */

// Colors
export const colors = {
    // Primary colors
    primary: {
      light: '#007AFF', // iOS blue
      dark: '#0A84FF'   // iOS blue (dark mode)
    },
    
    // Grayscale for backgrounds and text
    gray: {
      50: '#F9FAFB',
      100: '#F3F4F6',
      200: '#E5E7EB',
      300: '#D1D5DB',
      400: '#9CA3AF',
      500: '#6B7280',
      600: '#4B5563',
      700: '#374151',
      800: '#1F2937',
      900: '#111827',
      950: '#0D1117'
    },
    
    // Status/severity colors
    red: {
      light: '#FF3B30', // iOS red
      dark: '#FF453A'   // iOS red (dark mode)
    },
    green: {
      light: '#34C759', // iOS green
      dark: '#30D158'   // iOS green (dark mode)
    },
    yellow: {
      light: '#FFCC00', // iOS yellow
      dark: '#FFD60A'   // iOS yellow (dark mode)
    },
    orange: {
      light: '#FF9500', // iOS orange
      dark: '#FF9F0A'   // iOS orange (dark mode)
    },
    purple: {
      light: '#AF52DE', // iOS purple
      dark: '#BF5AF2'   // iOS purple (dark mode)
    },
    indigo: {
      light: '#5856D6', // iOS indigo
      dark: '#5E5CE6'   // iOS indigo (dark mode)
    },
    teal: {
      light: '#5AC8FA', // iOS teal
      dark: '#64D2FF'   // iOS teal (dark mode)
    }
  };
  
  // Spacing scale (multiples of 4)
  export const spacing = {
    0: '0px',
    1: '4px',
    2: '8px',
    3: '12px',
    4: '16px',
    5: '20px',
    6: '24px',
    8: '32px',
    10: '40px',
    12: '48px',
    16: '64px',
    20: '80px',
    24: '96px',
  };
  
  // Typography
  export const typography = {
    fontFamily: {
      sans: [
        'SF Pro Display', 
        'SF Pro Text', 
        '-apple-system', 
        'BlinkMacSystemFont', 
        'Segoe UI', 
        'Roboto', 
        'Helvetica Neue', 
        'Arial', 
        'sans-serif'
      ].join(','),
      mono: [
        'SF Mono', 
        'SFMono-Regular', 
        'Menlo', 
        'Monaco', 
        'Consolas', 
        'Liberation Mono', 
        'Courier New', 
        'monospace'
      ].join(',')
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
    }
  };
  
  // Border radius
  export const borderRadius = {
    none: '0px',
    sm: '0.125rem',    // 2px
    DEFAULT: '0.25rem', // 4px
    md: '0.375rem',    // 6px
    lg: '0.5rem',      // 8px
    xl: '0.75rem',     // 12px
    '2xl': '1rem',     // 16px
    '3xl': '1.5rem',   // 24px
    full: '9999px'     // circular
  };
  
  // Shadows (iOS-like with slight blur)
  export const shadows = {
    sm: '0px 1px 2px rgba(0, 0, 0, 0.05)',
    DEFAULT: '0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px rgba(0, 0, 0, 0.06)',
    md: '0px 4px 6px -1px rgba(0, 0, 0, 0.1), 0px 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0px 10px 15px -3px rgba(0, 0, 0, 0.1), 0px 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0px 20px 25px -5px rgba(0, 0, 0, 0.1), 0px 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0px 25px 50px -12px rgba(0, 0, 0, 0.25)'
  };
  
  // Transitions
  export const transitions = {
    DEFAULT: '150ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    fast: '100ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    slow: '300ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    spring: '300ms cubic-bezier(0.175, 0.885, 0.32, 1.275)'
  };
  
  // Semantic naming for component states
  export const components = {
    // Button styles
    button: {
      primary: {
        bg: colors.primary.light,
        hoverBg: '#0071EB', // Slightly darker
        activeBg: '#0068D6', // Even darker
        text: '#FFFFFF'
      },
      secondary: {
        bg: '#F3F4F6', // Light gray
        hoverBg: '#E5E7EB',
        activeBg: '#D1D5DB',
        text: colors.gray[900]
      },
      success: {
        bg: colors.green.light,
        hoverBg: '#2EB251', // Slightly darker
        activeBg: '#27A049', // Even darker
        text: '#FFFFFF'
      },
      danger: {
        bg: colors.red.light,
        hoverBg: '#E5352B', // Slightly darker
        activeBg: '#CC2F27', // Even darker
        text: '#FFFFFF'
      },
      warning: {
        bg: colors.yellow.light,
        hoverBg: '#E6B800',
        activeBg: '#CCA300',
        text: '#1F2937' // Dark text for contrast
      }
    },
    
    // Card styles (for Dynamic Island inspired components)
    card: {
      standard: {
        bg: 'rgba(255, 255, 255, 0.9)', // Slight transparency
        darkBg: 'rgba(31, 41, 55, 0.9)',
        backdropFilter: 'blur(20px)', // iOS blur effect
        border: '1px solid rgba(229, 231, 235, 0.2)',
        darkBorder: '1px solid rgba(55, 65, 81, 0.3)',
        shadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
        borderRadius: '16px'
      },
      island: {
        bg: 'rgba(0, 0, 0, 0.9)', // Dynamic Island style
        lightBg: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(40px)',
        border: 'none',
        shadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
        borderRadius: '30px'
      }
    },
    
    // Input styles
    input: {
      bg: '#FFFFFF',
      darkBg: colors.gray[800],
      border: '1px solid ' + colors.gray[300],
      darkBorder: '1px solid ' + colors.gray[600],
      focusBorder: '1px solid ' + colors.primary.light,
      darkFocusBorder: '1px solid ' + colors.primary.dark,
      borderRadius: '10px',
      shadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.05)',
      darkShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.2)',
      padding: '0.75rem',
      fontSize: typography.fontSize.base
    },
    
    // Tab styles
    tab: {
      active: {
        bg: colors.primary.light, 
        darkBg: colors.primary.dark,
        text: '#FFFFFF',
        borderRadius: '8px'
      },
      inactive: {
        bg: 'transparent',
        text: colors.gray[600],
        darkText: colors.gray[400],
        hoverBg: colors.gray[100],
        darkHoverBg: colors.gray[700]
      },
      group: {
        bg: colors.gray[100],
        darkBg: colors.gray[800],
        borderRadius: '12px',
        padding: '4px'
      }
    },
    
    // Toggle styles (iOS-like)
    toggle: {
      active: {
        bg: colors.green.light,
        darkBg: colors.green.dark
      },
      inactive: {
        bg: colors.gray[300],
        darkBg: colors.gray[600]
      },
      width: '51px',
      height: '31px',
      knobSize: '27px',
      knobColor: '#FFFFFF',
      borderRadius: '31px'
    },
    
    // Dropdown styles
    dropdown: {
      bg: '#FFFFFF',
      darkBg: colors.gray[800],
      border: '1px solid ' + colors.gray[200],
      darkBorder: '1px solid ' + colors.gray[700],
      shadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      darkShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
      borderRadius: '12px',
      itemHoverBg: colors.gray[100],
      darkItemHoverBg: colors.gray[700]
    }
  };
  
  // Status styles 
  export const statusStyles = {
    notStarted: {
      bg: colors.gray[100],
      darkBg: 'rgba(107, 114, 128, 0.2)',
      text: colors.gray[700],
      darkText: colors.gray[300],
      icon: 'circle'
    },
    inProgress: {
      bg: 'rgba(37, 99, 235, 0.1)',
      darkBg: 'rgba(37, 99, 235, 0.2)',
      text: colors.primary.light,
      darkText: colors.primary.dark,
      icon: 'play-circle'
    },
    completed: {
      bg: 'rgba(52, 199, 89, 0.1)',
      darkBg: 'rgba(52, 199, 89, 0.2)',
      text: colors.green.light,
      darkText: colors.green.dark,
      icon: 'check-circle'
    },
    delayed: {
      bg: 'rgba(255, 149, 0, 0.1)',
      darkBg: 'rgba(255, 149, 0, 0.2)',
      text: colors.orange.light,
      darkText: colors.orange.dark,
      icon: 'alert-triangle'
    },
    blocked: {
      bg: 'rgba(255, 59, 48, 0.1)',
      darkBg: 'rgba(255, 59, 48, 0.2)',
      text: colors.red.light,
      darkText: colors.red.dark,
      icon: 'x-circle'
    }
  };
  
  // Priority styles
  export const priorityStyles = {
    low: {
      bg: 'rgba(52, 199, 89, 0.1)',
      darkBg: 'rgba(52, 199, 89, 0.2)',
      text: colors.green.light,
      darkText: colors.green.dark,
      indicator: colors.green.light
    },
    medium: {
      bg: 'rgba(255, 204, 0, 0.1)',
      darkBg: 'rgba(255, 204, 0, 0.2)',
      text: '#B0851F', // Darker yellow for readability
      darkText: colors.yellow.dark,
      indicator: colors.yellow.light
    },
    high: {
      bg: 'rgba(255, 59, 48, 0.1)',
      darkBg: 'rgba(255, 59, 48, 0.2)',
      text: colors.red.light,
      darkText: colors.red.dark,
      indicator: colors.red.light
    }
  };
  
  // Dynamic Island specific animations
  export const animations = {
    expand: `
      @keyframes expand {
        0% { transform: scale(0.95); opacity: 0; }
        100% { transform: scale(1); opacity: 1; }
      }
    `,
    collapse: `
      @keyframes collapse {
        0% { transform: scale(1); opacity: 1; }
        100% { transform: scale(0.95); opacity: 0; }
      }
    `,
    pulse: `
      @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
      }
    `,
    fadeIn: `
      @keyframes fadeIn {
        0% { opacity: 0; }
        100% { opacity: 1; }
      }
    `,
    slideIn: `
      @keyframes slideIn {
        0% { transform: translateY(-10px); opacity: 0; }
        100% { transform: translateY(0); opacity: 1; }
      }
    `,
    bounceIn: `
      @keyframes bounceIn {
        0% { transform: scale(0.8); opacity: 0; }
        60% { transform: scale(1.05); opacity: 1; }
        100% { transform: scale(1); opacity: 1; }
      }
    `
  };
  
  // Common mixins
  export const mixins = {
    // iOS-like button
    iosButton: `
      font-weight: ${typography.fontWeight.medium};
      padding: 12px 16px;
      border-radius: 10px;
      transition: background-color 0.2s;
      outline: none;
      text-align: center;
    `,
    
    // Dynamic Island style card
    dynamicIslandCard: `
      background: rgba(0, 0, 0, 0.9);
      border-radius: 30px;
      padding: 16px;
      backdrop-filter: blur(40px);
      -webkit-backdrop-filter: blur(40px);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
      animation: expand 0.3s cubic-bezier(0.2, 0, 0, 1);
    `,
    
    // Floating glass-like card
    glassCard: `
      background: rgba(255, 255, 255, 0.8);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border-radius: 20px;
      border: 1px solid rgba(255, 255, 255, 0.18);
      box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.1);
    `,
    
    // iOS-like segmented control
    segmentedControl: `
      background: ${colors.gray[100]};
      border-radius: 10px;
      padding: 2px;
      display: flex;
      position: relative;
    `,
    
    // iOS-like focus state
    focusRing: `
      outline: none;
      box-shadow: 0 0 0 4px rgba(0, 122, 255, 0.3);
    `
  };
  
  export default {
    colors,
    spacing,
    typography,
    borderRadius,
    shadows,
    transitions,
    components,
    statusStyles,
    priorityStyles,
    animations,
    mixins
  };