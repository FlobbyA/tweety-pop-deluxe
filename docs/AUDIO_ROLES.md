# Stable external audio roles — Build 3.0 RC / patch 3.0.1

The root deployment uses `config/assets-3.0.1.js`. Swap the following files without editing gameplay. These are original generated temporary cues, not final commissioned performances. No reference soundtrack was read, copied, or embedded.

| Role | Expected file | Format supplied | Loop | Recommended duration | Supplied duration |
|---|---|---|---|---|---|
| music_main_menu | assets/music/music_main_menu.wav | PCM WAV, mono, 22050 Hz, 16-bit | Yes | 12–30 seconds, seamless | 17.143 s |
| sfx_get_ready | assets/audio/sfx_get_ready.wav | PCM WAV, mono, 22050 Hz, 16-bit | No | 0.4–0.9 s | 0.70 s |
| sfx_level_clear | assets/audio/sfx_level_clear.wav | PCM WAV, mono, 22050 Hz, 16-bit | No | 0.4–0.7 s with current transition | 0.70 s |
| sfx_game_over | assets/audio/sfx_game_over.wav | PCM WAV, mono, 22050 Hz, 16-bit | No | 0.7–1.8 s | 1.15 s |

Use the same path/name and a valid WAV file for drop-in replacement. Stereo WAV at 44.1/48 kHz is also usable, but raises transfer size. To use MP3 or OGG, change the relevant manifest `path` and extension; do not rename encoded MP3 bytes to .wav. Volume and loop behavior are specified alongside each role in the manifest.

For a replacement release, bump manifest `version` and index.html's asset query versions. For JS/CSS changes, use new physical versioned filenames as in this promotion. A browser cannot know that bytes at an unchanged URL were replaced until it revalidates.

## Behavior

- Initial title screen is silent until a gesture. **Enable menu music** explicitly unlocks sound and starts the menu loop. The header Sound button can also unlock it. Main-menu music does not attempt audible autoplay during initial page load.
- Start and New Game stop music, show GET READY, play the ready cue, and then enable gameplay. Every following level uses the same hook. Pressure and shooting remain stopped during preparation.
- Missing/unsupported/blocked ready audio resolves immediately or within a hard 1.8-second timeout. No load failure can hold a level indefinitely.
- Level Clear stops gameplay music and plays the named reward sting. The original 750 ms transition remains; the next ready cue cancels any unfinished reward sting. Keep replacement clear stings at or below 0.7 s unless intentionally changing transition timing later.
- The final stage plays Level Clear once, not twice.
- Game Over stops music and plays the named comic failure cue once. Main Menu on the result panel returns to the title and restarts menu music if sound was already unlocked.
- Mute pauses tracks, stops cues and resolves waiting preparation. Unmute retains the current scene. Muted gameplay does not wait for cue duration.
- Switching tabs stops cues and music. A ready cue completing in a hidden tab leaves the game paused until Resume.
- Rejected `play()` promises are caught. Missing music/cues fall back to silence. Older regular SFX retain the existing procedural fallback.

## Original temporary sonic direction

A bouncy mallet-like melody, plucked chord punctuation, moving staccato bass, and short dry synthetic percussion. The arrangement intentionally avoids EDM, cinematic orchestration, and pure square-wave chiptune. The existing gameplay loop is unchanged in this focused patch; only the four requested roles receive new material.

Reproduce using `python tools/render-original-audio.py` (NumPy required). The script reads no audio inputs. Generated WAV files are committed external assets; runtime does not synthesize these new roles.
