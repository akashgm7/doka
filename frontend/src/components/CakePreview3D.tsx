import { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import {
    OrbitControls,
    PerspectiveCamera,
    ContactShadows,
    Float,
    RoundedBox,
    useTexture
} from '@react-three/drei';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { EffectComposer, Bloom, ToneMapping, SSAO, DepthOfField } from '@react-three/postprocessing';
import * as THREE from 'three';
import { OPTIONS, SIZE_DIMS } from '../data/cakeOptions';

// ── 4K Procedural PBR Map Hook ──
const use4KProceduralTexture = (type: 'roughness' | 'normal' | 'noise') => {
    return useMemo(() => {
        const size = 4096; // 4K Resolution
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;

        // Base layer
        ctx.fillStyle = type === 'normal' ? '#8080ff' : '#000000';
        ctx.fillRect(0, 0, size, size);

        // Pass 1: High-density micro-detail (Grain)
        for (let i = 0; i < 200000; i++) {
            const x = Math.random() * size;
            const y = Math.random() * size;
            const r = 0.3 + Math.random() * 1.5;
            const alpha = Math.random() * (type === 'normal' ? 0.05 : 0.08);

            if (type === 'normal') {
                const nx = 127 + (Math.random() - 0.5) * 15;
                const ny = 127 + (Math.random() - 0.5) * 15;
                ctx.fillStyle = `rgba(${nx}, ${ny}, 255, ${alpha})`;
            } else {
                const grey = 100 + Math.random() * 155;
                ctx.fillStyle = `rgba(${grey}, ${grey}, ${grey}, ${alpha})`;
            }

            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fill();
        }

        // Pass 2: Larger splotches/imperfections (Gloss variation / Dents) + Micro-Noise
        const splotchCount = type === 'roughness' ? 2000 : 500;
        for (let i = 0; i < splotchCount; i++) {
            const x = Math.random() * size;
            const y = Math.random() * size;
            const r = 5 + Math.random() * 40;
            const alpha = Math.random() * 0.15;

            if (type === 'roughness') {
                const grey = Math.random() > 0.5 ? 200 : 50;
                ctx.fillStyle = `rgba(${grey}, ${grey}, ${grey}, ${alpha})`;
            } else if (type === 'normal') {
                ctx.fillStyle = `rgba(100, 100, 255, ${alpha * 0.5})`;
            }

            ctx.filter = 'blur(10px)';
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fill();
            ctx.filter = 'none';
        }

        // Pass 3: Ultra-fine micro-noise (0.01 scale equivalent)
        ctx.globalCompositeOperation = 'overlay';
        for (let i = 0; i < 50000; i++) {
            const x = Math.random() * size;
            const y = Math.random() * size;
            const grey = Math.random() * 255;
            ctx.fillStyle = `rgba(${grey}, ${grey}, ${grey}, 0.05)`;
            ctx.fillRect(x, y, 1, 1);
        }
        ctx.globalCompositeOperation = 'source-over';

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(8, 8); // Tiling for micro-detail
        texture.anisotropy = 16;
        return texture;
    }, [type]);
};

// ── PBR Material Hook ──
const usePBRMaterial = (baseColor: string, design: string, isCream = false) => {
    // Load generated 4K albedo 
    const albedoTexture = useTexture('/textures/cake_albedo.png');
    const roughnessMap = use4KProceduralTexture('roughness');
    const normalMap = use4KProceduralTexture('normal');

    return useMemo(() => {
        const material = new THREE.MeshPhysicalMaterial({
            color: new THREE.Color(baseColor),
            roughness: design === 'classic' ? 0.35 : 0.45,
            metalness: 0,
            roughnessMap: roughnessMap,
            normalMap: normalMap,
            normalScale: new THREE.Vector2(0.3, 0.3),
            clearcoat: design === 'marble' ? 0.4 : 0.1,
            clearcoatRoughness: 0.1,
            sheen: 0.5,
            transmission: design === 'rustic' ? 0.05 : 0.1,
            thickness: 2.0,
            ior: 1.45,
            attenuationColor: new THREE.Color(baseColor),
            attenuationDistance: 0.5,
        });

        // Specialized design logic via onBeforeCompile
        material.onBeforeCompile = (shader) => {
            material.userData.shader = shader;
            shader.uniforms.uBaseColor = { value: new THREE.Color(baseColor) };
            shader.uniforms.uHeight = { value: 1.0 }; // Will be updated by CakeMesh

            if (design === 'ombre') {
                shader.vertexShader = shader.vertexShader.replace(
                    '#include <common>',
                    `#include <common>
                     varying float vY;`
                ).replace(
                    '#include <begin_vertex>',
                    `#include <begin_vertex>
                     vY = position.y;`
                );

                shader.fragmentShader = shader.fragmentShader.replace(
                    '#include <common>',
                    `#include <common>
                     varying float vY;
                     uniform vec3 uBaseColor;
                     uniform float uHeight;`
                ).replace(
                    '#include <color_fragment>',
                    `#include <color_fragment>
                     // Smooth height-based mix
                     float mixVal = clamp((vY / uHeight) + 0.5, 0.0, 1.0);
                     diffuseColor.rgb = mix(uBaseColor, vec3(1.0, 0.9, 0.8), mixVal);`
                );
            }

            if (design === 'rustic') {
                shader.vertexShader = shader.vertexShader.replace(
                    '#include <common>',
                    `#include <common>
                     varying float vY;
                     uniform float uHeight;
                     // Simple noise function for displacement
                     float noise(vec3 p) {
                         return fract(sin(dot(p, vec3(12.9898, 78.233, 45.164))) * 43758.5453);
                     }`
                ).replace(
                    '#include <begin_vertex>',
                    `#include <begin_vertex>
                     vY = position.y;
                     // Displacement near the top/bottom edges
                     float distToEdge = min(abs(vY - uHeight*0.5), abs(vY + uHeight*0.5));
                     if(distToEdge < 0.1) {
                        transformed.y += noise(position * 10.0) * 0.02 * (1.0 - distToEdge/0.1);
                        transformed.xz += noise(position * 5.0 + 10.0) * 0.01;
                     }`
                );

                shader.fragmentShader = shader.fragmentShader.replace(
                    '#include <common>',
                    `#include <common>
                     varying float vY;
                     uniform float uHeight;`
                ).replace(
                    '#include <map_fragment>',
                    `#include <map_fragment>
                     // High-contrast sponge noise for blending
                     float n = fract(sin(dot(vUv * 30.0, vec2(12.9898, 78.233))) * 43758.5453);
                     float blending = smoothstep(uHeight * 0.2, -uHeight * 0.4, vY); 
                     if (n > 0.55) {
                         diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.85, 0.75, 0.55), blending * 0.9);
                     }`
                );
            }

            if (design === 'marble') {
                shader.fragmentShader = shader.fragmentShader.replace(
                    '#include <common>',
                    `#include <common>
                     // Smooth noise for marble depth
                     float marbleNoise(vec2 p) {
                         p *= 10.0;
                         return fract(sin(dot(p, vec2(12.98, 78.23))) * 43758.54);
                     }`
                ).replace(
                    '#include <map_fragment>',
                    `#include <map_fragment>
                     float m1 = marbleNoise(vUv);
                     float m2 = marbleNoise(vUv + 0.5);
                     float streaks = smoothstep(0.4, 0.5, m1 * m2);
                     diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.1), streaks * 0.15);
                     // Add subtle depth
                     diffuseColor.rgb += marbleNoise(vUv * 2.0) * 0.05;`
                );
            }

            if (design === 'geometric') {
                shader.fragmentShader = shader.fragmentShader.replace(
                    '#include <map_fragment>',
                    `#include <map_fragment>
                     // Raised grid effect using normal-like modulation and roughness change
                     float grid = step(0.9, fract(vUv.x * 12.0)) + step(0.9, fract(vUv.y * 12.0));
                     float mask = grid > 0.5 ? 1.0 : 0.0;
                     diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb * 1.15, mask * 0.2);
                     roughnessFactor = mix(roughnessFactor, 0.1, mask * 0.5);`
                );
            }
        };

        return material;
    }, [baseColor, design, isCream, roughnessMap, normalMap, albedoTexture]);
};

// ── Procedural Flower Component ──
const LowPolyFlower = ({ color = "#ffb6c1" }) => {
    return (
        <group>
            {/* Center */}
            <mesh>
                <sphereGeometry args={[0.03, 8, 8]} />
                <meshPhysicalMaterial color="#ffd700" roughness={0.4} />
            </mesh>
            {/* Petals */}
            {[...Array(5)].map((_, i) => (
                <mesh key={i} rotation={[0, (i * Math.PI * 2) / 5, 0.4]} position={[0.04, 0, 0]}>
                    <sphereGeometry args={[0.045, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
                    <meshPhysicalMaterial color={color} roughness={0.6} side={THREE.DoubleSide} />
                </mesh>
            ))}
        </group>
    );
};

// ── Design Layer Component ──
const DesignLayer = ({ design, w, h }: { design: string; w: number; h: number }) => {
    const goldMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({
        color: '#FFD700',
        metalness: 1.0,
        roughness: 0.1,
        clearcoat: 1.0
    }), []);

    const dripMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({
        color: '#3A2416',
        roughness: 0.05,
        metalness: 0.0,
        transmission: 0.1,
        thickness: 0.2,
        clearcoat: 1.0,
        clearcoatRoughness: 0.02
    }), []);

    switch (design) {
        case 'floral':
            return (
                <group position={[0, h / 2, 0]}>
                    {[...Array(12)].map((_, i) => {
                        const radius = w * 0.25 + Math.random() * w * 0.15;
                        const angle = (i / 12) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
                        return (
                            <group key={i} position={[
                                Math.cos(angle) * radius,
                                0,
                                Math.sin(angle) * radius
                            ]} rotation={[
                                (Math.random() - 0.5) * 0.15, // Natural tilt
                                Math.random() * Math.PI,
                                (Math.random() - 0.5) * 0.15
                            ]} scale={0.7 + Math.random() * 0.6}>
                                <LowPolyFlower color={i % 2 === 0 ? "#ffb6c1" : "#f8bbd0"} />
                            </group>
                        );
                    })}
                </group>
            );
        case 'drip':
            const dripCount = 20;
            return (
                <group position={[0, h / 2, 0]}>
                    {/* Top Ring */}
                    <mesh rotation={[-Math.PI / 2, 0, 0]}>
                        <torusGeometry args={[w * 0.495, 0.035, 12, 64]} />
                        <primitive object={dripMaterial} attach="material" />
                    </mesh>
                    {/* Individual Drips */}
                    {[...Array(dripCount)].map((_, i) => {
                        const angle = (i / dripCount) * Math.PI * 2;
                        const length = 0.2 + Math.random() * 0.4;
                        const x = Math.cos(angle) * w * 0.495;
                        const z = Math.sin(angle) * w * 0.495;
                        return (
                            <group key={i} position={[x, -0.02, z]}>
                                <mesh position={[0, -length / 2, 0]}>
                                    <capsuleGeometry args={[0.025, length, 8, 8]} />
                                    <primitive object={dripMaterial} attach="material" />
                                </mesh>
                                {/* Droplet tip */}
                                <mesh position={[0, -length, 0]} scale={[1.2, 1.4, 1.2]}>
                                    <sphereGeometry args={[0.028, 8, 8]} />
                                    <primitive object={dripMaterial} attach="material" />
                                </mesh>
                            </group>
                        );
                    })}
                </group>
            );
        case 'gold-accent':
            return (
                <group>
                    {[...Array(45)].map((_, i) => (
                        <mesh key={i}
                            position={[
                                (Math.random() - 0.5) * w,
                                (Math.random() - 0.5) * h,
                                (Math.random() - 0.5) * w
                            ]}
                            rotation={[Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI]}
                            scale={[
                                0.02 + Math.random() * 0.1,
                                0.01 + Math.random() * 0.05,
                                0.02 + Math.random() * 0.1
                            ]}
                        >
                            <sphereGeometry args={[1, 3, 2]} />
                            <primitive object={goldMaterial} attach="material" />
                        </mesh>
                    ))}
                </group>
            );
        default:
            return null;
    }
};

const CakeMesh = ({ shape, size, baseColor, design }: { shape: string; size: string; baseColor: string; design: string }) => {
    const dims = SIZE_DIMS[size] || SIZE_DIMS.medium;
    const material = usePBRMaterial(baseColor, design, true);

    useEffect(() => {
        if (material.userData.shader) {
            material.userData.shader.uniforms.uHeight.value = dims.h * 0.02;
        }
    }, [material, dims.h]);

    const s = 0.02;
    const w = dims.w * s;
    const h = dims.h * s;
    const d = shape === 'rectangle' ? w * 1.3 : w;

    return (
        <group>
            {shape === 'square' && (
                <RoundedBox args={[w, h, w]} radius={0.08} smoothness={32} castShadow receiveShadow>
                    <primitive object={material} attach="material" />
                </RoundedBox>
            )}
            {shape === 'rectangle' && (
                <RoundedBox args={[w * 1.25, h, d * 0.8]} radius={0.08} smoothness={32} castShadow receiveShadow>
                    <primitive object={material} attach="material" />
                </RoundedBox>
            )}
            {(shape === 'triangle' || shape === 'circle') && (
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -h / 2, 0]} castShadow receiveShadow>
                    <extrudeGeometry args={[
                        shape === 'triangle' ? (() => {
                            const s = new THREE.Shape();
                            s.moveTo(0, 0.5 * w);
                            s.lineTo(0.5 * w, -0.5 * w);
                            s.lineTo(-0.5 * w, -0.5 * w);
                            s.closePath();
                            return s;
                        })() : (() => {
                            const s = new THREE.Shape();
                            s.absarc(0, 0, w / 2, 0, Math.PI * 2, false);
                            return s;
                        })(),
                        {
                            depth: h,
                            bevelEnabled: true,
                            bevelThickness: 0.06,
                            bevelSize: 0.06,
                            bevelSegments: 16,
                            curveSegments: shape === 'circle' ? 128 : 64
                        }
                    ]} />
                    <primitive object={material} attach="material" />
                </mesh>
            )}
            {/* Design Layer Group */}
            <DesignLayer design={design} w={w} h={h} />
        </group>
    );
};

