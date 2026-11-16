// OUTRUN 3D scenes (Three.js r160), ported from design-handoff/three-scenes.js.
// Loaded with import('outrun-3d') by lazy3D() in outrun.js, only when a 3D section is within 300px of the viewport.
// 'three' and the RoomEnvironment addon resolve through the import map in layout/theme.liquid (self-hosted theme assets).
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const COL = { black: 0x05070a, navy: 0x0a1e2e, steel: 0x3e6f8f, ice: 0xbfd8e8, cloud: 0xf7fafc, blue: 0x7ed3f6 };
// Official OUTRUN symbol (Logo Pack 04_Symbol), viewBox 0 -1 306 165. Fill with 'evenodd'.
const SYMBOL = new Path2D('M32,163.7C25.6,163.6 16.1,163.6 11,163.5L1.6,163.5L1.2,163L0.7,162.6L0.7,136L0.8,109.4L1.1,108.9C1.7,108.1 108.8,1 109.4,0.7L109.9,0.4L142.2,0.2C160,0.1 174.6,0.1 174.7,0.1C174.8,0.2 174.9,10 174.9,21.8L175,43.4L114.7,103.7L54.4,164L49,164C46,163.9 38.4,163.8 32,163.7ZM161.9,163.7C155.3,163.6 145.8,163.5 140.8,163.5L131.6,163.5L131.3,163.2L131,162.9L131,136.2L131,109.4L185.1,55.2C214.9,25.4 239.5,0.9 239.7,0.8C240.5,0.3 244.6,0.3 275.2,0.1L304.7,0L305,0.9L305.4,1.9L305.2,22.7L305.1,43.5L244.9,103.8L184.6,164L179.2,164C176.3,163.9 168.5,163.8 161.9,163.7Z');
const SYM_W = 306, SYM_H = 165, SYM_Y0 = -1;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const seg = (p, a, b) => clamp((p - a) / (b - a));
const isTouch = matchMedia('(hover: none)').matches;

export const FINISHES = {
  gloss: { color: 0x0c0f13, metalness: .55, roughness: .16, clearcoat: 1 },
  steel: { color: 0x5d7486, metalness: 1, roughness: .42, clearcoat: .2 },
  ice:   { color: 0xd3e2ec, metalness: 1, roughness: .07, clearcoat: 1 },
};

