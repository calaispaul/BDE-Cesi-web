/* Logo chromé en 3D (WebGL) : tourne lentement en fond de page.
   Si WebGL est absent, si l'image ne se charge pas ou si l'utilisateur demande moins d'animations,
   on garde simplement le logo fixe en image (aucune erreur, aucun trou). */
(function(){
"use strict";
const host = document.querySelector(".bg-logo");
if(!host) return;
const reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)");
if(reduce && reduce.matches) return;

const SRC = "images/logo-chrome.webp";
const TURN = 30;        // secondes pour un tour complet
const DEPTH = 0.09;     // épaisseur du logo (hauteur du logo = 1)
const MAX_SLICES = 72;  // tranches empilées pour donner du volume (adaptées à l'angle)

const canvas = document.createElement("canvas");
let gl = null;
try{
  gl = canvas.getContext("webgl", {alpha:true, antialias:true, premultipliedAlpha:true, powerPreference:"low-power"});
}catch(e){}
if(!gl) return;

const VS = `
attribute vec2 p;
uniform float uZ, uA, uT, uS, uAsp, uRatio;
varying vec2 vUv;
void main(){
  vUv = p + 0.5;
  vec3 v = vec3(p.x * uRatio, p.y, uZ) * vec3(uS, uS, 1.0);
  float ca = cos(uA), sa = sin(uA);
  float x = v.x * ca + v.z * sa;
  float z = -v.x * sa + v.z * ca;
  float ct = cos(uT), st = sin(uT);
  float y = v.y * ct - z * st;
  z = v.y * st + z * ct;
  float cam = 4.0, n = 2.5, f = 5.5;
  float d = cam - z;
  float k = 5.14;                                   /* 1 / tan(fov / 2), fov = 22° */
  gl_Position = vec4(x * k / uAsp, y * k, (f + n) / (f - n) * d - 2.0 * f * n / (f - n), d);
}`;
const FS = `
precision mediump float;
uniform sampler2D uTex;
uniform float uFace, uAf, uShade;
varying vec2 vUv;
void main(){
  vec2 uv = vec2(vUv.x, 1.0 - vUv.y);
  if(uFace < -0.5) uv.x = 1.0 - uv.x;               /* dos : le logo reste lisible, pas en miroir */
  vec4 t = texture2D(uTex, uv);
  if(uFace > -0.5 && uFace < 0.5) { if(t.a < 0.4) discard; gl_FragColor = vec4(vec3(0.66, 0.68, 0.72) * uShade * (0.72 + 0.28 * sin(uv.y * 16.0 + uAf * 3.0)), 1.0); return; }
  if(t.a < 0.4) discard;
  /* chrome neutre : on garde les lumières et les ombres du métal, on retire la dominante bleutée et on ajoute du contraste */
  float l = dot(t.rgb, vec3(0.299, 0.587, 0.114));
  vec3 c = mix(t.rgb, vec3(l), 0.4);
  c = clamp((c - 0.45) * 1.12 + 0.47, 0.0, 1.0);
  /* reflet blanc qui balaie le métal pendant la rotation */
  float s = sin((uv.x * 1.3 + uv.y * 0.7) * 5.0 - uAf * 2.0);
  c += pow(max(s, 0.0), 8.0) * 0.2;
  c *= 0.9 + 0.1 * abs(cos(uAf));
  gl_FragColor = vec4(c, 1.0);
}`;

function sh(type, src){
  const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
  if(!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
  return s;
}
let prog;
try{
  prog = gl.createProgram();
  gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS));
  gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS));
  gl.linkProgram(prog);
  if(!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
}catch(e){ return; }
gl.useProgram(prog);

const buf = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buf);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-.5,-.5, .5,-.5, -.5,.5, .5,.5]), gl.STATIC_DRAW);
const loc = gl.getAttribLocation(prog, "p");
gl.enableVertexAttribArray(loc);
gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
const U = n => gl.getUniformLocation(prog, n);
const uZ = U("uZ"), uA = U("uA"), uT = U("uT"), uS = U("uS"), uAsp = U("uAsp"), uRatio = U("uRatio"), uFace = U("uFace"), uShade = U("uShade"), uAf = U("uAf");

let ratio = 1, raf = 0, running = false, t0 = 0, ready = false;

function size(){
  const r = host.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  const w = Math.max(2, Math.round(r.width * dpr)), h = Math.max(2, Math.round(r.height * dpr));
  if(canvas.width !== w || canvas.height !== h){ canvas.width = w; canvas.height = h; }
  gl.viewport(0, 0, w, h);
  return w / h;
}

