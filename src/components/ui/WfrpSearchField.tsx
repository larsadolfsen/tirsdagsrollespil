import { Search } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { Input } from "./input";

type WfrpSearchFieldProps = {
  className?: string;
  id: string;
  label: string;
  onSearch?: (value: string) => void;
  onValueChange: (value: string) => void;
  placeholder?: string;
  value: string;
};

export function WfrpSearchField({
  className,
  id,
  label,
  onSearch,
  onValueChange,
  placeholder,
  value,
}: WfrpSearchFieldProps) {
  const searchLabel = `${label} search`;

  return (
    <div className={cn("border-b border-wfrp-border bg-[#242424] px-4 py-3", className)}>
      <label className="sr-only" htmlFor={id}>
        {label}
      </label>
      <div className="relative">
        <Input
          id={id}
          type="search"
          value={value}
          onChange={(event) => onValueChange(event.target.value)}
          placeholder={placeholder ?? label}
          className="h-9 min-h-9 rounded border-wfrp-border bg-black/20 py-1 pl-3 pr-11 wfrp-text-strong text-gray-100 placeholder:text-wfrp-muted-text focus-visible:ring-1 focus-visible:ring-wfrp-gold/60"
        />
        <button
          type="button"
          className="absolute right-1 top-1/2 inline-flex h-7 w-8 -translate-y-1/2 items-center justify-center rounded border border-wfrp-border bg-[#303030] text-wfrp-muted-text transition-colors hover:bg-[#3a3a3a] hover:text-gray-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-wfrp-gold/60"
          aria-label={searchLabel}
          onClick={() => onSearch?.(value)}
        >
          <Search size={15} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
