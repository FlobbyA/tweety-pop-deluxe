# Build3.1.4 — Motion responsiveness

Baseline3.1.3 commit039061b; user confirms Android/iOS/desktop rendering fix. This patch preserves that exact SVG bitmap cache module, backing resolution, CSS, all image/audio/config files and the game loop. No further performance redesign.

## Smallest requested increase selected: +25%

Nominal3.1.3 launch speed690 game units/s. Effective3.1.4 launch travel speed862.5 units/s (690×1.25). Rather than multiplying speed while leaving drag tied to the old clock, flight alone advances1.25× along the same normalized spatial path. This retains drag per traveled path, wall restitution.94, the same690/1.7s predictive guide, shot angles, range and spatial behavior. Only wall-clock travel duration changes (~20% shorter). No launch wait, timeout, easing or velocity ramp exists: pointer release immediately creates the shot and the next visible frame moves it.

`PROJECTILE_RATE=1.25`, `PROJECTILE_STEP=1/120` in game-3.1.4.js. Collision movement uses the original1/120s spatial ticks, at most~5.72px at launch, rather than larger displacement steps. Each tick still checks side walls, helper, ceiling and eggs. Thus faster flight does not introduce larger collision gaps. This is appropriate stepping, not a new swept collision system; it does not claim to solve every preexisting pathological grazing case. Fractional-tick visual interpolation keeps movement continuous at60/90/120Hz rather than alternating visible tick jumps. Render coordinates do not affect snapping or hit detection; side-wall endpoints remain clamped. Shot scale/age retain real-time behavior.

Bomb projectile uses the same faster flight; bomb blast radius, damage/scoring, relief and audiovisual impact remain unchanged. Detached eggs, shell fragments, particles, helper and hatch motion retained: no evidence justified changing them in this small pass. UI and reactions unchanged.

## Representative A/B measurements

Deterministic frozen-field fixture:70 eggs in rows0–6, identical aim and colors; pressure disabled only in the test fixture to isolate geometry from time-varying targets. Times measured at simulated rendered frame boundaries, quantized to that refresh interval. All nine cases across60/90/120Hz had identical attachment cells.

| Shot at60Hz |3.1.3 launch→collision |3.1.4 | Attachment row,col |
|---|---:|---:|---|
| Direct |.583s |.467s |7,4 |
| Angled |.617s |.500s |7,7 |
| One-wall reflection |1.000s |.800s |7,5 |

90/120Hz measurements in motion-ab-314.json. Additional123 combinations (41 angles across60/90/120Hz, including reflecting/shallow directions) retain identical attachment cells and shorter travel times; motion-sweep-314.json. No exact target equivalence is claimed for arbitrary moving targets: the live beam/helper moves for less wall-clock time before faster contact. This is the intended earlier arrival, not a difficulty-data change. All15 level data, pressure px/s, stomp thresholds, helper intervals and timers remain identical. Faster shots naturally change player throughput; no compensating rebalance was added.

## Audio / remaining behavior

Collision block moved intact into moveProjectile. Sound still fires only on actual attach/match/hatch/bomb impact; normal shells follow collision by85ms and hatch voice retains35ms event offset. No guessed travel-duration audio timer. Match/drop/scoring/continue/pause/helper logic unchanged. Paused flight retains its fractional state and resumes without accumulating pause time.

## Validation and limits

-39 existing/new game checks,12 unchanged audio lifecycle checks,6 unchanged voice tests.
-9 representative travel comparisons +123 wider angle/refresh comparisons.
-Real headless Chrome131 Linux with mobile viewport448×960,DPR3,CPU4 still measured~60FPS using the unchanged cache. Real touch-generated shot, pause/resume, loading and campaign-complete fixture passed with no page errors.
-Original cache resources still use1,801,800 nominal RGBA bytes; same rendering quality/backing size.
-Launch, aimLine, snap, cluster/drop, helper, bomb and loop source checked identical; original files retained except active index. No source image or audio modifications.

Device smoothness for3.1.3 was human-approved. New3.1.4 has not yet been physically tested on Android/iOS; Linux emulation cannot certify those devices. The25% setting is selected from measured timing and the lower end of requested tuning, pending the owner's subjective snappiness judgment. Tests support correct geometry on tested layouts, not an exhaustive proof for every possible board.

## Test commands
```
node tests/regression-314.cjs
node tests/motion-ab-314.cjs
node tests/motion-sweep-314.cjs
node tests/audio-312.cjs
node tests/voices-312.cjs
python tools/verify-314.py
node tools/browser-check-314.cjs
```
Browser script uses environment-specific Playwright/Chrome locations as in3.1.3 and a localhost test server. It does not modify production game state outside its test-only injection.

## Upload / rollback

ROOT PATCH on existing3.1.3; root index loads game3.1.4 and updated diagnostic metadata. Cache script still exactly render-cache-3.1.3.js. Preserve all older runtime/media files. Same Pages URL. Roll back by copying rollback/index-3.1.3.html to root/index.html. No GitHub push attempted.
