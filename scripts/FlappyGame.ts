/**
 * FlappyGame — inti permainan Flappy Flight.
 * Burung dikendalikan manual (tanpa Rigidbody) supaya gerak flap terasa presisi,
 * pipa dipindah & didaur ulang, skor bertambah tiap pipa terlewati.
 * Semua entity dicari lewat nama dari scene supaya script tetap ringkas.
 */
export default class FlappyGame {
  // ---- rasa permainan (bisa diubah dari Inspector lewat props) ----
  gravity = 24
  flapSpeed = 7.8
  maxFallSpeed = -13
  baseSpeed = 4.0
  maxSpeed = 5.6
  baseGap = 3.25
  minGap = 2.55
  pipeSpacing = 6.2

  // ---- tata letak dunia ----
  birdX = -4.5
  startY = 1.6
  groundTop = -4.18
  ceilingY = 5.3
  hitRadius = 0.34
  pipeHalfWidth = 0.78
  topY = 8.6
  bottomY = -6

  private ctx: any = null
  private state = 'ready'
  private bird: any = null
  private wing: any = null
  private pipes: any[] = []
  private clouds: any[] = []
  private dashes: any[] = []
  private scoreEl: any = null
  private flashEl: any = null
  private flash = 0
  private y = 1.6
  private vy = 0
  private elapsed = 0
  private worldSpeed = 4
  private score = 0
  private best = 0
  private deathTimer = 0
  private inputLock = 0
  private wingT = 0
  private pulse = 0
  private overShown = false
  private audio: any = null

  // ------------------------------------------------------------------ init
  onInit(ctx: any) {
    this.ctx = ctx
    this.best = this.loadBest()
    this.bird = this.find('Bird')
    this.wing = this.find('Bird Wing')
    this.scoreEl = this.query('#score')
    this.flashEl = this.query('#hit-flash')
    this.collectPipes()
    this.collectAmbient()
    this.bindUi()
    this.fitCamera()
    this.resetRound()
    this.pushState()

    try {
      const w: any = typeof window !== 'undefined' ? window : null
      if (w && w.addEventListener) {
        w.addEventListener('resize', () => this.fitCamera())
      }
    } catch (err) { /* lingkungan headless */ }
  }

  onDestroy() {
    try {
      if (this.audio && this.audio.close) this.audio.close()
    } catch (err) { /* abaikan */ }
    this.audio = null
  }

  // --------------------------------------------------------------- runtime
  onUpdate(dt: number) {
    if (!this.ctx) return
    const step = Math.min(Math.max(dt || 0, 0), 0.05)
    this.elapsed += step
    this.inputLock = Math.max(0, this.inputLock - step)
    this.pulse = Math.max(0, this.pulse - step * 3.2)
    this.flash = Math.max(0, this.flash - step * 2.4)
    this.applyFlash()

    const flap = this.readFlap()

    if (this.state === 'ready') {
      this.y = this.startY + Math.sin(this.elapsed * 3) * 0.18
      this.setBird(Math.sin(this.elapsed * 3) * 6)
      this.wingT += step * 3
      this.animateWing(0.5)
      if (flap && this.inputLock <= 0) this.beginFlight()
    } else if (this.state === 'playing') {
      if (flap && this.inputLock <= 0) this.flap()
      this.vy = Math.max(this.maxFallSpeed, this.vy - this.gravity * step)
      this.y += this.vy * step
      if (this.y > this.ceilingY) {
        this.y = this.ceilingY
        if (this.vy > 0) this.vy = 0
      }
      this.setBird(Math.max(-66, Math.min(26, this.vy * 3.4)))
      this.wingT += step * (0.6 + Math.min(1.6, Math.max(0, this.vy) * 0.2))
      this.animateWing(1)
      this.scrollPipes(step)
      this.checkScore()
      if (this.hitSomething()) this.die()
    } else {
      this.vy = Math.max(this.maxFallSpeed, this.vy - this.gravity * step)
      this.y += this.vy * step
      const floor = this.groundTop + 0.34
      if (this.y < floor) {
        this.y = floor
        this.vy = 0
      }
      this.setBird(Math.max(-78, Math.min(26, this.vy * 3.4)))
      this.wingT += step * 2.4
      this.animateWing(0.7)
      this.deathTimer += step
      if (this.deathTimer > 0.5 && !this.overShown) this.showGameOver()
      if (this.deathTimer > 0.8 && flap && this.inputLock <= 0) this.restart()
    }

    this.scrollAmbient(step)
    this.updateScoreFx()
  }

