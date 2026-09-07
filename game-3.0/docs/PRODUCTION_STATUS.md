# Tweety Pop Deluxe — 3.0 RC

This is a production candidate, not final acceptance. The existing approved game was extended in place; it was not rewritten.

## Golden baseline

- Repository: https://github.com/FlobbyA/tweety-pop-deluxe
- Baseline commit: fe56fec0cd755bcffda50894512fca50e22334ad
- Local preserved branch: baseline/build-2.2
- Working branch: production/3.0
- All four supplied ZIP files have the same Git blob hashes as the repository's corresponding files.
- Existing game-2.2.js and style-2.2.css remain unchanged. `baseline-2.2/index.html` in the delivery ZIP opens the complete original separately.
- Remote backup creation failed: GitHub API 403 `Resource not accessible by integration`. No remote files were changed.

## Implemented

- Twelve configurable stages. Stage 1/2 random layout rules and pressure values retained; stages 3–12 add varied gaps, rows and progressively increasing pressure.
- Launch speed 690, drag .988 at 60 Hz, wall restitution .94 and guide simulation length 1.7 seconds retained. Small update substeps improve stability and guide alignment; tactile validation still needed.
- Same match-three, floating cluster, scoring, bomb reward and non-score-based clear logic.
- Clear transition cancellation on restart; max combo resets for a new campaign.
- Next Egg stays visible while the current projectile is in flight.
- Pause/resume, background-tab pause, captured single-pointer touch input, cancel handling, visible mobile sound control.
- Helper up-arrow BALL; +1500 and 18-pixel pressure relief preserved, distinct from hatch.
- Hatch creates a happy Tweety and falling shell pieces; +1000 and original 14-pixel relief preserved.
- Original external character pose family, egg family, backdrop, stone tile, beam and candy status plaque. Named manifest resources.
- Original pre-rendered SFX and a 51.2-second unobtrusive music loop. Audio concurrency capped at 12; original procedural SFX remain as loading fallback.
- Helper phrase uses the device's English speech synthesizer when supported.
- Versioned entry CSS/JS/config and resource query strings; no service worker.

## Still not accepted / limitations

1. Character images are opaque indigo RGB, not transparent sprites. Image generation did not deliver a real alpha channel after an extraction request. Circular runtime clipping is used. Some poses may be clipped and should receive a proper transparent-art replacement before final approval. Face marking fidelity requires the owner's assessment.
2. Helper speech is device-generated, so a consistent childlike cat performance is not guaranteed. Hatch is an original short synthesized chirp, not a recorded baby-cat vocal. Replace audio after an original voice treatment is available.
3. Difficulty beyond level 2 is an original proposed curve. No exact Dynomite internal constants were verified; no claim of exact equivalence is made.
4. No real Android or browser-rendered visual/performance QA has been completed. Automated checks exercise logic using a mocked canvas, not a real browser.
5. GitHub Pages live inspection could not complete from this environment (web fetch refused and direct request timed out). Current live deployment has not been verified, and 3.0 has not been deployed.
6. Random level layouts require playtesting for fairness, particularly the final stages.

## Tests

Run from project root: `node tests/regression.cjs`.
15 checks: level config, launch/drag, wall restitution, match/drop, score-only non-clear, clear-timer retention, debris escape, all twelve state transitions, restart cancellation, pause, helper reward, hatch reward, loss idempotence, guide constants, and draw-path smoke checks.
These are not evidence that a person can clear all twelve levels.

## Inspiration research

The original publisher's Steam product description confirms the slingshot/match-three and descending threat concept: https://store.steampowered.com/app/3380/Dynomite_Deluxe/
No original game graphics, music, recordings or code were downloaded or used. The 2.2 approved hybrid of continuous pressure plus shot-based stomps takes priority over trying to recreate a different original game mode.
