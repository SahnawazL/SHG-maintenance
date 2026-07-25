import { Sun, Moon } from "lucide-react";

export default function ThemeToggle({ theme, onToggle }) {
  const isDark = theme === "dark";
  return (
    <button
      type="button"
      onClick={onToggle}
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="relative inline-flex h-9 w-[68px] shrink-0 items-center rounded-full border border-stone-300 bg-stone-200 px-1 transition-colors duration-200 dark:border-neutral-800 dark:bg-black"
    >
      <span
        className={`flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-sm transition-transform duration-200 ease-out dark:bg-neutral-900 ${
          isDark ? "translate-x-[32px]" : "translate-x-0"
        }`}
      >
        {isDark ? (
          <Moon className="h-4 w-4 text-emerald-400" strokeWidth={2} />
        ) : (
          <Sun className="h-4 w-4 text-amber-500" strokeWidth={2} />
        )}
      </span>
    </button>
  );
}
