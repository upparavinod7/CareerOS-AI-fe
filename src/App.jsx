import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import JobsPage from "./pages/JobsPage";
import ApplicationsPage from "./pages/ApplicationsPage";
import FitAnalyzerPage from "./pages/FitAnalyzerPage";
import CareerPredictorPage from "./pages/CareerPredictorPage";
import RoadmapPage from "./pages/RoadmapPage";
import ResumeOptimizerPage from "./pages/ResumeOptimizerPage";
import CoverLetterPage from "./pages/CoverLetterPage";
import InterviewPrepPage from "./pages/InterviewPrepPage";
import ProfilePage from "./pages/ProfilePage";
import AutoApplyPage from "./pages/AutoApplyPage";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/auto-apply" element={<AutoApplyPage />} />
          <Route path="/jobs" element={<JobsPage />} />
          <Route path="/applications" element={<ApplicationsPage />} />
          <Route path="/fit" element={<FitAnalyzerPage />} />
          <Route path="/career-predict" element={<CareerPredictorPage />} />
          <Route path="/roadmap" element={<RoadmapPage />} />
          <Route path="/resume" element={<ResumeOptimizerPage />} />
          <Route path="/cover-letter" element={<CoverLetterPage />} />
          <Route path="/interview" element={<InterviewPrepPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Route>
    </Routes>
  );
}