function draw(now){
  const asp = size();
  const sec = (now - t0) / 1000;
  /* le logo s'attarde de face (et de dos) et traverse vite le profil : il reste lisible la plupart du temps */
  const th = ((sec / TURN) % 1) * Math.PI * 2;
  const a = th - 0.42 * Math.sin(2 * th);
  const tilt = Math.sin(sec / 7) * 0.12;
  /* le logo tient toujours dans la zone, même sur un écran étroit */
  const scale = Math.min(1.2, 1.4 * asp / Math.max(ratio, 0.1));
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.uniform1f(uA, a); gl.uniform1f(uAf, a); gl.uniform1f(uT, tilt); gl.uniform1f(uS, scale);
  gl.uniform1f(uAsp, asp); gl.uniform1f(uRatio, ratio);
  /* de face : 2 tranches suffisent ; de profil on empile assez de tranches pour que l'épaisseur paraisse pleine */
  const pxDepth = DEPTH * Math.abs(Math.sin(a)) * scale * 0.64 * gl.drawingBufferHeight;
  const n = Math.max(2, Math.min(MAX_SLICES, Math.ceil(pxDepth / 1.2)));
  const base = 0.75 + 0.25 * Math.abs(Math.cos(a));
  for(let i = 0; i <= n; i++){
    const z = DEPTH / 2 - (DEPTH * i) / n;
    const face = i === 0 ? 1 : (i === n ? -1 : 0);
    gl.uniform1f(uShade, base * (0.82 + 0.18 * Math.sin(Math.PI * i / n)));
    gl.uniform1f(uZ, z); gl.uniform1f(uFace, face);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }
}

function loop(now){
  if(!running) return;
  draw(now);
  raf = requestAnimationFrame(loop);
}
function start(){
  if(running || !ready || document.hidden || (reduce && reduce.matches)) return;
  running = true; t0 = t0 || performance.now(); raf = requestAnimationFrame(loop);
}
function stop(){ running = false; cancelAnimationFrame(raf); }

function fail(){
  stop();
  host.classList.remove("gl-on");
  if(canvas.parentNode) canvas.parentNode.removeChild(canvas);
}

function upload(img, r){
  /* texture à dimensions puissance de 2 : permet les mipmaps, donc un rendu net et sans scintillement */
  const N = 1024, c = document.createElement("canvas"); c.width = c.height = N;
  const x = c.getContext("2d");
  x.imageSmoothingQuality = "high";
  ratio = r;
  /* l'image est étirée sur tout le carré ; le rapport d'origine est rétabli par la forme du quad */
  x.drawImage(img, 0, 0, N, N);
  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, c);   /* lève une erreur si le navigateur bloque l'image (file://) */
  gl.generateMipmap(gl.TEXTURE_2D);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  if(gl.getError() !== gl.NO_ERROR) throw new Error("texture");
  gl.uniform1i(U("uTex"), 0);
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);
  host.appendChild(canvas);
  canvas.setAttribute("aria-hidden", "true");
  ready = true;
  draw(performance.now());                 /* première image avant de masquer l'image fixe : pas de clignotement */
  host.classList.add("gl-on");
  start();
}
/* 1) l'image du site ; 2) si le navigateur la refuse pour WebGL (ouverture directe du fichier), la version intégrée dans logo-tex.js */
function embedded(){
  const s = document.createElement("script");
  s.src = "logo-tex.js";
  s.onload = () => {
    const T = window.LOGO_TEX; if(!T) return fail();
    const i = new Image();
    i.onload = () => { try{ upload(i, T.ratio); }catch(e){ fail(); } };
    i.onerror = fail;
    i.src = T.src;
  };
  s.onerror = fail;
  document.head.appendChild(s);
}
const img = new Image();
img.decoding = "async";
img.onload = () => { try{ upload(img, img.naturalWidth / img.naturalHeight); }catch(e){ embedded(); } };
img.onerror = embedded;
img.src = SRC;

document.addEventListener("visibilitychange", () => document.hidden ? stop() : start());
window.addEventListener("resize", () => { if(ready && !running) draw(performance.now()); });
canvas.addEventListener("webglcontextlost", e => { e.preventDefault(); fail(); });
if(reduce && reduce.addEventListener) reduce.addEventListener("change", () => reduce.matches ? (stop(), host.classList.remove("gl-on")) : (host.classList.add("gl-on"), start()));
})();
