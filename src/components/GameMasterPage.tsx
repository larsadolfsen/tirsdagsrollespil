import { useEffect, useRef, useState } from "react";
import {
  Calendar,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  EllipsisVertical,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Trash2,
} from "lucide-react";
import type { CharacterSummary } from "../data/repository";
import type { EncounterData, EncounterMonsterGroup, GMScene, GMSession } from "../data/gmSessions";
import {
  availableScenarioImports,
  type ScenarioSessionImportDefinition,
} from "../data/scenarios";
import { AppShell } from "./AppShell";
import { SceneActionsMenu } from "./SceneActionsMenu";
import { AppSidebar, SidebarItemList, MonsterSidebar, NpcSidebar } from "./sidebar";
import type { CreatureTemplate } from "../data/rules/wfrp4e";
import { expandNpcTemplate, isNamedNpc, npcTemplatesById, type NpcTemplate } from "../data/npcs";
import {
  Breadcrumbs,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Heading,
  Separator,
  type BreadcrumbItem,
} from "./ui";
import { SheetEmptyState } from "./wfrp";
import { FormattedTextField } from "./FormattedTextField";
import { SceneComponentsList, EncounterComponent, type SceneComponent } from "./SceneComponentsList";
import { AdversaryEditorPage } from "./adversaryEditor";

type GameMasterPageProps = {
  activeSession: GMSession | null;
  breadcrumbs: BreadcrumbItem[];
  campaignName: string;
  characters: CharacterSummary[];
  editingSessionName: string;
  isLoadingSessions: boolean;
  isSessionsSidebarOpen: boolean;
  onCreateSession: () => void;
  onDeleteSession: (sessionId: string) => void;
  onImportScenario: (scenario: ScenarioSessionImportDefinition) => Promise<void>;
  onScenesChange?: (scenes: GMScene[]) => void;
  onSelectSession: (sessionId: string) => void;
  onUpdateComponentEncounterData?: (sceneId: string, componentId: string, data: EncounterData) => void;
  onSessionsSidebarOpenChange: (isOpen: boolean) => void;
  onUpdateSession: (field: "name" | "notes", value: string) => void;
  selectedSessionId: string | null;
  sessions: GMSession[];
};

export function createSceneComponent(
  type: "text" | "notes" | "encounter",
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
  components: SceneComponent[] = [createSceneComponent("notes")],
): GMScene {
  return {
    id: `scene-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    components,
  };
}

function createNpcEncounterGroup(npc: NpcTemplate, count: number): EncounterMonsterGroup {
  return {
    id: `npc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    templateId: npc.id,
    name: npc.name,
    count,
    wounds: Array(count).fill(npc.statBlock.W),
    source: "npc",
  };
}

function getSceneNpcIds(scene: GMScene): string[] {
  return [...new Set((scene.links?.npcs ?? []).flatMap((npcId) => {
    const npc = npcTemplatesById[npcId];
    return isNamedNpc(npc) ? expandNpcTemplate(npc).map((member) => member.id) : [];
  }))];
}

function buildSceneNpcEncounterData(scenes: GMScene[]): EncounterData {
  const npcIds = [...new Set(scenes.flatMap(getSceneNpcIds))];
  return {
    monsterGroups: npcIds.flatMap((npcId) => {
      const npc = npcTemplatesById[npcId];
      return npc ? [createNpcEncounterGroup(npc, 1)] : [];
    }),
    playerOrder: [],
  };
}

