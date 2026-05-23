# Story Arc Engine + Inner Self

**Community integration that runs [Story Arc Engine](https://github.com/Yi1i1i/Story-Arc-Engine) and [Inner Self](https://github.com/LewdLeah/Inner-Self) in one AI Dungeon scenario.**

This is **not** an official release from either upstream author. It is an unofficial bundle maintained here for a single-scenario install. See [Credits & upstream](#credits--upstream) and [LICENSE](LICENSE) / [NOTICE](NOTICE).

| Upstream project                                                             | What it does                                                                                                                                                    |
| ---------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **[Story Arc Engine](https://github.com/Yi1i1i/Story-Arc-Engine)** by Yi1i1i | Periodically calls the AI to build an 11-point story arc, stored in Author's Notes and story cards, so long adventures stay structured and coherent.            |
| **[Inner Self](https://github.com/LewdLeah/Inner-Self)** by LewdLeah         | Gives NPCs private “brains” (story card notes), name-based triggers, goals, memory, and self-reflection. Optional Auto-Cards support is bundled in the library. |

---

## What you get

- **Plot guidance** — Story Arc Engine warns before arc turns, generates the arc, and injects it into context on a schedule you control.
- **Character minds** — Inner Self maintains per-NPC mental state, with zero “press Continue for the mod” prompts during normal play.
- **Single library** — One `library.js` paste contains Inner Self, Auto-Cards hooks, and Story Arc Engine logic.

---

## Install (AI Dungeon scenario)

Use the AI Dungeon website on desktop (or mobile with “view as desktop”). Full scripting reference: [AI Dungeon Scripting](https://help.aidungeon.com/scripting).

1. Create a new scenario or open an existing one for editing.
2. Open the **DETAILS** tab.
3. Scroll to **Scripting** and turn **Scripts Enabled** on.
4. Click **EDIT SCRIPTS**.
5. For each tab below: select the tab on the left, **delete all existing code**, paste the matching file from this repo, then continue to the next tab.
6. Click the yellow **SAVE** button in the top right.


| AI Dungeon tab | File in this repo                                      |
| -------------- | ------------------------------------------------------ |
| **Input**      | `[input.js](input.js)`                                 |
| **Context**    | `[context.js](context.js)`                             |
| **Output**     | `[output.js](output.js)`                               |
| **Library**    | `[library.js](library.js)` — paste the **entire** file |


Adventures started from this scenario (including ones already in progress) will load the combined scripts after you save.

### Hook order (important)

The hook files wire the two systems in a specific order:


| Tab         | Order                                                                                               |
| ----------- | --------------------------------------------------------------------------------------------------- |
| **Input**   | Inner Self → Story Arc Engine                                                                       |
| **Context** | Story Arc Engine → Inner Self (arc prompt injection; Inner Self is skipped while SAE owns the turn) |
| **Output**  | Story Arc Engine → Inner Self (arc list parsing before character thoughts)                          |


**Context** must return `{ text, stop }` so Inner Self’s `stop` flag is preserved.

Do not swap hook order unless you know what you are changing — arc generation and brain injection can conflict if reordered.

---

## Changes in this integration

This integration wires the two mods together and fixes a few issues that show up when they share the same scenario. You do not need to edit `library.js` for normal play — these are behaviors already in the bundled scripts.

### New commands

| Command | What it does |
| ------- | ------------ |
| `/sae status` | Logs arc stats to the **Scripting** console (beat count, next arc turn, `arcPrompt` length). On the next **Continue**, context logs whether beats were injected into Author's Note or a fallback path. Use this if **Inspect** is broken. |
| `/help inner-self` | Prints a short Inner Self reference in-game (same family as `/help sae`). |

### Story Arc Engine fixes & behavior

- **Hook order** — SAE runs before Inner Self on **Context** and **Output** so arc prompts inject cleanly and numbered arc lines are parsed before Inner Self sanitizes output.
- **Arc generation turns** — Inner Self context/thought work is skipped while SAE owns the turn (`saveOutput`). Context is trimmed to an arc-focused view; the arc prompt is re-fed each pass until generation finishes.
- **Input during arc gen** — Blank **Continue** still advances arc generation; real **Do** / **Say** / **Story** input cancels that arc turn and is kept (logged as `SAE arc deferred`).
- **Arc parsing** — Accepts numbered lists by line count (configurable minimum), with fallbacks if the model wraps output in prose.
- **Beat injection** — Tries Author's Note first; if your build has no `[Author's note:]` block, falls back to inserting before **Recent Story** or appending to context end.
- **`arcPrompt` settings** — Must be a plain string in **Story Arc Settings** (`arcPrompt = <<...>>`), not a JavaScript `[...]` array. Arrays broke round-trip saves and left `arcPrompt = undefined` on the card; the library now normalizes and rewrites the prompt when hooks run.
- **Settings card** — Arc settings are no longer mirrored into card notes (that was bloating **Story Arc Settings**).

### Inner Self fixes & behavior

- **Thought injection** — Front-memory arming so thought tasks are less likely to be buried under full story context.
- **Logging** — Console lines are prefixed with `IS` or `SAE` so you can filter Scripting logs while debugging.
- **Init bug** — Fixed a crash (`Cannot access 'agent' before initialization`) when logging triggered agents.

---

## Story Arc Engine (quick reference)

Based on [Yi1i1i/Story-Arc-Engine](https://github.com/Yi1i1i/Story-Arc-Engine).

- **Story cards:** `Story Arc Settings`, `Current Story Arc` (edit arc or settings anytime).
- **`/help sae`** — commands and settings in-game.
- **`/sae status`** — log arc and injection debug info to the Scripting console (see [Changes in this integration](#changes-in-this-integration)).
- **`/redo arc`** — regenerate the arc (use **Continue** on each generating turn until a valid list is saved).
- **`/stop`** — cancel arc generation in progress.
- `**stop_SAE**` — set to `true` in `Story Arc Settings` (or via state) to disable **only** Story Arc Engine; Inner Self keeps running.

Before a scheduled arc turn you may see a warning; the next turn is used to generate the arc. If generation fails, retry when prompted or raise response length (low length can break arc output).

### Pacing & beats

Open `**Story Arc Settings`** after your adventure starts (the card is created automatically). Edit values in the card **entry** — changes apply on the next turn.


| Setting                   | What it does                                                             | Default |
| ------------------------- | ------------------------------------------------------------------------ | ------- |
| `**turnsPerAICall`**      | Turns between AI calls to refresh the story arc                          | `35`    |
| `**turnsPerElemRemoval**` | Turns before the first plot point drops off the arc (set `0` to disable) | `3`     |


To **slow the story down** and linger on beats longer, **raise both values**. For example, higher `turnsPerAICall` means fewer arc refreshes; higher `turnsPerElemRemoval` means each plot point stays on the arc longer before advancing.

You can also edit `**arcPrompt`**, `**attemptLimit**`, and `**stop_SAE**` in the same card. Type `**/help sae**` for the full field reference.

---

## Inner Self (quick reference)

Based on [LewdLeah/Inner-Self](https://github.com/LewdLeah/Inner-Self) (v1.0.2 in this bundle).

### Prepare NPCs (recommended)

After you start an adventure, open the `**Configure Inner Self**` story card:

1. Enter your **player character’s first name** in the card **entry** (if known).
2. In the card **notes**, at the bottom, list every NPC you want Inner Self to simulate — **one first name per line**.
3. Order matters: names **higher in the list have higher trigger priority** when multiple characters are mentioned in recent story.

Use simple first names so NPCs trigger when mentioned in the story. Brain cards are created automatically the first time each character is triggered.

### Other tips

- **Gameplay:** response length ~200 tokens if outputs are short; enable scripts in gameplay settings if cards are missing; plot components matter for thoughts; avoid Atlas/Raven models for best results.
- **In-game help:** open `Configure Inner Self` and enable **Show detailed guide**, or type `/help inner-self` during play.
- **Advanced:** see the [Inner Self README](https://github.com/LewdLeah/Inner-Self) for brain JSON vs colon format, debug mode, and other creator options.

---

## Customization

Both mods create in-game story cards when you play. Use those cards to configure everything — no need to edit `[library.js](library.js)` for normal setup.


| Mod                  | Settings card          | What you can change                                                             |
| -------------------- | ---------------------- | ------------------------------------------------------------------------------- |
| **Story Arc Engine** | `Story Arc Settings`   | Arc refresh interval, plot-point pacing, arc prompt, attempt limit, disable SAE |
| **Inner Self**       | `Configure Inner Self` | Enable/disable, NPC list, thought chance, debug mode, Auto-Cards, and more      |


Edit `**Current Story Arc`** anytime to view or manually adjust the active arc (spoilers!).

---

## Credits & upstream

This integration would not exist without the original projects. Please star and support them.

**Disclaimer:** This repository is a **community integration**. It is **not affiliated with, endorsed by, or maintained by** Yi1i1i (Story Arc Engine) or LewdLeah (Inner Self). Bugs in the combined install should be reported here; issues that reproduce in a single upstream project alone should go to that upstream repo.

| Project           | Author                                                                                 | Repository                                                                                                                                                 | License |
| ----------------- | -------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| Story Arc Engine  | Yi1i1i (with thanks to LewdLeah & Purplejump for ideas, debugging, and testing on SAE) | [github.com/Yi1i1i/Story-Arc-Engine](https://github.com/Yi1i1i/Story-Arc-Engine)                                                                         | No `LICENSE` file upstream as of this bundle; keep attribution (see [NOTICE](NOTICE)) |
| Inner Self v1.0.2 | LewdLeah                                                                               | [github.com/LewdLeah/Inner-Self](https://github.com/LewdLeah/Inner-Self)                                                                                   | [MIT](https://github.com/LewdLeah/Inner-Self/blob/main/LICENSE) |

**This repo** combines and maintains those scripts for a single-scenario install.

- **Integration layer** (`input.js`, `context.js`, `output.js`, and compatibility changes in `library.js`) — [MIT](LICENSE)
- **Inner Self / Auto-Cards portions** — MIT; full notice in [NOTICE](NOTICE)
- **Story Arc Engine portions** — derived from Yi1i1i’s project; attribution required (see [NOTICE](NOTICE))

If you redistribute or publish a scenario using this bundle, keep attribution visible (scenario description, credits, or a copy of [NOTICE](NOTICE)).

---

## Links

- [Story Arc Engine (upstream)](https://github.com/Yi1i1i/Story-Arc-Engine) · [WIP scenario on AI Dungeon](https://play.aidungeon.com/scenario/piAUFAqzm2xZ/story-arc-engine-wip)
- [Inner Self (upstream)](https://github.com/LewdLeah/Inner-Self) · [Demo scenario](https://play.aidungeon.com/scenario/tsu1WMJXaaAZ/inner-self)

