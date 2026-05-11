# Mobile tab splitting plan

Goal: keep the mobile first load focused on the app shell, character header, characteristics view, and mobile tab menu. Load heavy tabs only when selected.

## Current status

- Shared UI helper components live under `src/components/ui`.
- Shared tab types and tab option metadata live under `src/tabs`.
- `LazyTabPanel` is in place.
- Real tab implementations have been extracted for Background, Notes, Talents, Skills, Actions, Inventory, Spells, and Career.
- `App.tsx` lazy-loads the extracted tab modules so tab-specific code is split into separate chunks.
- `CharacterBuilderScreen`, `InfoSidebar`, `ShopSidebar`, and `SpellShopSidebar` are lazy-loaded.
- Shared spell, talent, inventory, and mobile tab helper utilities have been moved into smaller modules where applicable.
- Recent mobile UI spacing work reduced table and submenu padding and moved Advance controls directly below the Advance submenu.

## Heavy responsibilities still in `App.tsx`

- Dice roller state, animation, result calculation, and dice log state.
- Inventory state handlers, context menu handling, drag/drop, armour fit handling, and shop item insertion.
- Career advancement pending state and derived XP/progress calculations.
- Mobile navigation state and mobile menu markup.
- Main app layout shell and high-level desktop/mobile content containers.
- Pure WFRP advance cost helpers.
- Several feature-specific imports that can move with the extraction targets above.

## Next steps

1. Extract pure advance cost helpers into `src/lib/advanceCosts.ts`.
2. Extract dice roller state and result logic into a dedicated hook/module.
3. Extract inventory state handlers into a dedicated hook.
4. Extract career advancement pending state and derived calculations into a dedicated hook.
5. Extract mobile navigation UI into mobile shell components.
6. Extract the main app layout shell from `App.tsx`.
7. Run `npm run lint` and `npm run build` after each extraction slice.
8. Re-test mobile PageSpeed after the larger `App.tsx` reductions.

## Performance target

Mobile initial load should avoid loading tab-specific code and data until the user chooses a tab. The remaining performance work is now mostly about reducing `App.tsx` itself so the initial shell does not carry feature-specific state, handlers, and helper imports that are only needed after navigation.
