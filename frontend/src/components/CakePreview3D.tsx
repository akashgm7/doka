import React, { useRef, useMemo, useEffect, Suspense, useState, Component } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
    OrbitControls,
    PerspectiveCamera,
    ContactShadows,
    Float,
    RoundedBox,
    Environment,
    Html
} from '@react-three/drei';
import { EffectComposer, Bloom, SSAO, ToneMapping } from '@react-three/postprocessing';
import * as THREE from 'three';
import { OPTIONS, SIZE_DIMS } from '../data/cakeOptions';

// ── Optimized Procedural PBR Map Hook ──
const useProceduralTexture = (type: 'roughness' | 'normal' | 'noise', maxAnisotropy = 1) => {
    const [texture, setTexture] = useState<THREE.CanvasTexture | null>(null);

    useEffect(() => {
        const size = 512;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.fillStyle = type === 'normal' ? '#8080ff' : '#000000';
        ctx.fillRect(0, 0, size, size);

        for (let i = 0; i < 2000; i++) {
            const x = Math.random() * size;
            const y = Math.random() * size;
            const r = 0.5 + Math.random();
            const alpha = Math.random() * (type === 'normal' ? 0.03 : 0.06);

            if (type === 'normal') {
                const nx = 127 + (Math.random() - 0.5) * 12;
                const ny = 127 + (Math.random() - 0.5) * 12;
                ctx.fillStyle = `rgba(${nx}, ${ny}, 255, ${alpha})`;
            } else {
                const grey = 180 + Math.random() * 75;
                ctx.fillStyle = `rgba(${grey}, ${grey}, ${grey}, ${alpha})`;
            }

            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fill();
        }

        const tex = new THREE.CanvasTexture(canvas);
        tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(2, 2);
        tex.minFilter = THREE.LinearMipmapLinearFilter;
        tex.magFilter = THREE.LinearFilter;
        tex.anisotropy = maxAnisotropy;
        tex.generateMipmaps = true;

        setTexture(tex);
        return () => tex.dispose();
    }, [type, maxAnisotropy]);

    return texture;
};

