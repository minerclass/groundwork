# Groundwork: The same job, three times

A short first-person voxel game about access, effort, and learning. You are an apprentice restoring three trail signals with Mara, your mentor. The crew needs working lights and a keeper who can choose positions on unfamiliar ground. Build on three lots while asking which difficulties help you reason and which keep you from reaching the work.

Allow fifteen to twenty minutes, with more time for unfamiliar controls or discussion. No deadline or score. Active time is recorded for discussion and pauses while dialogs are open.

## The learning story

No research background is assumed. Four short chapter briefings introduce the purpose and next action; Field notes reopens the current chapter and building instructions at any time.

1. **Read the land.** Predict whether a proposed height and lane will carry. Preview, revise, and explain the difference before spending stone.
2. **Question the extra effort.** In the far field, distinguish spatial judgment from the work of obtaining materials. More effort is not automatically more learning.
3. **Recognize a barrier.** On the walled lot, investigate conditions before interpreting unfinished work as insufficient effort.
4. **Help without taking over.** Change one condition, test whether it addresses the barrier, and consider what judgment remains with the learner.

After each lot, optional responses invite a short authored reply from Mara. They are not graded or required to progress. The closing classroom case asks players to distinguish accessible materials from accepting a generated paragraph as evidence of understanding. A research panel separates established performance/learning distinctions, Miner's conceptual proposal, and the game's limitations. This is a designed learning opportunity, not evidence that players learned.

Mara is a fictional mentor with fixed responses, not an AI service or a substitute for dialogue with a person. Predictions and choices are not saved or transmitted.

## Play

Open `index.html` in a current desktop browser. Everything runs locally: no build step, no account, no network service, nothing downloaded at runtime.

To serve it locally instead:

```bash
node serve.cjs
```

Then open <http://127.0.0.1:4180>.

### Controls

| Input | Action |
| --- | --- |
| W A S D | Move. Walking into a one-block step climbs it |
| Drag, or arrow keys | Look |
| Space | Jump |
| Hold F, or the touch Cut button | Cut the block under the crosshair |
| E | Place what you are holding against the targeted face |
| Q | Put stone under your own feet and rise with it |
| C | Open signal planning: preview a height and lane from anywhere |
| T | Swap between building stone and the lantern |
| G | Retrieve the lantern without losing the tower |
| Tab / Shift+Tab | Move keyboard focus through the controls |
| R | Back to the work site |
| Esc | Pause |

Movement shortcuts act while the canvas has focus. Tab reaches the buttons, including the impossibility decision. On-screen movement controls appear at narrow widths. Dragging looks without cutting; optional mouse-lock mode also permits holding the left button to cut. The readout names the target, cut time, and face. The position display identifies your column, lane, and foot height.

## The job

Build a continuous stone column on the pale foundation (columns 6–8, lanes 7–13). Put the lantern on top at height 9 or above with a clear signal path west. Attaching it to existing scenery is outside this construction task. Different obstruction shapes require different solutions.

**Previewing uses no material. Building does.** Plan signal previews a height and lane at column 7 from anywhere, without spending stone. A clear preview establishes a signal path, not access to the material. Retrieve a misplaced lantern with G or Pick up lantern and revise the plan.

## The three lots

| Lot | Conditions | What happens |
| --- | --- | --- |
| **The near yard** | Good pick, stone seven paces off, full daylight | A workable reference case |
| **The far field** | Worn pick, stone twenty-four paces off, light going | The same job, several times the cost. Hard, and entirely possible |
| **The walled lot** | Worn pick, stone in sight behind a wall the pick will not cut | Not hard. Not possible |

On the walled lot there is a control marked **This cannot be done here**. Use it when you believe it. If the lot is merely expensive, the game says so and sends you back to work. If the lot really is impossible, it agrees with you. Telling those two apart is the whole skill the game is built around.

Afterwards you compare the lots and change **one condition** on the walled lot. A steel pick opens the wall; delivered stone bypasses it; brighter light leaves the material inaccessible. Try another condition returns to this choice without repeating the first two lots. Each attempt starts from the original conditions, so changes do not accumulate. The earlier nonfunctional ladder option has been removed.

## Conceptual grounding

Miner's proposed pedagogical friction framework concerns productive resistance in learning. Its learner-facing dimensions include **noetic** (the work of thinking), **rhetorical** (the work of making thought communicable), and **existential** (the work of becoming through sustained engagement).

