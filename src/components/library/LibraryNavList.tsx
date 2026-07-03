import { cn } from "@/src/lib/utils";

export type LibraryNavItem = {
  id: string;
  label: string;
  isActive?: boolean;
  href?: string;
  onClick?: () => void;
};

const itemClassName = (isActive: boolean) =>
  cn(
    "flex h-9 items-center rounded px-2 text-sm text-left text-gray-300 transition-colors",
    "hover:bg-wfrp-control-hover hover:text-gray-100",
    isActive && "bg-wfrp-control-hover text-gray-100",
  );

export function LibraryNavList({ items, ariaLabel }: { items: LibraryNavItem[]; ariaLabel: string }) {
  return (
    <nav aria-label={ariaLabel} className="flex flex-col gap-1">
      {items.map((item) =>
        item.href ? (
          <a
            key={item.id}
            href={item.href}
            onClick={item.onClick}
            aria-current={item.isActive ? "page" : undefined}
            className={itemClassName(item.isActive ?? false)}
          >
            {item.label}
          </a>
        ) : (
          <button
            key={item.id}
            type="button"
            onClick={item.onClick}
            className={itemClassName(item.isActive ?? false)}
          >
            {item.label}
          </button>
        ),
      )}
    </nav>
  );
}
