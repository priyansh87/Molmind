"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Dna, Filter, ExternalLink, Copy } from "lucide-react"
import Navbar from "@/components/navbar"
import { useToast } from "@/components/ui/use-toast"

// Mock data for public projects
const mockProjects = [
  {
    id: "1",
    title: "DNA Double Helix Structure Analysis",
    author: "John Doe",
    authorId: "john",
    moleculeCount: 3,
    lastEdited: "2 hours ago",
    description: "Investigating the structural properties of DNA double helix with various binding proteins.",
    category: "Structural Biology",
    molecules: ["1BNA", "5F9I", "1D66"],
  },
  {
    id: "3",
    title: "CRISPR-Cas9 Binding Mechanisms",
    author: "Emily Chen",
    authorId: "emily",
    moleculeCount: 2,
    lastEdited: "3 days ago",
    description: "Analyzing the binding mechanisms of CRISPR-Cas9 to target DNA sequences.",
    category: "Gene Editing",
    molecules: ["5F9R", "4OO8"],
  },
  {
    id: "5",
    title: "COVID-19 Spike Protein Analysis",
    author: "Michael Johnson",
    authorId: "michael",
    moleculeCount: 4,
    lastEdited: "2 weeks ago",
    description: "Structural analysis of SARS-CoV-2 spike protein and potential binding sites for therapeutic agents.",
    category: "Virology",
    molecules: ["6VXX", "6VYB", "6M0J", "6LZG"],
  },
  {
    id: "6",
    title: "Alzheimer's Beta-Amyloid Aggregation",
    author: "Sarah Williams",
    authorId: "sarah",
    moleculeCount: 3,
    lastEdited: "1 month ago",
    description: "Investigating the structural dynamics of beta-amyloid peptide aggregation in Alzheimer's disease.",
    category: "Neuroscience",
    molecules: ["2BEG", "2MXU", "5OQV"],
  },
  {
    id: "7",
    title: "Insulin Receptor Binding",
    author: "David Lee",
    authorId: "david",
    moleculeCount: 2,
    lastEdited: "2 months ago",
    description: "Analyzing the binding mechanism of insulin to its receptor for diabetes research.",
    category: "Endocrinology",
    molecules: ["4OGA", "3W11"],
  },
  {
    id: "8",
    title: "Antibody-Antigen Recognition in COVID-19",
    author: "Lisa Brown",
    authorId: "lisa",
    moleculeCount: 3,
    lastEdited: "3 months ago",
    description: "Studying the structural basis of antibody recognition of SARS-CoV-2 antigens.",
    category: "Immunology",
    molecules: ["7K8M", "7K8S", "7JMO"],
  },
]

const categories = [
  "All Categories",
  "Structural Biology",
  "Gene Editing",
  "Virology",
  "Neuroscience",
  "Endocrinology",
  "Immunology",
]

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All Categories")

  const filteredProjects = mockProjects.filter((project) => {
    const matchesSearch =
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.molecules.some((m) => m.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesCategory = selectedCategory === "All Categories" || project.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  const { toast } = useToast()

  const handleCloneProject = (project: (typeof mockProjects)[0]) => {
    // Simulate cloning process with a loading state
    toast({
      title: "Cloning project...",
      description: "Please wait while we copy this project to your workspace.",
    })

    // Simulate API call delay
    setTimeout(() => {
      toast({
        title: "Project cloned successfully!",
        description: `"${project.title}" has been added to your dashboard.`,
        variant: "default",
      })

      // In a real app, this would navigate to the dashboard or the cloned project
      // router.push('/dashboard');
    }, 1500)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white">Explore Research</h1>
              <p className="text-muted-foreground">Discover public molecular research projects</p>
            </div>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search projects, molecules..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-secondary border-border"
              />
            </div>
          </div>

          <div className="mb-8">
            <Tabs defaultValue="all" className="w-full">
              <div className="flex items-center justify-between mb-4">
                <TabsList>
                  <TabsTrigger value="all">All Projects</TabsTrigger>
                  <TabsTrigger value="trending">Trending</TabsTrigger>
                  <TabsTrigger value="recent">Recent</TabsTrigger>
                </TabsList>

                <Button variant="outline" size="sm">
                  <Filter className="mr-2 h-4 w-4" />
                  Filter
                </Button>
              </div>

              <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className={selectedCategory === category ? "bg-primary text-primary-foreground" : ""}
                  >
                    {category}
                  </Button>
                ))}
              </div>

              <TabsContent value="all" className="mt-0">
                {filteredProjects.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <Search className="h-10 w-10 text-primary/40" />
                    </div>
                    <h3 className="text-xl font-medium mb-2 text-white">No projects found</h3>
                    <p className="text-muted-foreground mb-6 max-w-md">
                      We couldn't find any projects matching your search criteria. Try different search terms or
                      filters.
                    </p>
                    <Button
                      onClick={() => {
                        setSearchQuery("")
                        setSelectedCategory("All Categories")
                      }}
                      variant="outline"
                    >
                      Clear Filters
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProjects.map((project) => (
                      <motion.div
                        key={project.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Card className="h-full overflow-hidden hover:shadow-md dark:hover:shadow-primary/5 transition-all duration-300">
                          <CardContent className="p-6">
                            <div className="flex items-center gap-2 mb-4">
                              <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                                {project.category}
                              </Badge>
                              <Badge variant="outline" className="bg-muted">
                                {project.moleculeCount} molecules
                              </Badge>
                            </div>

                            <h3 className="font-semibold text-lg mb-2 line-clamp-1 text-white">{project.title}</h3>

                            <p className="text-muted-foreground text-sm line-clamp-2 mb-4">{project.description}</p>

                            <div className="flex items-center gap-2 mb-4">
                              {project.molecules.slice(0, 3).map((molecule) => (
                                <div
                                  key={molecule}
                                  className="flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded-md"
                                >
                                  <Dna className="h-3 w-3" />
                                  {molecule}
                                </div>
                              ))}
                              {project.molecules.length > 3 && (
                                <div className="text-xs text-muted-foreground">
                                  +{project.molecules.length - 3} more
                                </div>
                              )}
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={`/placeholder.svg?text=${project.authorId}`} alt={project.author} />
                                  <AvatarFallback>{project.author.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="text-sm font-medium text-white">{project.author}</p>
                                  <p className="text-xs text-muted-foreground">{project.lastEdited}</p>
                                </div>
                              </div>
                            </div>
                          </CardContent>

                          <CardFooter className="p-4 pt-0 gap-2">
                            <Button asChild variant="outline" size="sm" className="flex-1">
                              <Link href={`/report/${project.id}`}>
                                <ExternalLink className="mr-1.5 h-4 w-4" />
                                View Project
                              </Link>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={() => handleCloneProject(project)}
                            >
                              <Copy className="mr-1.5 h-4 w-4" />
                              Clone
                            </Button>
                          </CardFooter>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="trending" className="mt-0">
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Dna className="h-10 w-10 text-primary/40" />
                  </div>
                  <h3 className="text-xl font-medium mb-2 text-white">Trending Projects</h3>
                  <p className="text-muted-foreground mb-6 max-w-md">
                    Discover the most popular research projects in the MOLMIND community.
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="recent" className="mt-0">
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Dna className="h-10 w-10 text-primary/40" />
                  </div>
                  <h3 className="text-xl font-medium mb-2 text-white">Recent Projects</h3>
                  <p className="text-muted-foreground mb-6 max-w-md">
                    Browse the latest research projects shared on MOLMIND.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
