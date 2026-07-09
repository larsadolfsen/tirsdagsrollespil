import { useEffect, useState } from "react";
import {
  BookOpenText,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Swords,
} from "lucide-react";
import type { CharacterSummary } from "../data/repository";
import type { GMSession } from "../data/gmSessions";
import { AppShell } from "./AppShell";
import { FormattedTextField } from "./FormattedTextField";
import { PlayerCardsRow } from "./PlayerCardsRow";
import { SceneActionsMenu } from "./SceneActionsMenu";
import { AppSidebar, SidebarItemList } from "./sidebar";
import {
  Breadcrumbs,
  Button,
  Heading,
  SectionHeading,
  WfrpFilterChips,
  type BreadcrumbItem,
  type WfrpFilterChipOption,
} from "./ui";
import {
  SheetEmptyState,
} from "./wfrp";

type GameMasterPageProps = {
  activeSession: GMSession | null;
  breadcrumbs: BreadcrumbItem[];
  characters: CharacterSummary[];
  editingSessionName: string;
  isLoadingSessions: boolean;
  isSessionsSidebarOpen: boolean;
  onCreateSession: () => void;
  onSelectSession: (sessionId: string) => void;
  onSessionsSidebarOpenChange: (isOpen: boolean) => void;
  onUpdateSession: (field: "name", value: string) => void;
  selectedSessionId: string | null;
  sessions: GMSession[];
};

type SceneComponentType = "introduction" | "encounter";

type SceneState = {
  id: string;
  components: SceneComponentType[];
  introductionText: string;
};

const sceneComponentOptions: WfrpFilterChipOption<SceneComponentType>[] = [
  { id: "introduction", label: "Introduction", icon: BookOpenText },
  { id: "encounter", label: "Encounter", icon: Swords },
];

let nextSceneId = 1;

function createScene(
  components: SceneComponentType[] = [],
  introductionText = "",
): SceneState {
  return {
    id: `scene-${nextSceneId++}`,
    components,
    introductionText,
  };
}

function GameMasterHeader({
  isSessionsSidebarOpen,
  onToggleSessions,
}: {
  isSessionsSidebarOpen: boolean;
  onToggleSessions: () => void;
}) {
  return (
    <section className="relative z-[60] h-14 w-full border-b border-t-4 border-wfrp-border border-t-wfrp-red bg-sidebar py-1 shadow-lg shadow-black/20">
      <div className="flex h-full max-h-12 items-center px-3 md:px-4">
        <Button
          variant="wfrpIcon"
          onClick={onToggleSessions}
          aria-label={isSessionsSidebarOpen ? "Close sessions menu" : "Open sessions menu"}
          aria-expanded={isSessionsSidebarOpen}
          title={isSessionsSidebarOpen ? "Close sessions menu" : "Open sessions menu"}
          leadingIcon={isSessionsSidebarOpen ? <PanelLeftClose /> : <PanelLeftOpen />}
        />
        <div className="ml-3 min-w-0 flex-1">
          <Heading level={1} variant="pageCompact" align="left" truncate>
            Game Master
          </Heading>
        </div>
      </div>
    </section>
  );
}

