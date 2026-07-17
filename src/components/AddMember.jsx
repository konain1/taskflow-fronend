import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AddMember.css';

const AddMember = ({ projectId, ownerId, members, onMemberAdded }) => {
    const [allUsers, setAllUsers] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState('');
    const [showAddMember, setShowAddMember] = useState(false);

    useEffect(() => {
        const fetchAllUsers = async () => {
            const localtoken = localStorage.getItem('token');
            if (!localtoken) return;
            try {
                const response = await axios.get('https://taskflow-backend-8yfj.onrender.com/taskflow/api/v1/users', {
                    headers: {
                        Authorization: `Bearer ${localtoken}`
                    }
                });
                if (response.data?.data) {
                    setAllUsers(response.data.data);
                }
            } catch (error) {
                console.error('Failed to fetch users:', error);
            }
        };

        if (showAddMember) {
            fetchAllUsers();
        }
    }, [showAddMember]);

    const handleAddMemberSubmit = async () => {
        const localtoken = localStorage.getItem('token');
        if (!selectedUserId) {
            alert("Please select a user first!");
            return;
        }

        try {
            const response = await axios.post(
                `https://taskflow-backend-8yfj.onrender.com/taskflow/api/v1/project/${projectId}/add-member`,
                { memberId: selectedUserId },
                {
                    headers: {
                         Authorization: `Bearer ${localtoken}`
                    }
                }
            );

            console.log("Member added successfully:", response.data);
            alert("Member added successfully!");

            // Notify parent to update their state with the fresh project details
            if (response.data?.data && onMemberAdded) {
                onMemberAdded(response.data.data);
            }
            setSelectedUserId('');
            setShowAddMember(false);
        } catch (error) {
            console.error('Unable to add member:', error.response?.data || error.message);
            alert(error.response?.data?.message || 'Unable to add member');
        }
    };

    // Filter out users who are already owner or members of this project
    const nonMembers = allUsers.filter(u => 
        u._id !== ownerId && 
        !members?.some(member => member._id === u._id)
    );

    return (
        <div>
            <button className="btn-back" onClick={() => setShowAddMember(!showAddMember)}>
                {showAddMember ? 'Cancel' : '+ Add new Member'}
            </button>

            {showAddMember && (
                <div className="add-member-panel">
                    <select 
                        className="add-member-select"
                        value={selectedUserId} 
                        onChange={(e) => setSelectedUserId(e.target.value)}
                    >
                        <option value="">Select a user...</option>
                        {nonMembers.map(u => (
                            <option key={u._id} value={u._id}>
                                {u.name || u.email} ({u.email})
                            </option>
                        ))}
                    </select>
                    <button className="btn-back" style={{ margin: 0 }} onClick={handleAddMemberSubmit}>
                        Add
                    </button>
                </div>
            )}
        </div>
    );
};

export default AddMember;
