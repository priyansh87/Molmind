"use client"

import { useParams } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Download, LinkIcon, Dna, ArrowLeft } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import Link from "next/link"
import MoleculeViewer from "@/components/molecule-viewer"

// Mock project data
const mockProject = {
  id: "1",
  title: "DNA Double Helix Structure Analysis",
  author: "Priyansh",
  description: "Investigating the structural properties of DNA double helix with various binding proteins.",
  molecules: ["1BNA", "5F9I", "1D66"],
  researchLinks: ["https://arxiv.org/abs/2104.03473", "https://www.nature.com/articles/s41586-021-03819-2"],
  notes:
    "The B-DNA structure (1BNA) shows the classic Watson-Crick base pairing with a right-handed double helix. The major and minor grooves are clearly visible, with the major groove being wider and more accessible to proteins.\n\nThe 5F9I structure shows DNA bound to a transcription factor, demonstrating how proteins can recognize specific DNA sequences.\n\nThe 1D66 structure represents DNA with a drug molecule intercalated between base pairs, which could be relevant for understanding how small molecules can affect DNA structure and function.",
  aiSummary:
    "This research focuses on the structural analysis of DNA-protein interactions. The B-DNA structure (1BNA) serves as a reference point for understanding the canonical double helix configuration. The 5F9I structure demonstrates how transcription factors bind to the major groove of DNA, recognizing specific sequences through hydrogen bonding and van der Waals interactions. The 1D66 structure illustrates how small molecules can intercalate between DNA base pairs, potentially disrupting normal DNA function.\n\nThe comparative analysis of these structures provides insights into the flexibility and adaptability of DNA when interacting with different binding partners. This has implications for drug design, particularly for compounds targeting DNA-protein interactions in diseases like cancer.",
  isPublic: true,
}

export default function ReportView() {
  const params = useParams()
  const { toast } = useToast()

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://molmind.app/report/${params.id}`)
    toast({
      title: "Link copied",
      description: "Share link has been copied to clipboard.",
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-5xl py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="icon" className="rounded-full">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="h-8 w-8 rounded-md bg-gradient-to-r from-teal-500 to-blue-600 flex items-center justify-center">
                    <Dna className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-sm font-medium text-primary">MOLMIND Report</span>
                </div>
                <h1 className="text-3xl font-bold">{mockProject.title}</h1>
                <p className="text-sm text-muted-foreground mt-1">By {mockProject.author}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </Button>
              <Button
                onClick={handleCopyLink}
                className="bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700"
              >
                <LinkIcon className="mr-2 h-4 w-4" />
                Copy Link
              </Button>
            </div>
          </div>

          <Card className="border-none shadow-sm mb-8">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Summary</h2>
              <div className="prose prose-slate dark:prose-invert max-w-none">
                {mockProject.aiSummary.split("\n\n").map((paragraph, i) => (
                  <p key={i} className="mb-4">
                    {paragraph}
                  </p>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm mb-8">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Molecules</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {mockProject.molecules.map((molecule) => (
                  <div key={molecule} className="space-y-2">
                    <h3 className="font-medium">PDB ID: {molecule}</h3>
                    <div className="rounded-lg overflow-hidden">
                      <MoleculeViewer moleculeId={molecule} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm mb-8">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Notes</h2>
              <div className="prose prose-slate dark:prose-invert max-w-none">
                {mockProject.notes.split("\n\n").map((paragraph, i) => (
                  <p key={i} className="mb-4">
                    {paragraph}
                  </p>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Research Links</h2>
              <ul className="space-y-2">
                {mockProject.researchLinks.map((link, i) => (
                  <li key={i}>
                    <a
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center"
                    >
                      <LinkIcon className="h-4 w-4 mr-2" />
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
