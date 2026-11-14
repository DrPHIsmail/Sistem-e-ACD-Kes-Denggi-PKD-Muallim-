/* ==========================================================================
 * player.js — preview player. Playback is quantised to frames: the frame
 * shown while playing is exactly renderFrame(floor(t * 60)), the same call a
 * seek or the MP4 exporter makes. Audio is the precomputed mix from
 * audio.js, started at offset t, so seek/restart always re-sync sound cues.
 * ========================================================================== */
(function () {
  const params = new URLSearchParams(location.search);
  const RENDER = params.get('render') === '1';
  const stage = document.getElementById('stage');
  const viewport = document.getElementById('viewport');
  if (RENDER) document.body.classList.add('render');

  initStage(stage);
  window.renderFrame = renderFrame;

  async function waitAssets() {
    await Promise.all(['400', '500', '600', '700', '800'].map(w => document.fonts.load(w + ' 24px Inter')));
    await document.fonts.ready;
    await Promise.all(Array.from(stage.querySelectorAll('img')).map(im => (im.decode ? im.decode().catch(() => {}) : null)));
  }
  const ready = (async () => {
    await waitAssets();
    initMeasure();
    renderFrame(0);
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
    return true;
  })();
  window.ACD = { ready, FPS, DURATION, TOTAL_FRAMES, TOTALS, CUES, NARRATION, renderFrame, audio: AUDIO, soundEvents: () => buildSoundEvents() };

  function fit() {
    const w = viewport.clientWidth, h = viewport.clientHeight, s = Math.min(w / 1920, h / 1080);
    stage.style.transform = 'translate(' + ((w - 1920 * s) / 2) + 'px,' + ((h - 1080 * s) / 2) + 'px) scale(' + s + ')';
  }
  fit(); window.addEventListener('resize', fit);
  if (RENDER) return; // export mode: no UI, no audio playback, the exporter drives renderFrame()

  /* ------------------------------------------------------------ state */
  const P = { playing: false, t: 0, startT: 0, startPerf: 0, ctx: null, gain: null, src: null, buffer: null, mix: null,
    audioT0: 0, ctxT0: 0, audioClock: false, muted: params.get('mute') === '1', lastFrame: -1 };
  window.ACD_SUBS = params.get('subs') !== '0';
  // read-only state for tools/check-player.js
  window.ACD.player = { get state() { return { playing: P.playing, t: P.playing ? now() : P.t, frame: P.lastFrame, muted: P.muted, gain: P.gain ? P.gain.gain.value : null, ctx: P.ctx ? P.ctx.state : null, audioClock: P.audioClock, buffer: !!P.buffer, clean: document.body.classList.contains('clean'), subs: window.ACD_SUBS }; } };
  const fmt = t => { const m = Math.floor(t / 60), s = t - m * 60; return String(m).padStart(2, '0') + ':' + s.toFixed(2).padStart(5, '0'); };

  /* ------------------------------------------------------------ UI */
  const startOv = document.getElementById('startOverlay');
  const ctl = document.getElementById('controls');
  ctl.innerHTML =
    '<div class="ctl-row">' +
      '<button class="ctl-btn primary" id="bPlay" aria-label="Main">▶ Main</button>' +
      '<button class="ctl-btn" id="bRestart" aria-label="Mula semula">⟲ Mula Semula</button>' +
      '<span class="ctl-time" id="tTime">00:00.00 / 01:30.00</span>' +
      '<div class="ctl-scrub-wrap"><input id="scrub" type="range" min="0" max="' + (TOTAL_FRAMES - 1) + '" step="1" value="0" aria-label="Garis masa"><div class="scene-marks" id="marks"></div></div>' +
      '<button class="ctl-btn" id="bMute" aria-label="Bunyi">🔊 Bunyi: Hidup</button>' +
      '<button class="ctl-btn" id="bSubs" aria-label="Sari kata">Sari Kata: Hidup</button>' +
      '<button class="ctl-btn" id="bSpeech" aria-label="Suara Bahasa Melayu pelayar" disabled>Suara BM (ms-MY)</button>' +
      '<button class="ctl-btn" id="bFull" aria-label="Skrin penuh">⛶ Skrin Penuh</button>' +
      '<button class="ctl-btn" id="bClean" aria-label="Mod rakaman bersih">● Mod Rakaman Bersih</button>' +
    '</div>' +
    '<div class="scene-btns" id="scenes">' + SCENES.map(s => '<button class="scene-btn" data-s="' + s.id + '">' + s.id + ' · ' + s.key + '</button>').join('') +
      '<span class="ctl-hint">Ruang: main/jeda · R: mula semula · ←/→: ±1 s · , / .: satu bingkai · 1–6: babak · F: skrin penuh · M: bunyi · S: sari kata · C: mod bersih (Esc keluar)</span></div>';
  const $b = id => document.getElementById(id);
  $b('marks').innerHTML = SCENES.slice(1).map(s => '<i style="left:' + (s.start / DURATION * 100) + '%"></i>').join('');
  const startStatus = document.getElementById('startStatus');
  const SP = { enabled: false, voice: null, last: -1 };
  let scrubbing = false, scrubWas = false;

  function updateUI(t) {
    $b('tTime').textContent = fmt(t) + ' / ' + fmt(DURATION) + '  ·  f' + Math.floor(t * FPS + 1e-6);
    if (!scrubbing) $b('scrub').value = String(Math.floor(t * FPS + 1e-6));
    $b('bPlay').textContent = P.playing ? '❚❚ Jeda' : '▶ Main';
    $b('bPlay').setAttribute('aria-label', P.playing ? 'Jeda' : 'Main');
    const sc = SCENES.find(s => t >= s.start && t < s.end) || SCENES[5];
    document.querySelectorAll('.scene-btn').forEach(b => b.classList.toggle('on', +b.dataset.s === sc.id));
    $b('bMute').textContent = P.muted ? '🔇 Bunyi: Mati' : '🔊 Bunyi: Hidup';
    $b('bSubs').textContent = 'Sari Kata: ' + (window.ACD_SUBS ? 'Hidup' : 'Mati');
    $b('bSpeech').classList.toggle('on', SP.enabled);
    $b('bClean').classList.toggle('on', document.body.classList.contains('clean'));
  }
  function renderAt(t, force) {
    const f = Math.min(TOTAL_FRAMES - 1, Math.floor(t * FPS + 1e-6));
    if (f !== P.lastFrame || force) { renderFrame(f); P.lastFrame = f; }
    updateUI(f / FPS);
  }

  /* ------------------------------------------------------------ audio */
  async function unlockAudio() {
    if (P.ctx) { if (P.ctx.state === 'suspended') await P.ctx.resume().catch(() => {}); return; }
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    try { P.ctx = new AC({ sampleRate: 48000 }); } catch (e) { P.ctx = new AC(); }
    P.gain = P.ctx.createGain(); P.gain.gain.value = P.muted ? 0 : 1; P.gain.connect(P.ctx.destination);
    if (P.ctx.state === 'suspended') await P.ctx.resume().catch(() => {});
    attachBuffer();
  }
  function attachBuffer() {
    if (!P.ctx || !P.mix || P.buffer) return;
    const b = P.ctx.createBuffer(2, P.mix.length, P.mix.sampleRate);
    b.copyToChannel(P.mix.L, 0); b.copyToChannel(P.mix.R, 1);
    P.buffer = b;
    if (P.playing) { P.t = now(); P.startT = P.t; P.startPerf = performance.now(); startAudio(P.t); }
  }
  function startAudio(t) {
    stopAudio();
    if (!P.ctx || !P.buffer) { P.audioClock = false; return; }
    const src = P.ctx.createBufferSource(); src.buffer = P.buffer; src.connect(P.gain);
    const when = P.ctx.currentTime + 0.03;
    src.start(when, Math.max(0, t));
    P.src = src; P.ctxT0 = when; P.audioT0 = t; P.audioClock = true;
  }
  function stopAudio() { if (P.src) { try { P.src.stop(); } catch (e) {} P.src.disconnect(); P.src = null; } P.audioClock = false; }
  function now() {
    if (!P.playing) return P.t;
    if (P.audioClock && P.ctx) return P.audioT0 + Math.max(0, P.ctx.currentTime - P.ctxT0);
    return P.startT + (performance.now() - P.startPerf) / 1000;
  }
  // compute the mix in the background so the first click is instant
  AUDIO.render(p => { if (startStatus) startStatus.textContent = 'Menyediakan audio… ' + Math.round(p * 100) + '%'; })
    .then(mix => { P.mix = mix; if (startStatus) startStatus.textContent = 'Sedia · luar talian'; attachBuffer(); });

  /* ------------------------------------------------------------ Web Speech (optional ms-MY preview) */
  function pickVoice() {
    if (!('speechSynthesis' in window)) return;
    const vs = speechSynthesis.getVoices();
    SP.voice = vs.find(v => /^ms([-_]|$)/i.test(v.lang)) || null;
    const b = $b('bSpeech');
    b.disabled = !SP.voice;
    b.title = SP.voice ? 'Pratonton naratif dengan suara pelayar: ' + SP.voice.name : 'Tiada suara Bahasa Melayu (ms-MY) dalam pelayar ini';
  }
  if ('speechSynthesis' in window) { pickVoice(); speechSynthesis.onvoiceschanged = pickVoice; }
  else $b('bSpeech').title = 'Pelayar ini tidak menyokong Web Speech';
  function speechCancel() { if ('speechSynthesis' in window) speechSynthesis.cancel(); }
  function speechFrom(t) { SP.last = -1; NARRATION.forEach((n, i) => { if (n.start < t - 0.05) SP.last = i; }); }
  function speechTick(t) {
    if (!SP.enabled || !SP.voice || !P.playing) return;
    for (let i = SP.last + 1; i < NARRATION.length; i++) {
      const n = NARRATION[i];
      if (t >= n.start && t < n.end) {
        SP.last = i;
        const u = new SpeechSynthesisUtterance(n.say); u.voice = SP.voice; u.lang = SP.voice.lang; u.rate = 1.05;
        speechSynthesis.speak(u);
      } else break;
    }
  }

  /* ------------------------------------------------------------ transport */
  let raf = 0;
  function loop() {
    raf = 0;
    if (!P.playing) return;
    const t = now();
    if (t >= DURATION - 1 / FPS) { P.playing = false; P.t = DURATION - 1 / FPS; stopAudio(); renderAt(P.t, true); showControls(); return; }
    renderAt(t);
    speechTick(t);
    raf = requestAnimationFrame(loop);
  }
  function play() {
    if (P.playing) return;
    if (P.t >= DURATION - 1 / FPS - 1e-6) P.t = 0;
    P.playing = true; P.startT = P.t; P.startPerf = performance.now();
    startAudio(P.t); speechFrom(P.t);
    if (!raf) raf = requestAnimationFrame(loop);
    scheduleHide();
  }
  function pause() {
    if (!P.playing) return;
    P.t = Math.floor(now() * FPS) / FPS; P.playing = false;
    stopAudio(); speechCancel(); renderAt(P.t, true); showControls();
  }
  function seek(t) {
    const was = P.playing;
    if (was) { stopAudio(); speechCancel(); }
    P.t = clamp(Math.floor(t * FPS + 1e-6) / FPS, 0, DURATION - 1 / FPS);
    if (was) { P.startT = P.t; P.startPerf = performance.now(); startAudio(P.t); speechFrom(P.t); }
    renderAt(P.t, true);
  }
  function restart() { seek(0); if (!P.playing) play(); }
  async function gesture() { startOv.style.display = 'none'; await unlockAudio(); }

  /* ------------------------------------------------------------ controls wiring */
  $b('bPlay').addEventListener('click', async () => { await gesture(); P.playing ? pause() : play(); });
  $b('bRestart').addEventListener('click', async () => { await gesture(); restart(); });
  $b('bMute').addEventListener('click', async () => { await gesture(); P.muted = !P.muted; if (P.gain) P.gain.gain.value = P.muted ? 0 : 1; updateUI(P.playing ? now() : P.t); });
  $b('bSubs').addEventListener('click', () => { window.ACD_SUBS = !window.ACD_SUBS; renderAt(P.playing ? now() : P.t, true); });
  $b('bSpeech').addEventListener('click', async () => { await gesture(); SP.enabled = !SP.enabled; speechCancel(); speechFrom(P.playing ? now() : P.t); updateUI(P.playing ? now() : P.t); });
  $b('bFull').addEventListener('click', toggleFull);
  $b('bClean').addEventListener('click', () => setClean(true));
  document.querySelectorAll('.scene-btn').forEach(b => b.addEventListener('click', async () => { await gesture(); seek(SCENES[+b.dataset.s - 1].start); }));
  const scrub = $b('scrub');
  scrub.addEventListener('pointerdown', () => { scrubbing = true; scrubWas = P.playing; if (P.playing) pause(); });
  scrub.addEventListener('input', () => { seek(+scrub.value / FPS); });
  const endScrub = async () => { if (!scrubbing) return; scrubbing = false; if (scrubWas) { await gesture(); play(); } };
  scrub.addEventListener('pointerup', endScrub); scrub.addEventListener('change', endScrub);
  function toggleFull() {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen && document.documentElement.requestFullscreen().catch(() => {});
    else document.exitFullscreen && document.exitFullscreen();
  }
  function setClean(on) { document.body.classList.toggle('clean', on); if (on) startOv.style.display = 'none'; updateUI(P.playing ? now() : P.t); }
  window.addEventListener('keydown', async e => {
    if (e.target && e.target.tagName === 'INPUT' && e.key !== ' ' && e.key !== 'Escape') { /* let the slider handle arrows */ }
    const k = e.key;
    if (k === ' ' || k === 'k') { e.preventDefault(); await gesture(); P.playing ? pause() : play(); }
    else if (k === 'r' || k === 'R') { await gesture(); restart(); }
    else if (k === 'ArrowRight') { e.preventDefault(); seek((P.playing ? now() : P.t) + (e.shiftKey ? 5 : 1)); }
    else if (k === 'ArrowLeft') { e.preventDefault(); seek((P.playing ? now() : P.t) - (e.shiftKey ? 5 : 1)); }
    else if (k === '.') { pause(); seek(P.t + 1 / FPS); }
    else if (k === ',') { pause(); seek(P.t - 1 / FPS); }
    else if (k >= '1' && k <= '6') { await gesture(); seek(SCENES[+k - 1].start); }
    else if (k === 'f' || k === 'F') toggleFull();
    else if (k === 'm' || k === 'M') $b('bMute').click();
    else if (k === 's' || k === 'S') $b('bSubs').click();
    else if (k === 'c' || k === 'C') setClean(!document.body.classList.contains('clean'));
    else if (k === 'Escape') setClean(false);
    showControls();
  });
  // auto-hide while playing
  let hideTimer = 0;
  function showControls() { ctl.classList.remove('hidden'); document.body.style.cursor = ''; scheduleHide(); }
  function scheduleHide() { clearTimeout(hideTimer); hideTimer = setTimeout(() => { if (P.playing && !scrubbing) { ctl.classList.add('hidden'); document.body.style.cursor = 'none'; } }, 2500); }
  window.addEventListener('mousemove', showControls);
  window.addEventListener('pointerdown', e => { if (!ctl.contains(e.target) && e.target !== startOv && !startOv.contains(e.target)) showControls(); });

  // first user gesture unlocks audio
  const startClick = async () => { await gesture(); play(); };
  startOv.addEventListener('click', startClick);
  startOv.addEventListener('keydown', e => { if (e.key === 'Enter') startClick(); });

  if (params.get('clean') === '1') setClean(true);
  ready.then(() => {
    const t0 = parseFloat(params.get('t'));
    renderAt(isFinite(t0) ? clamp(t0, 0, DURATION - 1 / FPS) : 0, true);
    if (isFinite(t0)) P.t = clamp(Math.floor(t0 * FPS) / FPS, 0, DURATION - 1 / FPS);
  });
})();
