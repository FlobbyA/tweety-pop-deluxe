# Tweety Pop Deluxe — Build 3.1 RC (3.1.0)

Based on human-approved 3.0.2, commit 0bfa686. This is a release candidate pending Android playtesting, not a final release. Root patch requires the existing 3.0.2 deployment. No GitHub write attempted.

## Gameplay preservation and expansion

Levels 1–12 preserve every non-helper configuration value. Shooting, guide/reflection, cluster/drop, bomb radius/rewards/layers, manual continuation, scoring and helper lifetime remain unchanged. Twelve-level human approval does not imply human approval of the three new levels.

| Level | Pressure px/s | Rows | Density | Stomp every shots | Stomp px |
|---|---:|---:|---:|---:|---:|
| 12 (unchanged) | 2.90 | 10 | .86 | 4 | 15 |
| 13 Beyond Moonrise | 3.12 | 10 | .87 | 4 | 15 |
| 14 Twilight Summit | 3.48 | 10 | .88 | 4 | 16 |
| 15 Final Challenge | 3.80 | 10 | .89 | 3 | 16 |

New stages use existing pattern rules and present-color ammunition, not new gimmicks. Actual difficulty/fairness requires skilled human mobile playtesting. Automated progression tests clear fixtures; they are not simulated human victories.

## Situational helper

Early first/repeat timers keep 3.0.2 values (40/48, 37/44, 34/40 seconds, same jitter). Later first timers are at least 29s; repeat timers at least 34s, ±5s jitter. Timing makes an event eligible, never mandatory.

No spawn while the lowest egg edge is at/below y430 (safe). Between y430 and535, probability per eligible attempt rises linearly from12% to72%. Unsuccessful consideration retries after6–8s. Active pointer aiming, a projectile, flyer, target, pause or transition defer consideration. Minimum cooldown after removal26s; successful relief36s. Thus late stages never gain increasing rescue frequency solely from level number. At normal late settings, a whole new event cannot begin less than29s after the preceding spawn, and successful relief waits36s from the hit. All values live in `config/levels-3.1.0.js`.

The existing9s active/45s wall-clock target lifetime and offscreen/invalid-state cleanup remain. Paused or hidden stale targets are removed on the next loop; normal movement waits for Resume.

## Character and UI

Supplied nine PNGs copied byte-for-byte into `assets/characters-3.1/`. Previous assets remain available for rollback. Canvas rendering preserves aspect ratio and removes circular clipping. Separate canvas pedestal supports stationary sprites; flying/hatch sprites have none. Speech bubbles live below aiming origin, with no pointer handlers. Original pastel scalloped SVG supports the enlarged raised-paw opening hero.

`tweety_campaign_reward.png` is new generated artwork: Tweety proudly carries a tuna in the mouth, with true RGBA transparency. The supplied raised-paw image was the identity/style reference. Generated with built-in image generation, prompt: same plump tuxedo Tweety, olive-yellow eyes, asymmetric muzzle, black tail/back, white chest/paws, matching painted outlined casual-game style; sitting happy/proud with a blue-silver tuna naturally crosswise in mouth; full-body transparent sprite; no text, pedestal, frame or colored background. Artist/user approval remains welcome; role can be replaced independently.

Campaign completion occurs only after Level15, with reward art, stars, full-campaign score/combo summary and Play Again/Main Menu. Star animation is finite, compositor-friendly, respects reduced-motion, and has no gameplay particles or timers.

## Reactions and audio

Each accepted scorekeeper event updates expression and bubble together and optionally plays a corresponding vocal at the same moment. Normal voices:42% probability,7s cooldown. Important priorities can override normal cooldown but each voice context has8s repeat protection. Variation pools avoid consecutive repeat when possible. Bubble/message gate remains3.5s and honors priority. Silent files are intentional placeholders; no synthetic pretend-cat recording.

Menu, ready, gameplay, result and campaign are distinct audio scenes. Campaign music replaces gameplay music. Applause/cheer fire once on entry. User gesture unlock, mute, hidden-tab pause, rejected play promises and missing-file fallbacks retained. Missing optional vocals never block gameplay. The temporary celebration music is original procedural wood-like melody/bouncy bass/dry percussion, not sampled copyrighted material.

