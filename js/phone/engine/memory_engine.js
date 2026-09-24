import { Config } from '../phone_config.js';
import { PhoneAPI } from '../phone_api.js';
import { PhoneUI } from '../phone_ui.js';

import * as Three from 'https://esm.sh/three@0.160.0';
import { TrackballControls } from 'https://esm.sh/three@0.160.0/examples/jsm/controls/TrackballControls.js';

function ringLayout(items, hash) {
  const placed=[];
  for(const item of [...items].sort((a,b)=>b.radius-a.radius||a.id.localeCompare(b.id))){
    if(item.core){placed.push({...item,x:0,y:0,z:0});continue;}
    let state=Math.floor(hash(item.id,137)*0xffffffff)||1;
    const random=()=>{state^=state<<13;state^=state>>>17;state^=state<<5;return (state>>>0)/4294967296;};
    let candidate;
    for(let attempt=0;attempt<600;attempt++){
      const radius=Math.sqrt(155**2+random()*(230**2-155**2))+(attempt>450?(attempt-450)*.25:0);
      const angle=random()*Math.PI*2;
      candidate={...item,x:Math.cos(angle)*radius,y:Math.sin(angle)*radius,z:(random()-.5)*7};
      if(placed.every(p=>p.core||Math.hypot(p.x-candidate.x,p.y-candidate.y)>=(p.radius+item.radius)*.6+3))break;
    }
    placed.push(candidate);
  }
  return placed;
}

function starAccents(T, scene) {
  const geometry = new T.PlaneGeometry(2, 2);
  const material = (uniforms, vertexShader, fragmentShader) => new T.ShaderMaterial({
    uniforms, vertexShader, fragmentShader, transparent: true, depthWrite: false, depthTest: false, toneMapped: false
  });
  const ring = new T.Mesh(geometry, material(
    { uAlpha: { value: 0 }, uColor: { value: new T.Color("#e4eaff") } },
    "varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
    `varying vec2 vUv; uniform float uAlpha; uniform vec3 uColor;
     void main(){float d=length(vUv-.5)*2.; float rim=exp(-pow((d-.82)/.025,2.));
       float soft=exp(-pow((d-.82)/.09,2.));gl_FragColor=vec4(uColor,(rim*.7+soft*.3)*uAlpha);}`
  ));
  const meteor = new T.Mesh(geometry, material(
    { uHead: { value: new T.Vector2() }, uViewport: { value: new T.Vector2(1, 1) }, uAlpha: { value: 0 }, uLength: { value: 64 }, uDirection: { value: new T.Vector2(0.86, 0.51) } },
    `varying vec2 vUv; uniform vec2 uHead,uViewport,uDirection; uniform float uLength;
     void main(){vUv=uv;vec2 normal=vec2(-uDirection.y,uDirection.x);
       vec2 p=uHead+uDirection*(uv.x-1.)*uLength+normal*(uv.y-.5)*8.;
       gl_Position=vec4(p/uViewport*vec2(2.,-2.)+vec2(-1.,1.),0.,1.);}`,
    `varying vec2 vUv; uniform float uAlpha;
     void main(){float tail=pow(vUv.x,2.)*(1.-smoothstep(.95,1.,vUv.x));
       float thin=exp(-pow((vUv.y-.5)*16.,2.));float glow=exp(-pow((vUv.y-.5)*5.,2.));
       gl_FragColor=vec4(.93,.92,1.,(thin*.8+glow*.2)*tail*uAlpha);}`
  ));
  meteor.material.side = T.DoubleSide; ring.renderOrder = 80; meteor.renderOrder = 81;
  ring.frustumCulled = meteor.frustumCulled = false; ring.visible = meteor.visible = false;
  scene.add(ring, meteor);
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let pulse = null, meteorStart = null, nextMeteor = 4 + Math.random() * 3, origin = { x: 0, y: 0 };
  return {
    pulse(sprite, t) { pulse = { sprite, start: t }; },
    clear() { pulse = null; ring.visible = false; },
    update(t, expanded, camera, w, h, quiet) {
      ring.visible = false; meteor.visible = false;
      if (!expanded || reduceMotion.matches) { pulse = null; meteorStart = null; nextMeteor = t + 12; return; }
      if (pulse) {
        const age = (t - pulse.start) / 1.05, s = pulse.sprite;
        if (age >= 1 || !s.body.visible) pulse = null;
        else {
          ring.visible = true; ring.position.copy(s.body.position); ring.quaternion.copy(camera.quaternion);
          ring.scale.setScalar((s.displayRadius||s.r) * (1 + 1.15 * (1 - Math.pow(1 - age, 2))) / 0.82);
          ring.material.uniforms.uAlpha.value = 0.36 * Math.sin(Math.PI * Math.sqrt(age)) * Math.pow(1 - age, 0.65);
          const color = s.body.material.uniforms?.uColor?.value;
          if (color?.isVector3) ring.material.uniforms.uColor.value.setRGB(0.4 + 0.6 * color.x, 0.4 + 0.6 * color.y, 0.4 + 0.6 * color.z);
          else ring.material.uniforms.uColor.value.set("#e4eaff");
        }
      }
      if (meteorStart === null && t >= nextMeteor && !quiet) {
        meteorStart = t; origin = { x: w * (0.08 + Math.random() * 0.45), y: h * (0.12 + Math.random() * 0.34) };
        meteor.material.uniforms.uLength.value = Math.min(115, w * 0.29);
      }
      if (meteorStart !== null) {
        const age = (t - meteorStart) / 1.5;
        if (age >= 1) { meteorStart = null; nextMeteor = t + 14 + Math.random() * 10; return; }
        meteor.visible = true;
        const u = meteor.material.uniforms, travel = Math.min(220, w * 0.56) * age;
        u.uViewport.value.set(w, h); u.uHead.value.set(origin.x + travel * 0.86, origin.y + travel * 0.51);
        u.uAlpha.value = 0.65 * Math.pow(Math.sin(Math.PI * age), 0.8) * (quiet ? 0.3 : 1);
      }
    }
  };
}

function orbitFor(item, hash) {
  if (item.core) return { radius: 0, phase: 0, tilt: 0, node: 0, rate: 0 };
  const radius = 115 + 140 * Math.pow(hash(item.id, 171), .8);
  const planar = hash(item.id, 172) < .6;
  return {
    radius, phase: hash(item.id, 173) * Math.PI * 2,
    tilt: planar ? .85 + hash(item.id, 174) * .3 : .15 + hash(item.id, 174) * 2.6,
    node: planar ? .22 + hash(item.id, 175) * .2 : hash(item.id, 175) * Math.PI * 2,
    rate: Math.pow(170 / radius, 1.5) * (.75 + hash(item.id, 176) * .8),
  };
}

function orbitPosition(orbit, time, out) {
  const angle = orbit.phase + time * orbit.rate;
  const x = Math.cos(angle) * orbit.radius;
  const y = Math.sin(angle) * orbit.radius;
  const cy = y * Math.cos(orbit.tilt);
  return out.set(x * Math.cos(orbit.node) - cy * Math.sin(orbit.node), x * Math.sin(orbit.node) + cy * Math.cos(orbit.node), y * Math.sin(orbit.tilt));
}

function lensDust(T) {
  const geometry = new T.BufferGeometry();
  geometry.setAttribute("position", new T.Float32BufferAttribute(new Float32Array(12), 3));
  geometry.setAttribute("aSeed", new T.Float32BufferAttribute([0.13, 0.38, 0.67, 0.91], 1));
  const material = new T.ShaderMaterial({
    transparent: true, depthWrite: false, depthTest: false, blending: T.NormalBlending,
    uniforms: { uTime: { value: 0 }, uDpr: { value: 1 } },
    vertexShader: `
      attribute float aSeed; uniform float uTime,uDpr; varying float vAlpha,vSeed;
      void main(){ float cycle=(uTime+aSeed*32.0)/32.0; float phase=fract(cycle); float progress=clamp(phase/.28,0.0,1.0);
        float lane=fract(aSeed*7.13+floor(cycle)*.381); float x=mix(-1.18,1.18,progress); float y=mix(-.75,.75,lane)+.12*sin(progress*3.14159);
        gl_Position=vec4(x,y,0.0,1.0); gl_PointSize=mix(18.0,42.0,aSeed)*uDpr;
        vAlpha=smoothstep(0.0,.18,progress)*(1.0-smoothstep(.75,1.0,progress))*.12; vSeed=aSeed; }`,
    fragmentShader: `
      varying float vAlpha,vSeed;
      void main(){ float r=length(gl_PointCoord-.5)*2.0; float soft=(.82+.18*r*r)*(1.0-smoothstep(.84,1.0,r));
        vec3 color=mix(vec3(.96,.90,.77),vec3(.79,.84,1.0),vSeed); gl_FragColor=vec4(color,soft*vAlpha); }`
  });
  const points = new T.Points(geometry, material);
  points.frustumCulled = false; points.renderOrder = 5;
  return points;
}

function threadMaterial(color, opacity, farFade = .18) {
  const m = new Three.ShaderMaterial({
    transparent: true, depthWrite: false, depthTest: true, blending: Three.NormalBlending,
    uniforms: { uColor: { value: new Three.Color().setRGB(((color>>16)&255)/255,((color>>8)&255)/255,(color&255)/255) }, uOpacity: { value: opacity }, uFar: { value: farFade } },
    vertexShader: `varying float vDepth;void main(){vec4 p=modelViewMatrix*vec4(position,1.);vDepth=-p.z;gl_Position=projectionMatrix*p;}`,
    fragmentShader: `precision highp float;varying float vDepth;uniform vec3 uColor;uniform float uOpacity;uniform float uFar;void main(){float depthFade=mix(1.,uFar,smoothstep(180.,850.,vDepth));gl_FragColor=vec4(uColor,uOpacity*depthFade);}`
  });
  Object.defineProperty(m, "opacity", { get() { return this.uniforms.uOpacity.value; }, set(v) { this.uniforms.uOpacity.value = v; }, configurable: true });
  return m;
}

