import { cn } from "@eugenios/ui/lib/utils";
import { Loader2 } from "lucide-react";

// Tipos para diferentes variantes de loading
type LoadingSize = "sm" | "md" | "lg" | "xl";
type LoadingVariant = "spinner" | "dots" | "pulse" | "skeleton";

interface LoadingProps {
  size?: LoadingSize;
  variant?: LoadingVariant;
  text?: string;
  className?: string;
  fullScreen?: boolean;
  overlay?: boolean;
}

// Mapeamento de tamanhos
const sizeMap = {
  sm: {
    spinner: "h-4 w-4",
    container: "gap-2",
    text: "text-sm",
  },
  md: {
    spinner: "h-6 w-6",
    container: "gap-3",
    text: "text-base",
  },
  lg: {
    spinner: "h-8 w-8",
    container: "gap-4",
    text: "text-lg",
  },
  xl: {
    spinner: "h-12 w-12",
    container: "gap-5",
    text: "text-xl",
  },
};

// Componente de Spinner
function SpinnerLoading({ size = "md", className }: { size: LoadingSize; className?: string }) {
  return <Loader2 className={cn("animate-spin text-primary", sizeMap[size].spinner, className)} />;
}

// Componente de Dots
function DotsLoading({ size = "md", className }: { size: LoadingSize; className?: string }) {
  const dotSize = {
    sm: "w-2 h-2",
    md: "w-3 h-3",
    lg: "w-4 h-4",
    xl: "w-6 h-6",
  }[size];

  return (
    <div className={cn("flex items-center space-x-1", className)}>
      <div className={cn("bg-primary rounded-full animate-bounce", dotSize)} style={{ animationDelay: "0ms" }} />
      <div className={cn("bg-primary rounded-full animate-bounce", dotSize)} style={{ animationDelay: "150ms" }} />
      <div className={cn("bg-primary rounded-full animate-bounce", dotSize)} style={{ animationDelay: "300ms" }} />
    </div>
  );
}

// Componente de Pulse
function PulseLoading({ size = "md", className }: { size: LoadingSize; className?: string }) {
  const pulseSize = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
    xl: "w-24 h-24",
  }[size];

  return (
    <div className={cn("relative", className)}>
      <div className={cn("bg-primary/20 rounded-full animate-ping absolute", pulseSize)} />
      <div className={cn("bg-primary/40 rounded-full animate-pulse", pulseSize)} />
    </div>
  );
}

// Componente de Skeleton
function SkeletonLoading({ size = "md", className }: { size: LoadingSize; className?: string }) {
  const height = {
    sm: "h-4",
    md: "h-6",
    lg: "h-8",
    xl: "h-12",
  }[size];

  return (
    <div className={cn("space-y-2", className)}>
      <div className={cn("bg-muted animate-pulse rounded", height)} />
      <div className={cn("bg-muted animate-pulse rounded w-3/4", height)} />
      <div className={cn("bg-muted animate-pulse rounded w-1/2", height)} />
    </div>
  );
}

// Componente principal de Loading
export function Loading({
  size = "md",
  variant = "spinner",
  text,
  className,
  fullScreen = false,
  overlay = false,
}: LoadingProps) {
  const LoadingComponent = {
    spinner: SpinnerLoading,
    dots: DotsLoading,
    pulse: PulseLoading,
    skeleton: SkeletonLoading,
  }[variant];

  const content = (
    <div
      className={cn(
        "flex flex-col items-center justify-center",
        sizeMap[size].container,
        fullScreen && "min-h-screen",
        className
      )}
    >
      <LoadingComponent size={size} />
      {text && <p className={cn("text-muted-foreground animate-pulse", sizeMap[size].text)}>{text}</p>}
    </div>
  );

  if (overlay) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
}

// Componentes de conveniência para casos específicos
export function PageLoading({ text = "Carregando..." }: { text?: string }) {
  return <Loading variant="spinner" size="lg" text={text} fullScreen className="py-20" />;
}

export function ComponentLoading({ text, size = "md" }: { text?: string; size?: LoadingSize }) {
  return <Loading variant="spinner" size={size} text={text} className="py-8" />;
}

export function ButtonLoading({ size = "sm" }: { size?: LoadingSize }) {
  return <Loading variant="spinner" size={size} className="py-0" />;
}

export function TableLoading({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3 p-4">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-muted animate-pulse rounded" />
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-muted animate-pulse rounded w-1/4" />
          <div className="h-3 bg-muted animate-pulse rounded w-1/2" />
        </div>
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-muted animate-pulse rounded" />
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-muted animate-pulse rounded" />
            <div className="h-3 bg-muted animate-pulse rounded w-3/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function CardLoading({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="border rounded-lg p-4 space-y-3">
          <div className="w-full h-32 bg-muted animate-pulse rounded" />
          <div className="space-y-2">
            <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
            <div className="h-3 bg-muted animate-pulse rounded w-1/2" />
            <div className="h-3 bg-muted animate-pulse rounded w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Hook para loading global com contexto (opcional para o futuro)
export function LoadingOverlay({
  isLoading,
  children,
  text,
}: {
  isLoading: boolean;
  children: React.ReactNode;
  text?: string;
}) {
  return (
    <div className="relative">
      {children}
      {isLoading && (
        <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-10">
          <Loading variant="spinner" size="lg" text={text} />
        </div>
      )}
    </div>
  );
}
