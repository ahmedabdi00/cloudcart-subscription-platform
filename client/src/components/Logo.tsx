import { cn } from "@/lib/utils"

export interface LogoProps {
  className?: string
}

export function Logo({ className }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <img
        src="/images/cloudcart-logo.png"
        alt="CloudCart"
        className="h-8 w-auto"
      />
      <span className="sr-only">CloudCart</span>
    </div>
  );
}
