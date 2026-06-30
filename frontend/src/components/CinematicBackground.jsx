import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, MeshWobbleMaterial, Environment } from '@react-three/drei';
import * as THREE from 'three';

/* ── Floating geometric shape ─────────────────── */
function FloatingShape({ position, rotation, scale, color, speed, distort, shape = 'icosahedron' }) {
  const meshRef = useRef();

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime() * speed;
    meshRef.current.rotation.x = Math.sin(t * 0.4) * 0.3 + rotation[0];
    meshRef.current.rotation.y = Math.cos(t * 0.3) * 0.4 + rotation[1];
    meshRef.current.rotation.z = Math.sin(t * 0.2) * 0.2;
    meshRef.current.position.y = position[1] + Math.sin(t * 0.5) * 0.3;
  });

  const geometry = useMemo(() => {
    switch (shape) {
      case 'torus': return <torusGeometry args={[1, 0.4, 16, 32]} />;
      case 'octahedron': return <octahedronGeometry args={[1, 0]} />;
      case 'dodecahedron': return <dodecahedronGeometry args={[1, 0]} />;
      case 'torusKnot': return <torusKnotGeometry args={[0.8, 0.3, 100, 16]} />;
      case 'cone': return <coneGeometry args={[1, 2, 6]} />;
      default: return <icosahedronGeometry args={[1, 1]} />;
    }
  }, [shape]);

  return (
    <Float speed={speed * 0.5} rotationIntensity={0.5} floatIntensity={0.8}>
      <mesh ref={meshRef} position={position} scale={scale}>
        {geometry}
        <MeshDistortMaterial
          color={color}
          transparent
          opacity={0.15}
          roughness={0.4}
          metalness={0.8}
          distort={distort}
          speed={speed}
          wireframe={Math.random() > 0.5}
        />
      </mesh>
    </Float>
  );
}

/* ── Large glass sphere ─────────────────── */
function GlassSphere({ position, scale, color }) {
  const meshRef = useRef();

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();
    meshRef.current.rotation.y = t * 0.1;
    meshRef.current.rotation.x = Math.sin(t * 0.15) * 0.1;
  });

  return (
    <mesh ref={meshRef} position={position} scale={scale}>
      <sphereGeometry args={[1, 64, 64]} />
      <MeshDistortMaterial
        color={color}
        transparent
        opacity={0.08}
        roughness={0.1}
        metalness={0.9}
        distort={0.4}
        speed={1.5}
      />
    </mesh>
  );
}

/* ── Particle field ─────────────────── */
function ParticleField({ count = 200, color = '#6366f1' }) {
  const meshRef = useRef();
  const particlesPosition = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    return positions;
  }, [count]);

  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.02;
    meshRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.01) * 0.1;
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={particlesPosition}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color={color}
        size={0.03}
        transparent
        opacity={0.6}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/* ── Ring/orbit decoration ─────────────────── */
function OrbitRing({ radius, color, speed, tilt }) {
  const ringRef = useRef();

  useFrame((state) => {
    if (!ringRef.current) return;
    ringRef.current.rotation.z = state.clock.getElapsedTime() * speed;
  });

  return (
    <mesh ref={ringRef} rotation={tilt}>
      <torusGeometry args={[radius, 0.01, 8, 100]} />
      <meshBasicMaterial color={color} transparent opacity={0.2} />
    </mesh>
  );
}

/* ── Moving light ─────────────────── */
function MovingLight({ color, intensity, speed }) {
  const lightRef = useRef();

  useFrame((state) => {
    if (!lightRef.current) return;
    const t = state.clock.getElapsedTime() * speed;
    lightRef.current.position.x = Math.sin(t) * 5;
    lightRef.current.position.y = Math.cos(t * 0.7) * 3;
    lightRef.current.position.z = Math.sin(t * 0.5) * 4;
  });

  return <pointLight ref={lightRef} color={color} intensity={intensity} distance={15} />;
}

/* ── Main scene ─────────────────── */
function Scene({ isDark }) {
  const primaryColor = isDark ? '#818cf8' : '#6366f1';
  const accentColor = isDark ? '#34d399' : '#10b981';
  const purpleColor = isDark ? '#a78bfa' : '#8b5cf6';

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={isDark ? 0.1 : 0.2} />
      <directionalLight position={[5, 5, 5]} intensity={isDark ? 0.3 : 0.5} color="#ffffff" />
      <MovingLight color={primaryColor} intensity={isDark ? 2 : 1.5} speed={0.3} />
      <MovingLight color={accentColor} intensity={isDark ? 1.5 : 1} speed={0.5} />

      {/* Large background spheres */}
      <GlassSphere position={[-4, 2, -6]} scale={3} color={primaryColor} />
      <GlassSphere position={[5, -2, -8]} scale={4} color={purpleColor} />
      <GlassSphere position={[0, -4, -10]} scale={2.5} color={accentColor} />

      {/* Floating geometric shapes */}
      <FloatingShape position={[-3, 1, -3]} rotation={[0.5, 0.3, 0]} scale={0.8} color={primaryColor} speed={0.8} distort={0.3} shape="icosahedron" />
      <FloatingShape position={[3, 2, -4]} rotation={[0.2, 0.8, 0.1]} scale={0.6} color={accentColor} speed={1.0} distort={0.4} shape="octahedron" />
      <FloatingShape position={[-2, -2, -2]} rotation={[0.7, 0.2, 0.5]} scale={0.5} color={purpleColor} speed={0.6} distort={0.2} shape="dodecahedron" />
      <FloatingShape position={[4, -1, -5]} rotation={[0.3, 0.6, 0.2]} scale={0.7} color={primaryColor} speed={0.9} distort={0.35} shape="torus" />
      <FloatingShape position={[-4, -3, -4]} rotation={[0.1, 0.4, 0.8]} scale={0.4} color={accentColor} speed={1.2} distort={0.25} shape="torusKnot" />
      <FloatingShape position={[2, 3, -6]} rotation={[0.6, 0.1, 0.3]} scale={0.55} color={purpleColor} speed={0.7} distort={0.3} shape="cone" />
      <FloatingShape position={[-1, 4, -7]} rotation={[0.4, 0.7, 0.2]} scale={0.45} color={primaryColor} speed={1.1} distort={0.2} shape="octahedron" />

      {/* Orbit rings */}
      <OrbitRing radius={3} color={primaryColor} speed={0.1} tilt={[0.3, 0.2, 0]} />
      <OrbitRing radius={4.5} color={accentColor} speed={-0.08} tilt={[0.8, 0.1, 0.3]} />
      <OrbitRing radius={6} color={purpleColor} speed={0.05} tilt={[0.5, 0.6, 0.1]} />

      {/* Particle field */}
      <ParticleField count={300} color={primaryColor} />
    </>
  );
}

/* ── Exported component ─────────────────── */
export default function CinematicBackground({ isDark }) {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 60 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <Scene isDark={isDark} />
      </Canvas>

      {/* Gradient overlay to keep text readable */}
      <div className="absolute inset-0 pointer-events-none">
        <div className={`absolute inset-0 ${
          isDark
            ? 'bg-gradient-to-br from-surface-950/80 via-surface-950/50 to-surface-950/70'
            : 'bg-gradient-to-br from-surface-50/80 via-surface-50/40 to-surface-50/70'
        }`} />
      </div>
    </div>
  );
}
