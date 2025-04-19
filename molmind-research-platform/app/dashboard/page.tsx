"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { PlusCircle, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import ProjectCard from "@/components/project-card";
import Navbar from "@/components/navbar";
import CreateProjectModal from "@/components/create-project-modal";

// Mock data for projects
const mockProjects = [
  {
    id: "1",
    title: "DNA Double Helix Structure Analysis",
    moleculeCount: 3,
    lastEdited: "2 hours ago",
    description:
      "Investigating the structural properties of DNA double helix with various binding proteins.",
    isPublic: true,
  },
  {
    id: "2",
    title: "Protein Kinase Inhibitors",
    moleculeCount: 5,
    lastEdited: "Yesterday",
    description:
      "Screening potential inhibitors for protein kinase C with applications in cancer therapy.",
    isPublic: false,
  },
  {
    id: "3",
    title: "CRISPR-Cas9 Binding Mechanisms",
    moleculeCount: 2,
    lastEdited: "3 days ago",
    description:
      "Analyzing the binding mechanisms of CRISPR-Cas9 to target DNA sequences.",
    isPublic: true,
  },
  {
    id: "4",
    title: "Antibody-Antigen Interactions",
    moleculeCount: 7,
    lastEdited: "1 week ago",
    description:
      "Studying the structural basis of antibody-antigen interactions in immune responses.",
    isPublic: false,
  },
  {
    id: "5",
    title: "COVID-19 Spike Protein Analysis",
    moleculeCount: 4,
    lastEdited: "2 weeks ago",
    description:
      "Structural analysis of SARS-CoV-2 spike protein and potential binding sites for therapeutic agents.",
    isPublic: true,
  },
];

export default function Dashboard() {
  const [hoveredProject, setHoveredProject] = useState<Number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const fetchProjects = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      console.error("No auth token found");
      return;
    }

    try {
      const res = await fetch("http://localhost:3001/projects/", {
        method: "GET",
        headers: {
          Authorization: `bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch projects");

      const data = await res.json();
      console.log(data);
      setProjects(data);
    } catch (err) {
      console.error("Error fetching projects:", err);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const filteredProjects = projects.filter(
    (project) =>
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.notes?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold">Your Projects</h1>
              <p className="text-muted-foreground">
                Manage your molecular research projects
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700"
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                New Project
              </Button>
            </div>
          </div>

          {filteredProjects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Search className="h-10 w-10 text-primary/40" />
              </div>
              <h3 className="text-xl font-medium mb-2">No projects found</h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                We couldn't find any projects matching your search. Try a
                different search term or create a new project.
              </p>
              <Button
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700"
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Create New Project
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {filteredProjects.map((project) => (
                  <motion.div
                    key={project._id}
                    onMouseEnter={() => setHoveredProject(project._id)}
                    onMouseLeave={() => setHoveredProject(null)}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ProjectCard
                      project={project}
                      isHovered={hoveredProject === project._id}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </main>

      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
}
