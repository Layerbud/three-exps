// ...existing code...
"use client"
import React, { useEffect, useRef } from "react"
import * as THREE from "three"

type Props = {
  count?: number
  color?: number | string
  size?: number
  maxWidth?: number | string
  // note: height is controlled by the parent card now; default to '100%'
}

export default function Particle({
  count = 10000,
  color = 0xffffff,
  size = 0.08,
  maxWidth = "100%",
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const rafRef = useRef<number | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const geometryRef = useRef<THREE.BufferGeometry | null>(null)
  const materialRef = useRef<THREE.PointsMaterial | null>(null)
  const pointsRef = useRef<THREE.Points | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const container = containerRef.current

    const width = Math.max(1, container.clientWidth)
    const height = Math.max(1, container.clientHeight)

    const scene = new THREE.Scene()

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000)
    camera.position.z = 5
    cameraRef.current = camera

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(width, height)
    renderer.setClearColor(0x000000, 0)
    renderer.domElement.style.display = "block"
    renderer.domElement.style.width = "100%"
    renderer.domElement.style.height = "100%"
    container.appendChild(renderer.domElement)
    rendererRef.current = renderer

    const geometry = new THREE.BufferGeometry()
    geometryRef.current = geometry
    const positions = new Float32Array(count * 3)
    const speeds = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      const ix = i * 3
      positions[ix] = (Math.random() - 0.5) * 20
      positions[ix + 1] = (Math.random() - 0.5) * 20
      positions[ix + 2] = (Math.random() - 0.5) * 20
      speeds[i] = 0.0001 + Math.random() * 0.0001
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute("aSpeed", new THREE.BufferAttribute(speeds, 1))

    const material = new THREE.PointsMaterial({
      color,
      size,
      sizeAttenuation: true,
      depthTest: true,
    })
    materialRef.current = material

    const points = new THREE.Points(geometry, material)
    pointsRef.current = points
    scene.add(points)

    // Resize observer to make canvas fill parent card area
    const handleResize = () => {
      if (!container) return
      const w = Math.max(1, container.clientWidth)
      const h = Math.max(1, container.clientHeight)
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      renderer.setPixelRatio(dpr)
      renderer.setSize(w, h, false)
      if (cameraRef.current) {
        cameraRef.current.aspect = w / h
        cameraRef.current.updateProjectionMatrix()
      }
    }

    const ro = new ResizeObserver(handleResize)
    ro.observe(container)

    // animate
    const pos = geometry.getAttribute("position") as THREE.BufferAttribute
    const speedAttr = geometry.getAttribute("aSpeed") as THREE.BufferAttribute

    const animate = () => {
      if (!pointsRef.current || !rendererRef.current || !cameraRef.current) return

      pointsRef.current.rotation.y += 0.0008

      for (let i = 0; i < count; i++) {
        const ix = i * 3
        const s = speedAttr.getX(i)
        pos.array[ix + 1] =
          Math.sin(Date.now() * s + i) * 0.25 + pos.array[ix + 1] * 0.9999
      }
      pos.needsUpdate = true

      rendererRef.current.render(scene, cameraRef.current)
      rafRef.current = requestAnimationFrame(animate)
    }
    animate()

    // cleanup
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      ro.disconnect()
      if (rendererRef.current) {
        rendererRef.current.domElement && container.removeChild(rendererRef.current.domElement)
        rendererRef.current.dispose()
      }
      geometry.dispose()
      material.dispose()
    }
  }, [count, color, size, maxWidth])

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        maxWidth: typeof maxWidth === "number" ? `${maxWidth}px` : maxWidth,
        height: "100%", // let parent card control height
        minHeight: 0,
        display: "block",
        margin: "0",
      }}
      aria-hidden
    />
  )
}