export function GameMasterPage({
  activeSession,
  breadcrumbs,
  characters,
  editingSessionName,
  isLoadingSessions,
  isSessionsSidebarOpen,
  onCreateSession,
  onSelectSession,
  onSessionsSidebarOpenChange,
  onUpdateSession,
  selectedSessionId,
  sessions,
}: GameMasterPageProps) {
  const [isRenamingSession, setIsRenamingSession] = useState(false);
  const [sessionTitleDraft, setSessionTitleDraft] = useState(editingSessionName);
  const [scenes, setScenes] = useState<SceneState[]>(() => [createScene()]);

  useEffect(() => {
    setIsRenamingSession(false);
    setSessionTitleDraft(editingSessionName);
    setScenes([createScene()]);
  }, [activeSession?.id]);

  useEffect(() => {
    if (!isRenamingSession) {
      setSessionTitleDraft(editingSessionName);
    }
  }, [editingSessionName, isRenamingSession]);

  const finishRenamingSession = () => {
    const nextTitle = sessionTitleDraft.trim();
    if (nextTitle && nextTitle !== editingSessionName) {
      onUpdateSession("name", nextTitle);
    } else {
      setSessionTitleDraft(editingSessionName);
    }
    setIsRenamingSession(false);
  };

  const addScene = (sceneIndex: number, placement: "before" | "after") => {
    setScenes((currentScenes) => {
      const nextScenes = [...currentScenes];
      nextScenes.splice(sceneIndex + (placement === "after" ? 1 : 0), 0, createScene());
      return nextScenes;
    });
  };

  const copyScene = (sceneIndex: number) => {
    setScenes((currentScenes) => {
      const sourceScene = currentScenes[sceneIndex];
      if (!sourceScene) {
        return currentScenes;
      }

      const nextScenes = [...currentScenes];
      nextScenes.splice(
        sceneIndex + 1,
        0,
        createScene([...sourceScene.components], sourceScene.introductionText),
      );
      return nextScenes;
    });
  };

  const deleteScene = (sceneId: string) => {
    setScenes((currentScenes) => currentScenes.filter((scene) => scene.id !== sceneId));
  };

  const updateSceneComponents = (sceneId: string, components: SceneComponentType[]) => {
    setScenes((currentScenes) => currentScenes.map((scene) => (
      scene.id === sceneId ? { ...scene, components } : scene
    )));
  };

  const updateIntroductionText = (sceneId: string, introductionText: string) => {
    setScenes((currentScenes) => currentScenes.map((scene) => (
      scene.id === sceneId ? { ...scene, introductionText } : scene
    )));
  };

  const sessionSidebar = (
    <AppSidebar
      isOpen={isSessionsSidebarOpen}
      onClose={() => onSessionsSidebarOpenChange(false)}
      side="left"
      motionKey="gm-sessions-sidebar"
      title="Sessions"
      titleId="gm-sessions-title"
      overlayUntil="mobile"
      showHeader={false}
      closeLabel="Close sessions sidebar"
      className="!top-14 !h-[calc(100dvh-3.5rem)] !max-h-[calc(100dvh-3.5rem)] !bg-background md:!top-auto md:!h-auto md:!max-h-none md:!w-72 md:!min-w-[288px] md:!max-w-[288px] md:!shadow-none"
      contentClassName="!p-0 !bg-background"
      footerClassName="!bg-background"
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
        <SidebarItemList
          className="!rounded-none !border-0"
          itemClassName="!min-h-0 !py-0 h-[72px]"
          title="Session"
          items={sessions.map((session) => ({
            id: session.id,
            name: (
              <span className="flex min-w-0 flex-col gap-1">
                <span className="block truncate leading-none text-base text-white">{session.name}</span>
                <span className="block leading-none text-sm text-wfrp-muted-text">Session {session.sessionNumber + 1}</span>
              </span>
            ),
          }))}
          selectedItemId={selectedSessionId}
          onItemSelect={(session) => onSelectSession(session.id)}
        />
      ) : (
        <SheetEmptyState title={isLoadingSessions ? "Loading sessions" : "No sessions"} className="min-h-32">
          {isLoadingSessions ? "Fetching campaign notes…" : "Create the first session to start planning."}
        </SheetEmptyState>
      )}
    </AppSidebar>
  );

  return (
    <AppShell
      header={(
        <GameMasterHeader
          isSessionsSidebarOpen={isSessionsSidebarOpen}
          onToggleSessions={() => onSessionsSidebarOpenChange(!isSessionsSidebarOpen)}
        />
      )}
      mobileAddAction={null}
      sidebars={sessionSidebar}
    >
      <div className="relative min-h-[calc(100dvh-3.5rem)] w-full">

        <div className="flex flex-col gap-4 px-4 py-4 md:gap-6 md:px-6 md:py-6">
          <div className="mx-auto w-full max-w-[1200px] flex flex-col gap-4 md:gap-6">
            <Breadcrumbs items={breadcrumbs} />
            <PlayerCardsRow characters={characters} />

            <section className="flex min-h-[450px] flex-1 flex-col">
              {activeSession ? (
                <div>
                  <span className="wfrp-label block text-wfrp-muted-text">
                    Session {activeSession.sessionNumber + 1}
                  </span>
                  {isRenamingSession ? (
                    <input
                      autoFocus
                      value={sessionTitleDraft}
                      onChange={(event) => setSessionTitleDraft(event.target.value)}
                      onBlur={finishRenamingSession}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.currentTarget.blur();
                        }
                      }}
                      aria-label="Session title"
                      className="w-full border-0 border-b border-wfrp-gold/50 bg-transparent p-0 pb-1 font-serif text-3xl font-semibold text-gray-100 outline-none"
                    />
                  ) : (
                    <div>
                      <SectionHeading>
                        <button
                          type="button"
                          onClick={() => setIsRenamingSession(true)}
                          className="cursor-text text-left transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-wfrp-gold/50"
                          aria-label="Rename session"
                        >
                          {editingSessionName || "Untitled Session"}
                        </button>
                      </SectionHeading>
                    </div>
                  )}
                  {scenes.length > 0 ? (
                    <div className="flex flex-col gap-8">
                      {scenes.map((scene, sceneIndex) => (
                        <section key={scene.id}>
                          <div className="mt-4 flex min-h-12 items-center justify-between gap-4">
                            <Heading level={3} variant="subsection">
                              Scene {sceneIndex + 1}
                            </Heading>
                            <SceneActionsMenu
                              sceneNumber={sceneIndex + 1}
                              onAddBefore={() => addScene(sceneIndex, "before")}
                              onAddAfter={() => addScene(sceneIndex, "after")}
                              onCopy={() => copyScene(sceneIndex)}
                              onDelete={() => deleteScene(scene.id)}
                            />
                          </div>
                          <div className="mt-2">
                            <span className="wfrp-label mb-2 block text-wfrp-muted-text">
                              Add component
                            </span>
                            <WfrpFilterChips
                              options={sceneComponentOptions}
                              selectedIds={scene.components}
                              onChange={(components) => updateSceneComponents(scene.id, components)}
                              ariaLabel={`Scene ${sceneIndex + 1} components`}
                            />
                          </div>
                          {scene.components.length > 0 ? (
                            <div className="mt-6 flex flex-col gap-5">
                              {scene.components.map((component) => (
                                <div key={component}>
                                  <Heading level={4} variant="subsection">
                                    {sceneComponentOptions.find((option) => option.id === component)?.label}
                                  </Heading>
                                  {component === "introduction" ? (
                                    <FormattedTextField
                                      value={scene.introductionText}
                                      onChange={(value) => updateIntroductionText(scene.id, value)}
                                      ariaLabel={`Scene ${sceneIndex + 1} introduction`}
                                      placeholder="Write the scene introduction…"
                                      className="mt-3"
                                    />
                                  ) : null}
                                </div>
                              ))}
                            </div>
                          ) : null}
                        </section>
                      ))}
                    </div>
                  ) : (
                    <Button
                      variant="secondary"
                      onClick={() => setScenes([createScene()])}
                      leadingIcon={<Plus />}
                      className="mt-4"
                    >
                      Add scene
                    </Button>
                  )}
                </div>
              ) : (
                <SheetEmptyState title="No session selected" className="min-h-[400px] flex-1">
                  {sessions.length > 0
                    ? "Select a session from the sidebar to view or edit its notes."
                    : "Create a session to start planning."}
                </SheetEmptyState>
              )}
            </section>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
