
import Switch from "./components/Switch";
import DashboardScreen from "./Screens/DashboardScreen";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProjectScreen from './Screens/ProjectScreen'
const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Switch />} />
        <Route path="/dashboard" element={<DashboardScreen />} />
        <Route path="/projectScreen" element={<ProjectScreen/>} />

      </Routes>
    </BrowserRouter>
  );
};

export default App;