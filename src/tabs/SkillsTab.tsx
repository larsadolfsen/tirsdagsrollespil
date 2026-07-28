import { Button, InlineSubtabs, SubtabContentFrame } from "../components/ui";
import {
  SheetDataAccordionDetails,
  SheetDataAccordionRow,
  SheetDataDisclosureCell,
  SheetDataRollCell,
  SheetDataSection,
} from "../components/wfrp";
import type { ResolvedCharacterTalent } from "../data/characters/resolved";
import { formatTalentEffect } from "../lib/talentEffects";
import { talentsAffectingSkillAmong } from "../lib/skillTalentIndex";
import type { Characteristic } from "../types";
import type { SkillSubtab } from "./tabTypes";

function getTalentRuleText(talent: ResolvedCharacterTalent): string {
  return talent.effects?.length
    ? talent.effects.map(formatTalentEffect).join("; ")
    : talent.description;
}

type SkillRow = {
  key: string;
  displayName: string;
  characteristic: string;
  advances: number;
  shortDescription?: string;
  description?: string;
  specialization?: string;
  skillId?: string;
  specialisationId?: string;
};

const desktopSkillGridClass = "md:grid-cols-[56px_minmax(10rem,0.8fr)_minmax(14rem,1.2fr)_56px_56px_56px_56px_48px]";
const mobileSkillGridClass = "grid-cols-[40px_minmax(0,1fr)_40px_48px]";
const characteristicNames: Record<string, string> = {
  Ag: "Agility",
  BS: "Ballistic Skill",
  Dex: "Dexterity",
  Fel: "Fellowship",
  I: "Initiative",
  Int: "Intelligence",
  S: "Strength",
  T: "Toughness",
  WP: "Will Power",
  WS: "Weapon Skill",
};

export function SkillsTab({
  activeSkillSubtab,
  setActiveSkillSubtab,
  visibleSkillRows,
  attributes,
  handleRoll,
  onOpenAdvance,
  onNavigateToTalent,
  characterTalents,
}: {
  activeSkillSubtab: SkillSubtab;
  setActiveSkillSubtab: (subtab: SkillSubtab) => void;
  visibleSkillRows: SkillRow[];
  attributes: Record<string, number>;
  handleRoll: (characteristic: Characteristic) => void;
  onOpenAdvance: () => void;
  openSkillInfo?: (skillName: string) => void;
  onNavigateToTalent: (talentId: string) => void;
  characterTalents: ResolvedCharacterTalent[];
}) {
  const uniqueCharacterTalents = Array.from(
    new Map(characterTalents.map((talent) => [talent.id, talent])).values(),
  );
  return (
    <SubtabContentFrame
      contentClassName="max-xl:pb-24"
      subtabBar={(
        <div className="flex w-full items-center gap-2">
          <div className="min-w-0 flex-1">
            <InlineSubtabs<SkillSubtab>
              options={[
                { id: "all", label: "All" },
                { id: "advanced", label: "Advanced" },
                { id: "basic", label: "Basic" },
              ]}
              activeId={activeSkillSubtab}
              onChange={setActiveSkillSubtab}
            />
          </div>
          <Button
            variant="secondary"
            onClick={onOpenAdvance}
            name="Add Skill"
            hideOnMobile
            aria-label="Open skill sidebar"
            className="mr-2 sm:mr-3 lg:mr-4"
          />
        </div>
      )}
    >
      <SheetDataSection
        gridClassName={`${mobileSkillGridClass} ${desktopSkillGridClass}`}
        leadingLabels={[{ align: "center", label: "Roll" }]}
        sectionLabel="Skill"
        valueLabels={[
          { align: "left", className: "hidden md:block", label: "Short" },
          { align: "center", label: "Char." },
          { align: "right", className: "hidden md:block", label: "Score" },
          { align: "right", className: "hidden md:block", label: "Adv." },
          { align: "right", className: "hidden md:block", label: "Total" },
          { align: "center", label: "More" },
        ]}
      >
          {visibleSkillRows.map((skill) => {
            const charValue = attributes[skill.characteristic] || 0;
            const totalValue = charValue + skill.advances;
            const formattedAdvances = skill.advances === 0 ? "-" : `+${skill.advances}`;
            const affectingTalents = skill.skillId
              ? talentsAffectingSkillAmong(skill.skillId, uniqueCharacterTalents)
              : [];

            return (
              <SheetDataAccordionRow
                key={skill.key}
                summaryClassName={`${mobileSkillGridClass} md:grid ${desktopSkillGridClass} md:gap-0`}
                summary={(
                  <>
                    <SheetDataRollCell>
                      <button
                        onClick={(event) => {
                          event.preventDefault();
                          handleRoll({ key: skill.characteristic, label: skill.displayName, skillId: skill.skillId, specialisationId: skill.specialisationId });
                        }}
                        className="wfrp-roll-btn"
                        aria-label={`Roll for ${skill.displayName}`}
                      >
                        {totalValue}
                      </button>
                    </SheetDataRollCell>

                    <span className="wfrp-list-cell-strong min-w-0 truncate text-left text-gray-200">
                      {skill.displayName}
                    </span>

                    <span className="hidden min-w-0 truncate text-left wfrp-text-strong leading-tight text-wfrp-muted-text md:block">
                      {skill.shortDescription ?? "-"}
                    </span>

                    <div className="wfrp-list-cell-strong text-center font-mono">
                      {skill.characteristic}
                    </div>

                    <div className="hidden wfrp-list-cell-strong text-right font-mono md:block">
                      {charValue}
                    </div>

                    <div className="hidden wfrp-list-cell-strong text-right font-mono md:block">
                      {formattedAdvances}
                    </div>

                    <div className="hidden wfrp-list-cell-strong text-right font-mono md:block">
                      {totalValue}
                    </div>

                    <SheetDataDisclosureCell />
                  </>
                )}
              >
                <SheetDataAccordionDetails
                  description={skill.description}
                  rows={[
                    { label: "Characteristic", value: characteristicNames[skill.characteristic] ?? skill.characteristic, valueClassName: "!text-left" },
                    ...(skill.specialization ? [{ label: "Specialization", value: skill.specialization, valueClassName: "!text-left" }] : []),
                    { label: "Score", value: charValue, valueClassName: "!text-left" },
                    { label: "Advances", value: formattedAdvances, valueClassName: "!text-left" },
                    ...(affectingTalents.length > 0
                      ? [{
                          label: "Affecting Talents",
                          value: (
                            <div className="flex flex-col gap-2">
                              {affectingTalents.map((talent) => (
                                <div key={talent.id} className="flex flex-col gap-0.5">
                                  <Button variant="unstyled"
                                    type="button"
                                    onClick={() => onNavigateToTalent(talent.id)}
                                    className="wfrp-skill-link self-start"
                                    aria-label={`View ${talent.name} talent`}
                                    name={talent.name}
                                  />
                                  <span className="text-left wfrp-text-strong leading-tight text-wfrp-muted-text">
                                    {getTalentRuleText(talent)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ),
                        }]
                      : []),
                  ]}
                />
              </SheetDataAccordionRow>
            );
          })}
      </SheetDataSection>
    </SubtabContentFrame>
  );
}
