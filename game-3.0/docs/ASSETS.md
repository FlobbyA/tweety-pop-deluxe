# Replaceable resources

All production paths live in `config/assets-3.0.js`. Replace a file in place or change its manifest path. Change `version` and the versioned references in index.html on every release. No game-logic edits are needed to replace artwork or music.

| Path / role | Purpose | Recommended size | Alpha / frames |
|---|---|---|---|
| assets/characters/tweety_launcher_back.png | Rounded black back at launcher | 320×320 or 512×512 | Transparent preferred, single frame |
| assets/characters/tweety_scorekeeper_neutral.png | Default deadpan | Same | Transparent preferred |
| assets/characters/tweety_scorekeeper_excited.png | Match and bonus | Same | Transparent preferred |
| assets/characters/tweety_scorekeeper_annoyed.png | Miss reaction | Same | Transparent preferred |
| assets/characters/tweety_scorekeeper_danger.png | Urgent reaction | Same | Transparent preferred |
| assets/characters/tweety_level_clear.png | Campaign completion panel | Same | Transparent preferred |
| assets/characters/tweety_game_over.png | Loss panel | Same | Transparent preferred |
| assets/characters/tweety_helper_flying.png | Incoming helper | Same | Transparent preferred |
| assets/characters/tweety_bonus_hatch.png | Joyful hatch | Same | Transparent preferred |
| assets/eggs/egg_0.svg … egg_4.svg | Red, blue, green, yellow, purple | 72×80; 40×44 viewBox | Clear background; single frame |
| assets/ui/helper_target.svg | Up-arrow help BALL | 80×80 | Clear background |
| assets/ui/stone_side.svg | Repeated side framing | 43×52 | Opaque |
| assets/ui/pressure_beam.svg | Moving pressure beam | 394×31 | Opaque |
| assets/ui/status_label.svg | Candy/scalloped feedback label | 400×90 | Clear background |
| assets/backgrounds/twilight.svg | Replaceable indigo field | 480×760 or proportional | Opaque |
| assets/music/music_gameplay_loop.wav | Background loop | 22.05 kHz mono PCM, 51.2 sec | Seamless boundaries; no vocals |
| assets/audio/*.wav | Sound roles below | Mono PCM WAV, or change manifest for MP3/OGG | Short one-shot |

Audio roles: launch, wall, hit, pop, drop, stomp, clear, lose, bonus, hatch, combo, danger, ui.
Helper hit uses `bonus`, helper announcement uses original device TTS. Big-pop uses `bonus`. Roles can be split further when new recordings are supplied.

The character tiles were sliced from one original generated 3×3 atlas. Current files have indigo backgrounds. They are *not* approved transparent sprites. Runtime circle cropping avoids square corners, but should be reviewed. Preserve silhouette and asymmetrical muzzle when replacing. No photos or personal dedication are shipped.

Animation is currently transform-based: recoil, wiggle, flight bob, squash/impact, hatch rotation/fall. No frame atlas is required. Four hatch-shell polygons and small particles are lightweight runtime geometry. Future sprite-sheet animation would require extending the renderer; merely replacing a static file cannot add frames automatically.
