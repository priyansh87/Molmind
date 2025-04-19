"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Dna, Plus, Sparkles, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function CreateProject() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [researchLink, setResearchLink] = useState("")
  const [moleculeId, setMoleculeId] = useState("")
  const [notes, setNotes] = useState("")
  const [molecules, setMolecules] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [aiSummary, setAiSummary] = useState("")

  const handleAddMolecule = () => {
    if (moleculeId && !molecules.includes(moleculeId)) {
      setMolecules([...molecules, moleculeId])
      setMoleculeId("")
    }
  }

  const handleRemoveMolecule = (molecule: string) => {
    setMolecules(molecules.filter((m) => m !== molecule))
  }

  const handleGenerateSummary = () => {
    setIsGenerating(true)
    // Mock AI summary generation
    setTimeout(() => {
      setAiSummary(
        "This research focuses on the structural analysis of DNA-protein interactions. The molecules included show significant binding affinity to the major groove of DNA, potentially disrupting transcription factor binding. Further analysis suggests potential applications in targeted gene regulation therapies.",
      )
      setIsGenerating(false)
    }, 1500)
  }

  const handleCreateProject = async () => {
    const token = localStorage.getItem("authToken")
    if (!token) {
      alert("You must be logged in to create a project.")
      return
    }
  
    const projectData = {
      title,
      researchLinks: researchLink ? [researchLink] : [],
      molecules,
      notes,
      isPublic: true,
      aiSummary: aiSummary || undefined, // optional
    }
  
    try {
      const response = await fetch("http://localhost:3001/projects/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `bearer ${token}`,
        },
        body: JSON.stringify(projectData),
      })
  
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to create project.")
      }
  
      router.push("/dashboard")
    } catch (error) {
      console.error("Error creating project:", error)
      alert("Something went wrong while creating the project.")
    }
  }
  

  return (
    <div className="container max-w-3xl py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Create New Project</h1>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Project Title</Label>
            <Input
              id="title"
              placeholder="Enter project title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="research-link">Research Paper Link</Label>
            <Input
              id="research-link"
              placeholder="https://arxiv.org/abs/..."
              value={researchLink}
              onChange={(e) => setResearchLink(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="molecule-id">Add Molecule by PDB ID</Label>
            <div className="flex gap-2">
              <Input
                id="molecule-id"
                placeholder="e.g., 1BNA"
                value={moleculeId}
                onChange={(e) => setMoleculeId(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    handleAddMolecule()
                  }
                }}
              />
              <Button type="button" onClick={handleAddMolecule} className="bg-teal-600 hover:bg-teal-700">
                <Plus className="h-4 w-4" />
                Add
              </Button>
            </div>

            {molecules.length > 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-wrap gap-2 mt-3">
                {molecules.map((molecule) => (
                  <motion.div
                    key={molecule}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  >
                    <Badge variant="secondary" className="flex items-center gap-1 px-3 py-1.5">
                      <Dna className="h-3.5 w-3.5" />
                      {molecule}
                      <button
                        type="button"
                        onClick={() => handleRemoveMolecule(molecule)}
                        className="ml-1 text-slate-500 hover:text-slate-700"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </Badge>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Enter your research notes..."
              rows={5}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="resize-none"
            />
          </div>

          {aiSummary ? (
            <Card className="overflow-hidden border-teal-200 bg-teal-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2 text-teal-700">
                  <Sparkles className="h-4 w-4" />
                  <h3 className="font-medium">AI-Generated Summary</h3>
                </div>
                <p className="text-slate-700 text-sm">{aiSummary}</p>
              </CardContent>
            </Card>
          ) : (
            <Button
              type="button"
              variant="outline"
              className="w-full border-dashed border-teal-300 text-teal-700 hover:bg-teal-50"
              onClick={handleGenerateSummary}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <div className="h-4 w-4 mr-2 rounded-full border-2 border-teal-600 border-t-transparent animate-spin" />
                  Generating Summary...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate AI Summary
                </>
              )}
            </Button>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => router.push("/dashboard")}>
              Cancel
            </Button>
            <Button type="button" onClick={handleCreateProject} className="bg-teal-600 hover:bg-teal-700">
              Create Project
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
