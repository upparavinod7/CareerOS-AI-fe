import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import JobsPage from "./pages/JobsPage";
import FitAnalyzerPage from "./pages/FitAnalyzerPage";
import RoadmapPage from "./pages/RoadmapPage";
import ResumeOptimizerPage from "./pages/ResumeOptimizerPage";
import ApplicationsPage from "./pages/ApplicationsPage";
import InterviewPrepPage from "./pages/InterviewPrepPage";
import ProfilePage from "./pages/ProfilePage";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/jobs" element={<JobsPage />} />
          <Route path="/fit" element={<FitAnalyzerPage />} />
          <Route path="/roadmap" element={<RoadmapPage />} />
          <Route path="/resume" element={<ResumeOptimizerPage />} />
          <Route path="/interview" element={<InterviewPrepPage />} />
          <Route path="/applications" element={<ApplicationsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Route>
    </Routes>
  );
}