  // ---------------------------------------------------------------- state
  private beginFlight() {
    this.state = 'playing'
    this.worldSpeed = this.baseSpeed
    this.flap()
    this.show('#ready-panel', false)
    this.pushState()
  }

  private flap() {
    this.vy = this.flapSpeed
    this.wingT = 0
    this.playTone(660, 940, 0.075, 'triangle', 0.06)
  }

  private die() {
    if (this.state === 'dead') return
    this.state = 'dead'
    this.deathTimer = 0
    this.overShown = false
    if (this.vy > 2) this.vy = 2
    this.flash = 1
    this.playTone(320, 90, 0.32, 'sawtooth', 0.09)
    if (this.score > this.best) {
      this.best = this.score
      this.saveBest()
    }
    this.pushState()
    this.ctx.emit('flappy:death', { score: this.score, best: this.best })
  }

  private showGameOver() {
    this.overShown = true
    this.show('#gameover-panel', true)
    this.playTone(520, 520, 0.09, 'sine', 0.05)
    this.pushState()
  }

  private restart() {
    this.resetRound()
    this.inputLock = 0.28
    this.show('#gameover-panel', false)
    this.show('#ready-panel', true)
    this.playTone(420, 720, 0.12, 'triangle', 0.05)
    this.pushState()
  }

  private resetRound() {
    this.state = 'ready'
    this.y = this.startY
    this.vy = 0
    this.score = 0
    this.deathTimer = 0
    this.overShown = false
    this.worldSpeed = this.baseSpeed
    this.pulse = 0
    this.flash = 0
    this.setBird(0)
    for (const p of this.pipes) p.scored = false
    this.layoutPipes(true)
    this.show('#gameover-panel', false)
    this.show('#ready-panel', true)
  }

  private pushState() {
    try {
      this.ctx.emit('flappy:state', {
        state: this.state,
        score: this.score,
        best: this.best,
        speed: Number(this.worldSpeed.toFixed(2)),
      })
    } catch (err) { /* abaikan */ }
  }

  // --------------------------------------------------------------- pipes
  private collectPipes() {
    const map: any = {}
    for (const e of this.entities()) {
      const m = /^Pipe (\d+) (Top Cap|Top|Bottom Cap|Bottom)$/.exec(e.name || '')
      if (!m) continue
      const idx = Number(m[1])
      if (!map[idx]) map[idx] = { index: idx, x: 0, center: 1.6, gap: this.baseGap, scored: false }
      map[idx][partKey(m[2])] = e
    }
    this.pipes = Object.keys(map)
      .map((k) => map[k])
      .filter((p: any) => p.top && p.topCap && p.bottom && p.bottomCap)
      .sort((a: any, b: any) => a.index - b.index)
  }

  private layoutPipes(seed: boolean) {
    const first = this.birdX + 9.5
    let prev = 1.6
    this.pipes.forEach((p: any, i: number) => {
      p.x = first + i * this.pipeSpacing
      p.gap = this.gapFor(0)
      p.center = seed && i === 0 ? 1.4 : this.nextCenter(prev)
      p.scored = false
      prev = p.center
      this.placePipe(p)
    })
  }

  private scrollPipes(step: number) {
    this.worldSpeed = Math.min(this.maxSpeed, this.baseSpeed + this.score * 0.06)
    const gap = this.gapFor(this.score)
    for (const p of this.pipes) {
      p.x -= this.worldSpeed * step
      p.gap = gap
      if (p.x < this.birdX - 7) this.recycle(p)
      this.placePipe(p)
    }
  }

  private recycle(p: any) {
    let maxX = -Infinity
    let neighbor = p.center
    for (const q of this.pipes) {
      if (q === p) continue
      if (q.x > maxX) {
        maxX = q.x
        neighbor = q.center
      }
    }
    p.x = (isFinite(maxX) ? maxX : 0) + this.pipeSpacing
    p.center = this.nextCenter(neighbor)
    p.scored = false
  }

  private gapFor(score: number) {
    return Math.max(this.minGap, this.baseGap - score * 0.018)
  }

  private nextCenter(prev: number) {
    const drift = (Math.random() * 2 - 1) * 1.9
    return Math.max(-1.5, Math.min(2.6, prev + drift))
  }

