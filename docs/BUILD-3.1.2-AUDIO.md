# Build 3.1.2 — Audio integration only

Baseline:3.1.1 commit5541739. Latest attached packs were actually named `impactsound(2).zip` and `mood(2).zip`; those were used, not older archives. All16 source files copied byte-for-byte, with stable filenames under `assets/audio-3.1.2/`. No audio embedded in JS, no format conversion. Corrected Gameover_fix used; oversized Gameover.wav excluded.

| Source | Stable role / filename | Event |
|---|---|---|
| eggtouched.wav | sfx_egg_touch.wav | Normal attach without match |
| blob.ogg | sfx_egg_pop.ogg | Successful normal match |
| cracked.wav | sfx_egg_shells.wav | 85ms after normal pop |
| bonuscracked.ogg | sfx_bonus_break.ogg | Matched cluster containing shaking target; replaces normal pop |
| AirAirBonus.wav | vocal_bonus_hatch.wav | Hatch appearance +35ms |
| Nice-happy.wav | vocal_nice.wav | Accepted Nice / relief reaction |
| GoodMatch.wav | vocal_good_match.wav | Accepted combo/big-pop reaction |
| Missed.wav | vocal_missed.wav | Third consecutive miss, if reaction accepted |
| Annoyed.wav | vocal_annoyed.wav | Fourth/fifth consecutive miss, if accepted |
| dissapointed.wav | vocal_disappointed.wav | Sixth+ consecutive miss, if accepted |
| Danger.wav | vocal_danger.wav | Careful reaction, lowest egg edge470–520 |
| Warning.wav | vocal_warning_01.wav | Careful reaction above520; variation pool |
| warning-alternate.wav | vocal_warning_02.wav | Same warning context, avoid consecutive repeat |
| HelperArrives.wav | vocal_helper.wav | Accepted helper arrival reaction |
| LevelClear.wav | vocal_level_clear.wav | Level Clear |
| Gameover_fix.wav | vocal_game_over.wav | Game Over |

All files are one-shot/non-looping. WAVs remain their original PCM8/16 encoding; OGGs are Vorbis. Durations range .175–2.204s. Existing browser decodeAudioData loader fetches/decodes after first user interaction. Music, artwork, layout, stage data, helper logic, score, bomb feedback and physics are unchanged.

Manifest `config/assets-3.1.2.js`: `sfx` contains paths, `vocals` maps reaction contexts to pools, `gains` sets relative levels. Replace the same filename/format and bump release cache version when publishing updated audio. Recommended short vocals .3–2.5s, zero/very short leading silence; impacts .1–.3s, shells .3–.8s. No transparency/dimensions apply to audio.

## Event routing / mixing

Removed unconditional collision sound before match detection. Failed normal match => touch only. Successful normal match => pop then shells, with redundant generic drop sound suppressed for this path. Hatch => dedicated break then baby voice, without normal pop/shells. Bomb path and dedicated three layers untouched.

WebAudio clock schedules impact aftermath; no gameplay/visual timing changed. Gain multipliers before existing .65 master: touch .35, normal pop .65, shells .4, special break .65, supplied voices .7. Existing music remains beneath effects at its original level. These are initial mix settings; actual perceived loudness needs device listening.

Existing accepted reaction gate (3.5s), normal voice probability42%, voice cooldown7s and per-context important-repeat protection8s retained. No new bubbles or expressions. Only voice context selection added for existing reactions. A single vocal channel prevents stacking: ordinary/equal priority voices are skipped while busy; strictly higher priority replaces the current voice. No stale queued vocals. Hatch voice shares this channel and has priority3. Result voices priority4. A busy/skipped voice does not delay the visual event.

Mute, pause, hidden-tab and new-session cleanup stop active/scheduled SFX and voices; continuation/Start remain unblocked. Missing impact files fall back to legacy sound path; missing vocals become silence. Important: level-clear preparation allows the last pop aftermath to finish before result presentation. Music/cues retain existing autoplay handling.

## Validation / limits

Commands from repository root:
```
node tests/regression-312.cjs
node tests/audio-312.cjs
node tests/voices-312.cjs
python tools/verify-312.py
```
35 gameplay/routing checks +12 audio lifecycle checks +6 real-buffer mock checks. Verified non-overlapping voices, audio-clock85ms shell delay, priority interruption, mute/hidden cleanup, optional-file fallback. Source hash comparison confirms16 files equal latest archives. ffprobe/ffmpeg decoded all16 original PCM/Vorbis files. This is not Android-browser playback verification; real mobile loading, latency and perceived loudness still require user testing. No browser binary was available for actual rendering/audio QA.

Non-audio existing files retained, including3.1.1 rollback. Separate preexisting uncommitted edits in the earlier workspace were left untouched; this patch contains no music change. No GitHub push attempted.

## Upload / rollback

Apply ZIP contents to existing3.1.1 repository root, preserving folders. Root index loads game/assets/manifest3.1.2 with versioned references; same GitHub Pages URL. Keep all older files. Roll back by copying `rollback/index-3.1.1.html` to root `index.html`.
