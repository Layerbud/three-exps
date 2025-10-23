// ...existing code...
"use client"
import AnimationCard from "@/components/AnimationCard"
import DimensionalSpiral from "@/components/DimensionalSpiral"
import CylindricalPortal from "@/components/CylindricalPortal"
import DNAParticleWave from "@/components/DNAParticleWave"
import Particle from "@/components/Particle"
import ComponentNav from "@/components/ComponentNav"
import Blog from "@/components/Blog"
import React, { useState } from "react"
import ParticleDisplacement from "@/components/ParticleDisplacement"

export default function Home() {
  const [selected, setSelected] = useState<string>("all")
  const [navCollapsed, setNavCollapsed] = useState<boolean>(false)

  const items = [
    { key: "all", label: "All" },
    { key: "spiral", label: "Dimensional Spiral" },
    { key: "portal", label: "Cylindrical Portal" },
    { key: "dna", label: "DNA Particle Wave" },
    { key: "particle", label: "Particle System" },
    { key: "blog", label: "Blog" },
  ]

  const renderSingle = (key: string) => {
    switch (key) {
      case "spiral":
        return (
          <AnimationCard title="Dimensional Spiral">
            <DimensionalSpiral />
          </AnimationCard>
        )
      case "portal":
        return (
          <AnimationCard title="Cylindrical Portal">
            <CylindricalPortal />
          </AnimationCard>
        )
      case "dna":
        return (
          <AnimationCard title="DNA Particle Wave">
            <DNAParticleWave />
          </AnimationCard>
        )
      case "particle":
        return (
          <AnimationCard title="Particle System">
            <Particle />
          </AnimationCard>
        )
      case "blog":
        return (
          <AnimationCard title="Particle Displacement">
            <ParticleDisplacement />
          </AnimationCard>
        )
      default:
        return null
    }
  }

  const navWidth = navCollapsed ? 72 : 220

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "#1c1c1c",
      }}
    >
      {/* vertical left nav (collapsible). header/title removed */}
      <ComponentNav
        items={items}
        selected={selected}
        onSelect={(k) => setSelected(k)}
        collapsed={navCollapsed}
        onToggle={() => setNavCollapsed((v) => !v)}
      />

      <main
        style={{
          flex: 1,
          marginLeft: navWidth,
          transition: "margin-left 180ms ease",
          display: "grid",
          gridTemplateColumns: selected === "all" ? "repeat(auto-fit, minmax(320px, 1fr))" : "1fr",
          gap: "20px",
          padding: "24px",
          maxWidth: "1400px",
          margin: "0 auto",
          width: `calc(100% - ${navWidth}px)`,
          alignContent: "start",
        }}
      >
        {selected === "all" ? (
          <>
            <AnimationCard title="Dimensional Spiral">
              <DimensionalSpiral />
            </AnimationCard>

            <AnimationCard title="Cylindrical Portal">
              <CylindricalPortal />
            </AnimationCard>

            <AnimationCard title="DNA Particle Wave">
              <DNAParticleWave />
            </AnimationCard>

            <AnimationCard title="Dimensional Spiral (Variant)">
              <DimensionalSpiral />
            </AnimationCard>

            <AnimationCard title="Particle System">
              <Particle />
            </AnimationCard>
          </>
        ) : (
          renderSingle(selected)
        )}
      </main>

      <footer
        style={{
          padding: "20px",
          textAlign: "center",
          borderTop: "1px solid #2a2a2a",
          background: "rgba(0, 0, 0, 0.5)",
          color: "#000000",
          fontSize: "0.9rem",
          marginLeft: navWidth,
          transition: "margin-left 180ms ease",
        }}
      >
      </footer>
    </div>
  )
}
// ...existing code...