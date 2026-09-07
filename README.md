# Tweety Pop Deluxe — Full-Feel Test v2

A mechanics-complete two-level test intended to feel much closer to a finished early-2000s egg shooter.

## Core gameplay
- Long trajectory prediction with side-wall reflections and impact marker.
- Weighty launch, drag, wall impacts, pop/drop particles and procedural sound.
- Match 3+, detached-cluster gravity drops and real board-clear level completion.
- Finite falling-piece lifetimes prevent level-clear deadlocks.

## Pressure / difficulty
- The upper beam now continuously creeps downward.
- Level 1 pressure is deliberately slow.
- Level 2 pressure is more than twice as fast.
- Periodic shot-count "STOMP" pulses push the field further down, with stronger/faster pressure in level 2.

## Satisfaction / bonus systems
- Successful consecutive matches build COMBO.
- Four-match combo rewards a bomb shot that clears a radius and pushes the ceiling upward.
- Large groups award BIG POP bonus feedback.
- Occasionally an egg begins shaking. Pop its matching cluster before time expires to hatch a Tweety reward and bonus score.
- A placeholder flying Tweety periodically enters with “BONUS IS COMING!” and drops a golden bonus egg.
- Shoot the golden egg before it expires for bonus points and ceiling relief.

## Verification
The HUD shows `Build 2.0`. JS/CSS use cache-busting query strings so mobile browsers request this build.

Final visual art is still placeholder/procedural; this build targets gameplay feel and timing.
