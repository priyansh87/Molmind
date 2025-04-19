"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Eye, ExternalLink, Share2, Dna, Clock } from "lucide-react"

interface ProjectCardProps {
  project: {
    _id: string
    title: string
    moleculeCount: number
    lastEdited: string
    description: string
    isPublic: boolean
  }
  isHovered: boolean
}


export default function ProjectCard({ project, isHovered }: ProjectCardProps) {
  return (
    <Card className="overflow-hidden h-full transition-all duration-300 hover:shadow-md dark:hover:shadow-primary/5 group">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-lg line-clamp-1">{project.title}</h3>
              {project.isPublic && (
                <Badge variant="secondary" className="text-xs font-normal">
                  Public
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground text-sm line-clamp-2 mb-4">{project.description}</p>
          </div>
        </div>

        <div className="flex items-center text-sm text-muted-foreground mt-2 gap-4">
          <div className="flex items-center">
            <Dna className="h-4 w-4 mr-1.5" />
            <span>{project.moleculeCount} molecules</span>
          </div>
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1.5" />
            <span>{project.lastEdited}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 10 }}
          transition={{ duration: 0.2 }}
          className="flex gap-2 w-full"
        >
          <Button asChild variant="outline" size="sm" className="flex-1 text-muted-foreground">
            <Link href={`/project/${project._id}`}>
              <Eye className="mr-1.5 h-4 w-4" />
              Preview
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="flex-1 text-muted-foreground">
            <Link href={`/report/${project._id}`}>
              <Share2 className="mr-1.5 h-4 w-4" />
              Share
            </Link>
          </Button>
          <Button
            asChild
            size="sm"
            className="flex-1 bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700"
          >
            <Link href={`/project/${project._id}`}>
              <ExternalLink className="mr-1.5 h-4 w-4" />
              Open
            </Link>
          </Button>
        </motion.div>
      </CardFooter>
    </Card>
  )
}
