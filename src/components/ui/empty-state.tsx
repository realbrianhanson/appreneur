import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Rocket, 
  FolderOpen, 
  Users, 
  AlertCircle, 
  RefreshCw,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";

interface EmptyStateProps {
  variant: "no-progress" | "no-resources" | "no-community" | "error" | "custom";
  title?: string;
  description?: string;
  icon?: ReactNode;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  isRetrying?: boolean;
}

const emptyStateConfig = {
  "no-progress": {
    icon: <Rocket className="w-12 h-12 text-primary" />,
    title: "Start Your First Mission!",
    description: "You haven't started the challenge yet. Jump into Day 1 and build something amazing!",
    actionLabel: "Begin Day 1",
    actionHref: "/dashboard/day/1",
  },
  "no-resources": {
    icon: <FolderOpen className="w-12 h-12 text-muted-foreground" />,
    title: "Resources Coming Soon",
    description: "Your resources will appear here as you progress through the challenge.",
    actionLabel: "Continue Mission",
    actionHref: "/dashboard",
  },
  "no-community": {
    icon: <Users className="w-12 h-12 text-muted-foreground" />,
    title: "No Posts Yet",
    description: "Be the first to share your progress with the community!",
    actionLabel: "Share Your Progress",
    actionHref: undefined,
  },
  error: {
    icon: <AlertCircle className="w-12 h-12 text-destructive" />,
    title: "Something Went Wrong",
    description: "We couldn't load this content. Please try again.",
    actionLabel: "Try Again",
    actionHref: undefined,
  },
  custom: {
    icon: null,
    title: "",
    description: "",
    actionLabel: "",
    actionHref: undefined,
  },
};

export const EmptyState = ({
  variant,
  title,
  description,
  icon,
  actionLabel,
  actionHref,
  onAction,
  isRetrying = false,
}: EmptyStateProps) => {
  const config = emptyStateConfig[variant];
  
  const displayIcon = icon || config.icon;
  const displayTitle = title || config.title;
  const displayDescription = description || config.description;
  const displayActionLabel = actionLabel || config.actionLabel;
  const displayActionHref = actionHref || config.actionHref;

  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center text-center py-12 px-6">
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
          {displayIcon}
        </div>
        
        <h3 className="text-lg font-display font-bold text-foreground mb-2">
          {displayTitle}
        </h3>
        
        <p className="text-sm text-muted-foreground max-w-sm mb-6">
          {displayDescription}
        </p>
        
        {(displayActionLabel && (displayActionHref || onAction)) && (
          displayActionHref && !onAction ? (
            <Button variant="default" asChild>
              <Link to={displayActionHref}>
                {displayActionLabel}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          ) : (
            <Button 
              variant={variant === "error" ? "outline" : "default"} 
              onClick={onAction}
              disabled={isRetrying}
            >
              {isRetrying ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Retrying...
                </>
              ) : (
                <>
                  {variant === "error" && <RefreshCw className="w-4 h-4 mr-2" />}
                  {displayActionLabel}
                </>
              )}
            </Button>
          )
        )}
      </CardContent>
    </Card>
  );
};

export const InlineError = ({
  message,
  onRetry,
  isRetrying = false,
}: {
  message: string;
  onRetry?: () => void;
  isRetrying?: boolean;
}) => {
  return (
    <div className="flex items-center justify-between p-4 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive">
      <div className="flex items-center gap-3">
        <AlertCircle className="w-5 h-5 shrink-0" />
        <p className="text-sm font-medium">{message}</p>
      </div>
      {onRetry && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onRetry}
          disabled={isRetrying}
          className="text-destructive hover:text-destructive hover:bg-destructive/20"
        >
          {isRetrying ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
        </Button>
      )}
    </div>
  );
};