function GameMasterHeader({
  campaignName,
  isSessionsSidebarOpen,
  onToggleSessions,
}: {
  campaignName: string;
  isSessionsSidebarOpen: boolean;
  onToggleSessions: () => void;
}) {
  return (
    <section
      aria-label="Campaign header"
      className="sticky top-0 z-[60] h-14 w-full border-b border-t-4 border-wfrp-border border-t-wfrp-red bg-sidebar py-1 shadow-lg shadow-black/20"
    >
      <div className="flex h-full max-h-12 items-center px-3 md:px-4">
        <Button
          variant="wfrpIcon"
          onClick={onToggleSessions}
          aria-label={isSessionsSidebarOpen ? "Close sessions menu" : "Open sessions menu"}
          aria-expanded={isSessionsSidebarOpen}
          title={isSessionsSidebarOpen ? "Close sessions menu" : "Open sessions menu"}
          leadingIcon={isSessionsSidebarOpen ? <PanelLeftClose /> : <PanelLeftOpen />}
        />
        <div
          role="group"
          aria-label="Campaign identity"
          className="ml-3 min-w-0 flex-1 flex flex-col justify-center"
        >
          <span className="block truncate text-left font-serif text-base font-semibold leading-tight tracking-tight text-gray-100 sm:text-xl">
            {campaignName}
          </span>
          <span className="block truncate text-[9px] font-semibold uppercase text-wfrp-muted-text sm:text-[10px]">
            Campaign View
          </span>
        </div>
      </div>
    </section>
  );
}

