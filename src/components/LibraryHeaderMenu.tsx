import { ExternalLink } from "lucide-react";
import { buildCampaignLibraryPath } from "../lib/campaignRoutes";
import { cn } from "../lib/utils";
import {
  mainTabButtonBaseClassName,
  mainTabButtonInactiveClassName,
} from "../lib/tabStyles";

export function LibraryHeaderMenu({ campaignId }: { campaignId: string }) {
  const href = buildCampaignLibraryPath({ campaignId });

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Library (opens in new tab)"
      className={cn(
        mainTabButtonBaseClassName,
        mainTabButtonInactiveClassName,
        "ml-6 inline-flex items-center gap-1.5",
      )}
    >
      Library
      <ExternalLink className="size-3 translate-y-px" aria-hidden="true" />
    </a>
  );
}
