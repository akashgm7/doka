import React, { useRef, useMemo, useEffect, Suspense, useState, Component } from 'react';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import {
    OrbitControls,
    PerspectiveCamera,
    ContactShadows,
    Float,
    RoundedBox,
    useTexture,
    useGLTF
} from '@react-three/drei';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { EffectComposer, Bloom, SSAO } from '@react-three/postprocessing';
import * as THREE from 'three';
import { OPTIONS, SIZE_DIMS } from '../data/cakeOptions';

// ── Optimized Procedural PBR Map Hook ──
const useProceduralTexture = (type: 'roughness' | 'normal' | 'noise', maxAnisotropy = 1) => {
    const [texture, setTexture] = useState<THREE.CanvasTexture | null>(null);

    useEffect(() => {
        const size = 512; // Lowered to 512 to prevent Main Thread Block
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Base layer
        ctx.fillStyle = type === 'normal' ? '#8080ff' : '#000000';
        ctx.fillRect(0, 0, size, size);

        // Pass 1: Grain (drastically reduced loop count)
        for (let i = 0; i < 5000; i++) {
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

        // Pass 2: Splotches
        const splotchCount = type === 'roughness' ? 100 : 25;
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

            ctx.filter = 'blur(4px)';
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fill();
            ctx.filter = 'none';
        }

        // Pass 3: Micro-noise
        ctx.globalCompositeOperation = 'overlay';
        for (let i = 0; i < 2000; i++) {
            const x = Math.random() * size;
            const y = Math.random() * size;
            const grey = Math.random() * 255;
            ctx.fillStyle = `rgba(${grey}, ${grey}, ${grey}, 0.05)`;
            ctx.fillRect(x, y, 1, 1);
        }
        ctx.globalCompositeOperation = 'source-over';

        const tex = new THREE.CanvasTexture(canvas);
        tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(8, 8);
        tex.minFilter = THREE.LinearMipmapLinearFilter;
        tex.magFilter = THREE.LinearFilter;
        tex.anisotropy = maxAnisotropy;
        tex.generateMipmaps = true;

        setTexture(tex);

        // Cleanup texture on unmount or re-render
        return () => {
            tex.dispose();
        };
    }, [type, maxAnisotropy]);

    return texture;
};