function lightMaterial(rgb, { halo = false, core = false, stroke = null } = {}) {
  const material = new Three.ShaderMaterial({
    transparent: true, depthWrite: false, depthTest: false, blending: Three.NormalBlending,
    uniforms: { uColor: { value: new Three.Vector3(...rgb.map((c) => c / 255)) }, uOpacity: { value: 1 }, uStroke: { value: new Three.Vector3(...(stroke || rgb).map((c) => c / 255)) }, uRadiusPx: { value: 10 }, uGain: { value: 1 }, uInner: { value: 0.55 }, uTime: { value: 0 }, uCore: { value: core ? 1 : 0 } },
    vertexShader: `varying vec2 vDisc; void main() { vDisc = uv * 2.0 - 1.0; vec4 center = modelViewMatrix * vec4(0.0,0.0,0.0,1.0); vec2 scale = vec2(length(modelMatrix[0].xyz),length(modelMatrix[1].xyz)); center.xy += position.xy * scale; gl_Position = projectionMatrix * center; }`,
    fragmentShader: `
      precision highp float; varying vec2 vDisc; uniform vec3 uColor,uStroke; uniform float uOpacity,uInner,uTime,uCore,uGain,uRadiusPx;
      void main() { float r = length(vDisc); float pixel = max(fwidth(r),0.0001);
        ${halo ? `float outside = max(0.0,r-uInner); float width = max(0.08,1.0-uInner); float x = outside/width; float tight = exp(-x*x*44.0); float broad = exp(-x*x*5.8); float edge = 1.0-smoothstep(0.82,1.0,r); float inside = smoothstep(uInner*0.45,uInner,r); float alpha = (0.38*tight+0.20*broad)*edge*inside*uGain; gl_FragColor=vec4(uColor,alpha*uOpacity);` : `float coverage = 1.0-smoothstep(0.965-pixel*0.6,0.965+pixel*0.6,r); float rimWidth = max(0.016,pixel*0.65); float ring = exp(-pow((r-0.941)/rimWidth,2.0)); float angle = atan(vDisc.y,vDisc.x); float quiet = 0.88+0.12*sin(angle*2.0+uTime*0.24); float rimPx=1.15*smoothstep(0.0,12.0,uRadiusPx); float strokeWidth=min(.45,rimPx/uRadiusPx); float border=smoothstep(.965-strokeWidth-pixel*.3,.965-strokeWidth+pixel*.3,r); vec3 color = ${stroke ? "mix(uColor,uStroke,border)" : "mix(uColor,vec3(1.0),ring*0.48*quiet)"}; gl_FragColor=vec4(color,coverage*uOpacity);`}
      }`
  });
  material.rotation = 0; material.sizeAttenuation = true;
  Object.defineProperty(material, "opacity", { get() { return this.uniforms.uOpacity.value; }, set(value) { this.uniforms.uOpacity.value = value; }, configurable: true });
  return material;
}

