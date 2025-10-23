"use client"
import React from "react"

type Item = { key: string; label: string }

type Props = {
  items: Item[]
  selected: string
  onSelect: (key: string) => void
  collapsed: boolean
  onToggle: () => void
}

export default function ComponentNav({ items, selected, onSelect, collapsed, onToggle }: Props) {
  return (
    <aside
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        bottom: 0,
        width: collapsed ? 72 : 220,
        padding: "18px 12px",
        background: "linear-gradient(180deg,#0e0e0f,#141416)",
        borderRight: "1px solid rgba(255,255,255,0.03)",
        boxShadow: "2px 0 20px rgba(0,0,0,0.6)",
        transition: "width 200ms ease",
        display: "flex",
        flexDirection: "column",
        gap: 12,
        zIndex: 60,
      }}
    >
      <div 
        style={{ 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "space-between",
          padding: "6px 4px" 
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            aria-hidden
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: "linear-gradient(135deg,#bff26a,#8adf2e)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 18px rgba(138,223,46,0.14)",
              flexShrink: 0,
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <rect x="4" y="4" width="16" height="16" rx="3" fill="#0b0b0b" opacity="0.12"></rect>
              <path d="M6 12L12 7L18 12L12 17L6 12Z" fill="#fff" opacity="0.9" />
            </svg>
          </div>

          {!collapsed && (
            <div style={{ color: "#eaeaea", fontWeight: 700, fontSize: "0.95rem" }}>
              Components
            </div>
          )}
        </div>

        <button
          onClick={onToggle}
          aria-expanded={!collapsed}
          title={collapsed ? "Expand" : "Collapse"}
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            border: "none",
            background: "rgba(255,255,255,0.03)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "transform 160ms ease",
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            style={{ 
              transform: `rotate(${collapsed ? 0 : 180}deg)`,
              transition: "transform 200ms ease"
            }}
            fill="none"
          >
            <path 
              d="M15 4l-8 8 8 8" 
              stroke="#e6e6e6" 
              strokeWidth="1.6" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
            />
          </svg>
        </button>
      </div>

      <nav style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {items.map((it) => {
          const active = it.key === selected
          return (
            <button
              key={it.key}
              onClick={() => onSelect(it.key)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                width: "100%",
                padding: "8px 10px",
                borderRadius: 10,
                background: active ? "linear-gradient(90deg,#9be14f,#b6ff6f)" : "transparent",
                color: active ? "#0b0b0b" : "#d6d6d6",
                fontWeight: 600,
                fontSize: "0.9rem",
                border: "none",
                textAlign: "left",
                cursor: "pointer",
                boxShadow: active ? "0 6px 20px rgba(155,225,79,0.12)" : "none",
                transition: "background 160ms ease, color 160ms ease",
                overflow: "hidden",
                whiteSpace: "nowrap",
              }}
              aria-pressed={active}
            >
              <span
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: active ? "rgba(0,0,0,0.12)" : "rgba(255,255,255,0.03)",
                  color: active ? "#ffffff" : "#cfcfcf",
                  fontSize: "0.8rem",
                  flexShrink: 0,
                }}
              >
                {it.label.charAt(0).toUpperCase()}
              </span>
              
              {!collapsed && (
                <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
                  {it.label}
                </span>
              )}
            </button>
          )
        })}
      </nav>
    </aside>
  )
}