**This game foregrounds infrastructure as the conditions supporting those three.** It includes time, access, technology, policy, and physical environment. The published article [When the Output Looks Like Learning](https://digitalcommons.nl.edu/ie/vol18/iss1/4/) describes a four-dimensional model; the conditioning-base presentation is the game's adaptation, not a claim that the article uses that structure. Here, interventions change access without changing the signal criterion. Applying that criterion to different landscapes can still involve different cognitive demands; the game does not establish that thinking is equally difficult in every case.

The distinction between current performance and durable learning is supported by Soderstrom and Bjork's (2015) [Learning Versus Performance: An Integrative Review](https://bjorklab.psych.ucla.edu/wp-content/uploads/sites/13/2016/11/soderstorm_ra_learningvsperformance.pdf). It does not establish that this game causes retention or transfer. The AI example is a closing thought experiment, not a simulated AI mechanic or evidence that all answer-giving harms learning.

The near yard and far field are both workable. That does not make every extra walk or slow cut productive. The spatial judgment is the intended intellectual work; additional access costs may simply consume effort. The walled lot illustrates exclusion under the modeled conditions. The debrief asks which demands support the work, which can be removed, and which prevent participation.

Pedagogical friction and this account of its infrastructural base are **Micah Miner's proposed contributions**, presented here as proposals rather than as established terms in the field.

## What this does not claim

- The same builder does all three lots with the same skills. Nothing in the game distinguishes people; everything distinguishes conditions. Any reading in which the walled lot reflects a deficiency in the builder is a misreading.
- Awkward controls, hidden ranges, and unreadable cues are usability defects, not friction worth keeping. If something here fights you, that is a bug.
- Interventions preserve the signal criterion. The game does not measure equal cognitive difficulty or the educational value of extra effort.
- Finishing this demonstrates nothing about durable learning. It measures no outcomes, evidences no dissertation claim, and reports no participant findings.
- No participant, student, or staff data is used, collected, or transmitted. Nothing leaves the page.

## Accessibility

Rising with your tower has its own action (**Q**). **R** returns you to the work site and **G** retrieves the lantern. Arrow keys look, Tab navigates controls, and the planning panel uses labeled form fields and a status message. Sound is not essential. The earlier reduced-motion checkbox was removed because it did not affect rendering. Camera movement remains inherent to this 3D activity; offer a partner-operated or projected version where needed. Physical touch and screen-reader use still require human testing.

`validation.md` records what was tested, how, and what remains unverified.

## Implementation

Static HTML, CSS, and JavaScript with a locally vendored Three.js. No build step and no framework.

| File | Responsibility |
| --- | --- |
| `index.html` | Canvas, HUD, dialogs |
| `styles.css` | Layout, responsive and reduced-motion rules |
| `plots.js` | Blocks, tools, terrain, placement rules, reachability, and the judgment |
| `story.js` | Four chapter briefs, contextual mentor replies, and classroom-transfer feedback |
| `voxel.js` | Meshing, ray targeting, lighting, rendering |
| `game.js` | Player body, working, plot flow, HUD |
| `session.test.cjs` | The conceptual guarantees, as assertions |
| `game-flow.test.cjs` | Recovery, focus handling, planning, timing, and intervention replay using the real controller with DOM/render fixtures |
| `story.test.cjs` | Chapter completeness and feedback coverage |
| `facilitator.html` | Printable guided discussion and research notes |
| `serve.cjs` | Loopback preview server with an explicit file allowlist |
| `vendor/` | Three.js and its MIT license |

The shared rules in `plots.js` distinguish placement eligibility from signal geometry. `lanternCarries()` accepts only geometry and coordinates. `solveByColumn()` checks a constructed solution within the marked site, while regression tests reject landscape attachments and unsupported towers. These tests cover the modeled routes and do not constitute evidence about learning or a complete proof over every possible player action.

### Checks

```bash
node --check plots.js
node --check story.js
node --check voxel.js
node --check game.js
node --test
```

All asset references are relative, so the game works from a subdirectory as well as from a site root.

## Facilitation and related activities

Use the [facilitator guide](facilitator.html) for a guided activity. Follow with [Friction Lab](https://minerclass.github.io/friction-game/) to examine the value of particular demands, or [The Friction Atlas](https://minerclass.github.io/friction-atlas/) for the learner-facing dimensions. The game records action traces locally in memory; those traces do not measure thought or durable learning.

## License and attribution

Three.js is included under the MIT License; see `vendor/three-license.txt`. The game code, text, and procedural world are Micah Miner's.
