
import { themes, ThemeName } from "@/lib/constants/colors";

export function applyTheme(theme: ThemeName) {
  const root = document.documentElement;
  const t = themes[theme];

  root.style.setProperty("--primary", t.primary);
  root.style.setProperty("--background", t.background);
  root.style.setProperty("--foreground", t.foreground);
  root.style.setProperty("--muted", t.muted);
  
  switch(theme) {
    case 'neonPulse':
      // Add subtle glow to buttons and links
      root.style.setProperty("--theme-shadow", "0 0 15px rgba(14, 240, 255, 0.5)");
      root.style.setProperty("--theme-accent", "rgba(14, 240, 255, 0.2)");
      break;
    case 'sundownSerenity':
      // Warm, soothing styles
      root.style.setProperty("--theme-shadow", "0 5px 15px rgba(255, 162, 123, 0.2)");
      root.style.setProperty("--theme-accent", "rgba(255, 162, 123, 0.1)");
      break;
    case 'midnightSlate':
      // Professional, sleek styles
      root.style.setProperty("--theme-shadow", "0 4px 12px rgba(107, 124, 255, 0.2)");
      root.style.setProperty("--theme-accent", "rgba(107, 124, 255, 0.1)");
      break;
    case 'lushForest':
      // Natural, earthy styles
      root.style.setProperty("--theme-shadow", "0 5px 15px rgba(62, 184, 117, 0.15)");
      root.style.setProperty("--theme-accent", "rgba(62, 184, 117, 0.1)");
      break;
    case 'technoAurora':
      // Space-inspired, cosmic styles
      root.style.setProperty("--theme-shadow", "0 0 20px rgba(77, 77, 255, 0.3)");
      root.style.setProperty("--theme-accent", "rgba(77, 77, 255, 0.15)");
      break;
    default:
      // Default theme styles
      root.style.setProperty("--theme-shadow", "0 4px 12px rgba(59, 130, 246, 0.15)");
      root.style.setProperty("--theme-accent", "rgba(59, 130, 246, 0.1)");
  }

  // Set a data attribute for CSS selectors
  root.dataset.theme = theme;
}