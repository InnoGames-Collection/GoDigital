/**
 * EMOJI IQ — Procedural Web Audio Engine
 * Calm, professional, and non-disruptive audio feedback created via Web Audio API.
 * Includes master volume limiting, per-sound throttling, and clean lifecycle management.
 */

class EmojiIqAudio {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  public sfxEnabled: boolean = true;
  public musicEnabled: boolean = true;
  private lastTriggerTime: Record<string, number> = {};
  private activeOscillators: Set<OscillatorNode> = new Set();

  constructor() {
    try {
      const savedSfx = localStorage.getItem('emoji_iq_sfx');
      const savedMusic = localStorage.getItem('emoji_iq_music');
      if (savedSfx !== null) this.sfxEnabled = savedSfx === 'true';
      if (savedMusic !== null) this.musicEnabled = savedMusic === 'true';
    } catch {
      // Storage unavailable
    }
  }

  private initContext(): boolean {
    if (typeof window === 'undefined') return false;

    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }

    if (this.ctx && !this.masterGain) {
      this.masterGain = this.ctx.createGain();
      // Safe, comfortable master gain ceiling
      this.masterGain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }

    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    return !!(this.ctx && this.masterGain);
  }

  /**
   * Throttles identical sounds to prevent overlap from duplicate renders/events.
   */
  private shouldThrottle(soundKey: string, cooldownMs: number): boolean {
    const now = Date.now();
    const last = this.lastTriggerTime[soundKey] || 0;
    if (now - last < cooldownMs) {
      return true;
    }
    this.lastTriggerTime[soundKey] = now;
    return false;
  }

  public toggleSfx(): boolean {
    this.sfxEnabled = !this.sfxEnabled;
    try {
      localStorage.setItem('emoji_iq_sfx', String(this.sfxEnabled));
    } catch {}
    if (this.sfxEnabled) {
      this.playPop();
    } else {
      this.stopAll();
    }
    return this.sfxEnabled;
  }

  public toggleMusic(): boolean {
    this.musicEnabled = !this.musicEnabled;
    try {
      localStorage.setItem('emoji_iq_music', String(this.musicEnabled));
    } catch {}
    return this.musicEnabled;
  }

  /**
   * Immediately stops any currently ringing oscillators and resets active sound state.
   */
  public stopAll() {
    try {
      for (const osc of this.activeOscillators) {
        try {
          osc.stop();
          osc.disconnect();
        } catch {}
      }
      this.activeOscillators.clear();
    } catch {}
  }

  /**
   * Tactile Button Pop (Short, soft sine click)
   */
  public playPop() {
    if (!this.sfxEnabled) return;
    if (this.shouldThrottle('pop', 80)) return;
    if (!this.initContext() || !this.ctx || !this.masterGain) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(720, now + 0.04);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(this.masterGain);

      this.activeOscillators.add(osc);
      osc.onended = () => {
        this.activeOscillators.delete(osc);
        try {
          osc.disconnect();
          gain.disconnect();
        } catch {}
      };

      osc.start(now);
      osc.stop(now + 0.06);
    } catch {}
  }

  /**
   * Correct Answer Chime (Gentle, elegant 3-note ascending triad)
   */
  public playCorrect() {
    if (!this.sfxEnabled) return;
    if (this.shouldThrottle('correct', 250)) return;
    if (!this.initContext() || !this.ctx || !this.masterGain) return;

    try {
      const freqs = [523.25, 659.25, 783.99]; // C5, E5, G5
      const now = this.ctx.currentTime;

      freqs.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        const startTime = now + idx * 0.06;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.08, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.22);

        osc.connect(gain);
        gain.connect(this.masterGain!);

        this.activeOscillators.add(osc);
        osc.onended = () => {
          this.activeOscillators.delete(osc);
          try {
            osc.disconnect();
            gain.disconnect();
          } catch {}
        };

        osc.start(startTime);
        osc.stop(startTime + 0.24);
      });
    } catch {}
  }

  /**
   * Perfect Answer Sparkle (Delicate, high shimmer)
   */
  public playPerfect() {
    if (!this.sfxEnabled) return;
    if (this.shouldThrottle('perfect', 300)) return;
    if (!this.initContext() || !this.ctx || !this.masterGain) return;

    try {
      const notes = [659.25, 830.61, 987.77, 1318.51];
      const now = this.ctx.currentTime;

      notes.forEach((freq, i) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        const t = now + i * 0.05;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);

        gain.gain.setValueAtTime(0.07, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.24);

        osc.connect(gain);
        gain.connect(this.masterGain!);

        this.activeOscillators.add(osc);
        osc.onended = () => {
          this.activeOscillators.delete(osc);
          try {
            osc.disconnect();
            gain.disconnect();
          } catch {}
        };

        osc.start(t);
        osc.stop(t + 0.26);
      });
    } catch {}
  }

  /**
   * Incorrect Answer (Quiet, calm, non-disruptive feedback tone)
   * REPLACED the harsh 0.20 sawtooth buzzer with a soft, muted low sine/triangle tone.
   */
  public playIncorrect() {
    if (!this.sfxEnabled) return;
    if (this.shouldThrottle('incorrect', 250)) return;
    if (!this.initContext() || !this.ctx || !this.masterGain) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      // Soft low tone, no harsh harmonics
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.linearRampToValueAtTime(175, now + 0.14);

      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

      osc.connect(gain);
      gain.connect(this.masterGain);

      this.activeOscillators.add(osc);
      osc.onended = () => {
        this.activeOscillators.delete(osc);
        try {
          osc.disconnect();
          gain.disconnect();
        } catch {}
      };

      osc.start(now);
      osc.stop(now + 0.18);
    } catch {}
  }

  /**
   * Combo Escalation (Gentle pitch lift, softly blended)
   */
  public playCombo(comboCount: number) {
    if (!this.sfxEnabled) return;
    if (this.shouldThrottle('combo', 200)) return;
    if (!this.initContext() || !this.ctx || !this.masterGain) return;

    try {
      const base = 480;
      const step = Math.min(8, comboCount) * 40;
      const now = this.ctx.currentTime;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(base + step, now);
      osc.frequency.exponentialRampToValueAtTime(base + step + 120, now + 0.1);

      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

      osc.connect(gain);
      gain.connect(this.masterGain);

      this.activeOscillators.add(osc);
      osc.onended = () => {
        this.activeOscillators.delete(osc);
        try {
          osc.disconnect();
          gain.disconnect();
        } catch {}
      };

      osc.start(now);
      osc.stop(now + 0.15);
    } catch {}
  }

  /**
   * Countdown Tick (Subtle woodblock-like tap, throttled to prevent rapid repetition)
   */
  public playTick() {
    if (!this.sfxEnabled) return;
    if (this.shouldThrottle('tick', 600)) return; // Max once per 600ms
    if (!this.initContext() || !this.ctx || !this.masterGain) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(640, now);

      gain.gain.setValueAtTime(0.025, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

      osc.connect(gain);
      gain.connect(this.masterGain);

      this.activeOscillators.add(osc);
      osc.onended = () => {
        this.activeOscillators.delete(osc);
        try {
          osc.disconnect();
          gain.disconnect();
        } catch {}
      };

      osc.start(now);
      osc.stop(now + 0.03);
    } catch {}
  }

  /**
   * Hint Revealer Sound
   */
  public playHint() {
    if (!this.sfxEnabled) return;
    if (this.shouldThrottle('hint', 200)) return;
    if (!this.initContext() || !this.ctx || !this.masterGain) return;

    try {
      const now = this.ctx.currentTime;
      [440, 554.37, 659.25].forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        const t = now + idx * 0.06;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);

        gain.gain.setValueAtTime(0.06, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);

        osc.connect(gain);
        gain.connect(this.masterGain!);

        this.activeOscillators.add(osc);
        osc.onended = () => {
          this.activeOscillators.delete(osc);
          try {
            osc.disconnect();
            gain.disconnect();
          } catch {}
        };

        osc.start(t);
        osc.stop(t + 0.18);
      });
    } catch {}
  }

  /**
   * Level Clear Victory Fanfare (Gentle, warm celebratory melody)
   */
  public playLevelClear() {
    if (!this.sfxEnabled) return;
    if (this.shouldThrottle('levelClear', 500)) return;
    if (!this.initContext() || !this.ctx || !this.masterGain) return;

    try {
      const notes = [
        { f: 523.25, d: 0.10 },
        { f: 659.25, d: 0.10 },
        { f: 783.99, d: 0.12 },
        { f: 1046.5, d: 0.28 },
      ];
      let t = this.ctx.currentTime;

      notes.forEach((n) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(n.f, t);

        gain.gain.setValueAtTime(0.09, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + n.d - 0.02);

        osc.connect(gain);
        gain.connect(this.masterGain!);

        this.activeOscillators.add(osc);
        osc.onended = () => {
          this.activeOscillators.delete(osc);
          try {
            osc.disconnect();
            gain.disconnect();
          } catch {}
        };

        osc.start(t);
        osc.stop(t + n.d);

        t += n.d * 0.85;
      });
    } catch {}
  }
}

export const emojiIqAudio = new EmojiIqAudio();