// ── PBR Material Hook ──
const usePBRMaterial = (baseColor: string, design: string, maxAnisotropy: number) => {
    const roughnessMap = useProceduralTexture('roughness', maxAnisotropy);
    const normalMap = useProceduralTexture('normal', maxAnisotropy);

    const material = useMemo(() => {
        const getDesignColor = () => {
            switch (design) {
                case 'rustic': return '#EADEDA';
                case 'floral': return '#FFC0CB';
                case 'marble': return '#FFFFFF';
                default: return baseColor;
            }
        };

        const mat = new THREE.MeshPhysicalMaterial({
            color: new THREE.Color(getDesignColor()),
            roughness: 0.6,
            metalness: 0,
            roughnessMap: roughnessMap || undefined,
            normalMap: normalMap || undefined,
            normalScale: new THREE.Vector2(0.2, 0.2),
            clearcoat: (design === 'marble' || design === 'drip') ? 0.4 : 0.05,
            clearcoatRoughness: 0.1,
            sheen: design === 'classic' ? 1.0 : 0.5,
            sheenColor: new THREE.Color(baseColor),
            sheenRoughness: 0.2,
            ior: 1.45,
        });

        mat.onBeforeCompile = (shader) => {
            mat.userData.shader = shader;
            shader.uniforms.uBaseColor = { value: new THREE.Color(baseColor) };
            shader.uniforms.uHeight = { value: 1.0 };
            shader.uniforms.uDesignIndex = { value: 0 };

            const designMap: Record<string, number> = {
                'classic': 0, 'ombre': 1, 'marble': 2, 'drip': 3, 
                'floral': 4, 'geometric': 5, 'gold-accent': 6, 'rustic': 7
            };
            shader.uniforms.uDesignIndex.value = designMap[design] || 0;

            shader.vertexShader = shader.vertexShader.replace(
                '#include <common>',
                `#include <common>
                 varying float vY;
                 varying vec3 vPos;`
            ).replace(
                '#include <begin_vertex>',
                `#include <begin_vertex>
                 vY = position.y;
                 vPos = position.xyz;`
            );

            shader.fragmentShader = shader.fragmentShader.replace(
                '#include <common>',
                `#include <common>
                 varying float vY;
                 varying vec3 vPos;
                 uniform vec3 uBaseColor;
                 uniform float uHeight;
                 uniform int uDesignIndex;

                 float hash(vec3 p) {
                     p = fract(p * 0.3183099 + 0.1);
                     p *= 17.0;
                     return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
                 }

                 float noise(vec3 x) {
                     vec3 i = floor(x);
                     vec3 f = fract(x);
                     f = f * f * (3.0 - 2.0 * f);
                     return mix(mix(mix(hash(i + vec3(0, 0, 0)), hash(i + vec3(1, 0, 0)), f.x),
                                    mix(hash(i + vec3(0, 1, 0)), hash(i + vec3(1, 1, 0)), f.x), f.y),
                                mix(mix(hash(i + vec3(0, 0, 1)), hash(i + vec3(1, 0, 1)), f.x),
                                    mix(hash(i + vec3(0, 1, 1)), hash(i + vec3(1, 1, 1)), f.x), f.y), f.z);
                 }
                `
            ).replace(
                '#include <color_fragment>',
                `#include <color_fragment>
                 vec3 finalColor = diffuseColor.rgb;
                 float topY = uHeight * 0.5;

                 if (uDesignIndex == 1) { // Ombre
                     float mixVal = smoothstep(-topY, topY, vY);
                     finalColor = mix(uBaseColor, vec3(1.0, 0.98, 0.95), mixVal);
                 }
                 if (uDesignIndex == 2) { // Marble
                     float m = noise(vPos * 5.0 + noise(vPos * 10.0));
                     float streaks = smoothstep(0.42, 0.45, m);
                     finalColor = mix(finalColor, vec3(0.05), streaks * 0.2);
                 }
                 if (uDesignIndex == 3) { // Drip
                     float angle = atan(vPos.z, vPos.x);
                     float dNoise = noise(vec3(angle * 3.0, 0.0, 0.0)) * 0.3;
                     float dThreshold = topY - 0.05 - dNoise;
                     if (vY > dThreshold || (vY > dThreshold - 0.15 && fract(angle * 6.0) > 0.8)) {
                         finalColor = vec3(0.15, 0.08, 0.04);
                     }
                 }
                 if (uDesignIndex == 4) { // Floral
                     if (noise(vPos * 25.0) > 0.82) finalColor = vec3(1.0, 0.6, 0.8);
                 }
                 if (uDesignIndex == 5) { // Geometric
                     if (fract(vPos.x * 12.0) > 0.95 || fract(vPos.z * 12.0) > 0.95) finalColor *= 1.25;
                 }
                 if (uDesignIndex == 6) { // Gold
                     if (noise(vPos * 35.0) > 0.9) finalColor = vec3(1.0, 0.84, 0.0) * 1.5;
                 }
                 if (uDesignIndex == 7) { // Rustic
                     float blend = smoothstep(topY * 0.8, -topY * 0.8, vY);
                     float rNoise = noise(vPos * 8.0);
                     if (rNoise > 0.45) finalColor = mix(finalColor, vec3(0.85, 0.8, 0.7), blend * 0.7);
                 }

                 diffuseColor.rgb = finalColor;
                `
            );
        };

        return mat;
    }, [baseColor, design, roughnessMap, normalMap]);

    return material;
};

