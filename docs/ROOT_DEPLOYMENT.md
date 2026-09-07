# Root promotion — Build 3.0 RC / patch 3.0.1

Source inspected: uploaded package at commit c84a3c01884d783bd98166c9a7a380ebb3a338e4.

`index.html` at the repository root now loads `game-3.0.1.js`, `assets-3.0.1.js`, `style-3.0.1.css`, `config/levels-3.0.js`, and `config/assets-3.0.1.js`. All runtime resources use relative paths, so the existing `/tweety-pop-deluxe/` GitHub Pages URL remains the entry point. No redirect or Pages configuration change is needed when Pages already publishes the root of main.

The promotion copies the necessary resources from `game-3.0/` and changes only lifecycle/audio hooks. It does not alter aiming, launch/drag/restitution, matching, drop logic, pressure configurations, or scoring. The intentional additional Get Ready preparation holds the simulation until the cue completes or gracefully fails.

## Rollback

- `baseline-2.2/`, `game-3.0/`, and `source-history/` remain byte-for-byte unchanged.
- Root `game-2.2.js`, `style-2.2.css`, `game.js`, and `style.css` remain untouched.
- To revert the root entry to 2.2: copy `baseline-2.2/index.html` to root `index.html`. Its relative JS/CSS paths resolve to the preserved root files. Commit that one-file change and wait for Pages.
- You can also open `baseline-2.2/` directly without changing the active build.
- The original uploaded `game-3.0/` remains a snapshot, not the updated active runtime. Make future edits to the root runtime.

## Verification

Run `node tests/regression.cjs`, `node tests/audio.cjs`, and `python tools/verify-root.py` from the repository root.

The logic suite covers preserved shooting/match/drop/pressure behavior, all campaign state transitions, restart races, Get Ready gating, and hidden-tab preparation. The audio suite simulates autoplay rejection, missing/hung resources, muting, scene transitions, and cancellation. These are mocked runtime checks, not proof of Android sound output or smooth browser rendering.

On the live site after deployment, check the header reads `Build 3.0 RC · 3.0.1`, tap Enable menu music, start a game, and verify the short ready cue precedes shooting. Check clear/loss cues and mute. Live validation must be reported separately from local checks.

Character transparency, art acceptance, final vocal treatment, and overall 3.0 mobile playtesting limitations from the supplied package remain outside this focused root/audio patch.

## Publication result for this patch

The attempted GitHub blob write returned HTTP 403 `Resource not accessible by integration`. No commit or root update was published remotely. The supplied patch ZIP is prepared for root upload; local verification is complete, live 3.0.1 verification is not. The repository's remote root remained Build 2.2 at the time of the inspected source snapshot.
