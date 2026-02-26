import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  variant?: "default" | "primary" | "success" | "warning" | "info";
}

const variantStyles = {
  default: {
    icon: "bg-muted text-muted-foreground",
    card: "",
  },
  primary: {
    icon: "bg-primary/10 text-primary",
    card: "border-l-4 border-l-primary",
  },
  success: {
    icon: "bg-success/10 text-success",
    card: "border-l-4 border-l-success",
  },
  warning: {
    icon: "bg-warning/10 text-warning",
    card: "border-l-4 border-l-warning",
  },
  info: {
    icon: "bg-info/10 text-info",
    card: "border-l-4 border-l-info",
  },
};

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendValue,
  variant = "default",
}: StatCardProps) {
  const styles = variantStyles[variant];

  return (
    <div className={cn("stat-card animate-fade-in", styles.card)}>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-foreground">{value}</p>
            {trend && trendValue && (
              <span
                className={cn(
                  "text-sm font-medium",
                  trend === "up" && "text-success",
                  trend === "down" && "text-destructive",
                  trend === "neutral" && "text-muted-foreground"
                )}
              >
                {trend === "up" && "↑"}
                {trend === "down" && "↓"}
                {trendValue}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
        <div className={cn("p-3 rounded-xl", styles.icon)}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
