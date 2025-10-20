'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface ParticleData {
  originalX: number;
  originalY: number;
  originalZ: number;
  strand: number;
  angle: number;
  offset: number;
  waveOffset: number;
  brightness: number;
  irregularWave: number;
  sizePhase: number;
  upwardSpeed: number;
}

interface DNAParticleWaveProps {
  width?: number;
  height?: number;
  showControls?: boolean;
}

export default function DNAParticleWave({ 
  width, 
  height, 
  showControls = false 
}: DNAParticleWaveProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animationIdRef = useRef<number | null>(null);
  
  const [params, setParams] = useState({
    particleSize: 2.0,
    waveSpeed: 0.5,
    waveAmplitude: 15,
    twistSpeed: 0.3,
    helixRadius: 20,
    helixHeight: 150,
    particleDensity: 5000,
    glowIntensity: 2.0,
    autoRotate: true,
    rotationSpeed: 0.2,
    colorShift: 0.15,
    mouseInfluence: 0.3,
    waveIrregularity: 0.5,
    upwardMotion: 0.8,
    sizePulseSpeed: 5.0
  });

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const w = width || container.clientWidth;
    const h = height || container.clientHeight;

    // Mouse tracking
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };

    // Scene setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x0a0015, 50, 300);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 1000);
    camera.position.set(0, 0, 120);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: !showControls });
    renderer.setSize(w, h);
    renderer.setClearColor(0x0a0015, 1);
    rendererRef.current = renderer;
    container.appendChild(renderer.domElement);

    // Lights
    const light1 = new THREE.PointLight(0xff6600, params.glowIntensity, 300);
    light1.position.set(30, 50, 50);
    scene.add(light1);

    const light2 = new THREE.PointLight(0xff8833, params.glowIntensity * 0.7, 300);
    light2.position.set(-30, -50, 50);
    scene.add(light2);

    const ambientLight = new THREE.AmbientLight(0x331100, 0.5);
    scene.add(ambientLight);

    // Create DNA helix particles
    const particleCount = params.particleDensity;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    const particleData: ParticleData[] = [];

    for (let i = 0; i < particleCount; i++) {
      const t = (i / particleCount) * params.helixHeight - params.helixHeight / 2;
      const strand = Math.random() > 0.5 ? 1 : -1;
      const angle = (i / particleCount) * Math.PI * 8 + (strand > 0 ? 0 : Math.PI);

      const x = params.helixRadius * Math.cos(angle) * strand;
      const z = params.helixRadius * Math.sin(angle) * strand;

      positions[i * 3] = x;
      positions[i * 3 + 1] = t;
      positions[i * 3 + 2] = z;

      // Orange to yellow gradient
      const colorMix = Math.random() * 0.3 + 0.7;
      colors[i * 3] = 1.0;
      colors[i * 3 + 1] = 0.4 + colorMix * 0.2;
      colors[i * 3 + 2] = 0.0;

      sizes[i] = Math.random() * 0.5 + 0.5;

      particleData.push({
        originalX: x,
        originalY: t,
        originalZ: z,
        strand: strand,
        angle: angle,
        offset: Math.random() * Math.PI * 2,
        waveOffset: Math.random() * Math.PI * 2,
        brightness: Math.random() * 0.5 + 0.5,
        irregularWave: Math.random() * 2 - 1,
        sizePhase: Math.random() * Math.PI * 2,
        upwardSpeed: Math.random() * 0.3 + 0.1
      });
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    // Custom shader for glowing particles
    const material = new THREE.ShaderMaterial({
      uniforms: {
        pointSize: { value: params.particleSize },
        time: { value: 0 }
      },
      vertexShader: `
        attribute float size;
        attribute vec3 color;
        varying vec3 vColor;
        varying float vAlpha;
        uniform float pointSize;
        uniform float time;
        
        void main() {
          vColor = color;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          
          // Distance-based alpha for depth
          float depth = -mvPosition.z;
          vAlpha = smoothstep(200.0, 50.0, depth);
          
          gl_PointSize = size * pointSize * (300.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        varying float vAlpha;
        
        void main() {
          vec2 center = gl_PointCoord - vec2(0.5);
          float dist = length(center);
          
          if (dist > 0.5) discard;
          
          // Glowing effect
          float glow = 1.0 - (dist * 2.0);
          glow = pow(glow, 2.0);
          
          vec3 finalColor = vColor * (1.0 + glow * 0.5);
          float alpha = glow * vAlpha;
          
          gl_FragColor = vec4(finalColor, alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // Mouse interaction
    const handleMouseMove = (e: MouseEvent) => {
      mouse.targetX = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.targetY = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Animation
    function animate(time: number) {
      animationIdRef.current = requestAnimationFrame(animate);

      // Smooth mouse following
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      material.uniforms.time.value = time * 0.001;

      const pos = particles.geometry.attributes.position.array as Float32Array;
      const col = particles.geometry.attributes.color.array as Float32Array;
      const size = particles.geometry.attributes.size.array as Float32Array;

      for (let i = 0; i < particleCount; i++) {
        const data = particleData[i];

        // Height-based wave traveling up and down with irregularity
        const heightRatio = (data.originalY + params.helixHeight / 2) / params.helixHeight;
        const wavePhase = time * 0.001 * params.waveSpeed - heightRatio * 5 + data.waveOffset;

        // Irregular wave - each particle has its own wave pattern
        const regularWave = Math.sin(wavePhase);
        const irregularWave = Math.sin(wavePhase * 1.3 + data.offset) * 0.7 + 
                              Math.sin(wavePhase * 0.7 - data.offset) * 0.3;
        const wave = regularWave * (1 - params.waveIrregularity) + 
                    irregularWave * params.waveIrregularity + 
                    data.irregularWave * 0.2;

        // Twist motion
        const twistPhase = time * 0.001 * params.twistSpeed;
        const currentAngle = data.angle + twistPhase + heightRatio * Math.PI * 2;

        // Wave amplitude affects radial position
        const radiusWave = params.helixRadius + wave * params.waveAmplitude;

        // Middle particles (where wave intensity is high) move upward more freely
        const waveIntensity = Math.abs(wave);
        const upwardOffset = waveIntensity * data.upwardSpeed * params.upwardMotion * 15 * Math.sin(time * 0.002);

        // Calculate new position with twist and wave
        const x = radiusWave * Math.cos(currentAngle) * data.strand;
        const z = radiusWave * Math.sin(currentAngle) * data.strand;
        const y = data.originalY + Math.sin(wavePhase * 1.3) * 3 + upwardOffset;

        // Apply mouse influence
        const mouseEffect = params.mouseInfluence * 20;
        pos[i * 3] = x + mouse.x * mouseEffect * (1 - Math.abs(heightRatio - 0.5) * 2);
        pos[i * 3 + 1] = y + mouse.y * mouseEffect * 0.5;
        pos[i * 3 + 2] = z;

        // Color intensity based on wave
        const intensity = (wave + 1) * 0.5;
        const colorIntensity = 0.5 + intensity * 0.5;
        col[i * 3] = 1.0;
        col[i * 3 + 1] = (0.4 + colorIntensity * 0.3) * (1 + params.colorShift * wave * 0.5);
        col[i * 3 + 2] = intensity * 0.2 * params.colorShift;

        // Size pulsing on 0.2s interval (5 Hz) with wave influence
        const sizePulsePhase = time * 0.001 * params.sizePulseSpeed + data.sizePhase;
        const sizePulse = Math.sin(sizePulsePhase);
        const waveSizeInfluence = waveIntensity * 0.5;
        size[i] = (0.5 + (sizePulse * 0.5 + 0.5) * 0.7 + waveSizeInfluence) * data.brightness;
      }

      particles.geometry.attributes.position.needsUpdate = true;
      particles.geometry.attributes.color.needsUpdate = true;
      particles.geometry.attributes.size.needsUpdate = true;

      // Auto rotation
      if (params.autoRotate) {
        particles.rotation.y += 0.001 * params.rotationSpeed;
      }

      // Interactive rotation
      const targetRotX = mouse.y * 0.5;
      particles.rotation.x += (targetRotX - particles.rotation.x) * 0.05;
      particles.rotation.y += mouse.x * 0.002;

      // Move lights with wave
      const lightWave = Math.sin(time * 0.0005) * 30;
      light1.position.x = 30 + lightWave;
      light2.position.x = -30 - lightWave;

      renderer.render(scene, camera);
    }

    animate(0);

    // Handle resize
    const handleResize = () => {
      const newW = width || container.clientWidth;
      const newH = height || container.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);

      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }

      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }

      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, [width, height, showControls, params]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />

      {showControls && (
        <div style={{
          position: 'absolute',
          top: 10,
          right: 10,
          background: 'rgba(10, 0, 21, 0.9)',
          padding: '15px',
          borderRadius: '8px',
          color: '#ff8833',
          fontSize: '12px',
          maxHeight: '80vh',
          overflowY: 'auto',
          border: '1px solid rgba(255, 102, 0, 0.3)'
        }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#ff6600' }}>Controls</h3>

          <label style={{ display: 'block', marginBottom: '8px' }}>
            Particle Size: {params.particleSize.toFixed(1)}
            <input
              type="range"
              min="0.5"
              max="5"
              step="0.1"
              value={params.particleSize}
              onChange={(e) => setParams({ ...params, particleSize: parseFloat(e.target.value) })}
              style={{ width: '100%' }}
            />
          </label>

          <label style={{ display: 'block', marginBottom: '8px' }}>
            Wave Speed: {params.waveSpeed.toFixed(1)}
            <input
              type="range"
              min="0.1"
              max="2"
              step="0.1"
              value={params.waveSpeed}
              onChange={(e) => setParams({ ...params, waveSpeed: parseFloat(e.target.value) })}
              style={{ width: '100%' }}
            />
          </label>

          <label style={{ display: 'block', marginBottom: '8px' }}>
            Wave Amplitude: {params.waveAmplitude.toFixed(0)}
            <input
              type="range"
              min="5"
              max="30"
              step="1"
              value={params.waveAmplitude}
              onChange={(e) => setParams({ ...params, waveAmplitude: parseFloat(e.target.value) })}
              style={{ width: '100%' }}
            />
          </label>

          <label style={{ display: 'block', marginBottom: '8px' }}>
            Twist Speed: {params.twistSpeed.toFixed(2)}
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.05"
              value={params.twistSpeed}
              onChange={(e) => setParams({ ...params, twistSpeed: parseFloat(e.target.value) })}
              style={{ width: '100%' }}
            />
          </label>

          <label style={{ display: 'block', marginBottom: '8px' }}>
            Glow Intensity: {params.glowIntensity.toFixed(1)}
            <input
              type="range"
              min="0"
              max="5"
              step="0.1"
              value={params.glowIntensity}
              onChange={(e) => setParams({ ...params, glowIntensity: parseFloat(e.target.value) })}
              style={{ width: '100%' }}
            />
          </label>

          <label style={{ display: 'block', marginBottom: '8px' }}>
            Wave Irregularity: {params.waveIrregularity.toFixed(2)}
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={params.waveIrregularity}
              onChange={(e) => setParams({ ...params, waveIrregularity: parseFloat(e.target.value) })}
              style={{ width: '100%' }}
            />
          </label>

          <label style={{ display: 'block', marginBottom: '8px' }}>
            Upward Motion: {params.upwardMotion.toFixed(1)}
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={params.upwardMotion}
              onChange={(e) => setParams({ ...params, upwardMotion: parseFloat(e.target.value) })}
              style={{ width: '100%' }}
            />
          </label>

          <label style={{ display: 'block', marginBottom: '8px' }}>
            Size Pulse Speed: {params.sizePulseSpeed.toFixed(1)}
            <input
              type="range"
              min="1"
              max="10"
              step="0.5"
              value={params.sizePulseSpeed}
              onChange={(e) => setParams({ ...params, sizePulseSpeed: parseFloat(e.target.value) })}
              style={{ width: '100%' }}
            />
          </label>

          <label style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
            <input
              type="checkbox"
              checked={params.autoRotate}
              onChange={(e) => setParams({ ...params, autoRotate: e.target.checked })}
              style={{ marginRight: '8px' }}
            />
            Auto Rotate
          </label>

          <label style={{ display: 'block', marginBottom: '8px' }}>
            Rotation Speed: {params.rotationSpeed.toFixed(1)}
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.05"
              value={params.rotationSpeed}
              onChange={(e) => setParams({ ...params, rotationSpeed: parseFloat(e.target.value) })}
              style={{ width: '100%' }}
            />
          </label>

          <label style={{ display: 'block', marginBottom: '8px' }}>
            Mouse Influence: {params.mouseInfluence.toFixed(2)}
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={params.mouseInfluence}
              onChange={(e) => setParams({ ...params, mouseInfluence: parseFloat(e.target.value) })}
              style={{ width: '100%' }}
            />
          </label>

          <label style={{ display: 'block', marginBottom: '8px' }}>
            Color Shift: {params.colorShift.toFixed(2)}
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={params.colorShift}
              onChange={(e) => setParams({ ...params, colorShift: parseFloat(e.target.value) })}
              style={{ width: '100%' }}
            />
          </label>
        </div>
      )}
    </div>
  );
}