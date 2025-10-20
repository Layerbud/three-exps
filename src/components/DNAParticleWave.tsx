"use client"

import { useEffect, useRef } from "react"
import * as THREE from "three"

function DNAParticleWave() {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!mountRef.current) return

    const currentMount = mountRef.current
    const width = currentMount.clientWidth
    const height = currentMount.clientHeight

    // Scene setup
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
    camera.position.set(0, 0, 80)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(width, height)
    renderer.setClearColor(0x000000, 0)
    currentMount.appendChild(renderer.domElement)

    // Lighting
    const light1 = new THREE.PointLight(0xff00ff, 2, 500)
    light1.position.set(50, 50, 50)
    scene.add(light1)

    const light2 = new THREE.PointLight(0x00ffff, 1.5, 500)
    light2.position.set(-50, -50, 50)
    scene.add(light2)

    const ambientLight = new THREE.AmbientLight(0x404040, 1)
    scene.add(ambientLight)

    // Create DNA-like particle wave
    const particleCount = 2000
    const geometry = new THREE.BufferGeometry()
    const positions = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)
    const basePositions = new Float32Array(particleCount * 3)

    for (let i = 0; i < particleCount; i++) {
      const t = i / particleCount
      const x = Math.cos(t * Math.PI * 4) * 20
      const y = (t - 0.5) * 60
      const z = Math.sin(t * Math.PI * 4) * 20

      positions[i * 3] = x
      positions[i * 3 + 1] = y
      positions[i * 3 + 2] = z

      basePositions[i * 3] = x
      basePositions[i * 3 + 1] = y
      basePositions[i * 3 + 2] = z

      // Color gradient
      const hue = t
      const color = new THREE.Color().setHSL(hue, 1, 0.5)
      colors[i * 3] = color.r
      colors[i * 3 + 1] = color.g
      colors[i * 3 + 2] = color.b
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3))

    const material = new THREE.PointsMaterial({
      size: 1.5,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true,
    })

    const particles = new THREE.Points(geometry, material)
    scene.add(particles)

    // Animation
    let animationId: number
    function animate(time: number) {
      animationId = requestAnimationFrame(animate)

      const pos = particles.geometry.attributes.position.array as Float32Array

      for (let i = 0; i < particleCount; i++) {
        const t = i / particleCount
        const wave = Math.sin(time * 0.001 + t * Math.PI * 2) * 8

        pos[i * 3] = basePositions[i * 3] + wave
        pos[i * 3 + 1] = basePositions[i * 3 + 1]
        pos[i * 3 + 2] = basePositions[i * 3 + 2] + Math.cos(time * 0.0008 + t * Math.PI * 2) * 5
      }

      particles.geometry.attributes.position.needsUpdate = true
      particles.rotation.y += 0.0005

      renderer.render(scene, camera)
    }

    animate(0)

    // Cleanup
    return () => {
      cancelAnimationFrame(animationId)
      if (currentMount.contains(renderer.domElement)) {
        currentMount.removeChild(renderer.domElement)
      }
      geometry.dispose()
      material.dispose()
      renderer.dispose()
    }
  }, [])

  return <div ref={mountRef} style={{ width: "100%", height: "100%" }} />
}

export default DNAParticleWave
