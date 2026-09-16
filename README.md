# Groundwork: The same job, three times

A short first-person voxel game about **infrastructural friction**. You do one job on three building sites. The job never changes and the thinking it asks for never changes. What changes is the pick in your hand, how far the stone sits, whether there is light, and what stands between you and the material.

Ten to fifteen minutes. Nothing is timed and nothing is scored.

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
| F, or hold the left mouse button | Cut the block under the crosshair |
| E | Place what you are holding against the targeted face |
| Q | Put stone under your own feet and rise with it |
| C | Check whether a lantern there would carry |
| Tab | Swap between building stone and the lantern |
| R | Back to the work site |
| Esc | Pause |

On-screen buttons cover all of it for touch and pointer use. The readout under the crosshair names the block, says how long your tool needs for it or that it will not cut it at all, and says which face you are on, so you can tell a tower from a path before you build one.

## The job

Raise a signal lantern high enough, and clear enough, that it carries west to the valley. Working out how high and where is a real problem with a real answer, and the answer is different on each site because what stands in the way is shaped differently each time.

**Checking is free. Building is not.** You can test whether a spot would work as often as you like, from anywhere, at no cost. Only acting on the answer spends material. The thinking is never the scarce thing here.

## The three lots

| Lot | Conditions | What happens |
| --- | --- | --- |
| **The near yard** | Good pick, stone seven paces off, full daylight, ladder on site | The job takes a few minutes and most of that is the job itself |
| **The far field** | Worn pick, stone twenty-four paces off, light going | The same job, several times the cost. Hard, and entirely possible |
| **The walled lot** | Worn pick, stone in sight behind a wall the pick will not cut | Not hard. Not possible |

On the walled lot there is a control marked **This cannot be done here**. Use it when you believe it. If the lot is merely expensive, the game says so and sends you back to work. If the lot really is impossible, it agrees with you. Telling those two apart is the whole skill the game is built around.

Afterwards you see what the three lots cost, and you change **one condition** on the walled lot and go back. Not every resource addresses every barrier: a ladder and better light are both real help, and neither of them touches a wall around the stone.

## Conceptual grounding

Pedagogical friction is the productive resistance that learning requires. It has three learner-facing dimensions, which are analytically separable but entangled in practice: **noetic** (the work of thinking), **rhetorical** (the work of making thought communicable), and **existential** (the work of becoming someone through sustained difficulty).

**Infrastructural friction is the conditioning base beneath those three, not a fourth dimension alongside them.** It is the material and systemic layer that decides what learner-facing friction is even possible: time, access, technology, policy, physical environment. That relationship is the thing this game is built to make handleable rather than merely stated. The judgment the job asks for is identical on every lot and cannot be made easier by any change to the conditions. What the conditions decide is whether you ever reach it.

The game also turns on the difference between **productive friction**, which is difficulty worth keeping because the work it demands is the work that forms the learner, and **exclusionary friction**, which is a barrier wearing difficulty's clothes. The near yard and the far field differ enormously in cost and both are productive. The walled lot is not a harder version of them. It is a different thing, and it is a property of the lot rather than of the builder.

Pedagogical friction and this account of its infrastructural base are **Micah Miner's proposed contributions**, presented here as proposals rather than as established terms in the field.

## What this does not claim

- The same builder does all three lots with the same skills. Nothing in the game distinguishes people; everything distinguishes conditions. Any reading in which the walled lot reflects a deficiency in the builder is a misreading.
- Awkward controls, hidden ranges, and unreadable cues are usability defects, not friction worth keeping. If something here fights you, that is a bug.
- Removing friction is not the lesson. The judgment stays exactly as hard after every intervention, by construction.
- Finishing this demonstrates nothing about durable learning. It measures no outcomes, evidences no dissertation claim, and reports no participant findings.
- No participant, student, or staff data is used, collected, or transmitted. Nothing leaves the page.

## Accessibility

Rising with your own tower is its own action (**Q**) rather than a jump-and-place timing trick, because timing tricks are not the difficulty this game is about. **R** returns you to the work site, so a pit you cut yourself is never a trap. Arrow keys look, so a mouse is not required. The crosshair readout names the target and the face in text. Sound is not used for anything essential. A reduce-motion setting is in the pause screen and follows the system preference at startup.

`validation.md` records what was tested, how, and what remains unverified.

## Implementation

Static HTML, CSS, and JavaScript with a locally vendored Three.js. No build step and no framework.

| File | Responsibility |
| --- | --- |
| `index.html` | Canvas, HUD, dialogs |
| `styles.css` | Layout, responsive and reduced-motion rules |
| `plots.js` | Blocks, tools, terrain, placement rules, reachability, and the judgment |
| `voxel.js` | Meshing, ray targeting, lighting, rendering |
| `game.js` | Player body, working, plot flow, HUD |
| `session.test.cjs` | The conceptual guarantees, as assertions |
| `serve.cjs` | Loopback preview server with an explicit file allowlist |
| `vendor/` | Three.js and its MIT license |

The rules live in `plots.js` rather than in the game loop, so the same code that governs play is the code the tests reason about. `lanternCarries()` takes geometry and nothing else: it cannot see a tool, a light level, or which lot it is on, so no change to the conditions can reach it. `solveByColumn()` performs the plain solution the player performs, which makes completability something the suite checks rather than something a person has to discover in a browser.

### Checks

```bash
node --check plots.js
node --check voxel.js
node --check game.js
node --test session.test.cjs
```

All asset references are relative, so the game works from a subdirectory as well as from a site root.

## License and attribution

Three.js is included under the MIT License; see `vendor/three-license.txt`. The game code, text, and procedural world are Micah Miner's.