// ── Scene Content ──
const CakeScene = ({ shape, size, baseColor, design, isTiered, autoRotate }: any) => {
    const groupRef = useRef<THREE.Group>(null);
    const { scene } = useThree();

    // Load HDRI Environment
    const hdrUrl = 'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/abandoned_bakery_1k.hdr';

    const envMap = useLoader(RGBELoader, hdrUrl, (loader) => {
        loader.setCrossOrigin('anonymous');
    });

    useEffect(() => {
        if (envMap) {
            envMap.mapping = THREE.EquirectangularReflectionMapping;
            scene.environment = envMap;
            scene.background = envMap;
            scene.backgroundBlurriness = 0.5;
        }
    }, [envMap, scene]);

    useFrame(() => {
        if (autoRotate && groupRef.current) {
            groupRef.current.rotation.y += 0.005;
        }
    });

    const asymmetry = useMemo(() => ({
        rotation: (Math.random() - 0.5) * 0.05,
        scale: 1 + (Math.random() - 0.5) * 0.02,
        tierOffset: [
            (Math.random() - 0.5) * 0.04,
            0,
            (Math.random() - 0.5) * 0.04
        ] as [number, number, number],
        tierRotation: Math.random() * 0.5
    }), []);

    return (
        <group ref={groupRef} rotation={[0, asymmetry.rotation, 0]} scale={asymmetry.scale}>
            {isTiered ? (
                <group position={[0, -0.5, 0]}>
                    <CakeMesh shape={shape} size="medium" baseColor={baseColor} design={design} />
                    <group position={[asymmetry.tierOffset[0], 1.0, asymmetry.tierOffset[2]]} scale={0.7} rotation={[0, asymmetry.tierRotation, 0]}>
                        <CakeMesh shape={shape} size="medium" baseColor={baseColor} design={design} />
                    </group>
                </group>
            ) : (
                <CakeMesh shape={shape} size={size} baseColor={baseColor} design={design} />
            )}
        </group>
    );
};

