import React, { useState } from 'react';
import axios from 'axios';
import './TaskItem.css';

const TaskItem = ({ task, isProjectOwner, assignees, onTaskUpdated, onTaskDeleted }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editStatus, setEditStatus] = useState(task.status || 'todo');
    const [editPriority, setEditPriority] = useState(task.priority || 'medium');
    const [editAssignee, setEditAssignee] = useState(task.assignee?._id || task.assignee || '');

    const handleUpdate = async () => {
        const localtoken = localStorage.getItem('token');
        try {
            const response = await axios.put(
                `https://taskflow-backend-8yfj.onrender.com/taskflow/api/v1/tasks/${task._id}`,
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

            if (response.data?.data && onTaskUpdated) {
                onTaskUpdated(response.data.data);
            }
            setIsEditing(false);
        } catch (error) {
            console.error("Failed to update task:", error.response?.data || error.message);
            alert(error.response?.data?.message || "Failed to update task");
        }
    };

    const handleDelete = async () => {
        const confirmDelete = window.confirm("Are you sure you want to delete this task?");
        if (!confirmDelete) return;

        const localtoken = localStorage.getItem('token');
        try {
            await axios.delete(
                `https://taskflow-backend-8yfj.onrender.com/taskflow/api/v1/tasks/${task._id}`,
                {
                    headers: {
                        Authorization: `Bearer ${localtoken}`
                    }
                }
            );

            console.log("Task deleted successfully");
            alert("Task deleted successfully!");

            if (onTaskDeleted) {
                onTaskDeleted(task._id);
            }
        } catch (error) {
            console.error("Failed to delete task:", error.response?.data || error.message);
            alert(error.response?.data?.message || "Failed to delete task");
        }
    };

    const getInitials = (name) => {
        if (!name) return "?";
        return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    };

    if (isEditing) {
        return (
            <div className="task-card" style={{ borderStyle: "dashed", borderColor: "#6366f1" }}>
                <div className="task-info" style={{ gap: '12px' }}>
                    <span className="task-card-title">{task.title} (Editing)</span>
                    
                    <div className="form-grid" style={{ width: '100%', gap: '10px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}>
                        <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
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

                        <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
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

                        <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
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
                        <button className="btn-back" style={{ margin: 0, padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => setIsEditing(false)}>
                            Cancel
                        </button>
                        <button className="btn-back" style={{ margin: 0, padding: '6px 12px', fontSize: '0.8rem', background: 'linear-gradient(135deg, #10b981, #34d399)', color: '#fff', borderColor: 'transparent' }} onClick={handleUpdate}>
                            Save
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="task-card">
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

            <div className="task-actions">
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
                        <span style={{ fontSize: "0.8rem", color: "#64748b", whiteSpace: "nowrap" }}>Unassigned</span>
                    )}
                </div>
                
                <div style={{ display: "flex", gap: "8px" }}>
                    <button 
                        className="btn-back" 
                        style={{ margin: 0, padding: '6px 12px', fontSize: '0.8rem' }}
                        onClick={() => {
                            setIsEditing(true);
                            setEditStatus(task.status || 'todo');
                            setEditPriority(task.priority || 'medium');
                            setEditAssignee(task.assignee?._id || task.assignee || '');
                        }}
                    >
                        Edit
                    </button>
                    {isProjectOwner && (
                        <button 
                            className="btn-delete" 
                            style={{ margin: 0, padding: '6px 12px', fontSize: '0.8rem' }}
                            onClick={handleDelete}
                        >
                            Delete
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TaskItem;