## Asset contract

All roles are in `config/assets-3.1.0.js`; all paths relative to repository root, version query3.1.0 applied by loader. Replace same file to change media; increment manifest/cache version for public updates. Never add reference soundtrack recordings.

| Role / expected filename | Purpose | Format / dimensions or duration | Loop | Current fallback |
|---|---|---|---|---|
| `assets/audio/cat_nice_01.wav`, `cat_nice_02.wav` | approval | PCM WAV mono,22.05/44.1kHz; .25–.7s | No | .12s silence; missing => silence |
| `cat_excited_01.wav`, `cat_excited_02.wav` (same directory) | big pop | WAV; .3–.9s | No | silence |
| `cat_combo_01.wav`, `cat_combo_02.wav` | combo | WAV; .3–.9s | No | silence |
| `cat_annoyed_01.wav`, `cat_annoyed_02.wav` | repeated misses | WAV; .3–.8s | No | silence |
| `cat_danger_01.wav` | danger | WAV; .3–.8s | No | silence |
| `cat_helper_01.wav` | incoming/relief | WAV; .3–.9s | No | silence |
| `cat_bomb_01.wav` | anticipation/impact | WAV; .3–.8s | No | silence |
| `cat_level_clear_01.wav` | clear pride | WAV; .4–1.2s | No | silence |
| `cat_game_over_01.wav` | defeated | WAV; .4–1.2s | No | silence |
| `cat_campaign_complete_01.wav` | final celebration | WAV; .5–1.5s | No | silence |
| `assets/music/music_campaign_complete.wav` | celebration theme | WAV; recommended8–24s, temporary15.238s/126BPM | Yes, seamless | original temporary tune; missing => silence |
| `assets/audio/sfx_campaign_applause.wav` | applause once | WAV; recommended .8–2s | No | .12s silence |
| `assets/audio/sfx_campaign_cheer.wav` | cheer/woo once | WAV; recommended .5–1.5s | No | .12s silence |
| `assets/characters-3.1/tweety_campaign_reward.png` | tuna gift | RGBA PNG transparent; recommended512–1280 square, actual1254 square | No | level-clear PNG if missing |
| `assets/ui/hero_emblem-3.1.svg` | original hero emblem | SVG240×240, transparent exterior | No | surrounding panel |
| existing nine `assets/characters-3.1/tweety_*.png` | role-specific sprites | supplied351×394 or400×400 RGBA, keep full silhouette | No | existing simple canvas fallback where available |

Bubble geometry/palette and pedestal are independently editable presentation functions `speechBubble`/`pedestal` and `BUBBLES` (no changes to gameplay needed); hero, modal and star styles in `style-3.1.0.css`. SFX files should have gentle peaks, trimmed leading silence, no clipped samples. Rebuild placeholders/tune using `tools/render-audio-310.py` only before replacing with final media: rerunning it overwrites these temporary roles.

## Validation / upload

Run from project root:
```
node tests/regression-310.cjs
node tests/audio-310.cjs
python tools/verify-310.py
```
33 game checks +12 audio checks;58 manifest paths and PNG/WAV validation. Unchanged gameplay functions and every preexisting tracked file other than active index verified against3.0.2. New15-stage progression requires Continue; no stage16 is loaded. Original3.0.2 files and older golden baselines are untouched.

Extract ROOT PATCH contents into repository root, preserving folders; replace active index. Do not delete baseline-2.2, game-3.0, source-history or previous runtime/config/media. Same Pages URL remains. Rollback: copy `rollback/index-3.0.2.html` to root `index.html`; all referenced old assets remain untouched.

Android acceptance: inspect opening face/controls; hear supplied future vocals only after gesture; test repeated ordinary reactions/danger; aim while helper eligible; verify36s successful-relief spacing; test pause/background arrow expiry; play through new13–15; inspect final gift/music/buttons. No real Android playthrough or public Pages deployment was performed for this candidate.

Browser rendering verification was unavailable: this workspace had no browser binary and the Chromium download failed (network timeout/502). Automated checks use VM/canvas mocks, not an actual browser renderer. Mobile fit and performance therefore require device confirmation.
