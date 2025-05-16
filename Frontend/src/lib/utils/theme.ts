import { themes, ThemeName } from "@/lib/constants/colors";

export function applyTheme(theme: ThemeName) {
  const root = document.documentElement;
  const t = themes[theme];

  // Set primary colors
  root.style.setProperty("--primary", t.primary);
  root.style.setProperty("--background", t.background);
  root.style.setProperty("--foreground", t.foreground);
  root.style.setProperty("--muted", t.muted);
  
  // Set derived colors based on primary colors
  const primaryRGB = hexToRGB(t.primary);
  if (primaryRGB) {
    // Set rgb versions for opacity adjustments
    root.style.setProperty("--primary-rgb", primaryRGB);
    root.style.setProperty("--primary-light", `rgba(${primaryRGB}, 0.1)`);
    root.style.setProperty("--primary-medium", `rgba(${primaryRGB}, 0.3)`);
    root.style.setProperty("--primary-shadow", `rgba(${primaryRGB}, 0.2)`);
  }
  
  // Theme-specific enhancements
  switch(theme) {
    case 'neonPulse':
      root.style.setProperty("--theme-shadow", "0 0 15px rgba(14, 240, 255, 0.5)");
      root.style.setProperty("--theme-accent", "rgba(14, 240, 255, 0.2)");
      root.style.setProperty("--theme-gradient-1", "rgba(14, 240, 255, 0.03)");
      root.style.setProperty("--theme-gradient-2", "rgba(14, 240, 255, 0.02)");
      root.style.setProperty("--theme-gradient-3", "rgba(14, 240, 255, 0.03)");
      root.style.setProperty("--theme-gradient-4", "rgba(14, 240, 255, 0.01)");
      break;
    case 'sundownSerenity':
      root.style.setProperty("--theme-shadow", "0 5px 15px rgba(255, 162, 123, 0.2)");
      root.style.setProperty("--theme-accent", "rgba(255, 162, 123, 0.1)");
      root.style.setProperty("--theme-gradient-1", "rgba(255, 162, 123, 0.03)");
      root.style.setProperty("--theme-gradient-2", "rgba(255, 162, 123, 0.02)");
      root.style.setProperty("--theme-gradient-3", "rgba(255, 162, 123, 0.03)");
      root.style.setProperty("--theme-gradient-4", "rgba(255, 162, 123, 0.01)");
      break;
    case 'midnightSlate':
      root.style.setProperty("--theme-shadow", "0 4px 12px rgba(107, 124, 255, 0.2)");
      root.style.setProperty("--theme-accent", "rgba(107, 124, 255, 0.1)");
      root.style.setProperty("--theme-gradient-1", "rgba(107, 124, 255, 0.03)");
      root.style.setProperty("--theme-gradient-2", "rgba(107, 124, 255, 0.02)");
      root.style.setProperty("--theme-gradient-3", "rgba(107, 124, 255, 0.03)");
      root.style.setProperty("--theme-gradient-4", "rgba(107, 124, 255, 0.01)");
      break;
    case 'lushForest':
      root.style.setProperty("--theme-shadow", "0 5px 15px rgba(62, 184, 117, 0.15)");
      root.style.setProperty("--theme-accent", "rgba(62, 184, 117, 0.1)");
      root.style.setProperty("--theme-gradient-1", "rgba(62, 184, 117, 0.03)");
      root.style.setProperty("--theme-gradient-2", "rgba(62, 184, 117, 0.02)");
      root.style.setProperty("--theme-gradient-3", "rgba(62, 184, 117, 0.03)");
      root.style.setProperty("--theme-gradient-4", "rgba(62, 184, 117, 0.01)");
      break;
    case 'technoAurora':
      root.style.setProperty("--theme-shadow", "0 0 20px rgba(77, 77, 255, 0.3)");
      root.style.setProperty("--theme-accent", "rgba(77, 77, 255, 0.15)");
      root.style.setProperty("--theme-gradient-1", "rgba(77, 77, 255, 0.03)");
      root.style.setProperty("--theme-gradient-2", "rgba(77, 77, 255, 0.02)");
      root.style.setProperty("--theme-gradient-3", "rgba(77, 77, 255, 0.03)");
      root.style.setProperty("--theme-gradient-4", "rgba(77, 77, 255, 0.01)");
      break;
    default:
      // Default blue theme styles
      root.style.setProperty("--theme-shadow", "0 4px 12px rgba(59, 130, 246, 0.15)");
      root.style.setProperty("--theme-accent", "rgba(59, 130, 246, 0.1)");
      root.style.setProperty("--theme-gradient-1", "rgba(59, 130, 246, 0.03)");
      root.style.setProperty("--theme-gradient-2", "rgba(59, 130, 246, 0.02)");
      root.style.setProperty("--theme-gradient-3", "rgba(59, 130, 246, 0.03)");
      root.style.setProperty("--theme-gradient-4", "rgba(59, 130, 246, 0.01)");
  }
  
  // Set a data attribute for CSS selectors
  root.dataset.theme = theme;
  
  // Set color scheme based on theme background luminance
  const isDark = calculateLuminance(t.background) < 0.5;
  document.documentElement.classList.toggle('dark', isDark);
}

// Helper function to convert hex to RGB
function hexToRGB(hex: string): string | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? 
    `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` 
    : null;
}

// Helper function to calculate luminance (for determining dark/light mode)
function calculateLuminance(hexColor: string): number {
  const rgb = hexToRGB(hexColor);
  if (!rgb) return 0.5;
  
  const [r, g, b] = rgb.split(',').map(x => {
    const n = parseInt(x.trim()) / 255;
    return n <= 0.03928 ? n / 12.92 : Math.pow((n + 0.055) / 1.055, 2.4);
  });
  
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}