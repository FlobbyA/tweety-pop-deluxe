# Tweety Pop Deluxe — Vertical Slice v1.2

Revision focused on fixing the mobile test issues from v1.1.

## Changes
- Cache-busted JS/CSS (`?v=1.2`) so GitHub Pages/mobile browsers must request the new build.
- Added visible `Build 1.2` marker in the HUD to verify the loaded version.
- Rebuilt the aiming guide as a simulated trajectory using the same projectile speed, drag and wall-bounce behavior as the real shot.
- The guide now continues toward the actual predicted collision point and displays wall-reflection points.
- Added a predicted impact marker.
- Level completion no longer changes immediately when the logical grid becomes empty.
- The game now waits for all detached falling eggs and particles to finish, then pauses briefly before changing level.
- Shooting is disabled during the clear transition.
- Weighty launch/impact behavior and two-level structure are retained.

Final art assets are still not included; this build is for gameplay validation.