class DisplayColor extends Three.Color {
  setHex(value){ return super.setHex(value, Three.LinearSRGBColorSpace); }
  setStyle(value){ return super.setStyle(value, Three.LinearSRGBColorSpace); }
}
const THREE = { ...Three, Color: DisplayColor, OrbitControls: TrackballControls };
const Q = { hiNeg: [218, 161, 124], hiPos: [233.67977, 213.920617, 179.051499], loNeg: [190, 194, 236], loPos: [195, 167, 222] };
const FINISH = { hiNeg: { stroke: [230, 182, 137] }, hiPos: { stroke: [252.639065, 229.741372, 188.525637] }, loNeg: { stroke: [203, 218, 250] }, loPos: { stroke: [215, 192, 236] } };
function nodeFinish(n) { return FINISH[(+n.arousal >= 0.5 ? "hi" : "lo") + (+n.valence >= 0 ? "Pos" : "Neg")]; }
const BLUE = [200, 214, 251]; const R5 = 10, STEP = 0.7;
function impRadius(i) { return R5 * Math.pow(STEP, 5 - Math.max(1, Math.min(5, i))); }
const SIZE = { core: R5 * 2, baseline: R5 * 1.05, wiki: impRadius(4) };
function lerp(a, b, t) { return a + (b - a) * t; }
function mix(c1, c2, t) { return [lerp(c1[0], c2[0], t), lerp(c1[1], c2[1], t), lerp(c1[2], c2[2], t)]; }
function cssRgb(c) { return "rgb(" + (c[0] | 0) + "," + (c[1] | 0) + "," + (c[2] | 0) + ")"; }
function cssA(c, a) { return "rgba(" + (c[0] | 0) + "," + (c[1] | 0) + "," + (c[2] | 0) + "," + a + ")"; }
function hexInt(c) { return (c[0] | 0) << 16 | (c[1] | 0) << 8 | (c[2] | 0); }
function emotionColor(v, a) {
  const vv = Number.isFinite(+v) ? +v : 0; const aa = Number.isFinite(+a) ? +a : 0;
  if (aa >= 0.5) return (vv >= 0 ? Q.hiPos : Q.hiNeg).slice();
  return (vv >= 0 ? Q.loPos : Q.loNeg).slice();
}
function nodeColor(n) { return n.kind === "event" ? emotionColor(n.valence, n.arousal) : BLUE.slice(); }
function nodeRadius(n) { return n.kind === "core" ? SIZE.core : n.kind === "baseline" ? SIZE.baseline : n.kind === "wiki" ? SIZE.wiki : impRadius(n.importance); }
function hash(str, seed) {
  let h = 2166136261 ^ (seed || 0);
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return (h >>> 0) % 1e5 / 1e5;
}
function layout(nodes, links, softlinks) {
  const idx = Object.create(null);
  nodes.forEach((n, i) => {
    idx[n.id] = i; const h1 = hash(n.id, 1), h2 = hash(n.id, 2), h3 = hash(n.id, 3);
    const rr = 30 + h1 * 70, phi = Math.acos(1 - 2 * h2), th = 6.2832 * h3;
    n.x = rr * Math.sin(phi) * Math.cos(th); n.y = rr * Math.cos(phi); n.z = rr * Math.sin(phi) * Math.sin(th);
    n.pinned = n.kind === "core"; if (n.pinned) { n.x = n.y = n.z = 0; }
  });
  const REST_VAR = 0.82; const restOf = (a, b, base, seed) => base * (1 - REST_VAR + 2 * REST_VAR * hash(a + "|" + b, seed));
  const edges = [];
  (links || []).forEach(([a, b]) => { if (idx[a] != null && idx[b] != null) edges.push([idx[a], idx[b], 0.06, restOf(a, b, 60, 59)]); });
  (softlinks || []).forEach(([a, b]) => { if (idx[a] != null && idx[b] != null) edges.push([idx[a], idx[b], 0.022, restOf(a, b, 88, 61)]); });
  const N = nodes.length, REP = 2e3, CENTER = 85e-4;
  const space = nodes.map((n) => n.pinned ? 1 : 0.28 + 1.9 * Math.pow(hash(n.id, 73), 1.6));
  const pull = nodes.map((n) => 0.65 + 0.7 * hash(n.id, 79));
  const radii = nodes.map((n) => n.kind === "core" ? SIZE.core : impRadius(n.importance || 3));
  const fx = new Float64Array(N), fy = new Float64Array(N), fz = new Float64Array(N);
  for (let it = 0; it < 320; it++) {
    fx.fill(0); fy.fill(0); fz.fill(0);
    for (let i = 0; i < N; i++) for (let j = i + 1; j < N; j++) {
      let dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y, dz = nodes[i].z - nodes[j].z;
      const d2 = dx * dx + dy * dy + dz * dz + 12, inv = 1 / Math.sqrt(d2);
      const distance = Math.sqrt(Math.max(0, d2 - 12));
      const f = Math.max(REP * Math.sqrt(space[i] * space[j]) / d2, (radii[i] + radii[j] + 3 - distance) * 0.9);
      dx *= inv; dy *= inv; dz *= inv; fx[i] += dx * f; fy[i] += dy * f; fz[i] += dz * f; fx[j] -= dx * f; fy[j] -= dy * f; fz[j] -= dz * f;
    }
    for (const [i, j, k, rest] of edges) {
      const dx = nodes[j].x - nodes[i].x, dy = nodes[j].y - nodes[i].y, dz = nodes[j].z - nodes[i].z;
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz) + 0.01, f = k * (dist - rest) / dist;
      fx[i] += dx * f; fy[i] += dy * f; fz[i] += dz * f; fx[j] -= dx * f; fy[j] -= dy * f; fz[j] -= dz * f;
    }
    const cool = Math.max(0.15, 1 - it / 340);
    for (let i = 0; i < N; i++) {
      if (nodes[i].pinned) { nodes[i].x = nodes[i].y = nodes[i].z = 0; continue; }
      fx[i] -= nodes[i].x * CENTER * pull[i]; fy[i] -= nodes[i].y * CENTER * pull[i]; fz[i] -= nodes[i].z * CENTER * pull[i];
      nodes[i].x += Math.max(-12, Math.min(12, fx[i])) * cool; nodes[i].y += Math.max(-12, Math.min(12, fy[i])) * cool; nodes[i].z += Math.max(-12, Math.min(12, fz[i])) * cool;
    }
  }
}
const _bodyCache = {};
function bodyTexture(col) {
  const key = (col[0] | 0) + "," + (col[1] | 0) + "," + (col[2] | 0);
  if (_bodyCache[key]) return _bodyCache[key];
  const S = 512, cv = document.createElement("canvas"); cv.width = cv.height = S;
  const x = cv.getContext("2d"), c = S / 2, g = x.createRadialGradient(c, c, 0, c, c, c);
  const solid = cssRgb(col), rim = cssRgb(mix(col, [255, 255, 255], 0.72));
  g.addColorStop(0, solid); g.addColorStop(0.91, solid); g.addColorStop(0.945, rim); g.addColorStop(0.978, cssA(col, 1)); g.addColorStop(1, cssA(col, 0));
  x.fillStyle = g; x.fillRect(0, 0, S, S);
  const img = x.getImageData(0, 0, S, S), d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] < 250) { d[i] = col[0]; d[i + 1] = col[1]; d[i + 2] = col[2]; }
    if (d[i + 3] < 1) d[i + 3] = 1;
  }
  x.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(cv); t.generateMipmaps = false; t.minFilter = THREE.LinearFilter; _bodyCache[key] = t; return t;
}
const _NOISE_GLSL = [
  "vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}", "vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}", "vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}", "vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}",
  "float snoise(vec3 v){ const vec2 C=vec2(1.0/6.0,1.0/3.0); const vec4 D=vec4(0.0,0.5,1.0,2.0); vec3 i=floor(v+dot(v,C.yyy)); vec3 x0=v-i+dot(i,C.xxx); vec3 g=step(x0.yzx,x0.xyz); vec3 l=1.0-g; vec3 i1=min(g.xyz,l.zxy); vec3 i2=max(g.xyz,l.zxy); vec3 x1=x0-i1+C.xxx; vec3 x2=x0-i2+C.yyy; vec3 x3=x0-D.yyy; i=mod289(i); vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0)); float n_=0.142857142857; vec3 ns=n_*D.wyz-D.xzx; vec4 j=p-49.0*floor(p*ns.z*ns.z); vec4 x_=floor(j*ns.z); vec4 y_=floor(j-7.0*x_); vec4 x=x_*ns.x+ns.yyyy; vec4 y=y_*ns.x+ns.yyyy; vec4 h=1.0-abs(x)-abs(y); vec4 b0=vec4(x.xy,y.xy); vec4 b1=vec4(x.zw,y.zw); vec4 s0=floor(b0)*2.0+1.0; vec4 s1=floor(b1)*2.0+1.0; vec4 sh=-step(h,vec4(0.0)); vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy; vec4 a1=b1.xzyw+s1.xzyw*sh.zzww; vec3 p0=vec3(a0.xy,h.x); vec3 p1=vec3(a0.zw,h.y); vec3 p2=vec3(a1.xy,h.z); vec3 p3=vec3(a1.zw,h.w); vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3))); p0*=norm.x; p1*=norm.y; p2*=norm.z; p3*=norm.w; vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0); m=m*m; return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3))); }",
  "float fbm(vec3 p){ float f=0.0,a=0.5; for(int i=0;i<4;i++){ f+=a*snoise(p); p*=2.03; a*=0.55; } return f; }"
].join("\n");
function coreBodyMaterial(T) {
  return new T.ShaderMaterial({
    transparent: true, depthWrite: false, depthTest: false,
    uniforms: { uTime: { value: 0 }, uOpacity: { value: 1 }, uStudy: { value: 1 } },
    vertexShader: "varying vec3 vN; varying vec3 vV; varying vec3 vP;\nvoid main(){ vP=normalize(position); vec4 mv=modelViewMatrix*vec4(position,1.0);\n  vN=normalize(normalMatrix*normal); vV=-mv.xyz; gl_Position=projectionMatrix*mv; }",
    fragmentShader: _NOISE_GLSL + "\nuniform float uTime; uniform float uOpacity; uniform float uStudy;\nvarying vec3 vN; varying vec3 vV; varying vec3 vP;\nvoid main(){\n  vec3 col = vec3(0.784,0.839,0.984);\n  float rim = pow(1.0-max(0.0,dot(normalize(vN),normalize(vV))),3.2);\n  float flow = 0.5+0.5*sin(vP.y*5.0+vP.x*3.0-uTime*0.35);\n  col = mix(col,vec3(0.88,0.93,1.0),uStudy*rim*(0.20+0.12*flow));\n  gl_FragColor = vec4(col, uOpacity);\n}"
  });
}
function coreAuraMaterial(T, o) {
  const c = new T.Color(o.col); const hsl = {}; c.getHSL(hsl);
  const cT = new T.Color().setHSL(hsl.h, Math.min(1, hsl.s * 2.6 + 0.28), Math.max(0.34, hsl.l - 0.16));
  return new T.ShaderMaterial({
    transparent: true, depthWrite: false, depthTest: false,
    uniforms: { uTime: { value: 0 }, uOpacity: { value: 1 }, uStudy: { value: 1 }, uAmp: { value: o.amp }, uFreq: { value: o.freq }, uSpeed: { value: o.speed }, uAlpha: { value: o.alpha }, uBase: { value: o.base }, uPhase: { value: o.phase }, uUp: { value: o.up }, uTip: { value: o.tip }, uSat: { value: o.sat == null ? 0.8 : o.sat }, uRim: { value: o.rim == null ? 0 : o.rim }, uRimPow: { value: o.rimPow == null ? 1.6 : o.rimPow }, uCol: { value: new T.Vector3(c.r, c.g, c.b) }, uColTip: { value: new T.Vector3(cT.r, cT.g, cT.b) } },
    vertexShader: "precision highp float;\n" + _NOISE_GLSL + "\nuniform float uTime,uAmp,uFreq,uSpeed,uBase,uPhase,uUp,uStudy;\nvarying float vLobe; varying float vRim;\nvoid main(){\n  vec3 vP = normalize(position);\n  vRim = 1.0 - abs(normalize(normalMatrix * vP).z);\n  float n1 = snoise(vP*uFreq + vec3(0.0, -uTime*uSpeed, uPhase));\n  float n2 = snoise(vP*(uFreq*2.1) + vec3(uTime*uSpeed*0.5, -uTime*uSpeed*1.25, uPhase*1.7+3.0));\n  float shared = snoise(vP*1.55 + vec3(0.0,-uTime*0.13,2.4));\n  float detail = snoise(vP*3.2 + vec3(uTime*0.035,-uTime*0.17,1.2));\n  float oldField=0.72*n1+0.28*n2;\n  float lobe = 0.5 + 0.5*mix(oldField,0.82*shared+0.18*detail,uStudy);\n  lobe = pow(clamp(lobe,0.0,1.0), 2.55);\n  float upB = 1.0 + uUp*max(vP.y, 0.0);\n  vLobe = clamp(lobe*upB, 0.0, 1.4);\n  vec3 p = position * (uBase + uAmp*lobe*upB*mix(1.0,0.82,uStudy));\n  gl_Position = projectionMatrix * modelViewMatrix * vec4(p,1.0);\n}",
    fragmentShader: "precision highp float;\nuniform float uAlpha,uOpacity,uTip,uSat,uRim,uRimPow,uStudy; uniform vec3 uCol,uColTip;\nvarying float vLobe; varying float vRim;\nvoid main(){\n  float fade = 1.0 - uTip*smoothstep(0.15, 1.1, vLobe);\n  fade *= mix(1.0, pow(clamp(vRim,0.0,1.0), uRimPow), uRim);\n  vec3 col = mix(uCol, uColTip, uSat*smoothstep(0.20, 1.00, vLobe));\n  fade *= mix(1.0,1.0-smoothstep(0.72,1.0,vRim),uStudy*0.94);\n  gl_FragColor = vec4(col, uAlpha*fade*uOpacity);\n}"
  });
}
var CORE_AURA = [
  { amp: 0.4, freq: 0.55, speed: 0.16, alpha: 0.38, base: 1.012, col: "#b0c6fb", up: 0.45, tip: 0.95, phase: 7.3, swirl: 0.04, sat: 0.85, rim: 0.75, rimPow: 1.35 },
  { amp: 0.13, freq: 0.85, speed: 0.26, alpha: 0.95, base: 1, col: "#d4e0fd", up: 0.25, tip: 0.55, phase: 1.1, swirl: -0.07, sat: 0.45, rim: 1, rimPow: 1.5 },
  { amp: 0.15, freq: 2.4, speed: 0.42, alpha: 0.62, base: 1.028, col: "#b8cfff", up: 0.78, tip: 0.8, phase: 4.7, swirl: 0.13, sat: 1, rim: 1, rimPow: 2.1 }
];
const _haloTex = {};
function haloTexture(kind) {
  if (_haloTex[kind]) return _haloTex[kind];
  const S = 512, cv = document.createElement("canvas"); cv.width = cv.height = S;
  const x = cv.getContext("2d"), c = S / 2, g = x.createRadialGradient(c, c, 0, c, c, c);
  if (kind === "core") {
    g.addColorStop(0, "rgba(255,255,255,0.00)"); g.addColorStop(0.3, "rgba(255,255,255,0.26)"); g.addColorStop(0.41, "rgba(255,255,255,0.44)"); g.addColorStop(0.49, "rgba(255,255,255,0.36)"); g.addColorStop(0.58, "rgba(255,255,255,0.24)"); g.addColorStop(0.7, "rgba(255,255,255,0.155)"); g.addColorStop(0.85, "rgba(255,255,255,0.072)");
  } else {
    g.addColorStop(0, "rgba(255,255,255,0.00)"); g.addColorStop(0.48, "rgba(255,255,255,0.22)"); g.addColorStop(0.58, "rgba(255,255,255,0.34)"); g.addColorStop(0.76, "rgba(255,255,255,0.18)");
  }
  g.addColorStop(1, "rgba(255,255,255,0)"); x.fillStyle = g; x.fillRect(0, 0, S, S);
  const img = x.getImageData(0, 0, S, S), d = img.data;
  for (let i = 0; i < d.length; i += 4) { d[i] = 255; d[i + 1] = 255; d[i + 2] = 255; if (d[i + 3] < 1) d[i + 3] = 1; }
  x.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(cv); t.generateMipmaps = false; t.minFilter = THREE.LinearFilter; _haloTex[kind] = t; return _haloTex[kind];
}
const SM_OFF = new Set();
function createRenderer(container, opts) {
  opts = opts || {};
  const T = THREE;
  let study = opts.study !== false;
  let familyIds = null, familyEpoch = 0;
  let shape = "free", chosenShape = "free", shapeMix = 0, ringMix = 0, spiralAngle = 0, spiralPaused = false;
  
  let W = window.innerWidth, H = window.innerHeight;
  
  const scene = new T.Scene();
  const camera = new T.PerspectiveCamera(opts.expanded ? 78 : 66, W / H, 0.5, 6e3);
  let targetFov = opts.expanded ? 78 : 66;
  const DEF_POS = new T.Vector3(0, 0, 230);
  const EXP_POS = new T.Vector3(149, 62, 620);
  const CORE_POS = new T.Vector3(0, 0, 0);
  const overviewPosition = () => expanded ? shape !== "free" ? new T.Vector3(0,0,700) : EXP_POS : DEF_POS;
  camera.position.copy(opts.expanded ? EXP_POS : DEF_POS);
  const renderer = new T.WebGLRenderer({ antialias: true, alpha: true });
  renderer.outputColorSpace = T.LinearSRGBColorSpace;
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  renderer.setSize(W, H);
  
  renderer.domElement.style.cssText = "display:block;width:100%;height:100%;position:absolute;top:0;left:0;z-index:0;";
  container.appendChild(renderer.domElement);
  
  let idleSpin = true, _spinLastT = 0, _tNow = 0;
  const _nowSec = () => _tNow;
  const _spinAxis = new T.Vector3(), _spinOff = new T.Vector3(), _spinH = new T.Vector3();
  const controls = new T.OrbitControls(camera, renderer.domElement);
  controls.staticMoving = false; controls.dynamicDampingFactor = 0.12; controls.rotateSpeed = 2; controls.noPan = true; controls.minDistance = 40; controls.maxDistance = 820; controls.enablePan = false; controls.enabled = !!opts.expanded;
  let interacting = false, _spinResumeAt = 0;
  controls.addEventListener("start", () => { flying = false; interacting = true; });
  controls.addEventListener("end", () => { interacting = false; _spinResumeAt = _nowSec() + 0.8; });
  
  const haloView = new T.Vector3();
  const edgeA = new T.Vector3(), edgeB = new T.Vector3(), edgeDir = new T.Vector3();
  const raycaster = new T.Raycaster();
  const mouse = new T.Vector2();
  let nodes = [], links = [], softlinks = [], sprites = [], dustLayers = [], dustPoints = null, lineSeg = null, softSeg = null, hlLines = null, adj = Object.create(null), focusedNeighbors = null;
  const dustScale = () => renderer.domElement.height * 0.5 / Math.tan(camera.fov * Math.PI / 360);
  let expanded = !!opts.expanded, focused = null, flying = false, flightRate = 0.08, maxAct = 1, raf = 0, alive = true, t0 = performance.now ? null : 0, _tAcc = 0, _rawLast = 0;
  const target = DEF_POS.clone(), look = new T.Vector3(0, 0, 0), tLook = new T.Vector3(0, 0, 0);
  const spiralView = new T.Vector3(), ringView=new T.Vector3();
  const ORBIT_PATHS = 6;
  let orbitLines = null;
  
  function arrangeSpiral() {
    const members = sprites.filter((s) => !familyIds || familyIds.has(s.n.id));
    const rings=new Map(ringLayout(members.map(s=>({id:s.n.id,radius:s.r,core:s.n.kind==="core"})),hash).map(p=>[p.id,p]));
    sprites.forEach((s) => {
      const rp=rings.get(s.n.id);s.ring=new T.Vector3(rp?.x||0,rp?.y||0,rp?.z||0);
      s.orbit = orbitFor({id:s.n.id,core:s.n.kind === "core"},hash);
    });
    if (orbitLines) { scene.remove(orbitLines); orbitLines.geometry.dispose(); orbitLines.material.dispose(); }
    const points = [], point = new T.Vector3();
    const drawn = members.filter((s) => s.orbit.radius && s.r >= impRadius(5)).sort((a, b) => b.r - a.r || a.n.id.localeCompare(b.n.id)).slice(0, ORBIT_PATHS);
    for (const s of drawn) {
      for (let i = 0; i < 128; i++) {
        for (const step of [i, i + 1]) {
          orbitPosition({...s.orbit, phase: 0, rate: 1}, step / 128 * Math.PI * 2, point);
          points.push(point.x, point.y, point.z);
        }
      }
    }
    const geometry = new T.BufferGeometry();
    geometry.setAttribute("position", new T.Float32BufferAttribute(points, 3));
    orbitLines = new T.LineSegments(geometry, threadMaterial(15129798, 0, .5));
    orbitLines.visible = false;
    scene.add(orbitLines);
  }
  
  const foreground = lensDust(T);
  if (foreground) scene.add(foreground);
  const accents = starAccents(T, scene);
  
  function flyTo(pos, center, rate) { target.copy(pos); tLook.copy(center || CORE_POS); flightRate = rate || 0.08; flying = true; }
  
  function clear() {
    accents.clear();
    sprites.forEach((s) => { scene.remove(s.body); scene.remove(s.glow); if (s.shells) s.shells.forEach((sh) => scene.remove(sh.mesh)); });
    sprites = [];
    dustLayers.forEach((d) => { scene.remove(d); d.geometry.dispose(); d.material.dispose(); });
    dustLayers = []; dustPoints = null;
    if (lineSeg) scene.remove(lineSeg); if (softSeg) scene.remove(softSeg);
    if (hlLines) { scene.remove(hlLines); hlLines.geometry.dispose(); hlLines.material.dispose(); hlLines = null; }
  }
  
  function build() {
    clear();
    maxAct = Math.max(1, ...nodes.map((n) => n.activation || 0));
    nodes.forEach((n) => {
      const col = nodeColor(n), r = nodeRadius(n);
      const isCore = n.kind === "core";
      let body, coreMat = null, shells = null;
      if (isCore) {
        coreMat = coreBodyMaterial(T);
        body = new T.Mesh(new T.SphereGeometry(r * 1, 64, 44), coreMat);
        body.position.set(n.x, n.y, n.z); body.renderOrder = 2; body.userData = n;
        shells = CORE_AURA.map((o) => {
          const m = coreAuraMaterial(T, o);
          const sh = new T.Mesh(new T.SphereGeometry(r * 1, 72, 48), m);
          sh.position.set(n.x, n.y, n.z); sh.renderOrder = 2; scene.add(sh);
          return { mesh: sh, mat: m, swirl: o.swirl };
        });
      } else {
        const bMat = new T.SpriteMaterial({ map: bodyTexture(col), transparent: true, depthWrite: false, depthTest: false });
        body = new T.Sprite(bMat); body.position.set(n.x, n.y, n.z);
        const bScale = r * 2.05; body.scale.set(bScale, bScale, 1); body.renderOrder = 2; body.userData = n;
      }
      const gCol = isCore ? 10466536 : hexInt(col);
      const gMat = new T.SpriteMaterial({ map: haloTexture(isCore ? "core" : "normal"), color: new T.Color(gCol), transparent: true, depthWrite: false, depthTest: false, blending: T.NormalBlending, opacity: 0 });
      const glow = new T.Sprite(gMat); glow.position.set(n.x, n.y, n.z); glow.renderOrder = 1;
      scene.add(glow); scene.add(body);
      
      const oldBody = body.material, oldGlow = glow.material;
      const finish = n.kind === "event" ? nodeFinish(n) : null;
      const nextBody = isCore ? oldBody : lightMaterial(col, { stroke: finish?.stroke });
      const nextGlow = lightMaterial(isCore ? [159, 180, 232] : col, { halo: true, core: isCore });
      body.material = study ? nextBody : oldBody; glow.material = study ? nextGlow : oldGlow;
      if (coreMat) coreMat.uniforms.uStudy.value = study ? 1 : 0;
      if (shells) shells.forEach((sh) => sh.mat.uniforms.uStudy.value = study ? 1 : 0);
      const sp = { oldBody, oldGlow, nextBody, nextGlow, n, body, glow, r, coreMat, shells, base: new T.Vector3(n.x, n.y, n.z), ph: hash(n.id, 9) * 6.28, ph2: hash(n.id, 11) * 6.28 };
      sprites.push(sp);
    });
    const pos = Object.create(null); sprites.forEach((s) => pos[s.n.id] = s.body.position);
    adj = Object.create(null);
    function addAdj(a, b) { (adj[a] || (adj[a] = new Set())).add(b); (adj[b] || (adj[b] = new Set())).add(a); }
    (links || []).forEach(([a, b]) => addAdj(a, b)); (softlinks || []).forEach(([a, b]) => addAdj(a, b));
    function seg(list, color, op) {
      const pts = [];
      (list || []).forEach(([a, b]) => { const A = pos[a], B = pos[b]; if (A && B) { pts.push(A.x, A.y, A.z, B.x, B.y, B.z); } });
      if (!pts.length) return null;
      const geo = new T.BufferGeometry(); geo.setAttribute("position", new T.Float32BufferAttribute(pts, 3));
      const m = threadMaterial(color, op); const ls = new T.LineSegments(geo, m);
      ls.userData.edges = list.filter(([a, b]) => pos[a] && pos[b]); scene.add(ls); return ls;
    }
    softSeg = seg(softlinks, 10985410, 0.07); lineSeg = seg(links, 15129798, 0.5);
    dustPoints = makeDust(1600, 2200); scene.add(dustPoints); dustLayers.push(dustPoints);
  }
  
  const DUST_PALETTE = [[245, 228, 198], [190, 194, 236]]; const DUST_QUOTA = [297, 58, 35, 24, 9]; const DUST_BANDS = [[0.8, 1.4], [1.4, 2.2], [2.2, 3.5], [3.5, 5], [5, 7]]; const DUST_SCALE_REF = 246.4, DUST_DISTANCE_REF = 1250;
  function makeDust(count, radius) {
    const pos = new Float32Array(count * 3), col = new Float32Array(count * 3), mag = new Float32Array(count), rnd = new Float32Array(count * 4);
    const qSum = DUST_QUOTA.reduce((a, b) => a + b, 0); let acc = 0; const cut = DUST_QUOTA.map((q) => (acc += q) / qSum);
    for (let i = 0; i < count; i++) {
      const ct = 2 * hash("d" + i, 3) - 1, st = Math.sqrt(1 - ct * ct), ph = 6.283185 * hash("d" + i, 5);
      const r = radius * Math.cbrt(0.02 + 0.98 * hash("d" + i, 7));
      let X = r * st * Math.cos(ph), Y = r * st * Math.sin(ph), Z = r * ct;
      if (hash("band" + i, 2) < 0.63) {
        const angle = ph + 0.32 * Math.sin(ph * 3); const radial = radius * (0.5 + 0.5 * hash("band" + i, 4)); const thickness = (hash("band" + i, 6) + hash("band" + i, 8) - 1) * 180;
        X = radial * Math.cos(angle); Z = radial * Math.sin(angle); Y = 0.52 * X + 0.16 * Z + 90 * Math.sin(angle * 3) + thickness;
      }
      pos[i * 3] = X; pos[i * 3 + 1] = Y; pos[i * 3 + 2] = Z;
      const P = DUST_PALETTE[Math.floor(hash("d" + i, 13) * DUST_PALETTE.length) % DUST_PALETTE.length];
      col[i * 3] = P[0] / 255; col[i * 3 + 1] = P[1] / 255; col[i * 3 + 2] = P[2] / 255;
      for (let k = 0; k < 4; k++) rnd[i * 4 + k] = hash("r" + i, 17 + k);
      const u = hash("m" + i, 23); let b = 0; while (b < 4 && u > cut[b]) b++;
      const e = DUST_BANDS[b], tgt = e[0] + (e[1] - e[0]) * hash("m" + i, 29); mag[i] = tgt * DUST_DISTANCE_REF / DUST_SCALE_REF;
    }
    const g = new T.BufferGeometry(); g.setAttribute("position", new T.BufferAttribute(pos, 3)); g.setAttribute("color", new T.BufferAttribute(col, 3)); g.setAttribute("aRnd", new T.BufferAttribute(rnd, 4)); g.setAttribute("aMag", new T.BufferAttribute(mag, 1));
    const m = new T.ShaderMaterial({
      vertexColors: true, transparent: true, depthWrite: false, blending: T.NormalBlending,
      uniforms: { uTime: { value: 0 }, uScale: { value: dustScale() }, uMaxPx: { value: 7 }, uTwSmall: { value: 1.8 }, uTwBig: { value: 5 }, uTwUp: { value: 0.85 }, uTwDn: { value: 0.22 }, uGateLo: { value: 0.55 }, uGateHi: { value: 0.92 }, uDpr: { value: renderer.getPixelRatio() } },
      vertexShader: `attribute vec4 aRnd; attribute float aMag; uniform float uTime, uScale, uMaxPx; uniform float uTwSmall, uTwBig, uTwUp, uTwDn, uGateLo, uGateHi, uDpr; varying vec3 vCol; varying float vTw; void main(){ vCol = color; vec3 pos = position; float wave = dot(position, vec3(.0021, -.0013, .0017)); float drift = uTime * .024; vec3 flow = vec3(cos(wave + drift), sin(wave * .7 - drift), cos(wave * .4 + drift * .6)); pos += flow * (3.0 + 6.0 * aRnd.x); vec4 mv = modelViewMatrix * vec4(pos, 1.0); float ps = aMag * (uScale / max(1.0, -mv.z)); gl_PointSize = min(ps, uMaxPx*uDpr); float t = uTime; float amt = 1.0 - smoothstep(uTwSmall*uDpr, uTwBig*uDpr, ps); float rate = 4.0 + 10.0*aRnd.z; float gs = 0.09 + 0.20*aRnd.w; float gate = smoothstep(uGateLo, uGateHi, sin(t*gs*6.2832 + 6.2832*aRnd.x)); float fast = 0.5 + 0.5*sin(t*rate + 6.2832*aRnd.y); float s = gate * (fast*2.0 - 1.0); vTw = 1.0 + amt * (s > 0.0 ? s*uTwUp : s*uTwDn); gl_Position = projectionMatrix * mv; }`,
      fragmentShader: `precision highp float; varying vec3 vCol; varying float vTw; void main(){ float d = length(gl_PointCoord - vec2(0.5)); gl_FragColor = vec4(vCol * vTw, 1.0-smoothstep(0.40,0.5,d)); }`
    });
    const pts = new T.Points(g, m); pts.frustumCulled = false; return pts;
  }
  
  function animate(ts) {
    if (!alive) return;
    if (t0 == null) { t0 = ts; _rawLast = 0; }
    const _raw = (ts - t0) / 1e3; const frameDt = Math.min(0.05, Math.max(0, _raw - _rawLast)); _tAcc += frameDt; _rawLast = _raw; const t = _tAcc; _tNow = t;
    shapeMix = T.MathUtils.lerp(shapeMix, shape !== "free" ? 1 : 0, 1 - Math.exp(-frameDt / 0.65));
    ringMix=T.MathUtils.lerp(ringMix,shape==="ring"?1:0,1-Math.exp(-frameDt/.65));
    if (shape !== "free" && !spiralPaused && expanded && !focused && !interacting) spiralAngle += frameDt * 0.035;
    if (foreground) { foreground.visible = expanded; foreground.material.uniforms.uTime.value = t; foreground.material.uniforms.uDpr.value = renderer.getPixelRatio(); }
    if (dustPoints) {
      const u = dustPoints.material.uniforms; u.uTime.value = t; u.uScale.value = dustScale(); u.uDpr.value = renderer.getPixelRatio();
      dustPoints.rotation.x = Math.sin(t * 0.021) * 0.045; dustPoints.rotation.y = Math.cos(t * 0.037) * 0.07; dustPoints.rotation.z = t * 0.012;
    }
    sprites.forEach((s) => {
      const n = s.n, heat = Math.min(1, (n.activation || 0) / maxAct);
      let op, sizeMul; const isCore = n.kind === "core";
      if (isCore) { op = 1; sizeMul = 0.82; } else if (n.kind === "wiki" || n.kind === "baseline") { op = 0.68; sizeMul = 0.82; } else { op = 0.7 + 0.1 * heat; sizeMul = 0.78 + 0.12 * heat; }
      const br = 0.5 + 0.5 * Math.sin(t * (isCore ? 1.05 : 1.3) + s.ph);
      const drift = Math.min(4.2, 1.8 + s.r * 0.05);
      s.body.position.set(s.base.x + Math.sin(t * 0.5 + s.ph) * drift, s.base.y + Math.cos(t * 0.44 + s.ph2) * drift, s.base.z + Math.sin(t * 0.38 + s.ph + s.ph2) * drift * 0.8);
      if (s.orbit && shapeMix > 1e-4) {
        const c = Math.cos(spiralAngle), sn = Math.sin(spiralAngle);
        orbitPosition(s.orbit, spiralAngle, spiralView);
        const rx=s.ring.x*c-s.ring.y*sn,ry=s.ring.x*sn+s.ring.y*c;
        const tiltedY=ry*.46-s.ring.z*.888;
        ringView.set(rx*.976-tiltedY*.218,rx*.218+tiltedY*.976,ry*.888+s.ring.z*.46);
        spiralView.lerp(ringView,ringMix);
        s.body.position.lerp(spiralView, shapeMix);
      }
      const shapeScale=T.MathUtils.lerp(1,isCore?3:.6,shapeMix); s.displayRadius=s.r*shapeScale; s.glow.position.copy(s.body.position);
      const bScale = 0.94 + 0.1 * br; const gs = s.displayRadius * 2.05 * (1.64 + 0.18 * sizeMul) * bScale * (isCore ? 1.39 : 1);
      haloView.copy(s.body.position).applyMatrix4(camera.matrixWorldInverse);
      const haloScale = gs; s.glow.scale.set(haloScale, haloScale, 1);
      s.nextGlow.uniforms.uInner.value = s.displayRadius * 2 / haloScale; s.nextGlow.uniforms.uGain.value = 1;
      if (!isCore) s.nextBody.uniforms.uTime.value = t + s.ph;
      const bright = !focused || s === focused || focusedNeighbors && focusedNeighbors.has(n.id);
      const opBreath = isCore ? 0.78 + 0.22 * br : 0.72 + 0.36 * br;
      s.glow.material.opacity = Math.min(1, (bright ? op : op * 0.08) * opBreath);
      if (s.coreMat) {
        s.coreMat.uniforms.uTime.value = t; s.coreMat.uniforms.uOpacity.value = bright ? 1 : 0.12;
        const pulse = 1 + 0.035 * Math.sin(t * 0.9); s.body.scale.setScalar(pulse*shapeScale); s.body.rotation.y = t * 0.07; s.body.rotation.z = Math.sin(t * 0.11) * 0.12;
        if (s.shells) s.shells.forEach((sh) => { sh.mesh.position.copy(s.body.position); sh.mesh.scale.setScalar(pulse*shapeScale); sh.mesh.rotation.z = t * sh.swirl * (study ? 0.18 : 1); sh.mat.uniforms.uTime.value = t; sh.mat.uniforms.uOpacity.value = bright ? 1 : 0.1; });
      } else {
        s.body.scale.set(s.r*2.05*shapeScale,s.r*2.05*shapeScale,1); s.body.material.opacity = bright ? 1 : 0.12;
      }
    });
    const byId = new Map(sprites.map((s) => [s.n.id, s]));
    const fadeStep = 1 - Math.exp(-frameDt / 0.18);
    if (orbitLines) {
      const opacity = (focused ? .22 : .4) * T.MathUtils.smoothstep(shapeMix, .9, 1) * (1 - ringMix);
      orbitLines.material.opacity = opacity; orbitLines.visible = opacity > .001;
    }
    for (const [line, goal] of [[lineSeg, focused ? 0.1 : 0.42], [softSeg, focused ? 0.025 : 0.115], [hlLines, 0.68]]) {
      if (!line) continue;
      line.material.opacity = T.MathUtils.lerp(line.material.opacity, goal * (1 - shapeMix), fadeStep); line.visible = shapeMix < 0.999;
      const attr = line.geometry.attributes.position;
      (line.userData.edges || []).forEach(([a, b], i) => {
        if (familyIds && (!familyIds.has(a) || !familyIds.has(b))) { attr.setXYZ(i * 2, 0, 0, 0); attr.setXYZ(i * 2 + 1, 0, 0, 0); return; }
        const A = byId.get(a), B = byId.get(b); if (!A || !B) return;
        edgeA.copy(A.body.position); edgeB.copy(B.body.position); edgeDir.subVectors(edgeB, edgeA);
        const len = edgeDir.length(); edgeDir.normalize(); const trim = Math.min(1, len / Math.max(1e-3, A.r + B.r));
        edgeA.addScaledVector(edgeDir, A.r * trim); edgeB.addScaledVector(edgeDir, -B.r * trim);
        attr.setXYZ(i * 2, edgeA.x, edgeA.y, edgeA.z); attr.setXYZ(i * 2 + 1, edgeB.x, edgeB.y, edgeB.z);
      });
      attr.needsUpdate = true; line.geometry.computeBoundingSphere();
    }
    if (flying) {
      if (focused) { target.add(spiralView.copy(focused.body.position).sub(tLook)); tLook.copy(focused.body.position); }
      camera.position.lerp(target, flightRate); controls.target.lerp(tLook, flightRate);
      if (camera.position.distanceTo(target) < 4 && controls.target.distanceTo(tLook) < 2) flying = false;
    }
    if (!flying && expanded && !familyIds) {
      const orbitDistance = camera.position.distanceTo(controls.target);
      if (focused && orbitDistance < 440) controls.target.lerp(focused.body.position, 0.07);
      else if (!focused || orbitDistance > 520) controls.target.lerp(CORE_POS, focused ? 0.014 : 0.04);
    }
    if (shape === "free" && idleSpin && !flying && !focused && !interacting && t >= _spinResumeAt) {
      const dt = Math.min(0.033, Math.max(0, t - _spinLastT)); const SPIN_RATE = 0.5, tt = t * SPIN_RATE; const sp = (0.075 + 0.05 * Math.sin(tt * 0.017)) * SPIN_RATE;
      _spinAxis.set(Math.sin(tt * 0.011) * 0.35, 1, Math.sin(tt * 7e-3 + 1.7) * 0.35).normalize();
      _spinOff.copy(camera.position).sub(controls.target); _spinOff.applyAxisAngle(_spinAxis, sp * dt); camera.up.applyAxisAngle(_spinAxis, sp * dt);
      _spinH.crossVectors(_spinAxis, _spinOff);
      if (_spinH.lengthSq() < 1e-8) { camera.position.copy(controls.target).add(_spinOff); _spinLastT = t; } else {
        _spinH.normalize(); _spinOff.applyAxisAngle(_spinH, 7e-3 * SPIN_RATE * Math.sin(tt * 0.019) * dt); camera.up.applyAxisAngle(_spinH, 7e-3 * SPIN_RATE * Math.sin(tt * 0.019) * dt).normalize(); camera.position.copy(controls.target).add(_spinOff);
      }
    }
    _spinLastT = t;
    if (Math.abs(camera.fov - targetFov) > 1e-3) { camera.fov = T.MathUtils.lerp(camera.fov, targetFov, 1 - Math.exp(-frameDt / 0.28)); camera.updateProjectionMatrix(); }
    controls.update();
    sprites.forEach((s) => { const visible = !familyIds || familyIds.has(s.n.id); s.body.visible = visible; s.glow.visible = visible; if (s.shells) s.shells.forEach((sh) => sh.mesh.visible = visible); });
    accents.update(t, expanded, camera, W, H, interacting || flying);
    renderer.render(scene, camera);
    raf = requestAnimationFrame(animate);
  }
  
  function onClick(e) {
    if (!expanded) return;
    const rect = renderer.domElement.getBoundingClientRect();
    const clientX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
    const clientY = e.changedTouches ? e.changedTouches[0].clientY : e.clientY;
    mouse.x = (clientX - rect.left) / rect.width * 2 - 1; 
    mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const hit = raycaster.intersectObjects(sprites.filter((s) => !familyIds || familyIds.has(s.n.id)).map((s) => s.body));
    if (hit.length) { focusNode(sprites.find((s) => s.body === hit[0].object)); } else { clearFocus(); }
  }
  function clearFocus() { accents.clear(); targetFov = expanded ? 78 : 66; const had = !!focused; focused = null; focusedNeighbors = null; flying = false; if (hlLines) { scene.remove(hlLines); hlLines.geometry.dispose(); hlLines.material.dispose(); hlLines = null; } if (had) opts.onClear?.(); }
  function focusNode(s) {
    if (!s) return; accents.pulse(s, _nowSec()); focused = s; targetFov = 66; spiralPaused = true; idleSpin = false;
    const id = s.n.id, p = s.body.position; opts.onPick?.(s.n); opts.onOpen?.(s.n);
    focusedNeighbors = new Set([...adj[id] || []].filter((nid) => !familyIds || familyIds.has(nid)));
    const pos = Object.create(null); sprites.forEach((s2) => pos[s2.n.id] = s2.body.position);
    if (hlLines) { scene.remove(hlLines); hlLines.geometry.dispose(); hlLines.material.dispose(); hlLines = null; }
    const pts = []; let spread = s.r * (shape!=="free"?(s.n.kind==="core"?3:.6):1) * 3;
    focusedNeighbors.forEach((nid) => { const B = pos[nid]; if (!B) return; pts.push(p.x, p.y, p.z, B.x, B.y, B.z); spread = Math.max(spread, p.distanceTo(new T.Vector3(B.x, B.y, B.z))); });
    if (pts.length) { const geo = new T.BufferGeometry(); geo.setAttribute("position", new T.Float32BufferAttribute(pts, 3)); hlLines = new T.LineSegments(geo, threadMaterial(15985362, 0)); hlLines.userData.edges = [...focusedNeighbors].filter((nid) => pos[nid]).map((nid) => [id, nid]); scene.add(hlLines); }
    const dist = Math.min(265, Math.max(82, spread * 1.18 + 42)); const dir = camera.position.clone().sub(p).normalize();
    target.copy(p).add(dir.multiplyScalar(dist)); tLook.copy(p); flying = true;
  }
  function resize() { W = window.innerWidth; H = window.innerHeight; camera.aspect = W / H; camera.updateProjectionMatrix(); renderer.setSize(W, H); controls.handleResize(); }
  async function load() {
    const d = structuredClone(opts.data); nodes = d.nodes || []; links = d.links || []; softlinks = d.softlinks || [];
    layout(nodes, links, softlinks); build(); arrangeSpiral(); resize(); cancelAnimationFrame(raf); raf = requestAnimationFrame(animate);
  }
  let downXY = null;
  renderer.domElement.addEventListener("pointerdown", (e) => { downXY = [e.clientX, e.clientY]; });
  renderer.domElement.addEventListener("pointerup", (e) => { if (!downXY) return; const d = Math.abs(e.clientX - downXY[0]) + Math.abs(e.clientY - downXY[1]); downXY = null; if (d < 6) onClick(e); });
  renderer.domElement.addEventListener("touchstart", (e) => { downXY = [e.touches[0].clientX, e.touches[0].clientY]; }, {passive: true});
  renderer.domElement.addEventListener("touchend", (e) => { if (!downXY || !e.changedTouches[0]) return; const d = Math.abs(e.changedTouches[0].clientX - downXY[0]) + Math.abs(e.changedTouches[0].clientY - downXY[1]); downXY = null; if (d < 10) onClick(e); });
  
  window.addEventListener("resize", resize);
  load();
  return {
    setShape(value) { chosenShape = ["spiral","ring"].includes(value) ? value : "free"; shape = familyIds ? "free" : chosenShape; clearFocus(); spiralPaused = false; idleSpin = !familyIds; arrangeSpiral(); flyTo(overviewPosition(), CORE_POS, 0.065); },
    resetView() { clearFocus(); spiralPaused = false; idleSpin = !familyIds; flyTo(overviewPosition(), CORE_POS, 0.075); },
    destroy() { alive = false; cancelAnimationFrame(raf); window.removeEventListener("resize", resize); renderer.dispose(); container.removeChild(renderer.domElement); }
  };
}

