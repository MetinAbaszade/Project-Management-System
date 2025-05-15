
"use client";
import { useTheme } from "@/hooks/useTheme";
import { themes } from "@/lib/constants/colors";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <select
      value={theme}
      onChange={(e) => setTheme(e.target.value as keyof typeof themes)}
      className="p-2 rounded-md border border-muted bg-background text-foreground"
    >
      {Object.keys(themes).map((name) => (
        <option key={name} value={name}>
          {name}
        </option>
      ))}
    </select>
  );
}
