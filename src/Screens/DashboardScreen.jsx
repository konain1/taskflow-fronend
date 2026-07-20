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

    const handleHealthCheck = async () => {
        try {
            const response = await axios.get("https://taskflow-backend-8yfj.onrender.com/taskflow/api/v1/health");
            alert(response.data.message || "Health status is good");
        } catch (error) {
            console.error("Health check error:", error);
            alert("Health check failed");
        }
    };

    if (!token) {
        return <div style={{ padding: "20px" }}>No token found. Please log in.</div>;
    }

    return (
        <div style={{ position: "relative", minHeight: "100vh", width: "100%", padding: "20px 40px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", margin: 0, color: "#fff" }}>
                    {user ? (user.role === 'member' ? "Member Dashboard" : "Admin Dashboard") : "Dashboard"}
                </h1>
                <div style={{ display: "flex", gap: "15px" }}>
                    <button 
                        onClick={handleHealthCheck}
                        style={{
                            background: "rgba(59, 130, 246, 0.08)",
                            border: "1px solid rgba(59, 130, 246, 0.2)",
                            color: "#3b82f6",
                            padding: "10px 20px",
                            borderRadius: "12px",
                            cursor: "pointer",
                            fontWeight: "600",
                            fontSize: "0.9rem",
                            transition: "all 0.25s ease"
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.background = "rgba(59, 130, 246, 0.15)";
                            e.target.style.borderColor = "rgba(59, 130, 246, 0.4)";
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.background = "rgba(59, 130, 246, 0.08)";
                            e.target.style.borderColor = "rgba(59, 130, 246, 0.2)";
                        }}
                    >
                        Health
                    </button>
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