"use client"

import { useEffect } from "react"

export default function ImageLightbox({
  src,
  alt,
  onClose,
}: {
  src: string
  alt?: string
  onClose: () => void
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
      onClick={onClose}
      onTouchEnd={onClose}
    >
      <div className="max-w-[95%] max-h-[95%] p-4" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 z-50 rounded-full bg-white/90 p-2 shadow-lg"
        >
          ✕
        </button>
        <img src={src} alt={alt || "image"} className="max-w-full max-h-[80vh] object-contain rounded-md" />
      </div>
    </div>
  )
}
