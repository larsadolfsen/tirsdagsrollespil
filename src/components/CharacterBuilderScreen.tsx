import { useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button, Card, Input, Textarea } from "./ui";
import { UI_LABELS } from "../labels";
import type { Ruleset } from "../types";

type BuilderStepId =
  | "species"
  | "career"
  | "attributes"
  | "skills-talents"
  | "trappings"
  | "details"
  | "review"
  | "finish";

const builderSteps: Array<{ id: BuilderStepId; label: string; summary: string }> = [
  { id: "species", label: "Species", summary: "Choose or roll species and track any creation XP bonus." },
  { id: "career", label: "Class and Career", summary: "Pick the class, career path, and starting rank." },
  { id: "attributes", label: "Attributes", summary: "Generate characteristics and apply the chosen method." },
  { id: "skills-talents", label: "Skills and Talents", summary: "Select creation advances, talents, and required options." },
  { id: "trappings", label: "Trappings", summary: "Confirm starting equipment, coin, and containers." },
  { id: "details", label: "Details", summary: "Add appearance, background, ambitions, and party context." },
  { id: "review", label: "Review", summary: "Validate missing fields before creating the sheet." },
  { id: "finish", label: "Finish", summary: "Mark the builder complete and open the ready character sheet." },
];

export function CharacterBuilderScreen({
  ruleset,
  onClose,
  onFinish,
}: {
  ruleset: Ruleset;
  onClose: () => void;
  onFinish: () => void;
}) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [selectedSpeciesId, setSelectedSpeciesId] = useState(ruleset.races[0]?.id ?? "");
  const [selectedCareerId, setSelectedCareerId] = useState(ruleset.careers[0]?.id ?? "");
  const [characterName, setCharacterName] = useState("");
  const [ambition, setAmbition] = useState("");
  const [background, setBackground] = useState("");
  const currentStep = builderSteps[currentStepIndex];
  const selectedSpecies = ruleset.races.find((race) => race.id === selectedSpeciesId) ?? ruleset.races[0] ?? null;
  const selectedCareer = ruleset.careers.find((career) => career.id === selectedCareerId) ?? ruleset.careers[0] ?? null;
  const selectedCareerSkills = selectedCareer
    ? selectedCareer.skillIds
        .map((skillId) => ruleset.skills.find((skill) => skill.id === skillId)?.name)
        .filter((name): name is string => Boolean(name))
    : [];
  const selectedCareerTalents = selectedCareer
    ? selectedCareer.talentIds
        .map((talentId) => ruleset.talents.find((talent) => talent.id === talentId)?.name)
        .filter((name): name is string => Boolean(name))
    : [];
  const validationItems = [
    { label: "Species", isComplete: Boolean(selectedSpecies) },
    { label: "Career", isComplete: Boolean(selectedCareer) },
    { label: "Name", isComplete: characterName.trim().length > 0 },
    { label: "Background", isComplete: background.trim().length > 0 },
    { label: "Ambition", isComplete: ambition.trim().length > 0 },
  ];
  const missingItems = validationItems.filter((item) => !item.isComplete);
  const completedCount = currentStepIndex;
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === builderSteps.length - 1;

  const goToPreviousStep = () => {
    setCurrentStepIndex((current) => Math.max(0, current - 1));
  };

  const goToNextStep = () => {
    if (isLastStep) {
      onFinish();
      return;
    }

    setCurrentStepIndex((current) => Math.min(builderSteps.length - 1, current + 1));
  };

  const renderBuilderStep = () => {
    switch (currentStep.id) {
      case "species":
        return (
          <div className="grid gap-3 md:grid-cols-2">
            {ruleset.races.map((race) => (
              <button
                key={race.id}
                type="button"
                onClick={() => setSelectedSpeciesId(race.id)}
                className={`rounded border p-4 text-left transition-colors ${
                  race.id === selectedSpeciesId
                    ? "border-wfrp-gold bg-wfrp-gold-surface"
                    : "border-white/10 bg-black/20 hover:border-white/20"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="wfrp-panel-title text-gray-100">{race.name}</h3>
                  <span className="wfrp-table-label text-wfrp-gold">M {race.movement}</span>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-[11px] text-gray-300">
                  <span>Fate {race.fate}</span>
                  <span>Res {race.resilience}</span>
                  <span>Extra {race.extraPoints}</span>
                </div>
                <p className="mt-3 text-xs text-wfrp-muted-text">Wounds: {race.woundsFormula}</p>
              </button>
            ))}
          </div>
        );
      case "career":
        return (
          <div className="grid gap-4 lg:grid-cols-[minmax(220px,0.8fr)_minmax(0,1.2fr)]">
            <div className="flex flex-col gap-2">
              {ruleset.careers.map((career) => (
                <button
                  key={career.id}
                  type="button"
                  onClick={() => setSelectedCareerId(career.id)}
                  className={`rounded border px-3 py-2 text-left transition-colors ${
                    career.id === selectedCareerId
                      ? "border-wfrp-gold bg-wfrp-gold-surface text-wfrp-gold"
                      : "border-white/10 bg-black/20 text-gray-200 hover:border-white/20"
                  }`}
                >
                  <div className="text-sm font-bold">{career.name}</div>
                  <div className="wfrp-table-label text-wfrp-muted-text">{career.tier}</div>
                </button>
              ))}
            </div>
            {selectedCareer && (
              <div className="rounded border border-white/10 bg-black/20 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-bold font-serif">{selectedCareer.name}</h3>
                    <p className="wfrp-section-meta">{selectedCareer.tier}</p>
                  </div>
                  <span className="wfrp-table-label text-wfrp-gold">{selectedCareer.ranks[0]?.status}</span>
                </div>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="wfrp-panel-title text-wfrp-muted-text">Career Skills</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {selectedCareerSkills.map((skill) => (
                        <span key={skill} className="rounded border border-white/10 bg-black/30 px-2 py-1 text-xs text-gray-300">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="wfrp-panel-title text-wfrp-muted-text">Talent Options</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {selectedCareerTalents.map((talent) => (
                        <span key={talent} className="rounded border border-white/10 bg-black/30 px-2 py-1 text-xs text-gray-300">
                          {talent}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      case "attributes":
        return (
          <div className="rounded border border-white/10 bg-black/20 p-4">
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
              {UI_LABELS.CHARACTERISTICS.map((characteristic) => (
                <div key={characteristic.key} className="rounded border border-white/10 bg-black/25 p-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-wfrp-muted-text">{characteristic.label}</p>
                  <p className="mt-1 text-lg font-black text-wfrp-gold">
                    {selectedSpecies?.attributeRolls[characteristic.key] ?? "-"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        );
      case "skills-talents":
        return (
          <div className="grid gap-4 md:grid-cols-2">
            <section className="rounded border border-white/10 bg-black/20 p-4">
              <h3 className="wfrp-panel-title text-gray-300">Skill Choices</h3>
              <div className="mt-3 flex flex-col gap-2">
                {selectedCareerSkills.map((skill) => (
                  <div key={skill} className="flex items-center justify-between rounded border border-white/10 bg-black/25 px-3 py-2">
                    <span className="text-sm text-gray-200">{skill}</span>
                    <span className="wfrp-table-label text-wfrp-muted-text">Career</span>
                  </div>
                ))}
              </div>
            </section>
            <section className="rounded border border-white/10 bg-black/20 p-4">
              <h3 className="wfrp-panel-title text-gray-300">Talent Pool</h3>
              <div className="mt-3 flex flex-col gap-2">
                {selectedCareerTalents.map((talent) => (
                  <div key={talent} className="rounded border border-white/10 bg-black/25 px-3 py-2 text-sm text-gray-200">
                    {talent}
                  </div>
                ))}
              </div>
            </section>
          </div>
        );
      case "trappings":
        return (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {ruleset.items.slice(0, 12).map((item) => (
              <div key={item.id} className="rounded border border-white/10 bg-black/20 p-3">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-sm font-bold text-gray-100">{item.name}</h3>
                  <span className="wfrp-table-label text-wfrp-muted-text">{item.type}</span>
                </div>
                <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-wfrp-muted-text">{item.description}</p>
              </div>
            ))}
          </div>
        );
      case "details":
        return (
          <div className="grid gap-4">
            <label className="flex flex-col gap-2">
              <span className="wfrp-panel-title text-wfrp-muted-text">Name</span>
              <Input
                value={characterName}
                onChange={(event) => setCharacterName(event.target.value)}
                placeholder="Character name"
                aria-label="Character name"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="wfrp-panel-title text-wfrp-muted-text">Background</span>
              <Textarea
                value={background}
                onChange={(event) => setBackground(event.target.value)}
                className="min-h-28"
                placeholder="Origin, appearance, reputation, or notable history"
                aria-label="Character background"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="wfrp-panel-title text-wfrp-muted-text">Ambition</span>
              <Input
                value={ambition}
                onChange={(event) => setAmbition(event.target.value)}
                placeholder="Short-term or long-term ambition"
                aria-label="Character ambition"
              />
            </label>
          </div>
        );
      case "review":
        return (
          <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
            <section className="rounded border border-white/10 bg-black/20 p-4">
              <h3 className="wfrp-panel-title text-gray-300">Character Draft</h3>
              <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                <div><dt className="wfrp-table-label text-wfrp-muted-text">Name</dt><dd className="text-sm text-gray-100">{characterName || "Unnamed"}</dd></div>
                <div><dt className="wfrp-table-label text-wfrp-muted-text">Species</dt><dd className="text-sm text-gray-100">{selectedSpecies?.name ?? "-"}</dd></div>
                <div><dt className="wfrp-table-label text-wfrp-muted-text">Career</dt><dd className="text-sm text-gray-100">{selectedCareer?.name ?? "-"}</dd></div>
                <div><dt className="wfrp-table-label text-wfrp-muted-text">Tier</dt><dd className="text-sm text-gray-100">{selectedCareer?.tier ?? "-"}</dd></div>
              </dl>
            </section>
            <section className="rounded border border-white/10 bg-black/20 p-4">
              <h3 className="wfrp-panel-title text-gray-300">Validation</h3>
              <div className="mt-3 flex flex-col gap-2">
                {validationItems.map((item) => (
                  <div key={item.label} className="flex items-center justify-between rounded border border-white/10 bg-black/25 px-3 py-2">
                    <span className="text-sm text-gray-200">{item.label}</span>
                    <span className={item.isComplete ? "text-xs font-bold text-emerald-400" : "text-xs font-bold text-wfrp-red"}>
                      {item.isComplete ? "Ready" : "Missing"}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        );
      case "finish":
        return (
          <div className="rounded border border-white/10 bg-black/20 p-6 text-center">
            <h3 className="text-xl font-bold font-serif text-gray-100">
              {missingItems.length === 0 ? "Ready to Create Sheet" : "Draft Needs Review"}
            </h3>
            <p className="mt-3 text-sm text-wfrp-muted-text">
              {missingItems.length === 0
                ? `${characterName} is ready as a ${selectedSpecies?.name ?? "character"} ${selectedCareer?.tier ?? ""}.`
                : `${missingItems.length} required ${missingItems.length === 1 ? "field is" : "fields are"} still missing.`}
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-wfrp-dark font-sans selection:bg-wfrp-gold/40 flex flex-col">
      <div className="h-1 bg-wfrp-red w-full flex-shrink-0" />
      <main className="mx-auto flex w-full max-w-[1199px] flex-1 flex-col gap-4 p-4">
        <Card className="overflow-hidden p-0">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-wfrp-border px-4 py-3">
            <div>
              <p className="wfrp-sidebar-kicker">Character Builder</p>
              <h1 className="text-xl font-bold font-serif tracking-tight">New Character</h1>
            </div>
            <Button
              onClick={onClose}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 font-black tracking-[0.12em]"
            >
              <X size={14} />
              Sheet
            </Button>
          </div>

          <div className="grid gap-0 lg:grid-cols-[280px_minmax(0,1fr)]">
            <aside className="border-b border-wfrp-border bg-black/15 p-3 lg:border-b-0 lg:border-r">
              <div className="flex flex-col gap-1">
                {builderSteps.map((step, index) => {
                  const isActive = step.id === currentStep.id;
                  const isComplete = index < currentStepIndex;

                  return (
                    <button
                      key={step.id}
                      type="button"
                      onClick={() => setCurrentStepIndex(index)}
                      className={`flex items-center justify-between rounded px-3 py-2 text-left transition-colors ${
                        isActive
                          ? "bg-wfrp-gold-surface text-wfrp-gold"
                          : "text-gray-300 hover:bg-wfrp-surface-raised"
                      }`}
                    >
                      <span className="truncate text-[12px] font-bold">{step.label}</span>
                      <span className="ml-3 text-[10px] font-black text-wfrp-muted-text">
                        {isComplete ? "Done" : index + 1}
                      </span>
                    </button>
                  );
                })}
              </div>
            </aside>

            <section className="flex min-h-[520px] flex-col p-4">
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 pb-4">
                <div>
                  <p className="wfrp-section-meta">
                    Step {currentStepIndex + 1} of {builderSteps.length}
                  </p>
                  <h2 className="mt-1 text-2xl font-bold font-serif">{currentStep.label}</h2>
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-wfrp-muted-text">
                    {currentStep.summary}
                  </p>
                </div>
                <div className="min-w-36 text-right">
                  <p className="wfrp-sidebar-kicker">Progress</p>
                  <p className="text-lg font-black text-wfrp-gold">
                    {completedCount}/{builderSteps.length - 1}
                  </p>
                </div>
              </div>

              <div className="flex-1 py-6">
                {renderBuilderStep()}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
                <Button
                  onClick={goToPreviousStep}
                  disabled={isFirstStep}
                  variant="outline"
                  className="flex items-center gap-2 px-4 py-2 font-black tracking-[0.12em]"
                >
                  <ChevronLeft size={14} />
                  Back
                </Button>
                <Button
                  onClick={goToNextStep}
                  variant="outline"
                  className="flex items-center gap-2 px-4 py-2 font-black tracking-[0.12em] text-gray-100"
                >
                  {isLastStep ? "Finish" : "Next"}
                  {!isLastStep && <ChevronRight size={14} />}
                </Button>
              </div>
            </section>
          </div>
        </Card>
      </main>
    </div>
  );
}
