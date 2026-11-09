# SWINE — Night Shift

A static Three.js survival horror prototype for iPad Safari and desktop browsers. The supplied Swine Sentinel GLB is bundled with its animations. No server, external CDN, or account is needed for gameplay.

## Play
Find the blue Maintenance key near the start. Use it to unlock the blue Security door in the northeast, collect the gold Exit key inside, and return to the green EXIT near the start. Keys and batteries lie on the floor with faint glints; look down and tap USE / E to collect. The HUD shows a compass heading, objective, keys, battery charge and stamina.

The flashlight drains a full charge in 150 seconds while on. Each of seven finite battery pickups restores up to 65 percentage points, capped at 100. At over 90% charge, pickups stay on the floor for later. Switching the light off conserves charge; an empty flashlight stays off until a battery is collected. No timer advances while the game is paused.

The pig patrols, detects a lit player in line of sight, hears nearby sprinting and searches the last known position. Doors block movement and sight while closed. The Maintenance key opens the Security and Loading doors; the Service door needs no key. Open doors can be closed behind you if neither actor is occupying the doorway. The pig takes three seconds of accumulated effort to break through a closed door; broken doors cannot be closed again. Capture plays the scream animation and uploaded variation 4 recording, followed by retry.

Touch: left thumbstick moves; drag the scene to look; hold RUN; tap LIGHT or USE. Landscape is recommended. Desktop: WASD, mouse or drag/arrow keys, Shift, F, E, Escape/P.

Sound starts only after tapping Enter. The menu has sound and quieter-scare controls. Backgrounding the app pauses play. The game uses WebGL 2 and requires a supported browser/device.

## Development
Serve `dist/` with any static HTTP server. Dependencies used by the browser are vendored under `dist/vendor/`, including the Three.js license. Source logic is in `dist/core.mjs`; rendering, input, audio and asset integration are in `dist/game.js`.

Run `npm test` for simulation checks and `node asset.test.mjs` to validate model parsing and animation availability (texture loading is skipped in this Node-only asset check).

## Verification
Syntax and simulation tests passed, including key progression, locked-door collision and visibility, safe door closing, timed monster breach, battery drain/conservation/depletion/recharge, single-use pickups, pause and restart. Model parsing and all six animation clips passed an offline check. Menu layout inspected in the browser. The available cloud browser could not initialize WebGL, so visual gameplay, texture rendering, audible sound quality, and real iPad performance have not been verified on hardware.


## Pig recordings
The four uploaded Firefly WAV recordings were converted to 128 kbps MP3 for mobile loading, preserving their complete eight-second duration. Variations 1–3 rotate without overlap when the pig is within eight map cells, with distance attenuation and stereo direction. Chase calls are louder than nearby patrol calls. Variation 4 interrupts other calls on capture and continues over the result screen. Restart, pause, escape, or backgrounding stops pig playback. The sound toggle and quieter-scare setting still apply.


## Stamina and breathing
Stamina drains at 23 points/second during sprint movement and recovers at 15 points/second otherwise. At zero, sprinting locks until 25 points recover; holding RUN while stationary does not drain stamina. The uploaded breathing recordings map to 1 = normal, 2 = actively sprinting, 3 = exhausted/recovering. Loops fade between states over 350 ms, respect mute, and stop on pause, backgrounding, capture, escape or restart. Variation 3 continues through the short exhaustion recovery rather than oscillating at zero. The HUD displays stamina percentage and exhaustion.

Run `node stamina-audio.test.mjs` for stamina and breathing-state tests. Recorded-audio decoding/trigger behavior is covered separately from hardware listening; iPad listening remains unverified.


## Capture video
The supplied five-second pigman video now fills the game viewport when caught (letterboxed to preserve the complete frame). A silent H.264 MP4 copy is bundled; the original upload is unchanged. Pig recording variation 4 starts when video playback begins, respecting mute/quiet-scare settings. The retry screen appears at video end. Blocked/failed playback falls back to the 3D scare; startup and stalled-playback watchdogs prevent a stuck game. Backgrounding ends the scare and stops audio, and restart clears media state. Actual iPad playback remains unverified.


## Startup recovery
Start is enabled only after a successful rendered frame and monster load. Touch pointer-up and click both activate the same guarded start action. Audio initialization is optional and cannot block entering the scene. Startup/module/render failures are displayed with a reload action; a 60-second loading timeout prevents a permanently silent loading button. Browser WebGL restrictions still require a browser with working 3D graphics.