const CakeStand = ({ w, y }: { w: number; y: number }) => (
    <group position={[0, y, 0]}>
        {/* Base Plate */}
        <mesh receiveShadow position={[0, -0.025, 0]}>
            <cylinderGeometry args={[w * 0.75, w * 0.82, 0.05, 64]} />
            <meshStandardMaterial 
                color="#f8f8f8" 
                roughness={0.05} 
                metalness={1.0} 
                envMapIntensity={1.5}
            />
        </mesh>
        {/* Stem */}
        <mesh receiveShadow position={[0, -0.4, 0]}>
            <cylinderGeometry args={[w * 0.18, w * 0.28, 0.75, 64]} />
            <meshStandardMaterial color="#f8f8f8" roughness={0.1} metalness={1.0} envMapIntensity={1.2} />
        </mesh>
    </group>
);

const CakeMesh = ({ shape, size, baseColor, design }: { shape: string; size: string; baseColor: string; design: string }) => {
    const { gl } = useThree();
    const maxAnisotropy = useMemo(() => gl.capabilities.getMaxAnisotropy(), [gl]);
    const material = usePBRMaterial(baseColor, design, maxAnisotropy);
    const dims = SIZE_DIMS[size as keyof typeof SIZE_DIMS] || SIZE_DIMS.medium;

    const s = 0.012; // ── Reduced scale for guaranteed fit ──
    const w = dims.w * s, h = dims.h * s, d = shape === 'rectangle' ? w * 1.3 : w;

    useEffect(() => {
        if (material && material.userData.shader) {
            material.userData.shader.uniforms.uHeight.value = h;
            material.needsUpdate = true;
        }
    }, [material, h, design]);

    return (
        <group>
            {shape === 'square' && (
                <RoundedBox args={[w, h, w]} radius={0.06} smoothness={4} castShadow receiveShadow>
                    <primitive object={material} attach="material" />
                </RoundedBox>
            )}
            {shape === 'rectangle' && (
                <RoundedBox args={[w * 1.25, h, d * 0.8]} radius={0.06} smoothness={4} castShadow receiveShadow>
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
                        { depth: h, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.04, bevelSegments: 4, curveSegments: shape === 'circle' ? 64 : 32 }
                    ]} />
                    <primitive object={material} attach="material" />
                </mesh>
            )}
        </group>
    );
};

const LoadingFallback = () => (
    <Html center>
        <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin shadow-lg" />
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-accent drop-shadow-sm">Mastering The Design...</p>
        </div>
    </Html>
);

const CakeScene = ({ shape, size, baseColor, design, isTiered, autoRotate }: any) => {
    const groupRef = useRef<THREE.Group>(null);
    useFrame(({ clock }) => { 
        if (autoRotate && groupRef.current) groupRef.current.rotation.y = clock.getElapsedTime() * 0.4; 
    });

    const dims = SIZE_DIMS[size as keyof typeof SIZE_DIMS] || SIZE_DIMS.medium;
    const s = 0.012;
    const h = dims.h * s;
    const w = dims.w * s;

    const cakeBottom = -h / 2;
    const standBottom = cakeBottom - 0.8;
    const cakeTop = isTiered ? (h * 1.3 + (h * 0.7 * 0.5)) : (h / 2);
    const middle = (standBottom + cakeTop) / 2;
    const yOffset = -middle;
    const shadowY = standBottom - middle;

    return (
        <group ref={groupRef} position={[0, yOffset, 0]}>
            {isTiered ? (
                <group position={[0, cakeBottom, 0]}>
                    <group position={[0, h / 2, 0]}>
                        <CakeMesh shape={shape} size="medium" baseColor={baseColor} design={design} />
                    </group>
                    <group position={[0, h * 1.3, 0]} scale={0.7}>
                        <CakeMesh shape={shape} size="medium" baseColor={baseColor} design={design} />
                    </group>
                </group>
            ) : (
                <CakeMesh shape={shape} size={size} baseColor={baseColor} design={design} />
            )}
            <CakeStand w={w} y={cakeBottom} />
            
            {/* Shadows relative to this group so they follow the bottom of the stand */}
            <ContactShadows position={[0, shadowY, 0]} opacity={0.6} scale={10} blur={2.5} far={2} />
        </group>
    );
};

