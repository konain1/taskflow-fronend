import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './ProjectScreen.css';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import AddMember from '../components/AddMember';
import CreateTask from '../components/CreateTask';
import TaskItem from '../components/TaskItem';
import EditProject from '../components/EditProject';

const ProjectScreen = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [user, setUser] = useState('');
    const [token, setToken] = useState('');
    const [tasks, setTasks] = useState([]);
    const [showCreateTask, setShowCreateTask] = useState(false);
    const [showEditProject, setShowEditProject] = useState(false);
    
    // Hold project in state to reactively render updates (like newly added members)
    const [currentProject, setCurrentProject] = useState(location.state?.project);

    const handleBack = () => {
        navigate('/dashboard');
    };

    const fetchProjectTasks = async () => {
        const localtoken = localStorage.getItem('token');
        if (!localtoken || !currentProject?._id) return;
        try {
            const response = await axios.get(`https://taskflow-backend-8yfj.onrender.com/taskflow/api/v1/projects/${currentProject._id}/tasks`, {
                headers: {
                    Authorization: `Bearer ${localtoken}`
                }
            });
            if (response.data?.data?.tasks) {
                setTasks(response.data.data.tasks);
            }
        } catch (error) {
            console.error("Failed to fetch project tasks:", error);
        }
    };

    if (!currentProject) {
        return (
            <div className="project-screen-container">
                <button className="btn-back" onClick={handleBack}>
                    ← Back to Dashboard
                </button>
                <div style={{ textAlign: "center", color: "#94a3b8", padding: "40px 0" }}>
                    <h3>No project selected</h3>
                    <p style={{ marginTop: "8px" }}>Please go back and select a project from your dashboard.</p>
                </div>
            </div>
        );
    }

    const isOwner = user && currentProject && (
        (currentProject.owner?._id && currentProject.owner._id === user.id) ||
        (currentProject.owner === user.id)
    );

    const handleDeleteProject = async () => {
        const confirmDelete = window.confirm("Are you sure you want to delete this project? This action cannot be undone.");
        if (!confirmDelete) return;

        const localtoken = localStorage.getItem('token');
        try {
            await axios.delete(`https://taskflow-backend-8yfj.onrender.com/taskflow/api/v1/delete/${currentProject._id}`, {
                headers: {
                    Authorization: `Bearer ${localtoken}`
                }
            });
            alert("Project deleted successfully!");
            navigate('/dashboard');
        } catch (error) {
            console.error("Failed to delete project:", error.response?.data || error.message);
            alert(error.response?.data?.message || "Failed to delete project");
        }
    };

    // Get initials for avatar circles
    const getInitials = (name) => {
        if (!name) return "?";
        return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    };

    useEffect(() => {
        const localtoken = localStorage.getItem('token')
        if (localtoken) {
            try {
                setToken(localtoken)
                const decoded = jwtDecode(localtoken)
                setUser(decoded)
            } catch (error) {
                console.error(error)
                localStorage.removeItem('token')
            }
        }
    },[])

    useEffect(() => {
        if (currentProject?._id) {
            fetchProjectTasks();
        }
    }, [currentProject]);

    // Compile list of possible assignees (owner + members)
    const assignees = [];
    if (currentProject?.owner) {
        assignees.push(currentProject.owner);
    }
    if (currentProject?.members) {
        currentProject.members.forEach(member => {
            const memberId = member._id || member;
            const alreadyAdded = assignees.some(a => (a._id || a) === memberId);
            if (!alreadyAdded) {
                assignees.push(member);
            }
        });
    }

    return (
        <div className="project-screen-container">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <button className="btn-back" onClick={handleBack}>
                    ← Back to Dashboard
                </button>
                
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    <button className="btn-back" style={{ margin: 0 }} onClick={() => setShowCreateTask(!showCreateTask)}>
                        {showCreateTask ? 'Cancel Task' : '+ Create Task'}
                    </button>
                    {isOwner && (
                        <>
                            <button className="btn-back" style={{ margin: 0 }} onClick={() => setShowEditProject(!showEditProject)}>
                                {showEditProject ? 'Cancel Edit' : '✏️ Edit Project'}
                            </button>
                            <button className="btn-delete" style={{ margin: 0 }} onClick={handleDeleteProject}>
                                Delete Project
                            </button>
                            <AddMember 
                                projectId={currentProject._id} 
                                ownerId={currentProject.owner?._id || currentProject.owner} 
                                members={currentProject.members} 
                                onMemberAdded={(updatedProject) => setCurrentProject(updatedProject)} 
                            />
                        </>
                    )}
                </div>
            </div>

            {showCreateTask && (
                <CreateTask 
                    project={currentProject} 
                    onTaskCreated={(newTask) => {
                        setTasks((prev) => [...prev, newTask]);
                        setShowCreateTask(false);
                    }}
                    onCancel={() => setShowCreateTask(false)}
                />
            )}

            {showEditProject && (
                <EditProject 
                    project={currentProject} 
                    onProjectUpdated={(updatedProject) => {
                        setCurrentProject(updatedProject);
                        setShowEditProject(false);
                    }}
                    onCancel={() => setShowEditProject(false)}
                />
            )}
          

            <div className="project-detail-header">
                <h2 className="project-detail-title">{currentProject.title}</h2>
                <div className="project-meta-info">
                    <span><strong>Created:</strong> {currentProject.createdAt ? new Date(currentProject.createdAt).toLocaleDateString() : 'Just now'}</span>
                </div>
            </div>

            <div className="project-detail-desc">
                <h4 className="project-section-title">Description</h4>
                <p>{currentProject.description || "No description available for this project."}</p>
            </div>

            {currentProject.owner && (
                <div>
                    <h4 className="project-section-title">Owner</h4>
                    <div className="user-card">
                        <div className="user-avatar">
                            {getInitials(currentProject.owner.name || currentProject.owner.email)}
                        </div>
                        <div className="user-details">
                            <span className="user-name">{currentProject.owner.name || "Owner"}</span>
                            <span className="user-email">{currentProject.owner.email}</span>
                        </div>
                    </div>
                </div>
            )}

            <div>
                <h4 className="project-section-title">Members</h4>
                {currentProject.members && currentProject.members.length > 0 ? (
                    <div className="members-list">
                        {currentProject.members.map((member, index) => (
                            <div className="user-card" key={member._id || index}>
                                <div className="user-avatar" style={{ background: "linear-gradient(135deg, #10b981, #34d399)" }}>
                                    {getInitials(member.name || member.email)}
                                </div>
                                <div className="user-details">
                                    <span className="user-name">{member.name || "Member"}</span>
                                    <span className="user-email">{member.email}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p style={{ color: "#64748b", fontSize: "0.9rem" }}>No other members in this project.</p>
                )}
            </div>

            <div className="tasks-section">
                <h4 className="project-section-title">Tasks</h4>
                {tasks.length > 0 ? (
                    <div className="tasks-list">
                        {tasks.map((task, index) => (
                            <TaskItem 
                                key={task._id || index}
                                task={task}
                                isProjectOwner={isOwner}
                                assignees={assignees}
                                onTaskUpdated={(updatedTask) => {
                                    setTasks(prev => prev.map(t => t._id === updatedTask._id ? updatedTask : t));
                                }}
                                onTaskDeleted={(deletedTaskId) => {
                                    setTasks(prev => prev.filter(t => t._id !== deletedTaskId));
                                }}
                            />
                        ))}
                    </div>
                ) : (
                    <p style={{ color: "#64748b", fontSize: "0.9rem" }}>No tasks added to this project yet.</p>
                )}
            </div>
        </div>
    );
};

export default ProjectScreen;