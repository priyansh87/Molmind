"use client"

import { useState, useEffect, useRef } from "react"
import { useParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { Dna, FileText, Sparkles, Eye, Share2, MessageSquare, X, Send, Download, LinkIcon, Loader2 } from "lucide-react"
import Navbar from "@/components/navbar"
import MoleculeViewer from "@/components/molecule-viewer"
import { Input } from "@/components/ui/input"

// Define project type for better type safety
interface Project {
  _id?: string
  title?: string
  description?: string
  researchLinks?: string[]
  molecules?: string[]
  notes?: string
  aiSummary?: string
  isPublic?: boolean
  createdAt?: string
  updatedAt?: string
  __v?: number
}

export default function ProjectView() {
  const [project, setProject] = useState<Project>({})
  const [loading, setLoading] = useState(true)
  const params = useParams()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("summary")
  const [notes, setNotes] = useState("")
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [chatMessage, setChatMessage] = useState("")
  const [chatMessages, setChatMessages] = useState<{ role: string; content: string }[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  const generateSummary = async ()=> {
    
  }

  useEffect(() => {
    const fetchProject = async () => {
      console.log(params.id)
      setLoading(true)
      const token = localStorage?.getItem("authToken")!
      try {
        
        const user = JSON.parse(localStorage?.getItem("user") || "{}")
  
        const res = await fetch(`http://localhost:3001/projects/${params.id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `bearer ${token}`,
          },
        })
  
        const data = await res.json()
        console.log("Project data:", data)
  
        if (data._id) {
          setProject(data)
          if (data.notes) {
            setNotes(data.notes)
          }
  
          // ✅ Call initializeRag only after project is successfully fetched
          // await initializeRag({
          //   token,
          //   userId: user._id,
          //   projectId: data._id,
          //   links: data.researchLinks || [],
          // })
        } else {
          toast({ title: "Error", description: "Failed to fetch project data." })
        }
      } catch (error) {
        console.error("Error fetching project:", error)
        toast({ title: "Error", description: "Something went wrong." })
      } finally {
        setLoading(false)
      }
    }
  
    
  
    fetchProject()
  }, [params.id, toast])
  

  const handleTabChange = (value: string) => {
    setActiveTab(value)
  }

  const handleSaveNotes = async () => {
    try {
      const token = localStorage?.getItem("authToken")
      console.log("clicked saved notes")
      const res = await fetch(`http://localhost:3001/projects/${project._id}/notes`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `bearer ${token}`,
        },
        body: JSON.stringify({ notes }),
      })

      const data = await res.json()

      if (res.ok) {
        toast({
          title: "Notes saved",
          description: "Your notes have been saved successfully.",
        })
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to save notes.",
        })
      }
    } catch (error) {
      console.error("Error saving notes:", error)
      toast({
        title: "Error",
        description: "Something went wrong while saving notes.",
      })
    }
  }

  const handleShareLink = () => {
    navigator.clipboard.writeText(`https://molmind.app/report/${project._id}`)
    toast({
      title: "Link copied",
      description: "Share link has been copied to clipboard.",
    })
  }

  const handleSendMessage = async () => {
    if (!chatMessage.trim()) return

    // Add user message to chat
    setChatMessages([...chatMessages, { role: "user", content: chatMessage }])
    const userQuery = chatMessage
    setChatMessage("")
    setIsTyping(true)

    try {
      const token = localStorage?.getItem("authToken")
      const user = JSON.parse(localStorage?.getItem("user") || "{}")

      const res = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_id:  "user123",
          project_id:  "project456",
          query: userQuery,
          chat_history: [],
        }),
      })

      const data = await res.json()

      if (res.ok && data.answer) {
        setChatMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.answer,
          },
        ])
      } else {
        setChatMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "Sorry, I couldn't process your request. Please try again.",
          },
        ])
      }
    } catch (error) {
      console.error("Error sending message:", error)
      setChatMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, there was an error processing your request. Please try again later.",
        },
      ])
    } finally {
      setIsTyping(false)
    }
  }

  const addToNotes = (content: string) => {
    setNotes((prev) => prev + "\n\n" + content)
    toast({
      title: "Added to notes ✅",
      description: "AI response has been added to your notes.",
    })
  }

  // Scroll to bottom of chat when new messages arrive
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [chatMessages])

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
            <p className="text-muted-foreground">Loading project data...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container py-8 relative">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-3xl font-bold text-white">{project.title || "Untitled Project"}</h1>
                {project.isPublic && <Badge variant="secondary">Public</Badge>}
              </div>
              <p className="text-muted-foreground">{project.description || "No description available"}</p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setIsChatOpen(!isChatOpen)}
                className={isChatOpen ? "bg-primary/10 text-primary" : ""}
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                AI Chat
              </Button>
              <Button variant="outline" onClick={handleShareLink}>
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            <div className={`flex-1 transition-all duration-300 ${isChatOpen ? "lg:w-2/3" : "w-full"}`}>
              <Tabs defaultValue="summary" value={activeTab} onValueChange={handleTabChange} className="w-full">
                <TabsList className="grid w-full grid-cols-4 mb-8">
                  <TabsTrigger value="summary" className="flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4" />
                    Summary
                  </TabsTrigger>
                  <TabsTrigger value="molecules" className="flex items-center gap-1.5">
                    <Dna className="h-4 w-4" />
                    Molecules
                  </TabsTrigger>
                  <TabsTrigger value="notes" className="flex items-center gap-1.5">
                    <FileText className="h-4 w-4" />
                    Notes
                  </TabsTrigger>
                  <TabsTrigger value="report" className="flex items-center gap-1.5">
                    <Eye className="h-4 w-4" />
                    Report
                  </TabsTrigger>
                </TabsList>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <TabsContent value="summary" className="mt-0">
                      <Card className="border-none shadow-sm">
                        <CardContent className="p-6">
                          <div className="flex items-center gap-2 mb-4 text-primary">
                            <Sparkles className="h-5 w-5" />
                            <button onClick={generateSummary} className="text-lg font-medium">AI-Generated Summary</button>
                          </div>
                          {project.aiSummary ? (
                            <div className="prose prose-invert max-w-none">
                              {project.aiSummary.split("\n\n").map((paragraph, i) => (
                                <p key={i} className="mb-4 text-white">
                                  {paragraph}
                                </p>
                              ))}
                            </div>
                          ) : (
                            <p className="text-muted-foreground">No summary available for this project.</p>
                          )}

                          <div className="mt-6 space-y-4">
                            <h3 className="text-lg font-medium text-white">Research Links</h3>
                            {project.researchLinks && project.researchLinks.length > 0 ? (
                              <ul className="space-y-2">
                                {project.researchLinks.map((link, i) => (
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
                            ) : (
                              <p className="text-muted-foreground">No research links available.</p>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="molecules" className="mt-0">
                      {project.molecules && project.molecules.length > 0 ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {project.molecules.map((molecule) => (
                            <Card key={molecule} className="border-none shadow-sm">
                              <CardContent className="p-6">
                                <div className="flex justify-between items-center mb-4">
                                  <div className="flex items-center gap-2 text-primary">
                                    <Dna className="h-5 w-5" />
                                    <h3 className="font-medium">PDB ID: {molecule}</h3>
                                  </div>
                                  <Button variant="outline" size="sm">
                                    Full Screen
                                  </Button>
                                </div>
                                <MoleculeViewer moleculeId={molecule} />
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <Card className="border-none shadow-sm">
                          <CardContent className="p-6 text-center">
                            <Dna className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground">No molecules available for this project.</p>
                          </CardContent>
                        </Card>
                      )}
                    </TabsContent>

                    <TabsContent value="notes" className="mt-0">
                      <Card className="border-none shadow-sm">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between gap-2 mb-4">
                            <div className="flex items-center gap-2 text-primary">
                              <FileText className="h-5 w-5" />
                              <h2 className="text-lg font-medium">Research Notes</h2>
                            </div>
                            <Button
                              onClick={handleSaveNotes}
                              size="sm"
                              className="bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700"
                            >
                              Save Notes
                            </Button>
                          </div>
                          <Textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="min-h-[400px] resize-none bg-secondary border-border text-white"
                            placeholder="Add your research notes here..."
                          />
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="report" className="mt-0">
                      <Card className="border-none shadow-sm overflow-hidden">
                        <CardContent className="p-0">
                          <div className="bg-muted/50 p-4 border-b flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <Eye className="h-5 w-5 text-muted-foreground" />
                              <h2 className="font-medium text-white">Report Preview</h2>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">
                                <Download className="mr-2 h-4 w-4" />
                                Download PDF
                              </Button>
                              <Button
                                size="sm"
                                onClick={handleShareLink}
                                className="bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700"
                              >
                                <Share2 className="mr-2 h-4 w-4" />
                                Share Link
                              </Button>
                            </div>
                          </div>
                          <div className="p-8 bg-background min-h-[600px]">
                            <div className="max-w-3xl mx-auto">
                              <h1 className="text-3xl font-bold mb-6 text-white">
                                {project.title || "Untitled Project"}
                              </h1>

                              <h2 className="text-xl font-semibold mt-8 mb-4 text-white">Summary</h2>
                              {project.aiSummary ? (
                                <div className="prose prose-invert max-w-none mb-8">
                                  {project.aiSummary.split("\n\n").map((paragraph, i) => (
                                    <p key={i} className="mb-4 text-white">
                                      {paragraph}
                                    </p>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-muted-foreground mb-8">No summary available.</p>
                              )}

                              <h2 className="text-xl font-semibold mt-8 mb-4 text-white">Molecules</h2>
                              {project.molecules && project.molecules.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                                  {project.molecules.map((molecule) => (
                                    <div key={molecule} className="border border-border rounded-lg p-4">
                                      <h3 className="font-medium mb-2 text-white">PDB ID: {molecule}</h3>
                                      <div className="aspect-square bg-muted rounded-md flex items-center justify-center">
                                        <Dna className="h-12 w-12 text-muted-foreground" />
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-muted-foreground mb-8">No molecules available.</p>
                              )}

                              <h2 className="text-xl font-semibold mt-8 mb-4 text-white">Notes</h2>
                              {notes ? (
                                <div className="prose prose-invert max-w-none">
                                  {notes.split("\n\n").map((paragraph, i) => (
                                    <p key={i} className="mb-4 text-white">
                                      {paragraph}
                                    </p>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-muted-foreground mb-8">No notes available.</p>
                              )}

                              <h2 className="text-xl font-semibold mt-8 mb-4 text-white">Research Links</h2>
                              {project.researchLinks && project.researchLinks.length > 0 ? (
                                <ul className="space-y-2 mb-8">
                                  {project.researchLinks.map((link, i) => (
                                    <li key={i}>
                                      <a href={link} className="text-primary hover:underline">
                                        {link}
                                      </a>
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="text-muted-foreground mb-8">No research links available.</p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </motion.div>
                </AnimatePresence>
              </Tabs>
            </div>

            {/* AI Chat Sidebar */}
            <AnimatePresence>
              {isChatOpen && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "100%" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.3 }}
                  className="lg:max-w-xs w-full"
                >
                  <Card className="border-none shadow-sm h-full">
                    <div className="flex flex-col h-[600px]">
                      <div className="flex items-center justify-between p-4 border-b border-border">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-r from-teal-500 to-blue-600 flex items-center justify-center">
                            <Sparkles className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <h3 className="font-medium text-white">MOLMIND AI</h3>
                            <p className="text-xs text-muted-foreground">Ask about your research</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => setIsChatOpen(false)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {chatMessages.length === 0 ? (
                          <div className="h-full flex flex-col items-center justify-center text-center p-4">
                            <Sparkles className="h-8 w-8 text-primary/40 mb-2" />
                            <h3 className="font-medium mb-1 text-white">Ask me anything</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                              I can help analyze your molecules and research data
                            </p>
                            <div className="grid grid-cols-1 gap-2 w-full">
                              {[
                                "Explain the structure of 1BNA",
                                "Compare binding sites in these molecules",
                                "Suggest potential drug targets",
                              ].map((suggestion, i) => (
                                <Button
                                  key={i}
                                  variant="outline"
                                  size="sm"
                                  className="justify-start"
                                  onClick={() => {
                                    setChatMessage(suggestion)
                                    handleSendMessage()
                                  }}
                                >
                                  {suggestion}
                                </Button>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <>
                            {chatMessages.map((msg, i) => (
                              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                                <div
                                  className={`max-w-[80%] rounded-lg p-3 ${
                                    msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                                  }`}
                                >
                                  <p className="text-sm">{msg.content}</p>
                                  {msg.role === "assistant" && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="mt-2 h-7 text-xs"
                                      onClick={() => addToNotes(msg.content)}
                                    >
                                      Add to Notes
                                    </Button>
                                  )}
                                </div>
                              </div>
                            ))}
                            {isTyping && (
                              <div className="flex justify-start">
                                <div className="max-w-[80%] rounded-lg p-3 bg-muted">
                                  <div className="flex space-x-2">
                                    <div className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:-0.3s]"></div>
                                    <div className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:-0.15s]"></div>
                                    <div className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce"></div>
                                  </div>
                                </div>
                              </div>
                            )}
                            <div ref={chatEndRef} />
                          </>
                        )}
                      </div>

                      <div className="p-4 border-t border-border">
                        <form
                          onSubmit={(e) => {
                            e.preventDefault()
                            handleSendMessage()
                          }}
                          className="flex gap-2"
                        >
                          <Input
                            placeholder="Ask about your research..."
                            value={chatMessage}
                            onChange={(e) => setChatMessage(e.target.value)}
                            className="bg-secondary border-border"
                          />
                          <Button
                            type="submit"
                            size="icon"
                            disabled={!chatMessage.trim() || isTyping}
                            className="bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700"
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        </form>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