// ── Main Component ──
interface CakePreview3DProps {
    shape: string;
    flavour: string;
    design: string;
    size: string;
    cakeMessage: string;
    interactive?: boolean;
    autoRotate?: boolean;
    scale?: number;
}

const CakePreview3D = ({
    shape, flavour, design, size, cakeMessage,
    interactive = true, autoRotate = true
}: CakePreview3DProps) => {
    const flavourOpt = OPTIONS.Flavour.find(o => o.id === flavour);
    const baseColor = flavourOpt?.color || '#FFF3CD';
    const isTiered = size === 'tiered';

    return (
        <div className="relative w-full aspect-square rounded-[2.5rem] overflow-hidden bg-gradient-to-b from-[#fcfbf7] to-[#f4f1ea]">
            <Canvas shadows dpr={[1, 2]} gl={{ antialias: true }} className="w-full h-full">
                {/* Camera & Controls */}
                <PerspectiveCamera makeDefault position={[0, 2, 5]} fov={35} />
                {interactive ? (
                    <OrbitControls
                        enablePan={false}
                        enableZoom={false}
                        minPolarAngle={Math.PI / 4}
                        maxPolarAngle={Math.PI / 1.8}
                        enableDamping={true}
                        dampingFactor={0.05}
                        autoRotate={autoRotate}
                        autoRotateSpeed={1.0}
                        makeDefault
                    />
                ) : null}

                {/* Lighting Setup */}
                {/* Lighting Setup - Environment handled in CakeScene or here? 
                    Actually, it's better to do it in a specialized component or just use <Environment Map={envMap} background />
                    But I'll stick to the approved manual scene assignment for now as requested.
                */}

                {/* Warm Key Light (Top-Left) */}
                <spotLight
                    position={[-4, 6, 4]}
                    angle={0.3}
                    penumbra={1}
                    intensity={180}
                    castShadow
                    shadow-mapSize={2048}
                    color="#fff4e0"
                />

                {/* Soft Fill Light (Right) */}
                <pointLight position={[5, 2, 2]} intensity={60} color="#e0f4ff" />

                {/* Rim Light (Back) */}
                <directionalLight position={[0, 2, -5]} intensity={3.0} color="#ffffff" />

                <ambientLight intensity={0.2} />

                {/* Cake Scene */}
                <Float speed={1.2} rotationIntensity={0.1} floatIntensity={0.3}>
                    <CakeScene
                        shape={shape}
                        size={size}
                        baseColor={baseColor}
                        design={design}
                        isTiered={isTiered}
                        autoRotate={!interactive && autoRotate}
                    />
                </Float>

                {/* Ground & Shadows */}
                <ContactShadows
                    position={[0, -1, 0]}
                    opacity={0.5}
                    scale={10}
                    blur={2.4}
                    far={4.5}
                />

                {/* Post Processing */}
                <EffectComposer>
                    <Bloom
                        intensity={0.25}
                        luminanceThreshold={1.0}
                        luminanceSmoothing={0.1}
                        mipmapBlur
                    />
                    <SSAO
                        intensity={20}
                        radius={0.05}
                        luminanceInfluence={0.5}
                        color={new THREE.Color('black')}
                    />
                    <DepthOfField
                        focusDistance={0.012}
                        focalLength={0.02}
                        bokehScale={2}
                    />
                    <ToneMapping mode={THREE.ACESFilmicToneMapping} />
                </EffectComposer>
            </Canvas>

            {/* Cake message Overlay */}
            {cakeMessage && (
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-white/40 backdrop-blur-xl px-6 py-2.5 rounded-[2rem] pointer-events-none z-10 border border-black/[0.03] shadow-xl">
                    <p className="text-[11px] font-serif text-text-main font-bold italic text-center truncate max-w-[180px]">
                        "{cakeMessage}"
                    </p>
                </div>
            )}

            {/* Labels Overlay */}
            {interactive && (
                <div className="absolute top-6 left-6 pointer-events-none">
                    <div className="flex items-center gap-2 bg-white/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-black/[0.03] shadow-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                        <p className="text-[9px] text-text-main font-bold uppercase tracking-widest">
                            {OPTIONS.Base.find(b => b.id === shape)?.label || 'Bespoke'}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CakePreview3D;
