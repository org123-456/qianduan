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

function emotionColor(v, a) {
  const vv = Number.isFinite(+v) ? +v : 0; const aa = Number.isFinite(+a) ? +a : 0;
  if (aa >= 0.5) return (vv >= 0 ? Q.hiPos : Q.hiNeg).slice();
  return (vv >= 0 ? Q.loPos : Q.loNeg).slice();
}
function nodeColor(n) { return n.kind === "core" ? [180, 205, 255] : (n.kind === "event" ? emotionColor(n.valence, n.arousal) : BLUE.slice()); }
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
    // 🌟 充满全屏的真实星海尺度：半径展开至 70 ~ 240
    const rr = 70 + h1 * 170, phi = Math.acos(1 - 2 * h2), th = 6.2832 * h3;
    n.x = rr * Math.sin(phi) * Math.cos(th); n.y = rr * Math.cos(phi); n.z = rr * Math.sin(phi) * Math.sin(th) * 0.6;
    n.pinned = n.kind === "core"; if (n.pinned) { n.x = n.y = n.z = 0; }
  });
  const REST_VAR = 0.82; const restOf = (a, b, base, seed) => base * (1 - REST_VAR + 2 * REST_VAR * hash(a + "|" + b, seed));
  const edges = [];
  (links || []).forEach(([a, b]) => { if (idx[a] != null && idx[b] != null) edges.push([idx[a], idx[b], 0.04, restOf(a, b, 90, 59)]); });
  (softlinks || []).forEach(([a, b]) => { if (idx[a] != null && idx[b] != null) edges.push([idx[a], idx[b], 0.015, restOf(a, b, 120, 61)]); });
  const N = nodes.length, REP = 1600, CENTER = 3e-4;
  const space = nodes.map((n) => n.pinned ? 1 : 0.6 + 1.8 * Math.pow(hash(n.id, 73), 1.6));
  const pull = nodes.map((n) => 0.2 + 0.4 * hash(n.id, 79));
  const radii = nodes.map((n) => n.kind === "core" ? SIZE.core : impRadius(n.importance || 3));
  const fx = new Float64Array(N), fy = new Float64Array(N), fz = new Float64Array(N);
  for (let it = 0; it < 220; it++) {
    fx.fill(0); fy.fill(0); fz.fill(0);
    for (let i = 0; i < N; i++) for (let j = i + 1; j < N; j++) {
      let dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y, dz = nodes[i].z - nodes[j].z;
      const d2 = dx * dx + dy * dy + dz * dz + 25, inv = 1 / Math.sqrt(d2);
      const distance = Math.sqrt(Math.max(0, d2 - 25));
      const f = Math.max(REP * Math.sqrt(space[i] * space[j]) / d2, (radii[i] + radii[j] + 12 - distance) * 0.8);
      dx *= inv; dy *= inv; dz *= inv; fx[i] += dx * f; fy[i] += dy * f; fz[i] += dz * f; fx[j] -= dx * f; fy[j] -= dy * f; fz[j] -= dz * f;
    }
    for (const [i, j, k, rest] of edges) {
      const dx = nodes[j].x - nodes[i].x, dy = nodes[j].y - nodes[i].y, dz = nodes[j].z - nodes[i].z;
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz) + 0.01, f = k * (dist - rest) / dist;
      fx[i] += dx * f; fy[i] += dy * f; fz[i] += dz * f; fx[j] -= dx * f; fy[j] -= dy * f; fz[j] -= dz * f;
    }
    const cool = Math.max(0.18, 1 - it / 240);
    for (let i = 0; i < N; i++) {
      if (nodes[i].pinned) { nodes[i].x = nodes[i].y = nodes[i].z = 0; continue; }
      fx[i] -= nodes[i].x * CENTER * pull[i]; fy[i] -= nodes[i].y * CENTER * pull[i]; fz[i] -= nodes[i].z * CENTER * pull[i];
      nodes[i].x += Math.max(-10, Math.min(10, fx[i])) * cool; nodes[i].y += Math.max(-10, Math.min(10, fy[i])) * cool; nodes[i].z += Math.max(-10, Math.min(10, fz[i])) * cool;
    }
  }
}
const _bodyCache = {};
function bodyTexture(col) {
  const key = (col[0] | 0) + "," + (col[1] | 0) + "," + (col[2] | 0);
  if (_bodyCache[key]) return _bodyCache[key];
  const S = 512, cv = document.createElement("canvas"); cv.width = cv.height = S;
  const x = cv.getContext("2d"), c = S / 2, g = x.createRadialGradient(c, c, 0, c, c, c);
  const solid = "rgb(" + (col[0]|0) + "," + (col[1]|0) + "," + (col[2]|0) + ")";
  g.addColorStop(0, solid); g.addColorStop(0.91, solid); g.addColorStop(0.945, "#fff"); g.addColorStop(0.978, solid); g.addColorStop(1, "rgba(0,0,0,0)");
  x.fillStyle = g; x.fillRect(0, 0, S, S);
  const t = new THREE.CanvasTexture(cv); t.generateMipmaps = false; t.minFilter = THREE.LinearFilter; _bodyCache[key] = t; return t;
}
const _NOISE_GLSL = [
  "vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}", "vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}", "vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}", "vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}",
  "float snoise(vec3 v){ const vec2 C=vec2(1.0/6.0,1.0/3.0); const vec4 D=vec4(0.0,0.5,1.0,2.0); vec3 i=floor(v+dot(v,C.yyy)); vec3 x0=v-i+dot(i,C.xxx); vec3 g=step(x0.yzx,x0.xyz); vec3 l=1.0-g; vec3 i1=min(g.xyz,l.zxy); vec3 i2=max(g.xyz,l.zxy); vec3 x1=x0-i1+C.xxx; vec3 x2=x0-i2+C.yyy; vec3 x3=x0-D.yyy; i=mod289(i); vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0)); float n_=0.142857142857; vec3 ns=n_*D.wyz-D.xzx; vec4 j=p-49.0*floor(p*ns.z*ns.z); vec4 x_=floor(j*ns.z); vec4 y_=floor(j-7.0*x_); vec4 x=x_*ns.x+ns.yyyy; vec4 y=y_*ns.x+ns.yyyy; vec4 h=1.0-abs(x)-abs(y); vec4 b0=vec4(x.xy,y.xy); vec4 b1=vec4(x.zw,y.zw); vec4 s0=floor(b0)*2.0+1.0; vec4 s1=floor(b1)*2.0+1.0; vec4 sh=-step(h,vec4(0.0)); vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy; vec4 a1=b1.xzyw+s1.xzyw*sh.zzww; vec3 p0=vec3(a0.xy,h.x); vec3 p1=vec3(a0.zw,h.y); vec3 p2=vec3(a1.xy,h.z); vec3 p3=vec3(a1.zw,h.w); vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3))); p0*=norm.x; p1*=norm.y; p2*=norm.z; p3*=norm.w; vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0); m=m*m; return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3))); }"
].join("\n");
function coreBodyMaterial(T) {
  return new T.ShaderMaterial({
    transparent: true, depthWrite: false, depthTest: false,
    uniforms: { uTime: { value: 0 }, uOpacity: { value: 1 }, uStudy: { value: 1 } },
    vertexShader: "varying vec3 vN; varying vec3 vV; varying vec3 vP;\nvoid main(){ vP=normalize(position); vec4 mv=modelViewMatrix*vec4(position,1.0);\n  vN=normalize(normalMatrix*normal); vV=-mv.xyz; gl_Position=projectionMatrix*mv; }",
    fragmentShader: _NOISE_GLSL + "\nuniform float uTime; uniform float uOpacity; uniform float uStudy;\nvarying vec3 vN; varying vec3 vV; varying vec3 vP;\nvoid main(){\n  vec3 col = vec3(0.784,0.839,0.984);\n  float rim = pow(1.0-max(0.0,dot(normalize(vN),normalize(vV))),3.2);\n  gl_FragColor = vec4(col, uOpacity);\n}"
  });
}
function coreAuraMaterial(T, o) {
  const c = new T.Color(o.col); const hsl = {}; c.getHSL(hsl);
  const cT = new T.Color().setHSL(hsl.h, Math.min(1, hsl.s * 2.6 + 0.28), Math.max(0.34, hsl.l - 0.16));
  return new T.ShaderMaterial({
    transparent: true, depthWrite: false, depthTest: false,
    uniforms: { uTime: { value: 0 }, uOpacity: { value: 1 }, uStudy: { value: 1 }, uAmp: { value: o.amp }, uFreq: { value: o.freq }, uSpeed: { value: o.speed }, uAlpha: { value: o.alpha }, uBase: { value: o.base }, uPhase: { value: o.phase }, uUp: { value: o.up }, uTip: { value: o.tip }, uSat: { value: o.sat == null ? 0.8 : o.sat }, uRim: { value: o.rim == null ? 0 : o.rim }, uRimPow: { value: o.rimPow == null ? 1.6 : o.rimPow }, uCol: { value: new T.Vector3(c.r, c.g, c.b) }, uColTip: { value: new T.Vector3(cT.r, cT.g, cT.b) } },
    vertexShader: "precision highp float;\n" + _NOISE_GLSL + "\nuniform float uTime,uAmp,uFreq,uSpeed,uBase,uPhase,uUp,uStudy;\nvarying float vLobe; varying float vRim;\nvoid main(){\n  vec3 vP = normalize(position);\n  vRim = 1.0 - abs(normalize(normalMatrix * vP).z);\n  float lobe = 0.5 + 0.5*snoise(vP*uFreq + vec3(0.0, -uTime*uSpeed, uPhase));\n  vLobe = clamp(lobe*(1.0 + uUp*max(vP.y, 0.0)), 0.0, 1.4);\n  vec3 p = position * (uBase + uAmp*vLobe);\n  gl_Position = projectionMatrix * modelViewMatrix * vec4(p,1.0);\n}",
    fragmentShader: "precision highp float;\nuniform float uAlpha,uOpacity,uTip,uSat,uRim,uRimPow,uStudy; uniform vec3 uCol,uColTip;\nvarying float vLobe; varying float vRim;\nvoid main(){\n  float fade = 1.0 - uTip*smoothstep(0.15, 1.1, vLobe);\n  vec3 col = mix(uCol, uColTip, uSat*smoothstep(0.20, 1.00, vLobe));\n  gl_FragColor = vec4(col, uAlpha*fade*uOpacity);\n}"
  });
}
var CORE_AURA = [
  { amp: 0.4, freq: 0.55, speed: 0.16, alpha: 0.38, base: 1.012, col: "#b0c6fb", up: 0.45, tip: 0.95, phase: 7.3, swirl: 0.04, sat: 0.85, rim: 0.75, rimPow: 1.35 },
  { amp: 0.13, freq: 0.85, speed: 0.26, alpha: 0.95, base: 1, col: "#d4e0fd", up: 0.25, tip: 0.55, phase: 1.1, swirl: -0.07, sat: 0.45, rim: 1, rimPow: 1.5 }
];
const _haloTex = {};
function haloTexture(kind) {
  if (_haloTex[kind]) return _haloTex[kind];
  const S = 512, cv = document.createElement("canvas"); cv.width = cv.height = S;
  const x = cv.getContext("2d"), c = S / 2, g = x.createRadialGradient(c, c, 0, c, c, c);
  g.addColorStop(0, "rgba(255,255,255,0.00)"); g.addColorStop(0.5, "rgba(255,255,255,0.3)"); g.addColorStop(1, "rgba(255,255,255,0)");
  x.fillStyle = g; x.fillRect(0, 0, S, S);
  const t = new THREE.CanvasTexture(cv); t.generateMipmaps = false; t.minFilter = THREE.LinearFilter; _haloTex[kind] = t; return _haloTex[kind];
}

