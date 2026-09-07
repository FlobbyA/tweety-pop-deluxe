# Build3.1.5 — Initial launch impulse only

Baseline3.1.4 commitd830324 remains intact. No change to the SVG bitmap cache, level data, world timers, audio, UI, effects or artwork.

## Tuning

Keep the approved projectile travel rate1.25 (effective initial862.5units/s before this patch). Add15% flight-clock impulse immediately for the first120ms; taper that extra rate linearly to zero over the next120ms. From240ms onward, the travel clock uses the original3.1.4 rate only. Initial effective rate is~991.9units/s. No further global speed increase was applied.

This is a retiming of the same spatial path, not added gravity or bowling simulation. The integrated launchBonusTime function avoids refresh-dependent ramp sampling. Maximum accumulated head start is27ms of3.1.4-equivalent travel; it does not keep growing for a long reflection shot. Existing drag per path and wall restitution remain unchanged.

No delayed launch, gentle velocity ramp or first-frame suppression was found. Pointer release already creates the projectile immediately. Existing sub-tick interpolation is retained because it prevents visible cadence stepping; it does not postpone release. Cosmetic sprite scale animation remains unchanged. The new impulse starts at maximum rather than easing into it.

## Measured first motion

Deterministic direct-shot fixture, simulated120Hz:

| Time after release |3.1.4 displacement |3.1.5 displacement |
|---|---:|---:|
|100ms |82.21px |93.91px (+14.2%) |
|200ms |157.31px |175.74px (+11.7%) |
|240ms |185.49px |203.95px |

## Travel A/B

Same static70-egg field, same angle/color, pressure disabled only in isolated test fixture. Launch-to-collision measured at frame boundaries:

| Shot |3.1.4 at60Hz |3.1.5 at60Hz |3.1.5 at120Hz |
|---|---:|---:|---:|
|Direct |.467s |.450s |.442s |
|Angled |.500s |.467s |.467s |
|One-wall |.800s |.767s |.767s |

Long-shot timing intentionally remains above the optional.70–.75s reference rather than globally accelerating the entire trajectory. Priority was the initial impulse and smallest adjustment. Times are fixture-dependent, not fixed shot durations.

Nine representative comparisons plus123 angle/refresh cases all preserved attachment cells at60/90/120Hz. Current max spatial collision step is still~5.72px, because impulse speeds up the flight clock, not the integration displacement. No larger tunneling gap was introduced. As before, this is stepped collision, not an exhaustive proof for arbitrary grazing geometry. Moving field/helper positions may differ at earlier arrival times; their real-time motion remains unchanged.

## Validation

40 game checks +12 existing audio lifecycle +6 vocal checks passed. Separate132 A/B geometry comparisons passed; raw results in motion-ab-315.json and motion-sweep-315.json. First100/200ms data in launch-ab-315.json. Baseline cache/level/audio/UI files and launch/aim/match/helper/bomb/game-loop functions verified unchanged.

Real headless Chrome131 Linux mobile viewport/DPR3/CPU4:~59.5FPS; cache active, touch-generated shot, pause/resume and campaign-complete fixture passed with no page errors. This is not physical Android/iOS validation and cannot establish subjective bowling-ball feel. User device retest remains the acceptance step. Impact audio stays tied to collision/match/hatch events, never guessed travel duration.

## Upload and rollback

Apply ROOT PATCH over3.1.4 at existing repository root. Keep old files. Root loads game3.1.5 and updated diagnostic version metadata; cache remains render-cache-3.1.3.js unchanged. Same Pages URL. Rollback: copy rollback/index-3.1.4.html to root/index.html. No GitHub push attempted.

Tests:
```
node tests/regression-315.cjs
node tests/launch-ab-315.cjs
node tests/motion-ab-315.cjs
node tests/motion-sweep-315.cjs
node tests/audio-312.cjs
node tests/voices-312.cjs
python tools/verify-315.py
```
Browser check script follows the environment-specific Playwright/Chrome paths used by prior builds.
