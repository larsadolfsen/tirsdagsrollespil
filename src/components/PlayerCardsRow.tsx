import type { CharacterSummary } from "../data/repository";
import { SectionHeading } from "./ui";
import { WfrpPlayerCard } from "./wfrp";

type PlayerCardsRowProps = {
  characters: CharacterSummary[];
};

export function PlayerCardsRow({ characters }: PlayerCardsRowProps) {
  return (
    <section
      className="flex flex-wrap gap-4 w-full mb-4 select-none"
      aria-labelledby="player-characters-heading"
    >
      <div className="w-full">
        <SectionHeading id="player-characters-heading">
          Characters
        </SectionHeading>
      </div>
      {characters.map((character) => (
        <div key={character.id} className="w-full max-w-[288px]">
          <WfrpPlayerCard characterSummary={character} className="max-w-[288px]" />
        </div>
      ))}
    </section>
  );
}

