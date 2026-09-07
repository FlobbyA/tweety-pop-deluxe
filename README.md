# Tweety Pop Deluxe — Full-Feel Test v2.1

Hotfix for level progression after a fully cleared board.

## Fixed
- Level-clear timer is now armed only once instead of being reset every animation frame.
- Level transition clears temporary flyer/bonus/hatch state when the board is empty.
- Cosmetic falling pieces and particles can no longer deadlock progression.
- After the board is empty, the game waits briefly for visual debris, shows `LEVEL CLEAR!`, then advances automatically.
- Build marker updated to `Build 2.1` with cache-busted JS/CSS.

All Full-Feel v2 systems remain: long reflected aiming guide, weighted shooting, continuous descending beam, stomp pressure, combo/bomb rewards, shaking hatch bonus, and incoming bonus event.