class ErrorBoundary extends Component<{ children: React.ReactNode }, { hasError: boolean }> {
    constructor(props: any) { super(props); this.state = { hasError: false }; }
    static getDerivedStateFromError() { return { hasError: true }; }
    render() {
        if (this.state.hasError) return <div className="flex items-center justify-center h-full text-[10px] text-red-500 font-bold uppercase">Render Refined</div>;
        return this.props.children;
    }
}

const CakePreview3D = ({ shape, flavour, design, size, cakeMessage, autoRotate = true }: any) => {
    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => setIsMounted(true), []);

    const flavourOpt = OPTIONS.Flavour.find(o => o.id === flavour);
    const baseColor = flavourOpt?.color || '#FFF9E3';

    // ── Dynamic Formatting Logic ──
    const dims = SIZE_DIMS[size as keyof typeof SIZE_DIMS] || SIZE_DIMS.medium;
    const s = 0.012; // Base scale for professional margin
    const h = dims.h * s;
    const isTiered = size === 'tiered';
    
    // totalH calculation: Cake height + Tier (if any) + Stand height (0.8)
    const cakeTotalH = isTiered ? (h + h * 0.7) : h;
    const totalH = cakeTotalH + 0.8;
    
    // Calculate camera distance to fit totalH
    // Visible Height = 2 * d * tan(fov/2). We want Visible Height = totalH * buffer
    const fov = 35;
    const buffer = 1.7; // Even more breathing room
    const cameraZ = (totalH * buffer) / (2 * Math.tan((fov / 2) * (Math.PI / 180)));
    const cameraY = isTiered ? 1.5 : 1.2;

    if (!isMounted) return <div className="w-full h-full min-h-[600px] rounded-[3rem] bg-[#fdfaf5] animate-pulse" />;

    return (
        <div className="relative w-full h-[600px] bg-[#fdfaf5] rounded-[2rem] overflow-hidden">
            <ErrorBoundary>
                <Canvas shadows dpr={[1, 2]} gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.2 }} className="w-full h-full absolute inset-0">
                    <PerspectiveCamera makeDefault position={[0, cameraY, Math.max(cameraZ, 6.5)]} fov={fov} />
                    <OrbitControls enablePan={false} enableZoom={false} minPolarAngle={0.8} maxPolarAngle={1.8} />
                    
                    <ambientLight intensity={0.6} />
                    <pointLight position={[5, 10, 5]} intensity={1.8} castShadow />
                    <pointLight position={[-5, 5, -5]} intensity={0.8} color="#ffd" />
                    <spotLight position={[10, 10, 10]} intensity={2} angle={0.4} penumbra={1} castShadow />
                    
                    <Suspense fallback={<LoadingFallback />}>
                        <Environment preset="studio" blur={0.8} />
                        <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.3}>
                            <CakeScene shape={shape} size={size} baseColor={baseColor} design={design} isTiered={size === 'tiered'} autoRotate={autoRotate} />
                        </Float>
                    </Suspense>

                    <EffectComposer>
                        <Bloom intensity={0.2} luminanceThreshold={1} />
                        <SSAO intensity={3} radius={0.015} />
                        <ToneMapping />
                    </EffectComposer>
                </Canvas>
                
                {cakeMessage && (
                    <div className="absolute bottom-12 left-1/2 -translate-x-1/2 bg-white/70 backdrop-blur-xl px-12 py-3 rounded-full border border-black/5 shadow-2xl transition-all duration-500 hover:scale-105 z-10 text-center">
                        <p className="text-[13px] font-serif italic truncate max-w-[300px] text-zinc-800 tracking-wide">"{cakeMessage}"</p>
                    </div>
                )}
            </ErrorBoundary>
        </div>
    );
};

export default CakePreview3D;
