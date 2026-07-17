import { jwtDecode } from 'jwt-decode';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import GetProjects from './GetProjects';
import InputField from './InputField';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const [user, setUser] = useState('')
    const [token, setToken] = useState('')
    const [data, setData] = useState([]);
    const [getProject, setGetProject] = useState(false);
    
    // States for project creation form
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [inputField, setInputField] = useState(false);

    useEffect(() => {
        const localtoken = localStorage.getItem('token')

        if (localtoken) {
            try {
                const decoded = jwtDecode(localtoken)
                setToken(localtoken)
                setUser(decoded)
                console.log("Decoded user :",decoded)
            } catch (error) {
                 console.error("Error decoding token:", error);
                 localStorage.removeItem('token'); 
            }
        }
    }, [])

    const handleProject = async () => {
        const localtoken = localStorage.getItem('token');
        if (!localtoken) return;

        try {
            const response = await axios.get("https://taskflow-backend-8yfj.onrender.com/taskflow/api/v1/get-project", {
                headers: {
                    Authorization: `Bearer ${localtoken}`
                }
            });
            console.log("Admin projects fetched:", response.data);
            if (response.data?.data) {
                setData(response.data.data);
            }
            setGetProject(!getProject);
        } catch (error) {
            console.error("Failed to fetch admin projects:", error);
        }
    };

    const handleCreateProject = async () => {
        const localtoken = localStorage.getItem('token');
        if (!localtoken) {
            console.error('No token found');
            return;
        }

        if (!title.trim() || !description.trim()) {
            alert("Please fill in both title and description!");
            return;
        }

        try {
            const response = await axios.post(
                "https://taskflow-backend-8yfj.onrender.com/taskflow/api/v1/create",
                {
                    title,
                    description,
                },
                {
                    headers: {
                        Authorization: `Bearer ${localtoken}`
                    }
                }
            );

            console.log("Project created successfully:", response.data);
            alert("Project created successfully!");

            // Reset form states
            setTitle('');
            setDescription('');
            setInputField(false);

            // Dynamically append new project to projects list state to update dashboard instantly
            if (response.data?.data) {
                setData((prevData) => [...prevData, response.data.data]);
                setGetProject(true);
            }
        } catch (error) {
            console.error("Failed to create Project:", error.response?.data || error.message);
            alert(error.response?.data?.message || "Failed to create Project");
        }
    };

    return (
        <div className="admin-dashboard-container">
            <div className="admin-dashboard-header">
                <h2 className="admin-dashboard-title">Admin Control Panel</h2>
                <p className="admin-dashboard-welcome">
                    Welcome back, <strong>{user ? user.name || user.email : "Admin"}</strong>! Track your progress and manage system projects.
                </p>
            </div>

            <div className="admin-dashboard-actions">
                <button className="btn-admin btn-admin-primary" onClick={handleProject}>
                    {getProject ? "Hide Projects" : "Show Projects"}
                </button>
                <button className="btn-admin btn-admin-secondary" onClick={() => setInputField(!inputField)}>
                    {inputField ? "Cancel Form" : "New Project"}
                </button>
            </div>

            {inputField && (
                <div className="create-project-panel">
                    <h4>Create New Project</h4>
                    <div className="create-project-form">
                        <div className="form-row">
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
                        </div>
                        <div className="create-project-actions">
                            <button className="btn-admin btn-admin-primary" onClick={handleCreateProject}>
                                Create Project
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {getProject && (
                <div style={{ marginTop: "20px" }}>
                    <GetProjects data={data} />
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
