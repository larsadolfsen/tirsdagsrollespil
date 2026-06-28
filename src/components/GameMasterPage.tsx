import { useEffect, useRef, useState } from "react";
import {
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
} from "lucide-react";
import type { CharacterSummary } from "../data/repository";
import type { EncounterData, GMScene, GMSession } from "../data/gmSessions";
import { AppShell } from "./AppShell";
import { PlayerCardsRow } from "./PlayerCardsRow";
import { SceneActionsMenu } from "./SceneActionsMenu";
import { AppSidebar, SidebarItemList, MonsterSidebar } from "./sidebar";
import type { CreatureTemplate } from "../data/rules/wfrp4e";
import {
  Breadcrumbs,
  Button,
  Heading,
  type BreadcrumbItem,
} from "./ui";
import {
  SheetEmptyState,
} from "./wfrp";
import { SceneComponentsList, type SceneComponent } from "./SceneComponentsList";

type GameMasterPageProps = {
  activeSession: GMSession | null;
  breadcrumbs: BreadcrumbItem[];
  characters: CharacterSummary[];
  editingSessionName: string;
  isLoadingSessions: boolean;
  isSessionsSidebarOpen: boolean;
  onCreateSession: () => void;
  onScenesChange?: (scenes: GMScene[]) => void;
  onSelectSession: (sessionId: string) => void;
  onUpdateComponentEncounterData?: (sceneId: string, componentId: string, data: EncounterData) => void;
  onSessionsSidebarOpenChange: (isOpen: boolean) => void;
  onUpdateSession: (field: "name", value: string) => void;
  selectedSessionId: string | null;
  sessions: GMSession[];
};