  private placePipe(p: any) {
    const gapTop = p.center + p.gap / 2
    const gapBottom = p.center - p.gap / 2
    const thick = 0.56
    const capW = 2.0

    const topH = this.topY - gapTop
    const t = p.top.getTransform()
    t.position.x = p.x
    t.position.y = gapTop + topH / 2
    t.position.z = 0.2
    t.scale.y = topH

    const tc = p.topCap.getTransform()
    tc.position.x = p.x
    tc.position.y = gapTop + thick / 2
    tc.position.z = 0.34
    tc.scale.x = capW
    tc.scale.y = thick

    const bottomH = gapBottom - this.bottomY
    const b = p.bottom.getTransform()
    b.position.x = p.x
    b.position.y = this.bottomY + bottomH / 2
    b.position.z = 0.2
    b.scale.y = bottomH

    const bc = p.bottomCap.getTransform()
    bc.position.x = p.x
    bc.position.y = gapBottom - thick / 2
    bc.position.z = 0.34
    bc.scale.x = capW
    bc.scale.y = thick
  }

  private checkScore() {
    for (const p of this.pipes) {
      if (p.scored) continue
      if (p.x < this.birdX - 0.2) {
        p.scored = true
        this.score += 1
        if (this.score > this.best) {
          this.best = this.score
          this.saveBest()
        }
        this.pulse = 1
        this.playTone(760, 1180, 0.09, 'sine', 0.06)
        this.ctx.emit('flappy:score', { score: this.score })
        this.pushState()
      }
    }
  }

  private hitSomething() {
    if (this.y - this.hitRadius <= this.groundTop) return true
    for (const p of this.pipes) {
      if (this.circleHitsPipe(p)) return true
    }
    return false
  }

  private circleHitsPipe(p: any) {
    const r = this.hitRadius
    const hw = this.pipeHalfWidth
    if (Math.abs(this.birdX - p.x) > hw + r) return false
    const gapTop = p.center + p.gap / 2
    const gapBottom = p.center - p.gap / 2
    const rects = [
      [p.x - hw, gapTop, p.x + hw, this.topY],
      [p.x - hw, this.bottomY, p.x + hw, gapBottom],
    ]
    for (const rect of rects) {
      const cx = clamp(this.birdX, rect[0], rect[2])
      const cy = clamp(this.y, rect[1], rect[3])
      const dx = this.birdX - cx
      const dy = this.y - cy
      if (dx * dx + dy * dy < r * r) return true
    }
    return false
  }

  // --------------------------------------------------------------- visual
  private setBird(rotZ: number) {
    if (!this.bird) return
    const t = this.bird.getTransform()
    t.position.x = this.birdX
    t.position.y = this.y
    t.position.z = 1.4
    t.rotation.z = rotZ
  }

  private animateWing(amp: number) {
    if (!this.wing) return
    const t = this.wing.getTransform()
    t.rotation.z = -18 + Math.sin(this.wingT * 20) * 34 * amp
  }

  private collectAmbient() {
    const all = this.entities()
    this.clouds = all.filter((e: any) => /^Cloud \d+$/.test(e.name || ''))
    this.dashes = all.filter((e: any) => /^Dash \d+$/.test(e.name || ''))
  }

  private scrollAmbient(step: number) {
    const drift = this.state === 'playing' ? this.worldSpeed * 0.16 : 0.32
    for (const c of this.clouds) {
      const t = c.getTransform()
      t.position.x -= drift * step
      if (t.position.x < -19) t.position.x = 19
    }
    if (this.state === 'playing') {
      const ds = this.worldSpeed * 1.15 * step
      for (const d of this.dashes) {
        const t = d.getTransform()
        t.position.x -= ds
        if (t.position.x < -15) t.position.x += 30
      }
    }
  }

  private applyFlash() {
    const el = this.flashEl
    if (!el || !el.style) return
    el.style.opacity = this.flash.toFixed(3)
  }

  private updateScoreFx() {    const el = this.scoreEl
    if (!el || !el.style) return
    const s = 1 + this.pulse * 0.32
    el.style.transform = 'translateX(-50%) scale(' + s.toFixed(3) + ')'
    el.style.color = this.pulse > 0.35 ? '#fff6c9' : '#ffffff'
  }

  private fitCamera() {
    if (!this.ctx) return
    try {
      const doc: any = typeof document !== 'undefined' ? document : null
      const canvas: any = doc && doc.querySelector ? doc.querySelector('canvas') : null
      let aspect = 16 / 9
      if (canvas && canvas.clientHeight > 0) aspect = canvas.clientWidth / canvas.clientHeight
      aspect = Math.max(1.0, Math.min(2.6, aspect))
      const tanHalf = Math.tan((60 * Math.PI) / 360)
      const z = Math.max(10.5, Math.min(17, 8.2 / (tanHalf * aspect)))
      const tr = this.ctx.entity.getTransform()
      tr.position.z = z
      const cam = this.ctx.entity.getComponent ? this.ctx.entity.getComponent('Camera') : null
      if (cam) {
        cam.orthoSize = Math.max(6, 8.2 / aspect)
        cam.isOrthographic = true
      }
    } catch (err) { /* abaikan */ }
  }

