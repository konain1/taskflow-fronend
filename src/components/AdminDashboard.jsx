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
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    
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

    const fetchProjects = async () => {
        const localtoken = localStorage.getItem('token');
        if (!localtoken) return;

        try {
            const response = await axios.get(`https://taskflow-backend-8yfj.onrender.com/taskflow/api/v1/get-project?page=${page}&limit=10&search=${search}`, {
                headers: {
                    Authorization: `Bearer ${localtoken}`
                }
            });
            console.log("Admin projects fetched:", response.data);
            if (response.data?.data) {
                if (response.data.data.projects) {
                    // Paginated response
                    setData(response.data.data.projects);
                    setTotalPages(response.data.data.totalPages || 1);
                } else {
                    // Fallback for non-paginated response
                    const allData = response.data.data;
                    const filteredData = search 
                        ? allData.filter(p => p.title.toLowerCase().includes(search.toLowerCase()) || (p.description && p.description.toLowerCase().includes(search.toLowerCase())))
                        : allData;
                        
                    const limit = 10;
                    setTotalPages(Math.ceil(filteredData.length / limit) || 1);
                    const startIndex = (page - 1) * limit;
                    setData(filteredData.slice(startIndex, startIndex + limit));
                }
            }
        } catch (error) {
            console.error("Failed to fetch admin projects:", error);
        }
    };

    useEffect(() => {
        if (getProject) {
            const timeoutId = setTimeout(() => {
                fetchProjects();
            }, 300);
            return () => clearTimeout(timeoutId);
        }
    }, [getProject, page, search]);

    const handleProject = () => {
        setGetProject(!getProject);
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
                // To keep it simple, we re-fetch to apply pagination correctly
                fetchProjects();
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
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
                        <input 
                            type="text" 
                            placeholder="Search projects..." 
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                            style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', width: '100%', maxWidth: '300px', outline: 'none' }}
                        />
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <button 
                                className="btn-admin btn-admin-secondary" 
                                style={{ margin: 0 }}
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page <= 1}
                            >
                                Prev
                            </button>
                            <span style={{ fontWeight: '500', color: '#475569' }}>Page {page} of {totalPages}</span>
                            <button 
                                className="btn-admin btn-admin-secondary" 
                                style={{ margin: 0 }}
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page >= totalPages}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                    <GetProjects data={data} />
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
