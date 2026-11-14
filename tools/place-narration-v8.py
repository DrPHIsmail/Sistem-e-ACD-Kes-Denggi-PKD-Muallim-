# V8 narration placement (offline tool; inputs are the ElevenLabs takes in narasi-v8/takes).
#   1. decodes every take (MP3 44.1 kHz) to 48 kHz mono float with FFmpeg,
#   2. finds the speech span of each take (10 ms RMS frames) and its internal pauses,
#   3. picks one take per unit: the one whose speaking rate is closest to the median of all
#      takes, unless only the other one fits its window,
#   4. places each unit on the FILM clock at its visual anchor (the V7 caption start),
#      shifting later when the previous line is still speaking (gap >= GAP s) and never past
#      the end of its scene; merged units (c05c06, c16c17, c18c19) are split for the
#      captions at the word boundary nearest to the syllable-proportional estimate,
#   5. voice chain per clip: level to CLIP_LUFS (BS.1770 via FFmpeg ebur128), gentle compression
#      (2.5:1 above -26 dBFS, 5/80 ms) and a voice peak limiter at VOICE_PEAK (look-ahead, delay
#      compensated), so the master limiter no longer has to catch speech peaks; 8 ms edge fades,
#   6. writes narasi-v8/narasi-v8.wav (48 kHz mono 16-bit, exactly DURATION s) and
#      narasi-v8/penempatan-v8.json (takes, placements, caption times for src/data.js).
# Usage: python3 -I tools/place-narration-v8.py <project-root> [--take c03=B ...]
#        --take <unit>=<A|B> forces that take (e.g. after listening); it must still fit its window.
import sys, json, re, subprocess, tempfile, os
import numpy as np

ROOT = sys.argv[1]
FORCE = dict(a.split('=') for a in sys.argv[2:] if '=' in a and not a.startswith('-'))
for i, a in enumerate(sys.argv):
    if a == '--take' and i + 1 < len(sys.argv): FORCE.update([sys.argv[i + 1].split('=')])
SR, DURATION = 48000, 137.0
N = int(round(DURATION * SR))
GAP = 0.35            # minimum silence between two placed lines (s)
PRE, POST = 0.06, 0.20  # audio kept before the detected onset / after the detected offset (s)
CLIP_LUFS = -20.0
VOICE_PEAK = 0.5      # -6 dBFS at -20 LUFS: peak-to-loudness ratio <= 14 dB
ND = os.path.join(ROOT, 'narasi-v8')

# V7 caption starts (film clock) = visual anchors; scene ends = latest end of the speech
ANCHOR = {'c02': 6.64, 'c03': 10.66, 'c04': 19.94, 'c05': 24.22, 'c06': 28.69, 'c07': 36.92, 'c08': 43.73,
          'c09': 52.32, 'c10': 59.34, 'c11': 67.93, 'c12': 75.38, 'c13': 81.92, 'w1': 88.55, 'w2': 92.00,
          'w3': 96.00, 'c14': 103.90, 'c15': 107.42, 'c16': 112.00, 'c17': 114.90, 'c18': 129.90, 'c19': 131.68}
SCENE_END = {'c02': 16.13, 'c03': 16.13, 'c04': 27.6, 'c05c06': 31.0, 'c07': 52.0, 'c08': 52.0, 'c09': 65.0,
             'c10': 65.0, 'c11': 81.0, 'c12': 81.0, 'c13': 87.95, 'w1': 101.95, 'w2': 101.95, 'w3': 101.95,
             'c14': 122.0, 'c15': 122.0, 'c16c17': 122.0, 'c18c19': 136.5,
             # V8 (1:44 rewording): ends before the c16c17 beat so the supervisor's click stays under its caption
             'c14c15': 111.65}

def decode(path):
    raw = subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-i', path, '-ac', '1', '-af',
                          'aresample=48000:resampler=soxr:precision=28', '-f', 'f32le', '-'],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32).astype(np.float64)

def frames_db(x, hop=480):
    n = len(x) // hop
    r = np.sqrt(np.mean(x[:n * hop].reshape(n, hop) ** 2, axis=1) + 1e-20)
    return 20 * np.log10(r)

def speech_span(x):
    db = frames_db(x)
    thr = max(-50.0, db.max() - 42.0)
    on = np.where(db > thr)[0]
    a, b = on[0], on[-1] + 1
    # internal pauses >= 150 ms
    pauses, run = [], None
    for i in range(a, b):
        if db[i] <= thr:
            run = i if run is None else run
        elif run is not None:
            if i - run >= 15: pauses.append((run * 0.01, i * 0.01))
            run = None
    return a * 0.01, b * 0.01, pauses, db, thr

def syllables(text):
    return sum(len(re.findall(r'[aeiou]+', w)) or 1 for w in re.findall(r"[a-z]+", text.lower()))

