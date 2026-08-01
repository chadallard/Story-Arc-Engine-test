# Story Arc Engine + Inner Self

**A fork that runs [Story Arc Engine](https://github.com/Yi1i1i/Story-Arc-Engine) and [Inner Self](https://github.com/LewdLeah/Inner-Self) in one AI Dungeon scenario.**

This is **not** an official release from either upstream author, and it is **no longer a straight bundle of the upstream scripts**. Both mods have been modified here, and the Inner Self half in particular has diverged from upstream v1.0.2 in how NPC brains store, route, and prune memories (now a numbered list of self-contained third-person statements rather than keyed first-person fragments). See [Divergence from upstream](#divergence-from-upstream), [Credits & upstream](#credits--upstream), and [LICENSE](LICENSE) / [NOTICE](NOTICE).

| Upstream project                                                             | What it does                                                                                                                                                    |
| ---------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **[Story Arc Engine](https://github.com/Yi1i1i/Story-Arc-Engine)** by Yi1i1i | Periodically calls the AI to build an 11-point story arc, stored in Author's Notes and story cards, so long adventures stay structured and coherent.            |
| **[Inner Self](https://github.com/LewdLeah/Inner-Self)** by LewdLeah         | Gives NPCs private “brains” (story card notes), name-based triggers, goals, memory, and self-reflection. Optional Auto-Cards support is bundled in the library. |

---

## What you get

- **Plot guidance** — Story Arc Engine warns before arc turns, generates the arc, and injects active beats into context on a schedule you control (this fork defaults to focused injection above **Recent Story** so beats are followed more reliably than upstream Author's Note-only injection).
- **Character minds** — A modified Inner Self maintains per-NPC mental state, with zero “press Continue for the mod” prompts during normal play. Brains keep themselves inside their context budget instead of relying on the model to volunteer deletions.
- **Single library** — One `library.js` paste contains the forked Inner Self, Auto-Cards hooks, and Story Arc Engine logic.

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

## Divergence from upstream

This repo started as a bundle of two upstream mods. It is now a **fork**: `library.js` contains modified versions of both, and the Inner Self side no longer behaves the same as [LewdLeah/Inner-Self](https://github.com/LewdLeah/Inner-Self) v1.0.2.

What this means for you:

- **Upstream docs are only partly accurate here.** The Inner Self README still describes setup and brain card discovery correctly. It does **not** describe this fork's numbered third-person memory format, the merge/revise/delete operations (upstream's keyed thoughts and key renaming are gone), how memories are pruned, or how they route between NPCs.
- **Upstream updates are not merged automatically.** Inner Self v1.0.3+ will not appear here just by pulling; changes are ported by hand when they are worth porting.
- **Bug reports go here first.** If a problem only reproduces in a clean upstream install, report it upstream instead.

The behavioral differences are listed under [Inner Self changes](#inner-self-changes-diverged-from-v102) and [Story Arc Engine fixes & behavior](#story-arc-engine-fixes--behavior).

---

## Changes in this integration

This fork wires the two mods together, fixes issues that show up when they share the same scenario, and changes some upstream behavior outright. You do not need to edit `library.js` for normal play — these are behaviors already in the scripts you paste.

### New commands

| Command | What it does |
| ------- | ------------ |
| `/sae status` | Logs arc stats to the **Scripting** console (beat count, `arcBeatFocus`, `arcPlacement`, next arc refresh). On the next **Continue**, context logs how beats were injected. Use this if **Inspect** is broken. |
| `/help inner-self` | Prints a short Inner Self reference in-game (same family as `/help sae`). |

### Story Arc Engine fixes & behavior

- **Hook order** — SAE runs before Inner Self on **Context** and **Output** so arc prompts inject cleanly and numbered arc lines are parsed before Inner Self sanitizes output.
- **Arc generation turns** — Inner Self context/thought work is skipped while SAE owns the turn (`saveOutput`). Context is trimmed to an arc-focused view; the arc prompt is re-fed each pass until generation finishes.
- **Input during arc gen** — Blank **Continue** still advances arc generation; real **Do** / **Say** / **Story** input cancels that arc turn and is kept (logged as `SAE arc deferred`).
- **Arc parsing** — Accepts numbered lists by line count (configurable minimum), with fallbacks if the model wraps output in prose.
- **Beat injection (fork default)** — Upstream SAE appended the full arc into Author's Note every turn. Models often ignored beats because the list was long, buried, and softly worded. This fork **defaults to `arcBeatFocus = current` and `arcPlacement = beforeRecentStory`**: only beat #1 is injected, in a marked block immediately above **Recent Story**, with stronger plot-obligation wording. The full arc is still stored on **Current Story Arc** for editing and removal pacing. Set `arcBeatFocus = full` and `arcPlacement = authorNote` to restore upstream-style injection.
- **`arcPrompt` settings** — Must be a plain string in **Story Arc Settings** (`arcPrompt = <<...>>`), not a JavaScript `[...]` array. Arrays broke round-trip saves and left `arcPrompt = undefined` on the card; the library now normalizes and rewrites the prompt when hooks run.
- **Settings card** — Arc settings are no longer mirrored into card notes (that was bloating **Story Arc Settings**).
- **`refreshArcWhenDepleted`** — Optional pacing mode: when `true`, the arc refresh runs only after all numbered beats have been removed (`turnsPerElemRemoval` must not be `0`). Ignores `turnsPerAICall` while enabled.

### Inner Self changes (diverged from v1.0.2)

These are behavior changes, not just fixes — a brain in this fork will not evolve the same way it would upstream.

- **Numbered third-person memories (breaking change)** — Upstream stores terse first-person fragments under snake_case keys (`sarah_amusement: 338 → Glad to see she's still got that streak in her.`). Once the story that gave a fragment its meaning scrolls out of context, the fragment is orphaned — "what streak?". This fork replaces keys with a **numbered list of self-contained, third-person memories** that carry their own context (`2140 → Jason is humbled that Chloe could hear everything he said while she was in the pod.`), so a memory still makes sense long after its scene is gone.
  - The brain object is re-keyed from `{ key: "label → text" }` to `{ label: text }`. The label is the memory's ID.
  - Card notes are a plain numbered list; a line with **no number is a "core" memory** that is always injected and never auto-trimmed (the hand-editable replacement for upstream's unlabeled thoughts).
  - Context injection is prose-with-IDs under a `# Name's memories:` header (`[2140] …`, core memories as `[core] …`) instead of a key/value dump.
  - Legacy brains are migrated on read: `key: 2140 → text` becomes `{ "2140": text }` (the key is dropped); numberless legacy lines become core memories. No player action is needed and old fragments age out through merge and trim.
- **Four memory operations, no key renaming** — The model now writes (`(remember = \`…\`)`), revises a memory by number (`(2140 = \`…\`)`), merges memories (`(merge 2140, 2141 = \`…\`)`), or deletes by number (`(delete 2140)`). Revise and merge both allocate a **fresh** label and drop the old ones, so a reinforced or consolidated memory bubbles to the top of recency. The upstream key-**rename** operation is removed entirely — there are no keys to rename.
- **Merge instead of forget when full** — Upstream asks an over-budget brain to `(delete key_name)`, which is lossy and unreliable. This fork instead injects a **merge task**: pick 2–4 memory numbers covering the same event or thread and rewrite them as one richer memory. This shrinks the brain without discarding information (four fragments collapse into one contextual memory). The deterministic auto-trim below is kept as a last-resort safety net.
- **Automatic memory trimming** — If a brain exceeds its budget (the same `percent`-of-story-region measure upstream uses, with the same ~800-character floor so small brains are never touched), the oldest memories are evicted straight from the card **notes** until the brain is back to roughly 85% of the limit.
  - Eviction order is by memory label, oldest (lowest label) first. Revise/merge assign fresh labels, so reinforced and consolidated memories survive.
  - The most recent labeled memories are always kept (`KEEP_RECENT`), and **core (numberless) memories are never evicted**. Because self-contained memories are longer than the old fragments, this fork keeps fewer and evicts more per pass than upstream, and raises the default brain budget (`percent`) from 30% to 40%.
  - At most a few evictions per turn (`MAX_EVICTIONS`), and only on genuinely new turns (retries and undos are skipped). Every eviction is logged (`IS auto-trim evicted …`).
  - To disable it, set `IS_AUTO_TRIM_ENABLED = false` in `library.js`. It is a code constant, not a story card setting.
- **Cross-NPC routing by leading name** — Because memories are third-person and begin with their subject, a new memory that opens with another configured NPC's name (`Mira suspects the guard is lying.`) is routed to **Mira's** brain card instead of the triggered NPC's. Routing only fires on a leading name, never an incidental mention, so `Jason is humbled that Chloe could hear him` correctly stays on Jason. Redirects are logged as `output memory-name redirect`.
- **Alias names per brain card** — A brain card's `"agent"` metadata accepts an array of names (`["Mira", "Miri", "the healer"]`) instead of just a string. The first name is canonical, the rest are extra triggers pointing at the same card. Single-name strings still work unchanged.
- **Brain note ordering** — Card notes are written in label order (oldest first) with core memories last, so you can read a brain as a rough timeline. Upstream wrote notes in insertion order.
- **Memory injection** — Front-memory arming so memory tasks are less likely to be buried under full story context.
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

Open **Story Arc Settings** after your adventure starts (the card is created automatically). Edit values in the card **entry** — changes apply on the next turn.

| Setting | What it does | Default (this fork) |
| -------- | ------------ | --------------------- |
| `turnsPerAICall` | Turns between AI calls to refresh the story arc (used when `refreshArcWhenDepleted = false`) | `35` |
| `turnsPerElemRemoval` | Turns between removals of beat #1 from the arc (set `0` to disable). Does **not** control injection — the full arc lives on **Current Story Arc**; this controls when #1 is dropped so #2 becomes current. | `3` |
| `refreshArcWhenDepleted` | `true` = refresh the arc only after every numbered beat has been removed. `false` = use `turnsPerAICall` on a timer. Requires `turnsPerElemRemoval` > 0 when `true`. | `false` |
| `arcBeatFocus` | How many beats to inject into context: `full` (entire list), `current` (beat #1 only), `currentPlusNext` (#1 plus light foreshadow of #2). | `current` |
| `arcPlacement` | Where to inject: `beforeRecentStory` (recommended; block sits above **Recent Story**), `authorNote` (append inside `[Author's note:]`). | `beforeRecentStory` |

To **slow the story down** and linger on beats longer, **raise** `turnsPerElemRemoval` and/or enable `refreshArcWhenDepleted` so a full arc cycle finishes before the next AI refresh.

**Upstream vs this fork:** Yi1i1i's original SAE defaults effectively injected the **full** arc into Author's Note. If beats felt ignored despite good logs, try this fork's defaults first; revert with `arcBeatFocus = full` and `arcPlacement = authorNote`.

You can also edit `arcPrompt`, `attemptLimit`, and `stop_SAE` in the same card. Type `/help sae` for the full field reference.

---

## Inner Self (quick reference)

Forked from [LewdLeah/Inner-Self](https://github.com/LewdLeah/Inner-Self) v1.0.2 and modified — see [Inner Self changes](#inner-self-changes-diverged-from-v102) for what behaves differently.

### Prepare NPCs (recommended)

After you start an adventure, open the `**Configure Inner Self**` story card:

1. Enter your **player character’s first name** in the card **entry** (if known).
2. In the card **notes**, at the bottom, list every NPC you want Inner Self to simulate — **one first name per line**.
3. Order matters: names **higher in the list have higher trigger priority** when multiple characters are mentioned in recent story.

Use simple first names so NPCs trigger when mentioned in the story. Brain cards are created automatically the first time each character is triggered.

### Other tips

- **Gameplay:** response length ~200 tokens if outputs are short; enable scripts in gameplay settings if cards are missing; plot components matter for thoughts; avoid Atlas/Raven models for best results.
- **In-game help:** open `Configure Inner Self` and enable **Show detailed guide**, or type `/help inner-self` during play.
- **Advanced:** see the [Inner Self README](https://github.com/LewdLeah/Inner-Self) for brain JSON vs colon format, debug mode, and other creator options — but note that thought pruning, cross-NPC routing, and note ordering work differently here.
- **Brain size:** you do not need to prune brain cards by hand. Over-budget brains are trimmed automatically; hand-editing notes still works if you want a specific thought gone now.

---

## Customization

Both mods create in-game story cards when you play. Use those cards to configure everything — no need to edit `[library.js](library.js)` for normal setup.


| Mod                  | Settings card          | What you can change                                                             |
| -------------------- | ---------------------- | ------------------------------------------------------------------------------- |
| **Story Arc Engine** | `Story Arc Settings`   | Arc refresh interval, plot-point pacing, beat focus/placement, refresh-when-depleted, arc prompt, attempt limit, disable SAE |
| **Inner Self**       | `Configure Inner Self` | Enable/disable, NPC list, thought chance, debug mode, Auto-Cards, and more      |


Edit `**Current Story Arc`** anytime to view or manually adjust the active arc (spoilers!).

---

## Credits & upstream

This fork would not exist without the original projects. Please star and support them.

**Disclaimer:** This repository is an **unofficial community fork**. It is **not affiliated with, endorsed by, or maintained by** Yi1i1i (Story Arc Engine) or LewdLeah (Inner Self), and its behavior is no longer identical to either upstream project. Bugs in this fork should be reported here; issues that reproduce in a clean upstream install should go to that upstream repo. Do not report this fork's behavior as an upstream bug.

| Project           | Author                                                                                 | Repository                                                                                                                                                 | License |
| ----------------- | -------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| Story Arc Engine  | Yi1i1i (with thanks to LewdLeah & Purplejump for ideas, debugging, and testing on SAE) | [github.com/Yi1i1i/Story-Arc-Engine](https://github.com/Yi1i1i/Story-Arc-Engine)                                                                         | No `LICENSE` file upstream as of this fork; keep attribution (see [NOTICE](NOTICE)) |
| Inner Self v1.0.2 | LewdLeah                                                                               | [github.com/LewdLeah/Inner-Self](https://github.com/LewdLeah/Inner-Self)                                                                                   | [MIT](https://github.com/LewdLeah/Inner-Self/blob/main/LICENSE) |

**This repo** is a modified derivative of those scripts, maintained for a single-scenario install.

- **Integration layer and fork changes** (`input.js`, `context.js`, `output.js`, and modifications in `library.js`) — [MIT](LICENSE)
- **Inner Self / Auto-Cards portions** — MIT; modified from v1.0.2; full notice in [NOTICE](NOTICE)
- **Story Arc Engine portions** — derived from Yi1i1i’s project and modified; attribution required (see [NOTICE](NOTICE))

If you redistribute or publish a scenario using this fork, keep attribution visible (scenario description, credits, or a copy of [NOTICE](NOTICE)) and make clear that it is modified, not the upstream releases.

---

## Links

- [Story Arc Engine (upstream)](https://github.com/Yi1i1i/Story-Arc-Engine) · [WIP scenario on AI Dungeon](https://play.aidungeon.com/scenario/piAUFAqzm2xZ/story-arc-engine-wip)
- [Inner Self (upstream)](https://github.com/LewdLeah/Inner-Self) · [Demo scenario](https://play.aidungeon.com/scenario/tsu1WMJXaaAZ/inner-self)

