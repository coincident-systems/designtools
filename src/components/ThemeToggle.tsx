import { useTheme } from "@/contexts/theme-context";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Moon, Sun, Monitor } from "lucide-react";

const themeIcons = {
  light: Sun,
  dark: Moon,
  system: Monitor,
} as const;

const themeLabels = {
  light: "Light mode",
  dark: "Dark mode",
  system: "System preference",
} as const;

const nextTheme = {
  light: "dark",
  dark: "system",
  system: "light",
} as const;

interface ThemeToggleProps {
  /** Show label text next to icon */
  showLabel?: boolean;
  /** Size variant */
  size?: "sm" | "default" | "lg";
  /** Additional class names */
  className?: string;
}

export function ThemeToggle({
  showLabel = false,
  size = "default",
  className = "",
}: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();

  const Icon = themeIcons[theme];
  const label = themeLabels[theme];
  const next = nextTheme[theme];

  const handleClick = () => {
    setTheme(next);
  };

  const iconSize = size === "sm" ? "h-4 w-4" : size === "lg" ? "h-6 w-6" : "h-5 w-5";

  if (showLabel) {
    return (
      <Button
        variant="ghost"
        size={size}
        onClick={handleClick}
        className={className}
        aria-label={`Current theme: ${label}. Click to switch to ${themeLabels[next]}`}
      >
        <Icon className={iconSize} aria-hidden="true" />
        <span className="ml-2">{label}</span>
      </Button>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClick}
            className={className}
            aria-label={`Current theme: ${label}. Click to switch to ${themeLabels[next]}`}
            data-testid="theme-toggle"
          >
            <Icon className={iconSize} aria-hidden="true" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
