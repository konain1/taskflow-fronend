import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './ProjectScreen.css';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import AddMember from '../components/AddMember';
import CreateTask from '../components/CreateTask';

const ProjectScreen = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [user, setUser] = useState('');
    const [token, setToken] = useState('');
    const [tasks, setTasks] = useState([]);
    const [showCreateTask, setShowCreateTask] = useState(false);
    
    // States for task editing
    const [editingTaskId, setEditingTaskId] = useState(null);
    const [editStatus, setEditStatus] = useState('todo');
    const [editPriority, setEditPriority] = useState('medium');
    const [editAssignee, setEditAssignee] = useState('');

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

    const handleUpdateTask = async (taskId) => {
        const localtoken = localStorage.getItem('token');
        try {
            const response = await axios.put(
                `https://taskflow-backend-8yfj.onrender.com/taskflow/api/v1/tasks/${taskId}`,
                {
                    status: editStatus,
                    priority: editPriority,
                    assignee: editAssignee || undefined
                },
                {
                    headers: {
                        Authorization: `Bearer ${localtoken}`
                    }
                }
            );

            console.log("Task updated successfully:", response.data);
            alert("Task updated successfully!");

            // Update local tasks list with the returned populated task details
            if (response.data?.data) {
                setTasks(prev => prev.map(t => t._id === taskId ? response.data.data : t));
            }
            setEditingTaskId(null);
        } catch (error) {
            console.error("Failed to update task:", error.response?.data || error.message);
            alert(error.response?.data?.message || "Failed to update task");
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
                            editingTaskId === task._id ? (
                                <div className="task-card" key={task._id || index} style={{ borderStyle: "dashed", borderColor: "#6366f1" }}>
                                    <div className="task-info" style={{ width: '100%', gap: '12px' }}>
                                        <span className="task-card-title">{task.title} (Editing)</span>
                                        
                                        <div className="form-grid" style={{ width: '100%', gap: '10px' }}>
                                            <div className="form-group">
                                                <label style={{ fontSize: "0.8rem", color: "#94a3b8" }}>Status</label>
                                                <select 
                                                    className="task-input task-select"
                                                    value={editStatus}
                                                    onChange={(e) => setEditStatus(e.target.value)}
                                                >
                                                    <option value="todo">To Do</option>
                                                    <option value="in-progress">In Progress</option>
                                                    <option value="done">Done</option>
                                                </select>
                                            </div>

                                            <div className="form-group">
                                                <label style={{ fontSize: "0.8rem", color: "#94a3b8" }}>Priority</label>
                                                <select 
                                                    className="task-input task-select"
                                                    value={editPriority}
                                                    onChange={(e) => setEditPriority(e.target.value)}
                                                >
                                                    <option value="low">Low</option>
                                                    <option value="medium">Medium</option>
                                                    <option value="high">High</option>
                                                </select>
                                            </div>

                                            <div className="form-group">
                                                <label style={{ fontSize: "0.8rem", color: "#94a3b8" }}>Assignee</label>
                                                <select 
                                                    className="task-input task-select"
                                                    value={editAssignee}
                                                    onChange={(e) => setEditAssignee(e.target.value)}
                                                >
                                                    <option value="">Unassigned</option>
                                                    {assignees.map(user => {
                                                        const id = user._id || user;
                                                        const name = user.name || user.email || `User (${id})`;
                                                        return (
                                                            <option key={id} value={id}>
                                                                {name}
                                                            </option>
                                                        );
                                                    })}
                                                </select>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '10px' }}>
                                            <button className="btn-back" style={{ margin: 0, padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => setEditingTaskId(null)}>
                                                Cancel
                                            </button>
                                            <button className="btn-back" style={{ margin: 0, padding: '6px 12px', fontSize: '0.8rem', background: 'linear-gradient(135deg, #10b981, #34d399)', color: '#fff', borderColor: 'transparent' }} onClick={() => handleUpdateTask(task._id)}>
                                                Save
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="task-card" key={task._id || index}>
                                    <div className="task-info">
                                        <span className="task-card-title">{task.title}</span>
                                        {task.description && (
                                            <span className="task-card-desc">{task.description}</span>
                                        )}
                                        <div className="task-badges">
                                            <span className={`badge badge-${task.status}`}>
                                                {task.status}
                                            </span>
                                            {task.priority && (
                                                <span className={`badge badge-${task.priority}`}>
                                                    {task.priority}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                        <div className="task-assignee">
                                            {task.assignee ? (
                                                <>
                                                    <div className="task-assignee-avatar">
                                                        {getInitials(task.assignee.name || task.assignee.email)}
                                                    </div>
                                                    <span className="task-assignee-name">
                                                        {task.assignee.name || task.assignee.email}
                                                    </span>
                                                </>
                                            ) : (
                                                <span style={{ fontSize: "0.8rem", color: "#64748b" }}>Unassigned</span>
                                            )}
                                        </div>
                                        <button 
                                            className="btn-back" 
                                            style={{ margin: 0, padding: '6px 12px', fontSize: '0.8rem' }}
                                            onClick={() => {
                                                setEditingTaskId(task._id);
                                                setEditStatus(task.status || 'todo');
                                                setEditPriority(task.priority || 'medium');
                                                setEditAssignee(task.assignee?._id || task.assignee || '');
                                            }}
                                        >
                                            Edit
                                        </button>
                                    </div>
                                </div>
                            )
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