
import { useEffect, useState } from "react";
import { applyTheme } from "@/lib/utils/theme";
import { ThemeName } from "@/lib/constants/colors";

export function useTheme() {
  const [theme, setTheme] = useState<ThemeName>("blue");

  useEffect(() => {
    const saved = localStorage.getItem("theme") as ThemeName;
    if (saved) setTheme(saved);
    else setTheme("blue");
  }, []);

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  return { theme, setTheme };
}
