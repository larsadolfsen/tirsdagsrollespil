# CLAUDE.md

## Projekt

**Tirsdagsrollespil** er et Vite/React-værktøj til at køre WFRP 4E karakter- og kampagne-workflows. Se [README.md](README.md) for produktions- og Railway-opsætning.

## Udviklingskommandoer

```sh
npm run dev          # Start lokal dev-server (http://localhost:5173)
npm run lint         # TypeScript-check + typografitjek
npm run build        # Produktionsbuild
npm test             # Kør Playwright-testsuiten
npm run test:headed  # Playwright med synlige browsere
npm run test:ui      # Playwright UI-tilstand
npm run security:audit  # NPM-sikkerhedsaudit
```

Playwright starter dev-serveren automatisk. Første gang på en ny maskine:

```sh
npx playwright install
```

## Arkitektur

- **Framework**: React 19 + Vite 8, TypeScript, Tailwind CSS v4
- **Server**: Express (`server.mjs`) med SQLite til karakterdata (`data/tirsdagsrollespil.sqlite`)
- **Deploy**: Railway – se [README.md](README.md)

### Mappestruktur

```
src/
  components/ui/      # Fælles UI-komponenter (shadcn-lignende)
  components/wfrp/    # App-specifikke WFRP-wrappers
  components/         # Sidekomponenter og feature-komponenter
  context/            # React contexts (GameSessionContext)
  data/               # Karakterkataloger, adversaries, kampagner
  features/           # Feature-moduler (f.eks. dice)
  hooks/              # Custom React hooks
  tabs/               # Tab-indhold (inventory, spells, talents, …)
  lib/                # Pure utility-funktioner
```

## Vigtige regler

Den fulde liste over designregler, komponentkonventioner, testpolitik og git-regler ligger i [`.agents/AGENTS.md`](.agents/AGENTS.md). Læs den, før du foretager ændringer.

Opsummering af de vigtigste punkter:

- **Typografi**: Brug `<Heading>` og `<Text>` fra `src/components/ui/` – aldrig rå HTML-tags (`<h1>–<h6>`, `<p>` med inline farvestile).
- **Farver**: Brug semantiske Tailwind-tokens (`bg-background`, `text-foreground`, `text-wfrp-gold` osv.) – aldrig hårdkodede hex/RGB.
- **Komponenter**: Brug altid komponenter fra `src/components/ui/` fremfor rå HTML-elementer.
- **Ingen runtime-data i Git**: Filer under `data/` må aldrig committes (blokeret af `.githooks`).
- **Test**: Kør `npm run lint && npm run build && npm test` før du afleverer.

## Datamodel – adversaries

Tre faste katalogtyper: **NPC** (navngivet), **Generic** (unavngiven stat block), **Creature** (trait-baseret). `Adversary` er kun et UI-begreb, ikke en datatype.
