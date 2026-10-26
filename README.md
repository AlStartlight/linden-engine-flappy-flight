# OXEN SPACESHIP GALAXY

## Game ini dibuat dengan LINDEN ENGINE

**OXEN SPACESHIP GALAXY** adalah game arcade bertema luar angkasa bergaya *flappy* — dibuat dengan
**LINDEN ENGINE** (arsitektur ECS, rendering Three.js WebGPU/WebGL, dan fisika Rapier).

> **Made BY Linden Engine**
> Dibuat dengan [Linden Engine](https://lindenengine.com) — © 2026 AlStartlight

---

## Cara bermain

Terbang melewati celah di antara rintangan. Satu tap = satu dorongan ke atas. Bertahan selama
mungkin dan pecahkan rekor terbaikmu.

| Fase | Yang terjadi |
| --- | --- |
| **SIAP** | Karakter melayang menunggu tap pertama |
| **TERBANG** | Gravitasi menarik ke bawah, setiap tap memberi dorongan ke atas |
| **TUMBANG** | Karakter jatuh, panel *game over* muncul, tap lagi untuk mengulang |

## Fitur

- Rintangan tanpa akhir — dipindah dan didaur ulang otomatis, tanpa loading level.
- Tingkat kesulitan naik: kecepatan dunia bertambah dan celah menyempit seiring skor.
- Posisi celah acak dengan pergeseran halus (selalu bisa dilewati).
- Rekor terbaik disimpan di `localStorage` dan ditampilkan di HUD.
- Medali: PEMULA → PERUNGGU → PERAK → EMAS → PLATINUM.
- Efek pop skor, kilat saat tabrakan, parallax awan dan garis tanah.
- Sound effect prosedural lewat Web Audio API (tanpa file audio).
- Kamera menyesuaikan rasio layar, dari ultrawide sampai portrait/mobile.

## Kontrol

| Aksi | Keyboard | Gamepad | Touch |
| --- | --- | --- | --- |
| Terbang / Mulai / Ulang | `Space` (atau klik kiri) | A / RT | Tap layar |
| Tombol ulang | `Enter` di panel game over | — | Tombol `RESTART` |

Input dibaca dari Input Actions project (`Jump` dan `Attack`), jadi binding apa pun yang ditambah
di Linden Engine langsung berfungsi.

## Struktur project

```
project.linden.json     konfigurasi project: Input Actions, scene, export preset
scenes/Main.lscene      scene utama: karakter, rintangan, tanah, parallax, kamera
scripts/FlappyGame.ts   gameplay: rasa gerak, daur ulang rintangan, skor, audio, HUD
ui/hud.html             HUD + panel siap / game over (HTML + CSS saja)
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
| `flapSpeed` | `7.8` | Kecepatan dorongan tiap tap |
| `baseSpeed` / `maxSpeed` | `4.0` / `5.6` | Rentang kecepatan dunia |
| `baseGap` / `minGap` | `3.25` / `2.55` | Celah rintangan di skor 0 / tersulit |
| `pipeSpacing` | `6.2` | Jarak antar rintangan |

## Export web

Export build HTML5 lewat **Export → Web** (atau tool `export_web`). Hasilnya ada di
`build/web/index.html`, bisa dimainkan di browser modern atau diunggah ke itch.io.

---

<p align="center">
  <b>OXEN SPACESHIP GALAXY</b><br>
  Made BY Linden Engine — © 2026 AlStartlight
</p>
