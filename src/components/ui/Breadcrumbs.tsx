import { ChevronRight, EllipsisVertical } from "lucide-react";
import { cn } from "../../lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./dropdown-menu";

export type BreadcrumbItem = {
  href?: string;
  label: string;
  onClick?: () => void;
};

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  const itemCount = items.length;
  const parentIndex = itemCount - 2;
  const ancestorItems = items.slice(0, itemCount - 1);

  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex min-w-0 items-center gap-1 text-sm text-wfrp-muted-text">
        {ancestorItems.length > 0 ? (
          <li className="flex shrink-0 items-center md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger
                aria-label="Show breadcrumb path"
                title="Show breadcrumb path"
                className="wfrp-standard-icon cursor-pointer"
              >
                <span className="wfrp-standard-icon__glyph" aria-hidden="true">
                  <EllipsisVertical />
                </span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {ancestorItems.map((item, index) => (
                  <DropdownMenuItem key={`${item.label}-${index}`} onClick={item.onClick}>
                    {item.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </li>
        ) : null}

        {items.map((item, index) => {
          const isCurrent = index === itemCount - 1;
          const isParent = index === parentIndex;
          const isAncestor = !isCurrent && !isParent;

          return (
            <li
              key={`${item.label}-${index}`}
              className={cn("flex min-w-0 items-center gap-1", isAncestor && "hidden md:flex")}
            >
              {isParent ? (
                <>
                  <ChevronRight
                    aria-hidden="true"
                    className="h-3.5 w-3.5 shrink-0 text-wfrp-muted-text/60 md:hidden"
                  />
                  {index > 0 ? (
                    <ChevronRight
                      aria-hidden="true"
                      className="hidden h-3.5 w-3.5 shrink-0 text-wfrp-muted-text/60 md:block"
                    />
                  ) : null}
                </>
              ) : index > 0 ? (
                <ChevronRight aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-wfrp-muted-text/60" />
              ) : null}

              {isCurrent ? (
                <span aria-current="page" className="truncate font-semibold text-wfrp-page-text">
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
