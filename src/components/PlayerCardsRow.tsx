import { SectionHeading } from "./ui/SectionHeading";
import { WfrpPlayerCard } from "./wfrp/WfrpPlayerCard";
import type { CharacterSummary } from "../data/repository";

type PlayerCardsRowProps = {
  characters: CharacterSummary[];
};

export function PlayerCardsRow({ characters }: PlayerCardsRowProps) {
  return (
    <section
      className="grid w-full grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4 mb-4 select-none"
      aria-labelledby="player-characters-heading"
    >
      <div className="col-span-full w-full">
        <SectionHeading id="player-characters-heading">
          Characters
        </SectionHeading>
      </div>
      {characters.map((character) => (
        <div key={character.id} className="min-w-0 w-full">
          <WfrpPlayerCard characterSummary={character} />
        </div>
      ))}
    </section>
  );
}
