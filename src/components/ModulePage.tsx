import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HelpCircle, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import type { ReactNode } from "react";

interface ModulePageProps {
  title: string;
  description?: string;
  vb5Form?: string;
  helpContent?: ReactNode;
  children?: ReactNode;
  backUrl?: string;
  backLabel?: string;
}

export function ModulePage({
  title,
  description,
  vb5Form,
  helpContent,
  children,
  backUrl,
  backLabel,
}: ModulePageProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          {backUrl && (
            <Link
              to={backUrl}
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-2"
            >
              <ArrowLeft className="h-4 w-4" />
              {backLabel || "Back"}
            </Link>
          )}
          <h1 className="text-2xl font-bold text-primary">{title}</h1>
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
          {vb5Form && (
            <p className="text-xs text-muted-foreground/60">
              Original: {vb5Form}
            </p>
          )}
        </div>
        {helpContent && (
          <Button variant="outline" size="sm" className="gap-2">
            <HelpCircle className="h-4 w-4" />
            Help
          </Button>
        )}
      </div>

      {/* Content */}
      {children ? (
        children
      ) : (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-lg text-muted-foreground">
              Module Not Yet Implemented
            </CardTitle>
            <CardDescription>
              This module is a placeholder. The calculation logic and UI will be
              added based on the original VB5 form: {vb5Form || "unknown"}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg bg-muted p-8 text-center">
              <p className="text-sm text-muted-foreground">
                Input fields and calculation results will appear here.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
