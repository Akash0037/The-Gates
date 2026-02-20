'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, Environment } from '@react-three/drei';
import * as THREE from 'three';

/* ───────────────────── Floating Particles ───────────────────── */
function Particles({ count = 500 }: { count?: number }) {
    const mesh = useRef<THREE.Points>(null);
    const positions = useMemo(() => {
        const pos = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            pos[i * 3] = (Math.random() - 0.5) * 30;
            pos[i * 3 + 1] = Math.random() * 15 - 2;
            pos[i * 3 + 2] = (Math.random() - 0.5) * 30;
        }
        return pos;
    }, [count]);

    useFrame((_, delta) => {
        if (mesh.current) {
            mesh.current.rotation.y += delta * 0.015;
            const posArr = mesh.current.geometry.attributes.position.array as Float32Array;
            for (let i = 0; i < count; i++) {
                posArr[i * 3 + 1] += Math.sin(Date.now() * 0.001 + i * 0.5) * 0.003;
            }
            mesh.current.geometry.attributes.position.needsUpdate = true;
        }
    });

    return (
        <points ref={mesh}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    args={[positions, 3]}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.06}
                color="#ff3333"
                transparent
                opacity={0.7}
                sizeAttenuation
                blending={THREE.AdditiveBlending}
                depthWrite={false}
            />
        </points>
    );
}

/* ───────────────── Embers rising from ground ───────────────── */
function Embers({ count = 80 }: { count?: number }) {
    const mesh = useRef<THREE.Points>(null);
    const positions = useMemo(() => {
        const pos = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            pos[i * 3] = (Math.random() - 0.5) * 12;
            pos[i * 3 + 1] = Math.random() * 10 - 1;
            pos[i * 3 + 2] = -5 + (Math.random() - 0.5) * 8;
        }
        return pos;
    }, [count]);

    useFrame((_, delta) => {
        if (mesh.current) {
            const posArr = mesh.current.geometry.attributes.position.array as Float32Array;
            for (let i = 0; i < count; i++) {
                posArr[i * 3 + 1] += delta * (0.3 + Math.random() * 0.2);
                posArr[i * 3] += Math.sin(Date.now() * 0.002 + i) * 0.005;
                if (posArr[i * 3 + 1] > 10) {
                    posArr[i * 3 + 1] = -1;
                    posArr[i * 3] = (Math.random() - 0.5) * 12;
                    posArr[i * 3 + 2] = -5 + (Math.random() - 0.5) * 8;
                }
            }
            mesh.current.geometry.attributes.position.needsUpdate = true;
        }
    });

    return (
        <points ref={mesh}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    args={[positions, 3]}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.08}
                color="#ff6600"
                transparent
                opacity={0.8}
                sizeAttenuation
                blending={THREE.AdditiveBlending}
                depthWrite={false}
            />
        </points>
    );
}

