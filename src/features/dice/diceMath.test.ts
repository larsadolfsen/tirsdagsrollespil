import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { ResolvedCharacterRecord, ResolvedCharacterSkill } from "../../data/characters/resolved";
import type { RollState } from "../../types/dice";
import {
  calculateRollResult,
  createInitialRollState,
  createRollHistoryItem,
  getHitLocation,
  getRollBaseValue,
  getRollTarget,
} from "./diceMath";

const characterData = {
  attributes: {
    WS: 36,
    AG: 42,
  },
} as unknown as ResolvedCharacterRecord;

const characterSkills = [
  {
    displayName: "Melee (Basic)",
    advances: 7,
  },
] as unknown as ResolvedCharacterSkill[];

describe("diceMath", () => {
  it("calculates roll base values from characteristics, skills, and overrides", () => {
    assert.equal(
      getRollBaseValue(characterData, characterSkills, { characteristic: { key: "WS", label: "Weapon Skill" } }),
      36,
    );
    assert.equal(
      getRollBaseValue(characterData, characterSkills, { characteristic: { key: "WS", label: "Melee (Basic)" } }),
      43,
    );
    assert.equal(
      getRollBaseValue(characterData, characterSkills, {
        baseValueOverride: 0,
        characteristic: { key: "WS", label: "Critical" },
      }),
      0,
    );
  });

  it("adds modifiers and target bonus sources to roll targets", () => {
    assert.equal(
      getRollTarget(characterData, characterSkills, {
        characteristic: { key: "AG", label: "Agility" },
        modifier: -10,
        targetBonusSources: [{ label: "Assistance", value: 20 }],
      }),
      52,
    );
  });

  it("normalizes d100 rolls and applies automatic success, automatic failure, and SL bonuses", () => {
    assert.deepEqual(calculateRollResult({ bonusSources: [], roll: 0, target: 110 }), {
      finalRoll: 100,
      isSuccess: false,
      rawSl: 1,
      sl: 1,
    });

    assert.deepEqual(calculateRollResult({ bonusSources: [], roll: 4, target: 1 }), {
      finalRoll: 4,
      isSuccess: true,
      rawSl: 0,
      sl: 0,
    });

    assert.deepEqual(
      calculateRollResult({ bonusSources: [{ label: "Talent", value: 2 }], roll: 51, target: 39 }),
      {
        finalRoll: 51,
        isSuccess: true,
        rawSl: -2,
        sl: 0,
      },
    );
  });

  it("creates archived history with derived target, damage, location, and critical values", () => {
    const state: RollState = {
      ...createInitialRollState(),
      characteristic: { key: "WS", label: "Melee (Basic)" },
      damageBase: 4,
      isSuccess: true,
      modifier: 10,
      result: 33,
      sl: 2,
      targetBonusSources: [{ label: "Outnumbering", value: 20 }],
      testType: "attack",
      title: "Sword",
    };

    const historyItem = createRollHistoryItem({
      getTarget: (rollState) => getRollTarget(characterData, characterSkills, rollState),
      labelSuffix: " (Original)",
      state,
    });

    assert.ok(historyItem);
    assert.equal(historyItem.label, "Melee (Basic) (Original)");
    assert.equal(historyItem.title, "Sword (Original)");
    assert.equal(historyItem.target, 73);
    assert.equal(historyItem.damage, 6);
    assert.equal(historyItem.hitLocation, getHitLocation(33));
    assert.equal(historyItem.isCritical, true);
  });
});
