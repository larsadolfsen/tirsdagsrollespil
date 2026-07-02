import { ExternalLink } from "lucide-react";
import { bookCatalog } from "../data/books";
import { buildCampaignLibraryPath } from "../lib/campaignRoutes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui";

function openInNewTab(path: string) {
  window.open(path, "_blank", "noopener,noreferrer");
}

export function LibraryHeaderMenu({ campaignId }: { campaignId: string }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Library"
        title="Library"
        className="wfrp-text-strong tracking-wide text-wfrp-muted-text transition-colors hover:text-white"
      >
        Library
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => openInNewTab(buildCampaignLibraryPath({ campaignId }))}
        >
          <ExternalLink className="mr-2 size-4" aria-hidden="true" />
          Library overview
        </DropdownMenuItem>
        {bookCatalog.map((book) => (
          <DropdownMenuItem
            key={book.id}
            onClick={() => openInNewTab(buildCampaignLibraryPath({ campaignId, bookId: book.id }))}
          >
            <ExternalLink className="mr-2 size-4" aria-hidden="true" />
            {book.title}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
