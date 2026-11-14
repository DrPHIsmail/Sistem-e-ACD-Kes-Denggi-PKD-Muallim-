# V9 (draft 3): recover the camera of a Google Earth screenshot, for src/kampung3d.js (K3D_CAM).
#
#   python3 -I tools/make-aerial-camera.py <screenshot> assets/peta-glob.jpg [<folder for check images>]
#
# Needs OpenCV (pip install opencv-python-headless==4.10.0.84) and numpy.
# 1. SIFT matches between the screenshot and the V6 satellite map (assets/peta-glob.jpg: 100 m = 106 px, outbreak centre
#    at (745.5, 310.6) = the PKD GIS circle centre, a point between the cases) → RANSAC ground homography.
# 2. The principal point closest to the image centre for which the homography decomposes exactly (r1 ⟂ r2, |r1| = |r2|;
#    a cropped screenshot moves it off centre), then the focal length, rotation and position (metres; x east, y up, z south,
#    origin at the outbreak centre).
# Prints the K3D_CAM block. The screenshot itself is not copied anywhere; save the cleaned photo as assets/udara-3d.jpg.
import sys, json, numpy as np
import cv2

PX_PER_M, ZONE = 1.06, (745.5, 310.6)   # V6 map scale and outbreak centre (engine.js GLOBE.zone)

def homography(top_path, shot_path):
    top, shot = cv2.imread(top_path), cv2.imread(shot_path)
    g1, g2 = cv2.cvtColor(top, cv2.COLOR_BGR2GRAY), cv2.cvtColor(shot, cv2.COLOR_BGR2GRAY)
    m1 = np.zeros_like(g1); m1[110:, :] = 255                 # the V6 texture has black padding at the top
    sift = cv2.SIFT_create(nfeatures=20000, contrastThreshold=0.02)
    k1, d1 = sift.detectAndCompute(g1, m1); k2, d2 = sift.detectAndCompute(g2, None)
    good = [a for a, b in cv2.BFMatcher(cv2.NORM_L2).knnMatch(d1, d2, k=2) if a.distance < 0.78 * b.distance]
    p1 = np.float32([k1[m.queryIdx].pt for m in good]); p2 = np.float32([k2[m.trainIdx].pt for m in good])
    H, inl = cv2.findHomography(p1, p2, cv2.RANSAC, 6.0, maxIters=20000, confidence=0.999); inl = inl.ravel().astype(bool)
    err = np.linalg.norm(cv2.perspectiveTransform(p1[inl].reshape(-1, 1, 2), H).reshape(-1, 2) - p2[inl], axis=1)
    print('matches %d, inliers %d, median error %.2f px' % (len(good), inl.sum(), np.median(err)), file=sys.stderr)
    return H, shot

def principal_point(M, W, Hh):
    def resid(cx, cy):
        h1, h2 = M[:, 0].copy(), M[:, 1].copy()
        h1[:2] -= np.array([cx, cy]) * h1[2]; h2[:2] -= np.array([cx, cy]) * h2[2]
        f2 = -(h1[0] * h2[0] + h1[1] * h2[1]) / (h1[2] * h2[2])
        if f2 <= 0: return None, None
        return np.sqrt(f2), (h1[0]**2 + h1[1]**2 + f2 * h1[2]**2) / (h2[0]**2 + h2[1]**2 + f2 * h2[2]**2) - 1
    best = None
    for cx in np.arange(W / 2 - 600, W / 2 + 600.5, 2.5):
        for cy in np.arange(Hh / 2 - 600, Hh / 2 + 600.5, 2.5):
            f, c2 = resid(cx, cy)
            if f is None or abs(c2) > 0.002: continue
            d = np.hypot(cx - W / 2, cy - Hh / 2)
            if best is None or d < best[0]: best = (d, cx, cy, f)
    if best is None: sys.exit('no principal point decomposes the homography exactly')
    return best[1], best[2], best[3]

