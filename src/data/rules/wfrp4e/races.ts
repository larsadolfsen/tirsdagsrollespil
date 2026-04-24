import type { RaceDefinition } from "../../../types";

export const raceDefinitions: RaceDefinition[] = [
  {
    id: "human",
    name: "Human",
    attributeRolls: {
      WS: "2d10+20",
      BS: "2d10+20",
      S: "2d10+20",
      T: "2d10+20",
      I: "2d10+20",
      Ag: "2d10+20",
      Dex: "2d10+20",
      Int: "2d10+20",
      WP: "2d10+20",
      Fel: "2d10+20",
    },
    woundsFormula: "SB+(2 x TB)+WPB",
    fate: 2,
    resilience: 1,
    extraPoints: 3,
    movement: 4,
  },
  {
    id: "dwarf",
    name: "Dwarf",
    attributeRolls: {
      WS: "2d10+30",
      BS: "2d10+20",
      S: "2d10+20",
      T: "2d10+30",
      I: "2d10+20",
      Ag: "2d10+10",
      Dex: "2d10+30",
      Int: "2d10+20",
      WP: "2d10+40",
      Fel: "2d10+10",
    },
    woundsFormula: "SB+(2 x TB)+WPB",
    fate: 0,
    resilience: 2,
    extraPoints: 2,
    movement: 3,
  },
  {
    id: "halfling",
    name: "Halfling",
    attributeRolls: {
      WS: "2d10+10",
      BS: "2d10+30",
      S: "2d10+10",
      T: "2d10+20",
      I: "2d10+20",
      Ag: "2d10+20",
      Dex: "2d10+30",
      Int: "2d10+20",
      WP: "2d10+30",
      Fel: "2d10+30",
    },
    woundsFormula: "(2 x TB)+WPB",
    fate: 0,
    resilience: 2,
    extraPoints: 3,
    movement: 3,
  },
  {
    id: "elf",
    name: "Elf",
    attributeRolls: {
      WS: "2d10+30",
      BS: "2d10+30",
      S: "2d10+20",
      T: "2d10+20",
      I: "2d10+40",
      Ag: "2d10+30",
      Dex: "2d10+30",
      Int: "2d10+30",
      WP: "2d10+30",
      Fel: "2d10+20",
    },
    woundsFormula: "SB+(2 x TB)+WPB",
    fate: 0,
    resilience: 0,
    extraPoints: 2,
    movement: 5,
  },
];

export function findRaceDefinition(race: string) {
  const normalizedRace = race.toLowerCase();

  return raceDefinitions.find((entry) => normalizedRace.includes(entry.id)) ?? null;
}