// ── PBR Material Hook ──
const usePBRMaterial = (baseColor: string, design: string, maxAnisotropy: number) => {
    // Load generated 4K albedo
    const albedoTexture = useTexture('/textures/cake_albedo.png');
    const roughnessMap = useProceduralTexture('roughness', maxAnisotropy);
    const normalMap = useProceduralTexture('normal', maxAnisotropy);

    // KEY FIX: useMemo instead of useState+useEffect.
    // Material is now created SYNCHRONOUSLY on the same render as the design
    // change — no async state round-trip, no missed frame. This makes design
    // switching immediately reactive without recreating the renderer or scene.
    const material = useMemo(() => {
        // Design-specific color mapping from user snippet
        const getDesignColor = () => {
            switch (design) {
                case 'rustic': return '#C68642';       // Rustic Naked
                case 'drip': return '#3E2723';         // Chocolate Drip
                case 'floral': return '#FF69B4';       // Floral Garden
                case 'gold-accent': return '#D4AF37';  // Gold Accent
                default: return baseColor;             // Default flavor color
            }
        };

        const mat = new THREE.MeshPhysicalMaterial({
            color: new THREE.Color(getDesignColor()),
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

        // FIX Bug 5: use 'mat' (the local variable), NOT 'material' (the stale state ref which is null)
        mat.onBeforeCompile = (shader) => {
            mat.userData.shader = shader;
            shader.uniforms.uBaseColor = { value: new THREE.Color(baseColor) };
            shader.uniforms.uHeight = { value: 1.0 };

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
                     float noise(vec3 p) {
                         return fract(sin(dot(p, vec3(12.9898, 78.233, 45.164))) * 43758.5453);
                     }`
                ).replace(
                    '#include <begin_vertex>',
                    `#include <begin_vertex>
                     vY = position.y;
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
                     diffuseColor.rgb += marbleNoise(vUv * 2.0) * 0.05;`
                );
            }

            if (design === 'geometric') {
                shader.fragmentShader = shader.fragmentShader.replace(
                    '#include <map_fragment>',
                    `#include <map_fragment>
                     float grid = step(0.9, fract(vUv.x * 12.0)) + step(0.9, fract(vUv.y * 12.0));
                     float mask = grid > 0.5 ? 1.0 : 0.0;
                     diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb * 1.15, mask * 0.2);
                     roughnessFactor = mix(roughnessFactor, 0.1, mask * 0.5);`
                );
            }
        };

        return mat;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [baseColor, design, roughnessMap, normalMap, albedoTexture, maxAnisotropy]);

    // Cleanup-only effect: dispose the previous material whenever useMemo
    // produces a new one. Runs AFTER the new material is already in use.
    useEffect(() => {
        return () => {
            material.dispose();
        };
    }, [material]);

    return material;
};

// ── GLTF Decoration Layer ──
const DecorationLayer = ({ design, w, h }: { design: string; w: number; h: number }) => {
    // Map design ID to GLB path in public/models/
    const modelPath = useMemo(() => {
        switch (design) {
            case 'rustic': return '/models/rustic.glb';
            case 'drip': return '/models/chocolate-drip.glb';
            case 'geometric': return '/models/geometric.glb';
            default: return null;
        }
    }, [design]);

    // useGLTF handles the loading (caching) and preloading.
    const gltf = useGLTF(modelPath || '', false) as any;
    const model = gltf ? gltf.scene : null;

    // Requirement #5: Explicit manual disposal of previous model's GPU resources.
    useEffect(() => {
        return () => {
            if (model) {
                model.traverse((child: any) => {
                    if (child.isMesh) {
                        child.geometry.dispose();
                        if (child.material) {
                            if (Array.isArray(child.material)) {
                                child.material.forEach((m: any) => {
                                    if (m.map) m.map.dispose();
                                    m.dispose();
                                });
                            } else {
                                if (child.material.map) child.material.map.dispose();
                                child.material.dispose();
                            }
                        }
                    }
                });
            }
        };
    }, [model]);

    if (!modelPath || !model) return null;

    return (
        <primitive
            object={model}
            position={[0, -h / 2, 0]} // Center based on cake height
            scale={[w, w, w]}         // Scale to match cake width
        />
    );
};

// Preload models for smoother selection (Requirement #9)
// NOTE: Commented out to prevent "Failed to load" crash if files are missing.
// useGLTF.preload('/models/rustic.glb');
// useGLTF.preload('/models/chocolate-drip.glb');
// useGLTF.preload('/models/geometric.glb');

// ── Model Error Boundary (Surgical Fallback) ──
class ModelErrorBoundary extends Component<{ children: React.ReactNode }, { hasError: boolean }> {
    constructor(props: any) {
        super(props);
        this.state = { hasError: false };
    }
    static getDerivedStateFromError() {
        return { hasError: true };
    }
    render() {
        if (this.state.hasError) return null; // Silently fail and show just the base cake
        return this.props.children;
    }
}


const CakeMesh = ({ shape, size, baseColor, design }: { shape: string; size: string; baseColor: string; design: string }) => {
    const { gl } = useThree();
    const maxAnisotropy = useMemo(() => gl.capabilities.getMaxAnisotropy(), [gl]);
    const material = usePBRMaterial(baseColor, design, maxAnisotropy);
    const dims = SIZE_DIMS[size as keyof typeof SIZE_DIMS] || SIZE_DIMS.medium;

    // Ref to the root group — used for imperative material sync below.
    const meshGroupRef = useRef<THREE.Group>(null);
    // Decoration group (Requirement #2)
    const decorationGroupRef = useRef<THREE.Group>(null);

    // Sync height uniform whenever material or dims change.
    useEffect(() => {
        if (material && material.userData.shader) {
            material.userData.shader.uniforms.uHeight.value = dims.h * 0.02;
        }
    }, [material, dims.h]);

    // Imperative design sync: when selectedDesign changes, the useMemo above
    // already provides a new material object. This effect:
    //   1. Sets needsUpdate = true → forces Three.js to discard its cached
    //      shader program and re-call onBeforeCompile for the new design.
    //   2. Traverses the group and explicitly assigns the material to every
    //      child Mesh, so no child is left holding the old disposed material.
    // This runs ONCE per design change, never per frame — no perf cost.
    useEffect(() => {
        if (!meshGroupRef.current || !material) return;

        // Manual trigger from user snippet: bust the shader cache.
        material.needsUpdate = true;

        meshGroupRef.current.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
                (child as THREE.Mesh).material = material;
            }
        });
    }, [design, material]);

    const s = 0.02;
    const w = dims.w * s;
    const h = dims.h * s;
    const d = shape === 'rectangle' ? w * 1.3 : w;

    return (
        <group ref={meshGroupRef}>
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
            {/* Decoration Layer Group (Requirement #2) */}
            <group ref={decorationGroupRef}>
                {['rustic', 'drip', 'geometric'].includes(design) && (
                    <ModelErrorBoundary>
                        <Suspense fallback={null}>
                            <DecorationLayer design={design} w={w} h={h} />
                        </Suspense>
                    </ModelErrorBoundary>
                )}
            </group>
        </group>
    );
};

// ── Scene Content ──
const CakeScene = ({ shape, size, baseColor, design, isTiered, autoRotate }: any) => {
    const groupRef = useRef<THREE.Group>(null);
    const { scene } = useThree();

    // Load HDRI Environment (Use 2K for balance of quality and performance)
    const hdrUrl = 'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/2k/abandoned_bakery_2k.hdr';

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

    // Use a stable key for asymmetry to prevent re-renders
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

    if (!envMap) return null;

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

// ── Error Boundary ──
class ErrorBoundary extends Component<{ children: React.ReactNode, fallback?: React.ReactNode }, { hasError: boolean, error: any }> {
    constructor(props: any) {
        super(props);
        this.state = { hasError: false, error: null };
    }
    static getDerivedStateFromError(error: any) {
        return { hasError: true, error };
    }
    componentDidCatch(error: any, errorInfo: any) {
        console.error("3D rendering crash prevented:", error, errorInfo);
    }
    render() {
        if (this.state.hasError) {
            return this.props.fallback || (
                <div className="w-full h-full flex items-center justify-center bg-[#fcfbf7] flex-col gap-4 rounded-[2.5rem] border border-black/5 p-6 text-center absolute inset-0 z-50">
                    <p className="text-red-500 font-bold text-sm">Failed to load the 3D preview.</p>
                    <button onClick={() => this.setState({ hasError: false, error: null })} className="px-6 py-2 bg-black text-white rounded-xl text-xs font-bold">Retry Rendering</button>
                </div>
            );
        }
        return this.props.children;
    }
}

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
    const [isMounted, setIsMounted] = useState(false);

    // FIX Bug 1 + 3: Single, clean mount effect.
    // The rogue rAF loop (was here) has been removed — R3F manages its own loop.
    // The phantom WebGLRenderer (was here) has been removed — <Canvas> owns its context.
    // The duplicate setIsMounted (was below) has also been removed.
    useEffect(() => {
        setIsMounted(true);
    }, []);

    // FIX Bug 4: console.log removed from render body (was logging on every frame)
    const flavourOpt = OPTIONS.Flavour.find(o => o.id === flavour);
    const baseColor = flavourOpt?.color || '#FFF3CD';
    const isTiered = size === 'tiered';

    if (!isMounted) {
        return <div className="w-full aspect-square rounded-[2.5rem] bg-[#fcfbf7] animate-pulse border border-black/5" />;
    }

    return (
        <div className="relative w-full aspect-square rounded-[2.5rem] overflow-hidden bg-gradient-to-b from-[#fcfbf7] to-[#f4f1ea]">
            <ErrorBoundary>
                <Canvas
                    shadows={{ type: THREE.PCFShadowMap }}
                    dpr={[1, 2]}
                    gl={{
                        antialias: true,
                        toneMapping: THREE.ACESFilmicToneMapping,
                        toneMappingExposure: 1.2,
                        preserveDrawingBuffer: true
                    }}
                    className="w-full h-full"
                >
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
                    <Suspense fallback={null}>
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
                    </Suspense>

                    {/* Ground & Shadows */}
                    <ContactShadows
                        position={[0, -1, 0]}
                        opacity={0.5}
                        scale={10}
                        blur={2.4}
                        far={4.5}
                    />

                    {/* Post Processing */}
                    <EffectComposer enableNormalPass>
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
            </ErrorBoundary>
        </div>
    );
};

export default CakePreview3D;
