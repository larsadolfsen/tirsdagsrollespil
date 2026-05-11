# Mobile tab splitting plan

Goal: keep the mobile first load focused on the app shell, character header, characteristics view, and mobile tab menu. Load heavy tabs only when selected.

## Completed prep

- Added shared UI helper components under `src/components/ui`.
- Added tab placeholder modules under `src/tabs`.
- Added tab utilities for inventory and spells.
- Added shared tab types and options.
- Added `LazyTabPanel` scaffold.
- Added extraction targets for `CharacteristicsView` and `MobileTabMenu`.

## Next steps

1. Replace tab type aliases and tab option constants in `App.tsx` with imports from `src/tabs`.
2. Replace duplicated shared UI helper implementations in `App.tsx` with imports from `src/components/ui`.
3. Extract the real `BackgroundTab` implementation.
4. Extract the real `NotesTab` implementation.
5. Extract the real `TalentsTab` implementation.
6. Extract the real `SkillsTab` implementation.
7. Extract the real `ActionsTab` implementation.
8. Extract the real `InventoryTab` implementation and switch to `inventoryUtils`.
9. Extract the real `SpellsTab` implementation and switch to `spellUtils`.
10. Extract the real `CareerTab` implementation and `CharacterBuilderScreen`.
11. Wire `LazyTabPanel` into `App.tsx` for non-characteristics views.
12. Move heavy imports out of `App.tsx`, especially rule data, motion, inventory helpers, spell helpers, and talent helpers.
13. Run `npm run lint` and `npm run build`.
14. Re-test mobile PageSpeed.

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
