import { ChevronLeft, Menu, Plus, Trash2 } from "lucide-react";
import type { CharacterSummary } from "../data/repository";
import type { GMSession } from "../data/gmSessions";
import { cn } from "../lib/utils";
import { AppShell } from "./AppShell";
import { PlayerCardsRow } from "./PlayerCardsRow";
import { AppSidebar } from "./sidebar";
import {
  Badge,
  Breadcrumbs,
  Button,
  Input,
  Label,
  Textarea,
  type BreadcrumbItem,
} from "./ui";
import {
  SheetDataButtonRow,
  SheetDataPanel,
  SheetEmptyState,
  WfrpPanel,
} from "./wfrp";

type SessionField = "name" | "sessionNumber" | "date" | "notes";

type GameMasterPageProps = {
  activeSession: GMSession | null;
  breadcrumbs: BreadcrumbItem[];
  characters: CharacterSummary[];
  editingSessionDate: string;
  editingSessionName: string;
  editingSessionNotes: string;
  editingSessionNumber: number | "";
  isLoadingSessions: boolean;
  isSessionsSidebarOpen: boolean;
  onCreateSession: () => void;
  onDeleteSession: (sessionId: string) => void;
  onSelectSession: (sessionId: string) => void;
  onSessionsSidebarOpenChange: (isOpen: boolean) => void;
  onUpdateSession: (field: SessionField, value: string) => void;
  selectedSessionId: string | null;
  sessions: GMSession[];
};

function GameMasterHeader({
  isSessionsSidebarOpen,
  onToggleSessions,
}: {
  isSessionsSidebarOpen: boolean;
  onToggleSessions: () => void;
}) {
  return (
    <section className="h-14 w-full border-b border-t-4 border-wfrp-border border-t-wfrp-red bg-sidebar py-1 shadow-lg shadow-black/20">
      <div className="flex h-full max-h-12 items-center px-3 md:px-4">
        <button
          type="button"
          onClick={onToggleSessions}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded text-wfrp-gold transition-colors hover:bg-white/5 hover:text-yellow-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-wfrp-gold/60"
          aria-label={isSessionsSidebarOpen ? "Close sessions menu" : "Open sessions menu"}
          aria-expanded={isSessionsSidebarOpen}
          title={isSessionsSidebarOpen ? "Close sessions menu" : "Open sessions menu"}
        >
          <Menu size={27} strokeWidth={2.25} aria-hidden="true" />
          {isSessionsSidebarOpen ? (
            <ChevronLeft className="-ml-2.5" size={18} strokeWidth={2.75} aria-hidden="true" />
          ) : null}
        </button>
        <h1 className="ml-3 min-w-0 flex-1 truncate text-left font-serif text-base font-semibold leading-tight tracking-tight text-gray-100 sm:text-xl">
          Game Master
        </h1>
      </div>
    </section>
  );
}

