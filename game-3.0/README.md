# Tweety Pop Deluxe — 3.0 RC

A 12-stage portrait egg-shooter production candidate built directly on approved Full-Feel Build 2.2.

Drag to aim, release to shoot. Match three, drop unsupported clusters, hit the ↑ helper ball to lift the beam. A shaking egg gives a separate Tweety hatch reward. Use Pause, Sound On/Off, and New Game in the header.

## Run

Serve this directory as static files over HTTP(S). No npm install or build step. GitHub Pages can serve index.html and its neighboring files directly. Local `file://` opening is not a supported audio-loading workflow.

## Manual GitHub Pages update

Preserve your existing repository history. Upload the contents of this project folder (not an extra enclosing folder) to the current Pages source branch. Include `assets/` and `config/`. The old game-2.2.js and style-2.2.css are retained. Verify the header reads Build 3.0 RC. Use a release-specific URL such as `?release=3.0.0` when opening after deployment.

No remote change or deployment was performed by this handoff: integration write was denied with HTTP 403. Do not describe 3.0 as the current live game until it has actually been uploaded and checked.

## Documentation

- docs/PRODUCTION_STATUS.md — exact work, verification and remaining limitations.
- docs/ASSETS.md — file roles, dimensions and replacement workflow.
- docs/MOBILE_CHECKLIST_TH.md — phone acceptance checks.
- tests/regression.cjs — run with `node tests/regression.cjs`.

Important: this is not a final fully accepted release. Transparent character art, final voice treatment, visual/browser QA and Android playtesting remain.
