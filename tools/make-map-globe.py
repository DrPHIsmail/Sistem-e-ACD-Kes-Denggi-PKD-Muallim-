# V6 opening globe texture (offline asset builder; inputs are the user's screenshots, read-only).
#   base:  Google Maps satellite view, labels off (Tanjung Malim / Kg. Ketoyong), 2000x1132
#   north: PKD Muallim GIS screenshot (same Google imagery, 1.91x zoom), used ONLY for the strip
#          north of the base image so the 200 m circle is complete; its case pins, house labels,
#          case-to-case lines, outbreak circle, place labels and app chrome are removed first.
# The base image loses only the Google Maps interface (its imagery is unchanged).
# Output: a 2048x1024 JPEG (content at 0.75 scale, top-left) + the constants the engine needs.
# Usage: python3 -I tools/make-map-globe.py <base.webp> <gis.webp> <out.jpg> <debug-dir>
import sys, json
import numpy as np
from PIL import Image, ImageFilter, ImageEnhance

base_p, gis_p, out_p, dbg = sys.argv[1:5]

def shift_or(m, r):
    o = m.copy()
    for dy in range(-r, r + 1):
        for dx in range(-r, r + 1):
            if dx or dy: o |= np.roll(np.roll(m, dy, 0), dx, 1)
    return o
def shift_and(m, r):
    o = m.copy()
    for dy in range(-r, r + 1):
        for dx in range(-r, r + 1):
            if dx or dy: o &= np.roll(np.roll(m, dy, 0), dx, 1)
    return o
def down(x):
    h, w = x.shape[:2]
    if h % 2: x = np.concatenate([x, x[-1:]], 0)
    if w % 2: x = np.concatenate([x, x[:, -1:]], 1)
    return 0.25 * (x[0::2, 0::2] + x[1::2, 0::2] + x[0::2, 1::2] + x[1::2, 1::2])
def up(x, shape):
    h, w = shape[:2]
    return np.stack([np.asarray(Image.fromarray(x[..., c].astype(np.float32), 'F').resize((w, h), Image.BILINEAR)) for c in range(x.shape[2])], -1).astype(np.float64)
def inpaint(img_pil, mask):
    """push-pull fill of mask, plus the fine detail of nearby unmasked imagery so fills keep texture"""
    a = np.asarray(img_pil).astype(np.float64)
    H, W = mask.shape
    known = (~mask).astype(np.float64)[..., None]
    pyr = [(a * known, known)]
    while min(pyr[-1][0].shape[:2]) > 2:
        I, Wt = pyr[-1]; pyr.append((down(I), down(Wt)))
    I, Wt = pyr[-1]
    est = I / np.maximum(Wt, 1e-6)
    for I, Wt in reversed(pyr[:-1]):
        est = I + (1 - np.clip(Wt, 0, 1)) * up(est, I.shape)
    hp = a - np.asarray(img_pil.filter(ImageFilter.GaussianBlur(2.5))).astype(np.float64)
    detail = np.zeros_like(a); got = np.zeros((H, W), bool)
    for dy, dx in [(0, 26), (26, 0), (0, -26), (-26, 0), (26, 26), (-26, -26), (26, -26), (-26, 26), (0, 52), (52, 0), (0, -52), (-52, 0)]:
        sm = np.roll(np.roll(mask, -dy, 0), -dx, 1); sh = np.roll(np.roll(hp, -dy, 0), -dx, 1)
        ok = mask & ~got & ~sm; detail[ok] = sh[ok]; got |= ok
    est = est + 0.9 * detail
    return Image.fromarray(np.clip(est, 0, 255).astype(np.uint8))
def white_text(a):
    mn, mx, L = a.min(2), a.max(2), a.mean(2)
    white = (mn > 200) & (mx - mn < 42)
    thin = white & ~shift_or(shift_and(white, 2), 2)
    t = thin & shift_or(L < 80, 2)
    dens = np.asarray(Image.fromarray((t * 255).astype(np.uint8)).filter(ImageFilter.BoxBlur(7))).astype(np.float64) / 255
    return t & (dens > 0.06)

# ------------------------------------------------------------------ base image
base = Image.open(base_p).convert('RGB')
BW, BH = base.size
b = np.asarray(base).astype(np.float64)
YY, XX = np.mgrid[0:BH, 0:BW]
mb = np.zeros((BH, BW), bool)
def bbox(m, x0, y0, x1, y1, H, W): m[max(0, y0):min(H, y1), max(0, x0):min(W, x1)] = True
for r in [(0, 0, 300, 5), (16, 1006, 124, 1114), (926, 1074, 1070, 1114), (1058, 1108, BW, BH), (1934, 954, 1984, 1074), (1796, 1064, 1984, 1114)]:
    bbox(mb, *r, BH, BW)
# (the thin dark lines along the village back lanes are drains in the imagery and are kept)
mb = shift_or(mb, 1)
base_clean = inpaint(base, mb)

