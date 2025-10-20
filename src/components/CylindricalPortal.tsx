"use client"

import { useEffect, useRef } from "react"
import * as THREE from "three"

function CylindricalPortal() {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!mountRef.current) return

    const currentMount = mountRef.current
    const width = currentMount.clientWidth
    const height = currentMount.clientHeight

    // Scene setup
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
    camera.position.z = 50

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(width, height)
    renderer.setClearColor(0x000000, 0)
    currentMount.appendChild(renderer.domElement)

    // Lighting
    const light = new THREE.PointLight(0x00ffff, 2, 500)
    light.position.set(0, 0, 100)
    scene.add(light)

    const ambientLight = new THREE.AmbientLight(0x0033ff, 0.5)
    scene.add(ambientLight)

    // Create cylindrical portal with rings
    const rings: Array<{
      line: THREE.Line
      geometry: THREE.BufferGeometry
      material: THREE.LineBasicMaterial
      baseRadius: number
      index: number
    }> = []
    const ringCount = 12

    for (let i = 0; i < ringCount; i++) {
      const geometry = new THREE.BufferGeometry()
      const segments = 64
      const positions = new Float32Array(segments * 3)
      const radius = 15 + i * 2

      for (let j = 0; j < segments; j++) {
        const angle = (j / segments) * Math.PI * 2
        positions[j * 3] = Math.cos(angle) * radius
        positions[j * 3 + 1] = Math.sin(angle) * radius
        positions[j * 3 + 2] = i * 3 - 18
      }

      geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3))

      const material = new THREE.LineBasicMaterial({
        color: new THREE.Color().setHSL(i / ringCount, 1, 0.5),
        transparent: true,
        opacity: 0.8,
        linewidth: 2,
      })

      const line = new THREE.Line(geometry, material)
      scene.add(line)
      rings.push({ line, geometry, material, baseRadius: radius, index: i })
    }

    // Animation
    let animationId: number
    function animate(time: number) {
      animationId = requestAnimationFrame(animate)

      rings.forEach((ring) => {
        const positions = ring.geometry.attributes.position.array as Float32Array
        const segments = positions.length / 3
        const pulse = Math.sin(time * 0.003 + ring.index * 0.3) * 3
        const radius = ring.baseRadius + pulse

        for (let j = 0; j < segments; j++) {
          const angle = (j / segments) * Math.PI * 2
          positions[j * 3] = Math.cos(angle) * radius
          positions[j * 3 + 1] = Math.sin(angle) * radius
        }

        ring.geometry.attributes.position.needsUpdate = true
        ring.material.opacity = 0.4 + Math.sin(time * 0.002 + ring.index * 0.2) * 0.4
      })

      renderer.render(scene, camera)
    }

    animate(0)

    // Cleanup
    return () => {
      cancelAnimationFrame(animationId)
      if (currentMount.contains(renderer.domElement)) {
        currentMount.removeChild(renderer.domElement)
      }
      rings.forEach((ring) => {
        ring.geometry.dispose()
        ring.material.dispose()
      })
      renderer.dispose()
    }
  }, [])

  return <div ref={mountRef} style={{ width: "100%", height: "100%" }} />
}

export default CylindricalPortal