def camera(M, cx, cy, f):
    K = np.array([[f, 0, cx], [0, f, cy], [0, 0, 1.0]]); Ki = np.linalg.inv(K)
    b1, b2, b3 = Ki @ M[:, 0], Ki @ M[:, 1], Ki @ M[:, 2]
    lam = 2 / (np.linalg.norm(b1) + np.linalg.norm(b2)); rx, rz, t = b1 * lam, b2 * lam, b3 * lam
    if t[2] < 0: rx, rz, t = -rx, -rz, -t
    R = np.stack([rx, np.cross(rz, rx), rz], 1); U, _, Vt = np.linalg.svd(R); R = U @ Vt
    C = -R.T @ t; Rw = R.T @ np.diag([1, -1, -1.0])            # three.js camera: cam → world, y up, looking down −z
    m = Rw; tr = np.trace(m)
    if tr > 0: s = np.sqrt(tr + 1) * 2; q = [(m[2, 1] - m[1, 2]) / s, (m[0, 2] - m[2, 0]) / s, (m[1, 0] - m[0, 1]) / s, 0.25 * s]
    else:
        i = int(np.argmax(np.diag(m)))
        if i == 0: s = np.sqrt(1 + m[0, 0] - m[1, 1] - m[2, 2]) * 2; q = [0.25 * s, (m[0, 1] + m[1, 0]) / s, (m[0, 2] + m[2, 0]) / s, (m[2, 1] - m[1, 2]) / s]
        elif i == 1: s = np.sqrt(1 + m[1, 1] - m[0, 0] - m[2, 2]) * 2; q = [(m[0, 1] + m[1, 0]) / s, 0.25 * s, (m[1, 2] + m[2, 1]) / s, (m[0, 2] - m[2, 0]) / s]
        else: s = np.sqrt(1 + m[2, 2] - m[0, 0] - m[1, 1]) * 2; q = [(m[0, 2] + m[2, 0]) / s, (m[1, 2] + m[2, 1]) / s, 0.25 * s, (m[1, 0] - m[0, 1]) / s]
    proj = lambda P: (lambda v: v[:2] / v[2])(K @ (R @ P + t))
    return K, R, t, C, q, proj

def main():
    shot_path, top_path = sys.argv[1], sys.argv[2]; out_dir = sys.argv[3] if len(sys.argv) > 3 else None
    H, shot = homography(top_path, shot_path); Hh, W = shot.shape[:2]
    M = H @ np.array([[PX_PER_M, 0, ZONE[0]], [0, PX_PER_M, ZONE[1]], [0, 0, 1.0]])   # metres → screenshot px
    cx, cy, f = principal_point(M, W, Hh)
    K, R, t, C, q, proj = camera(M, cx, cy, f)
    centre = proj(np.zeros(3)); fwd = R.T @ np.array([0, 0, 1.0])
    print('principal point (%.1f, %.1f), f %.1f px; camera %.0f m up, looking %.1f° below the horizon' % (cx, cy, f, C[1], np.degrees(np.arcsin(-fwd[1]))), file=sys.stderr)
    worst = max(np.linalg.norm(proj(np.array([x, 0, z], float)) - (lambda v: v[:2] / v[2])(M @ np.array([x, z, 1.0]))) for x in (-300, 0, 300) for z in (-300, 0, 300))
    print('camera vs homography: max %.2f px over ±300 m' % worst, file=sys.stderr)
    if out_dir:   # the 200 m ring drawn on the screenshot, for a visual check
        th = np.linspace(0, 2 * np.pi, 240); ring = np.array([proj(np.array([200 * np.cos(a), 0, 200 * np.sin(a)])) for a in th])
        vis = shot.copy(); cv2.polylines(vis, [ring.astype(np.int32).reshape(-1, 1, 2)], True, (40, 110, 255), 3)
        cv2.circle(vis, tuple(int(v) for v in centre), 6, (0, 0, 255), -1); cv2.imwrite(out_dir.rstrip('/') + '/udara-cincin-200m.jpg', vis)
    print('const K3D_CAM = ' + json.dumps({ 'w': W, 'h': Hh, 'f': round(float(f), 1), 'cx': round(float(cx), 1), 'cy': round(float(cy), 1),
        'centre': [round(float(v), 1) for v in centre], 'pos': [round(float(v), 2) for v in C], 'quat': [round(float(v), 6) for v in q] }) + ';')

if __name__ == '__main__':
    main()
