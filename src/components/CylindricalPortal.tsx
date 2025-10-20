'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface CylindricalPortalProps {
  width?: number;
  height?: number;
  showControls?: boolean;
}

export default function CylindricalPortal({ 
  width, 
  height, 
  showControls = false 
}: CylindricalPortalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animationIdRef = useRef<number | null>(null);
  
  const [params, setParams] = useState({
    pointRadius: 2.5,
    pulseSpeed: 0.6,
    particleDensity: 0.8,
    lightIntensity: 2.5,
    mouseInfluence: 0.15,
    autoRotate: true,
    rotationSpeed: 0.2,
    cylinderRadius: 60,
    cylinderHeight: 120,
    ringBrightness: 1.5,
    particleSpeed: 0.5
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
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 1000);
    camera.position.set(0, 0, 180);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(w, h);
    renderer.setClearColor(0x000000, showControls ? 0 : 1);
    rendererRef.current = renderer;
    container.appendChild(renderer.domElement);

    // Lights
    const light1 = new THREE.PointLight(0xffffff, params.lightIntensity, 600);
    light1.position.set(0, 80, 100);
    scene.add(light1);

    const light2 = new THREE.PointLight(0xffffff, params.lightIntensity, 600);
    light2.position.set(0, -80, 100);
    scene.add(light2);

    const ambientLight = new THREE.AmbientLight(0x404040, 1.2);
    scene.add(ambientLight);

    // Create cylinder ring structure (top and bottom)
    const ringPointsCount = 80;
    const ringsGeometry = new THREE.BufferGeometry();
    const ringPositions = new Float32Array(ringPointsCount * 2 * 3);
    const ringSizes = new Float32Array(ringPointsCount * 2);

    let idx = 0;
    // Top ring
    for (let i = 0; i < ringPointsCount; i++) {
      const angle = (i / ringPointsCount) * Math.PI * 2;
      ringPositions[idx * 3] = params.cylinderRadius * Math.cos(angle);
      ringPositions[idx * 3 + 1] = params.cylinderHeight / 2;
      ringPositions[idx * 3 + 2] = params.cylinderRadius * Math.sin(angle);
      ringSizes[idx] = 1.5;
      idx++;
    }
    // Bottom ring
    for (let i = 0; i < ringPointsCount; i++) {
      const angle = (i / ringPointsCount) * Math.PI * 2;
      ringPositions[idx * 3] = params.cylinderRadius * Math.cos(angle);
      ringPositions[idx * 3 + 1] = -params.cylinderHeight / 2;
      ringPositions[idx * 3 + 2] = params.cylinderRadius * Math.sin(angle);
      ringSizes[idx] = 1.5;
      idx++;
    }

    ringsGeometry.setAttribute('position', new THREE.BufferAttribute(ringPositions, 3));
    ringsGeometry.setAttribute('size', new THREE.BufferAttribute(ringSizes, 1));

    const ringsMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: params.pointRadius * params.ringBrightness,
      transparent: true,
      opacity: 1.0,
      sizeAttenuation: true
    });

    const rings = new THREE.Points(ringsGeometry, ringsMaterial);
    scene.add(rings);

    // Ring connecting lines
    const ringLinesGeometry = new THREE.BufferGeometry();
    const ringLinePositions = new Float32Array(ringPointsCount * 2 * 6);
    ringLinesGeometry.setAttribute('position', new THREE.BufferAttribute(ringLinePositions, 3));

    const ringLinesMaterial = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.6
    });

    const ringLines = new THREE.LineSegments(ringLinesGeometry, ringLinesMaterial);
    scene.add(ringLines);

    // Create particle cloud inside cylinder
    const particleCount = 3000;
    const particlesGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleSizes = new Float32Array(particleCount);
    const particleVelocities: { x: number; y: number; z: number }[] = [];

    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * params.cylinderRadius * 0.9;
      const y = (Math.random() - 0.5) * params.cylinderHeight;

      particlePositions[i * 3] = radius * Math.cos(angle);
      particlePositions[i * 3 + 1] = y;
      particlePositions[i * 3 + 2] = radius * Math.sin(angle);

      particleSizes[i] = Math.random() * 0.5 + 0.3;

      particleVelocities.push({
        x: (Math.random() - 0.5) * 0.1,
        y: (Math.random() - 0.5) * 0.2,
        z: (Math.random() - 0.5) * 0.1
      });
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particlesGeometry.setAttribute('size', new THREE.BufferAttribute(particleSizes, 1));

    const particlesMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: params.pointRadius * 0.8,
      transparent: true,
      opacity: 0.6,
      sizeAttenuation: true
    });

    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
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

      // Update ring lines
      const ringLinePos = ringLines.geometry.attributes.position.array as Float32Array;
      const ringPos = rings.geometry.attributes.position.array as Float32Array;

      for (let i = 0; i < ringPointsCount; i++) {
        // Top ring circle
        const nextI = (i + 1) % ringPointsCount;
        ringLinePos[i * 6] = ringPos[i * 3];
        ringLinePos[i * 6 + 1] = ringPos[i * 3 + 1];
        ringLinePos[i * 6 + 2] = ringPos[i * 3 + 2];
        ringLinePos[i * 6 + 3] = ringPos[nextI * 3];
        ringLinePos[i * 6 + 4] = ringPos[nextI * 3 + 1];
        ringLinePos[i * 6 + 5] = ringPos[nextI * 3 + 2];

        // Bottom ring circle
        const bottomIdx = ringPointsCount + i;
        const nextBottomI = ringPointsCount + (i + 1) % ringPointsCount;
        ringLinePos[(ringPointsCount + i) * 6] = ringPos[bottomIdx * 3];
        ringLinePos[(ringPointsCount + i) * 6 + 1] = ringPos[bottomIdx * 3 + 1];
        ringLinePos[(ringPointsCount + i) * 6 + 2] = ringPos[bottomIdx * 3 + 2];
        ringLinePos[(ringPointsCount + i) * 6 + 3] = ringPos[nextBottomI * 3];
        ringLinePos[(ringPointsCount + i) * 6 + 4] = ringPos[nextBottomI * 3 + 1];
        ringLinePos[(ringPointsCount + i) * 6 + 5] = ringPos[nextBottomI * 3 + 2];
      }

      ringLines.geometry.attributes.position.needsUpdate = true;

      // Pulse effect on rings
      const pulse = Math.sin(time * 0.001 * params.pulseSpeed) * 0.5 + 0.5;
      ringsMaterial.opacity = 0.7 + pulse * 0.3;
      ringLinesMaterial.opacity = 0.4 + pulse * 0.3;

      // Update particle positions
      const particlePos = particles.geometry.attributes.position.array as Float32Array;

      for (let i = 0; i < particleCount; i++) {
        particlePos[i * 3] += particleVelocities[i].x * params.particleSpeed;
        particlePos[i * 3 + 1] += particleVelocities[i].y * params.particleSpeed;
        particlePos[i * 3 + 2] += particleVelocities[i].z * params.particleSpeed;

        // Keep particles inside cylinder
        const dist = Math.sqrt(particlePos[i * 3] ** 2 + particlePos[i * 3 + 2] ** 2);
        if (dist > params.cylinderRadius * 0.9) {
          particleVelocities[i].x *= -0.8;
          particleVelocities[i].z *= -0.8;
        }

        // Bounce particles at top/bottom
        if (Math.abs(particlePos[i * 3 + 1]) > params.cylinderHeight / 2) {
          particleVelocities[i].y *= -0.8;
          particlePos[i * 3 + 1] = Math.sign(particlePos[i * 3 + 1]) * params.cylinderHeight / 2;
        }
      }

      particles.geometry.attributes.position.needsUpdate = true;

      // Auto rotation
      if (params.autoRotate) {
        rings.rotation.y += 0.001 * params.rotationSpeed;
        ringLines.rotation.y += 0.001 * params.rotationSpeed;
        particles.rotation.y += 0.0005 * params.rotationSpeed;
      }

      // Interactive rotation based on mouse
      const targetRotX = mouse.y * 0.4;

      rings.rotation.x += (targetRotX - rings.rotation.x) * 0.05;
      rings.rotation.y += mouse.x * 0.002;
      ringLines.rotation.x = rings.rotation.x;
      ringLines.rotation.y = rings.rotation.y;
      particles.rotation.x = rings.rotation.x * 0.5;

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
      
      ringsGeometry.dispose();
      ringsMaterial.dispose();
      ringLinesGeometry.dispose();
      ringLinesMaterial.dispose();
      particlesGeometry.dispose();
      particlesMaterial.dispose();
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
          background: 'rgba(0, 0, 0, 0.8)',
          padding: '15px',
          borderRadius: '8px',
          color: '#fff',
          fontSize: '12px',
          maxHeight: '80vh',
          overflowY: 'auto'
        }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>Controls</h3>
          
          <label style={{ display: 'block', marginBottom: '8px' }}>
            Point Radius: {params.pointRadius.toFixed(1)}
            <input
              type="range"
              min="1"
              max="6"
              step="0.1"
              value={params.pointRadius}
              onChange={(e) => setParams({ ...params, pointRadius: parseFloat(e.target.value) })}
              style={{ width: '100%' }}
            />
          </label>

          <label style={{ display: 'block', marginBottom: '8px' }}>
            Pulse Speed: {params.pulseSpeed.toFixed(1)}
            <input
              type="range"
              min="0.1"
              max="2"
              step="0.1"
              value={params.pulseSpeed}
              onChange={(e) => setParams({ ...params, pulseSpeed: parseFloat(e.target.value) })}
              style={{ width: '100%' }}
            />
          </label>

          <label style={{ display: 'block', marginBottom: '8px' }}>
            Particle Density: {params.particleDensity.toFixed(1)}
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.1"
              value={params.particleDensity}
              onChange={(e) => setParams({ ...params, particleDensity: parseFloat(e.target.value) })}
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
        </div>
      )}
    </div>
  );
}