import React from 'react';
import { Canvas } from '@react-three/fiber';
import { Float, Sphere, Icosahedron, Box, Stars } from '@react-three/drei';

function FloatingShapes() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} color="#06b6d4" intensity={4} distance={50} decay={2} />
      <pointLight position={[-10, -10, -10]} color="#9333ea" intensity={5} distance={50} decay={2} />
      <pointLight position={[0, 0, 5]} color="#ffffff" intensity={0.5} />
      
      <Stars radius={100} depth={50} count={3000} factor={4} saturation={0.5} fade speed={1} />

      {/* Abstract State 1 */}
      <Float speed={1.5} rotationIntensity={1.5} floatIntensity={2}>
        <Icosahedron args={[1, 0]} position={[-3, 1, -2]}>
          <meshStandardMaterial color="#0ea5e9" wireframe={true} roughness={0.1} metalness={0.8} />
        </Icosahedron>
      </Float>

      {/* Abstract State 2 */}
      <Float speed={2} rotationIntensity={2} floatIntensity={1.5}>
        <Sphere args={[1.2, 32, 32]} position={[3, -1, -3]}>
          <meshStandardMaterial color="#2dd4bf" roughness={0.2} metalness={0.9} opacity={0.6} transparent />
        </Sphere>
      </Float>

      {/* Abstract State 3 */}
      <Float speed={1} rotationIntensity={1} floatIntensity={3}>
        <Box args={[1.5, 1.5, 1.5]} position={[0, -2.5, -4]}>
          <meshStandardMaterial color="#8b5cf6" roughness={0.3} metalness={0.7} />
        </Box>
      </Float>
      
      {/* Accept State (Double Sphere representation) */}
      <Float speed={2.5} rotationIntensity={1.2} floatIntensity={2}>
        <group position={[4, 2, -4]}>
          <Sphere args={[0.8, 16, 16]}>
            <meshStandardMaterial color="#06b6d4" wireframe={true} roughness={0.1} />
          </Sphere>
          <Sphere args={[1.2, 16, 16]}>
            <meshStandardMaterial color="#06b6d4" transparent opacity={0.15} roughness={0.1} />
          </Sphere>
        </group>
      </Float>

    </>
  );
}

export default function LandingPage({ onEnter }) {
  return (
    <div className="relative w-full h-screen bg-slate-950 overflow-hidden font-sans">
      {/* 3D Background */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
          <FloatingShapes />
        </Canvas>
      </div>

      {/* Foreground UI layer */}
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center pointer-events-none">
        <div className="flex flex-col items-center justify-center p-8 text-center transition-all duration-1000 ease-out transform translate-y-0 opacity-100">
          
          <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 drop-shadow-[0_0_20px_rgba(6,182,212,0.6)] mb-6">
            Universal PDA Simulator
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-300 max-w-2xl font-light mb-12 drop-shadow-md">
            An immersive environment to design, build, and visualize Pushdown Automata models for the Theory of Computation.
          </p>
          
          <button 
            type="button"
            onClick={onEnter}
            className="pointer-events-auto relative group overflow-hidden rounded-full border border-slate-600 bg-slate-800/50 px-10 py-4 text-xl font-semibold text-slate-100 shadow-[0_0_40px_rgba(6,182,212,0.2)] backdrop-blur-xl transition-all duration-300 hover:scale-105 hover:bg-slate-700/60 hover:shadow-[0_0_60px_rgba(147,51,234,0.4)] hover:border-cyan-400"
          >
            {/* Soft inner glow */}
            <div className="absolute inset-0 z-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <span className="relative z-10 flex items-center justify-center gap-3">
              Initialize Machine
              <svg className="h-6 w-6 transition-transform duration-300 group-hover:translate-x-1 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
