"use client"
import AnimationCard from "@/components/AnimationCard"
import DimensionalSpiral from "@/components/DimensionalSpiral"
import CylindricalPortal from "@/components/CylindricalPortal"
import DNAParticleWave from "@/components/DNAParticleWave"

export default function Home() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)",
      }}
    >
      <header
        style={{
          padding: "40px 20px",
          textAlign: "center",
          borderBottom: "1px solid #2a2a2a",
          background: "rgba(0, 0, 0, 0.5)",
        }}
      >
        <h1
          style={{
            fontSize: "2.5rem",
            fontWeight: 700,
            marginBottom: "10px",
            background: "linear-gradient(135deg, #00d4ff, #7c3aed)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            margin: "0 0 10px 0",
          }}
        >
          Three.js Animations
        </h1>
        <p
          style={{
            fontSize: "1rem",
            color: "#a0a0a0",
            margin: 0,
          }}
        >
          Interactive 3D visualizations with React and Three.js
        </p>
      </header>

      <main
        style={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(500px, 1fr))",
          gap: "24px",
          padding: "40px 20px",
          maxWidth: "1400px",
          margin: "0 auto",
          width: "100%",
        }}
      >
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
      </main>

      <footer
        style={{
          padding: "20px",
          textAlign: "center",
          borderTop: "1px solid #2a2a2a",
          background: "rgba(0, 0, 0, 0.5)",
          color: "#707070",
          fontSize: "0.9rem",
        }}
      >
        <p style={{ margin: 0 }}>Built with React, Three.js, and WebGL</p>
      </footer>
    </div>
  )
}
