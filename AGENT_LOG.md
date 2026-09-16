# Agent Log

Append-only record of automated and agent-assisted changes to this repository.
Newest entry first. No participant data, committee or faculty names, credentials,
or tokens.

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