def lufs(x):
    with tempfile.NamedTemporaryFile(suffix='.f32') as f:
        x.astype(np.float32).tofile(f.name)
        out = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-f', 'f32le', '-ar', str(SR), '-ac', '1', '-i', f.name,
                              '-af', 'ebur128', '-f', 'null', '-'], capture_output=True, text=True).stderr
    vals = re.findall(r'I:\s+(-?[\d.]+) LUFS', out)
    return float(vals[-1])

def ffilter(x, chain):
    """run a mono 48 kHz float clip through an FFmpeg audio filter chain (same length out)"""
    with tempfile.NamedTemporaryFile(suffix='.f32') as f:
        x.astype(np.float32).tofile(f.name)
        raw = subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-f', 'f32le', '-ar', str(SR), '-ac', '1', '-i', f.name,
                              '-af', chain, '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    y = np.frombuffer(raw, dtype=np.float32).astype(np.float64)
    assert abs(len(y) - len(x)) <= 1, (len(x), len(y))
    return np.pad(y, (0, max(0, len(x) - len(y))))[:len(x)]

def voice_chain(clip):
    clip = clip * 10 ** ((CLIP_LUFS - lufs(clip)) / 20)
    clip = ffilter(clip, 'acompressor=threshold=0.0501:ratio=2.5:attack=5:release=80:knee=6:detection=rms:makeup=1')
    clip = clip * 10 ** ((CLIP_LUFS - lufs(clip)) / 20)
    clip = ffilter(clip, 'alimiter=limit=%g:attack=3:release=40:level=0:latency=1:asc=0' % VOICE_PEAK)
    return clip

man = json.load(open(os.path.join(ND, 'takes-elevenlabs.json')))
units = man['units']
for u in units:
    u['syl'] = syllables(u['text'])
    u['an'] = []
    for t in u['takes']:
        x = decode(os.path.join(ND, 'takes', '%s-%s.mp3' % (u['unit'], t['take'])))
        s0, s1, pauses, db, thr = speech_span(x)
        u['an'].append({'take': t['take'], 'x': x, 's0': s0, 's1': s1, 'speech': s1 - s0, 'pauses': pauses,
                        'rate': u['syl'] / (s1 - s0), 'db': db, 'thr': thr, 'peak': float(np.max(np.abs(x)))})
med = float(np.median([a['rate'] for u in units for a in u['an']]))

# --- place (greedy, in film order)
prev_end, rows = 0.0, []
for u in units:
    cues = u['cues']
    anchor = ANCHOR[cues[0]]
    limit = SCENE_END[u['unit']]
    cands = sorted(u['an'], key=lambda a: abs(a['rate'] - med))
    if u['unit'] in FORCE:
        cands = [a for a in u['an'] if a['take'] == FORCE[u['unit']]]
        assert cands, 'no take %s for %s' % (FORCE[u['unit']], u['unit'])
    chosen = None
    for a in cands:
        start = max(anchor, prev_end + GAP)
        if start + a['speech'] <= limit:
            chosen = (a, start); break
    if chosen is None:   # nothing fits after the anchor: take the shorter take and lead the picture (J-cut)
        a = min(u['an'], key=lambda a: a['speech'])
        start = max(prev_end + GAP, limit - a['speech'])
        chosen = (a, start)
    a, start = chosen
    end = start + a['speech']
    prev_end = end
    rows.append({'u': u, 'a': a, 'start': start, 'end': end})

# --- split merged units for the captions
def split_time(r, words_before):
    u, a = r['u'], r['a']
    if u['unit'] == 'c18c19':   # sentence boundary: the longest internal pause
        p = max(a['pauses'], key=lambda q: q[1] - q[0])
        return r['start'] + (p[1] - a['s0']) - 0.03
    if u['unit'] == 'c14c15':   # comma pause nearest to the syllable estimate (before "dua belas")
        est = a['s0'] + syllables(words_before) / u['syl'] * a['speech']
        p = min(a['pauses'], key=lambda q: abs(q[1] - est))
        return r['start'] + (p[1] - a['s0']) - 0.03
    frac = syllables(words_before) / u['syl']
    est = a['s0'] + frac * a['speech']
    # snap to the quietest 10 ms frame within ±0.25 s (word boundary)
    i0, i1 = int((est - 0.25) * 100), int((est + 0.25) * 100)
    k = i0 + int(np.argmin(a['db'][i0:i1]))
    return r['start'] + (k * 0.01 - a['s0'])

SPLIT = {'c05c06': 'Dalam prototaip ini, penyelia membuka operasi pengesanan kes aktif',
         'c16c17': 'Penyelia menjadualkan lawatan ke enam premis itu', 'c18c19': 'Nadi Muallim.',
         'c14c15': 'Daripada analisa automatik sistem, enam premis belum dilawati,'}
spans = []   # (cue id, speech start, speech end) on the film clock
for r in rows:
    cu = r['u']['cues']
    if len(cu) == 1: spans.append((cu[0], r['start'], r['end']))
    else:
        t = split_time(r, SPLIT[r['u']['unit']])
        r['split'] = t
        spans.append((cu[0], r['start'], t)); spans.append((cu[1], t, r['end']))

