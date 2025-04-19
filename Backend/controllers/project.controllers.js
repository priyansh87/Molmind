import { Project } from '../models/project.model.js';
import { User } from '../models/user.model.js';
import mongoose from 'mongoose';

// Controller methods for Project model with User integration

/**
 * Create a new project for a user
 * @route POST /api/projects
 */
export const createProject = async (req, res) => {
  try {
    const { title, researchLinks, molecules, notes, isPublic , aiSummary } = req.body;
    const userId = req.user.userid; // From auth middleware

    // Validate required fields
    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    // Create new project
    const project = new Project({
      title,
      researchLinks: researchLinks || [],
      molecules: molecules || [],
      notes: notes || '',
      isPublic: isPublic !== undefined ? isPublic : false,
      aiSummary: aiSummary || ""
    });

    const savedProject = await project.save();

    // Add project to user's projects array
    await User.findByIdAndUpdate(
      userId,
      { $push: { projects: savedProject._id } },
      { new: true }
    );

    res.status(201).json(savedProject);
  } catch (error) {
    res.status(500).json({ message: 'Error creating project', error: error.message });
  }
};

/**
 * Get all projects for a user
 * @route GET /api/projects
 */
export const getAllProjects = async (req, res) => {
  try {
    const userId = req.user.userid; // From auth middleware
    const includePublic = req.query.includePublic === 'true';
    
    // Find the user to get their projects
    const user = await User.findById(userId).populate('projects');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get user's own projects
    let projects = user.projects || [];
    
    // Include public projects from other users if requested
    if (includePublic) {
      const publicProjects = await Project.find({ 
        isPublic: true,
        _id: { $nin: projects.map(p => p._id) } // Exclude user's own projects
      });
      projects = [...projects, ...publicProjects];
    }
    
    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching projects', error: error.message });
  }
};

/**
 * Get public projects
 * @route GET /api/projects/public
 */
export const getPublicProjects = async (req, res) => {
  try {
    const publicProjects = await Project.find({ isPublic: true });
    res.status(200).json(publicProjects);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching public projects', error: error.message });
  }
};

/**
 * Get project by ID
 * @route GET /api/projects/:id
 */
export const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userid; // From auth middleware
    
    if (!id) {
      return res.status(400).json({ message: 'Project ID is required' });
    }

    const project = await Project.findById(id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // Check if user has access to this project
    const user = await User.findById(userId);
    const hasAccess = user.projects.includes(project._id) || project.isPublic;
    
    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied to this project' });
    }
    
    res.status(200).json(project);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching project', error: error.message });
  }
};

/**
 * Update project by ID
 * @route PUT /api/projects/:id
 */
export const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userid; // From auth middleware
    const { title, researchLinks, molecules, notes, isPublic } = req.body;
    
    if (!id) {
      return res.status(400).json({ message: 'Project ID is required' });
    }

    // Find project first to check if it exists
    const project = await Project.findById(id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // Check if user owns this project
    const user = await User.findById(userId);
    const isOwner = user.projects.some(projectId => projectId.toString() === id);
    
    if (!isOwner) {
      return res.status(403).json({ message: 'You do not have permission to update this project' });
    }
    
    // Validate required fields if they're being updated
    if (title === '') {
      return res.status(400).json({ message: 'Title cannot be empty' });
    }

    // Build update object with only defined fields
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (researchLinks !== undefined) updateData.researchLinks = researchLinks;
    if (molecules !== undefined) updateData.molecules = molecules;
    if (notes !== undefined) updateData.notes = notes;
    if (isPublic !== undefined) updateData.isPublic = isPublic;

    const updatedProject = await Project.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    res.status(200).json(updatedProject);
  } catch (error) {
    res.status(500).json({ message: 'Error updating project', error: error.message });
  }
};

/**
 * Delete project by ID
 * @route DELETE /api/projects/:id
 */
export const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userid; // From auth middleware
    
    if (!id) {
      return res.status(400).json({ message: 'Project ID is required' });
    }

    // Check if user owns this project
    const user = await User.findById(userId);
    const isOwner = user.projects.some(projectId => projectId.toString() === id);
    
    if (!isOwner) {
      return res.status(403).json({ message: 'You do not have permission to delete this project' });
    }

    // Delete the project
    const deletedProject = await Project.findByIdAndDelete(id);
    
    if (!deletedProject) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // Remove project from user's projects array
    await User.findByIdAndUpdate(
      userId,
      { $pull: { projects: id } }
    );
    
    res.status(200).json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting project', error: error.message });
  }
};

/**
 * Add a research link to a project
 * @route POST /api/projects/:id/research-links
 */
export const addResearchLink = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userid; // From auth middleware
    const { link } = req.body;
    
    if (!id) {
      return res.status(400).json({ message: 'Project ID is required' });
    }
    
    if (!link) {
      return res.status(400).json({ message: 'Research link is required' });
    }

    const project = await Project.findById(id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // Check if user owns this project
    const user = await User.findById(userId);
    const isOwner = user.projects.some(projectId => projectId.toString() === id);
    
    if (!isOwner) {
      return res.status(403).json({ message: 'You do not have permission to modify this project' });
    }
    
    project.researchLinks.push(link);
    const updatedProject = await project.save();
    
    res.status(200).json(updatedProject);
  } catch (error) {
    res.status(500).json({ message: 'Error adding research link', error: error.message });
  }
};

