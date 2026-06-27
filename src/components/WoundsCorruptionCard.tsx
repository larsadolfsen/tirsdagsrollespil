import { useMemo } from "react";
import { HeaderResourceSlider } from "./ui";
import { useGameSessionContext } from "../context/GameSessionContext";
import type { Characteristic } from "../types";

type ResourceAdjuster = (delta: number) => void;
type CorruptionCheckSkillName = "Cool" | "Endurance";

type WoundsCorruptionCardProps = {
  corruptionCurrent: number;
  corruptionMax: number;
  onAdjustCorruption: ResourceAdjuster;
  onAdjustWounds: ResourceAdjuster;
  onOpenRoll?: (characteristic: { key: Characteristic["key"]; label: string }) => void;
  woundsCurrent: number;
  woundsMax: number;
};

const sliderContentClassName = "flex min-w-0 flex-1 flex-col gap-1";
const corruptionCheckSkillNames = ["Cool", "Endurance"] as const satisfies readonly CorruptionCheckSkillName[];

const clickSharedSkillRoll = (skillName: CorruptionCheckSkillName) => {
  const rollButton = [...document.querySelectorAll<HTMLButtonElement>("button")]
    .find((button) => button.getAttribute("aria-label") === `Roll for ${skillName}`);

  if (rollButton) {
    rollButton.click();
    return;
  }

  const skillsTabButton = [...document.querySelectorAll<HTMLButtonElement>("button")]
    .find((button) => button.textContent?.trim() === "Skills");

  if (!skillsTabButton) {
    return;
  }

  skillsTabButton.click();
  window.setTimeout(() => {
    [...document.querySelectorAll<HTMLButtonElement>("button")]
      .find((button) => button.getAttribute("aria-label") === `Roll for ${skillName}`)
      ?.click();
  }, 0);
};

export function WoundsCorruptionCard({
  corruptionCurrent,
  corruptionMax,
  onAdjustCorruption,
  onAdjustWounds,
  onOpenRoll,
  woundsCurrent,
  woundsMax,
}: WoundsCorruptionCardProps) {
  const { characterData, characterSkills } = useGameSessionContext();
  const corruptionCheckSkills = useMemo(() => {
    return corruptionCheckSkillNames.map((skillName) => {
      const skill = characterSkills.find((entry) => entry.baseName === skillName);
      const characteristic = (skill?.characteristic ?? (skillName === "Cool" ? "WP" : "T")) as Characteristic["key"];
      const characteristicValue = Number(characterData.attributes[characteristic] ?? 0);
      const advances = skill?.advances ?? 0;
      const target = characteristicValue + advances;

      return {
        skillName,
        characteristic,
        target,
      };
    });
  }, [characterData.attributes, characterSkills]);

  const openCorruptionCheck = ({
    skillName,
    characteristic,
  }: {
    skillName: CorruptionCheckSkillName;
    characteristic: Characteristic["key"];
  }) => {
    if (onOpenRoll) {
      onOpenRoll({ key: characteristic, label: skillName });
      return;
    }

    clickSharedSkillRoll(skillName);
  };

  return (
    <section className="wfrp-card overflow-hidden p-0!">
      <div className="wfrp-card-tab-header">
        <h3 className="wfrp-panel-title">WOUNDS & CORRUPTION</h3>
      </div>
      <div className="wfrp-card-tab-body px-4 py-4">
        <div className="grid grid-cols-1 gap-3">
          <HeaderResourceSlider
            label="Wounds"
            current={woundsCurrent}
            max={woundsMax}
            onAdjust={onAdjustWounds}
            barClassName="bg-wfrp-red"
            contentClassName={sliderContentClassName}
          />
          <HeaderResourceSlider
            label="Corruption"
            current={corruptionCurrent}
            max={corruptionMax}
            onAdjust={onAdjustCorruption}
            barClassName="bg-purple-600"
            contentClassName={sliderContentClassName}
          />
          <div className="px-1 pt-1">
            <div className="mb-2 text-center text-[8px] font-semibold uppercase tracking-[0.18em] text-wfrp-muted-text">
              Corruption Check
            </div>
            <div className="grid grid-cols-2 gap-8">
              {corruptionCheckSkills.map((skill, index) => {
                const isLeftSkill = index === 0;

                return (
                  <div
                    key={skill.skillName}
                    className={`grid min-w-0 items-center gap-1.5 sm:gap-2 ${
                      isLeftSkill
                        ? "grid-cols-[minmax(0,1fr)_32px] justify-items-end sm:grid-cols-[minmax(0,1fr)_40px]"
                        : "grid-cols-[32px_minmax(0,1fr)] justify-items-start sm:grid-cols-[40px_minmax(0,1fr)]"
                    }`}
                  >
                    {isLeftSkill && (
                      <button
                        type="button"
                        onClick={() => openCorruptionCheck(skill)}
                        className="wfrp-skill-link min-w-0 truncate text-right!"
                      >
                        {skill.skillName}
                      </button>
                    )}
                    <div className="flex justify-center">
                      <button
                        type="button"
                        onClick={() => openCorruptionCheck(skill)}
                        className="wfrp-roll-btn"
                        aria-label={`Open ${skill.skillName} corruption check`}
                      >
                        {skill.target}
                      </button>
                    </div>
                    {!isLeftSkill && (
                      <button
                        type="button"
                        onClick={() => openCorruptionCheck(skill)}
                        className="wfrp-skill-link min-w-0 truncate text-left!"
                      >
                        {skill.skillName}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
