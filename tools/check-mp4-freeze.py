# V10: frozen stretches in an MP4 — runs of frames whose picture barely changes (mean |Δ| < 0.02 grey levels at
# 480 × 270, i.e. no camera or scene movement), at least 0.5 s long. Exit status 1 if any run is found.
#
#   python3 -I tools/check-mp4-freeze.py NADI-Muallim-Pitch-141s-v10.mp4 [--min 0.5] [--thr 0.02] [--json]
#
# Small local animations (a pulsing marker, a blinking caret) stay below the threshold: they do not count as movement.
import json, subprocess, sys
import numpy as np

def main():
    f = sys.argv[1]
    mn = float(sys.argv[sys.argv.index('--min') + 1]) if '--min' in sys.argv else 0.5
    thr = float(sys.argv[sys.argv.index('--thr') + 1]) if '--thr' in sys.argv else 0.02
    fps = float(subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=r_frame_rate', '-of', 'csv=p=0', f],
                               capture_output=True, text=True, check=True).stdout.strip().split('/')[0])
    W, H = 480, 270
    p = subprocess.Popen(['ffmpeg', '-v', 'error', '-i', f, '-vf', f'scale={W}:{H}:flags=area,format=gray', '-f', 'rawvideo', '-'], stdout=subprocess.PIPE)
    prev, d = None, []
    while True:
        b = p.stdout.read(W * H)
        if len(b) < W * H: break
        a = np.frombuffer(b, np.uint8).astype(np.int16)
        if prev is not None: d.append(float(np.abs(a - prev).mean()))
        prev = a
    p.wait()
    runs, run = [], 0
    for i, v in enumerate(d + [1e9]):
        if v < thr: run += 1
        else:
            if run >= round(mn * fps): runs.append({ 'start': round((i + 1 - run) / fps, 3), 'dur': round(run / fps, 3) })
            run = 0
    out = { 'frames': len(d) + 1, 'fps': fps, 'threshold': thr, 'min_s': mn, 'runs': runs, 'total_s': round(sum(r['dur'] for r in runs), 2) }
    if '--json' in sys.argv: print(json.dumps(out))
    else:
        print('%d frames · frozen runs ≥ %.2f s: %d (total %.2f s)' % (out['frames'], mn, len(runs), out['total_s']))
        for r in runs: print('  %8.3f s  for %.2f s' % (r['start'], r['dur']))
    sys.exit(1 if runs else 0)

if __name__ == '__main__':
    main()