/* ---------- Emblem faces (canvas textures) ---------- */
// Street: customImg is the make's badge artwork; without it, label (the make's name) is lettered on the plate.
export function emblemCanvas(edition, customImg, label) {
  const s = 512, c = document.createElement('canvas'); c.width = c.height = s;
  const g = c.getContext('2d');
  const bg = g.createRadialGradient(s * .38, s * .3, 10, s / 2, s / 2, s / 2);
  bg.addColorStop(0, '#16324a'); bg.addColorStop(.55, '#0A1E2E'); bg.addColorStop(1, '#05070A');
  g.fillStyle = bg; g.fillRect(0, 0, s, s);
  g.strokeStyle = 'rgba(191,216,232,.35)'; g.lineWidth = 3;
  g.beginPath(); g.arc(s / 2, s / 2, s / 2 - 18, 0, Math.PI * 2); g.stroke();
  if (edition === 'signature') {
    g.save(); const w = 270, k = w / SYM_W; g.translate(s / 2 - w / 2, s / 2 - SYM_H * k / 2 - SYM_Y0 * k); g.scale(k, k);
    g.fillStyle = '#F7FAFC'; g.shadowColor = 'rgba(126,211,246,.55)'; g.shadowBlur = 18; g.fill(SYMBOL, 'evenodd'); g.restore();
  } else if (edition === 'street' && customImg) {
    g.save(); g.beginPath(); g.arc(s / 2, s / 2, s / 2 - 40, 0, Math.PI * 2); g.clip();
    const r = Math.min((s - 120) / customImg.width, (s - 120) / customImg.height);
    const w = customImg.width * r, h = customImg.height * r; g.drawImage(customImg, s / 2 - w / 2, s / 2 - h / 2, w, h); g.restore();
  } else if (edition === 'street' && label) {
    // No badge artwork uploaded yet for this make: its name, lettered on the plate.
    const text = String(label).toUpperCase();
    g.strokeStyle = 'rgba(191,216,232,.5)'; g.lineWidth = 3;
    g.beginPath(); g.arc(s / 2, s / 2, 168, 0, Math.PI * 2); g.stroke();
    let size = 76;
    g.font = `600 ${size}px "Chakra Petch", sans-serif`;
    while (g.measureText(text).width > 280 && size > 28) { size -= 2; g.font = `600 ${size}px "Chakra Petch", sans-serif`; }
    g.fillStyle = '#F7FAFC'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.shadowColor = 'rgba(126,211,246,.45)'; g.shadowBlur = 14;
    g.fillText(text, s / 2, s / 2 + 2);
  } else if (edition === 'street') {
    // Neutral face for cars we don't have a make for ("Other").
    g.save(); g.translate(s / 2, s / 2);
    g.strokeStyle = 'rgba(191,216,232,.7)'; g.lineWidth = 6;
    g.beginPath(); for (let i = 0; i < 6; i++) { const a = Math.PI / 6 + i * Math.PI / 3; g.lineTo(Math.cos(a) * 120, Math.sin(a) * 120); } g.closePath(); g.stroke();
    g.fillStyle = '#F7FAFC'; g.font = '600 34px "Chakra Petch", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText('YOUR CAR', 0, 2); g.restore();
  } else {
    if (customImg) {
      g.save(); g.beginPath(); g.arc(s / 2, s / 2, s / 2 - 24, 0, Math.PI * 2); g.clip();
      const r = Math.max((s - 48) / customImg.width, (s - 48) / customImg.height);
      const w = customImg.width * r, h = customImg.height * r; g.drawImage(customImg, s / 2 - w / 2, s / 2 - h / 2, w, h); g.restore();
    } else {
      g.fillStyle = 'rgba(191,216,232,.28)';
      for (let x = 60; x < s; x += 28) for (let y = 60; y < s; y += 28) if (Math.hypot(x - s / 2, y - s / 2) < 190) g.fillRect(x, y, 2, 2);
      g.setLineDash([14, 10]); g.strokeStyle = '#7ED3F6'; g.lineWidth = 4;
      g.beginPath(); g.arc(s / 2, s / 2, 128, 0, Math.PI * 2); g.stroke(); g.setLineDash([]);
      g.fillStyle = '#F7FAFC'; g.font = '700 40px "Chakra Petch", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillText('YOUR', s / 2, s / 2 - 22); g.fillText('DESIGN', s / 2, s / 2 + 24);
    }
  }
  return c;
}
function tex(canvas) { const t = new THREE.CanvasTexture(canvas); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; }
const texCache = {};
export function emblemTexture(edition, customImg, label) {
  if (customImg) return tex(emblemCanvas(edition, customImg));
  const key = edition === 'street' ? `street|${label || ''}` : edition;
  return texCache[key] ??= tex(emblemCanvas(edition, null, label));
}

/* Plate material: printed face that can dissolve from one emblem to another (the "morph"). */
function plateMaterial(map) {
  return new THREE.ShaderMaterial({
    uniforms: { mapA: { value: map }, mapB: { value: map }, mixP: { value: 1 }, dim: { value: 1 }, sheen: { value: 0 } },
    vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
    fragmentShader: `
      uniform sampler2D mapA, mapB; uniform float mixP, dim, sheen; varying vec2 vUv;
      float h(vec2 p){ return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453); }
      float n(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f);
        return mix(mix(h(i),h(i+vec2(1,0)),f.x), mix(h(i+vec2(0,1)),h(i+1.),f.x), f.y); }
      void main(){
        float k = n(vUv*9.)*.7 + n(vUv*23.)*.3;
        float t = smoothstep(k-.06, k+.06, mixP*1.12-.06);
        vec3 a = texture2D(mapA,vUv).rgb, b = texture2D(mapB,vUv).rgb;
        vec3 col = mix(a,b,t);
        float edge = (1.-abs(t*2.-1.)) * step(.001,mixP) * step(mixP,.999);
        col += vec3(.49,.83,.96)*edge*1.4;
        float s = smoothstep(.06,0.,abs(vUv.x+vUv.y-1.-sheen*2.4+1.2))*.28;
        col += vec3(.75,.85,.92)*s;
        gl_FragColor = vec4(col*dim,1.);
        #include <colorspace_fragment>
      }`,
  });
}