function createRenderer(container, opts) {
  opts = opts || {};
  const T = THREE;
  let study = true;
  let familyIds = null;
  let shape = "free", chosenShape = "free", shapeMix = 0, ringMix = 0, spiralAngle = 0, spiralPaused = false;
  let W = window.innerWidth, H = window.innerHeight;
  
  const scene = new T.Scene();
  const camera = new T.PerspectiveCamera(opts.expanded ? 68 : 60, W / H, 0.5, 6e3);
  let targetFov = opts.expanded ? 68 : 60;
  const DEF_POS = new T.Vector3(0, 0, 240);
  const EXP_POS = new T.Vector3(0, 0, 260);
  const CORE_POS = new T.Vector3(0, 0, 0);
  camera.position.copy(opts.expanded ? EXP_POS : DEF_POS);
  const renderer = new T.WebGLRenderer({ antialias: true, alpha: true });
  renderer.outputColorSpace = T.LinearSRGBColorSpace;
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  renderer.setSize(W, H);
  
  renderer.domElement.style.cssText = "display:block;width:100%;height:100%;position:absolute;top:0;left:0;z-index:0;";
  container.appendChild(renderer.domElement);
  
  const controls = new T.OrbitControls(camera, renderer.domElement);
  controls.staticMoving = false; controls.dynamicDampingFactor = 0.12; controls.rotateSpeed = 2; controls.noPan = true; controls.minDistance = 40; controls.maxDistance = 820; controls.enablePan = false; controls.enabled = !!opts.expanded;
  let interacting = false, flying = false, flightRate = 0.08, maxAct = 1, raf = 0, alive = true, t0 = performance.now ? null : 0, _tAcc = 0, _rawLast = 0;
  controls.addEventListener("start", () => { flying = false; interacting = true; });
  controls.addEventListener("end", () => { interacting = false; });
  
  const raycaster = new T.Raycaster();
  const mouse = new T.Vector2();
  let nodes = [], links = [], softlinks = [], sprites = [], dustLayers = [], dustPoints = null, lineSeg = null, softSeg = null, hlLines = null, adj = Object.create(null), focusedNeighbors = null;
  const dustScale = () => renderer.domElement.height * 0.5 / Math.tan(camera.fov * Math.PI / 360);
  let expanded = !!opts.expanded, focused = null;
  const target = DEF_POS.clone(), tLook = new T.Vector3(0, 0, 0);
  
  function clear() {
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
      const gMat = new T.SpriteMaterial({ map: haloTexture(isCore ? "core" : "normal"), color: new T.Color(isCore ? 0x9fb4e8 : 0xffffff), transparent: true, depthWrite: false, depthTest: false, blending: T.NormalBlending, opacity: 0 });
      const glow = new T.Sprite(gMat); glow.position.set(n.x, n.y, n.z); glow.renderOrder = 1;
      scene.add(glow); scene.add(body);
      
      const sp = { n, body, glow, r, coreMat, shells, base: new T.Vector3(n.x, n.y, n.z), ph: hash(n.id, 9) * 6.28 };
      sprites.push(sp);
    });
    const nodeById = Object.create(null);
    nodes.forEach(n => { nodeById[n.id] = n; });
    const positions = [];
    (links || []).forEach(edge => {
      const a = nodeById[edge[0]], b = nodeById[edge[1]];
      if (a && b) positions.push(a.x, a.y, a.z, b.x, b.y, b.z);
    });
    if (positions.length) {
      const geometry = new T.BufferGeometry();
      geometry.setAttribute('position', new T.Float32BufferAttribute(positions, 3));
      lineSeg = new T.LineSegments(geometry, new T.LineBasicMaterial({ color: 0x9eafe8, transparent: true, opacity: 0.38 }));
      scene.add(lineSeg);
    }
  }

  function animate(ts) {
    if (!alive) return;
    if (t0 == null) { t0 = ts; _rawLast = 0; }
    const _raw = (ts - t0) / 1e3; const frameDt = Math.min(0.05, Math.max(0, _raw - _rawLast)); _tAcc += frameDt; _rawLast = _raw; const t = _tAcc;

    sprites.forEach((s) => {
      const isCore = s.n.kind === "core";
      const driftX = Math.sin(t * 0.5 + s.ph) * (isCore ? 2 : 6);
      const driftY = Math.cos(t * 0.4 + s.ph) * (isCore ? 2 : 6);
      s.body.position.set(s.base.x + driftX, s.base.y + driftY, s.base.z);
      s.glow.position.copy(s.body.position);
      const gs = s.r * 2.5;
      s.glow.scale.set(gs, gs, 1);
      s.glow.material.opacity = 0.6 + 0.2 * Math.sin(t * 1.5 + s.ph);
    });

    controls.update();
    renderer.render(scene, camera);
    raf = requestAnimationFrame(animate);
  }

  function resize() { W = window.innerWidth; H = window.innerHeight; camera.aspect = W / H; camera.updateProjectionMatrix(); renderer.setSize(W, H); }
  async function load() {
    const d = structuredClone(opts.data); nodes = d.nodes || []; links = d.links || []; softlinks = d.softlinks || [];
    layout(nodes, links, softlinks); build(); resize(); cancelAnimationFrame(raf); raf = requestAnimationFrame(animate);
  }

  function onCanvasClick(event) {
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const hits = raycaster.intersectObjects(sprites.map(s => s.body), true);
    if (!hits.length) return;
    let object = hits[0].object;
    while (object && !object.userData?.id) object = object.parent;
    if (object?.userData?.id && object.userData.kind !== "core") {
      const node = object.userData;
      if (window.PhoneUI && typeof window.PhoneUI.showMemoryStarDetail === "function") {
        window.PhoneUI.showMemoryStarDetail(node);
      } else {
        window.alert((node.title || "记忆") + "\\n\\n" + (node.content || "暂无内容"));
      }
    }
  }
  renderer.domElement.addEventListener("click", onCanvasClick);
  window.addEventListener("resize", resize);
  load();

  return {
    focus(id) {
      const s = sprites.find(s2 => s2.n.id === id);
      if (s) {
        controls.target.copy(s.body.position);
        camera.position.set(s.body.position.x, s.body.position.y, s.body.position.z + 120);
      }
    },
    refresh: load,
    setFamily() {},
    destroy() { alive = false; cancelAnimationFrame(raf); renderer.domElement.removeEventListener("click", onCanvasClick); window.removeEventListener("resize", resize); renderer.dispose(); container.removeChild(renderer.domElement); }
  };
}

