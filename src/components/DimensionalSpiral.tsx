"use client"

import { useEffect, useRef } from "react"
import * as THREE from "three"

function DimensionalSpiral() {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!mountRef.current) return

    const currentMount = mountRef.current
    const width = currentMount.clientWidth
    const height = currentMount.clientHeight

    // Scene setup
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000)
    camera.position.set(0, 50, 150)
    camera.lookAt(0, 0, 0)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(width, height)
    renderer.setClearColor(0x000000, 0)
    currentMount.appendChild(renderer.domElement)

    // Lights
    const light1 = new THREE.PointLight(0xffffff, 2.0, 600)
    light1.position.set(0, 80, 100)
    scene.add(light1)

    const light2 = new THREE.PointLight(0xffffff, 1.0, 600)
    light2.position.set(0, -80, 100)
    scene.add(light2)

    const ambientLight = new THREE.AmbientLight(0x404040, 1.2)
    scene.add(ambientLight)

    // Create spiral
    const spiralLayers = 80
    const pointsPerLayer = 60
    const count = spiralLayers * pointsPerLayer

    const geometry = new THREE.BufferGeometry()
    const positions = new Float32Array(count * 3)
    const sizes = new Float32Array(count)
    const basePositions = new Float32Array(count * 3)

    let idx = 0
    for (let layer = 0; layer < spiralLayers; layer++) {
      const progress = layer / spiralLayers
      const y = (progress - 0.5) * 100
      const baseRadius = 50 * (1 - progress * 0.3)

      for (let p = 0; p < pointsPerLayer; p++) {
        const angle = (p / pointsPerLayer) * Math.PI * 2 + layer * 0.15
        const radius = baseRadius

        positions[idx * 3] = radius * Math.cos(angle)
        positions[idx * 3 + 1] = y
        positions[idx * 3 + 2] = radius * Math.sin(angle)

        basePositions[idx * 3] = positions[idx * 3]
        basePositions[idx * 3 + 1] = positions[idx * 3 + 1]
        basePositions[idx * 3 + 2] = positions[idx * 3 + 2]

        sizes[idx] = 1.0
        idx++
      }
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1))

    const material = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 3.0,
      transparent: true,
      opacity: 0.9,
      sizeAttenuation: true,
    })

    const points = new THREE.Points(geometry, material)
    scene.add(points)

    // Animation
    let animationId: number
    function animate(time: number) {
      animationId = requestAnimationFrame(animate)

      const pos = points.geometry.attributes.position.array as Float32Array
      const sizeAttr = points.geometry.attributes.size.array as Float32Array

      for (let layer = 0; layer < spiralLayers; layer++) {
        const layerProgress = layer / spiralLayers

        for (let p = 0; p < pointsPerLayer; p++) {
          const i = layer * pointsPerLayer + p

          const pulsePhase = time * 0.0008 - layerProgress * 8
          const pulse = Math.sin(pulsePhase) * 12
          const dimensionalFade = (Math.sin(pulsePhase) + 1) * 0.5

          const baseX = basePositions[i * 3]
          const baseY = basePositions[i * 3 + 1]
          const baseZ = basePositions[i * 3 + 2]

          const distFromCenter = Math.sqrt(baseX * baseX + baseZ * baseZ)
          const pulseFactor = 1 + (pulse / (distFromCenter + 1)) * 0.3

          pos[i * 3] = baseX * pulseFactor
          pos[i * 3 + 1] = baseY
          pos[i * 3 + 2] = baseZ * pulseFactor

          sizeAttr[i] = 0.8 + dimensionalFade * 0.4
        }
      }

      points.geometry.attributes.position.needsUpdate = true
      points.geometry.attributes.size.needsUpdate = true

      points.rotation.y += 0.0002

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

export default DimensionalSpiral
