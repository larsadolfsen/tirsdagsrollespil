import type {
  ResolvedCharacterEquipment,
  ResolvedCharacterRecord,
  ResolvedCharacterSkill,
} from "../../data/characters/resolved";
import { getWeaponStats } from "../../lib/gameSession";
import type { RulesIndex } from "../../lib/gameSession";
import type { Characteristic } from "../../types";
import type { ActionCategory } from "../tabTypes";

export type RollBonusSource = {
  label: string;
  value: number;
};

export type CombatAction = {
  id?: string;
  name: string;
  char: Characteristic["key"];
  totalValue: number;
  modifier: number;
  targetBonusSources?: RollBonusSource[];
  rollDamage?: number;
  damage: string;
  range: string;
  properties: string[];
  bonuses?: RollBonusSource[];
  note?: string;
};

export type ChannelingActionRow = {
  action: Pick<CombatAction, "char" | "name" | "properties">;
  mobileDetails: Array<{ label: string; value: string }>;
  totalValue: number;
};

export type ActionRangeBands = {
  pb: number;
  s: number;
  a: number;
  l: number;
  e: number;
};

export type WeaponActionRow = {
  action: CombatAction;
  mobileDetails: Array<{ label: string; value: string }>;
  totalActionValue: number;
};

export type WeaponActionPanel = {
  actions: WeaponActionRow[];
  isMelee: boolean;
  rangeBands: ActionRangeBands | null;
  rollLabel: string;
  weapon: ResolvedCharacterEquipment;
  weaponStats: ReturnType<typeof getWeaponStats>;
};

export type ManeuverActionRow = {
  action: CombatAction;
  finalDamage: string;
  mobileDetails: Array<{ label: string; value: string }>;
  rollDamage?: number;
  totalActionValue: number;
};

const offensiveProperties = ["Damaging", "Hack", "Impact", "Impale", "Precise", "Pummel", "Trap-blade", "Wrap"];
const defensiveProperties = ["Defensive", "Shield"];

const getRelevantWeaponProperties = (actionId: string, properties: string[]) => {
  if (actionId === "attack" || actionId === "charge") {
    return properties.filter((property) => offensiveProperties.includes(property));
  }

  if (actionId === "parry" || actionId === "defend") {
    return properties.filter(
      (property) =>
        defensiveProperties.includes(property) ||
        property.startsWith("Shield "),
    );
  }

  return [];
};

const getWeaponDamage = (damage: string, strengthBonus: number) => {
  const damageBonus = parseInt(damage.replace("+SB+", "")) || 0;
  return strengthBonus + (
    damage.includes("+SB")
      ? (damageBonus || (damage === "+SB" ? 0 : parseInt(damage.replace("+SB", "")) || 0))
      : parseInt(damage) || 0
  );
};

const maneuverActions = [
  { name: "Move", char: "Ag" as Characteristic["key"], range: "move", properties: [], modifier: 0, damage: "-", type: "other" },
  { name: "Defend", char: "WS" as Characteristic["key"], range: "-", properties: [], modifier: 0, targetBonusSources: [{ label: "Defense", value: 20 }], damage: "-", type: "other" },
  { name: "Disengage", char: "Ag" as Characteristic["key"], range: "-", properties: ["Retreat"], modifier: 0, damage: "-", type: "other" },
  { name: "Grapple", char: "WS" as Characteristic["key"], range: "Reach", properties: ["Stun"], modifier: 0, damage: "SB", type: "melee" },
];

