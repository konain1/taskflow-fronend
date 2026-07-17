import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AdminDashboard from '../components/AdminDashboard'
import MemberDashboard from '../components/MemberDashboard'

const DashboardScreen = () => {
    const [token, setToken] = useState(null);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        // 1. Fetch token using correct string key 'token'
        const localToken = localStorage.getItem('token');
        
        if (localToken) {
            setToken(localToken);
            try {
                // 2. Decode the JWT token to read payload fields (like email, role)
                const decoded = jwtDecode(localToken);
            
                setUser(decoded);
                console.log("Decoded user:", decoded);
            } catch (err) {
                console.error("Error decoding token:", err);
                localStorage.removeItem('token'); 
            }
        }
    }, []);

    const handleLogout = async () => {
        const localToken = localStorage.getItem('token');
        try {
            // Trigger backend logout (logs event or clear server session)
            await axios.post(
                "https://taskflow-backend-8yfj.onrender.com/taskflow/api/v1/logout",
                {},
                {
                    headers: {
                        Authorization: `Bearer ${localToken}`
                    }
                }
            );
        } catch (err) {
            console.error("Backend logout error:", err);
        } finally {
            // Clear local token and redirect to login
            localStorage.removeItem('token');
            navigate('/');
        }
    };

    if (!token) {
        return <div style={{ padding: "20px" }}>No token found. Please log in.</div>;
    }

    return (
        <div style={{ position: "relative", minHeight: "100vh", width: "100%", padding: "20px 40px" }}>
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "20px" }}>
                <button 
                    onClick={handleLogout} 
                    style={{
                        background: "rgba(239, 68, 68, 0.08)",
                        border: "1px solid rgba(239, 68, 68, 0.2)",
                        color: "#f87171",
                        padding: "10px 20px",
                        borderRadius: "12px",
                        cursor: "pointer",
                        fontWeight: "600",
                        fontSize: "0.9rem",
                        transition: "all 0.25s ease"
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.background = "rgba(239, 68, 68, 0.15)";
                        e.target.style.borderColor = "rgba(239, 68, 68, 0.4)";
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.background = "rgba(239, 68, 68, 0.08)";
                        e.target.style.borderColor = "rgba(239, 68, 68, 0.2)";
                    }}
                >
                    Logout
                </button>
            </div>

            {user ? (
                user.role === 'member' ? <MemberDashboard /> : <AdminDashboard />
            ) : (
                <p>Loading user data...</p>
            )}
        </div>
    );
};

export default DashboardScreen;