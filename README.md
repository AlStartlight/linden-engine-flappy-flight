# OXEN SPACESHIP GALAXY

## Game ini dibuat dengan LINDEN ENGINE

**OXEN SPACESHIP GALAXY** adalah game arcade 2D *tap-to-fly* yang dibuat dengan **LINDEN ENGINE**
(ECS + Three.js WebGPU/WebGL + fisika Rapier). Kamu mengendalikan seekor burung kecil yang terbang
melewati celah di antara pipa hijau di atas pantai cerah — satu tap = satu kepakan sayap.

> **Made BY Linden Engine**
> Dibuat dengan [Linden Engine](https://lindenengine.com) — © 2026 AlStartlight

---

## Deskripsi game

Burung kuning melayang di sisi kiri layar dan dunia bergerak ke kiri. Setiap kali pemain menekan
`Space` / mengetuk layar, burung mendapat dorongan ke atas; gravitasi terus menariknya ke bawah.
Pipa datang berpasangan (atas + bawah) dengan celah yang posisinya diacak halus. Menyentuh pipa
atau tanah mengakhiri penerbangan.

Tampilan scene `scenes/Main.lscene` (kamera ortografis, gaya side-scroller):

| Bagian scene | Entity di project | Peran |
| --- | --- | --- |
| Pemain | `Bird`, `Bird Body`, `Bird Wing`, `Bird Eye`, `Bird Pupil`, `Bird Beak`, `Bird Tail` | Burung kuning dengan sayap yang mengepak; `Tag: Player, Flying` |
| Rintangan | `Pipe 0..5` (Top, Top Cap, Bottom, Bottom Cap) | 6 pasang pipa hijau ber-cap, didaur ulang terus-menerus; `Tag: Enemy` |
| Tanah | `Ground Sand`, `Ground Grass`, `Ground Line` | Pantai berpasir + rumput; `Tag: Ground` |
| Latar | `Sky Top`, `Sky Mid`, `Sky Low`, `Sun`, `Hills Far`, `Hills Near` | Gradasi langit, matahari, dan perbukitan |
| Parallax | `Cloud 0..3`, `Dash 0..9` | Awan yang bergeser pelan dan garis tanah yang melaju |
| Kamera | `Main Camera` (orthographic, fov 60) + `Script` + `HtmlUI` | Menyesuaikan zoom dengan rasio layar, menjalankan gameplay & HUD |
| Cahaya | `Sun Light` | Directional light hangat `#fff6e0` |
| HUD | `ui/hud.html` | Skor, rekor, panel siap & game over |

## Alur permainan

| Fase | HUD | Yang terjadi |
| --- | --- | --- |
| **SIAP** | “SIAP TERBANG? — SPASI atau KETUK” | Burung melayang naik-turun menunggu input pertama |
| **TERBANG** | Skor besar di tengah atas + chip `TERBAIK` | Gravitasi aktif; tap = dorongan; skor bertambah tiap pipa terlewati |
| **GAME OVER** | “GAME OVER — Penerbangan berakhir”, skor, terbaik, medali | Burung jatuh, panel muncul setelah 0,5 s; tap / `SPASI` / tombol `MAIN LAGI` untuk ulang |

Medali mengikuti skor: **PEMULA** (0–4), **PERUNGGU** (5–9), **PERAK** (10–19), **EMAS** (20–29),
**PLATINUM** (30+).

## Kontrol

| Aksi | Keyboard | Gamepad | Touch |
| --- | --- | --- | --- |
| Kepak / Mulai / Ulang | `Space` atau klik kiri | A / RT | Ketuk layar |
| Tombol ulang | `Enter` di panel game over | — | Tombol `MAIN LAGI` |

Input dibaca dari Input Actions project (`Jump` dan `Attack`), jadi binding tambahan di
Linden Engine langsung berfungsi.

## Fitur

- Pipa tak berujung: 6 pasang pipa dipindah dan didaur ulang, tanpa loading level.
- Kesulitan bertahap: kecepatan dunia naik (`4.0x → 5.6x`) dan celah menyempit (`3.25 → 2.55`).
- Posisi celah acak dengan pergeseran halus sehingga selalu bisa dilewati.
- Rekor terbaik disimpan di `localStorage` (`flappyflight.best`) dan ditampilkan di HUD.
- Skor “pop”, kilatan merah saat tabrakan, dan burung yang menukik saat jatuh.
- Parallax awan dan garis tanah untuk kesan kecepatan.
- SFX prosedural lewat Web Audio API — tanpa file audio.
- Kamera ortografis adaptif: ultrawide sampai portrait/mobile.

## Struktur project

```
project.linden.json     konfigurasi project: Input Actions, scene, export preset
scenes/Main.lscene      scene utama (bird, 6 pasang pipa, pantai, parallax, kamera)
scripts/FlappyGame.ts   gameplay: gerak burung, daur ulang pipa, skor, audio, HUD
ui/hud.html             HUD + panel SIAP dan GAME OVER (HTML + CSS saja)
assets/                 tekstur, audio, dan model
build/                  hasil build (di-ignore git)
```

## Menjalankan

1. Buka folder ini di **Linden Engine**.
2. Buka `scenes/Main.lscene`.
3. Tekan **Play**.

Nilai gameplay ada di bagian atas `scripts/FlappyGame.ts` dan bisa ditimpa lewat `props`
komponen Script di Inspector:

| Properti | Default | Arti |
| --- | --- | --- |
| `gravity` | `24` | Percepatan ke bawah |
| `flapSpeed` | `7.8` | Kecepatan dorongan tiap kepak |
| `maxFallSpeed` | `-13` | Batas kecepatan jatuh |
| `baseSpeed` / `maxSpeed` | `4.0` / `5.6` | Rentang kecepatan dunia |
| `baseGap` / `minGap` | `3.25` / `2.55` | Celah pipa di skor 0 / tersulit |
| `pipeSpacing` | `6.2` | Jarak antar pasang pipa |

## Export web

Export build HTML5 lewat **Export → Web** (atau tool `export_web`). Hasilnya ada di
`build/web/index.html`, bisa dimainkan di browser modern atau diunggah ke itch.io.

---

<p align="center">
  <b>OXEN SPACESHIP GALAXY</b><br>
  Made BY Linden Engine — © 2026 AlStartlight
</p>