# ------------------------------------------------------------------ GIS strip (north of the base image)
S, TX, TY = 0.5234, 137.6, -145.7      # GIS px -> base px (phase-correlation registration)
gis = Image.open(gis_p).convert('RGB')
GW, GH = gis.size
g = np.asarray(gis).astype(np.float64)
GY, GX = np.mgrid[0:GH, 0:GW]
mg = np.zeros((GH, GW), bool)
for r in [(0, 0, 566, 204), (1816, 0, GW, 68), (1166, 376, 1297, 420), (1203, 414, 1260, 481),     # chrome, case-1 label and pin
          (630, 96, 850, 134), (668, 176, 856, 222), (560, 270, 610, 318), (986, 200, 1120, 246),   # place icons and labels
          (1090, 44, 1262, 98), (1048, 134, 1078, 164), (1260, 284, 1290, 314)]:                     # (incl. route shields)
    bbox(mg, *r, GH, GW)
d = np.hypot(GX - 1161.4, GY - 594.8)
mg |= (d >= 393) & (d <= 409)                                   # the dashed outbreak circle
mg |= shift_or(white_text(g), 2)
mg = shift_or(mg, 1)
gis_clean = inpaint(gis, mg)

# ------------------------------------------------------------------ extended canvas (ext = base + (0, OY))
OY = 145                                        # GIS strip height; its top row is GIS y ~1.3
EW, EH = BW, BH + OY
ext = np.zeros((EH, EW, 3))
ext[OY:, :] = np.asarray(base_clean).astype(np.float64)
# GIS resampled into base coordinates for base y in [-OY, SEAM]
SEAM = 24
x0b, x1b = 440, 1080
gx0, gy0 = (x0b - TX) / S, (-OY - TY) / S
gx1, gy1 = (x1b - TX) / S, (SEAM - TY) / S
patch = gis_clean.resize((x1b - x0b, OY + SEAM), Image.LANCZOS, box=(gx0, gy0, gx1, gy1))
P = np.asarray(patch).astype(np.float64)
# colour-match the GIS patch to the base on their overlap (base y 0..SEAM), per channel gain/bias
ov_b = ext[OY:OY + SEAM, x0b:x1b].reshape(-1, 3)
ov_g = P[OY:OY + SEAM].reshape(-1, 3)
fit = []
for c in range(3):
    A = np.c_[ov_g[:, c], np.ones(len(ov_g))]
    k, m = np.linalg.lstsq(A, ov_b[:, c], rcond=None)[0]
    fit.append((k, m)); P[..., c] = P[..., c] * k + m
# the GIS imagery is sharper (1.91x zoom): soften to the base's detail level
P = np.asarray(Image.fromarray(np.clip(P, 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.6))).astype(np.float64)
ext[0:OY, x0b:x1b] = P[0:OY]
wgt = np.linspace(1, 0, SEAM)[:, None, None]                   # feathered seam into the base
ext[OY:OY + SEAM, x0b:x1b] = wgt * P[OY:OY + SEAM] + (1 - wgt) * ext[OY:OY + SEAM, x0b:x1b]
ext_im = Image.fromarray(np.clip(ext, 0, 255).astype(np.uint8))

# ------------------------------------------------------------------ grade + pack (content 0.75 scale in 2048x1024)
C = 0.75
graded = ImageEnhance.Color(ext_im).enhance(0.92)
graded = ImageEnhance.Contrast(graded).enhance(1.04)
graded = graded.resize((round(EW * C), round(EH * C)), Image.LANCZOS)
tex = Image.new('RGB', (2048, 1024), (8, 14, 30))
tex.paste(graded, (0, 0))
tex.save(out_p, 'JPEG', quality=88, optimize=True, progressive=True)

# ------------------------------------------------------------------ constants
ZX, ZY = S * 1161.4 + TX, S * 594.8 + TY        # GIS outbreak-circle centre in base px
M_PER_PX = 100 / 106.0                          # base scale bar: 100 m = 106 px
info = {
    'texW': 2048, 'texH': 1024, 'contentScale': C, 'extW': EW, 'extH': EH,
    'zone': [round(ZX, 1), round(ZY + OY, 1)], 'zoneR200m': round(200 / M_PER_PX, 1),
    'gisCircleR': round(401.1 * S, 1),
    'rects': [[0, OY, EW, EH], [x0b, 0, x1b, OY + SEAM]],
    'fit': [[round(k, 3), round(m, 1)] for k, m in fit]
}
print(json.dumps(info))
dd = np.asarray(base).copy(); dd[mb] = (dd[mb] * 0.3 + np.array([255, 0, 255]) * 0.7).astype(np.uint8)
Image.fromarray(dd).resize((1000, 566)).save(dbg + '/mask-base.png')
dg = np.asarray(gis).copy(); dg[mg] = (dg[mg] * 0.3 + np.array([255, 0, 255]) * 0.7).astype(np.uint8)
Image.fromarray(dg).crop((500, 0, 1900, 560)).save(dbg + '/mask-gis.png')
ext_im.save(dbg + '/ext.png')
