// ...existing code...
"use client"
import React from "react"

type Props = {
  title: string
  subtitle?: string
  children?: React.ReactNode
  controls?: React.ReactNode
}

export default function AnimationCard({ title, subtitle, children, controls }: Props) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        background: "linear-gradient(180deg, rgba(255,255,255,0.02), rgba(0,0,0,0.04))",
        border: "1px solid rgba(255,255,255,0.04)",
        borderRadius: 12,
        padding: 12,
        gap: 12,
        boxShadow: "0 6px 18px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.02)",
        backdropFilter: "blur(6px)",
        minHeight: 600,
        overflow: "hidden",
        height: "100%",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          flexShrink: 0,
        }}
      >
        <div>
          <h3
            style={{
              margin: 0,
              color: "#eaeaea",
              fontSize: "1.05rem",
              fontWeight: 700,
              letterSpacing: "-0.2px",
            }}
          >
            {title}
          </h3>
          {subtitle ? (
            <p style={{ margin: 0, color: "#9a9a9a", fontSize: "0.85rem" }}>{subtitle}</p>
          ) : null}
        </div>

        <div
          style={{
            padding: "6px 10px",
            background: "linear-gradient(90deg,#1b1b1b,#242424)",
            borderRadius: 8,
            border: "1px solid rgba(255,255,255,0.03)",
            color: "#cfcfcf",
            fontSize: "0.8rem",
            flexShrink: 0,
          }}
        >
          Preview
        </div>
      </div>

      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "stretch",
          justifyContent: "stretch",
          borderRadius: 10,
          overflow: "hidden",
          background: "linear-gradient(180deg, rgba(0,0,0,0.25), rgba(0,0,0,0.45))",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            zIndex: 10,
            display: "flex",
            gap: 8,
            alignItems: "center",
          }}
        >
          {controls ? (
            controls
          ) : (
            <div
              style={{
                padding: "6px 10px",
                background: "rgba(0,0,0,0.45)",
                borderRadius: 8,
                color: "#eaeaea",
                fontSize: "0.8rem",
                border: "1px solid rgba(255,255,255,0.03)",
                backdropFilter: "blur(4px)",
              }}
            >
              Controls
            </div>
          )}
        </div>

        <div style={{ flex: 1, position: "relative", minHeight: 0 }}>{children}</div>
      </div>
    </div>
  )
}
// ...existing code...