export function useActionsViewModel({
  activeActionCategory,
  characterData,
  characterSkills,
  equipmentState,
  getCharacteristicLabel,
  getTargetBonusTotal,
  rulesIndex,
}: {
  activeActionCategory: ActionCategory;
  characterData: ResolvedCharacterRecord;
  characterSkills: ResolvedCharacterSkill[];
  equipmentState: ResolvedCharacterEquipment[];
  getCharacteristicLabel: (key: Characteristic["key"]) => string;
  getTargetBonusTotal: (targetBonusSources: RollBonusSource[]) => number;
  rulesIndex: RulesIndex;
}) {
  const attributes = characterData.attributes;
  const baseWp = attributes.WP || 0;
  const channellingSkill = characterSkills.find((skill) => skill.baseName === "Channelling");
  const totalChannelingValue = channellingSkill ? baseWp + channellingSkill.advances : baseWp;
  const channelingRow: ChannelingActionRow | null = characterData.spells.length > 0 && (activeActionCategory === "all" || activeActionCategory === "other")
    ? {
        action: {
          name: "Language (Magick)",
          char: "WP",
          properties: ["Spellcasting"],
        },
        mobileDetails: [
          { label: "Type", value: "Channeling" },
          { label: "Notes", value: "Spell Focus" },
        ],
        totalValue: totalChannelingValue,
      }
    : null;

  const strengthBonus = Math.floor((attributes.S || 0) / 10);

  const weaponRows: WeaponActionPanel[] = equipmentState
    .filter((item) => item.type.includes("Weapon") && !item.containerId)
    .filter((item) => {
      if (activeActionCategory === "all") return true;
      if (activeActionCategory === "melee") return item.type.includes("Melee");
      if (activeActionCategory === "ranged") return item.type.includes("Ranged");
      return false;
    })
    .map((weapon) => {
      const isMelee = weapon.type.includes("Melee");
      const char: Characteristic["key"] = isMelee ? "WS" : "BS";
      const specificSkill = characterSkills.find((skill) => skill.displayName.includes(weapon.name));
      const basicSkill = characterSkills.find((skill) =>
        skill.displayName === (isMelee ? "Melee (Basic)" : "Ranged (Basic)"));
      const skillToUse = specificSkill || basicSkill;
      const rollLabel = skillToUse?.displayName ?? getCharacteristicLabel(char);
      const baseValue = attributes[char] || 0;
      const totalSkillValue = skillToUse ? baseValue + skillToUse.advances : baseValue;
      const weaponStats = getWeaponStats(weapon, rulesIndex);
      const weaponDamage = getWeaponDamage(weaponStats.damage, strengthBonus);

      const actions: CombatAction[] = isMelee ? [
        {
          id: "attack",
          name: "Attack",
          char,
          totalValue: totalSkillValue,
          modifier: 0,
          rollDamage: weaponDamage,
          damage: `+${weaponDamage}`,
          range: weaponStats.reach,
          properties: getRelevantWeaponProperties("attack", weaponStats.properties),
        },
        {
          id: "charge",
          name: "Charge",
          char,
          totalValue: totalSkillValue,
          modifier: 0,
          rollDamage: weaponDamage,
          damage: `+${weaponDamage}`,
          range: weaponStats.reach,
          properties: getRelevantWeaponProperties("charge", weaponStats.properties),
          note: "+1 Advantage if Charge conditions are met",
        },
        {
          id: "parry",
          name: "Parry",
          char,
          totalValue: totalSkillValue,
          modifier: 0,
          rollDamage: undefined,
          damage: "-",
          range: weaponStats.reach,
          properties: getRelevantWeaponProperties("parry", weaponStats.properties),
          bonuses: weaponStats.properties.includes("Defensive")
            ? [{ label: "Defensive", value: 1 }]
            : undefined,
        },
        {
          id: "defend",
          name: "Defend",
          char,
          totalValue: totalSkillValue,
          modifier: 0,
          targetBonusSources: [{ label: "Defense", value: 20 }],
          rollDamage: undefined,
          damage: "-",
          range: "-",
          properties: getRelevantWeaponProperties("defend", weaponStats.properties),
          bonuses: weaponStats.properties.includes("Defensive")
            ? [{ label: "Defensive", value: 1 }]
            : undefined,
        },
      ] : [
        {
          id: "attack",
          name: "Attack",
          char,
          totalValue: totalSkillValue,
          modifier: 0,
          rollDamage: weaponDamage,
          damage: `+${weaponDamage}`,
          range: weaponStats.reach,
          properties: getRelevantWeaponProperties("attack", weaponStats.properties),
        },
      ];

      const rangeValue = parseInt(weaponStats.reach);
      const rangeBands = !isMelee && !isNaN(rangeValue) ? {
        pb: Math.floor(rangeValue / 10),
        s: Math.floor(rangeValue / 2),
        a: rangeValue,
        l: rangeValue * 2,
        e: rangeValue * 3,
      } : null;

      return {
        actions: actions.map((action) => ({
          action,
          mobileDetails: isMelee
            ? [
                { label: "Weapon", value: weapon.name },
                { label: "Dmg", value: action.damage },
                { label: "Reach", value: action.range },
                { label: "Properties", value: action.properties.length ? action.properties.join(", ") : "-" },
              ]
            : [
                { label: "Weapon", value: weapon.name },
                { label: "Dmg", value: action.damage },
                { label: "Range", value: weaponStats.reach },
                { label: "Bands", value: `PB ${rangeBands?.pb ?? "-"} / S ${rangeBands?.s ?? "-"} / A ${rangeBands?.a ?? "-"} / L ${rangeBands?.l ?? "-"} / E ${rangeBands?.e ?? "-"}` },
                { label: "Properties", value: action.properties.length ? action.properties.join(", ") : "-" },
              ],
          totalActionValue: action.totalValue + action.modifier + getTargetBonusTotal(action.targetBonusSources ?? []),
        })),
        isMelee,
        rangeBands,
        rollLabel,
        weapon,
        weaponStats,
      };
    });

  const maneuverRows: ManeuverActionRow[] = maneuverActions
    .filter((action) => activeActionCategory === "all" || action.type === activeActionCategory)
    .map((action) => {
      const baseValue = attributes[action.char] || 0;
      const skill = characterSkills.find((entry) => entry.displayName.includes(action.name));
      const totalValue = skill ? baseValue + skill.advances : baseValue;
      const finalDamage = action.damage === "SB" ? `+${strengthBonus}` : action.damage;
      const combatAction: CombatAction = {
        ...action,
        damage: finalDamage,
        range: action.range === "move" ? `${characterData.move}` : action.range,
        totalValue,
      };
      const totalActionValue = totalValue + action.modifier + getTargetBonusTotal(action.targetBonusSources ?? []);

      return {
        action: combatAction,
        finalDamage,
        mobileDetails: [
          { label: "Dmg", value: finalDamage },
          { label: "Reach", value: combatAction.range },
          { label: "Properties", value: combatAction.properties.length ? combatAction.properties.join(", ") : "-" },
        ],
        rollDamage: action.damage === "SB" ? strengthBonus : undefined,
        totalActionValue,
      };
    });

  return {
    channelingRow,
    maneuverRows,
    weaponRows,
  };
}
