/* V9 (draft 3): background of the NADI introduction (film K3D.win) — the user's Google Earth view of the outbreak area
 * (assets/udara-3d.jpg, embedded by the build), projected back onto the ground through the camera that took it, so the
 * view can turn about the outbreak centre while the 200 m dome and its rings stand on that ground.
 *
 * The camera is recovered from the photo itself (tools/make-aerial-camera.py): SIFT matches against the V6 satellite map
 * (assets/peta-glob.jpg, 100 m = 106 px; outbreak centre = the PKD GIS circle centre, a point between the cases, not a
 * case house) give a ground homography (568 matches, median error 2.3 px), decomposed into a pinhole camera whose
 * principal point is solved so the decomposition is exact (≤ 0.26 px against the homography over ±300 m; the point sits
 * right of and below the image centre, as in a screenshot cropped of Google Earth's controls and bottom bar).
 * World: metres, origin at the outbreak centre, x east, y up, z south. No case houses are marked. */
const K3D = { ok: false, failed: false, win: [21.95, 29.95] };
const K3D_CAM = {
  w: 2000, h: 1253,                 // photo (px)
  f: 2282.8, cx: 1182.5, cy: 674,   // focal length and principal point (px): the frame is symmetric about it at 2365 × 1348
  centre: [1556.5, 551.1],          // outbreak centre in the photo (px)
  pos: [1411.65, 783.33, 42.19],    // camera (m): 783 m up, 1.4 km east, looking west 32.5° below the horizon
  quat: [-0.18352, 0.729323, 0.210974, 0.624418]
};
/* framing for a 1708 × 1013 canvas (scaled with it): the photo at 1.3×, the outbreak centre held at (610, 640), left of the
 * locality card; the view turns −6° → +20° about the centre, so the foreground runs right → left, and closes in 4 %.
 * The photo covers every visible pixel over that turn (only the 30 px strips round the card, corners included, fall
 * outside it; they show the mirrored photo under haze). */
const K3D_SHOT = { z: 1.3, at: [610 / 1708, 640 / 1013], turn: [-6, 20], dolly: 0.04 };

