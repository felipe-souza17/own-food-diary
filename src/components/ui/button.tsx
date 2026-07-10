import { forwardRef, type ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg" | "icon";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 focus-visible:outline-emerald-600",
  secondary: "bg-zinc-900 text-white shadow-sm hover:bg-zinc-700 focus-visible:outline-zinc-900",
  outline:
    "border border-zinc-300 bg-white text-zinc-700 shadow-sm hover:bg-zinc-50 focus-visible:outline-zinc-400",
  ghost: "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 focus-visible:outline-zinc-400",
  danger: "bg-red-600 text-white shadow-sm hover:bg-red-700 focus-visible:outline-red-600",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-8 gap-1.5 rounded-lg px-3 text-xs",
  md: "h-10 gap-2 rounded-lg px-4 text-sm",
  lg: "h-11 gap-2 rounded-xl px-6 text-sm",
  icon: "size-9 rounded-lg",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref,
  ) => (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      className={cn(
        "inline-flex items-center justify-center font-medium transition-all duration-150",
        "focus-visible:outline-2 focus-visible:outline-offset-2",
        "active:scale-[0.97]",
        "disabled:pointer-events-none disabled:opacity-50",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      {isLoading && <Loader2 aria-hidden className="size-4 animate-spin" />}
      {children}
    </button>
  ),
);

Button.displayName = "Button";