export function GameMasterPage({
  activeSession,
  breadcrumbs,
  campaignName,
  characters,
  editingSessionName,
  isLoadingSessions,
  isSessionsSidebarOpen,
  onCreateSession,
  onDeleteSession,
  onImportScenario,
  onScenesChange,
  onSelectSession,
  onSessionsSidebarOpenChange,
  onUpdateSession,
  onUpdateComponentEncounterData,
  selectedSessionId,
  sessions,
}: GameMasterPageProps) {
  const [isRenamingSession, setIsRenamingSession] = useState(false);
  const [isScenarioDialogOpen, setIsScenarioDialogOpen] = useState(false);
  const [importingScenarioId, setImportingScenarioId] = useState<string | null>(null);
  const [sessionTitleDraft, setSessionTitleDraft] = useState(editingSessionName);
  const [initialScene] = useState(() => createScene());
  const [scenes, setScenes] = useState<GMScene[]>(() => [initialScene]);
  const onScenesChangeRef = useRef(onScenesChange);
  useEffect(() => { onScenesChangeRef.current = onScenesChange; });

  const [editingSceneTitleId, setEditingSceneTitleId] = useState<string | null>(null);
  const [sceneTitleDraft, setSceneTitleDraft] = useState("");
  const [editingSceneLocationId, setEditingSceneLocationId] = useState<string | null>(null);
  const [sceneLocationDraft, setSceneLocationDraft] = useState("");
  const [expandedScenes, setExpandedScenes] = useState<Set<string>>(() => new Set([initialScene.id]));

  const toggleSceneCollapsed = (sceneId: string) => {
    setExpandedScenes((prev) => {
      const next = new Set(prev);
      if (next.has(sceneId)) next.delete(sceneId);
      else next.add(sceneId);
      return next;
    });
  };

  const [isAdversaryEditorOpen, setIsAdversaryEditorOpen] = useState(false);
  const [isMonsterSidebarOpen, setIsMonsterSidebarOpen] = useState(false);
  const monsterSidebarOnAddRef = useRef<((template: CreatureTemplate, count: number) => void) | null>(null);

  const openMonsterSidebar = (onAdd: (template: CreatureTemplate, count: number) => void) => {
    monsterSidebarOnAddRef.current = onAdd;
    setIsMonsterSidebarOpen(true);
  };

  const [isNpcSidebarOpen, setIsNpcSidebarOpen] = useState(false);
  const [activeNpcSceneId, setActiveNpcSceneId] = useState<string | null>(null);
  const [isCharactersCollapsed, setIsCharactersCollapsed] = useState(false);
  const [isNpcsCollapsed, setIsNpcsCollapsed] = useState(true);

  const [topEncounterData, setTopEncounterData] = useState<EncounterData>({ monsterGroups: [], playerOrder: [] });
  const [hiddenCharacterIds, setHiddenCharacterIds] = useState<Set<string>>(new Set());

  const toggleCharacterVisibility = (characterId: string) => {
    setHiddenCharacterIds((prev) => {
      const next = new Set(prev);
      if (next.has(characterId)) next.delete(characterId);
      else next.add(characterId);
      return next;
    });
  };

  const visibleCharacters = characters.filter((c) => !hiddenCharacterIds.has(c.id));

  const [npcEncounterData, setNpcEncounterData] = useState<EncounterData>({ monsterGroups: [], playerOrder: [] });

  const handleAddNpc = (npc: NpcTemplate, _count: number) => {
    const npcGroups = expandNpcTemplate(npc).map((member) => createNpcEncounterGroup(member, 1));
    setNpcEncounterData((prev) => ({
      ...prev,
      monsterGroups: [...prev.monsterGroups, ...npcGroups],
    }));
  };

  const addNpcToScene = (sceneId: string, npc: NpcTemplate) => {
    const members = expandNpcTemplate(npc);
    const memberIds = members.map((member) => member.id);

    setScenes((currentScenes) => currentScenes.map((scene) => {
      if (scene.id !== sceneId || memberIds.every((memberId) => getSceneNpcIds(scene).includes(memberId))) {
        return scene;
      }

      const linkedNpcIds = (scene.links?.npcs ?? []).filter((linkedNpcId) => linkedNpcId !== npc.id);
      return {
        ...scene,
        links: {
          ...scene.links,
          npcs: [...linkedNpcIds, ...memberIds.filter((memberId) => !linkedNpcIds.includes(memberId))],
        },
      };
    }));
    setNpcEncounterData((currentData) => {
      const newGroups = members
        .filter((member) => !currentData.monsterGroups.some(
          (group) => group.source === "npc" && group.templateId === member.id,
        ))
        .map((member) => createNpcEncounterGroup(member, 1));
      if (newGroups.length === 0) {
        return currentData;
      }

      return {
        ...currentData,
        monsterGroups: [...currentData.monsterGroups, ...newGroups],
      };
    });
  };

  const removeNpcFromScene = (sceneId: string, npc: NpcTemplate) => {
    const npcIds = new Set([npc.id, ...expandNpcTemplate(npc).map((member) => member.id)]);
    setScenes((currentScenes) => currentScenes.map((scene) => {
      if (scene.id !== sceneId) {
        return scene;
      }

      return {
        ...scene,
        links: {
          ...scene.links,
          npcs: (scene.links?.npcs ?? []).filter((linkedNpcId) => !npcIds.has(linkedNpcId)),
        },
      };
    }));
  };

  useEffect(() => {
    const loaded = activeSession?.scenes;
    const isNewSession = !loaded || loaded.length === 0;
    const initial = loaded && loaded.length > 0 ? loaded : [createScene()];
    setIsRenamingSession(false);
    setSessionTitleDraft(editingSessionName);
    setScenes(initial);
    setEditingSceneTitleId(null);
    setEditingSceneLocationId(null);
    setActiveNpcSceneId(null);
    setNpcEncounterData(buildSceneNpcEncounterData(initial));
    if (isNewSession) {
      setExpandedScenes(new Set(initial.map((s) => s.id)));
    } else {
      setExpandedScenes(new Set());
    }
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
    const newScene = createScene();
    setScenes((currentScenes) => {
      const nextScenes = [...currentScenes];
      nextScenes.splice(sceneIndex + (placement === "after" ? 1 : 0), 0, newScene);
      return nextScenes;
    });
    setExpandedScenes((prev) => {
      const next = new Set(prev);
      next.add(newScene.id);
      return next;
    });
  };

  const handleAddFirstScene = () => {
    const newScene = createScene();
    setScenes([newScene]);
    setExpandedScenes(new Set([newScene.id]));
  };

  const copyScene = (sceneIndex: number) => {
    setScenes((currentScenes) => {
      const sourceScene = currentScenes[sceneIndex];
      if (!sourceScene) {
        return currentScenes;
      }

      const nextScenes = [...currentScenes];
      const copiedComponents = sourceScene.components.map((component) => ({
        ...component,
        id: `comp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        encounterData: component.encounterData
          ? {
              ...component.encounterData,
              monsterGroups: component.encounterData.monsterGroups.map((group) => ({
                ...group,
                wounds: [...group.wounds],
              })),
              playerOrder: [...component.encounterData.playerOrder],
              manualOrder: component.encounterData.manualOrder
                ? [...component.encounterData.manualOrder]
                : undefined,
            }
          : undefined,
      }));
      nextScenes.splice(
        sceneIndex + 1,
        0,
        {
          ...sourceScene,
          id: `scene-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          links: sourceScene.links
            ? {
                ...sourceScene.links,
                npcs: sourceScene.links.npcs ? [...sourceScene.links.npcs] : undefined,
                locations: sourceScene.links.locations ? [...sourceScene.links.locations] : undefined,
              }
            : undefined,
          components: copiedComponents,
        },
      );
      return nextScenes;
    });
  };

  const importScenario = async (scenario: ScenarioSessionImportDefinition) => {
    setImportingScenarioId(scenario.id);
    try {
      await onImportScenario(scenario);
      setIsScenarioDialogOpen(false);
    } finally {
      setImportingScenarioId(null);
    }
  };

  const deleteScene = (sceneId: string) => {
    setScenes((currentScenes) => currentScenes.filter((scene) => scene.id !== sceneId));
  };

  const updateSceneComponents = (sceneId: string, components: SceneComponent[]) => {
    setScenes((currentScenes) => currentScenes.map((scene) => (
      scene.id === sceneId ? { ...scene, components } : scene
    )));
  };

  const updateSceneTitle = (sceneId: string, title: string) => {
    setScenes((currentScenes) => currentScenes.map((scene) => (
      scene.id === sceneId ? { ...scene, title } : scene
    )));
  };

  const updateSceneLocation = (sceneId: string, location: string) => {
    setScenes((currentScenes) => currentScenes.map((scene) => (
      scene.id === sceneId ? { ...scene, location } : scene
    )));
  };

  const addComponentToScene = (sceneId: string, type: "text" | "notes" | "encounter") => {
    setScenes((currentScenes) => currentScenes.map((scene) => {
      if (scene.id === sceneId) {
        return {
          ...scene,
          components: [...scene.components, createSceneComponent(type)],
        };
      }
      return scene;
    }));
    setExpandedScenes((prev) => {
      const next = new Set(prev);
      next.add(sceneId);
      return next;
    });
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

  const updateComponentType = (sceneId: string, componentId: string, type: "text" | "notes") => {
    setScenes((currentScenes) => currentScenes.map((scene) => {
      if (scene.id === sceneId) {
        return {
          ...scene,
          components: scene.components.map((comp) => (
            comp.id === componentId ? { ...comp, type } : comp
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

  const activeNpcScene = activeNpcSceneId
    ? scenes.find((scene) => scene.id === activeNpcSceneId) ?? null
    : null;

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
        <div className="grid w-full grid-cols-2 gap-2">
          <Button
            variant="secondary"
            onClick={() => setIsScenarioDialogOpen(true)}
            className="justify-center"
          >
            Import scenario
          </Button>
          <Button
            variant="secondary"
            onClick={onCreateSession}
            className="justify-center"
          >
            Create session
          </Button>
        </div>
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
          campaignName={campaignName}
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
          <NpcSidebar
            isOpen={isNpcSidebarOpen}
            onClose={() => {
              setIsNpcSidebarOpen(false);
              setActiveNpcSceneId(null);
            }}
            title={activeNpcScene ? "Add NPC to Scene" : "Add NPC"}
            sceneNpcIds={activeNpcScene ? getSceneNpcIds(activeNpcScene) : []}
            sessionNpcIds={npcEncounterData.monsterGroups
              .filter((group) => group.source === "npc")
              .map((group) => group.templateId)}
            showActiveFilters={Boolean(activeNpcScene)}
            onAddNpc={(npc, count) => {
              if (activeNpcScene) {
                addNpcToScene(activeNpcScene.id, npc);
              } else {
                handleAddNpc(npc, count);
                setIsNpcSidebarOpen(false);
              }
            }}
            onRemoveNpc={(npc) => {
              if (activeNpcScene) {
                removeNpcFromScene(activeNpcScene.id, npc);
              }
            }}
            className="!top-14 !h-[calc(100dvh-3.5rem)] !max-h-[calc(100dvh-3.5rem)]"
          />
          {import.meta.env.DEV ? (
            <AdversaryEditorPage
              isOpen={isAdversaryEditorOpen}
              onClose={() => setIsAdversaryEditorOpen(false)}
            />
          ) : null}
          <Dialog open={isScenarioDialogOpen} onOpenChange={setIsScenarioDialogOpen}>
            <DialogContent className="max-h-[calc(100dvh-2rem)] max-w-2xl overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Import scenario</DialogTitle>
                <DialogDescription>
                  Create a new session from a prepared scenario. Your current session will not be changed.
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-3">
                {availableScenarioImports.map((scenario) => (
                  <article
                    key={scenario.id}
                    className="rounded border border-wfrp-border bg-wfrp-dark/35 p-4"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <Heading level={3} variant="component">{scenario.title}</Heading>
                        <p className="mt-1 text-xs text-wfrp-gold">{scenario.source.book}</p>
                        <p className="mt-3 text-sm leading-relaxed text-wfrp-muted-text">
                          {scenario.summary}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {scenario.tags.map((tag) => (
                            <span
                              key={tag}
                              className="rounded border border-wfrp-border px-2 py-1 text-[10px] uppercase tracking-wide text-gray-300"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      <Button
                        variant="default"
                        disabled={importingScenarioId !== null}
                        onClick={() => void importScenario(scenario)}
                        className="shrink-0"
                      >
                        {importingScenarioId === scenario.id ? "Importing…" : "Import"}
                      </Button>
                    </div>
                  </article>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        </>
      )}
    >
      <div className="relative min-h-[calc(100dvh-3.5rem)] w-full">

        <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-4 px-4 py-4 md:gap-6 xl:px-8 xl:py-6">
          <div className="w-full flex flex-col gap-4 md:gap-6">
            <div className="flex items-center justify-between gap-4">
              <Breadcrumbs items={breadcrumbs} />
              {import.meta.env.DEV ? (
                <Button
                  variant="secondary"
                  autoHeight
                  name="Adversary Editor"
                  onClick={() => setIsAdversaryEditorOpen(true)}
                />
              ) : null}
            </div>

            {activeSession ? (
              <>
                <div>
                  <span className="wfrp-label block text-wfrp-muted-text">
                    Session {activeSession.sessionNumber + 1}
                  </span>
                  {isRenamingSession ? (
                    <Heading level={1} variant="sectionDisplay">
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
                    </Heading>
                  ) : (
                    <Heading level={1} variant="sectionDisplay">
                      <button
                        type="button"
                        onClick={() => setIsRenamingSession(true)}
                        className="cursor-text text-left transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-wfrp-gold/50"
                        aria-label="Rename session"
                      >
                        {editingSessionName || "Untitled Session"}
                      </button>
                    </Heading>
                  )}
                  <div className="mt-2 mb-6 max-w-3xl">
                    <FormattedTextField
                      ariaLabel="Session description"
                      value={activeSession.notes || ""}
                      onChange={(value) => onUpdateSession("notes", value)}
                      placeholder="Add a session description…"
                    />
                  </div>
                </div>

                <section aria-labelledby="characters-heading" className="group/section">
                  <Separator className="mb-8" />
                  <div
                    className="flex min-h-12 cursor-pointer items-center justify-between gap-4"
                    onClick={() => setIsCharactersCollapsed((prev) => !prev)}
                  >
                    <Heading level={2} variant="subsection" id="characters-heading">
                      Characters
                    </Heading>
                    <button
                      type="button"
                      onClick={() => setIsCharactersCollapsed((prev) => !prev)}
                      aria-label={isCharactersCollapsed ? "Expand characters" : "Collapse characters"}
                      aria-expanded={!isCharactersCollapsed}
                      className="shrink-0 text-wfrp-muted-text transition-colors hover:text-white focus-visible:outline-none"
                    >
                      {isCharactersCollapsed ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                  </div>
                  {!isCharactersCollapsed && (
                    <EncounterComponent
                      encounterData={topEncounterData}
                      characters={characters}
                      onUpdateEncounterData={setTopEncounterData}
                      onOpenMonsterSidebar={openMonsterSidebar}
                      hiddenCharacterIds={hiddenCharacterIds}
                      onToggleCharacterVisibility={toggleCharacterVisibility}
                    />
                  )}
                </section>

                <section aria-labelledby="npcs-heading" className="group/section">
                  <Separator className="my-8" />
                  <div
                    className="flex min-h-12 cursor-pointer items-center justify-between gap-4"
                    onClick={() => setIsNpcsCollapsed((prev) => !prev)}
                  >
                    <Heading level={2} variant="subsection" id="npcs-heading">
                      NPCs
                    </Heading>
                    <div className="flex shrink-0 items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="wfrpIcon"
                        leadingIcon={<Plus />}
                        aria-label="Add NPC"
                        title="Add NPC"
                        onClick={() => {
                          setActiveNpcSceneId(null);
                          setIsNpcSidebarOpen(true);
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setIsNpcsCollapsed((prev) => !prev)}
                        aria-label={isNpcsCollapsed ? "Expand NPCs" : "Collapse NPCs"}
                        aria-expanded={!isNpcsCollapsed}
                        className="shrink-0 text-wfrp-muted-text transition-colors hover:text-white focus-visible:outline-none"
                      >
                        {isNpcsCollapsed ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </button>
                    </div>
                  </div>
                  {!isNpcsCollapsed && (
                    <EncounterComponent
                      encounterData={npcEncounterData}
                      characters={[]}
                      onUpdateEncounterData={setNpcEncounterData}
                      onOpenMonsterSidebar={openMonsterSidebar}
                    />
                  )}
                </section>

                <section className="flex min-h-[450px] flex-1 flex-col">
                  <Separator className="my-8" />
                  <Heading level={2} variant="subsection">Scenes</Heading>
                  {scenes.length > 0 ? (
                    <div className="flex flex-col">
                      {scenes.map((scene, sceneIndex) => {
                        const isCollapsed = !expandedScenes.has(scene.id);
                        return (
                        <section key={scene.id} className="group/scene">
                          <Separator className="my-8" />
                          <span className="wfrp-label block text-wfrp-muted-text">{`Scene ${sceneIndex + 1}`}</span>
                          <div className="flex min-h-12 cursor-pointer items-center justify-between gap-4" onClick={() => toggleSceneCollapsed(scene.id)}>
                            <div className="min-w-0 flex-1 flex items-start gap-2">
                            <div className="min-w-0 flex-1">
                               {editingSceneTitleId === scene.id ? (
                                 <Heading level={3} variant="subsection">
                                   <input
                                     type="text"
                                     value={sceneTitleDraft}
                                     onClick={(e) => e.stopPropagation()}
                                     onChange={(e) => setSceneTitleDraft(e.target.value)}
                                     onBlur={() => {
                                       updateSceneTitle(scene.id, sceneTitleDraft.trim());
                                       setEditingSceneTitleId(null);
                                     }}
                                     onKeyDown={(e) => {
                                       if (e.key === "Enter") {
                                         updateSceneTitle(scene.id, sceneTitleDraft.trim());
                                         setEditingSceneTitleId(null);
                                       } else if (e.key === "Escape") {
                                         setEditingSceneTitleId(null);
                                       }
                                     }}
                                     autoFocus
                                     className="w-full max-w-md border-0 border-b border-wfrp-gold/50 bg-transparent p-0 font-serif text-lg font-semibold text-gray-200 outline-none"
                                   />
                                 </Heading>
                               ) : (
                                 <Heading level={3} variant="subsection"><span onClick={(e) => { e.stopPropagation(); setSceneTitleDraft(scene.title || ""); setEditingSceneTitleId(scene.id); }} className="cursor-text border-b border-dashed border-transparent hover:border-wfrp-muted-text/50 hover:text-white transition-colors">{scene.title || "Scene"}</span></Heading>
                               )}
                              <div className="mt-1 flex items-center gap-1.5 text-sm text-wfrp-muted-text font-sans">
                                <span>Location:</span>
                                {editingSceneLocationId === scene.id ? (
                                  <input
                                    type="text"
                                    value={sceneLocationDraft}
                                    onClick={(e) => e.stopPropagation()}
                                    onChange={(e) => setSceneLocationDraft(e.target.value)}
                                    onBlur={() => {
                                      updateSceneLocation(scene.id, sceneLocationDraft.trim());
                                      setEditingSceneLocationId(null);
                                    }}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") {
                                        updateSceneLocation(scene.id, sceneLocationDraft.trim());
                                        setEditingSceneLocationId(null);
                                      } else if (e.key === "Escape") {
                                        setEditingSceneLocationId(null);
                                      }
                                    }}
                                    autoFocus
                                    className="border-0 border-b border-wfrp-gold/50 bg-transparent p-0 text-sm text-gray-200 outline-none w-48"
                                  />
                                ) : (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSceneLocationDraft(scene.location || "");
                                      setEditingSceneLocationId(scene.id);
                                    }}
                                    className="cursor-text text-left text-gray-300 transition-colors hover:text-white border-b border-dashed border-transparent hover:border-wfrp-muted-text/50 focus-visible:outline-none"
                                  >
                                    {scene.location || "Click to add location"}
                                  </button>
                                )}
                              </div>
                              <div className="mt-1 flex items-start gap-1.5 text-sm text-wfrp-muted-text font-sans">
                                <span>NPCs:</span>
                                <button
                                  type="button"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    setActiveNpcSceneId(scene.id);
                                    setIsNpcSidebarOpen(true);
                                  }}
                                  className="min-w-0 text-left text-gray-300 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-wfrp-gold/50"
                                >
                                  {getSceneNpcIds(scene).length > 0
                                    ? getSceneNpcIds(scene)
                                        .map((npcId) => npcTemplatesById[npcId]?.name ?? npcId)
                                        .join(", ")
                                    : "Click to add NPCs"}
                                </button>
                              </div>
                            </div>
                            </div>
                            <div className="flex shrink-0 items-center gap-1 opacity-0 group-hover/scene:opacity-100 focus-within:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                              <SceneActionsMenu
                                sceneNumber={sceneIndex + 1}
                                onAddBefore={() => addScene(sceneIndex, "before")}
                                onAddAfter={() => addScene(sceneIndex, "after")}
                                onCopy={() => copyScene(sceneIndex)}
                                onDelete={() => deleteScene(scene.id)}
                                onAddDescription={() => addComponentToScene(scene.id, "text")}
                                onAddNotes={() => addComponentToScene(scene.id, "notes")}
                                onAddEncounter={() => addComponentToScene(scene.id, "encounter")}
                              />
                              <button
                                type="button"
                                onClick={() => toggleSceneCollapsed(scene.id)}
                                aria-label={isCollapsed ? "Expand scene" : "Collapse scene"}
                                aria-expanded={!isCollapsed}
                                className="shrink-0 text-wfrp-muted-text transition-colors hover:text-white focus-visible:outline-none"
                              >
                                {isCollapsed ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                              </button>
                            </div>
                          </div>

                          {!isCollapsed && (
                            <SceneComponentsList
                              sceneId={scene.id}
                              sceneNumber={sceneIndex + 1}
                              components={scene.components}
                              characters={visibleCharacters}
                              onReorderComponents={(components) => updateSceneComponents(scene.id, components)}
                              onRemoveComponent={(componentId) => removeComponentFromScene(scene.id, componentId)}
                              onUpdateComponentText={(componentId, text) => updateComponentText(scene.id, componentId, text)}
                              onUpdateComponentTitle={(componentId, title) => updateComponentTitle(scene.id, componentId, title)}
                              onUpdateComponentType={(componentId, type) => updateComponentType(scene.id, componentId, type)}
                              onUpdateComponentEncounterData={(componentId, data) => updateComponentEncounterData(scene.id, componentId, data)}
                              onAddComponent={(type) => addComponentToScene(scene.id, type)}
                              onOpenMonsterSidebar={openMonsterSidebar}
                              sceneNpcIds={getSceneNpcIds(scene)}
                            />
                          )}
                        </section>
                        );
                      })}
                    </div>
                  ) : (
                    <Button
                      variant="secondary"
                      onClick={handleAddFirstScene}
                      leadingIcon={<Plus />}
                      className="mt-4"
                    >
                      Add scene
                    </Button>
                  )}
                </section>
              </>
            ) : (
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <Heading level={1} variant="sectionDisplay">
                      Campaign Sessions
                    </Heading>
                    <p className="mt-1 text-sm text-wfrp-muted-text">
                      Create sessions to organize your campaign notes, scenes, and encounters.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="secondary"
                      onClick={() => setIsScenarioDialogOpen(true)}
                    >
                      Import scenario
                    </Button>
                    <Button
                      variant="default"
                      isGolden
                      onClick={onCreateSession}
                    >
                      Create session
                    </Button>
                  </div>
                </div>

                {sessions.length > 0 ? (
                  <div className="flex flex-col gap-8">
                    {sessions.map((session, index) => (
                      <div key={session.id} className="flex flex-col">
                        {index > 0 && <Separator className="mb-8" />}
                        <section>
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex min-w-0 flex-col gap-3">
                              <div className="min-w-0 max-w-[440px]">
                                <span className="wfrp-label block text-wfrp-muted-text mb-1">
                                  Session {session.sessionNumber + 1}
                                </span>
                                <Heading level={3} variant="sectionDisplay">
                                  {session.name || "Untitled Session"}
                                </Heading>
                                {session.notes && (
                                  <div className="mt-1 pl-1">
                                    <div
                                      className="wfrp-text text-sm text-wfrp-muted-text/80 line-clamp-3 font-sans [&_b]:font-semibold [&_i]:italic [&_strong]:font-semibold [&_ul]:list-disc [&_ul]:pl-4"
                                      dangerouslySetInnerHTML={{ __html: session.notes }}
                                    />
                                  </div>
                                )}
                              </div>
                              <Button
                                variant="secondary"
                                onClick={() => onSelectSession(session.id)}
                                className="justify-center self-start"
                              >
                                Open
                              </Button>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger
                                aria-label={`Session ${session.sessionNumber + 1} menu`}
                                title={`Session ${session.sessionNumber + 1} menu`}
                                className="wfrp-standard-icon cursor-pointer"
                              >
                                <span className="wfrp-standard-icon__glyph" aria-hidden="true">
                                  <EllipsisVertical />
                                </span>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => onDeleteSession(session.id)}
                                  className="text-red-400 focus:text-red-400"
                                >
                                  <Trash2 className="mr-2 size-4" aria-hidden="true" />
                                  Delete session
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </section>
                      </div>
                    ))}
                  </div>
                ) : (
                  <SheetEmptyState title="No sessions" className="min-h-[300px]">
                    Create the first session or import a scenario to start planning campaign notes.
                  </SheetEmptyState>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
