import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/src/lib/utils";

const fieldClasses = "flex min-h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm transition-colors placeholder:text-muted-foreground hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/40";

export function Input({ className, type, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input type={type} className={cn(fieldClasses, "file:border-0 file:bg-transparent file:text-sm file:font-medium", className)} {...props} />;
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(fieldClasses, "min-h-24 resize-y", className)} {...props} />;
}
