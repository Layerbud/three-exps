"use client"
import React, { useEffect, useRef } from "react"
import * as THREE from "three"

export default function ParticleDisplacement() {
  const mountRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number>()
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 })

  useEffect(() => {
    if (!mountRef.current) return

    const container = mountRef.current
    const width = container.clientWidth
    const height = container.clientHeight

    // Scene setup
    const scene = new THREE.Scene()
    scene.fog = new THREE.Fog(0x000000, 1, 25)

    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
    camera.position.z = 12

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x000000, 0)
    container.appendChild(renderer.domElement)

    // Particle setup
    const particleCount = 8000
    const positions = new Float32Array(particleCount * 3)
    const originPositions = new Float32Array(particleCount * 3)
    const velocities = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)

    // Create sphere distribution
    const radius = 8
    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      
      const x = radius * Math.sin(phi) * Math.cos(theta) * (0.5 + Math.random() * 0.5)
      const y = radius * Math.sin(phi) * Math.sin(theta) * (0.5 + Math.random() * 0.5)
      const z = radius * Math.cos(phi) * (0.5 + Math.random() * 0.5)

      const i3 = i * 3
      positions[i3] = x
      positions[i3 + 1] = y
      positions[i3 + 2] = z

      originPositions[i3] = x
      originPositions[i3 + 1] = y
      originPositions[i3 + 2] = z

      velocities[i3] = 0
      velocities[i3 + 1] = 0
      velocities[i3 + 2] = 0

      const colorIntensity = (z + radius) / (radius * 2)
      colors[i3] = 0.3 + colorIntensity * 0.7
      colors[i3 + 1] = 0.5 + colorIntensity * 0.5
      colors[i3 + 2] = 1.0
    }

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3))

    const material = new THREE.PointsMaterial({
      size: 0.08,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true,
      depthWrite: false,
    })

    const points = new THREE.Points(geometry, material)
    scene.add(points)

    // Mouse interaction
    const handleMouseMove = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect()
      mouseRef.current.targetX = ((event.clientX - rect.left) / rect.width) * 2 - 1
      mouseRef.current.targetY = -((event.clientY - rect.top) / rect.height) * 2 + 1
    }
    container.addEventListener("mousemove", handleMouseMove)

    // Resize handling
    const handleResize = () => {
      const newWidth = container.clientWidth
      const newHeight = container.clientHeight
      
      camera.aspect = newWidth / newHeight
      camera.updateProjectionMatrix()
      
      renderer.setSize(newWidth, newHeight)
    }
    const resizeObserver = new ResizeObserver(handleResize)
    resizeObserver.observe(container)

    // Animation
    const clock = new THREE.Clock()
    const positionAttribute = geometry.getAttribute("position") as THREE.BufferAttribute

    const animate = () => {
      const elapsedTime = clock.getElapsedTime()

      // Smooth mouse movement
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05

      const mouseX3D = mouseRef.current.x * 8
      const mouseY3D = mouseRef.current.y * 8

      // Update particles
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3

        // Calculate displacement force
        const dx = positions[i3] - mouseX3D
        const dy = positions[i3 + 1] - mouseY3D
        const distance = Math.sqrt(dx * dx + dy * dy)

        const force = Math.max(0, 1 - distance / 5)
        const displacement = force * 0.3

        // Apply forces
        velocities[i3] += dx * displacement
        velocities[i3 + 1] += dy * displacement

        // Return to original position
        const returnForce = 0.02
        velocities[i3] += (originPositions[i3] - positions[i3]) * returnForce
        velocities[i3 + 1] += (originPositions[i3 + 1] - positions[i3 + 1]) * returnForce
        velocities[i3 + 2] += (originPositions[i3 + 2] - positions[i3 + 2]) * returnForce

        // Add wave motion
        velocities[i3 + 2] += Math.sin(elapsedTime * 0.5 + i * 0.01) * 0.01

        // Apply damping
        const damping = 0.92
        velocities[i3] *= damping
        velocities[i3 + 1] *= damping
        velocities[i3 + 2] *= damping

        // Update positions
        positions[i3] += velocities[i3]
        positions[i3 + 1] += velocities[i3 + 1]
        positions[i3 + 2] += velocities[i3 + 2]
      }

      positionAttribute.needsUpdate = true

      // Rotate points
      points.rotation.y = elapsedTime * 0.05
      points.rotation.x = Math.sin(elapsedTime * 0.3) * 0.1

      renderer.render(scene, camera)
      rafRef.current = requestAnimationFrame(animate)
    }
    animate()

    // Cleanup
    return () => {
      rafRef.current && cancelAnimationFrame(rafRef.current)
      resizeObserver.disconnect()
      container.removeEventListener("mousemove", handleMouseMove)
      renderer.dispose()
      geometry.dispose()
      material.dispose()
      container.removeChild(renderer.domElement)
    }
  }, [])

  return (
    <div
      ref={mountRef}
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        overflow: "hidden",
      }}
    />
  )
}