## Story Arc Engine + Inner Self

Combined AI Dungeon scripts: **Story Arc Engine** (plot arc guidance) and **[Inner Self](https://github.com/LewdLeah/Inner-Self)** (NPC memory, goals, and self-reflection).

## What you get

| System | Role |
|--------|------|
| **Story Arc Engine** | Periodically generates an 11-point story arc and injects it into the Author's Note so long adventures stay on track. |
| **Inner Self** | Gives NPCs private “brains” (story card notes), name triggers, and emergent thoughts. Optional Auto-Cards integration is included in the library. |

## Install (AI Dungeon scenario)

Follow the [Scripting guide](https://help.aidungeon.com/scripting): enable **Scripts** on your scenario, then paste each file into the matching tab and **Save**.

| Tab | File in this repo |
|-----|-------------------|
| **Input** | `input.js` |
| **Context** | `context.js` |
| **Output** | `output.js` |
| **Library** | `library.js` (full Inner Self + SAE — paste the entire file) |

### Hook order

Each hook runs **Inner Self first**, then **Story Arc Engine**, matching [Inner Self’s recommended pattern](https://github.com/LewdLeah/Inner-Self):

1. `InnerSelf("input" | "context" | "output")` — runs at the top of the hook script.
2. Your `modifier` calls `onInput_SAE` / `onContext_SAE` / `onOutput_SAE`.

Context must return `{ text, stop }` so Inner Self’s `stop` flag is preserved.

## Story Arc Engine (quick reference)

- Story cards: **Story Arc Settings**, **Current Story Arc**
- `/help sae` — commands and settings
- `/redo arc` — regenerate arc
- `/stop` — cancel arc generation in progress
- Set `stop_SAE = true` in settings to disable only the arc engine (Inner Self keeps running)

## Inner Self (quick reference)

- In-game card: **Configure Inner Self**
- Prepare NPCs via `IMPORTANT_SCENARIO_CHARACTERS` at the top of `library.js` (MainSettings / Inner Self creator panel), or `@Name` story card titles
- See the [Inner Self README](https://github.com/LewdLeah/Inner-Self) for gameplay tips (response length, models, JSON vs colon brain format, etc.)

## Credits

- Story Arc Engine — Yi1i1i (LewdLeah, Purplejump — testing/feedback)
- Inner Self v1.0.2 — LewdLeah ([MIT](https://github.com/LewdLeah/Inner-Self/blob/main/LICENSE))
