# Character builder flow

Character builderen er et separat oprettelsesflow. Den er ikke det samme som karakterarket.

## Princip

```text
Character Builder = opretter og validerer karakteren
Character Sheet = viser og bruger den færdige karakter
```

Builderen skal hjælpe spilleren igennem character creation. Når karakteren er færdig, genererer builderen en character record, som derefter vises i karakterarket.

## Separation mellem builder og karakterark

### Character Builder

Bruges kun til at oprette eller redigere en ufærdig karakter.

Ansvar:

- guide spilleren trin for trin
- holde styr på character creation-valg
- beregne XP-bonusser fra tilfældige valg
- validere at påkrævede valg er lavet
- gemme karakteren som draft
- færdiggøre karakteren som ready

Builderen må gerne have midlertidige data, som ikke skal vises på karakterarket bagefter.

Eksempler:

- hvilke random rolls der blev slået
- om spilleren accepterede et random species-resultat
- hvilke career-options der blev rullet
- hvilke steps der er completed
- valideringsfejl

### Character Sheet

Bruges efter character creation.

Ansvar:

- vise den færdige karakter
- bruges under spil
- vise attributes, skills, talents, trappings og XP
- håndtere advancement efter karakteren er færdig
- vise noter, wounds, conditions og lignende spiltilstand

Karakterarket skal ikke vise builderens trin, random-valg eller wizard-navigation.

## Flow

```text
Ny karakter
→ Åbn Character Builder
→ Udfyld trin
→ Review
→ Færdiggør
→ Opret Character Sheet
→ Åbn karakterarket
```

## Builder steps

```text
1. Species
2. Class and Career
3. Attributes
4. Skills and Talents
5. Trappings
6. Adding Detail
7. Ambitions
8. Party
9. Ten Questions
10. Review
11. Finish
```

Advancement hører ikke til builderen. Det hører til karakterarket efter karakteren er færdig.

## Builder state

Builderen bør have sin egen state.

```ts
type CharacterBuilderState = {
  id: string
  characterId?: string
  status: "draft" | "completed" | "abandoned"
  currentStep: BuilderStep
  completedSteps: BuilderStep[]

  speciesSelection?: {
    method: "random-kept" | "manual"
    rolledValue?: number
    selectedSpecies?: Species
    xpBonus: number
  }

  careerSelection?: {
    method: "random-kept" | "random-picked-from-three" | "manual"
    rolledOptions: string[]
    selectedClass?: string
    selectedCareer?: string
    xpBonus: number
  }

  attributeGeneration?: {
    method: "rolled-in-order" | "rolled-rearranged" | "manual"
    rolls: number[]
    xpBonus: number
  }

  validation: {
    missingFields: string[]
    warnings: string[]
  }
}
```

## Character data

Den færdige character record skal kun indeholde data, der bruges i spillet.

```ts
type Character = {
  id: string
  status: "ready" | "approved" | "retired"

  species: Species
  className: string
  career: string
  careerLevel: number

  characteristics: Record<CharacteristicKey, CharacteristicValue>
  derived: DerivedValues
  skills: Record<string, SkillValue>
  talents: Talent[]
  trappings: Trapping[]
  details: CharacterDetails
  ambitions: Ambition[]
  party?: CharacterParty
  backgroundQuestions?: BackgroundQuestions

  xp: {
    total: number
    spent: number
    available: number
    log: XpLogEntry[]
  }
}
```

## Finish step

Når builderen afsluttes:

1. valider alle påkrævede felter
2. beregn final XP fra creation bonuses
3. opret eller opdater Character
4. sæt builder status til `completed`
5. sæt character status til `ready`
6. navigér brugeren til karakterarket

```ts
function finishBuilder(builder: CharacterBuilderState): Character {
  // Validate required builder data
  // Convert builder selections into permanent character data
  // Apply creation XP bonuses
  // Return ready character
}
```

## Navigation

Forslag til routes:

```text
/characters/new              → starter ny builder
/character-builder/:id       → builder wizard
/characters/:id              → karakterark
/characters/:id/advancement  → XP og advancement
```

## UI-regel

Builderen og karakterarket må gerne bruge samme underliggende data, men de skal ikke være samme skærm.

```text
Builder: trin, valg, validering, oprettelse
Sheet: spilvisning, hurtig reference, advancement
```

## Minimum v1

Byg builderen først med disse trin:

```text
Species
→ Class and Career
→ Attributes
→ Skills and Talents
→ Trappings
→ Details
→ Review
→ Finish
```

Når brugeren trykker `Finish`, oprettes karakterarket.
