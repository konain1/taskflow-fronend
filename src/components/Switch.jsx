import RegisterScreen from "../Screens/RegisterScreen";
import LoginScreen from "../Screens/LoginScreen";
import { useState } from "react";
import "./Switch.css";

const Switch = () => {
    const [isLogin, setIsLogin] = useState(true);

    return (
        <div className="switch-container">
            <div className="switch-wrapper">
                <div className="toggle-tabs">
                    <button 
                        className={`tab-btn ${isLogin ? 'active' : ''}`} 
                        onClick={() => setIsLogin(true)}
                    >
                        Login
                    </button>
                    <button 
                        className={`tab-btn ${!isLogin ? 'active' : ''}`} 
                        onClick={() => setIsLogin(false)}
                    >
                        Sign Up
                    </button>
                </div>
                
                <div className="form-content">
                    {isLogin ? <LoginScreen /> : <RegisterScreen />}
                </div>
            </div>
        </div>
    );
};

export default Switch;