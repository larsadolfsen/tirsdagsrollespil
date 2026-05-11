# Mobile tab splitting plan

Goal: keep the mobile first load focused on the app shell, character header, characteristics view, and mobile tab menu. Load heavy tabs only when selected.

## Completed prep

- Added shared UI helper components under `src/components/ui`.
- Added tab placeholder modules under `src/tabs`.
- Added tab utilities for inventory and spells.
- Added shared tab types and options.
- Added `LazyTabPanel` scaffold.
- Added extraction targets for `CharacteristicsView` and `MobileTabMenu`.
- Extracted real tab implementations for Background, Notes, Talents, Skills, Actions, Inventory, Spells, and Career.
- Wired lazy tab rendering in `App.tsx` so tab modules split into separate chunks.
- Extracted `CharacterBuilderScreen`.
- Moved shared spell and talent display helpers plus spell tab filtering into tab utility modules.

## Next steps

1. Move heavy imports out of `App.tsx`, especially rule data, motion, inventory helpers, spell helpers, and talent helpers.
2. Run `npm run lint` and `npm run build`.
3. Re-test mobile PageSpeed.

## Preferred extraction order

1. Background
2. Notes
3. Talents
4. Skills
5. Actions
6. Inventory
7. Spells
8. Career

## Performance target

Mobile initial load should avoid loading tab-specific code and data until the user chooses a tab.
