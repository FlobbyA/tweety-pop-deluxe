# Tweety Pop Deluxe — Build 3.0 RC / root patch 3.0.1

The root `index.html` launches Build 3.0 RC with a twelve-level campaign. It uses root `assets/` and `config/` with versioned 3.0.1 runtime references.

- Drag to aim, release to shoot; Pause and Sound controls remain in the header.
- On the title screen, tap **Enable menu music** to begin audio. Browser policy may keep the initial page silent.
- Get Ready precedes gameplay; Level Clear and Game Over use replaceable original temporary stings.
- [Audio filenames and behavior](docs/AUDIO_ROLES.md)
- [Deployment, rollback and verification](docs/ROOT_DEPLOYMENT.md)

## Preserved snapshots

`baseline-2.2/`, `game-3.0/`, and `source-history/` are retained unchanged. `game-3.0/` is the original uploaded package; root is the active updated runtime. Root `game-2.2.js`, `style-2.2.css`, `game.js`, and `style.css` are preserved.

To roll back the root entry only, replace root `index.html` with `baseline-2.2/index.html` and publish. The original root assets remain available.

## Deployment

GitHub Pages should keep its existing main/root publishing configuration and URL. No routing or domain changes are required. The prepared patch has not been published by the assistant: the GitHub integration rejected its write request with HTTP 403. Upload the patch files to the repository root, commit, then verify the live header reads **Build 3.0 RC · 3.0.1**.

## Local checks

`node tests/regression.cjs` — 18 checks.
`node tests/audio.cjs` — 10 checks.
`python tools/verify-root.py` — root references, baseline and gameplay integrity.

Tests use a mocked browser environment; real Android playback and visual/performance QA are still required. Existing 3.0 character-art and final audio-production limitations remain.
