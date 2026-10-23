'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const ThreeGlobe = dynamic(
  () => import('@/components/animations/ThreeGlobe').then((mod) => mod.ThreeGlobe),
  { ssr: false }
);

interface HeroSectionProps {
  onContactUs: () => void;
}

export function HeroSection({ onContactUs }: HeroSectionProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [webGlSupported, setWebGlSupported] = useState(true);

  // WebGL Fluid Gold Shader (ANIMATION_24 from Sovereign Gold Stitch Design System)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    function syncSize() {
      if (!canvas) return;
      const w = canvas.clientWidth || 1280;
      const h = canvas.clientHeight || 720;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
    }

    let observer: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(syncSize);
      observer.observe(canvas);
    }
    syncSize();

    const gl =
      (canvas.getContext('webgl') as WebGLRenderingContext | null) ||
      (canvas.getContext('experimental-webgl') as WebGLRenderingContext | null);

    if (!gl) {
      setWebGlSupported(false);
      return;
    }

    const vs = `attribute vec2 a_position;
varying vec2 v_texCoord;
void main() {
  v_texCoord = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;

    const fs = `precision highp float;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;
varying vec2 v_texCoord;

vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v -   i + dot(i, C.xx);
  vec2 i1  = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m;
  m = m*m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  vec2 p = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / min(u_resolution.x, u_resolution.y);

  float t = u_time * 0.25;
  vec2 m = (u_mouse.xy / u_resolution.xy - 0.5) * 0.4;
  p += m * 0.15;

  float n1 = snoise(p * 1.2 + vec2(t * 0.4, t * 0.2));
  float n2 = snoise(p * 2.5 - vec2(t * 0.3, -t * 0.15) + vec2(n1 * 0.8));
  float n3 = snoise(p * 4.0 + vec2(n2 * 0.5, t * 0.1));

  float flow = smoothstep(-0.4, 0.8, n1 * 0.5 + n2 * 0.35 + n3 * 0.15);

  vec3 deepBg = vec3(0.039, 0.059, 0.114);
  vec3 midNavy = vec3(0.07, 0.11, 0.19);
  vec3 goldDark = vec3(0.55, 0.38, 0.08);
  vec3 goldMain = vec3(0.851, 0.631, 0.118);
  vec3 goldBright = vec3(0.99, 0.86, 0.48);
  vec3 cyanPulse = vec3(0.12, 0.82, 0.72);

  vec2 lightCenter = vec2(0.45, -0.05);
  float dist = length(p - lightCenter);
  float radialGlow = exp(-dist * 1.2);

  float ribbon = sin(p.x * 2.5 + p.y * 1.5 + n2 * 1.5 + t) * 0.5 + 0.5;
  ribbon = pow(ribbon, 6.0);

  vec3 col = mix(deepBg, midNavy, uv.y * 0.8);
  col += goldDark * (flow * 0.35) * radialGlow;
  col += goldMain * (ribbon * 0.55) * (1.0 - dist * 0.4);
  col += goldBright * pow(flow * ribbon, 2.0) * 0.75;
  col += cyanPulse * (pow(n3 * 0.5 + 0.5, 4.0) * 0.12) * radialGlow;

  float vig = smoothstep(1.6, 0.4, length(p * vec2(0.8, 1.0)));
  col *= vig;

  gl_FragColor = vec4(col, 1.0);
}`;

    function createShader(type: number, src: string) {
      if (!gl) return null;
      const s = gl.createShader(type);
      if (!s) return null;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    }

    const vertexShader = createShader(gl.VERTEX_SHADER, vs);
    const fragmentShader = createShader(gl.FRAGMENT_SHADER, fs);
    if (!vertexShader || !fragmentShader) return;

    const prog = gl.createProgram();
    if (!prog) return;
    gl.attachShader(prog, vertexShader);
    gl.attachShader(prog, fragmentShader);
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

    const pos = gl.getAttribLocation(prog, 'a_position');
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(prog, 'u_time');
    const uRes = gl.getUniformLocation(prog, 'u_resolution');
    const uMouse = gl.getUniformLocation(prog, 'u_mouse');

    let mouse = { x: canvas.width / 2, y: canvas.height / 2 };
    const onMouseMove = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width && rect.height) {
        const nx = (event.clientX - rect.left) / rect.width;
        const ny = 1.0 - (event.clientY - rect.top) / rect.height;
        mouse.x = nx * canvas.width;
        mouse.y = ny * canvas.height;
      }
    };
    window.addEventListener('mousemove', onMouseMove);

    let animationId: number;
    function render(t: number) {
      if (!gl || !canvas) return;
      gl.viewport(0, 0, canvas.width, canvas.height);
      if (uTime) gl.uniform1f(uTime, t * 0.001);
      if (uRes) gl.uniform2f(uRes, canvas.width, canvas.height);
      if (uMouse) gl.uniform2f(uMouse, mouse.x, mouse.y);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      animationId = requestAnimationFrame(render);
    }
    animationId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('mousemove', onMouseMove);
      if (observer) observer.disconnect();
    };
  }, []);

  return (
    <section className="relative overflow-hidden bg-slate-950 text-surface-pure min-h-[720px] lg:min-h-[820px] flex items-center pt-28 pb-16 lg:py-32">
      {/* Procedural Ambient Fluid Gold Background Shader */}
      <div className="absolute inset-0 w-full h-full opacity-60 pointer-events-none">
        <canvas
          ref={canvasRef}
          id="shader-canvas-ANIMATION_24"
          className="w-full h-full block"
        />
        {!webGlSupported && (
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-500/20 via-slate-900 to-slate-950" />
        )}
      </div>

      {/* Deep Obsidian Atmospheric Gradient Overlays */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/75 to-slate-950/20 z-0"></div>
      <div className="pointer-events-none absolute -top-32 left-1/4 w-[650px] h-[650px] bg-primary-container/15 rounded-full blur-[140px] z-0"></div>
      <div className="pointer-events-none absolute bottom-0 right-0 w-[550px] h-[550px] bg-gold-dark/15 rounded-full blur-[160px] z-0"></div>

      {/* Hero Content Grid */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* Left Column: Monumental Value Proposition */}
          <div className="lg:col-span-7 flex flex-col items-start z-10">
            {/* Launch Badge with Glowing Gold and Emerald Border */}
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-slate-900/80 backdrop-blur-md border border-amber-500/40 shadow-[0_0_20px_rgba(217,161,30,0.25)] mb-8">
              <span className="text-base leading-none">🇳🇬</span>
              <span className="font-label-md text-label-md text-primary-fixed-dim font-bold tracking-wide">
                Starting with Nigeria • Expanding Pan-Africa
              </span>
              <span className="relative flex h-2 w-2 ml-1">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success-emerald opacity-80"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-success-emerald"></span>
              </span>
            </div>

            {/* Monumental Headline with Iridescent Sovereign Gold Highlight */}
            <h1 className="font-display-xl text-surface-pure tracking-tight font-bold mb-6 leading-tight">
              Regulated{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-fixed via-primary-container to-amber-200 drop-shadow-[0_2px_18px_rgba(217,161,30,0.4)] relative inline-block">
                Cross-Border
              </span>{' '}
              Liquidity for African Enterprises
            </h1>

            {/* Subheadline */}
            <p className="font-body-lg text-slate-300 max-w-2xl mb-10 leading-relaxed font-normal">
              Execute high-volume USD, EUR, and GBP settlements across 40+ global corridors with zero slippage, institutional treasury security, and wholesale interbank pricing.
            </p>

            {/* High-Conversion Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto mb-10">
              <Link
                href="/customer-auth/register"
                className="group inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl text-white font-label-lg font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-200 active:scale-95"
                style={{ backgroundColor: '#c9a227' }}
              >
                <span>Register Business</span>
                <span className="material-symbols-outlined text-[19px] group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </Link>
              <button
                type="button"
                onClick={onContactUs}
                className="inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-xl bg-slate-900/60 backdrop-blur-xl border border-amber-500/40 text-surface-pure hover:bg-slate-800/80 hover:border-amber-400 font-label-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95"
              >
                <span className="material-symbols-outlined text-[19px] text-primary-fixed-dim">
                  support_agent
                </span>
                <span>Contact Treasury Desk</span>
              </button>
            </div>

            {/* Under-Hero Institutional Trust Badges */}
            <div className="flex flex-wrap items-center gap-y-3 gap-x-5 pt-6 border-t border-slate-800/80 w-full font-label-md text-slate-300">
              <div className="flex items-center gap-2 text-surface-pure font-semibold">
                <span className="material-symbols-outlined text-success-emerald text-[20px]">
                  verified
                </span>
                <span>Central Bank &amp; CAC RC: 9463271 Compliant</span>
              </div>
              <span className="text-slate-700 hidden sm:inline">•</span>
              <div className="flex items-center gap-2 text-surface-pure font-semibold">
                <span className="material-symbols-outlined text-success-emerald text-[20px]">
                  account_balance
                </span>
                <span>Tier-1 Segregated Custody</span>
              </div>
              <span className="text-slate-700 hidden sm:inline">•</span>
              <div className="flex items-center gap-2 text-surface-pure font-semibold">
                <span className="material-symbols-outlined text-success-emerald text-[20px]">
                  bolt
                </span>
                <span>Instant Clearing</span>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Liquidity Globe & Floating Glassmorphic Telemetry Cards */}
          <div className="lg:col-span-5 relative w-full min-h-[580px] lg:min-h-[680px] flex items-center justify-center">
            {/* Radial Backlight Glow behind the Centerpiece */}
            <div className="pointer-events-none absolute w-[480px] h-[480px] rounded-full bg-primary-container/20 blur-[120px] z-0"></div>

            {/* Stylized 3D Rotating Globe via Three.js */}
            <div className="relative z-10 w-full max-w-[500px] aspect-square">
              <ThreeGlobe className="w-full h-full" />
            </div>

            {/* Floating Telemetry Card 1: Live Status Chip (Top Right) */}
            <div className="absolute top-2 right-0 sm:right-2 z-20 backdrop-blur-xl bg-slate-950/85 border border-amber-500/30 rounded-2xl p-3.5 sm:p-4 shadow-2xl flex items-center gap-3">
              <div className="relative flex h-3 w-3 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success-emerald opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-success-emerald"></span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-label-sm text-[11px] font-bold text-surface-pure uppercase tracking-wider">
                    SWIFT GPI &amp; NIBSS
                  </span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono font-bold">
                    ONLINE
                  </span>
                </div>
                <span className="font-body-sm text-[12px] text-slate-300 font-code-num">
                  Sub-12m Median Settlement
                </span>
              </div>
            </div>

            {/* Floating Telemetry Card 2: Live Transaction Execution Pill (Bottom Left) */}
            <div className="absolute bottom-8 sm:bottom-12 left-0 sm:-left-4 z-20 backdrop-blur-xl bg-slate-950/90 border border-amber-500/35 rounded-2xl p-4 shadow-2xl max-w-[310px] sm:max-w-[340px]">
              <div className="flex items-center justify-between gap-3 mb-2 pb-2 border-b border-slate-800/80">
                <div className="flex items-center gap-2">
                  <span className="text-xs">🇳🇬</span>
                  <span className="font-label-sm text-[11px] font-bold text-slate-200">Lagos</span>
                  <span className="material-symbols-outlined text-[14px] text-primary-fixed-dim">
                    arrow_forward
                  </span>
                  <span className="text-xs">🇬🇧</span>
                  <span className="font-label-sm text-[11px] font-bold text-slate-200">London</span>
                </div>
                <span className="inline-flex items-center gap-1 font-label-sm text-[10px] text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  <span className="material-symbols-outlined text-[12px]">verified</span>Tier-1
                </span>
              </div>
              <div className="mb-2">
                <div className="flex items-center gap-1.5">
                  <span className="font-label-md text-[13px] font-bold text-surface-pure">
                    Apex Logistics Ltd
                  </span>
                </div>
                <span className="font-body-sm text-[11px] text-slate-400 block">
                  London, United Kingdom
                </span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
                <span className="font-headline-sm text-[18px] font-code-num font-bold text-primary-fixed-dim">
                  £42,500.00
                </span>
                <span className="font-label-sm text-[11px] text-slate-300 flex items-center gap-1 font-medium">
                  <span className="material-symbols-outlined text-[14px] text-success-emerald">
                    check_circle
                  </span>{' '}
                  Settled in 8 mins
                </span>
              </div>
            </div>

            {/* Floating Telemetry Card 3: Sovereign Corridors Badge (Bottom Right) */}
            <div className="absolute -bottom-2 right-2 sm:right-6 z-20 backdrop-blur-xl bg-slate-950/80 border border-amber-500/30 rounded-xl px-4 py-2.5 shadow-2xl flex items-center gap-2.5">
              <span className="material-symbols-outlined text-primary-fixed-dim text-[18px]">
                public
              </span>
              <span className="font-label-sm text-[12px] font-semibold text-surface-pure font-code-num">
                40+ Sovereign Corridors <span className="text-amber-500/60 mx-1">|</span> Zero Slippage FX
              </span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
