# Build 3.1.3 — Targeted render cache, provisional Android fix

## Conclusion and evidence boundary

Repeated SVG-to-Canvas drawing is a measured rendering bottleneck in the reproduced **Linux desktop Chromium mobile-viewport + CPU4 throttling configuration**. Rasterizing ten reusable SVG resources once reduced draw-submission cost and restored measured rAF cadence to60Hz. This is a justified, small implementation optimization, not proof of the precise cause on Pixel9 Pro XL. No physical Android, iPhone or iPad was tested. Device-specific GPU/compositor scheduling and power/refresh settings remain possible contributors until device A/B results arrive.

## Before/after measurements

Chrome for Testing131.0.6778.204 headless, Linux container, Playwright/CDP. This older available browser is not the user's current Android Chrome engine. Test: same fixed83-egg level12 fixture,240 rAF intervals per condition,180 repeated draw calls with function timers; all six conditions run sequentially. Throttling does not reproduce an Android GPU, refresh controller or power management. Numbers are one matched run, not population statistics; raw output saved in `benchmark-ab-313.json`.

| Configuration | Original FPS | Cached FPS | Original frame p95 | Cached frame p95 | Original draw mean | Cached draw mean |
|---|---:|---:|---:|---:|---:|---:|
| Desktop1280×900,DPR1 | 60.0 | 60.0 | 16.7ms |16.8ms |5.74ms |1.34ms |
| Mobile448×960,DPR3,CPU1 |60.0 |60.0 |16.7ms |16.7ms |5.81ms |1.30ms |
| Mobile448×960,DPR3,CPU4 |29.7 |60.0 |50.0ms |16.8ms |28.40ms |5.97ms |

For mobileCPU4, egg draw aggregate3970.4ms→779.6ms; background976.1ms→177.8ms over180 draws. Aim predictor82.8ms→70.2ms: it was not the dominant observed cost. Nested function totals overlap; do not add them to total draw time. CPU draw timings are command submission/backpressure, **not isolated GPU completion times**. Profiling forced batches differs from ordinary rAF rendering; rAF statistics measured separately before wrappers. Heap API returned rounded10MB and is not evidence of GC absence.

## Small fix

`render-cache-3.1.3.js` waits for existing image loading, then draws egg SVGs, stone, beam, background, helper target and status label into small in-memory canvases once at each SVG's authored width/height. Subsequent drawImage calls use those cached surfaces. Character PNGs unchanged. Ten caches use1,801,800 nominal RGBA bytes (~1.72MiB), excluding browser overhead. Original external SVG files remain replaceable; reload rebuilds caches. Failed cache creation retains the original renderer. The cache has no per-frame allocations and no resizing during play.

No reduced DPR, no lower game backing resolution, no fewer particles, no omitted effects, no changes to gameplay speed, no new fixed FPS cap. Full game source outside the optional diagnostic loop is byte-identical to3.1.2. Audio manager/config, music, image files, CSS, level configuration and pointer handlers are unchanged. Old3.1.2 runtime remains present for rollback.

## What was investigated

- Single rAF chain; no duplicated pointer/touch chains or mobile timing branch; one draw per visible callback.
- Same elapsed-time loop and substeps<=1/120s. Existing56ms dt clamp drops excess time after a stalled frame; preserved rather than changing game speed. Diagnostic records clipped time.
-60/90/120Hz numeric loop tests preserve equal elapsed pressure. Actual display120Hz/90Hz not available; Linux compositor measurements were60Hz.
- Canvas backing store480×760=364,800 pixels in DPR1 and DPR3 cases. Mobile CSS432×684; no resize-per-frame and no DPR multiplication. DPR cap was not warranted.
- Each frame redraws scene; tiled stone32 drawImage calls and many SVG egg draws dominate the measured constrained configuration. SVG files contain gradients, no complex external filter chain. PNG characters/pedestals much smaller measured JS submission cost here.
- Two pedestal shadow blurs and speech-bubble paths remain unchanged; no measured reason to simplify them.
- Predictor allocates points/positions and does hypot checks; not dominant in this profile, left unchanged. Update filters/particle allocations retained; no GC trace established.
- DOM danger class toggle each frame and getBoundingClientRect on input, not a canvas resize loop. No evidence these caused the reproduced sustained slowdown, so no changes made.
- Particle limits, bomb/hatch/helper rendering and sound integration preserved. This benchmark emphasizes sustained field drawing; it does not establish worst-case GPU behavior during every effect combination.
- Local deployed URL access did not succeed in this environment; used approved local3.1.2 commit160fb51. No repository re-audit or push.

## Visual and browser checks

Real headless browser: Start, asset load, touch-generated shot, pause/resume, diagnostic sampling and campaign-complete fixture succeeded with no page errors. Saved native480×760 before/after images from an identical locked scene, inspected visually. Mean absolute RGBA difference0.139/255;11.50% pixels differ at least1 channel value, only0.1124% differ by>20. Changes are minor raster/antialias differences, **not pixel identity**. No detected geometry/layout change in the inspected scene; no downscaled character artwork. Source canvas examples in `canvas-before-313.png` and `canvas-after-313.png`.

55 VM automated checks (37 game including refresh/diagnostic checks +12 audio lifecycle +6 vocal routing), plus actual browser checks above. Entire non-loop game source byte-equality and all preexisting files except root index verified. Actual iOS behavior expected to stay compatible via standard Canvas2D/fallback, but not tested. No claim of complete device acceptance until Pixel retest.

## Optional real-device diagnostic

Normal URL: no performance UI, no telemetry. Diagnostic mode:

`?perf=1&hz=60` — cache enabled.

`?perf=1&hz=60&cache=0` — original SVG rendering for A/B.

Set hz90/120 only if testing that known device setting. Without hz, missed-vsync estimates use median-based inference and cannot establish physical display refresh. FPS is rAF cadence, not directly counted displayed frames.

Play30–60s on Pixel Chrome with the same sound setting and roughly comparable level/actions, then tap **Save performance JSON**. Repeat with cache0. Leave screen settings/power mode unchanged between runs. The overlay is read-only except its Save button; it adds diagnostic overhead to both conditions. Share both JSONs. JSON contains user-agent, viewport/DPR/backing size, frame rows, CPU update/draw-submission durations, p50/p95/p99, long frames, estimated missed vsync, existing clipped dt and optional LongTask/LongAnimationFrame data when browser supports it. States are separated; only playing rows enter gameplay summary. Hidden-tab gap resets. Raw ring buffer max7200 frames, observers capped200 entries. No data uploaded automatically.

Do not infer that audio is responsible from these measurements. Both A/B runs preserve the approved audio system. If Pixel stays choppy despite cached draws, these traces distinguish callback starvation vs JS/update/draw cost and guide the next focused investigation.

## Reproduce tests

```
node tests/regression-313.cjs
node tests/audio-312.cjs
node tests/voices-312.cjs
python tools/verify-313.py
node tools/benchmark-313.cjs
node tools/browser-check-313.cjs
```

Browser scripts require Playwright and a Chrome binary at the documented script path; paths are environment-specific, edit those two paths for another host. Benchmark starts its own localhost server, uses test-only state injection and never ships cheats in the game runtime.

## Deploy / rollback

ROOT PATCH applies over3.1.2, preserves same Pages URL and all older files. Root loads game/render-cache/perf3.1.3 via version queries. No CSS/audio/config replacement needed. Copy rollback/index-3.1.2.html to root/index.html to undo. New patch is a measured render optimization with **provisional Android acceptance**, not a verified final Android fix.
