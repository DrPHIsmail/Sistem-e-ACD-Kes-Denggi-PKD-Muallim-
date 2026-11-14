/* ==========================================================================
 * audio.js (V3) — one resolved soundtrack, computed deterministically in the
 * page and used unchanged by the HTML player and by render-video.js:
 *
 *   score + effects  synthesised from the same time cues as the visuals
 *                    (buildSoundEvents() in engine.js). 00:00–00:13.35 keeps
 *                    the 90-second film's opening: tension drone, paired
 *                    accelerating heartbeat, clock ticks and a riser, with the
 *                    impact moved onto the title at 00:13.35.
 *   narration        V8: narasi-v8/narasi-v8.wav (ElevenLabs voice "Ahmad",
 *                    placed on the FILM clock by tools/place-narration-v8.py;
 *                    V3: the supplied narration-bm.wav), embedded losslessly as
 *                    FLAC by tools/build-player.js (or injected as PCM by
 *                    render-video.js --voiceover), decoded at 48 kHz.
 *   mix              ITU-R BS.1770 loudness: narration at NARR_LUFS, score at
 *                    BED_LUFS and ducked by DUCK_DB while the narration is
 *                    active (80 ms look-ahead, 250 ms hold, 600 ms release),
 *                    programme trimmed to PROGRAM_LUFS, 5 ms look-ahead peak
 *                    limiter at CEILING. No browser speech synthesis.
 * ========================================================================== */
'use strict';

