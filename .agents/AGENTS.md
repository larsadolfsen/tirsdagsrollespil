# Projektregler for Tirsdagsrollespil

Dette dokument definerer udviklingsregler, retningslinjer og arbejdsgange for **Tirsdagsrollespil**-projektet. Alle agenter og udviklere skal overholde disse regler.

## 1. Design og Styling-retningslinjer

- **Moderne Mørk/Guld/Pergament Estetik**: Designet er baseret på et stilrent, moderne mørkt tema med guld- og pergament-accenter:
  - **Baggrund**: Mørk grå (`#121212`).
  - **Overflader og kort**: Mørk koksgrå/charcoal (`#1E1E1E`) med fine mørkegrå kanter (`#303030`).
  - **Primær accent**: Elegant messing/guld (`#c5a059`) brugt til fokuserede elementer og aktive tilstande.
  - **Sekundær accent**: Creme/pergament (`#f4e4bc`) brugt til specifikke fremhævninger.
- **Typografi**:
  - **Overskrifter**: Bruger serif-skrifttypen **Libre Caslon Display** (defineret som `font-serif` / `font-display`).
  - **Labels og brødtekst**: Bruger sans-serif-skrifttypen **Source Sans 3** (defineret som `font-sans` / `font-body`).
- **Interaktive elementer**:
  - Knapper og ikoner har typisk runde former (`rounded-full` eller `rounded`).
  - Interaktive elementer skal have tydelige hover, focus-visible og aktive tilstande med bløde animationer (f.eks. mikro-skalering med `active:scale-95`).
- **Tokens**:
  - Brug semantiske tokens til farvevalg: `bg-background`, `text-foreground`, `bg-card`, `border-border`, `text-muted-foreground`, `bg-primary`, `text-primary-foreground`, `ring-ring`.
  - Brug kun WFRP-specifikke tokens til navngivne accenter: `text-wfrp-gold`, `bg-wfrp-gold-surface`, `border-wfrp-gold/40`, `bg-wfrp-surface-subtle`.
  - Undgå hårdkodede hex/RGB-værdier. Hvis en ny farve tilføjes til designsystemet, skal den tilføjes som token i `src/index.css`.
  - Udvid ikke legacy CSS til ny UI; foretræk altid Tailwind utilities og semantiske tokens.
  - **Undgå `!important`**: Brug aldrig Tailwinds `!`-modifier (f.eks. `!bg-red-500`) eller CSS `!important`. Hvis du har brug for at overstyre en komponents standardstile, skal du i stedet tilføje en prop til komponenten eller refaktorere den relevante CSS-klasse.

## 2. Kode- og Komponentstruktur

- **Brug fælles UI-komponenter**:
  - Brug altid fælles komponenter fra `src/components/ui/` fremfor rå HTML-elementer (f.eks. `Button`, `Card`, `Input`).
  - **Overskrifter**: Brug ALDRIG rå HTML heading-tags (`<h1>`-`<h6>`). Brug altid `<Heading>` komponenten fra `src/components/ui/Heading` eller `<SectionHeading>` fra `src/components/ui/SectionHeading`.
  - **Typografi-kontrol**: Typografikontrollen (`scripts/check-typography.mjs`) blokerer brug af rå headings og specifikke ulovlige farver på overskriftsvarianter (overskrifter må ikke have `text-wfrp-gold` direkte i variant-definitioner i `Heading.tsx`).
- **Komponent-hierarki**:
  - Fælles shadcn/ui-lignende komponenter placeres i `src/components/ui/`.
  - App-specifikke WFRP-wrappers (såsom `WfrpPanel`, `WfrpSection`, `WfrpStatusBadge`) placeres i `src/components/wfrp/`.
  - Brug kun Radix-primitiver direkte, hvis det fælles UI-lag ikke understøtter den nødvendige adfærd. Tilføj en kort kommentar, der forklarer hvorfor.
- **Hvornår komponenter skal oprettes**:
  - Opret nye, selvstændige komponenter, når det giver mening – hvilket specifikt vil sige anden gang en bestemt UI-del eller logik bruges, eller når det forventes, at den skal bruges mere end én gang.
- **Interaktion og tilgængelighed (A11y)**:
  - Interaktive elementer skal have synlige hover, focus-visible, active, disabled, loading og error tilstande.
  - Brug en højde på mindst `min-h-10` for primære touch-targets (touch-elementer), medmindre et kompakt layout kræver mindre kontroller.
  - Bevar altid tilgængelige navne for knapper med kun ikoner ved brug af `aria-label`.
  - Brug `aria-invalid` og destruktiv styling til valideringsfejl.
- **Gradvis migration**:
  - Migrer aldrig hele appen i én stor ændring. Migrer kun det lokale mønster på den skærm, der alligevel bliver ændret.

### Oversigt over fælles komponenter (UI & WFRP)

