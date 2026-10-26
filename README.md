# FlappyFlight

## Game ini dibuat dengan LINDEN ENGINE

Flappy Bird–style arcade game — dibuat dengan **LINDEN ENGINE** (ECS architecture, Three.js
rendering WebGPU/WebGL, dan fisika Rapier).

> **Made BY Linden Engine**
> Dibuat dengan [Linden Engine](https://lindenengine.com) — © 2026 AlStartlight

---

## Gameplay

Tap to flap. Fly the bird through the pipe gaps, survive as long as you can and beat your best score.

- **Ready** – the bird bobs in place, waiting for the first flap.
- **Flying** – gravity pulls you down; every flap gives an upward burst.
- **Game over** – the bird tumbles to the ground, then tap again to restart.

## Features

- Procedurally recycled pipe pairs — endless run, no level loading.
- Difficulty ramp: world speed rises and the gap narrows as your score grows.
- Randomised pipe heights with smooth drift (always clearable).
- Best score saved in `localStorage` and shown in the HUD.
- Medal ranks: PEMULA → PERUNGGU → PERAK → EMAS → PLATINUM.
- Coin-style score pop, hit flash, parallax clouds and ground dashes.
- Procedural sound effects via the Web Audio API (no audio assets needed).
- Camera adapts to the window aspect ratio, from ultrawide to portrait/mobile.

## Controls

| Action | Keyboard | Gamepad | Touch |
| --- | --- | --- | --- |
| Flap / Start / Restart | `Space` (or left click) | A / RT | Tap the screen |
| Restart button | `Enter` on the game over panel | — | `RESTART` button |

Input is read from the project's Input Actions (`Jump` and `Attack`), so any binding added in
Linden Engine works automatically.

## Project structure

```
project.linden.json     project config: Input Actions, scenes in build, export presets
scenes/Main.lscene      main scene: bird, pipes, ground, parallax layers, camera
scripts/FlappyGame.ts   gameplay: physics feel, pipe recycling, scoring, audio, HUD logic
ui/hud.html             HUD + ready / game over panels (HTML + CSS only)
assets/                 textures, audio and models (placeholders for now)
build/                  generated builds (git-ignored)
```

## Running the project

1. Open the folder in **Linden Engine**.
2. Open `scenes/Main.lscene`.
3. Press **Play**.

Tweakable gameplay values live at the top of `scripts/FlappyGame.ts` and can be overridden
per entity through the Script component's `props` in the Inspector:

| Field | Default | Meaning |
| --- | --- | --- |
| `gravity` | `24` | Downward acceleration |
| `flapSpeed` | `7.8` | Upward speed per flap |
| `baseSpeed` / `maxSpeed` | `4.0` / `5.6` | World scroll speed range |
| `baseGap` / `minGap` | `3.25` / `2.55` | Pipe gap at score 0 / hardest |
| `pipeSpacing` | `6.2` | Horizontal distance between pipes |

## Web export

Export an HTML5 build with **Export → Web** (or the `export_web` tool). The result is written to
`build/web/index.html` and can be played in any modern browser or uploaded to itch.io.

---

<p align="center">
  <b>Made BY Linden Engine</b><br>
  © 2026 AlStartlight — built with Linden Engine.
</p>