/* ---------- Floating cap: shell, bearing, counterweight, emblem plate ---------- */
export function buildCap(edition = 'signature', finish = 'gloss', customImg, label) {
  const cap = new THREE.Group(); cap.name = 'cap';
  const prof = [[0, 0], [.97, 0], [1, .03], [1, .2], [.95, .27], [.86, .3], [.84, .3], [.84, .26], [0, .26]].map(([r, y]) => new THREE.Vector2(r, y));
  const shellGeo = new THREE.LatheGeometry(prof, 96); shellGeo.rotateX(Math.PI / 2);
  const shellMat = new THREE.MeshPhysicalMaterial({ ...FINISHES[finish], envMapIntensity: 1.1 });
  const shell = new THREE.Mesh(shellGeo, shellMat); shell.name = 'shell';
  // spark: a hairline OUTRUN Blue ring in the bezel
  const spark = new THREE.Mesh(new THREE.TorusGeometry(.9, .006, 8, 128), new THREE.MeshBasicMaterial({ color: COL.blue }));
  spark.position.z = .3; shell.add(spark);

  const plateGroup = new THREE.Group(); plateGroup.name = 'plate';
  const plate = new THREE.Mesh(new THREE.CircleGeometry(.8, 96), plateMaterial(emblemTexture(edition, customImg, label)));
  const gloss = new THREE.Mesh(new THREE.CircleGeometry(.8, 96), new THREE.MeshPhysicalMaterial({ color: 0xffffff, transparent: true, opacity: .14, metalness: 0, roughness: .04, clearcoat: 1, envMapIntensity: 2.2, depthWrite: false }));
  gloss.position.z = .004; plateGroup.add(plate, gloss); plateGroup.position.z = .28;

  const bearing = new THREE.Group(); bearing.name = 'bearing';
  const metal = new THREE.MeshPhysicalMaterial({ color: 0xc9d6e0, metalness: 1, roughness: .18 });
  const outer = new THREE.Mesh(new THREE.TorusGeometry(.36, .06, 16, 64), metal);
  const inner = new THREE.Mesh(new THREE.CylinderGeometry(.16, .16, .16, 48).rotateX(Math.PI / 2), metal);
  for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2; const ball = new THREE.Mesh(new THREE.SphereGeometry(.045, 16, 12), metal); ball.position.set(Math.cos(a) * .26, Math.sin(a) * .26, 0); bearing.add(ball); }
  bearing.add(outer, inner); bearing.position.z = -.1;

  const weight = new THREE.Mesh(new THREE.CylinderGeometry(.55, .55, .12, 48, 1, false, Math.PI / 2, Math.PI).rotateX(Math.PI / 2),
    new THREE.MeshPhysicalMaterial({ color: 0x2b3138, metalness: .9, roughness: .5 }));
  weight.name = 'weight'; weight.position.z = -.1;

  cap.add(shell, plateGroup, bearing, weight);
  cap.userData = { shell, plate, plateGroup, bearing, weight, shellMat,
    home: { plate: plateGroup.position.clone(), shell: shell.position.clone(), bearing: bearing.position.clone(), weight: weight.position.clone() } };
  return cap;
}
export function setCapFinish(cap, finish) { const m = cap.userData.shellMat; const f = FINISHES[finish]; m.color.setHex(f.color); m.metalness = f.metalness; m.roughness = f.roughness; m.clearcoat = f.clearcoat; }
export function morphCap(cap, toTex, dur = 900) {
  const u = cap.userData.plate.material.uniforms; u.mapA.value = u.mapB.value; u.mapB.value = toTex; u.mixP.value = 0;
  const t0 = performance.now(); cap.userData.morph = now => { u.mixP.value = clamp((now - t0) / dur); if (u.mixP.value >= 1) cap.userData.morph = null; };
}

