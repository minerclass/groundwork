# Agent Log

Append-only record of automated and agent-assisted changes to this repository.
Newest entry first. No participant data, committee or faculty names, credentials,
or tokens.

---

## 2026-09-18 - Add the apprentice story and explicit learning arc

Added Mara, an authored mentor, and four chapter briefings: read the land,
question the extra effort, recognize a barrier, and help without taking over.
Field notes reopen the current mission and construction instructions. Planning
now invites a prediction and gives explanatory feedback. Optional post-lot
responses connect the experience to classroom decisions without scores or gates.
The ending adds a source-access/AI-output case and a sourced research panel.

Research wording distinguishes Soderstrom and Bjork's performance/learning
review from Miner's conceptual proposal and this game's adaptation. The linked
article describes four dimensions; the game foregrounds infrastructure as the
supporting conditions. The fixed mentor responses are not authentic dialogue
or an AI service. No durable-learning claim or outcome measure is added.

Signal geometry and placement rules are unchanged. No dependencies, saved
responses, analytics, or network services were added. Local changes only;
no commit, push, or deployment. See validation.md for checks and limits.

## 2026-09-16 - Correct placement, recovery, and access claims

Independent review found a zero-stone landscape placement that contradicted the
walled-lot assessment, a stranded lantern after a low placement, and Tab
interception that blocked ordinary access to required controls.

Added a visible foundation and continuous built-support requirement, keeping
placement eligibility separate from the geometry-only signal criterion. Added
free lantern retrieval, a height/lane planning dialog, native Tab navigation,
and repeated intervention attempts with fresh conditions. Removed the unused
ladder option and inert reduced-motion checkbox. Dragging now looks without
also cutting. Updated tallies and active-time accounting, and corrected copy
that equated feasibility with productive friction or invariant criteria with
identical cognitive difficulty.

Added a printable facilitator guide and links to Friction Lab and The Friction
Atlas. Kept all runtime dependencies local. Added regression and controller-flow
tests; `node --test` passes 24 tests. Browser validation and remaining limits are
recorded in `validation.md`. Local changes only; not published.

---

## 2026-09-16 - Published

Live at https://minerclass.github.io/groundwork/ and linked from the games hub.

Pages had to be switched on by hand first, as on the sibling repositories:
`actions/configure-pages` fails until Settings -> Pages -> Source is set to
GitHub Actions, and the workflow token cannot do it. Verified after the deploy
rather than from a green check: the live page and every asset returned 200, and
the near yard was played to completion on the deployed build, lantern up at 10.

---

## 2026-09-16 - First build

**The concept came before the voxels.** The brief was a Minecraft-style game about
the five media environments. Those already have two treatments in the games hub,
and the catalogue had no game at all for infrastructural friction, which a
building game is unusually well suited to: what you can build is decided by
reach, tools, light, and distance to material. So the subject changed and the
medium stayed.

**The guarantee is structural, not stated.** `lanternCarries()` takes geometry and
nothing else, so no tool, light level, or lot can reach it. The tests assert that
every combination of the four affordances leaves the answer where it was. That is
the framework claim - infrastructure decides whether a learner reaches the work,
not how hard the work is - expressed as something that would fail loudly.

**Reachability is a traversal, not a distance.** Deciding whether a lot is workable
floods from the builder through what they can walk, step, and cut. Early versions
were wrong in instructive ways: the wall did not enclose anything, the spawn was
inside it, and the obstructions were built from the same stone the player needed,
so the ridge could simply be mined. Each of those made the walled lot workable
and the whole point collapse.

**Four defects came out of playing it rather than reading it.** A pit you cut
yourself could trap you. The tower could not be built at all, because a builder on
the ground cannot see the top face of a column above eye height - the
completability proof had assumed a placement the controls did not permit. The
crosshair never said which face it was on, so towers became paths sideways. And
the far field's stone was hard to find rather than merely far, which is a
wayfinding defect rather than friction worth keeping.

**The ending used to lie.** It asserted the walled lot "became possible" whichever
condition you changed, which is false for the two that do not address the barrier.
It now reports what happened.

**Verified.** 15 tests. One complete playthrough: all three lots, the refusal when
declaring a merely-expensive lot impossible, the agreement when declaring the
walled one impossible, the debrief, a condition change, the replay, and the
ending. See `validation.md`, including what was not tested.
