# Build 3.0.2 — targeted gameplay polish

Built on the already uploaded and owner-playtested 3.0.1. The owner reached level 11/12 and confirmed increasing difficulty. No repository push was attempted in this pass.

## Changes

- Every cleared level now settles its debris (maximum two active seconds) and presents a persistent LEVEL CLEAR panel with completed level, total score, this-level score gain and best level combo. Continue To Play is the only route to the next level. The final stage offers Play Again / Main Menu. No next-level timeout exists. Pressure, helper/hatch timers and shooting are stopped while resting.
- The helper target formerly clamped its y coordinate to 500 and reset velocity to zero. That stop is removed. The target falls until hit or offscreen. Game-over and clear transitions clean it up. Invalid numeric state, nine active seconds of target life, or a 45-second wall-clock safety bound also remove it. Normal short pauses freeze movement; very long pauses may remove the target via the safety bound.
- Helper start/repeat delays are level data, with bounded jitter and no overlap. A post-removal gap prevents closely spaced rescues. Level 9–12 repeat means remain 16,16,15,15 seconds. No pressure, stomp, density, scoring, or shooting-physics constants change.
- Bomb impact triggers dedicated external audio: punch at impact, crack at +35 ms, shell cascade at +150 ms. A short expanding ring, modest shake and up to 28 shell pieces (40 total cap) accompany it. Existing radius 92, reward calculation and pressure relief are preserved. Sound loading failure uses short procedural fallbacks.
- Bottom-left Tweety is labelled SCOREKEEPER, with contextual reactions and a short non-interactive status bubble. Messages are throttled 3.5 seconds; higher-priority danger/bonus messages can override. Bubble is below the launch origin and installs no DOM/touch input handlers. No new character art or soundtrack was generated.

## Helper timing (seconds)

| Level | First arrival delay | Repeat delay | Jitter ± | Minimum gap after target removal |
|---|---:|---:|---:|---:|
| 1 | 40 | 48 | 6 | 12 |
| 2 | 37 | 44 | 6 | 12 |
| 3 | 34 | 40 | 5 | 11 |
| 4 | 29 | 34 | 5 | 10 |
| 5 | 25 | 29 | 4 | 9 |
| 6 | 22 | 25 | 4 | 8 |
| 7 | 19 | 22 | 3 | 7 |
| 8 | 17 | 19 | 3 | 6 |
| 9–10 | 14 | 16 | 2 | 6 |
| 11–12 | 14 | 15 | 2 | 6 |

Delays measure helper appearance, not the later ball drop. Timer time is active gameplay time only. Existing flyer/target must finish before another begins.

## Replaceable bomb audio

| Role / filename in assets/audio | Format | Length | Playback |
|---|---|---:|---|
| sfx_bomb_impact.wav | 22050 Hz mono, 16-bit PCM WAV | 0.32s | Once on impact |
| sfx_bomb_crack.wav | Same | 0.31s | Once, 35ms after impact |
| sfx_shell_cascade.wav | Same | 0.82s | Once, 150ms after impact |

Original synthesized temporary effects; no sampled copyrighted material. Swap files with matching names, then bump manifest version for cache invalidation. Script: tools/render-bomb-302.py. Normal shot feedback and all music files are retained.

## Verification

- `node tests/regression-302.cjs`: 27 game tests, including all 12 manual transitions, final replay, rest-state freeze, helper movement past y500, hit reward/removal, pause/resume, maximum lifetime, corrupt state, cleanup, timing differences, bomb layer ordering/caps, scorekeeper throttling and unchanged touch handlers.
- `node tests/audio-302.cjs`: 10 audio lifecycle checks including mute, missing assets, blocked autoplay, hung cues, and hidden tabs.
- `python tools/verify-302.py`: 47 relative asset references, unchanged pressure/density/stomp and core shooting/aim functions, and unchanged existing repository files except root index.html.

These are mocked-runtime and static checks, not a new real Android playtest or proof a human can complete all twelve levels. Please check the actual bomb sound balance on your phone and the rest/Continue flow after upload.

## Install / rollback

This is an incremental ROOT PATCH for the installed 3.0.1, not a standalone game ZIP. Extract and upload its contents directly to the existing repository root; preserve all other files and folders. The root header should read Build 3.0 RC · 3.0.2 after Pages deployment. The public URL remains unchanged.

The patch includes rollback/index-3.0.1.html. To return to the playtested build, copy that file back to root as index.html. All 3.0.1 resources and the 2.2 golden baseline remain unchanged. Future root code uses versioned 3.0.2 resources and config paths.
