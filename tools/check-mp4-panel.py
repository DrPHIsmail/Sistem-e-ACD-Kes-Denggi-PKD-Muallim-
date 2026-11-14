#!/usr/bin/env python3
"""V9: frame-by-frame stability test of the right panel "Ringkasan e-ACD" (Kg. Ketoyong segment) in a
rendered MP4 (or a lossless recording of the player), at the film's own frame rate. It decodes only the panel
region (captions excluded) and reports
  - blinks          one-frame (A-B-A) and two-frame (A-B-B-A) returns of a 16 x 16 px tile to its earlier
                    state while the panel is otherwise still,
  - steps           a change of >= 4 tiles completed inside a single frame (a highlight switched on or off, a
                    block jumping to a new place; a button's click feedback also counts),
  - motion          frames where >= 20 % of the panel changes (a deliberate move such as the opening scroll);
                    A-B-A patterns inside motion are listed apart, because moving lines of text can return a tile
                    to an earlier look without any blink,
  - reversals       for horizontal bands of the panel, the vertical shift between frames (profile matching) and
                    every change of direction during motion: the jitter a viewer sees as a jerk.
A tile changes when its mean absolute difference is >= 6 grey levels (H.264 noise on a still panel stays far
below that). Frames are streamed from ffmpeg; only the last four are kept. Usage:
  python3 -I tools/check-mp4-panel.py <video> <t0> <t1> [--box x,y,w,h] [--bands y0:y1,...] [--json out.json]
Exit code 1 when a blink outside motion or a reversal is found. Needs ffmpeg and numpy."""
import json
import subprocess
import sys

import numpy as np

args = sys.argv[1:]
if len(args) < 3:
    sys.exit(__doc__)
src, t0, t1 = args[0], float(args[1]), float(args[2])
box = [1044, 72, 632, 788]
bands = None
out_json = None
if '--box' in args:
    box = [int(v) for v in args[args.index('--box') + 1].split(',')]
if '--bands' in args:
    bands = [tuple(int(v) for v in b.split(':')) for b in args[args.index('--bands') + 1].split(',')]
if '--json' in args:
    out_json = args[args.index('--json') + 1]
X, Y, W, H = box
if bands is None:                                   # default: three bands of the panel box (film coordinates)
    bands = [(Y + 108, Y + 300), (Y + 348, Y + 540), (Y + 580, Y + H - 8)] if H >= 600 else [(Y + 4, Y + H - 4)]
bands = [(max(Y, a), min(Y + H, b)) for a, b in bands if min(Y + H, b) - max(Y, a) >= 48]   # inside the box, ≥ 48 px tall
FPS = 60
TILE, ON, BLINK_RATIO, MOVE = 16, 6.0, 0.35, 0.20
th, tw = H // TILE, W // TILE


def tiles(a, b):
    """mean |a - b| per 16 x 16 tile"""
    return np.abs(a - b).reshape(th, TILE, tw, TILE).mean(axis=(1, 3))


def vshift(a, b, maxs=32, near=None):
    """vertical shift (px, + = down) of b against a, from row profiles, with a parabolic sub-pixel fit.
    near: the band's shift in the previous frame; motion changes smoothly, so the search stays within ±6 px of it
    (lines of text repeat every ~20 px, which makes a free search ambiguous during a fast scroll)"""
    pa, pb = a.mean(axis=1), b.mean(axis=1)
    errs = {}
    lo, hi = (-maxs, maxs) if near is None else (int(np.floor(near)) - 6, int(np.ceil(near)) + 6)
    for s in range(max(-maxs, lo) - 1, min(maxs, hi) + 2):
        errs[s] = np.mean((pa[:len(pa) - s] - pb[s:]) ** 2) if s >= 0 else np.mean((pa[-s:] - pb[:len(pb) + s]) ** 2)
    best = min(errs, key=errs.get)
    e_still = np.mean((pa - pb) ** 2)
    if e_still > 0 and errs[best] > 0.25 * e_still:
        return None                                  # no single shift explains the change (mixed motion or a fade)
    if best - 1 in errs and best + 1 in errs:
        e0, e1, e2 = errs[best - 1], errs[best], errs[best + 1]
        d = e0 - 2 * e1 + e2
        return best + (0.5 * (e0 - e2) / d if d > 1e-9 else 0.0)
    return None                                      # best shift on the edge of the search: not trusted


t_of = lambda i: round(t0 + i / FPS, 3)
cmd = ['ffmpeg', '-v', 'error', '-ss', '%.3f' % t0, '-t', '%.3f' % (t1 - t0), '-i', src,
       '-vf', 'crop=%d:%d:%d:%d,format=gray' % (W, H, X, Y), '-f', 'rawvideo', '-']
