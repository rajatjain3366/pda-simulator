import React, { useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sphere, Icosahedron, Box, Stars } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';

/* ─── Slow-pulsing emissive mesh ─────────────────────────────── */
function PulseMesh({ children, speed = 1 }) {
  const meshRef = useRef();
  useFrame(({ clock }) => {
    if (meshRef.current) {
      const t = clock.getElapsedTime() * speed;
      meshRef.current.material.emissiveIntensity = 0.4 + Math.sin(t) * 0.3;
    }
  });
  return React.cloneElement(children, { ref: meshRef });
}

/* ─── All floating 3D shapes ─────────────────────────────────── */
function FloatingShapes() {
  return (
    <>
      <ambientLight intensity={0.15} />
      <pointLight position={[8, 8, 4]}  color="#06b6d4" intensity={6}  distance={40} decay={2} />
      <pointLight position={[-8, -6, -4]} color="#9333ea" intensity={7}  distance={40} decay={2} />
      <pointLight position={[0,  4, 6]}  color="#ec4899" intensity={3}  distance={30} decay={2} />

      <Stars radius={120} depth={60} count={4000} factor={3} saturation={0.8} fade speed={0.5} />

      {/* Wireframe icosahedron — accent cyan */}
      <Float speed={1.4} rotationIntensity={1.6} floatIntensity={2.2}>
        <Icosahedron args={[1.1, 0]} position={[-3.2, 1.2, -1]}>
          <meshStandardMaterial color="#06b6d4" emissive="#06b6d4" emissiveIntensity={0.6} wireframe roughness={0} metalness={1} />
        </Icosahedron>
      </Float>

      {/* Glowing solid sphere — teal */}
      <Float speed={1.9} rotationIntensity={1.2} floatIntensity={1.8}>
        <PulseMesh speed={0.9}>
          <Sphere args={[1.0, 64, 64]} position={[3.4, -0.8, -2]}>
            <meshStandardMaterial color="#2dd4bf" emissive="#2dd4bf" emissiveIntensity={0.5} roughness={0.1} metalness={0.8} transparent opacity={0.85} />
          </Sphere>
        </PulseMesh>
      </Float>

      {/* Rotating box — purple */}
      <Float speed={0.9} rotationIntensity={2} floatIntensity={2.8}>
        <PulseMesh speed={1.2}>
          <Box args={[1.3, 1.3, 1.3]} position={[0, -2.8, -3]}>
            <meshStandardMaterial color="#7c3aed" emissive="#7c3aed" emissiveIntensity={0.5} roughness={0.2} metalness={0.7} />
          </Box>
        </PulseMesh>
      </Float>

      {/* Accept state — double sphere, hot pink */}
      <Float speed={2.2} rotationIntensity={1} floatIntensity={2}>
        <group position={[4.2, 2.1, -3.5]}>
          <Sphere args={[0.75, 32, 32]}>
            <meshStandardMaterial color="#ec4899" emissive="#ec4899" emissiveIntensity={0.8} wireframe roughness={0} />
          </Sphere>
          <Sphere args={[1.15, 32, 32]}>
            <meshStandardMaterial color="#ec4899" emissive="#ec4899" emissiveIntensity={0.2} transparent opacity={0.12} roughness={0} />
          </Sphere>
        </group>
      </Float>

      {/* Small satellite — amber */}
      <Float speed={3} rotationIntensity={3} floatIntensity={1.5}>
        <Icosahedron args={[0.5, 0]} position={[-4, -1.5, -1.5]}>
          <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={0.7} wireframe roughness={0} />
        </Icosahedron>
      </Float>

      {/* Bloom post-processing */}
      <EffectComposer>
        <Bloom
          luminanceThreshold={0.1}
          luminanceSmoothing={0.9}
          intensity={2.5}
          mipmapBlur
        />
      </EffectComposer>
    </>
  );
}

