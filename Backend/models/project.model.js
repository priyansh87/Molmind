import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    researchLinks: [
        {
            type: String,
            trim: true
        }
    ],
    molecules: [
        {
            type: String,
            trim: true // e.g., PDB IDs like "1HHO", "2F5N"
        }
    ],
    notes: {
        type: String,
        default: ""
    },
    isPublic: {
        type: Boolean,
        default: false
    },
    aiSummary :{
        type : String
    }
}, { timestamps: true });

export const Project = mongoose.model("Project", projectSchema);
