"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Dna, Plus, X, Sparkles, Loader2 } from "lucide-react"

interface CreateProjectModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function CreateProjectModal({ isOpen, onClose }: CreateProjectModalProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [title, setTitle] = useState("")
  const [researchLinks, setResearchLinks] = useState<string[]>([""])
  const [moleculeId, setMoleculeId] = useState("")
  const [molecules, setMolecules] = useState<string[]>([])
  const [notes, setNotes] = useState("")
  const [isPublic, setIsPublic] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [aiSummary, setAiSummary] = useState("")
  const [isCreating, setIsCreating] = useState(false)

  const handleAddResearchLink = () => {
    setResearchLinks([...researchLinks, ""])
  }

  const handleUpdateResearchLink = (index: number, value: string) => {
    const updatedLinks = [...researchLinks]
    updatedLinks[index] = value
    setResearchLinks(updatedLinks)
  }

  const handleRemoveResearchLink = (index: number) => {
    const updatedLinks = [...researchLinks]
    updatedLinks.splice(index, 1)
    setResearchLinks(updatedLinks)
  }

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
    setIsCreating(true)
  
    try {
      let token = localStorage.getItem("authToken") 
      const response = await fetch("http://localhost:3001/projects/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `bearer ${token}`, // Replace with actual token management
        },
        body: JSON.stringify({
          title,
          researchLinks: researchLinks.filter((link) => link.trim() !== ""),
          molecules,
          notes,
          isPublic,
          summary: aiSummary, // optionally include AI summary
        }),
      })
  
      if (!response.ok) {
        throw new Error("Failed to create project")
      }
  
      const createdProject = await response.json()
      console.log(createdProject)
      toast({
        title: "Project created",
        description: "Your project has been created successfully.",
      })
  
      resetForm()
      onClose()
      router.push(`/project/${createdProject._id}`)
    } catch (error) {
      console.error("Error creating project:", error)
      toast({
        title: "Error",
        description: "There was a problem creating the project.",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }
  

  const resetForm = () => {
    setTitle("")
    setResearchLinks([""])
    setMoleculeId("")
    setMolecules([])
    setNotes("")
    setIsPublic(false)
    setAiSummary("")
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          resetForm()
        }
        onClose()
      }}
    >
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>Fill in the details to create a new molecular research project.</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
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
            <Label>Research Paper Links</Label>
            {researchLinks.map((link, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  placeholder="https://arxiv.org/abs/..."
                  value={link}
                  onChange={(e) => handleUpdateResearchLink(index, e.target.value)}
                />
                {index === researchLinks.length - 1 ? (
                  <Button type="button" variant="outline" size="icon" onClick={handleAddResearchLink}>
                    <Plus className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button type="button" variant="outline" size="icon" onClick={() => handleRemoveResearchLink(index)}>
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
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
              <Button
                type="button"
                onClick={handleAddMolecule}
                className="bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700"
              >
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
                        className="ml-1 text-muted-foreground hover:text-foreground"
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

          <div className="flex items-center space-x-2">
            <Checkbox id="public" checked={isPublic} onCheckedChange={(checked) => setIsPublic(checked as boolean)} />
            <label
              htmlFor="public"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Make this project public
            </label>
          </div>

          {aiSummary ? (
            <div className="rounded-lg border bg-primary/5 p-4">
              <div className="flex items-center gap-2 mb-2 text-primary">
                <Sparkles className="h-4 w-4" />
                <h3 className="font-medium">AI-Generated Summary</h3>
              </div>
              <p className="text-sm">{aiSummary}</p>
            </div>
          ) : (
            <Button
              type="button"
              variant="outline"
              className="w-full border-dashed border-primary/30 text-primary hover:bg-primary/5"
              onClick={handleGenerateSummary}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleCreateProject}
            disabled={!title || isCreating}
            className="bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700"
          >
            {isCreating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Project"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
