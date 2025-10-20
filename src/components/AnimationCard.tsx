"use client"

import type React from "react"

function AnimationCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        background: "#1a1a1a",
        border: "1px solid #2a2a2a",
        borderRadius: "8px",
        overflow: "hidden",
        transition: "border-color 0.3s ease",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#3a3a3a")}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#2a2a2a")}
    >
      <div
        style={{
          padding: "16px 20px",
          borderBottom: "1px solid #2a2a2a",
          background: "#151515",
        }}
      >
        <h3
          style={{
            fontSize: "16px",
            fontWeight: "600",
            color: "#e0e0e0",
            margin: 0,
          }}
        >
          {title}
        </h3>
      </div>
      <div
        style={{
          width: "100%",
          height: "400px",
          position: "relative",
        }}
      >
        {children}
      </div>
    </div>
  )
}

export default AnimationCard