Her er den komplette liste over fælles komponenter i projektet. Alle nye fælles komponenter skal tilføjes til denne liste.

#### A. Fælles UI-komponenter (`src/components/ui/`)
- `AdvancementSection` (Sektionskontrol til karriereudvikling)
- `BottomSheetPaper` (Bundpanel-kontroller)
- `Breadcrumbs` (Brødkrummenavigation)
- `Heading` (Generisk overskriftskomponent - skal bruges i stedet for raw `<h1>`-`<h6>`)
- `InlineSubtabs` (Horisontale under-tabs)
- `MainTabMenu` (Hovedmenu til tab-valg)
- `PanelSectionHeader` (Header til panel-sektioner)
- `ResourceCounterBar` (Visning af ressourcer/tællere)
- `ScrollableTabStrip` (Rullebar bjælke til tabs)
- `SectionHeading` (Specifik level-2 sektionsoverskrift)
- `SubtabContentFrame` (Indholdsramme til under-tabs)
- `WfrpArrowButton` (Pileknap til navigation/toggles)
- `WfrpDropdownMenu` (Dropdown-menu wrapper)
- `WfrpFilterChips` (Filter-knapper/chips)
- `WfrpSearchField` (Søgefelt med ikoner)
- `WfrpStandardIcon` (Standardiseret ikon-knap)
- `WfrpSuggestionChips` (Forslagschips til input)
- `badge` (Standard badge/mærkat)
- `button` (Standard interaktiv knap)
- `card` (Kort/container layout)
- `dialog` (Modal/dialog-vindue)
- `dropdown-menu` (Dropdown menu primitiver)
- `input` (Standard tekstfelt)
- `label` (Standard label/ledetekst)
- `select` (Dropdown-vælger)
- `separator` (Skillelinje)
- `sheet` (Side-slide panel)
- `table` (Data-tabel primitiver)
- `tabs` (Tab-omskifter primitiver)
- `tooltip` (Værktøjstip ved hover)

#### B. App-specifikke WFRP-komponenter (`src/components/wfrp/`)
- `SheetDataDefinitionList` (Definitionsoversigter til karakterark)
- `SheetDataList` (Standardliste til WFRP data)
- `SheetDataTable` (WFRP data-tabel med specifik formattering)
- `WfrpPanel` (Standard border-panel med header/actions)
- `WfrpPlayerCard` (Horisontalt spillerkort til GM- og landingssider)
- `WfrpSection` (Sektioner med overskrift og separatorlinje)
- `WfrpSidebar` (Sidebjælke layout til kampagne/karakter)
- `WfrpStatusBadge` (WFRP-specifikke status badges)

- **Regel for nye komponenter**: Hver gang en ny fælles komponent tilføjes til `src/components/ui/` eller `src/components/wfrp/`, SKAL den skrives ind i denne oversigt i `AGENTS.md`.

## 3. Test og Kvalitetssikring

- **Kør altid test suite**: Før ændringer pushes eller afleveres, skal hele testsuiten køres og bestås.
  - Kør type-checking og typografikontrol: `npm run lint`
  - Kør Playwright tests: `npm test`
  - Kør sikkerhedsaudit: `npm run security:audit`
  - Kontroller at koden bygger fejlfrit: `npm run build`
- **Automatisk testning**: Playwright bruges til browser-baserede tests. Ved tilføjelse af nye features eller store ændringer skal der tilføjes relevante tests i `tests/`.

## 4. Git og Datahåndtering

- **Ingen runtime data i Git**:
  - Karakterdata, databaser (`.sqlite`, `.sqlite-wal`, `.sqlite-shm`) og gemte fremskridt under `data/` må ALDRIG pushes eller committes til repositoryet.
  - Git-hooks i `.githooks` forhindrer dette automatisk under commit og push. Aktiver dem i et nyt repository med:
    ```sh
    git config core.hooksPath .githooks
    ```
  - Ved bevidste ændringer til seed-data kan hooks tilsidesættes med `ALLOW_DATA_COMMIT=1` og `ALLOW_DATA_PUSH=1`.

## 5. Afhængigheder og Pakkehåndtering

- **Dependencies vs devDependencies**:
  - Kørselspakker, der bruges af produktionskoden (Express, React, Lucide osv.), hører under `dependencies`.
  - Værktøjer til build, test, og type-checking (f.eks. `vite`, `typescript`, `@types/*`, `playwright`) skal forblive i `devDependencies`.
  - Efter ændringer i dependencies skal `package-lock.json` genopbygges ved hjælp af `npm install`.

## 6. Aflevering og Workflow for AI Agenter

- **Push og Test**:
  - Efter at have løst en opgave skal agenten altid køre test-kommandoerne for at veriifcere, at alt fungerer.
  - Når testene er bestået, skal ændringerne altid pushes til remote repository (`git push`).