export function createSceneComponent(
  type: "text" | "encounter",
  text = "",
  title?: string,
): SceneComponent {
  return {
    id: `comp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    type,
    text,
    title,
  };
}

function createScene(
  components: SceneComponent[] = [],
): GMScene {
  return {
    id: `scene-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    components,
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
  onScenesChange,
  onSelectSession,
  onSessionsSidebarOpenChange,
  onUpdateSession,
  onUpdateComponentEncounterData,
  selectedSessionId,
  sessions,
}: GameMasterPageProps) {
  const [isRenamingSession, setIsRenamingSession] = useState(false);
  const [sessionTitleDraft, setSessionTitleDraft] = useState(editingSessionName);
  const [scenes, setScenes] = useState<GMScene[]>(() => [createScene()]);
  const onScenesChangeRef = useRef(onScenesChange);
  useEffect(() => { onScenesChangeRef.current = onScenesChange; });

  const [isMonsterSidebarOpen, setIsMonsterSidebarOpen] = useState(false);
  const monsterSidebarOnAddRef = useRef<((template: CreatureTemplate, count: number) => void) | null>(null);

  const openMonsterSidebar = (onAdd: (template: CreatureTemplate, count: number) => void) => {
    monsterSidebarOnAddRef.current = onAdd;
    setIsMonsterSidebarOpen(true);
  };

  useEffect(() => {
    const loaded = activeSession?.scenes;
    const initial = loaded && loaded.length > 0 ? loaded : [createScene()];
    setIsRenamingSession(false);
    setSessionTitleDraft(editingSessionName);
    setScenes(initial);
  }, [activeSession?.id]);

  useEffect(() => {
    onScenesChangeRef.current?.(scenes);
  }, [scenes]);

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
      const copiedComponents = sourceScene.components.map((comp) =>
        createSceneComponent(comp.type, comp.text, comp.title),
      );
      nextScenes.splice(
        sceneIndex + 1,
        0,
        createScene(copiedComponents),
      );
      return nextScenes;
    });
  };

  const deleteScene = (sceneId: string) => {
    setScenes((currentScenes) => currentScenes.filter((scene) => scene.id !== sceneId));
  };

  const updateSceneComponents = (sceneId: string, components: SceneComponent[]) => {
    setScenes((currentScenes) => currentScenes.map((scene) => (
      scene.id === sceneId ? { ...scene, components } : scene
    )));
  };

  const addComponentToScene = (sceneId: string, type: "text" | "encounter") => {
    setScenes((currentScenes) => currentScenes.map((scene) => {
      if (scene.id === sceneId) {
        return {
          ...scene,
          components: [...scene.components, createSceneComponent(type)],
        };
      }
      return scene;
    }));
  };

  const removeComponentFromScene = (sceneId: string, componentId: string) => {
    setScenes((currentScenes) => currentScenes.map((scene) => {
      if (scene.id === sceneId) {
        return {
          ...scene,
          components: scene.components.filter((comp) => comp.id !== componentId),
        };
      }
      return scene;
    }));
  };

  const updateComponentText = (sceneId: string, componentId: string, text: string) => {
    setScenes((currentScenes) => currentScenes.map((scene) => {
      if (scene.id === sceneId) {
        return {
          ...scene,
          components: scene.components.map((comp) => (
            comp.id === componentId ? { ...comp, text } : comp
          )),
        };
      }
      return scene;
    }));
  };

  const updateComponentTitle = (sceneId: string, componentId: string, title: string) => {
    setScenes((currentScenes) => currentScenes.map((scene) => {
      if (scene.id === sceneId) {
        return {
          ...scene,
          components: scene.components.map((comp) => (
            comp.id === componentId ? { ...comp, title } : comp
          )),
        };
      }
      return scene;
    }));
  };

  const updateComponentEncounterData = (sceneId: string, componentId: string, data: EncounterData) => {
    setScenes((currentScenes) => currentScenes.map((scene) => {
      if (scene.id === sceneId) {
        return {
          ...scene,
          components: scene.components.map((comp) => (
            comp.id === componentId ? { ...comp, encounterData: data } : comp
          )),
        };
      }
      return scene;
    }));
    onUpdateComponentEncounterData?.(sceneId, componentId, data);
  };

  const sessionSidebar = (
    <AppSidebar
      isOpen={isSessionsSidebarOpen}
      onClose={() => onSessionsSidebarOpenChange(false)}
      side="left"
      motionKey="gm-sessions-sidebar"
      title="Sessions"
      titleId="gm-sessions-title"
      overlayUntil="desktop"
      showHeader={false}
      closeLabel="Close sessions sidebar"
      className="!fixed !top-14 !h-[calc(100dvh-3.5rem)] !max-h-[calc(100dvh-3.5rem)] md:!w-72 md:!min-w-[288px] md:!max-w-[288px] xl:!fixed xl:!left-0 xl:!top-14 xl:!z-50 xl:!h-[calc(100dvh-3.5rem)] xl:!max-h-[calc(100dvh-3.5rem)] !bg-background"
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
      mobileAddAction={null}
      header={(
        <GameMasterHeader
          isSessionsSidebarOpen={isSessionsSidebarOpen}
          onToggleSessions={() => onSessionsSidebarOpenChange(!isSessionsSidebarOpen)}
        />
      )}
      sidebars={(
        <>
          {sessionSidebar}
          <MonsterSidebar
            isOpen={isMonsterSidebarOpen}
            onClose={() => setIsMonsterSidebarOpen(false)}
            onAddMonster={(template, count) => {
              monsterSidebarOnAddRef.current?.(template, count);
              setIsMonsterSidebarOpen(false);
            }}
            className="!top-14 !h-[calc(100dvh-3.5rem)] !max-h-[calc(100dvh-3.5rem)]"
          />
        </>
      )}
    >
      <div className="relative min-h-[calc(100dvh-3.5rem)] w-full">

        <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-4 px-4 py-4 md:gap-6 xl:px-8 xl:py-6">
          <div className="w-full flex flex-col gap-4 md:gap-6">
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
                      <Heading level={2} variant="sectionDisplay">
                        <button
                          type="button"
                          onClick={() => setIsRenamingSession(true)}
                          className="cursor-text text-left transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-wfrp-gold/50"
                          aria-label="Rename session"
                        >
                          {editingSessionName || "Untitled Session"}
                        </button>
                      </Heading>
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
                            <div className="flex flex-wrap gap-2">
                              <Button
                                variant="secondary"
                                onClick={() => addComponentToScene(scene.id, "text")}
                              >
                                Text field
                              </Button>
                              <Button
                                variant="secondary"
                                onClick={() => addComponentToScene(scene.id, "encounter")}
                              >
                                Encounter
                              </Button>
                            </div>
                          </div>

                          <SceneComponentsList
                            sceneId={scene.id}
                            sceneNumber={sceneIndex + 1}
                            components={scene.components}
                            characters={characters}
                            onReorderComponents={(components) => updateSceneComponents(scene.id, components)}
                            onRemoveComponent={(componentId) => removeComponentFromScene(scene.id, componentId)}
                            onUpdateComponentText={(componentId, text) => updateComponentText(scene.id, componentId, text)}
                            onUpdateComponentTitle={(componentId, title) => updateComponentTitle(scene.id, componentId, title)}
                            onUpdateComponentEncounterData={(componentId, data) => updateComponentEncounterData(scene.id, componentId, data)}
                            onOpenMonsterSidebar={openMonsterSidebar}
                          />
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
