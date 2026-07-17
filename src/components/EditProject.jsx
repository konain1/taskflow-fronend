import React, { useState } from 'react';
import axios from 'axios';
import InputField from './InputField';
import './EditProject.css';

const EditProject = ({ project, onProjectUpdated, onCancel }) => {
    const [title, setTitle] = useState(project.title || '');
    const [description, setDescription] = useState(project.description || '');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const localtoken = localStorage.getItem('token');

        if (!title.trim() || !description.trim()) {
            alert("Title and description are required!");
            return;
        }

        try {
            const response = await axios.put(
                `https://taskflow-backend-8yfj.onrender.com/taskflow/api/v1/project/${project._id}`,
                { title, description },
                {
                    headers: {
                        Authorization: `Bearer ${localtoken}`
                    }
                }
            );

            console.log("Project updated successfully:", response.data);
            alert("Project updated successfully!");

            if (response.data?.data && onProjectUpdated) {
                onProjectUpdated(response.data.data);
            }
        } catch (error) {
            console.error("Failed to update project:", error.response?.data || error.message);
            alert(error.response?.data?.message || "Failed to update project");
        }
    };

    return (
        <div className="edit-project-panel">
            <h4 className="edit-project-title">Edit Project Details</h4>
            <form onSubmit={handleSubmit} className="edit-project-form">
                <InputField 
                    name="title" 
                    type="text" 
                    value={title} 
                    onChange={setTitle} 
                />
                <InputField 
                    name="description" 
                    type="text" 
                    value={description} 
                    onChange={setDescription} 
                />

                <div className="edit-project-actions">
                    {onCancel && (
                        <button type="button" className="btn-back" style={{ margin: 0 }} onClick={onCancel}>
                            Cancel
                        </button>
                    )}
                    <button type="submit" className="btn-back" style={{ margin: 0, background: "linear-gradient(135deg, #6366f1, #a78bfa)", color: "#fff", borderColor: "transparent" }}>
                        Save Changes
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditProject;
