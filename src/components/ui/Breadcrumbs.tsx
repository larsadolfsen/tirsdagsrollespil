import { ChevronRight } from "lucide-react";

export type BreadcrumbItem = {
  href?: string;
  label: string;
  onClick?: () => void;
};

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex min-w-0 items-center gap-1 text-sm text-wfrp-muted-text">
        {items.map((item, index) => {
          const isCurrent = index === items.length - 1;

          return (
            <li key={`${item.label}-${index}`} className="flex min-w-0 items-center gap-1">
              {index > 0 ? (
                <ChevronRight aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-wfrp-muted-text/60" />
              ) : null}

              {isCurrent ? (
                <span
                  aria-current="page"
                  className="truncate font-semibold text-wfrp-page-text"
                >
                  {item.label}
                </span>
              ) : (
                <a
                  href={item.href}
                  onClick={(event) => {
                    if (!item.onClick) return;
                    event.preventDefault();
                    item.onClick();
                  }}
                  className="truncate transition-colors hover:text-wfrp-page-text focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wfrp-gold"
                >
                  {item.label}
                </a>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