  // ------------------------------------------------------------------ ui
  private bindUi() {
    const ui = this.ctx && this.ctx.ui
    if (!ui) return
    const bind = (sel: string, fn: () => any) => {
      try { ui.bind(sel, () => String(fn())) } catch (err) { /* elemen belum ada */ }
    }
    bind('#score', () => this.score)
    bind('#best', () => this.best)
    bind('#final-score', () => this.score)
    bind('#final-best', () => this.best)
    bind('#medal-label', () => this.medalLabel())
    bind('#state-tag', () => this.stateTag())
    bind('#speed-tag', () => this.worldSpeed.toFixed(1) + 'x')
    try { ui.on('#btn-restart', 'click', () => this.restart()) } catch (err) { /* abaikan */ }
    try { ui.hide('#gameover-panel') } catch (err) { /* abaikan */ }
  }

  private medalLabel() {
    const s = this.score
    if (s >= 30) return 'PLATINUM'
    if (s >= 20) return 'EMAS'
    if (s >= 10) return 'PERAK'
    if (s >= 5) return 'PERUNGGU'
    return 'PEMULA'
  }

  private stateTag() {
    if (this.state === 'ready') return 'SIAP'
    if (this.state === 'playing') return 'TERBANG'
    return 'TUMBANG'
  }

  private show(sel: string, visible: boolean) {
    const ui = this.ctx && this.ctx.ui
    if (!ui) return
    try {
      if (visible) ui.show(sel)
      else ui.hide(sel)
    } catch (err) { /* abaikan */ }
  }

  private query(sel: string) {
    try {
      return this.ctx && this.ctx.ui ? this.ctx.ui.query(sel) : null
    } catch (err) {
      return null
    }
  }

  // --------------------------------------------------------------- helper
  private readFlap() {
    const input = this.ctx && this.ctx.input
    if (!input) return false
    try {
      return !!(input.isActionJustPressed('Jump') || input.isActionJustPressed('Attack'))
    } catch (err) {
      return false
    }
  }

  private entities(): any[] {
    try {
      return this.ctx && this.ctx.world ? this.ctx.world.getEntities() : []
    } catch (err) {
      return []
    }
  }

  private find(name: string) {
    try {
      if (this.ctx.scene && this.ctx.scene.find) {
        const e = this.ctx.scene.find(name)
        if (e) return e
      }
    } catch (err) { /* lanjut */ }
    for (const e of this.entities()) {
      if (e.name === name) return e
    }
    return null
  }

  private loadBest() {
    try {
      if (typeof localStorage === 'undefined') return 0
      const v = Number(localStorage.getItem('flappyflight.best') || '0')
      return isFinite(v) && v > 0 ? v : 0
    } catch (err) {
      return 0
    }
  }

  private saveBest() {
    try {
      if (typeof localStorage === 'undefined') return
      localStorage.setItem('flappyflight.best', String(this.best))
    } catch (err) { /* abaikan */ }
  }

  // ---------------------------------------------------------------- audio
  private playTone(from: number, to: number, dur: number, type: string, gain: number) {
    try {
      const w: any = typeof window !== 'undefined' ? window : null
      if (!w) return
      const AC = w.AudioContext || w.webkitAudioContext
      if (!AC) return
      if (!this.audio) this.audio = new AC()
      const ac = this.audio
      if (ac.state === 'suspended' && ac.resume) ac.resume()
      const now = ac.currentTime
      const osc = ac.createOscillator()
      const amp = ac.createGain()
      osc.type = type
      osc.frequency.setValueAtTime(from, now)
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, to), now + dur)
      amp.gain.setValueAtTime(0.0001, now)
      amp.gain.exponentialRampToValueAtTime(gain, now + 0.012)
      amp.gain.exponentialRampToValueAtTime(0.0001, now + dur)
      osc.connect(amp)
      amp.connect(ac.destination)
      osc.start(now)
      osc.stop(now + dur + 0.02)
    } catch (err) { /* audio opsional */ }
  }
}

function clamp(v: number, lo: number, hi: number) {
  return v < lo ? lo : v > hi ? hi : v
}

function partKey(part: string) {
  if (part === 'Top') return 'top'
  if (part === 'Top Cap') return 'topCap'
  if (part === 'Bottom') return 'bottom'
  return 'bottomCap'
}