const AUDIO = (function () {
  const SR = 48000;
  const N = Math.round(DURATION * SR);            // V9: 6,787,200 samples = 141.400 s
  const TAU = Math.PI * 2;
  // V8: the score is ducked 10 dB under the voice (V3: 12 dB), so the music stays present between and under lines;
  // 14 dB over the manual-scene build-up (heartbeat, ticks and riser before the title impact), where it is loudest
  // V9: only 9 dB under the opening lines (0–9 s), so the tension music of the flow chart stays present
  const NARR_LUFS = -15.6, BED_LUFS = -19.5, PROGRAM_LUFS = -16.0, DUCK_DB = -10, DUCK_BUILD_DB = -14, DUCK_OPEN_DB = -9, CEILING = 0.84;   // 0.84 ≈ −1.5 dBFS
  const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
  const TABN = 8192, SIN = new Float32Array(TABN + 1);
  for (let i = 0; i <= TABN; i++) SIN[i] = Math.sin((i / TABN) * TAU);
  function sn(ph) { const x = (ph - Math.floor(ph)) * TABN, i = x | 0, f = x - i; return SIN[i] + (SIN[i + 1] - SIN[i]) * f; }

  /* ---- chord plan (MIDI). D6/9, Bm11, Gmaj9, Asus2 — shared tones keep the pad smooth.
   * The opening (00:00–00:13.35) has no pad: drone, heartbeat and ticks only. The pad
   * resolves on the title impact and changes at the V3 segment boundaries. */
  const C = {
    D69: [50, 57, 59, 64, 66], Bm11: [47, 54, 57, 62, 64], G9: [43, 50, 54, 57, 59], A: [45, 52, 57, 59, 64]
  };
  /* V5 story-time plan, mapped onto the film clock (filmTime: V7 slower manual scene, V6 WhatsApp
   * segment) plus the segment's own progression; the title chord still lands on the impact. */
  const STORY_CHORDS = [
    [13.35, 16.8, C.D69],                                                     // title
    [16.8, 20.55, C.Bm11], [20.55, 24.3, C.G9],                               // NADI card
    [24.3, 28.65, C.A], [28.65, 33.0, C.D69],                                 // one phone
    [33.0, 37.0, C.Bm11], [37.0, 41.0, C.G9], [41.0, 45.0, C.A], [45.0, 49.4, C.D69],   // the record
    [49.4, 52.2, C.G9], [52.2, 55.0, C.A],                                    // saved
    [55.0, 58.5, C.Bm11], [58.5, 62.0, C.A],                                  // one-way write to Sheets
    [62.0, 66.0, C.D69], [66.0, 70.0, C.G9], [70.0, 74.0, C.Bm11], [74.0, 78.0, C.A],   // coverage
    [78.0, 81.5, C.D69], [81.5, INSERT.at, C.G9],                             // Bahagian D
    [85.0, 89.0, C.Bm11], [89.0, 93.0, C.G9], [93.0, 97.0, C.A], [97.0, 101.0, C.Bm11], [101.0, 105.0, C.A],   // follow-up
    [105.0, 108.7, C.D69], [108.7, 112.35, C.G9],                             // benefit cards
    [112.35, 120, C.D69]                                                      // closing
  ];
  const W0 = INSERT.atF;
  const CHORDS = STORY_CHORDS.map(([a, b, n]) => [filmTime(a), b >= 120 ? DURATION : b === INSERT.at ? W0 : filmTime(b), n])
    .concat([[W0, W0 + 3.5, C.D69], [W0 + 3.5, W0 + 7, C.A], [W0 + 7, W0 + 10.5, C.G9], [W0 + 10.5, filmTime(85.0), C.A]])   // copy, paste, send, read
    .sort((x, y) => x[0] - y[0]);
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
    const IMPACT = filmTime(T.d.impact);   // V7: 16.35 s on the film clock

    /* ---- 1. pad (rendered at 12 kHz, low-passed, then upsampled) */
    const PSR = 12000, PN = Math.round(DURATION * PSR);
    const padL = new Float32Array(PN), padR = new Float32Array(PN);
    for (let ci = 0; ci < CHORDS.length; ci++) {
      const [t0, t1, notes] = CHORDS[ci];
      const att = ci === 0 ? 0.25 : 0.9, rel = 1.5, last = ci === CHORDS.length - 1;
      const iEnd = Math.min(PN, Math.round((last ? DURATION : t1 + rel) * PSR));
      notes.forEach((m, ni) => {
        const f = mtof(m), g = 0.055 / Math.sqrt(notes.length) * (ni === 0 ? 1.1 : 1);
        const [pl, pr] = pan(-0.5 + ni / (notes.length - 1));
        let ph1 = (ni * 0.13) % 1, ph2 = (ni * 0.37) % 1;
        const d1 = f * Math.pow(2, 4 / 1200) / PSR, d2 = f * Math.pow(2, -4 / 1200) / PSR;
        for (let i = Math.round(t0 * PSR); i < iEnd; i++) {
          const t = i / PSR;
          let e = Math.min(1, (t - t0) / att);
          if (!last && t > t1) e *= Math.max(0, 1 - (t - t1) / rel);
          if (last) e *= Math.max(0, 1 - Math.max(0, t - (DURATION - 2.4)) / 2.4);
          e = e * e * (3 - 2 * e);
          const tremolo = 1 + 0.06 * Math.sin(TAU * 0.23 * t + ni);
          const v = (sn(ph1) + 0.22 * sn(ph1 * 2) + 0.08 * sn(ph1 * 3)) * 0.6 + (sn(ph2) + 0.22 * sn(ph2 * 2)) * 0.4;
          ph1 += d1; ph2 += d2;
          padL[i] += v * g * e * pl * tremolo; padR[i] += v * g * e * pr * tremolo;
        }
      });
    }
    // 00:00–00:13.35 tension drone from the 90-second film (D2 + A2, then the A3/Bb3 rub), cut on the impact
    {
      const parts = [[38, 0.0, 0.07], [45, 0.6, 0.045], [50, 4.0, 0.03], [57, filmTime(8.6), 0.02], [58, filmTime(9.4), 0.018]];
      const swell = filmTime(9);   // V7: the crescendo keeps its shape over the slower manual scene
      for (const [m, start, g] of parts) {
        const f = mtof(m); let ph = 0;
        for (let i = Math.round(start * PSR); i < Math.round(IMPACT * PSR); i++) {
          const t = i / PSR, e = Math.min(1, (t - start) / 2.2) * (1 + 0.6 * Math.max(0, (t - swell) / (IMPACT - swell))) * (1 - Math.max(0, (t - (IMPACT - 0.4)) / 0.4));
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

    /* ---- 2. bass (chord roots, from the NADI card to the end) */
    {
      let ph = 0;
      const B0 = filmTime(16.8);
      for (let i = Math.round(B0 * SR); i < N; i++) {
        const t = i / SR, ch = chordAt(t); if (!ch) continue;
        const f = mtof(ch[0] - 12);
        let e = Math.min(1, (t - B0) / 1.5) * (1 - Math.max(0, (t - (DURATION - 2.2)) / 2.2));
        for (const c of CHORDS) { const d = Math.abs(t - c[0]); if (d < 0.25) e *= 0.55 + 0.45 * (d / 0.25); }
        ph += f / SR;
        const v = sn(ph) * 0.09 * Math.max(0, e);
        L[i] += v; R[i] += v;
      }
    }

    /* ---- 3. pulse: opening heartbeat (paired, accelerating, 00:00.8–00:13.2) + soft pulse + clock ticks */
    function kick(t0, g, p) {
      const [pl, pr] = pan(p || 0); let ph = 0; const i0 = Math.round(t0 * SR), len = Math.round(0.45 * SR);
      for (let k = 0; k < len; k++) {
        const t = k / SR, f = 46 + 72 * Math.exp(-t * 30); ph += f / SR;
        const a = Math.exp(-t * 8) * (1 - Math.exp(-t * 500));
        const v = sn(ph) * a * g; add(i0 + k, v * pl, v * pr, 0.05);
      }
    }
    // V7: the heartbeat accelerates toward the (later) title impact over the slower manual scene
    { const end = filmTime(13.2), ref = filmTime(13.3); let t = T.a.pulse[0]; while (t < end) { kick(t, 0.32); kick(t + 0.16, 0.16); t += 1.15 - 0.72 * Math.pow(Math.min(1, t / ref), 1.3); } }
    const A62 = filmTime(62), A68 = filmTime(68);
    for (let t = filmTime(17.3); t < filmTime(112.3); t += 1.0) kick(t, 0.1 + 0.025 * (t > A62 && t < A68 ? 1 : 0));
    const nz = mulberry32(90210);
    function noiseBurst(t0, dur, g, fc, q, p, send, decay) {
      const bp = biquadBP(); const [pl, pr] = pan(p || 0); const i0 = Math.round(t0 * SR), len = Math.round(dur * SR);
      for (let k = 0; k < len; k++) { const t = k / SR; const a = Math.exp(-t * (decay || 60)) * Math.min(1, t * 2000); const v = bp(nz() * 2 - 1, fc, q) * a * g; add(i0 + k, v * pl, v * pr, send || 0); }
    }
    for (let t = 4.0, n = 0; t < filmTime(13.2); t += 0.5, n++) noiseBurst(t, 0.03, 0.18, n % 2 ? 4200 : 3300, 6, n % 2 ? 0.25 : -0.25, 0.1, 120);
    for (let t = filmTime(24.55); t < filmTime(104.9); t += 0.5) noiseBurst(t, 0.04, 0.06, 6500, 2, ((t * 2) | 0) % 2 ? 0.3 : -0.3, 0.05, 90);

    /* ---- 4. arpeggio plucks (phone onwards), triangle tone */
    const ARP0 = filmTime(24.3);
    for (let t = ARP0; t < filmTime(112.35); t += 0.5) {
      const ch = chordAt(t + 0.01); if (!ch) continue;
      const step = Math.round((t - ARP0) / 0.5), pat = [ch[2] + 12, ch[3] + 12, ch[4] + 12, ch[3] + 12];
      const m = pat[step % 4], f = mtof(m);
      const g = 0.03 * (t >= A62 && t < A68 ? 1.2 : 1) * (t >= filmTime(105) ? 0.8 : 1) * (step % 2 ? 0.8 : 1);
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
        case 'click': noiseBurst(t, 0.008, 0.32, 5200, 1.6, 0.1, 0.02, 900); noiseBurst(t + 0.055, 0.006, 0.18, 4600, 1.6, 0.1, 0.02, 900); break;
        case 'key': noiseBurst(t, 0.018, (ev.soft ? 0.12 : 0.16) * (0.75 + 0.5 * ((idx * 7919) % 13) / 13), 2600 + ((idx * 31) % 9) * 160, 3, ((idx % 3) - 1) * 0.2, 0.03, 260); break;
        case 'pencil': noiseBurst(t, 0.05, 0.05, 5200, 2.5, 0.35, 0.02, 70); break;
        case 'paper': for (let b = 0; b < 5; b++) noiseBurst(t + b * 0.055, 0.12, 0.2 - b * 0.03, 1800 + b * 700, 1.1, -0.2 + b * 0.1, 0.12, 30); break;
        case 'stab': glide(t, 110, 52, 0.55, 0.38, 0, 0.35); noiseBurst(t, 0.25, 0.25, 420, 0.9, 0, 0.3, 14); break;
        case 'drop': glide(t, 240, 110, 0.18, 0.22, 0, 0.2); break;
        case 'pulse': bell(t, 81, 0.05, 1.8, 0.1, 0.7); glide(t, 330, 220, 0.35, 0.09, 0, 0.4); break;
        case 'drone': break;
        case 'riser': {
          const i0 = Math.round(t * SR), len = Math.round(ev.d * SR), bp = biquadBP(); let ph = 0;
          for (let k = 0; k < len; k++) {
            const q = k / len, f = 180 * Math.pow(4, q); ph += f / SR;
            const a = Math.pow(q, 2.2) * (1 - Math.pow(Math.max(0, q - 0.97) / 0.03, 2));
            const trem = 0.75 + 0.25 * Math.sin(TAU * (4 + 14 * q) * k / SR);
            const v = (sn(ph) * 0.18 + bp(nz() * 2 - 1, 500 + 5500 * q * q, 1.2) * 0.55) * a * trem * 0.45;   // V3: riser sits under the narration
            add(i0 + k, v * (0.8 + 0.2 * q), v * (0.8 + 0.2 * q), 0.25);
          }
          break;
        }
        case 'impact': {
          // V3: the impact lands on the title; ≈6 dB lower than the 90-second film so it does not startle
          glide(t, 62, 30, 1.8, 0.4, 0, 0.3); noiseBurst(t, 0.6, 0.3, 380, 0.7, 0, 0.5, 8);
          [62, 69, 74, 78].forEach((m, i) => bell(t + 0.02 + i * 0.01, m, 0.05, 3.2, -0.3 + i * 0.2, 0.7));
          break;
        }
        case 'shimmer': [86, 93, 90, 98].forEach((m, i) => bell(t + i * 0.09, m, 0.035, 2.6, -0.4 + i * 0.27, 0.8)); break;
        case 'swell': whoosh(t - 0.6, 1.0, 0.07, 300, 1800, 900, -0.3, 0.3, 0.6); break;
        case 'pop': glide(t, ev.f || 560, (ev.f || 560) * 1.5, 0.09, 0.16 * soft, 0, 0.2); break;
        case 'sparkle': [93, 98, 102].forEach((m, i) => bell(t + i * 0.06, m, 0.05, 0.9, -0.2 + i * 0.2, 0.6)); break;
        case 'whoosh': whoosh(t - 0.15, 0.75, 0.3, 350, 2600, 700, -0.6, 0.6); break;
        case 'whooshSoft': whoosh(t - 0.1, 0.55, 0.22, 400, 2000, 800, 0.4, -0.4); break;
        case 'slide': whoosh(t, 0.32, 0.16, 600, 2400, 1600, 0, 0.2, 0.15); break;
        case 'confirm': bell(t, 86, 0.11, 1.2, -0.15); bell(t + 0.11, 93, 0.1, 1.4, 0.15); break;
        case 'success': [74, 78, 81, 86].forEach((m, i) => bell(t + i * 0.075, m, 0.1, 1.4, -0.3 + i * 0.2)); break;
        case 'hit': glide(t, 90, 48, 0.6, 0.3 * soft, 0, 0.3); bell(t, 74, 0.07 * soft, 1.6, 0, 0.6); break;
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
        case 'sting': glide(t, 74, 37, 2.4, 0.27, 0, 0.35); [62, 69, 74, 78, 81].forEach((m, i) => bell(t + i * 0.035, m, 0.05, 3.8, -0.4 + i * 0.2, 0.75)); break;
      }
    });
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

    onProgress && onProgress(0.9);
    return { L, R };
  }

  /* ==========================================================================
   * ITU-R BS.1770-4 integrated loudness (K-weighting at 48 kHz, 400 ms blocks,
   * 100 ms hop, absolute gate −70 LUFS, relative gate −10 LU).
   * ========================================================================== */
  function lufs(chs) {
    const hop = SR / 10, nh = Math.floor(chs[0].length / hop), sub = new Float64Array(nh);
    for (const x of chs) {
      let s1x1 = 0, s1x2 = 0, s1y1 = 0, s1y2 = 0, s2x1 = 0, s2x2 = 0, s2y1 = 0, s2y2 = 0;
      for (let h = 0; h < nh; h++) {
        let acc = 0;
        for (let i = h * hop, e = i + hop; i < e; i++) {
          const xi = x[i];
          const y1 = 1.53512485958697 * xi - 2.69169618940638 * s1x1 + 1.19839281085285 * s1x2 + 1.69065929318241 * s1y1 - 0.73248077421585 * s1y2;
          s1x2 = s1x1; s1x1 = xi; s1y2 = s1y1; s1y1 = y1;
          const y2 = y1 - 2 * s2x1 + s2x2 + 1.99004745483398 * s2y1 - 0.99007225036621 * s2y2;
          s2x2 = s2x1; s2x1 = y1; s2y2 = s2y1; s2y1 = y2;
          acc += y2 * y2;
        }
        sub[h] += acc;
      }
    }
    const z = [];
    for (let j = 0; j + 4 <= nh; j++) z.push((sub[j] + sub[j + 1] + sub[j + 2] + sub[j + 3]) / (4 * hop));
    const Lk = v => -0.691 + 10 * Math.log10(v);
    let s = 0, c = 0;
    for (const v of z) if (v > 0 && Lk(v) > -70) { s += v; c++; }
    if (!c) return -Infinity;
    const rel = Lk(s / c) - 10;
    s = 0; c = 0;
    for (const v of z) if (v > 0 && Lk(v) > -70 && Lk(v) > rel) { s += v; c++; }
    return c ? Lk(s / c) : -Infinity;
  }
  const dB = g => 20 * Math.log10(g), fromDb = d => Math.pow(10, d / 20);
  function peakOf(chs) { let p = 0; for (const x of chs) for (let i = 0; i < x.length; i++) { const a = x[i] < 0 ? -x[i] : x[i]; if (a > p) p = a; } return p; }

  /* ---- narration: the supplied WAV (embedded FLAC) or PCM injected by render-video.js */
  const NARR = { override: null, disabled: false };
  let inj = null;
  function setNarration(f32, label, meta) { NARR.override = { data: f32, label: label || 'narasi', meta: meta || {} }; NARR.disabled = false; cache = null; }
  function disableNarration() { NARR.disabled = true; NARR.override = null; cache = null; }
  function narrationBegin(sampleRate, total, label) {
    if (sampleRate !== SR) throw new Error('narration must be ' + SR + ' Hz PCM (got ' + sampleRate + ' Hz)');
    inj = { buf: new Float32Array(total), label: label };
  }
  function narrationChunk(offset, b64) {
    const bin = atob(b64), n = bin.length >> 1, buf = inj.buf;
    // same int16 → float convention as Chromium's decoder for the embedded FLAC (positive / 32767, negative / 32768),
    // so a --voiceover export of the same WAV gives exactly the player's mix
    for (let i = 0; i < n; i++) { let v = bin.charCodeAt(2 * i) | (bin.charCodeAt(2 * i + 1) << 8); if (v >= 32768) v -= 65536; buf[offset + i] = v > 0 ? v / 32767 : v / 32768; }
    return n;
  }
  function narrationEnd(meta) { const n = inj.buf.length; setNarration(inj.buf, inj.label, Object.assign({ injected: true }, meta || {})); inj = null; return n; }
  function fitLength(d, label, meta) {
    const out = new Float32Array(N); out.set(d.subarray(0, Math.min(N, d.length)));
    return { data: out, label: label, meta: Object.assign({ srcSamples: d.length, truncated: d.length > N, padded: d.length < N }, meta || {}) };
  }
  function embeddedNarration() { return typeof document !== 'undefined' ? document.getElementById('narasi-flac') : null; }
  async function loadNarration() {
    if (NARR.disabled) return null;
    if (NARR.override) return fitLength(NARR.override.data, NARR.override.label, NARR.override.meta);
    const el = embeddedNarration();
    if (!el) return null;
    const bin = atob(el.textContent.trim()), u8 = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
    const OAC = window.OfflineAudioContext || window.webkitOfflineAudioContext;
    if (!OAC) throw new Error('this browser cannot decode the embedded narration (no OfflineAudioContext)');
    const ctx = new OAC(1, SR, SR);
    const ab = await ctx.decodeAudioData(u8.buffer);
    let d = ab.getChannelData(0);
    if (ab.numberOfChannels > 1) {
      const m = new Float32Array(ab.length);
      for (let c = 0; c < ab.numberOfChannels; c++) { const x = ab.getChannelData(c); for (let i = 0; i < m.length; i++) m[i] += x[i] / ab.numberOfChannels; }
      d = m;
    }
    return fitLength(d, el.dataset.file || 'narasi', { embedded: true, sha256: el.dataset.sha256 || null, decodedRate: ab.sampleRate });
  }

  /* ---- ducking gain from narration activity (10 ms frames above −50 dBFS RMS) */
  const DUCK = { thresholdDb: -50, lookahead: 0.08, hold: 0.25, attack: 0.04, release: 0.6, impactFence: 0.25 };
  function duckGain(narr) {
    const fr = SR / 100, nf = Math.ceil(N / fr), thr = fromDb(DUCK.thresholdDb);
    const act = new Uint8Array(nf), gate = new Uint8Array(nf);
    for (let k = 0; k < nf; k++) {
      let s = 0; const a = k * fr, b = Math.min(N, a + fr);
      for (let i = a; i < b; i++) s += narr[i] * narr[i];
      act[k] = Math.sqrt(s / Math.max(1, b - a)) > thr ? 1 : 0;
    }
    const LA = Math.round(DUCK.lookahead * 100), HOLD = Math.round(DUCK.hold * 100);
    for (let k = 0; k < nf; k++) if (act[k]) for (let j = Math.max(0, k - LA); j <= Math.min(nf - 1, k + HOLD); j++) gate[j] = 1;
    const g = new Float32Array(N), depth = fromDb(DUCK_DB), depthBuild = fromDb(DUCK_BUILD_DB), depthOpen = fromDb(DUCK_OPEN_DB);
    const iOpen = Math.round((filmTime(6.5) + 1.5) * SR);   // the opening flow chart and its last line (ends before c02)
    const ca = Math.exp(-1 / (DUCK.attack * SR)), cr = Math.exp(-1 / (DUCK.release * SR));
    // V8: the title impact must land on the full score — once the voice is silent, any remaining ducking is
    // ramped out linearly over the 0.25 s before the impact (the normal 0.6 s release would leave it ~5 dB low)
    const iImp = Math.round(filmTime(T.d.impact) * SR), r0 = iImp - Math.round(DUCK.impactFence * SR);
    let v = 1, g0 = 1;
    for (let i = 0; i < N; i++) {
      const on = gate[(i / fr) | 0], target = on ? (i < iOpen ? depthOpen : i < iImp ? depthBuild : depth) : 1;
      v = target + (v - target) * (target < v ? ca : cr);
      if (i === r0) g0 = v;
      if (!on && i >= r0 && i <= iImp) { const want = g0 + (1 - g0) * (i - r0) / (iImp - r0); if (v < want) v = want; }
      g[i] = v;
    }
    let actSec = 0; for (let k = 0; k < nf; k++) actSec += act[k];
    return { g, speechSec: actSec / 100, impactGainDb: +dB(g[iImp]).toFixed(2) };
  }

  /* ---- look-ahead peak limiter: linear gain ramps over 5 ms before each over, 80 ms release */
  function limit(L, R) {
    const W = Math.round(0.005 * SR), g = new Float32Array(N).fill(1);
    let overs = 0;
    for (let i = 0; i < N; i++) {
      const a = Math.max(Math.abs(L[i]), Math.abs(R[i]));
      if (a <= CEILING) continue;
      overs++;
      const r = (CEILING / a) * 0.9995;
      for (let k = 0; k <= W; k++) { const j = i - W + k; if (j < 0) continue; const v = 1 - (1 - r) * (k / W); if (v < g[j]) g[j] = v; }
    }
    const kr = 1 - Math.exp(-1 / (0.08 * SR));
    let o = 1, minG = 1, clamps = 0;
    for (let i = 0; i < N; i++) {
      o = Math.min(g[i], o + (1 - o) * kr);
      if (o < minG) minG = o;
      let l = L[i] * o, r = R[i] * o;
      if (l > CEILING || l < -CEILING || r > CEILING || r < -CEILING) { clamps++; l = Math.max(-CEILING, Math.min(CEILING, l)); r = Math.max(-CEILING, Math.min(CEILING, r)); }
      L[i] = l; R[i] = r;
    }
    return { overs, maxReductionDb: dB(minG), clamps };
  }

  /* ---- the one resolved mix */
  function master(bed, nar, onProgress) {
    const L = bed.L, R = bed.R, info = { version: 'V9', sampleRate: SR, samples: N, bed: {}, narration: null, mix: {} };
    // 1. score + effects to BED_LUFS, soft knee on its own transients (title impact)
    // V4: without narration the score is the programme, so it goes straight to PROGRAM_LUFS before the soft knee
    const bedTarget = nar ? BED_LUFS : PROGRAM_LUFS;
    const bedIn = lufs([L, R]), gb = fromDb(bedTarget - bedIn), knee = 0.56, room = 0.28;
    for (const buf of [L, R]) for (let i = 0; i < N; i++) {
      let x = buf[i] * gb; const ax = Math.abs(x);
      if (ax > knee) x = Math.sign(x) * (knee + room * Math.tanh((ax - knee) / room));
      buf[i] = x;
    }
    info.bed = { lufsIn: +bedIn.toFixed(2), gainDb: +dB(gb).toFixed(2), target: bedTarget };
    // 2. narration (dual mono) to NARR_LUFS; score ducked while it speaks
    if (nar) {
      const lm = lufs([nar.data]), gn = fromDb(NARR_LUFS - (lm + 10 * Math.log10(2)));
      const dk = duckGain(nar.data), d = nar.data, g = dk.g;
      for (let i = 0; i < N; i++) { L[i] *= g[i]; R[i] *= g[i]; }
      // per-cue balance (BS.1770 over each cue): narration (dual mono, after gain) vs the ducked score
      const balance = CUES.map(c => {
        const a = Math.round(c.start * SR), b = Math.min(N, Math.round(c.end * SR)), seg = new Float32Array(b - a);
        for (let i = a; i < b; i++) seg[i - a] = d[i] * gn;
        const ln = lufs([seg, seg]), lb = lufs([L.subarray(a, b), R.subarray(a, b)]);
        return { id: c.id, narration: +ln.toFixed(1), score: +lb.toFixed(1), diff: +(ln - lb).toFixed(1) };
      });
      for (let i = 0; i < N; i++) { const v = d[i] * gn; L[i] += v; R[i] += v; }
      info.narration = { label: nar.label, meta: nar.meta, lufsMono: +lm.toFixed(2), peakDb: +dB(peakOf([d])).toFixed(2), gainDb: +dB(gn).toFixed(2),
        target: NARR_LUFS, duckDb: DUCK_DB, duckBuildDb: DUCK_BUILD_DB, duckOpenDb: DUCK_OPEN_DB, impactGainDb: dk.impactGainDb, speechSec: dk.speechSec, duck: DUCK, balance };
    }
    onProgress && onProgress(0.95);
    // 3. programme loudness, look-ahead limiter, fades
    const pre = lufs([L, R]), trim = Math.max(-3, Math.min(3, PROGRAM_LUFS - pre)), gt = fromDb(trim);
    for (let i = 0; i < N; i++) { L[i] *= gt; R[i] *= gt; }
    const lim = limit(L, R);
    for (let i = 0; i < N; i++) {
      const t = i / SR, fade = Math.min(1, t / 0.05) * Math.min(1, Math.max(0, (DURATION - t) / 0.7));
      if (fade < 1) { L[i] *= fade; R[i] *= fade; }
    }
    info.mix = { lufsPreTrim: +pre.toFixed(2), trimDb: +trim.toFixed(2), lufs: +lufs([L, R]).toFixed(2), peakDb: +dB(peakOf([L, R])).toFixed(2), ceilingDb: +dB(CEILING).toFixed(2), limiter: lim };
    onProgress && onProgress(1);
    return { L, R, sampleRate: SR, length: N, info };
  }

  /* async wrapper so the page stays responsive while the mix is computed */
  let cache = null, pending = null;
  async function render(onProgress) {
    if (cache) return cache;
    if (pending) return pending;
    pending = (async () => {
      await new Promise(r => setTimeout(r, 0));
      const nar = await loadNarration();
      const bed = synth(buildSoundEvents(), p => onProgress && onProgress(p * 0.9));
      cache = master(bed, nar, onProgress);
      pending = null;
      return cache;
    })();
    return pending;
  }
  function toB64(i16) {
    const bytes = new Uint8Array(i16.buffer, i16.byteOffset, i16.byteLength); let bin = '';
    for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    return btoa(bin);
  }
  /* interleaved 16-bit PCM of the final mix, base64-encoded in chunks (used by render-video.js) */
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
      out.push(toB64(buf));
    }
    return out;
  }
  /* the narration samples exactly as decoded/injected (mono, before gain) — for sample-exact checks */
  async function narrationPcm16(chunkFrames) {
    const nar = await loadNarration(); if (!nar) return null;
    chunkFrames = chunkFrames || 960000;
    const out = [];
    for (let s = 0; s < N; s += chunkFrames) {
      const n = Math.min(chunkFrames, N - s), buf = new Int16Array(n);
      for (let i = 0; i < n; i++) { const x = nar.data[s + i]; buf[i] = Math.max(-32768, Math.min(32767, Math.round(x > 0 ? x * 32767 : x * 32768))); }
      out.push(toB64(buf));
    }
    return { label: nar.label, meta: nar.meta, chunks: out };
  }
  return {
    SR, N, CHORDS, render, pcm16Chunks, narrationPcm16, lufs,
    setNarration, disableNarration, narrationBegin, narrationChunk, narrationEnd,
    hasEmbeddedNarration: () => !!embeddedNarration(),
    get info() { return cache ? cache.info : null; },
    settings: { NARR_LUFS, BED_LUFS, PROGRAM_LUFS, DUCK_DB, DUCK_BUILD_DB, DUCK_OPEN_DB, CEILING, DUCK }
  };
})();
