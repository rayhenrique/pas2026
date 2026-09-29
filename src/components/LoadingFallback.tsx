import { Loader2 } from "lucide-react";

interface LoadingFallbackProps {
    message?: string;
    fullScreen?: boolean;
}

export function LoadingFallback({
    message = "Carregando...",
    fullScreen = true
}: LoadingFallbackProps) {
    const containerClasses = fullScreen
        ? "min-h-screen bg-background flex items-center justify-center"
        : "flex items-center justify-center p-8";

    return (
        <div className={containerClasses}>
            <div className="flex flex-col items-center gap-4">
                <div className="relative">
                    <Loader2 className="w-12 h-12 text-primary animate-spin" />
                    <div className="absolute inset-0 w-12 h-12 rounded-full border-4 border-primary/20" />
                </div>
                <p className="text-muted-foreground text-sm animate-pulse">{message}</p>
            </div>
        </div>
    );
}

// Skeleton específico para páginas
export function PageSkeleton() {
    return (
        <div className="min-h-screen bg-background">
            {/* Header skeleton */}
            <div className="h-16 border-b border-border bg-card">
                <div className="container mx-auto px-4 h-full flex items-center">
                    <div className="h-8 w-32 bg-muted animate-pulse rounded" />
                    <div className="ml-auto flex gap-4">
                        <div className="h-8 w-24 bg-muted animate-pulse rounded" />
                        <div className="h-8 w-8 bg-muted animate-pulse rounded-full" />
                    </div>
                </div>
            </div>

            {/* Content skeleton */}
            <div className="container mx-auto px-4 py-8">
                <div className="space-y-6">
                    <div className="h-10 w-64 bg-muted animate-pulse rounded" />
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
                        ))}
                    </div>
                    <div className="h-64 bg-muted animate-pulse rounded-lg" />
                </div>
            </div>
        </div>
    );
}
