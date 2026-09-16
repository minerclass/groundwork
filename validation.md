# Validation

Checked September 16, 2026, in one Chromium-based browser on Windows 11. This records what was actually exercised, how, and what was not.

## Automated checks

- `node --check` passes on `plots.js`, `voxel.js`, and `game.js`.
- `node --test session.test.cjs`: 15 tests, all passing, under Node 24.11.1.

The suite is built around the claims the game makes, not around its plumbing:

- **No change to the conditions makes the judgment easier.** Every combination of the four affordances is applied to every lot, and the lowest carrying height in five lanes is asserted unchanged across all of them.
- **The judgment cannot see a tool, a light level, or a lot.** Asserted structurally on the function's own signature, so the guarantee cannot rot into a comment.
- **Each lot asks a different question,** so the second and third cannot be solved from memory of the first.
- **The signal always has to be built up to,** never reached from standing height, in any lane of any lot.
- **The near yard and the far field are both finishable, at very different cost;** the walled lot is not finishable at all, while its pick cuts stone perfectly well. The barrier is the wall.
- **The walled lot opens to some changes and not others.** A pick that cuts the wall and stone delivered to the site both work. A ladder and better light do not, because neither addresses the barrier.
- **Completability is proved, not assumed.** `solveByColumn()` performs the same sequence the player performs and asserts the lantern carries at the end: the near yard at height 10 for five stone, the far field at 14 for nine, the walled lot at 9 in the notch lane for four once a condition changes.
- Placement rules are asserted directly: outside the lot, into solid ground, into the builder's own body, without material, and a second lantern are all refused, while setting the non-solid lantern down where the builder stands is allowed.

## Played through, start to finish

One complete run, all three lots and both endings of the walled lot:

| Lot | Time | Stone cut | Walked | Finished |
| --- | --- | --- | --- | --- |
| The near yard | 0:34 | 8 | 3 m | yes |
| The far field | 2:30 | 12 | 20 m | yes |
| The walled lot | 0:20 | 0 | 10 m | no |
| The walled lot, after a steel pick | 1:01 | 8 | 10 m | yes |

Exercised in the browser: world generation and rendering on all three lots; the dusk lighting on the far field; walking, step-up onto single blocks, gravity and collision; cutting with tool-dependent speed and material yield; the crosshair readout naming the block, the cut time, and the face; placement through the shared rule set, including the refusal to seal the builder into a block; rising with the tower; swapping held items; the free sight check and its three verdicts; returning to the work site; pause and resume; the per-lot tallies; declaring the far field impossible and being **correctly refused** with "there is a way through here"; declaring the walled lot impossible and being agreed with; the debrief table; choosing one condition; the replay; and the ending. The lantern finished at height 10, 14, and 9 respectively, matching what the deterministic solve predicted.

How the inputs were driven matters for reading this. The Browser pane throttles `requestAnimationFrame` to about 3.5 fps while it is hidden, and to about 117 fps while it is shown; the run above was done with it shown. Keys were driven by dispatching `keydown` and `keyup` to the page's own window listeners, re-firing `keydown` while held as a real browser does, which exercises the same handlers, key set, movement, collision, and placement code a keyboard drives. What that does not establish is feel: pacing, camera comfort, aiming with a real mouse, and whether the tower build is pleasant rather than merely possible are unverified and want a person at the keyboard.

## Defects found by playing, and fixed

- **You could dig a pit and be unable to climb out of it** with no material in hand. A softlock. `R` now returns the builder to the work site, taking nothing away from them.
- **The tower could not actually be built.** A builder standing on the ground cannot see the top face of a column once it rises past eye height, so the completability proof assumed a placement the controls did not permit. Rising with the tower is now its own action rather than a jump-and-place timing trick.
- **The crosshair did not say which face it was on,** which is the difference between building a tower and building a path sideways by accident. It says so now.
- **The stone on the far field was hard to find,** not merely far: a low patch in dusk with no landmark. That is a wayfinding defect rather than the friction this game is about, so the outcrop is now a visible mound at the same distance.
- **The ending asserted that the walled lot "became possible"** whichever condition you changed, which is false if you pick one that does not address the barrier. The ending now reports what actually happened.
- The first lot's summary said "the same judgment as the last lot" when there was no last lot.

## Not verified

- The ending text for a change that does **not** unlock the lot. The successful branch was played; the corrected unsuccessful branch is verified by reading, not by play.
- Play on a physical touch device. The touch controls are present and wired, but no real finger input was tested.
- Screen reader output. Live regions, roles, and labels are in place and were not read with assistive technology.
- Colour contrast against the rendered 3D background, which changes with the light condition of each lot.
- Safari, Firefox, and mobile browsers. One Chromium engine only.
- Frame timing was measured only as the raw `requestAnimationFrame` rate of an empty callback, not as the cost of the game's own frame. The world is one mesh rebuilt on each block change; that rebuild has not been profiled.
- Any claim about learning. This is a teaching model. It has had no learner testing and measures no outcomes.
