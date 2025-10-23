"use client"
import React from "react"

export default function Blog() {
  return (
    <div
      style={{
        padding: 20,
        color: "#dcdcdc",
        fontSize: "0.95rem",
        lineHeight: 1.6,
      }}
    >
      <h2 style={{ marginTop: 0, color: "#ffffff" }}>Project Notes / Blog</h2>
      <p>Put your blog content, notes or documentation here. This placeholder shows a single view for the "Blog" route.</p>
      <p>
        Tip: replace this with MDX, a blog list, or link to a dedicated /blog page. The navigation lets you toggle between single-component
        previews and the "All" grid.
      </p>
    </div>
  )
}