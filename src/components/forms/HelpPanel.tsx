import { useState, type ReactNode } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { HelpCircle, ChevronDown, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * HelpPanel - Collapsible contextual help section.
 *
 * Maps to the VB5 help forms (frmhlpTSDE, frmhlpLC, etc.). Provides
 * contextual help, formulas, and reference information for each module.
 * Designed to be placed at the bottom of a module page or inline.
 *
 * @example
 * ```tsx
 * <HelpPanel title="About Learning Curves">
 *   <p>The learning curve theory states that...</p>
 *   <HelpPanel.Formula>
 *     T_n = T_1 × n^b
 *   </HelpPanel.Formula>
 *   <HelpPanel.Reference>
 *     Niebel & Freivalds, Ch. 12
 *   </HelpPanel.Reference>
 * </HelpPanel>
 * ```
 */
export interface HelpPanelProps {
  /** Help section title */
  title: string;
  /** Help content */
  children: ReactNode;
  /** Start expanded */
  defaultOpen?: boolean;
  /** Custom class */
  className?: string;
}

export function HelpPanel({
  title,
  children,
  defaultOpen = false,
  className,
}: HelpPanelProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className={cn("border-border/40 bg-muted/30", className)}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors py-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <HelpCircle className="h-4 w-4" aria-hidden="true" />
                {title}
              </CardTitle>
              <ChevronDown
                className={cn(
                  "h-4 w-4 text-muted-foreground transition-transform duration-200",
                  isOpen && "rotate-180"
                )}
                aria-hidden="true"
              />
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0 text-sm text-muted-foreground leading-relaxed space-y-3">
            {children}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

/**
 * Formula display - monospace, centered, with optional label.
 */
function Formula({
  children,
  label,
}: {
  children: ReactNode;
  label?: string;
}) {
  return (
    <div className="my-3 rounded-md bg-background border border-border/60 p-3">
      {label && (
        <p className="text-xs font-medium text-muted-foreground mb-1">
          {label}
        </p>
      )}
      <p className="font-mono text-sm text-foreground text-center">{children}</p>
    </div>
  );
}

/**
 * Reference citation for textbook/standard references.
 */
function Reference({ children }: { children: ReactNode }) {
  return (
    <p className="flex items-start gap-2 text-xs text-muted-foreground/80 italic">
      <BookOpen className="h-3.5 w-3.5 mt-0.5 shrink-0" aria-hidden="true" />
      {children}
    </p>
  );
}

HelpPanel.Formula = Formula;
HelpPanel.Reference = Reference;
