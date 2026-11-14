/* ==========================================================================
 * audio.js — original ambient score + UI sound design, synthesised
 * deterministically from the same time cues the visuals use
 * (buildSoundEvents() in engine.js). The browser plays this exact buffer and
 * render-video.js exports the same samples for the MP4, so both mixes match.
 * ========================================================================== */
'use strict';

const AUDIO = (function () {
  const SR = 48000;
  const N = Math.round(DURATION * SR);            // 4,320,000 samples = 90.000 s
  const TAU = Math.PI * 2;
  const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
  const TABN = 8192, SIN = new Float32Array(TABN + 1);
  for (let i = 0; i <= TABN; i++) SIN[i] = Math.sin((i / TABN) * TAU);
  function sn(ph) { const x = (ph - Math.floor(ph)) * TABN, i = x | 0, f = x - i; return SIN[i] + (SIN[i + 1] - SIN[i]) * f; }

  /* ---- chord plan (MIDI). D6/9, Bm11, Gmaj9, Asus2 — shared tones keep the pad smooth */
  const C = {
    D69: [50, 57, 59, 64, 66], Bm11: [47, 54, 57, 62, 64], G9: [43, 50, 54, 57, 59], A: [45, 52, 57, 59, 64]
  };
  const CHORDS = [
    [15.0, 18.75, C.D69], [18.75, 22.5, C.Bm11], [22.5, 26.25, C.G9], [26.25, 30.0, C.A],
    [30.0, 35.0, C.D69], [35.0, 40.0, C.Bm11], [40.0, 45.0, C.G9], [45.0, 50.0, C.A],
    [50.0, 54.6, C.G9], [54.6, 58.0, C.A], [58.0, 61.5, C.Bm11], [61.5, 66.0, C.D69], [66.0, 70.0, C.G9],
    [70.0, 74.0, C.D69], [74.0, 78.0, C.Bm11], [78.0, 82.0, C.G9],
    [82.0, 85.3, C.A], [85.3, 90.0, C.D69]
  ];
  function chordAt(t) { for (const c of CHORDS) if (t >= c[0] && t < c[1]) return c[2]; return null; }

  /* ---- simple DSP blocks */
  function onePoleLP(fc) { const a = Math.exp(-TAU * fc / SR); let z = 0; return x => (z = x * (1 - a) + z * a); }
  function biquadBP() { // RBJ band-pass with per-sample frequency
    let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
    return (x, f, q) => {
      const w = TAU * Math.min(f, SR * 0.45) / SR, al = Math.sin(w) / (2 * q), cw = Math.cos(w), a0 = 1 + al;
      const y = ((al) * x + 0 * x1 - al * x2 - (-2 * cw) * y1 - (1 - al) * y2) / a0;
      x2 = x1; x1 = x; y2 = y1; y1 = y; return y;
    };
  }

  function synth(events, onProgress) {
    const L = new Float32Array(N), R = new Float32Array(N), SEND = new Float32Array(N);
    const add = (i, l, r, send) => { if (i >= 0 && i < N) { L[i] += l; R[i] += r; if (send) SEND[i] += (l + r) * 0.5 * send; } };
    const pan = p => [Math.cos((p + 1) * Math.PI / 4), Math.sin((p + 1) * Math.PI / 4)];

    /* ---- 1. pad (rendered at 12 kHz, low-passed, then upsampled) */
    const PSR = 12000, PN = Math.round(DURATION * PSR);
    const padL = new Float32Array(PN), padR = new Float32Array(PN);
    for (let ci = 0; ci < CHORDS.length; ci++) {
      const [t0, t1, notes] = CHORDS[ci];
      const att = 0.9, rel = 1.5, last = ci === CHORDS.length - 1;
      const iEnd = Math.min(PN, Math.round((last ? 90 : t1 + rel) * PSR));
      notes.forEach((m, ni) => {
        const f = mtof(m), g = 0.055 / Math.sqrt(notes.length) * (ni === 0 ? 1.1 : 1);
        const [pl, pr] = pan(-0.5 + ni / (notes.length - 1));
        let ph1 = (ni * 0.13) % 1, ph2 = (ni * 0.37) % 1;
        const d1 = f * Math.pow(2, 4 / 1200) / PSR, d2 = f * Math.pow(2, -4 / 1200) / PSR;
        for (let i = Math.round(t0 * PSR); i < iEnd; i++) {
          const t = i / PSR;
          let e = Math.min(1, (t - t0) / att);
          if (!last && t > t1) e *= Math.max(0, 1 - (t - t1) / rel);
          if (last) e *= Math.max(0, 1 - Math.max(0, t - 87.6) / 2.4);
          e = e * e * (3 - 2 * e);
          const tremolo = 1 + 0.06 * Math.sin(TAU * 0.23 * t + ni);
          const v = (sn(ph1) + 0.22 * sn(ph1 * 2) + 0.08 * sn(ph1 * 3)) * 0.6 + (sn(ph2) + 0.22 * sn(ph2 * 2)) * 0.4;
          ph1 += d1; ph2 += d2;
          padL[i] += v * g * e * pl * tremolo; padR[i] += v * g * e * pr * tremolo;
        }
      });
    }
    // Scene 1 tension drone (D2 + A2, then A3/Bb3 rub), also at 12 kHz
    {
      const parts = [[38, 0.0, 0.07], [45, 0.6, 0.045], [50, 4.0, 0.03], [57, 8.6, 0.02], [58, 9.4, 0.018]];
      for (const [m, start, g] of parts) {
        const f = mtof(m); let ph = 0;
        for (let i = Math.round(start * PSR); i < Math.round(15.0 * PSR); i++) {
          const t = i / PSR, e = Math.min(1, (t - start) / 2.2) * (1 + 0.6 * Math.max(0, (t - 9) / 6)) * (1 - Math.max(0, (t - 14.55) / 0.4));
          const v = sn(ph) + 0.3 * sn(ph * 2) + 0.12 * sn(ph * 3.01);
          ph += f / PSR;
          const w = 0.5 + 0.5 * Math.sin(TAU * 0.4 * t + m);
          padL[i] += v * g * Math.max(0, e) * (0.7 + 0.3 * w); padR[i] += v * g * Math.max(0, e) * (0.7 + 0.3 * (1 - w));
        }
      }
    }
    { const lpL = onePoleLP(2000), lpR = onePoleLP(2000); for (let i = 0; i < PN; i++) { padL[i] = lpL(padL[i]); padR[i] = lpR(padR[i]); } }
    const ratio = SR / PSR;
    for (let i = 0; i < N; i++) {
      const x = i / ratio, j = x | 0, f = x - j, j1 = Math.min(PN - 1, j + 1);
      const l = padL[j] + (padL[j1] - padL[j]) * f, r = padR[j] + (padR[j1] - padR[j]) * f;
      L[i] += l; R[i] += r; SEND[i] += (l + r) * 0.5 * 0.42;
    }
    onProgress && onProgress(0.3);

    /* ---- 2. bass (chord roots, S2–S6) */
    {
      let ph = 0;
      for (let i = Math.round(15 * SR); i < N; i++) {
        const t = i / SR, ch = chordAt(t); if (!ch) continue;
        const f = mtof(ch[0] - 12);
        let e = Math.min(1, (t - 15) / 1.5) * (1 - Math.max(0, (t - 87.8) / 2.2));
        // soft dip at chord changes
        for (const c of CHORDS) { const d = Math.abs(t - c[0]); if (d < 0.25) e *= 0.55 + 0.45 * (d / 0.25); }
        ph += f / SR;
        const v = sn(ph) * 0.09 * Math.max(0, e);
        L[i] += v; R[i] += v;
      }
    }

    /* ---- 3. pulse: S1 heartbeat (accelerating) + soft S2–S5 pulse + S1 clock ticks */
    function kick(t0, g, p) {
      const [pl, pr] = pan(p || 0); let ph = 0; const i0 = Math.round(t0 * SR), len = Math.round(0.45 * SR);
      for (let k = 0; k < len; k++) {
        const t = k / SR, f = 46 + 72 * Math.exp(-t * 30); ph += f / SR;
        const a = Math.exp(-t * 8) * (1 - Math.exp(-t * 500));
        const v = sn(ph) * a * g; add(i0 + k, v * pl, v * pr, 0.05);
      }
    }
    { let t = 1.0; while (t < 14.55) { kick(t, 0.32); kick(t + 0.16, 0.16); t += 1.15 - 0.72 * Math.pow(Math.min(1, t / 14.6), 1.3); } }
    for (let t = 19.0; t < 81.9; t += 1.0) kick(t, 0.11 + 0.03 * (t > 50 && t < 70 ? 1 : 0));
    const nz = mulberry32(90210);
    function noiseBurst(t0, dur, g, fc, q, p, send, decay) {
      const bp = biquadBP(); const [pl, pr] = pan(p || 0); const i0 = Math.round(t0 * SR), len = Math.round(dur * SR);
      for (let k = 0; k < len; k++) { const t = k / SR; const a = Math.exp(-t * (decay || 60)) * Math.min(1, t * 2000); const v = bp(nz() * 2 - 1, fc, q) * a * g; add(i0 + k, v * pl, v * pr, send || 0); }
    }
    for (let t = 4.0, n = 0; t < 14.5; t += 0.5, n++) noiseBurst(t, 0.03, 0.22, n % 2 ? 4200 : 3300, 6, n % 2 ? 0.25 : -0.25, 0.1, 120);
    for (let t = 30.25; t < 81.9; t += 0.5) noiseBurst(t, 0.04, 0.07, 6500, 2, ((t * 2) | 0) % 2 ? 0.3 : -0.3, 0.05, 90);

    /* ---- 4. arpeggio plucks (S3–S5), triangle tone */
    for (let t = 30.0; t < 81.75; t += 0.25) {
      const ch = chordAt(t + 0.01); if (!ch) continue;
      const step = Math.round((t - 30) / 0.25), pat = [ch[2] + 12, ch[3] + 12, ch[4] + 12, ch[3] + 12];
      const m = pat[step % 4], f = mtof(m);
      const g = 0.03 * (t >= 50 && t < 70 ? 1.25 : 1) * (step % 2 ? 0.8 : 1);
      const [pl, pr] = pan(step % 2 ? 0.35 : -0.35);
      const i0 = Math.round(t * SR), len = Math.round(0.42 * SR); let ph = 0;
      for (let k = 0; k < len; k++) {
        const tt = k / SR; ph += f / SR;
        const tri = 1 - 4 * Math.abs((ph - Math.floor(ph)) - 0.5);
        const a = Math.exp(-tt * 9) * Math.min(1, tt * 400);
        const v = tri * a * g; add(i0 + k, v * pl, v * pr, 0.5);
      }
    }
    onProgress && onProgress(0.5);

    /* ---- 5. sound effects from the shared cue table */
    function bell(t0, m, g, dur, p, send) {
      const f = mtof(m), [pl, pr] = pan(p || 0), i0 = Math.round(t0 * SR), len = Math.round(dur * SR); let ph = 0;
      for (let k = 0; k < len; k++) {
        const t = k / SR; ph += f / SR;
        const a = Math.exp(-t * (4.2 / dur * 1.6)) * Math.min(1, t * 300);
        const v = (sn(ph) + 0.45 * sn(ph * 2.0) * Math.exp(-t * 6) + 0.2 * sn(ph * 3.01) * Math.exp(-t * 10)) * a * g;
        add(i0 + k, v * pl, v * pr, send === undefined ? 0.45 : send);
      }
    }
    function glide(t0, f0, f1, dur, g, p, send) {
      const [pl, pr] = pan(p || 0), i0 = Math.round(t0 * SR), len = Math.round(dur * SR); let ph = 0;
      for (let k = 0; k < len; k++) { const q = k / len, f = f0 * Math.pow(f1 / f0, q); ph += f / SR; const a = Math.exp(-q * 4) * Math.min(1, k / (SR * 0.002)); const v = sn(ph) * a * g; add(i0 + k, v * pl, v * pr, send || 0.15); }
    }
    function whoosh(t0, dur, g, f0, f1, f2, p0, p1, send) {
      const bp = biquadBP(), bp2 = biquadBP(); const i0 = Math.round(t0 * SR), len = Math.round(dur * SR);
      for (let k = 0; k < len; k++) {
        const q = k / len, f = q < 0.55 ? f0 * Math.pow(f1 / f0, q / 0.55) : f1 * Math.pow(f2 / f1, (q - 0.55) / 0.45);
        const a = Math.pow(Math.sin(Math.PI * q), 1.6) * g, w = nz() * 2 - 1;
        const v = (bp(w, f, 1.4) + 0.5 * bp2(w, f * 1.9, 2.2)) * a; const [pl, pr] = pan(lerp(p0, p1, q));
        add(i0 + k, v * pl, v * pr, send === undefined ? 0.3 : send);
      }
    }
    events.forEach((ev, idx) => {
      const t = ev.t, soft = ev.soft ? 0.55 : 1;
      switch (ev.k) {
        case 'tap': glide(t, 1650, 950, 0.06, 0.13, 0.15, 0.05); noiseBurst(t, 0.012, 0.25, 3800, 1.2, 0.15, 0.02, 500); break;
        case 'key': noiseBurst(t, 0.018, (ev.soft ? 0.12 : 0.16) * (0.75 + 0.5 * ((idx * 7919) % 13) / 13), 2600 + ((idx * 31) % 9) * 160, 3, ((idx % 3) - 1) * 0.2, 0.03, 260); break;
        case 'pencil': noiseBurst(t, 0.05, 0.05, 5200, 2.5, 0.35, 0.02, 70); break;
        case 'paper': for (let b = 0; b < 5; b++) noiseBurst(t + b * 0.055, 0.12, 0.2 - b * 0.03, 1800 + b * 700, 1.1, -0.2 + b * 0.1, 0.12, 30); break;
        case 'stab': glide(t, 110, 52, 0.55, 0.38, 0, 0.35); noiseBurst(t, 0.25, 0.25, 420, 0.9, 0, 0.3, 14); break;
        case 'drop': glide(t, 240, 110, 0.18, 0.22, 0, 0.2); break;
        case 'drone': break;
        case 'riser': {
          const i0 = Math.round(t * SR), len = Math.round(ev.d * SR), bp = biquadBP(); let ph = 0;
          for (let k = 0; k < len; k++) {
            const q = k / len, f = 180 * Math.pow(4, q); ph += f / SR;
            const a = Math.pow(q, 2.2) * (1 - Math.pow(Math.max(0, q - 0.97) / 0.03, 2));
            const trem = 0.75 + 0.25 * Math.sin(TAU * (4 + 14 * q) * k / SR);
            const v = (sn(ph) * 0.18 + bp(nz() * 2 - 1, 500 + 5500 * q * q, 1.2) * 0.55) * a * trem;
            add(i0 + k, v * (0.8 + 0.2 * q), v * (0.8 + 0.2 * q), 0.25);
          }
          break;
        }
        case 'impact': {
          glide(t, 62, 30, 1.8, 0.8, 0, 0.3); noiseBurst(t, 0.6, 0.6, 380, 0.7, 0, 0.5, 8);
          [62, 69, 74, 78].forEach((m, i) => bell(t + 0.02 + i * 0.01, m, 0.075, 3.2, -0.3 + i * 0.2, 0.7));
          break;
        }
        case 'shimmer': [86, 93, 90, 98].forEach((m, i) => bell(t + i * 0.09, m, 0.035, 2.6, -0.4 + i * 0.27, 0.8)); break;
        case 'swell': whoosh(t - 0.6, 1.0, 0.07, 300, 1800, 900, -0.3, 0.3, 0.6); break;
        case 'pop': glide(t, ev.f || 560, (ev.f || 560) * 1.5, 0.09, 0.16 * soft, 0, 0.2); break;
        case 'sparkle': [93, 98, 102].forEach((m, i) => bell(t + i * 0.06, m, 0.05, 0.9, -0.2 + i * 0.2, 0.6)); break;
        case 'whoosh': whoosh(t - 0.15, 0.75, 0.42, 350, 2600, 700, -0.6, 0.6); break;
        case 'whooshSoft': whoosh(t - 0.1, 0.55, 0.22, 400, 2000, 800, 0.4, -0.4); break;
        case 'slide': whoosh(t, 0.32, 0.16, 600, 2400, 1600, 0, 0.2, 0.15); break;
        case 'confirm': bell(t, 86, 0.11, 1.2, -0.15); bell(t + 0.11, 93, 0.1, 1.4, 0.15); break;
        case 'success': [74, 78, 81, 86].forEach((m, i) => bell(t + i * 0.075, m, 0.1, 1.4, -0.3 + i * 0.2)); break;
        case 'hit': glide(t, 90, 48, 0.6, 0.3, 0, 0.3); bell(t, 74, 0.07, 1.6, 0, 0.6); break;
        case 'dataRise': {
          const i0 = Math.round(t * SR), len = Math.round(ev.d * SR), bp = biquadBP(); let ph = 0;
          for (let k = 0; k < len; k++) {
            const q = k / len, f = 300 * Math.pow(3, q); ph += f / SR;
            const a = Math.sin(Math.PI * q) * 0.6 + 0.4 * q * (1 - Math.max(0, q - 0.9) / 0.1);
            const v = (sn(ph) * 0.025 + bp(nz() * 2 - 1, 1500 + 3000 * q, 3) * 0.06) * a;
            add(i0 + k, v * 0.9, v * 0.9, 0.35);
          }
          break;
        }
        case 'blip': glide(t, ev.f || 1800, (ev.f || 1800) * 1.15, 0.05, 0.08 * soft, ((idx % 2) ? 0.3 : -0.3), 0.15); break;
        case 'paste': glide(t, 300, 180, 0.12, 0.18, 0, 0.1); glide(t + 0.04, 900, 1400, 0.08, 0.1, 0.2, 0.2); break;
        case 'sting': glide(t, 74, 37, 2.4, 0.45, 0, 0.35); [62, 69, 74, 78, 81].forEach((m, i) => bell(t + i * 0.035, m, 0.075, 3.8, -0.4 + i * 0.2, 0.75)); break;
      }
    });
    // rain bed (field conditions, Scene 1)
    {
      const bp = biquadBP(), [t0, t1] = [5.2, 10.0], i0 = Math.round(t0 * SR), len = Math.round((t1 - t0) * SR);
      for (let k = 0; k < len; k++) { const q = k / len, a = Math.sin(Math.PI * q) * 0.11; const v = bp(nz() * 2 - 1, 2400, 0.5) * a; add(i0 + k, v * (0.8 + 0.2 * Math.sin(k / 4000)), v * (0.8 + 0.2 * Math.cos(k / 4100)), 0.15); }
    }
    onProgress && onProgress(0.7);

    /* ---- 6. reverb (Freeverb-style, 24 kHz) on the send bus */
    {
      const RSR = 24000, RN = Math.ceil(N / 2), inp = new Float32Array(RN);
      for (let i = 0; i < RN; i++) inp[i] = (SEND[2 * i] + (SEND[2 * i + 1] || 0)) * 0.5;
      const combT = [1116, 1188, 1277, 1356, 1422, 1491, 1557, 1617].map(v => Math.round(v * RSR / 44100));
      const apT = [556, 441, 341, 225].map(v => Math.round(v * RSR / 44100));
      const outL = new Float32Array(RN), outR = new Float32Array(RN);
      for (const [out, spread] of [[outL, 0], [outR, 12]]) {
        const combs = combT.map(d => ({ b: new Float32Array(d + spread), i: 0, z: 0 }));
        const aps = apT.map(d => ({ b: new Float32Array(d + spread), i: 0 }));
        const fb = 0.86, damp = 0.32;
        for (let n = 0; n < RN; n++) {
          const x = inp[n] * 0.015; let y = 0;
          for (const c of combs) { const o = c.b[c.i]; c.z = o * (1 - damp) + c.z * damp; c.b[c.i] = x + c.z * fb; c.i = (c.i + 1) % c.b.length; y += o; }
          for (const a of aps) { const o = a.b[a.i]; const v = -y + o; a.b[a.i] = y + o * 0.5; a.i = (a.i + 1) % a.b.length; y = v; }
          out[n] = y;
        }
      }
      for (let i = 0; i < N; i++) { const x = i / 2, j = x | 0, f = x - j, j1 = Math.min(RN - 1, j + 1); L[i] += (outL[j] + (outL[j1] - outL[j]) * f) * 3.2; R[i] += (outR[j] + (outR[j1] - outR[j]) * f) * 3.2; }
    }
    onProgress && onProgress(0.9);

    /* ---- 7. master: RMS-normalise, soft-limit, fades */
    let acc = 0; for (let i = 0; i < N; i += 4) acc += L[i] * L[i] + R[i] * R[i];
    const rms = Math.sqrt(acc / (N / 2));
    const g = 0.105 / (rms || 1);          // ≈ -19.6 dBFS RMS before limiting
    const knee = 0.56, room = 0.28;     // ceiling ≈ 0.84 (−1.5 dBFS) to leave AAC headroom
    for (let i = 0; i < N; i++) {
      const t = i / SR, fade = Math.min(1, t / 0.05) * Math.min(1, Math.max(0, (DURATION - t) / 0.7));
      for (const buf of [L, R]) {
        let x = buf[i] * g, ax = Math.abs(x);
        if (ax > knee) x = Math.sign(x) * (knee + room * Math.tanh((ax - knee) / room));
        buf[i] = x * fade;
      }
    }
    onProgress && onProgress(1);
    return { L, R, sampleRate: SR, length: N };
  }

  /* async wrapper so the page stays responsive while the mix is computed */
  let cache = null;
  async function render(onProgress) {
    if (cache) return cache;
    await new Promise(r => setTimeout(r, 0));
    cache = synth(buildSoundEvents(), onProgress);
    return cache;
  }
  /* interleaved 16-bit PCM, base64-encoded in chunks (used by render-video.js) */
  async function pcm16Chunks(chunkFrames) {
    const mix = await render();
    chunkFrames = chunkFrames || 480000;
    const out = [];
    for (let s = 0; s < mix.length; s += chunkFrames) {
      const n = Math.min(chunkFrames, mix.length - s), buf = new Int16Array(n * 2);
      for (let i = 0; i < n; i++) {
        buf[2 * i] = Math.max(-32768, Math.min(32767, Math.round(mix.L[s + i] * 32767)));
        buf[2 * i + 1] = Math.max(-32768, Math.min(32767, Math.round(mix.R[s + i] * 32767)));
      }
      const bytes = new Uint8Array(buf.buffer); let bin = '';
      for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
      out.push(btoa(bin));
    }
    return out;
  }
  return { SR, N, render, pcm16Chunks, CHORDS };
})();
