// Builds the talent-effect matching context for a roll (used by useDiceRoller's
// handleRoll). Exposes: buildTalentRollContext. A skill roll supplies skillIds; a
// raw characteristic roll supplies the characteristic key so characteristic-gated
// effects (e.g. Strong Back) can match — pure function, no partial context possible.
// Deps: toCharacteristicKey (characteristicKeys), TalentEffectContext (talentEffects).
import type { Characteristic } from "../../types";
import type { RollTestType } from "../../types/dice";
import { toCharacteristicKey } from "../../lib/characteristicKeys";
import type { TalentEffectContext } from "../../lib/talentEffects";

export function buildTalentRollContext(char: Characteristic, testType: RollTestType): TalentEffectContext {
  const testName = testType === "corruption" ? "Corruption Test" : char.label;

  if (char.skillId) {
    return {
      testName,
      testType,
      skillIds: [{ skillId: char.skillId, specialisationId: char.specialisationId }],
    };
  }

  const key = toCharacteristicKey(char.key);
  return {
    testName,
    testType,
    ...(key ? { characteristics: [key] } : {}),
  };
}