/* ---------- Wheel ---------- */
function radialSmear() {
  const s = 512, c = document.createElement('canvas'); c.width = c.height = s; const g = c.getContext('2d');
  for (let i = 0; i < 260; i++) {
    const r = 40 + Math.random() * 210, a = Math.random() * Math.PI * 2, l = .6 + Math.random() * 2.2;
    g.strokeStyle = `rgba(${150 + Math.random() * 80 | 0},${175 + Math.random() * 60 | 0},200,${.03 + Math.random() * .08})`;
    g.lineWidth = 1 + Math.random() * 6; g.beginPath(); g.arc(s / 2, s / 2, r, a, a + l); g.stroke();
  }
  return tex(c);
}
function streakMaterial(color = COL.blue) {
  return new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { start: { value: 0 }, len: { value: 1.6 }, opacity: { value: 1 }, color: { value: new THREE.Color(color) } },
    vertexShader: `varying vec2 vP; void main(){ vP=position.xy; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
    fragmentShader: `uniform float start,len,opacity; uniform vec3 color; varying vec2 vP;
      void main(){ float a = atan(vP.y,vP.x); float t = mod(a-start, 6.28318)/len; if(t>1.) discard;
        float al = pow(t,2.2)*opacity; vec3 c = mix(color, vec3(1.), pow(t,6.)); gl_FragColor = vec4(c*al, al); }`,
  });
}
export function buildWheel(opts = {}) {
  const wheel = new THREE.Group(); wheel.name = 'wheel';
  const spin = new THREE.Group(); spin.name = 'spin'; wheel.add(spin);
  const rimMat = new THREE.MeshPhysicalMaterial({ color: 0x1a2028, metalness: 1, roughness: .28, clearcoat: .8, clearcoatRoughness: .2, envMapIntensity: 1.2 });
  const lipMat = new THREE.MeshPhysicalMaterial({ color: 0xaab9c6, metalness: 1, roughness: .12 });
  const rubber = new THREE.MeshStandardMaterial({ color: 0x07080a, roughness: .93, metalness: 0, envMapIntensity: .22 });
  // tire
  const tp = []; const R0 = 1.0, R1 = 1.36;
  for (let i = 0; i <= 24; i++) { const a = -Math.PI / 2 + i / 24 * Math.PI; tp.push(new THREE.Vector2(R1 - .12 + Math.cos(a) * .12, -.12 + Math.sin(a) * .28)); }
  const tProf = [new THREE.Vector2(R0, -.42), ...tp.map(v => new THREE.Vector2(v.x, v.y)), new THREE.Vector2(R0, .18)];
  const tire = new THREE.Mesh(new THREE.LatheGeometry(tProf, 128).rotateX(Math.PI / 2), rubber); spin.add(tire);
  // barrel + lip
  const bProf = [[.94, -.38], [.98, -.36], [.98, .06], [1.03, .1], [1.05, .14], [1.0, .16], [.95, .13], [.93, .08]].map(([r, z]) => new THREE.Vector2(r, z));
  spin.add(new THREE.Mesh(new THREE.LatheGeometry(bProf, 128).rotateX(Math.PI / 2), lipMat));
  // spokes: 5 double spokes
  const spokeShape = new THREE.Shape(); spokeShape.moveTo(.2, -.075); spokeShape.lineTo(.96, -.045); spokeShape.lineTo(.96, .045); spokeShape.lineTo(.2, .075); spokeShape.closePath();
  const spokeGeo = new THREE.ExtrudeGeometry(spokeShape, { depth: .07, bevelEnabled: true, bevelThickness: .02, bevelSize: .012, bevelSegments: 3 });
  for (let i = 0; i < 5; i++) for (const o of [-.13, .13]) {
    const m = new THREE.Mesh(spokeGeo, rimMat); m.rotation.z = i / 5 * Math.PI * 2 + o; m.rotation.y = -.07; m.position.z = -.02; spin.add(m);
  }
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(.24, .26, .12, 64).rotateX(Math.PI / 2), rimMat); hub.position.z = .03; spin.add(hub);
  for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2; const nut = new THREE.Mesh(new THREE.CylinderGeometry(.026, .026, .05, 6).rotateX(Math.PI / 2), lipMat); nut.position.set(Math.cos(a) * .205, Math.sin(a) * .205, .1); spin.add(nut); }
  // disc
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(.8, .8, .03, 96).rotateX(Math.PI / 2), new THREE.MeshPhysicalMaterial({ color: 0x55606b, metalness: 1, roughness: .45 }));
  disc.position.z = -.26; spin.add(disc);
  // blur disc for speed
  const blur = new THREE.Mesh(new THREE.CircleGeometry(1.0, 96), new THREE.MeshBasicMaterial({ map: radialSmear(), transparent: true, opacity: 0, depthWrite: false }));
  blur.position.z = .13; spin.add(blur);
  // caliper (does not spin)
  const cs = new THREE.Shape(); const a0 = .25, a1 = 1.0;
  cs.absarc(0, 0, .9, a0, a1, false); cs.absarc(0, 0, .6, a1, a0, true);
  const caliper = new THREE.Mesh(new THREE.ExtrudeGeometry(cs, { depth: .16, bevelEnabled: true, bevelThickness: .03, bevelSize: .03, bevelSegments: 3, curveSegments: 24 }),
    new THREE.MeshPhysicalMaterial({ color: COL.steel, metalness: .3, roughness: .35, clearcoat: 1 }));
  caliper.position.z = -.33; wheel.add(caliper);
  // light streaks trailing the rim
  const streaks = new THREE.Group(); streaks.name = 'streaks';
  [[1.37, 1.395, 0, 1.9, COL.blue], [1.0, 1.012, 2.2, 1.3, COL.ice], [1.37, 1.38, 3.4, 1.1, COL.ice]].forEach(([r0, r1, st, len, c]) => {
    const m = streakMaterial(c); m.uniforms.start.value = st; m.uniforms.len.value = len;
    const ring = new THREE.Mesh(new THREE.RingGeometry(r0, r1, 160, 1), m); ring.position.z = .16; streaks.add(ring);
  });
  wheel.add(streaks);
  // cap holder: NOT inside the spin group, so the logo stays level
  const capHolder = new THREE.Group(); capHolder.name = 'capHolder'; capHolder.position.z = .12; capHolder.scale.setScalar(.2);
  const cap = buildCap(opts.edition || 'signature', opts.finish || 'gloss', opts.img, opts.label); capHolder.add(cap); wheel.add(capHolder);
  wheel.userData = { spin, blur, streaks, capHolder, cap, angle: 0, speed: 0, swing: .9, swingV: 0 };
  return wheel;
}
// Advance the wheel; the cap is a damped pendulum, so it settles level when speed changes.
export function tickWheel(wheel, dt, speed) {
  const u = wheel.userData; const accel = (speed - u.speed) / Math.max(dt, 1e-3); u.speed = speed;
  u.angle -= speed * dt; u.spin.rotation.z = u.angle;
  u.streaks.rotation.z = u.angle * 1.15;
  const f = clamp(speed / 14); u.blur.material.opacity = f * .62;
  u.streaks.children.forEach(s => s.material.uniforms.opacity.value = f);
  u.swingV += (-u.swing * 26 - u.swingV * 5.5 - clamp(accel, -60, 60) * .004) * dt; u.swing += u.swingV * dt;
  u.capHolder.rotation.z = u.swing;
}

/* ---------- Shared studio ---------- */
function studio(canvas, { alpha = true, fov = 32 } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, isTouch ? 1.5 : 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene();
  const pm = new THREE.PMREMGenerator(renderer); scene.environment = pm.fromScene(new RoomEnvironment(renderer), .04).texture; pm.dispose();
  const camera = new THREE.PerspectiveCamera(fov, 1, .05, 100);
  const key = new THREE.DirectionalLight(0xdde9f2, 2.2); key.position.set(-3, 4, 5);
  const rim = new THREE.DirectionalLight(COL.blue, 2.6); rim.position.set(4, 1, -3);
  scene.add(key, rim, new THREE.AmbientLight(0x274055, .6));
  const resize = () => { const w = canvas.clientWidth, h = canvas.clientHeight; if (!w || !h) return; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); };
  const ro = new ResizeObserver(resize); ro.observe(canvas); resize();
  let visible = true; const io = new IntersectionObserver(([e]) => visible = e.isIntersecting, { rootMargin: '100px' }); io.observe(canvas);
  let raf, last = performance.now();
  const loop = fn => { const f = now => { raf = requestAnimationFrame(f); const dt = Math.min(.05, (now - last) / 1000); last = now; if (!visible || document.hidden) return; fn(dt, now); renderer.render(scene, camera); }; raf = requestAnimationFrame(f); };
  const dispose = () => { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); renderer.dispose(); scene.traverse(o => { o.geometry?.dispose(); }); };
  return { renderer, scene, camera, loop, dispose, resize };
}
function floorGlow() {
  const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d');
  const r = g.createRadialGradient(128, 128, 0, 128, 128, 128); r.addColorStop(0, 'rgba(191,216,232,.22)'); r.addColorStop(.35, 'rgba(62,111,143,.16)'); r.addColorStop(1, 'rgba(5,7,10,0)');
  g.fillStyle = r; g.fillRect(0, 0, 256, 256);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(7, 3.2), new THREE.MeshBasicMaterial({ map: tex(c), transparent: true, depthWrite: false }));
  m.rotation.x = -Math.PI / 2; return m;
}
function project(obj, camera, canvas) {
  const v = new THREE.Vector3(); obj.getWorldPosition(v); v.project(camera);
  return { x: (v.x * .5 + .5) * canvas.clientWidth, y: (-v.y * .5 + .5) * canvas.clientHeight };
}

/* ---------- HERO + SCROLL STORY ---------- */
export function mountHero(canvas, host, { labels = {}, calm = false, onStage } = {}) {
  const S = studio(canvas); const { scene, camera } = S;
  const root = new THREE.Group(); scene.add(root);
  const wheel = buildWheel(); root.add(wheel);
  const floor = floorGlow(); floor.position.y = -1.5; root.add(floor);
  const veil = new THREE.Mesh(new THREE.PlaneGeometry(8, 8), new THREE.MeshBasicMaterial({ color: COL.black, transparent: true, opacity: 0, depthWrite: false }));
  veil.position.z = .2; root.add(veil);
  const { cap, capHolder } = wheel.userData; const cu = cap.userData;
  let px = 0, py = 0, tx = 0, ty = 0, stage = -1;
  const onMove = e => { tx = (e.clientX / innerWidth - .5) * 2; ty = (e.clientY / innerHeight - .5) * 2; };
  if (!isTouch) addEventListener('pointermove', onMove, { passive: true });
  const progress = () => { const r = host.getBoundingClientRect(); return clamp(-r.top / Math.max(1, r.height - innerHeight)); };
  const mobile = () => canvas.clientWidth < 700;
  const anchors = {}; ['plate', 'shell', 'bearing', 'weight'].forEach(k => { anchors[k] = new THREE.Object3D(); (k === 'plate' ? cu.plateGroup : cu[k]).add(anchors[k]); });
  anchors.plate.position.set(-.45, .6, .02); anchors.shell.position.set(.25, .97, .3); anchors.bearing.position.set(.36, -.3, 0); anchors.weight.position.set(-.35, -.45, 0);
  S.loop((dt, now) => {
    const p = progress();
    // stages: 0 hero | .14–.36 slow + push in | .4–.66 explode | .7–.84 reassemble | .86–1 pull back + spin up
    const slow = ease(seg(p, .1, .34)), push = ease(seg(p, .16, .4)), ex = ease(seg(p, .4, .6)) * (1 - ease(seg(p, .7, .84))), back = ease(seg(p, .86, 1));
    const st = p < .14 ? 0 : p < .4 ? 1 : p < .7 ? 2 : p < .86 ? 3 : 4; if (st !== stage) { stage = st; onStage?.(st); }
    const speed = calm ? 0 : lerp(lerp(16, 0, slow), 9, back);
    tickWheel(wheel, dt, speed);
    // camera
    const m = mobile(); const baseZ = m ? 12.5 : 7.2, nearZ = m ? 3.1 : 2.0;
    const camZ = lerp(lerp(baseZ, nearZ, push), baseZ * .92, back);
    camera.position.set(lerp(m ? 0 : -1.3, 0, push) * (1 - back) + (m ? 0 : -.6) * back, lerp(m ? -2.1 : 0, 0, push) * (1 - back), camZ);
    camera.lookAt(lerp(m ? 0 : -1.3, 0, push) * (1 - back) + (m ? 0 : -.6) * back, lerp(m ? -2.1 : 0, 0, push) * (1 - back), 0);
    // parallax / orbit
    if (isTouch && !calm) { tx = Math.sin(now / 2600) * .6; ty = Math.cos(now / 3400) * .3; }
    px = lerp(px, tx, .05); py = lerp(py, ty, .05);
    const k = 1 - push * .7;
    root.rotation.y = lerp(-.42, 0, push) * (1 - back) + -.3 * back + px * .14 * k;
    root.rotation.x = py * .08 * k;
    // explode the cap (turn it 3/4 so the stack reads sideways)
    capHolder.position.z = .12 + ex * .25;
    cap.rotation.y = -ex * .95; cap.rotation.x = ex * .12;
    const h = cu.home;
    cu.plateGroup.position.z = h.plate.z + ex * 1.15;
    cu.shell.position.z = h.shell.z + ex * .35;
    cu.weight.position.set(0, -ex * .55, h.weight.z - ex * .45);
    cu.bearing.position.z = h.bearing.z - ex * 1.1;
    cu.plate.material.uniforms.sheen.value = (now / 4000) % 1;
    veil.material.opacity = ex * .78;
    // labels
    for (const [key, el] of Object.entries(labels)) {
      if (!el) continue; const q = project(anchors[key], camera, canvas);
      el.style.transform = `translate(${q.x}px,${q.y}px)`; el.style.setProperty('--d', ex.toFixed(3));
    }
  });
  return { dispose() { S.dispose(); removeEventListener('pointermove', onMove); } };
}

/* ---------- EDITIONS SHOWCASE ---------- */
// street: { img, label } for the Street cap's face (see streetEmblem() in outrun.js).
export function mountEditions(canvas, { editions = ['street', 'signature', 'custom'], active = 1, onActive, calm = false, street = null } = {}) {
  const S = studio(canvas, { fov: 30 }); const { scene, camera } = S;
  const caps = editions.map((e, i) => {
    const img = e === 'street' ? street?.img || null : null, label = e === 'street' ? street?.label || null : null;
    const c = buildCap(e, i === 2 ? 'steel' : i === 0 ? 'ice' : 'gloss', img, label);
    c.userData.edition = e; c.userData.i = i; c.userData.custom = img; c.userData.label = label; scene.add(c); return c;
  });
  const floor = floorGlow(); floor.position.y = -1.3; scene.add(floor);
  let act = active; const ray = new THREE.Raycaster(), ptr = new THREE.Vector2();
  const pick = e => { const r = canvas.getBoundingClientRect(); ptr.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1); ray.setFromCamera(ptr, camera);
    const hit = ray.intersectObjects(caps, true)[0]; if (!hit) return -1; let o = hit.object; while (o && o.userData.i === undefined) o = o.parent; return o ? o.userData.i : -1; };
  const set = i => { if (i < 0 || i === act) return; const prev = caps[act]; act = i;
    morphCap(caps[i], emblemTexture(caps[i].userData.edition, caps[i].userData.custom, caps[i].userData.label), 1000);
    caps[i].userData.plate.material.uniforms.mapA.value = prev.userData.plate.material.uniforms.mapB.value;
    onActive?.(i); };
  const onMove = e => { if (e.pointerType === 'mouse') { const i = pick(e); canvas.style.cursor = i >= 0 ? 'pointer' : ''; if (i >= 0) set(i); } };
  const onDown = e => set(pick(e));
  canvas.addEventListener('pointermove', onMove); canvas.addEventListener('pointerdown', onDown);
  S.loop((dt, now) => {
    const m = canvas.clientWidth < 700; const gap = m ? 1.05 : 2.3;
    camera.position.set(0, .3, m ? 6.6 : 6.2); camera.lookAt(0, 0, 0);
    caps.forEach((c, i) => {
      const on = i === act, d = i - act;
      const x = m ? d * gap : (i - 1) * gap * (on ? .9 : 1.05);
      c.position.x = lerp(c.position.x, x, .08);
      c.position.z = lerp(c.position.z, on ? 1.1 : -1.0, .07);
      c.position.y = lerp(c.position.y, (calm ? 0 : Math.sin(now / 900 + i * 2) * .08) + (on ? .05 : -.05), .1);
      const sc = on ? 1.1 : .8; c.scale.setScalar(lerp(c.scale.x, sc, .07));
      c.rotation.y = calm ? (on ? 0 : -d * .35) : (on ? Math.sin(now / 1500) * .35 : now / 2600 + i);
      c.rotation.x = calm ? 0 : Math.sin(now / 2100 + i) * .12;
      const u = c.userData.plate.material.uniforms; u.dim.value = lerp(u.dim.value, on ? 1 : .45, .08); u.sheen.value = (now / 3600 + i * .3) % 1;
      c.userData.morph?.(now);
    });
  });
  return {
    setActive: set,
    setCustom(img) { const c = caps[2]; c.userData.custom = img; morphCap(c, emblemTexture('custom', img), 900); },
    setStreet(street) {
      const c = caps.find((x) => x.userData.edition === 'street'); if (!c) return;
      c.userData.custom = street?.img || null; c.userData.label = street?.label || null;
      morphCap(c, emblemTexture('street', c.userData.custom, c.userData.label), 900);
    },
    dispose() { S.dispose(); },
  };
}

/* ---------- PRODUCT 360° VIEWER ---------- */
export function mountViewer(canvas, { edition = 'signature', finish = 'gloss', calm = false, street = null } = {}) {
  const S = studio(canvas, { fov: 30 }); const { scene, camera } = S;
  const rig = new THREE.Group(); scene.add(rig);
  const isStreet = edition === 'street';
  const wheel = buildWheel({ edition, finish, img: isStreet ? street?.img : null, label: isStreet ? street?.label : null }); rig.add(wheel);
  const { cap, capHolder } = wheel.userData;
  const floor = floorGlow(); floor.position.y = -1.55; scene.add(floor);
  let yaw = -.5, pitch = .05, vy = 0, vp = 0, drag = null, spinOn = false, sp = 0, show = 0, idle = 0;
  const down = e => { drag = { x: e.clientX, y: e.clientY }; canvas.setPointerCapture(e.pointerId); idle = 0; };
  const move = e => { if (!drag) return; const dx = e.clientX - drag.x, dy = e.clientY - drag.y; drag = { x: e.clientX, y: e.clientY }; vy = dx * .008; vp = dy * .005; yaw += vy; pitch = clamp(pitch + vp, -.6, .6); };
  const up = () => { drag = null; };
  canvas.addEventListener('pointerdown', down); canvas.addEventListener('pointermove', move); canvas.addEventListener('pointerup', up); canvas.addEventListener('pointercancel', up);
  S.loop((dt, now) => {
    if (!drag) { yaw += vy; vy *= .94; idle += dt; if (idle > 2.5 && !calm) yaw += dt * .25; pitch = lerp(pitch, .05, .02); }
    show = lerp(show, spinOn ? 1 : 0, .06);
    rig.rotation.set(pitch, yaw, 0);
    // without the wheel the cap is the hero, at full size
    capHolder.scale.setScalar(lerp(1, .2, show)); capHolder.position.z = lerp(0, .12, show);
    wheel.userData.spin.visible = wheel.children[1].visible = show > .02; // spin group + caliper
    wheel.userData.spin.scale.setScalar(lerp(.6, 1, show)); wheel.children[1].scale.setScalar(lerp(.6, 1, show));
    wheel.userData.streaks.visible = show > .5;
    sp = lerp(sp, spinOn && !calm ? 14 : spinOn ? 3 : 0, .03);
    tickWheel(wheel, dt, sp);
    const m = canvas.clientWidth < 600;
    camera.position.set(0, .15, lerp(m ? 5.6 : 4.6, m ? 8.6 : 6.6, show)); camera.lookAt(0, 0, 0);
    cap.userData.plate.material.uniforms.sheen.value = (now / 3800) % 1; cap.userData.morph?.(now);
  });
  return {
    setEdition(e, img, label) { morphCap(cap, emblemTexture(e, img, label), 800); },
    setFinish(f) { setCapFinish(cap, f); },
    setSpin(v) { spinOn = v; idle = 0; wheel.userData.swingV += v ? -2.4 : 1.6; },
    dispose() { S.dispose(); },
  };
}

/* ---------- 360 thumbnails for the collection grid (one offscreen renderer) ---------- */
export async function renderThumbs(items, frames = 12, size = 320) {
  const canvas = document.createElement('canvas'); canvas.width = canvas.height = size;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
  renderer.setSize(size, size, false); renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x0a1724);
  const pm = new THREE.PMREMGenerator(renderer); scene.environment = pm.fromScene(new RoomEnvironment(renderer), .04).texture;
  const key = new THREE.DirectionalLight(0xdde9f2, 2.2); key.position.set(-3, 4, 5); const rim = new THREE.DirectionalLight(COL.blue, 2.6); rim.position.set(4, 1, -3);
  scene.add(key, rim, new THREE.AmbientLight(0x274055, .6));
  const camera = new THREE.PerspectiveCamera(30, 1, .1, 50); camera.position.set(0, .35, 4.6); camera.lookAt(0, 0, 0);
  const out = {};
  for (const it of items) {
    const cap = buildCap(it.edition, it.finish, it.img, it.label); cap.rotation.x = -.08; scene.add(cap); out[it.id] = [];
    for (let f = 0; f < frames; f++) { cap.rotation.y = -.55 + f / frames * Math.PI * 2; renderer.render(scene, camera); out[it.id].push(canvas.toDataURL('image/jpeg', .82)); }
    scene.remove(cap); await new Promise(r => setTimeout(r, 0));
  }
  renderer.dispose(); pm.dispose();
  return out;
}
