import React, { useEffect, useState } from 'react';
import GetProjects from './GetProjects';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import InputField from './InputField';
import './MemberDashboard.css';

const MemberDashboard = () => {
    const [token, setToken] = useState(null);
    const [user, setUser] = useState(null);
    const [data, setData] = useState([]);
    const [getProject, setGetProject] = useState(false);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [inputField, setInputField] = useState(false);

    const fetchProjects = async () => {
        const localtoken = localStorage.getItem('token');
        if (!localtoken) {
            console.error("No token found");
            return;
        }

        try {
            const response = await axios.get(`https://taskflow-backend-8yfj.onrender.com/taskflow/api/v1/get-project?page=${page}&limit=10&search=${search}`, {
                headers: {
                    Authorization: `Bearer ${localtoken}`
                }
            });

            console.log("projects ", response.data);
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
            console.error("Failed to fetch projects:", error);
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

            // Reset local form states
            setTitle('');
            setDescription('');
            setInputField(false);

            // Append the new project to the list state so it renders instantly
            if (response.data?.data) {
                fetchProjects();
                setGetProject(true);
            }
        } catch (error) {
            console.error("Failed to create Project:", error.response?.data || error.message);
            alert(error.response?.data?.message || "Failed to create Project");
        }
    };

    useEffect(() => {
        const localtoken = localStorage.getItem('token');
        if (localtoken) {
            try {
                const decoded = jwtDecode(localtoken);
                setToken(localtoken);
                setUser(decoded);
                console.log("Decoded user:", decoded);
            } catch (error) {
                console.error("Error decoding token:", error);
                localStorage.removeItem('token'); 
            }
        }
    }, []);

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h3 className="dashboard-title">Member Dashboard</h3>
                <p className="dashboard-welcome">
                    Welcome back, {user ? user.email : 'Member'}! Track your progress and manage assigned projects.
                </p>
            </div>

            <div className="dashboard-actions">
                <button 
                    className={`btn-dashboard ${getProject ? 'btn-dashboard-primary' : 'btn-dashboard-secondary'}`} 
                    onClick={handleProject}
                >
                    {getProject ? 'Hide Projects' : 'Projects'}
                </button>
                <button 
                    className={`btn-dashboard ${inputField ? 'btn-dashboard-primary' : 'btn-dashboard-secondary'}`} 
                    onClick={() => setInputField(!inputField)}
                >
                    {inputField ? 'Cancel Form' : 'New Project'}
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
                            <button className="btn-dashboard btn-dashboard-primary" onClick={handleCreateProject}>
                                Create Project
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div>
                {getProject && (
                    <div style={{ marginTop: "20px" }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
                            <input 
                                type="text" 
                                placeholder="Search assigned projects..." 
                                value={search}
                                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                                style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', width: '100%', maxWidth: '300px', outline: 'none' }}
                            />
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                <button 
                                    className="btn-dashboard btn-dashboard-secondary" 
                                    style={{ margin: 0 }}
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page <= 1}
                                >
                                    Prev
                                </button>
                                <span style={{ fontWeight: '500', color: '#475569' }}>Page {page} of {totalPages}</span>
                                <button 
                                    className="btn-dashboard btn-dashboard-secondary" 
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
        </div>
    );
};

export default MemberDashboard;
