"use client"

import { useEffect, useRef, useState } from "react"
import { Dna, Loader2 } from "lucide-react"
import Script from "next/script"

interface MoleculeViewerProps {
  moleculeId: string
}

declare global {
  interface Window {
    $3Dmol: any
  }
}

export default function MoleculeViewer({ moleculeId }: MoleculeViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isScriptLoaded, setIsScriptLoaded] = useState(false)
  const [isError, setIsError] = useState(false)

  useEffect(() => {
    if (isScriptLoaded && containerRef.current) {
      try {
        const viewer = window.$3Dmol.createViewer(containerRef.current, {
          backgroundColor: "white",
        })

        window.$3Dmol.download(`pdb:${moleculeId}`, viewer, {}, () => {
          viewer.setStyle({}, { cartoon: { color: "spectrum" } })
          viewer.zoomTo()
          viewer.render()
          setIsLoading(false)
        })

        return () => {
          if (viewer) {
            viewer.clear()
          }
        }
      } catch (error) {
        console.error("Error initializing 3Dmol viewer:", error)
        setIsError(true)
        setIsLoading(false)
      }
    }
  }, [moleculeId, isScriptLoaded])

  if (isError) {
    return (
      <div className="w-full aspect-square rounded-lg bg-muted flex flex-col items-center justify-center">
        <Dna className="h-16 w-16 text-muted-foreground mb-4" />
        <div className="text-muted-foreground text-center">
          <p className="font-medium">Error loading molecule</p>
          <p className="text-sm">Could not load PDB ID: {moleculeId}</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js"
        onLoad={() => {
          const script = document.createElement("script")
          script.src = "https://3dmol.org/build/3Dmol-min.js"
          script.onload = () => setIsScriptLoaded(true)
          document.body.appendChild(script)
        }}
      />

      <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-white">
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted/50 backdrop-blur-sm z-10">
            <Loader2 className="h-8 w-8 text-primary animate-spin mb-2" />
            <p className="text-sm font-medium">Loading molecule...</p>
          </div>
        )}
        <div ref={containerRef} className="w-full h-full" style={{ visibility: isLoading ? "hidden" : "visible" }} />
      </div>
    </>
  )
}