/* ─── Main LandingPage ───────────────────────────────────────── */
export default function LandingPage({ onEnter }) {
  const [exiting, setExiting] = useState(false);

  const handleEnter = () => {
    setExiting(true);
    setTimeout(onEnter, 700);
  };

  return (
    <div className="relative w-full min-h-screen bg-slate-950 overflow-x-hidden overflow-y-auto font-sans">

      {/* 3D canvas — fixed so it stays behind as you scroll */}
      <div className="fixed inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 9], fov: 45 }} gl={{ antialias: true }}>
          <FloatingShapes />
        </Canvas>
      </div>

      {/* Very subtle dark gradient veil over the canvas for text legibility */}
      <div className="fixed inset-0 z-[1] pointer-events-none bg-gradient-to-b from-slate-950/60 via-slate-950/30 to-slate-950/70" />

      {/* ── Hero section ───────────────────────────────────────── */}
      <div
        className={`relative z-10 w-full flex flex-col items-center justify-center min-h-screen text-center px-6 py-20 pointer-events-none transition-all duration-700 ease-in-out ${
          exiting ? 'opacity-0 -translate-y-12' : 'opacity-100 translate-y-0'
        }`}
      >
        {/* Badge */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-950/40 backdrop-blur-sm px-4 py-1.5 text-xs font-semibold tracking-widest text-cyan-300 uppercase shadow-[0_0_20px_rgba(6,182,212,0.15)]">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
          Theory of Computation · Interactive Visualizer
        </div>

        {/* Main heading — text-shadow keeps it readable over 3D */}
        <h1
          className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-6 leading-none"
          style={{ textShadow: '0 0 60px rgba(6,182,212,0.4), 0 2px 20px rgba(0,0,0,0.9)' }}
        >
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-purple-500">
            Universal PDA
          </span>
          <br />
          <span className="text-white drop-shadow-[0_4px_24px_rgba(0,0,0,1)]">Simulator</span>
        </h1>

        {/* Subtitle — dark pill ensures full readability over any background */}
        <p className="max-w-xl text-base md:text-lg text-slate-200 font-normal leading-relaxed mb-10 rounded-2xl bg-slate-950/50 backdrop-blur-sm px-5 py-3">
          Design, build, and <span className="text-cyan-400 font-semibold">visualize Pushdown Automata</span> step-by-step in an immersive dark environment.
        </p>

        {/* CTA button */}
        <button
          type="button"
          onClick={handleEnter}
          className="pointer-events-auto relative group overflow-hidden rounded-2xl border border-cyan-400/40 bg-slate-900/70 px-10 py-4 text-lg font-bold text-white shadow-[0_0_40px_rgba(6,182,212,0.25)] backdrop-blur-xl transition-all duration-300 hover:scale-105 hover:border-cyan-400 hover:shadow-[0_0_70px_rgba(6,182,212,0.5)]"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-teal-500/10 to-purple-500/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <span className="relative z-10 flex items-center gap-3">
            <span>Initialize Machine</span>
            <svg className="h-5 w-5 text-cyan-400 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </span>
        </button>

        {/* Scroll hint */}
        <div className="mt-14 flex flex-col items-center gap-2 text-slate-500 text-xs tracking-widest uppercase animate-bounce">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
          Scroll to read the docs
        </div>
      </div>

      {/* ── Docs section ─────────────────────────────────────────── */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 pb-24 space-y-6">

        {/* ── Notes ──────────────────────────────────── */}
        <div className="rounded-3xl border border-slate-700/60 bg-slate-900/80 backdrop-blur-xl p-6 shadow-2xl">
          <h2 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
            <span className="text-cyan-400">📌</span> Notes
          </h2>
          <p className="text-sm text-slate-400 mb-5">Key concepts you must know before running a simulation.</p>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 text-sm">
            {[
              { title: 'Deterministic Execution',    body: 'The first exact-match rule fires. If none matches, an epsilon (ε) transition is tried next.' },
              { title: 'Epsilon Transitions',         body: 'Use e or ε in the Input Symbol field for transitions that don\'t consume input.' },
              { title: 'Pushing Multiple Symbols',    body: 'Separate with spaces or commas: A Z0 or A, Z0. Leftmost is the new stack top.' },
              { title: 'Popping Only',               body: 'Leave "Symbols to Push/Pop" empty or enter e to pop without pushing anything.' },
              { title: 'Acceptance Condition',        body: 'Accepts only when the entire input is consumed AND the machine is in an accept state.', wide: true },
            ].map(({ title, body, wide }) => (
              <div
                key={title}
                className={`rounded-2xl border border-slate-700/50 bg-slate-800/60 px-4 py-4 text-slate-300 ${wide ? 'sm:col-span-2 xl:col-span-2' : ''}`}
              >
                <p className="font-semibold text-slate-100 mb-1">{title}</p>
                <p className="text-slate-400 text-sm leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── How to Use ────────────────────────────── */}
        <div className="rounded-3xl border border-slate-700/60 bg-slate-900/80 backdrop-blur-xl p-6 shadow-2xl">
          <h2 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
            <span className="text-purple-400">🚀</span> How to Use the Simulator
          </h2>
          <p className="text-sm text-slate-400 mb-5">
            There are <strong className="text-slate-200">3 ways</strong> to load rules — choose whichever is fastest.
          </p>

          <div className="grid gap-4 sm:grid-cols-3 mb-5">
            {/* Method 1 */}
            <div className="rounded-2xl border border-cyan-700/40 bg-cyan-950/30 p-4 text-sm text-slate-300">
              <p className="font-bold text-cyan-300 text-base mb-0.5">⚡ Method 1</p>
              <p className="font-semibold text-slate-200 mb-3">Quick Load Preset</p>
              <ol className="list-decimal space-y-1.5 pl-5 text-slate-400">
                <li>Find <strong className="text-slate-200">⚡ Quick Load Preset</strong> in the builder.</li>
                <li>Pick a language from the dropdown.</li>
                <li>Click <strong className="text-slate-200">Load Preset</strong>.</li>
                <li>All rules + settings load instantly!</li>
              </ol>
              <p className="mt-3 text-xs text-slate-500 leading-relaxed">aⁿbⁿ · wcwᴿ · Parens · aⁿb²ⁿ · a²ⁿbⁿ · aⁿbᵐ (n≤m / n≥m) · aⁿbⁿcᵐ · aᵐbⁿcⁿ · Balanced {'{}'}</p>
            </div>

            {/* Method 2 */}
            <div className="rounded-2xl border border-orange-700/40 bg-orange-950/30 p-4 text-sm text-slate-300">
              <p className="font-bold text-orange-300 text-base mb-0.5">📋 Method 2</p>
              <p className="font-semibold text-slate-200 mb-3">Bulk Import</p>
              <ol className="list-decimal space-y-1.5 pl-5 text-slate-400">
                <li>Find <strong className="text-slate-200">📋 Bulk Import Rules</strong>.</li>
                <li>Paste rules (one per line):</li>
              </ol>
              <pre className="mt-2 rounded-xl bg-slate-950/80 border border-slate-700/50 px-3 py-2 font-mono text-[10px] text-cyan-300 overflow-x-auto leading-relaxed">
{`q0, a, Z0 -> q0, A Z0
q0, b, A  -> q1, e
q1, e, Z0 -> q_accept, Z0`}
              </pre>
              <ol className="mt-2 list-decimal space-y-1 pl-5 text-slate-400" start={3}>
                <li>Click <strong className="text-slate-200">Import Rules</strong>.</li>
                <li>Lines starting with <code className="text-cyan-400">#</code> are comments.</li>
              </ol>
            </div>

            {/* Method 3 */}
            <div className="rounded-2xl border border-slate-600/40 bg-slate-800/40 p-4 text-sm text-slate-300">
              <p className="font-bold text-slate-200 text-base mb-0.5">✏️ Method 3</p>
              <p className="font-semibold text-slate-200 mb-3">Manual Entry</p>
              <ol className="list-decimal space-y-1.5 pl-5 text-slate-400">
                <li>Find <strong className="text-slate-200">Add Transition Rule</strong> in the builder.</li>
                <li>Fill: State · Input · Stack Top · Next State · Push.</li>
                <li>Click <strong className="text-slate-200">Add Rule</strong>. Repeat per rule.</li>
                <li>Use <strong className="text-slate-200">Undo Last Rule</strong> or 🗑️ to fix mistakes.</li>
              </ol>
            </div>
          </div>

          {/* Running steps */}
          <div className="rounded-2xl border border-slate-700/50 bg-slate-800/50 px-5 py-4 text-sm">
            <p className="font-bold text-slate-100 mb-3">▶ Running a Simulation</p>
            <div className="grid gap-x-8 gap-y-2 sm:grid-cols-2 xl:grid-cols-3 text-slate-400">
              {[
                ['1.', 'Enter a test string in ', 'Test String', '.'],
                ['2.', 'Click ', 'Load String', ' to reset tape & stack.'],
                ['3.', 'Use ', 'Step', ' for one transition at a time.'],
                ['4.', 'Use ', 'Play / Pause', ' to auto-run or pause.'],
                ['5.', 'Watch the ', 'Status bar', ' at the bottom.'],
                ['6.', 'Click ', 'Reset Machine', ' to start over.'],
              ].map(([num, pre, bold, post]) => (
                <span key={num}>
                  <span className="text-cyan-500 font-bold mr-1">{num}</span>
                  {pre}<strong className="text-slate-200">{bold}</strong>{post}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Final CTA repeat at bottom */}
        <div className="flex justify-center pt-4 pb-6">
          <button
            type="button"
            onClick={handleEnter}
            className="group relative overflow-hidden rounded-2xl border border-purple-400/40 bg-slate-900/70 px-12 py-4 text-lg font-bold text-white shadow-[0_0_40px_rgba(147,51,234,0.25)] backdrop-blur-xl transition-all duration-300 hover:scale-105 hover:border-purple-400 hover:shadow-[0_0_70px_rgba(147,51,234,0.5)]"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <span className="relative z-10 flex items-center gap-3">
              <svg className="h-5 w-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Launch Simulator
            </span>
          </button>
        </div>

      </div>
    </div>
  );
}