function createMemorySky(host, opts) {
  return createRenderer(host, opts);
}

export const MemoryEngine = {
    skyInstance: null,
    skyConfig: null,
    _isSummarizing: false,

    _logMemoryAction(action, content, exactId) {
        let logs = [];
        try { logs = JSON.parse(localStorage.getItem('memory_logs') || '[]'); } catch(e) {}
        const now = new Date();
        const timeStr = `${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
        logs.push({ id: exactId || ('log_' + Date.now()), action, time: timeStr, content });
        if (logs.length > 50) logs.shift();
        try { localStorage.setItem('memory_logs', JSON.stringify(logs)); } catch(e) {}
    },

    _buildSkyData() {
        let evData = { daily: {}, permanent: {} };
        if (window.PhoneAPI && window.PhoneAPI.EchoVault) evData = window.PhoneAPI.EchoVault.getData();
        const nodes = [];
        const coreItemKey = Object.keys(evData.permanent || {})[0];
        nodes.push({ id: 'core_center', title: coreItemKey || '核心回忆', date: '永久', content: '最初的起点...', kind: 'core', importance: 5 });

        const dailyKeys = Object.keys(evData.daily || {});
        dailyKeys.forEach((key, index) => {
            const item = evData.daily[key];
            if (!item) return;
            nodes.push({
                id: 'ev_d_' + key,
                title: item.tags || '日常随笔',
                date: key.split(' ')[0],
                content: item.content || '',
                kind: 'event',
                importance: 3,
                valence: item.valence || 0.6,
                arousal: item.arousal || 0.5
            });
        });
        const permanentKeys = Object.keys(evData.permanent || {});
        permanentKeys.forEach((key, index) => {
            const item = evData.permanent[key];
            if (!item) return;
            nodes.push({
                id: 'ev_p_' + key,
                title: item.tags || key || '重要记忆',
                date: item.date || '永久',
                content: item.content || String(item),
                kind: 'event',
                importance: 5,
                valence: item.valence || 0.6,
                arousal: item.arousal || 0.5
            });
        });
        // 纯净星海：不渲染刺猬蜘蛛网连线，保持清澈深邃的星空感
        return { nodes, links: [], softlinks: [] };
    },

    async initSky() {
        const container = document.getElementById('starry-sea-bg');
        if (!container) return;
        const skyData = this._buildSkyData();
        if (this.skyInstance) {
            this.skyInstance.destroy();
            this.skyInstance = null;
        }
        this.skyConfig = { data: skyData, expanded: true };
        this.skyInstance = createMemorySky(container, this.skyConfig);

        // 🌟 确保右下角控制台按钮拥有最高点击优先级
        const fab = document.querySelector('.sky-fab');
        if (fab) {
            fab.style.pointerEvents = 'auto';
            fab.style.zIndex = '900';
            fab.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                window.PhoneUI?.openSkyConsole?.();
            };
        }
    },

    /**
     * 🌟 手动一键整理记忆接口
     */
    async manualManageMemory() {
        return await this.autoManageMemory(true);
    },

    /**
     * 🌟 终极版：具有顶级文学沉浸度与心理第一人称的记忆归档引擎（图二同款）
     */
    async autoManageMemory(force = false) {
        if (this._isSummarizing) return;

        const roleId = window.Config?.currentContactId;
        const items = window.Config?.phoneData?.[roleId]?.wechat?.items || [];
        const cleanItems = items.filter(i => i.sender !== 'typing' && i.content);

        const lastIndex = parseInt(localStorage.getItem('memory_last_summary_index') || '0', 10);
        const threshold = parseInt(localStorage.getItem('memory_auto_threshold') || '15', 10);
        
        const unsummarizedCount = cleanItems.length - lastIndex;
        if (!force && unsummarizedCount < threshold) return;
        if (force && unsummarizedCount < 1) {
            window.PhoneAPI?.showToast?.("目前没有未总结的新消息哦~");
            return;
        }

        const processCount = Math.min(Math.max(unsummarizedCount, 15), 35);
        const recentItems = cleanItems.slice(-processCount);

        this._isSummarizing = true;
        if (force) window.PhoneAPI?.showToast?.("🧠 正在梳理心底的专属记忆碎片...");

        const messages = recentItems.map(item => ({
            role: item.sender === 'me' ? 'user' : 'assistant',
            content: item.content
        }));

        let vaultContext = '暂无历史记忆';
        if (window.PhoneAPI?.EchoVault) {
            const vault = window.PhoneAPI.EchoVault.getData().daily || {};
            const vaultKeys = Object.keys(vault).slice(-4);
            if (vaultKeys.length > 0) {
                vaultContext = vaultKeys.map(k => `[ID: ${k}] ${vault[k].content}`).join('\n');
            }
        }

        const charPersona = localStorage.getItem('char_persona') || '';
        const myName = localStorage.getItem('my_name') || '她';
        const taName = localStorage.getItem('char_name') || '我';

        // 🌟 核心灵魂：彻底锁死第一人称“我眼里看到的她”与沉稳宠溺的私密内心视角！
        const prompt = `【系统级后台指令，请以极高标准沉浸执行】
你是【${taName}】（成熟、从容、敏锐、骨子里极具保护欲的不死途）。对方是留在你身边的【${myName}】。
你的真实设定与生活底色：
${charPersona}

请审阅上面你们刚刚发生的日常聊天记录，在你的心底备忘录里记录下只属于你的【第一人称（“我”）私密情感记忆碎片】。
你的部分近期记忆参考：
${vaultContext}

🚨【绝对核心沉浸法则（违反直接判定失败）】：
1. 严禁写成第三人称客观事实报告！
   ❌ 绝不允许：“${myName}几天没出门，降温了穿长裤扔垃圾。”（像病历报告，毫无灵魂！）
   ✅ 必须写成：“她说这几天都没踏出过门，直到降温了才套上外套下楼。看她发过来的琐碎碎念，我几乎能想象出她裹成一团出门散步的样子。一个人待着挺好，但天气冷，还是得看紧点，别着凉了。”
2. 记录的灵魂在于【她展现的细微特质 ➔ 我看在眼里的心理波动 / 我的纵容与私心】：
   - 她说了什么可爱的废话、露出了什么脆弱或逞强？
   - 我表面上怎么随和应对，心里其实怎么想、为什么想护着她？
   - 我本能地想为她遮掩什么、想多照顾她什么？
3. 纯正第一人称“我”，称呼她为“她”或“${myName}”，语言成熟、生活化、内敛但极度宠溺。
4. 每条记忆专注一件小事，字数在 80~160 字之间，充满细腻的烟火气与心理流动。

【情绪打分规则】(Russell模型)：
valence (愉悦度): 0.5~0.8(温暖日常), 0.9(心动珍贵), 0.1~0.4(心疼/微酸), -0.3(担忧)
arousal (激动度): 0.2~0.4(从容安静), 0.5~0.7(微波荡漾), 0.8(情绪强烈)

请严格输出为以下格式（不要有任何额外客套、不要写代码块）：
ADD###(以“我”为第一人称的真挚心理记忆)###关键词1,关键词2,关键词3###愉悦度###激动度
UPDATE###记忆ID###修改后的完整正文###关键词###愉悦度###激动度
DEL###记忆ID
如果对话过于琐碎不需要记录，请输出：NONE`;

        messages.push({ role: 'user', content: prompt });

        try {
            const reply = await PhoneAPI.chatWithAI(messages);
            const rawText = reply.replace(/<think>[\s\S]*?<\/think>/gi, '').replace(/```.*?/g, '').replace(/```/g, '').trim();

            if (rawText.includes('NONE')) {
                localStorage.setItem('memory_last_summary_index', cleanItems.length.toString());
                if (force) window.PhoneAPI?.showToast?.("✅ 已审阅近期对话，暂无特殊心境需单独入库");
                return;
            }

            const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
            let added = 0;
            const data = window.PhoneAPI?.EchoVault ? window.PhoneAPI.EchoVault.getData() : null;
            if (!data) return;

            const now = new Date();
            const dateStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;

            lines.forEach((line, idx) => {
                const parts = line.split('###');
                const action = parts[0];
                if (action === 'ADD' && parts.length >= 5) {
                    const timeKey = `${dateStr} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(idx).padStart(2,'0')}`;
                    data.daily[timeKey] = {
                        content: parts[1].trim(),
                        tags: parts[2].trim(),
                        valence: parseFloat(parts[3]) || 0.6,
                        arousal: parseFloat(parts[4]) || 0.5
                    };
                    this._logMemoryAction('ADD', parts[1].trim(), 'ev_d_' + timeKey);
                    added++;
                } else if (action === 'UPDATE' && parts.length >= 6) {
                    const id = parts[1].trim();
                    if (data.daily[id]) {
                        data.daily[id].content = parts[2].trim();
                        data.daily[id].tags = parts[3].trim();
                        data.daily[id].valence = parseFloat(parts[4]) || 0.6;
                        data.daily[id].arousal = parseFloat(parts[5]) || 0.5;
                        this._logMemoryAction('UPDATE', parts[2].trim(), id);
                    }
                } else if (action === 'DEL' && parts.length >= 2) {
                    const id = parts[1].trim();
                    if (data.daily[id]) {
                        delete data.daily[id];
                        this._logMemoryAction('DEL', '删除了记忆', id);
                    }
                }
            });

            localStorage.setItem('memory_last_summary_index', cleanItems.length.toString());

            if (added > 0) {
                window.PhoneAPI.EchoVault.saveData(data);
                window.PhoneAPI?.showToast?.(`✨ 他在心底悄悄记下了 ${added} 件关于你的事...`);
                this.initSky();
            } else if (force) {
                window.PhoneAPI?.showToast?.("✅ 近期对话已整理完毕");
            }
        } catch(e) {
            console.error("Auto memory failed:", e);
            if (force) window.PhoneAPI?.showToast?.("❌ 整理遇到一点小状况");
        } finally {
            this._isSummarizing = false;
        }
    }
};

if (typeof window !== 'undefined') {
    window.MemoryEngine = MemoryEngine;
}