/* ───────────────── Fog Volume (Custom Shader) ───────────────── */
function FogPlane() {
    const shaderMaterial = useMemo(
        () =>
            new THREE.ShaderMaterial({
                transparent: true,
                depthWrite: false,
                uniforms: {
                    uTime: { value: 0 },
                    uColor: { value: new THREE.Color('#1a0000') },
                },
                vertexShader: `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
                fragmentShader: `
          uniform float uTime;
          uniform vec3 uColor;
          varying vec2 vUv;

          float noise(vec2 p) {
            return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
          }

          void main() {
            float n = noise(vUv * 5.0 + uTime * 0.1);
            float alpha = smoothstep(0.3, 0.7, n) * 0.25;
            alpha *= smoothstep(0.0, 0.3, vUv.y) * smoothstep(1.0, 0.7, vUv.y);
            gl_FragColor = vec4(uColor, alpha);
          }
        `,
            }),
        []
    );

    useFrame((_, delta) => {
        shaderMaterial.uniforms.uTime.value += delta;
    });

    return (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.4, 0]}>
            <planeGeometry args={[40, 40, 1, 1]} />
            <primitive object={shaderMaterial} attach="material" />
        </mesh>
    );
}

/* ───────────────────── Glowing Runes on Pillars ───────────────────── */
function GlowingRune({ position, delay = 0 }: { position: [number, number, number]; delay?: number }) {
    const ref = useRef<THREE.Mesh>(null);

    useFrame(() => {
        if (ref.current) {
            const mat = ref.current.material as THREE.MeshStandardMaterial;
            mat.emissiveIntensity = 0.5 + Math.sin(Date.now() * 0.003 + delay) * 0.4;
        }
    });

    return (
        <mesh ref={ref} position={position}>
            <boxGeometry args={[0.15, 0.15, 0.05]} />
            <meshStandardMaterial
                color="#ff0000"
                emissive="#ff2200"
                emissiveIntensity={0.8}
                metalness={0.9}
                roughness={0.2}
            />
        </mesh>
    );
}

/* ───────────────────── The Ancient Gate ───────────────────── */
function Gate({ opening }: { opening: boolean }) {
    const leftDoor = useRef<THREE.Mesh>(null);
    const rightDoor = useRef<THREE.Mesh>(null);
    const glowRef = useRef<THREE.PointLight>(null);

    useFrame((_, delta) => {
        if (opening) {
            if (leftDoor.current && leftDoor.current.position.x > -3) {
                leftDoor.current.position.x -= delta * 1.2;
            }
            if (rightDoor.current && rightDoor.current.position.x < 3) {
                rightDoor.current.position.x += delta * 1.2;
            }
        }
        if (glowRef.current) {
            glowRef.current.intensity = 5 + Math.sin(Date.now() * 0.003) * 2;
        }
    });

    return (
        <Float speed={0.5} rotationIntensity={0.03} floatIntensity={0.08}>
            <group position={[0, 0, -5]}>
                {/* Gate frame - left pillar */}
                <mesh position={[-2.8, 2.5, 0]} castShadow>
                    <boxGeometry args={[0.7, 7, 0.9]} />
                    <meshStandardMaterial
                        color="#2a1508"
                        roughness={0.7}
                        metalness={0.4}
                        emissive="#1a0800"
                        emissiveIntensity={0.15}
                    />
                </mesh>
                {/* Left pillar cap */}
                <mesh position={[-2.8, 6.3, 0]}>
                    <boxGeometry args={[0.9, 0.4, 1.1]} />
                    <meshStandardMaterial color="#3a1a08" roughness={0.6} metalness={0.5} />
                </mesh>

                {/* Gate frame - right pillar */}
                <mesh position={[2.8, 2.5, 0]} castShadow>
                    <boxGeometry args={[0.7, 7, 0.9]} />
                    <meshStandardMaterial
                        color="#2a1508"
                        roughness={0.7}
                        metalness={0.4}
                        emissive="#1a0800"
                        emissiveIntensity={0.15}
                    />
                </mesh>
                {/* Right pillar cap */}
                <mesh position={[2.8, 6.3, 0]}>
                    <boxGeometry args={[0.9, 0.4, 1.1]} />
                    <meshStandardMaterial color="#3a1a08" roughness={0.6} metalness={0.5} />
                </mesh>

                {/* Gate frame - top beam */}
                <mesh position={[0, 6.0, 0]} castShadow>
                    <boxGeometry args={[6.3, 0.7, 0.9]} />
                    <meshStandardMaterial
                        color="#2a1508"
                        roughness={0.7}
                        metalness={0.4}
                        emissive="#1a0800"
                        emissiveIntensity={0.15}
                    />
                </mesh>

                {/* Decorative arch top */}
                <mesh position={[0, 7.0, 0]} rotation={[0, 0, Math.PI / 4]}>
                    <boxGeometry args={[1.8, 1.8, 0.5]} />
                    <meshStandardMaterial
                        color="#4a0000"
                        roughness={0.5}
                        metalness={0.6}
                        emissive="#ff0000"
                        emissiveIntensity={0.4}
                    />
                </mesh>

                {/* Glowing runes on left pillar */}
                <GlowingRune position={[-2.8, 4.5, 0.46]} delay={0} />
                <GlowingRune position={[-2.8, 3.5, 0.46]} delay={1} />
                <GlowingRune position={[-2.8, 2.5, 0.46]} delay={2} />
                <GlowingRune position={[-2.8, 1.5, 0.46]} delay={3} />

                {/* Glowing runes on right pillar */}
                <GlowingRune position={[2.8, 4.5, 0.46]} delay={0.5} />
                <GlowingRune position={[2.8, 3.5, 0.46]} delay={1.5} />
                <GlowingRune position={[2.8, 2.5, 0.46]} delay={2.5} />
                <GlowingRune position={[2.8, 1.5, 0.46]} delay={3.5} />

                {/* Left door */}
                <mesh ref={leftDoor} position={[-1.15, 2.5, 0]} castShadow>
                    <boxGeometry args={[2.3, 6, 0.3]} />
                    <meshStandardMaterial
                        color="#1a0a0a"
                        roughness={0.6}
                        metalness={0.7}
                        emissive="#200000"
                        emissiveIntensity={0.1}
                    />
                </mesh>
                {/* Right door */}
                <mesh ref={rightDoor} position={[1.15, 2.5, 0]} castShadow>
                    <boxGeometry args={[2.3, 6, 0.3]} />
                    <meshStandardMaterial
                        color="#1a0a0a"
                        roughness={0.6}
                        metalness={0.7}
                        emissive="#200000"
                        emissiveIntensity={0.1}
                    />
                </mesh>

                {/* Door details - metal strips & studs */}
                {[-1, 1].map((side, i) => (
                    <group key={i}>
                        {/* Vertical metal strip */}
                        <mesh position={[side * 0.6, 2.5, 0.16]}>
                            <boxGeometry args={[0.06, 5, 0.03]} />
                            <meshStandardMaterial color="#5a2a00" metalness={0.9} roughness={0.2} emissive="#3a1500" emissiveIntensity={0.3} />
                        </mesh>
                        {/* Horizontal strips */}
                        {[1, 2.5, 4].map((y, j) => (
                            <mesh key={j} position={[side * 1.0, y, 0.16]}>
                                <boxGeometry args={[1.8, 0.04, 0.03]} />
                                <meshStandardMaterial color="#4a2000" metalness={0.9} roughness={0.2} emissive="#2a1000" emissiveIntensity={0.2} />
                            </mesh>
                        ))}
                        {/* Door studs */}
                        {[1.5, 2.5, 3.5].map((y, j) => (
                            <mesh key={`stud-${j}`} position={[side * 1.4, y, 0.18]}>
                                <sphereGeometry args={[0.1, 12, 12]} />
                                <meshStandardMaterial
                                    color="#6a3000"
                                    metalness={0.95}
                                    roughness={0.15}
                                    emissive="#ff3300"
                                    emissiveIntensity={0.3}
                                />
                            </mesh>
                        ))}
                        {/* Door handle / ring */}
                        <mesh position={[side * 1.6, 2.5, 0.2]}>
                            <torusGeometry args={[0.15, 0.03, 8, 16]} />
                            <meshStandardMaterial color="#8a4500" metalness={0.95} roughness={0.1} emissive="#ff4400" emissiveIntensity={0.4} />
                        </mesh>
                    </group>
                ))}

                {/* LIGHTING - Much brighter and more dramatic */}
                {/* Main red glow behind gate */}
                <pointLight ref={glowRef} position={[0, 3, -2]} color="#ff1a1a" intensity={5} distance={20} />
                {/* Secondary glow behind gate - higher */}
                <pointLight position={[0, 5, -3]} color="#ff3300" intensity={3} distance={15} />
                {/* Base glow front */}
                <pointLight position={[0, 0.5, 2]} color="#5a0000" intensity={2} distance={10} />
                {/* Pillar rim lights */}
                <pointLight position={[-3.5, 3, 1]} color="#ff2200" intensity={1.5} distance={8} />
                <pointLight position={[3.5, 3, 1]} color="#ff2200" intensity={1.5} distance={8} />
                {/* Top arch glow */}
                <pointLight position={[0, 7, 0.5]} color="#ff0000" intensity={2} distance={6} />
            </group>
        </Float>
    );
}

/* ───────────────── Mouse-based Camera Movement ───────────────── */
function CameraController({ moveForward }: { moveForward: boolean }) {
    const { camera } = useThree();

    useFrame(({ pointer }) => {
        camera.rotation.y = THREE.MathUtils.lerp(camera.rotation.y, -pointer.x * 0.06, 0.05);
        camera.rotation.x = THREE.MathUtils.lerp(camera.rotation.x, pointer.y * 0.04, 0.05);

        if (moveForward && camera.position.z > -10) {
            camera.position.z -= 0.03;
        }
    });

    return null;
}

/* ───────────────────── Ground ───────────────────── */
function Ground() {
    return (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]} receiveShadow>
            <planeGeometry args={[50, 50]} />
            <meshStandardMaterial
                color="#0a0505"
                roughness={0.95}
                metalness={0.1}
                emissive="#0a0000"
                emissiveIntensity={0.05}
            />
        </mesh>
    );
}

/* ───────────────────── Scene Export ───────────────────── */
export default function GateScene({ opening }: { opening: boolean }) {
    return (
        <Canvas
            camera={{ position: [0, 2.5, 8], fov: 55 }}
            gl={{ antialias: true, alpha: false }}
            shadows
            style={{ position: 'fixed', inset: 0, zIndex: 0 }}
        >
            <color attach="background" args={['#050000']} />
            <fog attach="fog" args={['#050000', 10, 35]} />

            {/* Much brighter ambient & directional lighting */}
            <ambientLight intensity={0.15} color="#1a0505" />
            <directionalLight position={[5, 10, 5]} intensity={0.4} color="#ff2200" castShadow />
            <directionalLight position={[-5, 8, 3]} intensity={0.2} color="#660000" />
            {/* Fill light from below/front */}
            <pointLight position={[0, 1, 10]} intensity={0.5} color="#1a0000" distance={20} />
            {/* Overhead dramatic light */}
            <pointLight position={[0, 12, -3]} intensity={0.8} color="#3a0000" distance={25} />

            <CameraController moveForward={opening} />
            <Gate opening={opening} />
            <Ground />
            <FogPlane />
            <Particles />
            <Embers />

            <Environment preset="night" />
        </Canvas>
    );
}
