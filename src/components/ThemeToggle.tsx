import { Moon, Sun } from "lucide-react"
import { Toggle } from "@/components/ui/toggle"
import { useTheme } from "@/components/ThemeProvider"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  // Determine current effective theme for icon display
  const effectiveTheme = theme === "system"
    ? window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light"
    : theme

  return (
    <Toggle
      aria-label="Toggle theme"
      pressed={effectiveTheme === "dark"}
      onPressedChange={() =>
        setTheme(effectiveTheme === "dark" ? "light" : "dark")
      }
    >
      {effectiveTheme === "dark" ? (
        <Sun className="h-[1rem] w-[1rem]" />
      ) : (
        <Moon className="h-[1rem] w-[1rem]" />
      )}
    </Toggle>
  )
}
