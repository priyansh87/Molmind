import express from 'express';
import {
  createProject,
  getAllProjects,
  getPublicProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addResearchLink,
  removeResearchLink,
  addMolecule,
  removeMolecule,
  updateNotes,
  toggleVisibility
} from '../controllers/project.controllers.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Base project routes
router.post('/', protect, createProject);
router.get('/', protect, getAllProjects);
router.get('/public', getPublicProjects); // No authentication needed for public projects
router.get('/:id', protect, getProjectById);
router.put('/:id', protect, updateProject);
router.delete('/:id', protect, deleteProject);

// Research links routes
router.post('/:id/research-links', protect, addResearchLink);
router.delete('/:id/research-links/:linkIndex', protect, removeResearchLink);

// Molecules routes
router.post('/:id/molecules', protect, addMolecule);
router.delete('/:id/molecules/:moleculeIndex', protect, removeMolecule);

// Notes route
router.put('/:id/notes', protect, updateNotes);

// Visibility route
router.put('/:id/visibility', protect, toggleVisibility);

export default router;