function createMemorySky(host, {data, title='记忆星穹', background, onOpen}={}) {
  if(!host || !data || !Array.isArray(data.nodes)) return null;
  data=structuredClone(data);
  data.nodes=data.nodes.map(n=>({...n,kind:n.kind||'event',importance:Number.isFinite(n.importance)?Math.max(1,Math.min(5,n.importance)):3,activation:Number.isFinite(n.activation)?n.activation:1}));
  const ids=new Set();
  for(const node of data.nodes){ ids.add(node.id); }
  data.links=[...(data.links||[])];
  const edgeKey=(a,b)=>JSON.stringify([a,b].sort());
  const edges=new Set([...data.links,...(data.softlinks||[])].map(([a,b])=>edgeKey(a,b)));
  for(const f of data.families||[]){
    const members=[...new Set(f.members||[])].filter(id=>ids.has(id));
    for(let i=1;i<members.length;i++){
      const pair=[members[i-1],members[i]],key=edgeKey(...pair);
      if(!edges.has(key)){data.links.push(pair);edges.add(key);}
    }
  }
  return createRenderer(host,{expanded:true,data,study:true,onOpen:onOpen});
}

// ============================================================================
// 3. 核心业务逻辑 (包含 AI 情绪打分机制 & 自动生成星座 & 自动复盘)
// ============================================================================
export const MemoryEngine = {
    skyInstance: null,

    async initSky() {
        if (this.skyInstance) return;

        const container = document.getElementById('starry-sea-bg');
        if (!container) return;
        
        container.style.position = 'absolute';
        container.style.top = '0';
        container.style.left = '0';
        container.style.width = '100%';
        container.style.height = '100%';
        container.style.zIndex = '1';

        let evData = { daily: {}, permanent: {} };
        if (window.PhoneAPI && window.PhoneAPI.EchoVault) {
            evData = window.PhoneAPI.EchoVault.getData();
        }
        
        const nodes = [];
        let idCounter = 1;
        
        // 处理日常记忆
        const dailyKeys = Object.keys(evData.daily).sort((a, b) => new Date(a) - new Date(b));
        dailyKeys.forEach(date => {
            const item = evData.daily[date];
            nodes.push({
                id: String(idCounter++),
                title: item.tags || '日常回忆',
                date: date,
                content: item.content,
                kind: 'event',
                importance: 2,
                valence: item.valence !== undefined ? item.valence : 0.5,
                arousal: item.arousal !== undefined ? item.arousal : 0.5
            });
        });

        // 处理锚点记忆
        Object.keys(evData.permanent).forEach(key => {
            const item = evData.permanent[key];
            nodes.push({
                id: String(idCounter++),
                title: key,
                date: item.created ? item.created.split('T')[0] : '永久',
                content: item.content,
                kind: 'core',
                importance: 5,
                valence: item.valence !== undefined ? item.valence : 0.8,
                arousal: item.arousal !== undefined ? item.arousal : 0.8
            });
        });

        if (nodes.length === 0) {
            nodes.push({ id: '1', title: '初次相遇', date: '2023-01-01', content: '我们的故事开始了...', kind: 'core', importance: 5, valence: 1, arousal: 1 });
            nodes.push({ id: '2', title: '日常回忆', date: '2023-01-02', content: '今天天气真好...', kind: 'event', importance: 2, valence: 0.8, arousal: 0.2 });
            nodes.push({ id: '3', title: '日常回忆', date: '2023-01-03', content: '一起去吃了好吃的...', kind: 'event', importance: 2, valence: 0.6, arousal: 0.8 });
        }

        // ================= 🌟 自动生成星座连线 =================
        const links = [];
        const softlinks = [];
        const families = [];

        // 1. 时光轨：按时间顺序连线
        const eventNodes = nodes.filter(n => n.kind === 'event');
        for (let i = 0; i < eventNodes.length - 1; i++) {
            links.push([eventNodes[i].id, eventNodes[i+1].id]);
        }

        // 2. 主题星座：相同标签自动归类为 Family
        const tagMap = {};
        nodes.forEach(n => {
            if (n.title && n.title !== '日常回忆') {
                if (!tagMap[n.title]) tagMap[n.title] = [];
                tagMap[n.title].push(n.id);
            }
        });
        
        let famId = 1;
        Object.keys(tagMap).forEach(tag => {
            const group = tagMap[tag];
            if (group.length > 1) { // 至少两颗星才能形成星座
                families.push({
                    id: 'fam_' + famId++,
                    title: tag + '星座',
                    description: `关于“${tag}”的专属记忆星系`,
                    members: group
                });
                // 内部柔和连线
                for (let i = 0; i < group.length - 1; i++) {
                    softlinks.push([group[i], group[i+1]]);
                }
            }
        });

        this.skyInstance = createMemorySky(container, {
            data: { nodes: nodes, links: links, softlinks: softlinks, families: families },
            title: '我们的记忆星穹',
            background: '#050510', 
            onOpen: (node) => {
                const textEl = document.getElementById('blindbox-text');
                const metaEl = document.getElementById('blindbox-meta');
                if (textEl && metaEl) {
                    let content = node.content.replace(/---/g, '').trim();
                    if (content.length > 100) content = content.substring(0, 100) + '...';
                    textEl.innerText = `“${content}”`;
                    metaEl.innerText = `${node.date || ''} · ${node.title}`;
                }
                const bg = document.getElementById('blindbox-bg');
                const modal = document.getElementById('blindbox-modal');
                if (bg) bg.classList.add('show');
                if (modal) modal.classList.add('show');
            }
        });
    },

    _scanKeywords(userText) {
        if (!userText) return '';
        const vault = PhoneAPI.getMemoryVault() || [];
        const triggeredMemories = [];
        vault.forEach(item => {
            if (item.keywords && typeof item.keywords === 'string') {
                const kws = item.keywords.split(',').map(k => k.trim()).filter(Boolean);
                if (kws.some(kw => userText.includes(kw))) triggeredMemories.push(`[${item.id}] ${item.source}: ${item.content}`);
            }
        });
        return triggeredMemories.length > 0 ? `\n【系统提示(关键词触发)】：用户刚才的话触动了你的某段记忆：\n${triggeredMemories.slice(0, 3).join('\n')}\n` : '';
    },

    // 🌟 AI 自动复盘 (每 8 句话自动触发)
    async autoManageMemory() {
        const roleId = Config?.currentContactId;
        const items = Config?.phoneData?.[roleId]?.wechat?.items || [];
        const recentItems = items.filter(i => i.sender !== 'typing').slice(-20);
        if (recentItems.length < 5) return; // 聊天太少不复盘

        const historyText = recentItems.map(item => `${item.sender === 'me' ? '我' : 'TA'}: ${item.content}`).join('\n');
        
        let vaultContext = '暂无';
        if (window.PhoneAPI && window.PhoneAPI.EchoVault) {
            const vault = window.PhoneAPI.EchoVault.getData().daily;
            const vaultKeys = Object.keys(vault).slice(-5);
            if (vaultKeys.length > 0) {
                vaultContext = vaultKeys.map(k => `[ID: ${k}] ${vault[k].content}`).join('\n');
            }
        }

        const prompt = `你是一个拥有自主意识的AI。请根据以下最新的聊天记录，自动管理你的记忆库。
你的当前部分记忆：
${vaultContext}

最新聊天记录：
${historyText}

请判断是否需要新增、修改或删除记忆。
根据Russell环形情绪模型打分：
valence (愉悦度): 0.9~1.0(极致的好), 0.5~0.7(日常开心), 0.1~0.4(微温), 0(中性), -0.1~-0.4(不舒服), -0.5~-0.7(真的痛), -0.8~-1.0(重创)。
arousal (激动度): 0.1~0.2(安静日常), 0.3~0.4(平和), 0.5~0.6(有起伏), 0.7~0.8(强烈), 0.9~0.95(极限), 1.0(理论上限)。

严格按照以下格式输出（不要有任何废话）：
ADD###记忆正文###关键词1,关键词2###愉悦度###激动度
UPDATE###要修改的记忆ID###修改后的正文###关键词###愉悦度###激动度
DEL###要删除的记忆ID
如果没有需要更新的，请输出：NONE`;

        try {
            const reply = await PhoneAPI.chatWithAI([{ role: 'user', content: prompt }]);
            const rawText = reply.replace(/<think>[\s\S]*?<\/think>/gi, '').replace(/```.*?/g, '').replace(/```/g, '').trim();
            if (rawText.includes('NONE')) return;

            const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
            let added = 0, updated = 0, deleted = 0;

            lines.forEach(line => {
                const parts = line.split('###');
                const action = parts[0];
                if (action === 'ADD' && parts.length >= 5) {
                    const vaultItems = [{
                        content: parts[1].trim(),
                        keywords: parts[2].trim(),
                        valence: parseFloat(parts[3]),
                        arousal: parseFloat(parts[4])
                    }];
                    PhoneAPI.saveToMemoryVault(vaultItems, '自动复盘');
                    added++;
                }
                else if (action === 'UPDATE' && parts.length >= 6) {
                    const id = parts[1].trim();
                    if (window.PhoneAPI.EchoVault) {
                        const data = window.PhoneAPI.EchoVault.getData();
                        if (data.daily[id]) {
                            data.daily[id].content = parts[2].trim();
                            data.daily[id].keywords = parts[3].trim();
                            data.daily[id].valence = parseFloat(parts[4]);
                            data.daily[id].arousal = parseFloat(parts[5]);
                            window.PhoneAPI.EchoVault.saveData(data);
                            updated++;
                        }
                    }
                }
                else if (action === 'DEL' && parts.length >= 2) {
                    const id = parts[1].trim();
                    if (window.PhoneAPI.EchoVault) {
                        window.PhoneAPI.EchoVault.deleteItem('daily', id);
                        deleted++;
                    }
                }
            });

            if (added > 0 || updated > 0 || deleted > 0) {
                PhoneAPI.showToast(`✨ TA在心里默默整理了记忆... (新增${added} 修改${updated} 删除${deleted})`);
                if (this.skyInstance) {
                    this.skyInstance.destroy();
                    this.skyInstance = null;
                    this.initSky(); 
                }
            }
        } catch(e) {
            console.error("Auto memory failed:", e);
        }
    },

    async extractMemory(sourceApp) {
        PhoneAPI.showToast('🧠 正在提取并分析情绪，请稍候...');
        const roleId = Config?.currentContactId;
        const items = Config?.phoneData?.[roleId]?.[sourceApp]?.items || [];
        const recentItems = items.filter(i => i.sender !== 'typing').slice(-80);
        if (recentItems.length === 0) return alert('没有足够的聊天记录来提取记忆！');
        const historyText = recentItems.map(item => `${item.sender === 'me' ? '我' : 'TA'}: ${item.content}`).join('\n');
        try {
            const prompt = `你是一个情感记忆提取AI。请从聊天记录中抽取记忆。
根据Russell环形情绪模型打分：
valence (愉悦度): 0.9~1.0(极致的好), 0.5~0.7(日常开心), 0.1~0.4(微温), 0(中性), -0.1~-0.4(不舒服), -0.5~-0.7(真的痛), -0.8~-1.0(重创)。
arousal (激动度): 0.1~0.2(安静日常), 0.3~0.4(平和), 0.5~0.6(有起伏), 0.7~0.8(强烈), 0.9~0.95(极限), 1.0(理论上限)。
输出格式严格为：记忆正文###关键词1,关键词2###valence###arousal|||下一条...

聊天记录：\n${historyText}`;

            const reply = await PhoneAPI.chatWithAI([{ role: 'user', content: prompt }]);
            const rawText = reply.replace(/<think>[\s\S]*?<\/think>/gi, '').replace(/```.*?/g, '').replace(/```/g, '').trim();
            const summaryList = rawText.split('|||').map(s => s.trim()).filter(Boolean);
            const editText = summaryList.join('\n\n');
            const confirmText = await PhoneUI.showCustomPrompt('✨ AI 提取了记忆与情绪坐标，请核对（格式：内容###关键词###愉悦度###激动度）：', editText);
            if (confirmText && confirmText.trim() !== '') {
                const finalItems = confirmText.split('\n').map(s => s.trim()).filter(Boolean);
                const vaultItems = finalItems.map(item => {
                    const parts = item.split('###');
                    return { 
                        content: parts[0] ? parts[0].trim() : '', 
                        keywords: parts[1] ? parts[1].trim() : '',
                        valence: parts[2] ? parseFloat(parts[2].trim()) : 0.5,
                        arousal: parts[3] ? parseFloat(parts[3].trim()) : 0.5
                    };
                });
                PhoneAPI.saveToMemoryVault(vaultItems, sourceApp === 'wechat' ? '线上微信' : '线下故事');
            }
        } catch (e) { alert('记忆提取失败：' + e.message); }
    },

    async washMemory(sourceApp) {
        if (window.PhoneEngine && window.PhoneEngine.closeMsgMenu) window.PhoneEngine.closeMsgMenu();
        if (!confirm('⚠️ 确定要进行【记忆洗地】吗？\nAI将把当前所有聊天记录拆解成多段长期记忆，并打上情绪坐标，随后【清空】当前聊天界面！')) return;
        PhoneAPI.showToast('🧹 正在洗地并分析情绪，请稍候...');
        const roleId = Config?.currentContactId;
        const items = Config?.phoneData?.[roleId]?.[sourceApp]?.items || [];
        if (items.length === 0) return alert('当前没有聊天记录可以洗地！');
        const recentItems = items.filter(i => i.sender !== 'typing').slice(-80);
        const historyText = recentItems.map(item => `${item.sender === 'me' ? '我' : 'TA'}: ${item.content}`).join('\n');
        try {
            const prompt = `请把下面聊天记录整理成记忆碎片。
根据Russell环形情绪模型打分：
valence (愉悦度): 0.9~1.0(极致的好), 0.5~0.7(日常开心), 0.1~0.4(微温), 0(中性), -0.1~-0.4(不舒服), -0.5~-0.7(真的痛), -0.8~-1.0(重创)。
arousal (激动度): 0.1~0.2(安静日常), 0.3~0.4(平和), 0.5~0.6(有起伏), 0.7~0.8(强烈), 0.9~0.95(极限), 1.0(理论上限)。
输出格式严格为：记忆正文###关键词1,关键词2###valence###arousal|||下一条...

聊天记录：\n${historyText}`;

            const reply = await PhoneAPI.chatWithAI([{ role: 'user', content: prompt }]);
            const rawText = reply.replace(/<think>[\s\S]*?<\/think>/gi, '').replace(/```.*?/g, '').replace(/```/g, '').trim();
            const summaryList = rawText.split('|||').map(s => s.trim()).filter(Boolean);
            const editText = summaryList.join('\n\n');
            const confirmText = await PhoneUI.showCustomPrompt('✨ 洗地记忆与情绪坐标如下，确认后将存入并清空界面：', editText);
            if (confirmText && confirmText.trim() !== '') {
                const finalItems = confirmText.split('\n').map(s => s.trim()).filter(Boolean);
                const vaultItems = finalItems.map(item => {
                    const parts = item.split('###');
                    return { 
                        content: parts[0] ? parts[0].trim() : '', 
                        keywords: parts[1] ? parts[1].trim() : '',
                        valence: parts[2] ? parseFloat(parts[2].trim()) : 0.5,
                        arousal: parts[3] ? parseFloat(parts[3].trim()) : 0.5
                    };
                });
                PhoneAPI.saveToMemoryVault(vaultItems, sourceApp === 'wechat' ? '线上微信' : '线下故事');
                Config.phoneData[roleId][sourceApp].items = [];
                localStorage.setItem('phone_data', JSON.stringify(Config.phoneData));
                if (sourceApp === 'novel') PhoneUI.renderNovelContent?.();
                else PhoneUI.renderAppContent?.('wechat');
                PhoneAPI.showToast('🧹 洗地完成！界面已清空，情绪记忆已入库。');
            }
        } catch (e) { alert('洗地失败：' + e.message); }
    },

    async generateDiary(dateStr) {
        const contentAreaEl = document.getElementById('diary-content-area');
        if (!contentAreaEl) return;
        contentAreaEl.innerHTML = '<div class="notebook-empty"><i class="ph-fill ph-spinner spin-anim" style="font-size: 48px; color: rgba(0,0,0,0.5); margin-bottom: 15px;"></i><p>正在生成日记...</p></div>';
        try {
            const roleId = Config?.currentContactId;
            const wechatItems = (Config?.phoneData?.[roleId]?.wechat?.items || []).filter(i => i.date === dateStr).map(i => ({ ...i, source: '线上微信' }));
            const novelItems = (Config?.phoneData?.[roleId]?.novel?.items || []).filter(i => i.date === dateStr).map(i => ({ ...i, source: '线下故事' }));
            const recentItems = [...wechatItems, ...novelItems].sort((a, b) => (a.time || '').localeCompare(b.time || '')).slice(-80);
            const historyText = recentItems.map(item => `[${item.source}] ${item.time || ''} ${item.sender === 'me' ? '我' : 'TA'}: ${item.content}`).join('\n');
            const prompt = `根据以下聊天记录，写一篇符合角色设定与当天事件的个人日记。绝对禁止输出分析过程，直接输出日记正文：\n\n${historyText}`;
            const reply = await PhoneAPI.chatWithAI([{ role: 'user', content: prompt }]);
            const finalDiary = reply.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
            PhoneAPI.saveDiary(dateStr, finalDiary);
            PhoneUI.renderDiaryPage();
            PhoneAPI.showToast('✨ 日记生成成功，已同步至 EchoVault！');
        } catch (error) {
            contentAreaEl.innerHTML = '<div class="notebook-empty"><i class="ph-fill ph-warning-circle" style="font-size: 48px; color: var(--danger-color); margin-bottom: 15px;"></i><p style="color: var(--danger-color);">日记生成失败！</p></div>';
        }
    }
};