# caption times: lead 0.10 s, hold 0.40 s after the speech, never overlapping the next caption
# and never running into the next segment (e.g. the title impact right after the manual scene)
BOUNDS = [16.13, 27.3, 52.0, 65.0, 81.0, 87.95, 101.95, 122.0, 129.35, DURATION]   # SCENES ends, film clock
caps = []
for i, (cid, s, e) in enumerate(spans):
    nxt = spans[i + 1][1] - 0.10 if i + 1 < len(spans) else DURATION - 0.2
    bound = min(b for b in BOUNDS if b >= e) - 0.03
    cs = s - 0.10 if not caps or caps[-1][2] <= s - 0.10 else caps[-1][2]
    ce = min(e + 0.40, nxt - 0.04, bound)
    if ce - cs < 1.0: ce = min(cs + 1.0, nxt - 0.04)
    caps.append((cid, round(cs, 2), round(ce, 2)))
# merged halves: the second caption starts exactly at the split, the first ends just before it
for r in rows:
    if 'split' in r:
        a_id, b_id = r['u']['cues']
        ia = [c[0] for c in caps].index(a_id); ib = ia + 1
        caps[ia] = (a_id, caps[ia][1], round(r['split'] - 0.02, 2))
        caps[ib] = (b_id, round(r['split'], 2), caps[ib][2])

# --- render the track
track = np.zeros(N)
fade = int(0.008 * SR)
ramp = np.linspace(0, 1, fade)
for r in rows:
    a = r['a']
    i0 = max(0, int(round((a['s0'] - PRE) * SR))); i1 = min(len(a['x']), int(round((a['s1'] + POST) * SR)))
    raw = a['x'][i0:i1].copy()
    clip = voice_chain(raw)
    clip[:fade] *= ramp; clip[-fade:] *= ramp[::-1]
    r['gain_db'] = round(lufs(clip) - lufs(raw), 2)
    r['plr_db'] = round(20 * np.log10(np.max(np.abs(clip))) - lufs(clip), 1)
    at = int(round((r['start'] - (a['s0'] - i0 / SR)) * SR))
    track[at:at + len(clip)] += clip
peak = float(np.max(np.abs(track)))
if peak > 0.98: track *= 0.98 / peak
pcm = np.clip(np.round(track * 32767), -32768, 32767).astype('<i2')
import wave
with wave.open(os.path.join(ND, 'narasi-v8.wav'), 'wb') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())

out = {'voice': man['voice'], 'model': man['model'], 'median_rate_syl_per_s': round(med, 2), 'gap_s': GAP, 'clip_lufs': CLIP_LUFS,
       'units': [{'unit': r['u']['unit'], 'cues': r['u']['cues'], 'text': r['u']['text'], 'take': r['a']['take'],
                  'generation_id': next(t['generation_id'] for t in r['u']['takes'] if t['take'] == r['a']['take']),
                  'anchor': ANCHOR[r['u']['cues'][0]], 'start': round(r['start'], 3), 'end': round(r['end'], 3),
                  'shift': round(r['start'] - ANCHOR[r['u']['cues'][0]], 3), 'scene_end': SCENE_END[r['u']['unit']],
                  'speech_s': round(r['a']['speech'], 3), 'rate': round(r['a']['rate'], 2), 'gain_db': r['gain_db'], 'plr_db': r['plr_db'],
                  'split': round(r['split'], 3) if 'split' in r else None,
                  'other_take': [{'take': b['take'], 'speech_s': round(b['speech'], 3), 'rate': round(b['rate'], 2)} for b in r['u']['an'] if b is not r['a']]}
                 for r in rows],
       'captions': [{'id': c, 'start': s, 'end': e} for c, s, e in caps]}
json.dump(out, open(os.path.join(ND, 'penempatan-v8.json'), 'w'), ensure_ascii=False, indent=1)

print('median rate %.2f syl/s' % med)
print('unit     take  anchor   start    end   shift  room  speech rate  gain  PLR')
for r in rows:
    u = r['u']['unit']
    print('%-8s  %s   %6.2f  %6.2f  %6.2f  %+5.2f  %5.2f  %5.2f  %4.1f  %+5.1f  %4.1f%s' % (u, r['a']['take'], ANCHOR[r['u']['cues'][0]], r['start'], r['end'],
          r['start'] - ANCHOR[r['u']['cues'][0]], SCENE_END[u] - r['end'], r['a']['speech'], r['a']['rate'], r['gain_db'], r['plr_db'],
          ('  split %.2f' % r['split']) if 'split' in r else ''))
print('captions:', ' '.join('%s %.2f-%.2f' % c for c in caps))
print('speech total %.1f s; track peak %.3f' % (sum(r['a']['speech'] for r in rows), peak))