function initKampung(canvas, img, bw, bh) {
  try {
    const T3 = THREE, C = K3D_CAM;
    if (!img || !img.naturalWidth) throw new Error('aerial photo not decoded');
    const r = new T3.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
    r.setPixelRatio(RENDER_SCALE); r.setSize(bw, bh, false);   // V9 (HD): drawn at the screen's resolution (engine.js setRenderScale)
    r.toneMapping = T3.NoToneMapping;   // all materials below write display (sRGB) values directly
    const scene = new T3.Scene();
    const vw = 2 * C.cx, vh = 2 * C.cy, fov = 2 * Math.atan(C.cy / C.f) * 180 / Math.PI;
    // the camera that took the photo: its view-projection maps ground points to photo pixels
    const cam0 = new T3.PerspectiveCamera(fov, vw / vh, 10, 20000);
    cam0.position.fromArray(C.pos); cam0.quaternion.fromArray(C.quat); cam0.updateMatrixWorld(true); cam0.updateProjectionMatrix();
    const photoVP = new T3.Matrix4().multiplyMatrices(cam0.projectionMatrix, cam0.matrixWorldInverse);
    const tex = new T3.Texture(img); tex.needsUpdate = true; tex.generateMipmaps = false;
    tex.minFilter = T3.LinearFilter; tex.magFilter = T3.LinearFilter;   // shown at ≈1.3×: magnified everywhere, no mipmaps needed
    tex.wrapS = tex.wrapT = T3.MirroredRepeatWrapping;                  // beyond the photo (strips round the card): mirrored, hazed
    // the photo is the top-left C.w × C.h of the vw × vh frame (the frame is centred on the principal point)
    const groundU = { uPhoto: { value: tex }, uVP: { value: photoVP }, uSpan: { value: new T3.Vector2(vw / C.w, vh / C.h) },
      uPx: { value: new T3.Vector2(1 / C.w, 1 / C.h) }, uRes: { value: new T3.Vector2(bw * RENDER_SCALE, bh * RENDER_SCALE) }, uCtr: { value: new T3.Vector2(K3D_SHOT.at[0], 1 - K3D_SHOT.at[1]) } };
    const ground = new T3.Mesh(new T3.PlaneGeometry(24000, 24000).rotateX(-Math.PI / 2), new T3.ShaderMaterial({ uniforms: groundU,
      vertexShader: 'varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }',
      fragmentShader: 'uniform sampler2D uPhoto; uniform mat4 uVP; uniform vec2 uSpan; uniform vec2 uPx; uniform vec2 uRes; uniform vec2 uCtr; varying vec3 vW;' +
        ' void main(){ vec4 c = uVP * vec4(vW, 1.0); vec2 n = c.xy / c.w; vec2 uv = vec2((n.x + 1.0) * 0.5 * uSpan.x, 1.0 - (1.0 - n.y) * 0.5 * uSpan.y);' +
        // a light unsharp mask offsets the 1.3× magnification
        ' vec3 col = texture2D(uPhoto, uv).rgb; vec3 b = 0.25 * (texture2D(uPhoto, uv + vec2(uPx.x, 0.0)).rgb + texture2D(uPhoto, uv - vec2(uPx.x, 0.0)).rgb' +
        ' + texture2D(uPhoto, uv + vec2(0.0, uPx.y)).rgb + texture2D(uPhoto, uv - vec2(0.0, uPx.y)).rgb); col = clamp(col + 0.45 * (col - b), 0.0, 1.0);' +
        // grade: a little less saturation and a warm lift, so the photo sits with the film's palette
        ' float l = dot(col, vec3(0.299, 0.587, 0.114)); col = mix(vec3(l), col, 0.9); col = (col - 0.5) * 1.04 + 0.5 + vec3(0.014, 0.006, -0.01);' +
        // outside the photo: haze over the mirrored fill
        ' float o = max(max(-uv.x, uv.x - 1.0), max(-uv.y, uv.y - 1.0)); col = mix(col, vec3(0.72, 0.76, 0.74), 0.6 * smoothstep(0.0, 0.05, o));' +
        // soft vignette around the dome
        ' vec2 q = (gl_FragCoord.xy / uRes - uCtr) * vec2(uRes.x / uRes.y, 1.0); col *= 1.0 - 0.16 * smoothstep(0.45, 1.25, length(q));' +
        ' gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0); }' }));
    scene.add(ground);
    // the 200 m dome: rim-lit glass; a 1.6 s heartbeat (a bright wave climbs the dome and the rim flares)
    const domeU = { uTime: { value: 0 }, uOp: { value: 1 } };
    const dome = new T3.Mesh(new T3.SphereGeometry(200, 128, 48, 0, Math.PI * 2, 0, Math.PI / 2), new T3.ShaderMaterial({ uniforms: domeU, transparent: true, depthWrite: false, side: T3.DoubleSide,
      vertexShader: 'varying vec3 vN; varying vec3 vV; varying float vH; void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vN = normalize(mat3(modelMatrix) * normal); vV = cameraPosition - w.xyz; vH = position.y / 200.0; gl_Position = projectionMatrix * viewMatrix * w; }',
      fragmentShader: 'uniform float uTime; uniform float uOp; varying vec3 vN; varying vec3 vV; varying float vH;' +
        ' void main(){ float f = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), 2.3); float ph = fract(uTime / 1.6);' +
        ' float wave = exp(-pow((vH - ph * 1.05) / 0.07, 2.0)) * pow(1.0 - ph, 0.8); float beat = 0.8 + 0.45 * pow(1.0 - ph, 3.0);' +
        ' vec3 c = mix(vec3(1.0, 0.42, 0.18), vec3(1.0, 0.8, 0.45), clamp(f + wave, 0.0, 1.0));' +
        ' float a = (0.05 + 0.66 * pow(f, 1.25) * beat + 0.34 * wave) * uOp; gl_FragColor = vec4(c, min(a, 0.9)); }' }));
    dome.renderOrder = 3; scene.add(dome);
    // ground disc: soft fill, the 200 m edge and three pulses running outward
    const disc = new T3.Mesh(new T3.CircleGeometry(206, 192).rotateX(-Math.PI / 2), new T3.ShaderMaterial({ uniforms: domeU, transparent: true, depthWrite: false,
      vertexShader: 'varying vec2 vP; void main(){ vP = position.xz / 200.0; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: 'uniform float uTime; uniform float uOp; varying vec2 vP; void main(){ float r = length(vP);' +
        ' float a = 0.16 * smoothstep(1.02, 0.0, r) + 0.9 * exp(-pow((r - 1.0) / 0.012, 2.0));' +
        ' for (int i = 0; i < 3; i++) { float f = fract(uTime / 1.6 + float(i) / 3.0); a += 0.8 * pow(1.0 - f, 1.2) * exp(-pow((r - f) / 0.026, 2.0)); }' +
        ' gl_FragColor = vec4(1.0, 0.5, 0.22, a * uOp * step(r, 1.03)); }' }));
    disc.position.y = 0.7; disc.renderOrder = 2; scene.add(disc);
    const camera = new T3.PerspectiveCamera(fov, vw / vh, 10, 20000);
    Object.assign(K3D, { ok: true, r, scene, camera, cam0, domeU, groundU, tex, bw, bh, T3, vw, vh });
  } catch (err) { K3D.failed = true; K3D.err = String(err && err.message || err); }
}

/* V9 (HD): redraw at another device-pixel scale (the canvas keeps its CSS size) */
function kampungScale(rs) {
  const { r, groundU, bw, bh } = K3D;
  r.setPixelRatio(rs); r.setSize(bw, bh, false); groundU.uRes.value.set(bw * rs, bh * rs);
}

/* the turn: eased from the first frame (already moving when the panel fades in, still moving when it leaves) */
function kampungTurn(ft) {
  const p = Math.min(1, Math.max(0, (ft - K3D.win[0]) / (K3D.win[1] - K3D.win[0]))), k = 0.4 * p + 0.6 * p * p * (3 - 2 * p);
  return { k, deg: K3D_SHOT.turn[0] + (K3D_SHOT.turn[1] - K3D_SHOT.turn[0]) * k };
}

function renderKampung(ft) {
  if (!K3D.ok) return null;
  const { r, scene, camera, cam0, domeU, bw, bh, T3, vw, vh } = K3D, C = K3D_CAM, S = K3D_SHOT, tr = kampungTurn(ft);
  // orbit the photo camera about the vertical through the outbreak centre, closing in along the line to it
  const yaw = new T3.Quaternion().setFromAxisAngle(new T3.Vector3(0, 1, 0), tr.deg * Math.PI / 180);
  camera.position.copy(cam0.position).multiplyScalar(1 - S.dolly * tr.k).applyQuaternion(yaw);
  camera.quaternion.copy(yaw).multiply(cam0.quaternion);
  // the canvas shows the photo frame at z×, with the outbreak centre at S.at (the centre stays put as the view turns)
  const z = S.z * bh / 1013, x0 = C.centre[0] - S.at[0] * bw / z, y0 = C.centre[1] - S.at[1] * bh / z;
  camera.setViewOffset(vw * z, vh * z, x0 * z, y0 * z, bw, bh); camera.updateProjectionMatrix(); camera.updateMatrixWorld(true);
  domeU.uTime.value = ft; domeU.uOp.value = 1;
  r.render(scene, camera);
  // label anchors (canvas px): the kampung name over the top of the dome's outline, the radius on the near edge of the ring
  const proj = (x, y, zz) => { const v = new T3.Vector3(x, y, zz).project(camera); return [(v.x + 1) / 2 * bw, (1 - v.y) / 2 * bh]; };
  const h = new T3.Vector3(camera.position.x, 0, camera.position.z).normalize(), d = camera.position.length(), se = camera.position.y / d, ce = Math.sqrt(1 - se * se);
  return { name: proj(-200 * se * h.x, 200 * ce, -200 * se * h.z), radius: proj(200 * h.x, 0, 200 * h.z), turn: tr.deg };
}
