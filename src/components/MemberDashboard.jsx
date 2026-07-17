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
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [inputField, setInputField] = useState(false);

    const handleProject = async () => {
        const localtoken = localStorage.getItem('token');
        if (!localtoken) {
            console.error("No token found");
            return;
        }

        try {
            const response = await axios.get("https://taskflow-backend-8yfj.onrender.com/taskflow/api/v1/get-project", {
                headers: {
                    Authorization: `Bearer ${localtoken}`
                }
            });

            console.log("projects ", response.data);
            if (response.data?.data) {
                setData(response.data.data);
            }
            setGetProject(!getProject);
        } catch (error) {
            console.error("Failed to fetch projects:", error);
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

            // Reset local form states
            setTitle('');
            setDescription('');
            setInputField(false);

            // Append the new project to the list state so it renders instantly
            if (response.data?.data) {
                setData((prevData) => [...prevData, response.data.data]);
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
                {getProject && <GetProjects data={data} />}
            </div>
        </div>
    );
};

export default MemberDashboard;
