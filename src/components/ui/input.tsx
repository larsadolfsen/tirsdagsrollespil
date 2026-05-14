import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

const fieldClasses = "w-full rounded border border-white/10 bg-black/30 text-sm text-gray-100 placeholder:text-gray-600 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-wfrp-gold/50 disabled:cursor-not-allowed disabled:opacity-50";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(fieldClasses, "px-3 py-2", className)} {...props} />;
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(fieldClasses, "px-3 py-2", className)} {...props} />;
}