proc = subprocess.Popen(cmd, stdout=subprocess.PIPE)
size = W * H
Fr, D1, energy = {}, {}, {}
aba, abba, steps, motion = [], [], [], []
band_prev = [None] * len(bands)
reversals, straddles, band_paths = [], [], [[] for _ in bands]
i = -1
while True:
    b = proc.stdout.read(size)
    if len(b) < size:
        break
    i += 1
    full = np.frombuffer(b, dtype=np.uint8).reshape(H, W).astype(np.int16)
    Fr[i] = full[:th * TILE, :tw * TILE]
    Fr.pop(i - 4, None)
    if i < 1:
        prev_full = full
        continue
    D1[i] = tiles(Fr[i], Fr[i - 1])
    D1.pop(i - 4, None)
    energy[i] = float((D1[i] >= ON).mean())
    if energy[i] >= MOVE:
        motion.append(t_of(i))
    for k, (y0, y1) in enumerate(bands):        # band tracking (only while something in the band changes)
        a, c = prev_full[y0 - Y:y1 - Y].astype(np.float64), full[y0 - Y:y1 - Y].astype(np.float64)
        if np.abs(a - c).mean() < 0.5:
            continue
        last = band_paths[k][-1] if band_paths[k] else None
        v = vshift(a, c, near=last[1] if last and t_of(i) - last[0] <= 0.05 else None)
        if v is None:
            continue
        band_paths[k].append((t_of(i), round(v, 2)))
        if abs(v) >= 0.5:
            pv = band_prev[k]
            if pv is not None and np.sign(v) != np.sign(pv[1]) and t_of(i) - pv[0] <= 0.1:
                r = {'t': t_of(i), 'band': [y0, y1], 'from': pv[1], 'to': round(float(v), 2)}
                # jitter is small (a block stepping back a pixel or two); a flip of many px per frame means the band
                # holds two blocks moving apart (e.g. the summary scrolling up while the block under it moves down)
                (reversals if max(abs(pv[1]), abs(v)) <= 4 else straddles).append(r)
            band_prev[k] = (t_of(i), round(float(v), 2))
    prev_full = full
    moving = lambda j: energy.get(j, 0) >= MOVE or energy.get(j - 1, 0) >= MOVE or energy.get(j + 1, 0) >= MOVE
    if i >= 2:                                    # A-B-A around frame k = i - 1
        k = i - 1
        m = np.minimum(D1[k], D1[i])
        hit = (m >= ON) & (tiles(Fr[i], Fr[i - 2]) <= BLINK_RATIO * m)
        if hit.sum() >= 1:
            ys, xs = np.nonzero(hit)
            aba.append({'t': t_of(k), 'tiles': int(hit.sum()), 'in_motion': bool(moving(k)), 'at': [int(X + xs.mean() * TILE + 8), int(Y + ys.mean() * TILE + 8)]})
    if i >= 3:                                    # A-B-B-A around frames i - 2, i - 1; one-frame step at i - 1
        k = i - 2
        m = np.minimum(D1[k], D1[i])
        hit = (m >= ON) & (tiles(Fr[i], Fr[i - 3]) <= BLINK_RATIO * m) & (D1[i - 1] < ON)
        if hit.sum() >= 1:
            ys, xs = np.nonzero(hit)
            abba.append({'t': t_of(k), 'tiles': int(hit.sum()), 'in_motion': bool(moving(k) or moving(k + 1)), 'at': [int(X + xs.mean() * TILE + 8), int(Y + ys.mean() * TILE + 8)]})
        j = i - 1
        sel = (D1[j] >= 10) & (D1[j - 1] < 3) & (D1[i] < 3)
        s = int(sel.sum())
        if s >= 4:
            ys, xs = np.nonzero(sel)
            steps.append({'t': t_of(j), 'tiles': s, 'x': [int(X + xs.min() * TILE), int(X + (xs.max() + 1) * TILE)], 'y': [int(Y + ys.min() * TILE), int(Y + (ys.max() + 1) * TILE)]})
proc.wait()
n = i + 1
still_hits = sorted((x for x in aba + abba if not x['in_motion']), key=lambda x: x['t'])
for x in still_hits:                                  # a trail of hits 8–64 px apart within 2 frames = a moving object
    x['object'] = any(y is not x and abs(y['t'] - x['t']) <= 2.5 / FPS and 8 <= max(abs(y['at'][0] - x['at'][0]), abs(y['at'][1] - x['at'][1])) <= 64 for y in still_hits)
blinks = [x for x in still_hits if not x['object']]
objects = [x for x in still_hits if x['object']]
still = sum(1 for e in energy.values() if e == 0)
res = {'file': src, 'window': [t0, t1], 'box': box, 'bands': bands, 'frames': n,
       'blinks': blinks, 'moving_object_hits': objects, 'aba_in_motion': [x['t'] for x in aba + abba if x['in_motion']],
       'steps_1frame': steps, 'motion_frames': motion, 'reversals': reversals, 'band_straddles': straddles, 'still_frames': still}
if out_json:
    with open(out_json, 'w') as fh:
        json.dump(res, fh, indent=1)
span = lambda ts: '%d frames %.3f–%.3f s' % (len(ts), ts[0], ts[-1]) if ts else 'none'
print('%s  %.2f–%.2f s  %d frames, box %s' % (src, t0, t1, n, box))
print('  blinks (A-B-A / A-B-B-A) while still:   %d %s' % (len(blinks), ['%.3f s @%d,%d (%d)' % (x['t'], x['at'][0], x['at'][1], x['tiles']) for x in blinks][:12]))
print('  small moving object (e.g. the cursor):  %s' % (span([x['t'] for x in objects]) + (' from %d,%d to %d,%d' % (objects[0]['at'][0], objects[0]['at'][1], objects[-1]['at'][0], objects[-1]['at'][1]) if objects else '')))
print('  motion (>= 20 %% of the panel per frame): %s' % span(motion))
print('  A-B-A patterns inside that motion:       %d (moving text; judged by the band reversals below)' % len(res['aba_in_motion']))
print('  jitter (a block stepping back ≤ 4 px) in bands %s: %d %s' % (bands, len(reversals), [(r['t'], r['from'], r['to']) for r in reversals][:8]))
print('  large flips (band holding two blocks moving apart, not judged): %d' % len(straddles))
print('  one-frame steps:                         %d' % len(steps))
for s in steps:
    print('    %.3f s  %d tiles  x %d–%d  y %d–%d' % (s['t'], s['tiles'], s['x'][0], s['x'][1], s['y'][0], s['y'][1]))
print('  frames with no tile change: %d of %d' % (still, n - 1))
sys.exit(1 if blinks or reversals else 0)