/**
 * Remove a research link from a project
 * @route DELETE /api/projects/:id/research-links/:linkIndex
 */
export const removeResearchLink = async (req, res) => {
  try {
    const { id, linkIndex } = req.params;
    const userId = req.user.userid; // From auth middleware
    
    if (!id) {
      return res.status(400).json({ message: 'Project ID is required' });
    }
    
    if (linkIndex === undefined) {
      return res.status(400).json({ message: 'Link index is required' });
    }

    const project = await Project.findById(id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // Check if user owns this project
    const user = await User.findById(userId);
    const isOwner = user.projects.some(projectId => projectId.toString() === id);
    
    if (!isOwner) {
      return res.status(403).json({ message: 'You do not have permission to modify this project' });
    }
    
    if (linkIndex < 0 || linkIndex >= project.researchLinks.length) {
      return res.status(400).json({ message: 'Invalid link index' });
    }
    
    project.researchLinks.splice(linkIndex, 1);
    const updatedProject = await project.save();
    
    res.status(200).json(updatedProject);
  } catch (error) {
    res.status(500).json({ message: 'Error removing research link', error: error.message });
  }
};

/**
 * Add a molecule to a project
 * @route POST /api/projects/:id/molecules
 */
export const addMolecule = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userid; // From auth middleware
    const { molecule } = req.body;
    
    if (!id) {
      return res.status(400).json({ message: 'Project ID is required' });
    }
    
    if (!molecule) {
      return res.status(400).json({ message: 'Molecule ID is required' });
    }

    const project = await Project.findById(id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // Check if user owns this project
    const user = await User.findById(userId);
    const isOwner = user.projects.some(projectId => projectId.toString() === id);
    
    if (!isOwner) {
      return res.status(403).json({ message: 'You do not have permission to modify this project' });
    }
    
    project.molecules.push(molecule);
    const updatedProject = await project.save();
    
    res.status(200).json(updatedProject);
  } catch (error) {
    res.status(500).json({ message: 'Error adding molecule', error: error.message });
  }
};

/**
 * Remove a molecule from a project
 * @route DELETE /api/projects/:id/molecules/:moleculeIndex
 */
export const removeMolecule = async (req, res) => {
  try {
    const { id, moleculeIndex } = req.params;
    const userId = req.user.userid; // From auth middleware
    
    if (!id) {
      return res.status(400).json({ message: 'Project ID is required' });
    }
    
    if (moleculeIndex === undefined) {
      return res.status(400).json({ message: 'Molecule index is required' });
    }

    const project = await Project.findById(id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // Check if user owns this project
    const user = await User.findById(userId);
    const isOwner = user.projects.some(projectId => projectId.toString() === id);
    
    if (!isOwner) {
      return res.status(403).json({ message: 'You do not have permission to modify this project' });
    }
    
    if (moleculeIndex < 0 || moleculeIndex >= project.molecules.length) {
      return res.status(400).json({ message: 'Invalid molecule index' });
    }
    
    project.molecules.splice(moleculeIndex, 1);
    const updatedProject = await project.save();
    
    res.status(200).json(updatedProject);
  } catch (error) {
    res.status(500).json({ message: 'Error removing molecule', error: error.message });
  }
};

/**
 * Update project notes
 * @route PUT /api/projects/:id/notes
 */
export const updateNotes = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userid; // From auth middleware
    const { notes } = req.body;
    
    if (!id) {
      return res.status(400).json({ message: 'Project ID is required' });
    }
    
    if (notes === undefined) {
      return res.status(400).json({ message: 'Notes content is required' });
    }

    const project = await Project.findById(id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // Check if user owns this project
    const user = await User.findById(userId);
    const isOwner = user.projects.some(projectId => projectId.toString() === id);
    
    if (!isOwner) {
      return res.status(403).json({ message: 'You do not have permission to modify this project' });
    }
    
    project.notes = notes;
    const updatedProject = await project.save();
    
    res.status(200).json(updatedProject);
  } catch (error) {
    res.status(500).json({ message: 'Error updating notes', error: error.message });
  }
};

/**
 * Toggle project visibility (public/private)
 * @route PUT /api/projects/:id/visibility
 */
export const toggleVisibility = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userid; // From auth middleware
    // const { isPublic } = req.body;
    
    if (!id) {
      return res.status(400).json({ message: 'Project ID is required' });
    }
    
    // if (isPublic === undefined) {
    //   return res.status(400).json({ message: 'Visibility status is required' });
    // }

    const project = await Project.findById(id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // Check if user owns this project
    const user = await User.findById(userId);
    const isOwner = user.projects.some(projectId => projectId.toString() === id);
    
    if (!isOwner) {
      return res.status(403).json({ message: 'You do not have permission to modify this project' });
    }
    let beforeToggle = project.isPublic
    project.isPublic = !beforeToggle;
    const updatedProject = await project.save();  
    
    res.status(200).json(updatedProject);
  } catch (error) {
    res.status(500).json({ message: 'Error updating visibility', error: error.message });
  }
};