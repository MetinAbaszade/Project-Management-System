// src/lib/constants/colors.ts

export const themes = {
  blue: {
    name: "blue",
    primary: "#3B82F6",
    background: "#F9FAFB",
    foreground: "#111827",
    muted: "#E5E7EB",
  },
  dark: {
    name: "dark",
    primary: "#3B82F6",
    background: "#0F172A",
    foreground: "#F8FAFC",
    muted: "#1E293B",
  },
  green: {
    name: "green",
    primary: "#10B981",
    background: "#F0FDF4",
    foreground: "#052E16",
    muted: "#D1FAE5",
  },
  red: {
    name: "red",
    primary: "#EF4444",
    background: "#FEF2F2",
    foreground: "#7F1D1D",
    muted: "#FCA5A5",
  },
  rose: {
    name: "rose",
    primary: "#FB7185",
    background: "#FFF1F2",
    foreground: "#881337",
    muted: "#FBCFE8",
  },
  // New theme additions below
  neonPulse: {
    name: "neonPulse",
    primary: "#0EF0FF",
    background: "#0A0E1A",
    foreground: "#FFFFFF",
    muted: "#101428",
  },
  sundownSerenity: {
    name: "sundownSerenity",
    primary: "#FFA27B",
    background: "#FEF3E2",
    foreground: "#484340",
    muted: "#F5E1CE",
  },
  midnightSlate: {
    name: "midnightSlate",
    primary: "#6B7CFF",
    background: "#1F2937",
    foreground: "#F3F4F6",
    muted: "#2A3644",
  },
  lushForest: {
    name: "lushForest",
    primary: "#3EB875",
    background: "#F1F9F5",
    foreground: "#1B3A29",
    muted: "#DCE8E0",
  },
  technoAurora: {
    name: "technoAurora",
    primary: "#4D4DFF",
    background: "#080825",
    foreground: "#E2E8F0",
    muted: "#10104B",
  },
} as const;

export type ThemeName = keyof typeof themes;