export function GameMasterPage({
  activeSession,
  breadcrumbs,
  characters,
  editingSessionDate,
  editingSessionName,
  editingSessionNotes,
  editingSessionNumber,
  isLoadingSessions,
  isSessionsSidebarOpen,
  onCreateSession,
  onDeleteSession,
  onSelectSession,
  onSessionsSidebarOpenChange,
  onUpdateSession,
  selectedSessionId,
  sessions,
}: GameMasterPageProps) {
  const sessionSidebar = (
    <AppSidebar
      isOpen={isSessionsSidebarOpen}
      onClose={() => onSessionsSidebarOpenChange(false)}
      side="left"
      motionKey="gm-sessions-sidebar"
      title="Sessions"
      titleId="gm-sessions-title"
      overlayUntil="mobile"
      closeOnOutsidePointerDown
      closeLabel="Close sessions sidebar"
      className="md:h-auto md:min-h-0 md:w-72 md:min-w-[288px] md:max-w-[288px]"
      contentClassName="p-4"
      footer={(
        <Button
          variant="secondary"
          onClick={onCreateSession}
          className="w-full justify-center"
          leadingIcon={<Plus />}
        >
          Create session
        </Button>
      )}
    >
      {sessions.length > 0 ? (
        <SheetDataPanel>
          {sessions.map((session) => (
            <SheetDataButtonRow
              key={session.id}
              onClick={() => onSelectSession(session.id)}
              aria-current={selectedSessionId === session.id ? "page" : undefined}
              className={cn(
                "grid-cols-[auto_minmax(0,1fr)] gap-2 px-3 py-3",
                selectedSessionId === session.id && "bg-wfrp-gold-surface text-wfrp-gold",
              )}
            >
              <Badge variant="outline">#{session.sessionNumber}</Badge>
              <span className="min-w-0">
                <span className="block truncate wfrp-text-strong">{session.name}</span>
                <span className="mt-0.5 block wfrp-text text-wfrp-muted-text">{session.date}</span>
              </span>
            </SheetDataButtonRow>
          ))}
        </SheetDataPanel>
      ) : (
        <SheetEmptyState title={isLoadingSessions ? "Loading sessions" : "No sessions"} className="min-h-32">
          {isLoadingSessions ? "Fetching campaign notes…" : "Create the first session to start planning."}
        </SheetEmptyState>
      )}
    </AppSidebar>
  );

  return (
    <AppShell mobileAddAction={null} sidebars={null}>
      <GameMasterHeader
        isSessionsSidebarOpen={isSessionsSidebarOpen}
        onToggleSessions={() => onSessionsSidebarOpenChange(!isSessionsSidebarOpen)}
      />

      <div className="flex min-h-[calc(100dvh-3.5rem)] w-full flex-row items-stretch">
        {sessionSidebar}

        <div className="flex min-w-0 flex-1 flex-col gap-4 px-4 py-4 md:gap-6 md:px-8 md:py-6">
          <Breadcrumbs items={breadcrumbs} />
          <PlayerCardsRow characters={characters} />

          <WfrpPanel
            className="flex min-h-[450px] flex-1 flex-col"
            title={activeSession ? "Session Details" : undefined}
            actions={activeSession ? (
              <Button
                variant="destructive"
                onClick={() => onDeleteSession(activeSession.id)}
                leadingIcon={<Trash2 />}
              >
                Delete session
              </Button>
            ) : undefined}
          >
            {activeSession ? (
              <div className="flex h-full flex-col gap-5">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-[100px_1fr_150px]">
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="gm-session-no">Session No.</Label>
                    <Input
                      id="gm-session-no"
                      type="number"
                      min="0"
                      value={editingSessionNumber}
                      onChange={(event) => onUpdateSession("sessionNumber", event.target.value)}
                      className="[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <Label htmlFor="gm-session-name">Session Name</Label>
                    <Input
                      id="gm-session-name"
                      type="text"
                      placeholder="e.g. The Adventure Begins"
                      value={editingSessionName}
                      onChange={(event) => onUpdateSession("name", event.target.value)}
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <Label htmlFor="gm-session-date">Date</Label>
                    <Input
                      id="gm-session-date"
                      type="date"
                      value={editingSessionDate}
                      onChange={(event) => onUpdateSession("date", event.target.value)}
                    />
                  </div>
                </div>

                <div className="flex flex-1 flex-col gap-2">
                  <Label htmlFor="gm-session-notes">Notes & Recap</Label>
                  <Textarea
                    id="gm-session-notes"
                    placeholder="Write session recaps, notes, or list clues here..."
                    value={editingSessionNotes}
                    onChange={(event) => onUpdateSession("notes", event.target.value)}
                    className="min-h-[350px] flex-1"
                  />
                </div>
              </div>
            ) : (
              <SheetEmptyState title="No session selected" className="h-full min-h-[400px]">
                {sessions.length > 0
                  ? "Select a session from the sidebar to view or edit its notes."
                  : "Create a session to start planning."}
              </SheetEmptyState>
            )}
          </WfrpPanel>
        </div>
      </div>
    </AppShell>
  );
}
